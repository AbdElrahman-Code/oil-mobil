'use server'

import Anthropic from '@anthropic-ai/sdk'
import { z } from 'zod'
import type { Locale } from '@/i18n/routing'
import type { Product } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'
import { guard } from '@/lib/rate-limit'
import { mediaUrl } from '@/lib/utils'
import { getCurrentCustomer } from './auth'
import type { GarageCar } from './garage'

/**
 * "What should I buy for my car?" — the customer's registered car plus the
 * catalogue go to Claude, which picks the parts worth buying and explains why
 * in the customer's language. Only signed-in customers can ask, and the answer
 * is always limited to products that exist and fit.
 */

export type AdvisorPick = {
  productId: number
  slug: string
  name: string
  price: number
  image: string | null
  category: string | null
  reason: string
  priority: 'now' | 'soon' | 'nice'
  maxQuantity: number | null
}

export type AdvisorResult =
  | { ok: true; summary: string; picks: AdvisorPick[]; source: 'ai' | 'rules' }
  | { ok: false; error: 'auth' | 'noCar' | 'rateLimit' | 'empty' | 'failed' }

const answerSchema = z.object({
  summary: z.string(),
  picks: z.array(
    z.object({
      productId: z.number(),
      reason: z.string(),
      priority: z.enum(['now', 'soon', 'nice']),
    }),
  ),
})

const MODEL = 'claude-opus-5'

/** Hand-written JSON schema (the SDK's zod helper needs zod v4; the app is on v3). */
const answerFormat = {
  type: 'json_schema' as const,
  schema: {
    type: 'object',
    additionalProperties: false,
    required: ['summary', 'picks'],
    properties: {
      summary: { type: 'string' },
      picks: {
        type: 'array',
        items: {
          type: 'object',
          additionalProperties: false,
          required: ['productId', 'reason', 'priority'],
          properties: {
            productId: { type: 'integer' },
            reason: { type: 'string' },
            priority: { type: 'string', enum: ['now', 'soon', 'nice'] },
          },
        },
      },
    },
  },
}

const categoryName = (product: Product) =>
  typeof product.category === 'object' && product.category ? product.category.name : null

const toPick = (product: Product, reason: string, priority: AdvisorPick['priority']): AdvisorPick => ({
  productId: product.id,
  slug: product.slug ?? String(product.id),
  name: product.name,
  price: product.price ?? 0,
  image: mediaUrl(Array.isArray(product.images) ? product.images[0] : null, 'card'),
  category: categoryName(product),
  reason,
  priority,
  maxQuantity: product.allowBackorder ? null : (product.stockQuantity ?? 0),
})

/** Fitted parts first, then universal items — the pool the answer may choose from. */
const loadCandidates = async (locale: Locale, car: GarageCar) => {
  const payload = await getPayloadClient()
  const common = { collection: 'products' as const, locale, depth: 1, overrideAccess: true }

  const [fitted, universal, specs] = await Promise.all([
    payload.find({
      ...common,
      where: { and: [{ isPublished: { equals: true } }, { compatibleVehicles: { in: [car.modelId] } }] },
      limit: 40,
    }),
    payload.find({
      ...common,
      where: { and: [{ isPublished: { equals: true } }, { compatibleVehicles: { exists: false } }] },
      sort: '-isFeatured',
      limit: 40,
    }),
    payload.find({
      collection: 'oilSpecifications',
      locale,
      depth: 0,
      overrideAccess: true,
      where: { vehicleModel: { equals: car.modelId } },
      limit: 5,
    }),
  ])

  const seen = new Set<number>()
  const products = [...fitted.docs, ...universal.docs].filter((product) => {
    const outOfStock = (product.stockQuantity ?? 0) <= 0 && !product.allowBackorder
    if (seen.has(product.id) || outOfStock) return false
    seen.add(product.id)
    return true
  })
  const fittedIds = new Set(fitted.docs.map((product) => product.id))

  // Prefer the spec for this engine and year; fall back to any spec for the model.
  const spec =
    specs.docs.find(
      (item) =>
        (!item.engineCode || item.engineCode === car.engineCode) &&
        (!item.yearFrom || item.yearFrom <= car.year) &&
        (!item.yearTo || item.yearTo >= car.year),
    ) ?? specs.docs[0]

  return { products, fittedIds, spec }
}

