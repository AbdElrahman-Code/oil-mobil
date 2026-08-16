import { cache } from 'react'
import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { Locale } from '@/i18n/routing'
import type {
  Page,
  LegalPage,
  Homepage,
  Navigation,
  Product,
  ProductCategory,
  SiteSetting,
  WashService,
} from '@/payload-types'

/** Local API client. Runs in-process — no HTTP round trip from server components. */
export const getPayloadClient = cache(async () => getPayload({ config: configPromise }))

export const getSiteSettings = cache(async (locale: Locale): Promise<SiteSetting | null> => {
  try {
    const payload = await getPayloadClient()
    return (await payload.findGlobal({ slug: 'siteSettings', locale, depth: 2 })) as SiteSetting
  } catch {
    // The site must still render before the database is seeded.
    return null
  }
})

export const getNavigation = cache(async (locale: Locale): Promise<Navigation | null> => {
  try {
    const payload = await getPayloadClient()
    return (await payload.findGlobal({ slug: 'navigation', locale, depth: 1 })) as Navigation
  } catch {
    return null
  }
})

export const getHomepage = cache(async (locale: Locale): Promise<Homepage | null> => {
  try {
    const payload = await getPayloadClient()
    return (await payload.findGlobal({ slug: 'homepage', locale, depth: 2 })) as Homepage
  } catch {
    return null
  }
})

export const getCategories = cache(async (locale: Locale): Promise<ProductCategory[]> => {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'productCategories',
      locale,
      limit: 100,
      sort: 'displayOrder',
      depth: 1,
    })
    return result.docs
  } catch {
    return []
  }
})

export const getFeaturedProducts = cache(
  async (locale: Locale, limit = 8, source: 'featured' | 'newest' = 'featured'): Promise<Product[]> => {
    try {
      const payload = await getPayloadClient()
      const result = await payload.find({
        collection: 'products',
        locale,
        limit,
        depth: 1,
        where:
          source === 'featured'
            ? { and: [{ isPublished: { equals: true } }, { isFeatured: { equals: true } }] }
            : { isPublished: { equals: true } },
        sort: '-createdAt',
      })
      return result.docs
    } catch {
      return []
    }
  },
)

export const getProductsByIds = cache(async (locale: Locale, ids: number[]): Promise<Product[]> => {
  if (!ids.length) return []
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'products',
      locale,
      depth: 1,
      limit: ids.length,
      where: { id: { in: ids } },
    })
    return result.docs
  } catch {
    return []
  }
})

export const getWashServices = cache(async (locale: Locale): Promise<WashService[]> => {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'washServices',
      locale,
      where: { isActive: { equals: true } },
      sort: 'displayOrder',
      limit: 50,
      depth: 1,
    })
    return result.docs
  } catch {
    return []
  }
})

export const getLegalPages = cache(async (locale: Locale): Promise<LegalPage[]> => {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'legalPages',
      locale,
      sort: 'displayOrder',
      limit: 20,
      depth: 0,
    })
    return result.docs
  } catch {
    return []
  }
})

export const getLegalPage = cache(async (slug: string, locale: Locale): Promise<LegalPage | null> => {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'legalPages',
      locale,
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
    })
    return result.docs[0] ?? null
  } catch {
    return null
  }
})

export const getPages = cache(async (locale: Locale): Promise<Page[]> => {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'pages',
      locale,
      sort: 'displayOrder',
      limit: 50,
      depth: 0,
    })
    return result.docs
  } catch {
    return []
  }
})

export const getPage = cache(async (slug: string, locale: Locale): Promise<Page | null> => {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'pages',
      locale,
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 2,
    })
    return result.docs[0] ?? null
  } catch {
    return null
  }
})
