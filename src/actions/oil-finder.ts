'use server'

import type { Locale } from '@/i18n/routing'
import type { OilSpecification, Product, VehicleBrand, VehicleModel } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'
import { guard } from '@/lib/rate-limit'
import { oilFinderSchema, oilLeadSchema } from '@/lib/validation'
import { applyRules, bottlesNeeded, selectSpec, type OilRecommendation } from '@/lib/oil-engine'
import { notify } from '@/lib/notifications'
import { mediaUrl } from '@/lib/utils'

export type OilFinderProduct = {
  id: number
  name: string
  slug: string
  price: number
  image: string | null
  brand?: string | null
  volumeLiters?: number | null
  stockQuantity?: number | null
  bottles?: number
}

export type OilFinderSuccess = {
  status: 'matched'
  vehicleLabel: string
  viscosity: string
  viscosityAdjusted: boolean
  baseViscosity: string
  oilType: string
  apiSpec?: string | null
  aceaSpec?: string | null
  quantityLiters: number
  intervalKm: number
  intervalMonths: number
  notes: string[]
  needsStaffReview: boolean
  recommendedProduct: OilFinderProduct | null
  alternatives: OilFinderProduct[]
  oilFilter: (OilFinderProduct & { partNumber?: string | null }) | null
  otherFilters: { type: 'air' | 'cabin' | 'fuel'; product: OilFinderProduct }[]
}

export type OilFinderFallback = { status: 'noMatch'; vehicleLabel: string }
export type OilFinderError = { status: 'error'; error: string }
export type OilFinderResult = OilFinderSuccess | OilFinderFallback | OilFinderError

const toProduct = (value: unknown, litresRequired?: number): OilFinderProduct | null => {
  if (!value || typeof value !== 'object') return null
  const product = value as Product
  const image = Array.isArray(product.images) ? product.images[0] : null

  return {
    id: product.id,
    name: product.name,
    slug: product.slug ?? String(product.id),
    price: product.price ?? 0,
    image: mediaUrl(image, 'card'),
    brand: product.brand,
    volumeLiters: product.volumeLiters,
    stockQuantity: product.stockQuantity,
    bottles: litresRequired ? bottlesNeeded(litresRequired, product.volumeLiters) : undefined,
  }
}

/* ------------------------------------------------------------ cascade data */

export const listBrands = async (): Promise<VehicleBrand[]> => {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'vehicleBrands',
      where: { isActive: { equals: true } },
      sort: 'displayOrder',
      limit: 200,
      depth: 1,
    })
    return result.docs
  } catch {
    return []
  }
}

export const listModels = async (brandId: number, locale: Locale = 'ar'): Promise<VehicleModel[]> => {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'vehicleModels',
      locale,
      where: { and: [{ brand: { equals: brandId } }, { isActive: { equals: true } }] },
      sort: 'name',
      limit: 300,
      depth: 0,
    })
    return result.docs
  } catch {
    return []
  }
}

export const getModel = async (modelId: number, locale: Locale = 'ar'): Promise<VehicleModel | null> => {
  try {
    const payload = await getPayloadClient()
    return await payload.findByID({ collection: 'vehicleModels', id: modelId, locale, depth: 1 })
  } catch {
    return null
  }
}

/* ------------------------------------------------------------ the main call */