/** No API key (or the call failed): still give a sensible, fitment-based answer. */
const ruleBased = (
  locale: Locale,
  products: Product[],
  fittedIds: Set<number>,
  spec: { recommendedViscosity?: string | null } | undefined,
): AdvisorResult => {
  const ar = locale === 'ar'
  const picks: AdvisorPick[] = []
  const usedTypes = new Set<string>()

  const ranked = [...products].sort((a, b) => {
    const fitScore = Number(fittedIds.has(b.id)) - Number(fittedIds.has(a.id))
    if (fitScore !== 0) return fitScore
    return Number(Boolean(b.isFeatured)) - Number(Boolean(a.isFeatured))
  })

  for (const product of ranked) {
    const type = product.productType ?? 'accessory'
    if (usedTypes.has(type) && picks.length >= 4) continue
    const fits = fittedIds.has(product.id)
    const viscosityMatch =
      type === 'oil' && spec?.recommendedViscosity && product.oilAttributes?.viscosity === spec.recommendedViscosity

    let reason: string
    let priority: AdvisorPick['priority'] = 'nice'
    if (viscosityMatch) {
      reason = ar
        ? `اللزوجة ${spec?.recommendedViscosity} هي المطلوبة لمحرك سيارتك.`
        : `${spec?.recommendedViscosity} is the viscosity your engine calls for.`
      priority = 'now'
    } else if (fits) {
      reason = ar ? 'مسجّل عندنا كقطعة مناسبة لموديل سيارتك.' : 'Listed as a direct fit for your model.'
      priority = type === 'oil' || type === 'filter' ? 'now' : 'soon'
    } else {
      reason = ar ? 'منتج عام يناسب أي سيارة ويستحق الاقتناء.' : 'A universal item worth keeping in the car.'
    }

    picks.push(toPick(product, reason, priority))
    usedTypes.add(type)
    if (picks.length >= 6) break
  }

  if (!picks.length) return { ok: false, error: 'empty' }
  return {
    ok: true,
    source: 'rules',
    summary: ar
      ? 'دي أهم القطع اللي تناسب سيارتك من الكتالوج، مرتبة حسب الأولوية.'
      : 'These are the parts in our catalogue that fit your car, ordered by priority.',
    picks,
  }
}

export const getCarRecommendations = async (input: {
  locale: Locale
  car: GarageCar | null
  question?: string
}): Promise<AdvisorResult> => {
  const customer = await getCurrentCustomer()
  if (!customer) return { ok: false, error: 'auth' }
  if (!input.car?.modelId) return { ok: false, error: 'noCar' }

  const limit = await guard('advisor', 8, 60_000)
  if (!limit.ok) return { ok: false, error: 'rateLimit' }

  const locale: Locale = input.locale === 'en' ? 'en' : 'ar'
  const question = (input.question ?? '').slice(0, 300).trim()

  let candidates: Awaited<ReturnType<typeof loadCandidates>>
  try {
    candidates = await loadCandidates(locale, input.car)
  } catch {
    return { ok: false, error: 'failed' }
  }
  const { products, fittedIds, spec } = candidates
  if (!products.length) return { ok: false, error: 'empty' }

  if (!process.env.ANTHROPIC_API_KEY) return ruleBased(locale, products, fittedIds, spec)

  const car = input.car
  const catalogue = products.map((product) => ({
    id: product.id,
    name: product.name,
    type: product.productType,
    category: categoryName(product),
    brand: product.brand,
    price: product.price,
    fitsThisCar: fittedIds.has(product.id),
    oil: product.productType === 'oil' ? product.oilAttributes : undefined,
    description: product.shortDescription?.slice(0, 160),
  }))

  try {
    const client = new Anthropic()
    const response = await client.messages.create({
      model: MODEL,
      max_tokens: 4000,
      output_config: { effort: 'low', format: answerFormat },
      system: [
        'You are the parts advisor for Drift, an Egyptian car-accessories shop. A signed-in customer wants to know what to buy for their car.',
        'Rules: recommend ONLY productIds from the catalogue given. Prefer items marked fitsThisCar. For engine oil, match the viscosity/spec from the vehicle data when present. Pick 3-6 items, no duplicates of the same type unless clearly useful.',
        'Priorities: "now" = needed for routine maintenance or safety, "soon" = worth doing within a few months, "nice" = optional upgrade.',
        `Write the summary (2 short sentences) and each reason (max 20 words) in ${locale === 'ar' ? 'Egyptian Arabic' : 'English'}. Be concrete and friendly; never invent parts or prices.`,
      ].join('\n'),
      messages: [
        {
          role: 'user',
          content: JSON.stringify({
            car: {
              brand: car.brandName,
              model: car.modelName,
              year: car.year,
              engine: car.engineLabel ?? car.engineCode ?? null,
            },
            oilSpec: spec
              ? {
                  viscosity: spec.recommendedViscosity,
                  api: spec.requiredAPISpec,
                  acea: spec.requiredACEASpec,
                  type: spec.oilType,
                  liters: spec.requiredOilQuantityLiters,
                }
              : null,
            customerQuestion: question || null,
            catalogue,
          }),
        },
      ],
    })

    const text = response.content.find((block) => block.type === 'text')?.text ?? ''
    const parsedResult = answerSchema.safeParse(JSON.parse(text))
    if (!parsedResult.success) return ruleBased(locale, products, fittedIds, spec)
    const parsed = parsedResult.data

    const byId = new Map(products.map((product) => [product.id, product]))
    const picks = parsed.picks
      .filter(
        (pick, index, all) =>
          byId.has(pick.productId) && all.findIndex((p) => p.productId === pick.productId) === index,
      )
      .slice(0, 6)
      .map((pick) => toPick(byId.get(pick.productId)!, pick.reason, pick.priority))

    if (!picks.length) return ruleBased(locale, products, fittedIds, spec)
    return { ok: true, source: 'ai', summary: parsed.summary, picks }
  } catch {
    return ruleBased(locale, products, fittedIds, spec)
  }
}
