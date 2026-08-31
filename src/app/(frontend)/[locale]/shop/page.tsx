import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { getCategories, getCategoryTree } from '@/lib/payload'
import { ProductGrid } from '@/components/shop/ProductGrid'
import { ShopFilters } from '@/components/shop/ShopFilters'
import { CategoryBrowser } from '@/components/shop/CategoryBrowser'
import { queryProducts, type ProductQuery } from '@/lib/products'

export const revalidate = 120

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'shop' })
  return { title: t('title') }
}

type SearchParams = Promise<Record<string, string | string[] | undefined>>

export default async function ShopPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: SearchParams
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const sp = await searchParams

  const query: ProductQuery = {
    locale,
    search: typeof sp.q === 'string' ? sp.q : undefined,
    brand: typeof sp.brand === 'string' ? sp.brand : undefined,
    minPrice: typeof sp.min === 'string' ? Number(sp.min) : undefined,
    maxPrice: typeof sp.max === 'string' ? Number(sp.max) : undefined,
    sort: typeof sp.sort === 'string' ? sp.sort : undefined,
    page: typeof sp.page === 'string' ? Number(sp.page) : 1,
  }

  const [{ products, totalPages, page, brands }, categories, tree, t] = await Promise.all([
    queryProducts(query),
    getCategories(locale),
    getCategoryTree(locale),
    getTranslations({ locale, namespace: 'shop' }),
  ])

  // With no search or filter applied, browsing the catalogue by category is a
  // better first screen than an undifferentiated wall of products.
  const browsing = !query.search && !query.brand && !query.minPrice && !query.maxPrice && page === 1

  return (
    <div className="container-page py-10 lg:py-16">
      <header className="mb-10">
        <h1 className="text-h1 lg:text-h1">{t('title')}</h1>
        <p className="mt-3 text-neutral-400">{t('allProducts')}</p>
      </header>

      {browsing ? (
        <section className="mb-14">
          <h2 className="mb-6 text-h3">{t('categories')}</h2>
          <CategoryBrowser tree={tree} />
        </section>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-[16rem_1fr]">
        <ShopFilters categories={categories} brands={brands} />
        <ProductGrid products={products} page={page} totalPages={totalPages} />
      </div>
    </div>
  )
}