export const recommendOil = async (input: unknown, locale: Locale = 'ar'): Promise<OilFinderResult> => {
  const limit = await guard('oil-finder', 30, 60_000)
  if (!limit.ok) return { status: 'error', error: 'tooManyRequests' }

  const parsed = oilFinderSchema.safeParse(input)
  if (!parsed.success) return { status: 'error', error: 'invalidInput' }

  const { modelId, year, engineCode, mileageKm, condition } = parsed.data

  try {
    const payload = await getPayloadClient()

    const model = await payload.findByID({
      collection: 'vehicleModels',
      id: modelId,
      locale,
      depth: 1,
    })
    const brandName = typeof model.brand === 'object' && model.brand ? model.brand.name : ''
    const vehicleLabel = `${brandName} ${model.name} ${year}`.trim()

    const [specsResult, rulesResult] = await Promise.all([
      payload.find({
        collection: 'oilSpecifications',
        locale,
        where: { vehicleModel: { equals: modelId } },
        limit: 100,
        depth: 2,
      }),
      payload.find({
        collection: 'oilAdjustmentRules',
        locale,
        where: { isActive: { equals: true } },
        sort: 'priority',
        limit: 100,
        depth: 0,
      }),
    ])

    const spec = selectSpec(specsResult.docs as OilSpecification[], { year, engineCode })
    if (!spec) return { status: 'noMatch', vehicleLabel }

    const engine = model.engines?.find((item) => item.code === engineCode)

    const recommendation: OilRecommendation = applyRules({
      spec,
      rules: rulesResult.docs,
      input: { mileageKm, condition },
      engine,
      locale: locale === 'en' ? 'en' : 'ar',
    })

    const notes = recommendation.appliedRules
      .map((rule) => rule.note)
      .filter((note): note is string => Boolean(note))

    const otherFilters = (
      [
        ['air', spec.airFilterProduct],
        ['cabin', spec.cabinFilterProduct],
        ['fuel', spec.fuelFilterProduct],
      ] as const
    )
      .map(([type, value]) => {
        const product = toProduct(value)
        return product ? { type, product } : null
      })
      .filter(
        (entry): entry is { type: 'air' | 'cabin' | 'fuel'; product: OilFinderProduct } => entry !== null,
      )

    const oilFilter = toProduct(spec.oilFilterProduct)

    return {
      status: 'matched',
      vehicleLabel,
      viscosity: recommendation.viscosity,
      baseViscosity: recommendation.baseViscosity,
      viscosityAdjusted: recommendation.viscosityAdjusted,
      oilType: recommendation.oilType,
      apiSpec: recommendation.apiSpec,
      aceaSpec: recommendation.aceaSpec,
      quantityLiters: recommendation.quantityLiters,
      intervalKm: recommendation.intervalKm,
      intervalMonths: recommendation.intervalMonths,
      notes,
      needsStaffReview: recommendation.needsStaffReview,
      recommendedProduct: toProduct(spec.recommendedOilProduct, recommendation.quantityLiters),
      alternatives: (spec.alternativeOilProducts ?? [])
        .map((product) => toProduct(product, recommendation.quantityLiters))
        .filter((product): product is OilFinderProduct => product !== null),
      oilFilter: oilFilter ? { ...oilFilter, partNumber: spec.oilFilterPartNumber } : null,
      otherFilters,
    }
  } catch (error) {
    console.error('recommendOil failed', error)
    return { status: 'error', error: 'serverError' }
  }
}

/** Records an enquiry when we cannot answer, so no visitor hits a dead end. */
export const submitOilLead = async (input: unknown): Promise<{ ok: boolean; error?: string }> => {
  const limit = await guard('oil-lead', 5, 60_000)
  if (!limit.ok) return { ok: false, error: 'tooManyRequests' }

  const parsed = oilLeadSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalidInput' }

  const data = parsed.data

  try {
    const payload = await getPayloadClient()
    await payload.create({
      collection: 'oilFinderLeads',
      data: {
        brand: data.brandId,
        vehicleModel: data.modelId,
        brandName: data.brandName,
        modelName: data.modelName,
        year: data.year,
        engineLabel: data.engineLabel,
        mileageKm: data.mileageKm,
        engineCondition: data.condition,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        status: 'new',
      },
      overrideAccess: true,
    })

    await notify({ channel: 'whatsapp', to: data.contactPhone, template: 'oilEnquiryReceived' })
    return { ok: true }
  } catch (error) {
    console.error('submitOilLead failed', error)
    return { ok: false, error: 'serverError' }
  }
}
