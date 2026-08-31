import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { Check, ShieldCheck, Truck } from 'lucide-react'
import type { Locale } from '@/i18n/routing'
import { Link } from '@/i18n/routing'
import { getProductBySlug, getRelatedProducts } from '@/lib/products'
import { formatPrice, mediaAlt, mediaUrl, relId } from '@/lib/utils'
import { Badge } from '@/components/ui/primitives'
import { ProductGallery } from '@/components/shop/ProductGallery'
import { AddToCartPanel } from '@/components/shop/AddToCartPanel'
import { ProductCard } from '@/components/shop/ProductCard'
import { ProductSchema } from '@/components/seo/StructuredData'
import { RecentlyViewed } from '@/components/shop/RecentlyViewed'
import { StickyBuyBar } from '@/components/shop/StickyBuyBar'
import { WishlistButton } from '@/components/shop/WishlistButton'
import { FitmentBanner } from '@/components/shop/FitmentBanner'

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const product = await getProductBySlug(slug, locale)
  if (!product) return {}
  const image = Array.isArray(product.images) ? product.images[0] : null

  return {
    title: product.metaTitle || product.name,
    description: product.metaDescription || product.shortDescription || undefined,
    openGraph: {
      title: product.metaTitle || product.name,
      images: mediaUrl(image, 'card') ? [{ url: mediaUrl(image, 'card') as string }] : undefined,
    },
  }
}

export default async function ProductPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const product = await getProductBySlug(slug, locale)
  if (!product) notFound()

  const [related, t] = await Promise.all([
    getRelatedProducts(product, locale),
    getTranslations({ locale, namespace: 'shop' }),
  ])

  const images = (Array.isArray(product.images) ? product.images : [])
    .map((image) => ({ url: mediaUrl(image, 'tablet') ?? mediaUrl(image), alt: mediaAlt(image) }))
    .filter((image): image is { url: string; alt: string } => Boolean(image.url))

  const inStock = (product.stockQuantity ?? 0) > 0 || Boolean(product.allowBackorder)
  const category = typeof product.category === 'object' ? product.category : null

  return (
    <div className="container-page py-10 lg:py-16">
      <ProductSchema product={product} locale={locale} />

      <nav className="mb-8 flex flex-wrap items-center gap-2 text-body-sm text-neutral-400" aria-label="Breadcrumb">
        <Link href="/shop" className="hover:text-neutral-900">
          {t('title')}
        </Link>
        {category ? (
          <>
            <span aria-hidden>/</span>
            <Link href={`/shop/${category.slug}`} className="hover:text-neutral-900">
              {category.name}
            </Link>
          </>
        ) : null}
        <span aria-hidden>/</span>
        <span className="text-neutral-900">{product.name}</span>
      </nav>

      <div className="grid gap-10 lg:grid-cols-2 lg:gap-16">
        <ProductGallery images={images} name={product.name} />

        <div>
          {product.brand ? (
            <p className="mb-2 text-label font-semibold uppercase tracking-[0.16em] text-primary-600">
              {product.brand}
            </p>
          ) : null}
          <h1 className="text-h1 lg:text-h1">{product.name}</h1>

          {product.shortDescription ? (
            <p className="mt-4 leading-relaxed text-neutral-500">{product.shortDescription}</p>
          ) : null}

          <div className="mt-6 flex items-baseline gap-3">
            <span className="text-h1 font-bold text-neutral-950">{formatPrice(product.price, locale)}</span>
            {typeof product.compareAtPrice === 'number' && product.compareAtPrice > (product.price ?? 0) ? (
              <span className="text-h4 text-neutral-400 line-through">
                {formatPrice(product.compareAtPrice, locale)}
              </span>
            ) : null}
          </div>

          <div className="mt-4 flex flex-wrap items-center gap-2">
            <Badge tone={inStock ? 'success' : 'neutral'}>
              {inStock ? t('inStock') : t('outOfStock')}
            </Badge>
            {product.sku ? <Badge tone="neutral">{`${t('sku')}: ${product.sku}`}</Badge> : null}
            <WishlistButton
              className="ms-auto border border-neutral-200"
              item={{
                productId: product.id,
                name: product.name,
                slug: product.slug ?? String(product.id),
                price: product.price ?? 0,
                image: mediaUrl(Array.isArray(product.images) ? product.images[0] : null, 'card'),
              }}
            />
          </div>

          <FitmentBanner
            compatibleModelIds={(product.compatibleVehicles ?? [])
              .map((vehicle) => relId(vehicle))
              .filter((id): id is number => id !== null)}
          />

          <AddToCartPanel
            productId={product.id}
            name={product.name}
            slug={product.slug ?? String(product.id)}
            price={product.price ?? 0}
            image={mediaUrl(Array.isArray(product.images) ? product.images[0] : null, 'card')}
            stockQuantity={product.allowBackorder ? null : (product.stockQuantity ?? 0)}
            sku={product.sku}
          />

          <ul className="mt-8 grid gap-3 border-t border-neutral-200 pt-6 text-body-sm text-neutral-500">
            <li className="flex items-center gap-2.5">
              <ShieldCheck className="size-4 text-primary-500" />
              {locale === 'ar' ? 'منتجات أصلية 100%' : '100% genuine products'}
            </li>
            <li className="flex items-center gap-2.5">
              <Truck className="size-4 text-primary-500" />
              {locale === 'ar' ? 'توصيل لجميع المحافظات' : 'Delivery across Egypt'}
            </li>
            <li className="flex items-center gap-2.5">
              <Check className="size-4 text-primary-500" />
              {locale === 'ar' ? 'تركيب في الفرع بواسطة فنيين' : 'Expert fitting at our branches'}
            </li>
          </ul>
        </div>
      </div>

      {product.specifications?.length ? (
        <section className="mt-16 max-w-3xl">
          <h2 className="text-h3">{t('specifications')}</h2>
          <dl className="mt-5 divide-y divide-neutral-200 overflow-hidden rounded-[var(--radius-card)] border border-neutral-200">
            {product.specifications.map((spec) => (
              <div key={spec.id ?? spec.label} className="flex gap-4 bg-white px-5 py-3.5 text-body-sm">
                <dt className="w-40 shrink-0 text-neutral-400">{spec.label}</dt>
                <dd className="font-medium text-neutral-900">{spec.value}</dd>
              </div>
            ))}
          </dl>
        </section>
      ) : null}

      {product.description ? (
        <section className="prose prose-lg mt-16 max-w-3xl">
          <RichText data={product.description as SerializedEditorState} />
        </section>
      ) : null}

      <RecentlyViewed
        current={{
          productId: product.id,
          name: product.name,
          slug: product.slug ?? String(product.id),
          price: product.price ?? 0,
          image: mediaUrl(Array.isArray(product.images) ? product.images[0] : null, 'card'),
        }}
      />

      <StickyBuyBar
        productId={product.id}
        name={product.name}
        slug={product.slug ?? String(product.id)}
        price={product.price ?? 0}
        image={mediaUrl(Array.isArray(product.images) ? product.images[0] : null, 'card')}
        stockQuantity={product.allowBackorder ? null : (product.stockQuantity ?? 0)}
      />

      {related.length ? (
        <section className="mt-20">
          <h2 className="text-h3">{t('relatedProducts')}</h2>
          <div className="mt-6 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {related.map((item, index) => (
              <ProductCard key={item.id} product={item} index={index} />
            ))}
          </div>
        </section>
      ) : null}
    </div>
  )
}
