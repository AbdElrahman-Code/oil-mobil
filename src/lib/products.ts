import type { Where } from 'payload'
import type { Locale } from '@/i18n/routing'
import type { Product } from '@/payload-types'
import { getPayloadClient } from './payload'

export type ProductQuery = {
  locale: Locale
  categorySlug?: string
  search?: string
  brand?: string
  minPrice?: number
  maxPrice?: number
  sort?: string
  page?: number
  limit?: number
  vehicleModelId?: number
  productType?: Product['productType']
}

const sortMap: Record<string, string> = {
  newest: '-createdAt',
  priceAsc: 'price',
  priceDesc: '-price',
}

export type ProductQueryResult = {
  products: Product[]
  page: number
  totalPages: number
  totalDocs: number
  brands: string[]
}

/** One place that knows how to search the catalogue — shared by shop, category and lookup pages. */
export const queryProducts = async (query: ProductQuery): Promise<ProductQueryResult> => {
  const empty: ProductQueryResult = { products: [], page: 1, totalPages: 0, totalDocs: 0, brands: [] }

  try {
    const payload = await getPayloadClient()
    const and: Where[] = [{ isPublished: { equals: true } }]

    if (query.categorySlug) {
      const category = await payload.find({
        collection: 'productCategories',
        where: { slug: { equals: query.categorySlug } },
        limit: 1,
        depth: 0,
      })
      const parent = category.docs[0]
      if (!parent) return empty

      // Include products filed under child categories too.
      const children = await payload.find({
        collection: 'productCategories',
        where: { parent: { equals: parent.id } },
        limit: 100,
        depth: 0,
      })
      const ids = [parent.id, ...children.docs.map((child) => child.id)]
      and.push({ category: { in: ids } })
    }

    if (query.productType) and.push({ productType: { equals: query.productType } })
    if (query.brand) and.push({ brand: { equals: query.brand } })
    if (query.vehicleModelId) and.push({ compatibleVehicles: { in: [query.vehicleModelId] } })
    if (typeof query.minPrice === 'number' && !Number.isNaN(query.minPrice))
      and.push({ price: { greater_than_equal: query.minPrice } })
    if (typeof query.maxPrice === 'number' && !Number.isNaN(query.maxPrice))
      and.push({ price: { less_than_equal: query.maxPrice } })
    if (query.search) {
      and.push({
        or: [
          { name: { like: query.search } },
          { sku: { like: query.search } },
          { brand: { like: query.search } },
          { shortDescription: { like: query.search } },
        ],
      })
    }

    const limit = query.limit ?? 24
    const result = await payload.find({
      collection: 'products',
      locale: query.locale,
      where: { and },
      sort: sortMap[query.sort ?? 'newest'] ?? '-createdAt',
      page: Math.max(1, query.page ?? 1),
      limit,
      depth: 1,
    })

    // Brand facet, derived from what is actually in the catalogue.
    const brandDocs = await payload.find({
      collection: 'products',
      where: { isPublished: { equals: true } },
      limit: 500,
      depth: 0,
      pagination: false,
      select: { brand: true },
    })
    const brands = Array.from(
      new Set(brandDocs.docs.map((doc) => doc.brand).filter((brand): brand is string => Boolean(brand))),
    ).sort()

    return {
      products: result.docs,
      page: result.page ?? 1,
      totalPages: result.totalPages ?? 1,
      totalDocs: result.totalDocs ?? 0,
      brands,
    }
  } catch {
    return empty
  }
}

export const getProductBySlug = async (slug: string, locale: Locale): Promise<Product | null> => {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'products',
      locale,
      where: { and: [{ slug: { equals: slug } }, { isPublished: { equals: true } }] },
      limit: 1,
      depth: 2,
    })
    return result.docs[0] ?? null
  } catch {
    return null
  }
}

export const getRelatedProducts = async (product: Product, locale: Locale): Promise<Product[]> => {
  try {
    const payload = await getPayloadClient()
    const categoryId = typeof product.category === 'object' ? product.category?.id : product.category
    const result = await payload.find({
      collection: 'products',
      locale,
      where: {
        and: [
          { isPublished: { equals: true } },
          { id: { not_equals: product.id } },
          ...(categoryId ? [{ category: { equals: categoryId } }] : []),
        ],
      },
      limit: 4,
      depth: 1,
    })
    return result.docs
  } catch {
    return []
  }
}
