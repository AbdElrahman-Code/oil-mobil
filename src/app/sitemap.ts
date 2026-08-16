import type { MetadataRoute } from 'next'
import { getPayloadClient } from '@/lib/payload'
import { locales } from '@/i18n/routing'

const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

const staticPaths = ['', '/shop', '/oil-finder', '/filters', '/car-wash']

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const entries: MetadataRoute.Sitemap = []

  for (const locale of locales) {
    for (const path of staticPaths) {
      entries.push({
        url: `${base}/${locale}${path}`,
        changeFrequency: path === '' ? 'daily' : 'weekly',
        priority: path === '' ? 1 : 0.7,
      })
    }
  }

  try {
    const payload = await getPayloadClient()
    const [products, categories] = await Promise.all([
      payload.find({ collection: 'products', where: { isPublished: { equals: true } }, limit: 1000, depth: 0, pagination: false }),
      payload.find({ collection: 'productCategories', limit: 200, depth: 0, pagination: false }),
    ])

    for (const locale of locales) {
      for (const category of categories.docs) {
        entries.push({ url: `${base}/${locale}/shop/${category.slug}`, changeFrequency: 'weekly', priority: 0.6 })
      }
      for (const product of products.docs) {
        entries.push({
          url: `${base}/${locale}/products/${product.slug}`,
          lastModified: product.updatedAt ? new Date(product.updatedAt) : undefined,
          changeFrequency: 'weekly',
          priority: 0.5,
        })
      }
    }
  } catch {
    // Sitemap still lists the static pages if the database is unavailable.
  }

  return entries
}
