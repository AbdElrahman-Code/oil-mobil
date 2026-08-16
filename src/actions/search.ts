'use server'

import type { Locale } from '@/i18n/routing'
import { getPayloadClient } from '@/lib/payload'
import { guard } from '@/lib/rate-limit'

export type SearchHit = {
  id: number
  name: string
  slug: string
  price: number
  image: string | null
  brand?: string | null
  category?: string | null
  inStock: boolean
}

/** Instant search over the catalogue. Kept server-side so pricing rules stay put. */
export const searchProducts = async (query: string, locale: Locale = 'ar'): Promise<SearchHit[]> => {
  const term = query.trim()
  if (term.length < 2) return []

  const limit = await guard('search', 60, 60_000)
  if (!limit.ok) return []

  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'products',
      locale,
      where: {
        and: [
          { isPublished: { equals: true } },
          {
            or: [
              { name: { like: term } },
              { sku: { like: term } },
              { brand: { like: term } },
              { shortDescription: { like: term } },
            ],
          },
        ],
      },
      limit: 8,
      depth: 1,
    })

    return result.docs.map((product) => {
      const image = Array.isArray(product.images) ? product.images[0] : null
      const imageUrl =
        image && typeof image === 'object' ? ((image.sizes?.thumbnail?.url ?? image.url) as string | null) : null
      return {
        id: product.id,
        name: product.name,
        slug: product.slug ?? String(product.id),
        price: product.price ?? 0,
        image: imageUrl,
        brand: product.brand,
        category: typeof product.category === 'object' ? product.category?.name : null,
        inStock: (product.stockQuantity ?? 0) > 0 || Boolean(product.allowBackorder),
      }
    })
  } catch {
    return []
  }
}
