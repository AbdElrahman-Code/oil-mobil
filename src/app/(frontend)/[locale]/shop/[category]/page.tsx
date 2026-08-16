import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { getCategories, getPayloadClient } from '@/lib/payload'
import { queryProducts } from '@/lib/products'
import { ProductGrid } from '@/components/shop/ProductGrid'
import { ShopFilters } from '@/components/shop/ShopFilters'

export const revalidate = 120

const findCategory = async (slug: string, locale: Locale) => {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'productCategories',
      locale,
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 1,
    })
    return result.docs[0] ?? null
  } catch {
    return null
  }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; category: string }>
}): Promise<Metadata> {
  const { locale, category: slug } = await params
  const category = await findCategory(slug, locale)
  return {
    title: category?.name,
    description: category?.description ?? undefined,
  }
}

export default async function CategoryPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale; category: string }>
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const { locale, category: slug } = await params
  setRequestLocale(locale)
  const sp = await searchParams

  const category = await findCategory(slug, locale)
  if (!category) notFound()

  const [{ products, totalPages, page, brands }, categories] = await Promise.all([
    queryProducts({
      locale,
      categorySlug: slug,
      brand: typeof sp.brand === 'string' ? sp.brand : undefined,
      minPrice: typeof sp.min === 'string' ? Number(sp.min) : undefined,
      maxPrice: typeof sp.max === 'string' ? Number(sp.max) : undefined,
      sort: typeof sp.sort === 'string' ? sp.sort : undefined,
      search: typeof sp.q === 'string' ? sp.q : undefined,
      page: typeof sp.page === 'string' ? Number(sp.page) : 1,
    }),
    getCategories(locale),
  ])

  return (
    <div className="container-page py-10 lg:py-16">
      <header className="mb-10">
        <h1 className="text-h1 lg:text-h1">{category.name}</h1>
        {category.description ? (
          <p className="mt-3 max-w-2xl text-neutral-400">{category.description}</p>
        ) : null}
      </header>

      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <ShopFilters categories={categories} brands={brands} activeCategorySlug={slug} />
        <ProductGrid
          products={products}
          page={page}
          totalPages={totalPages}
          basePath={`/shop/${slug}`}
        />
      </div>
    </div>
  )
}
