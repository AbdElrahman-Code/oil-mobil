import type { Product, SiteSetting } from '@/payload-types'
import type { Locale } from '@/i18n/routing'
import { mediaUrl } from '@/lib/utils'

const JsonLd = ({ data }: { data: Record<string, unknown> }) => (
  <script
    type="application/ld+json"
    dangerouslySetInnerHTML={{ __html: JSON.stringify(data).replace(/</g, '\\u003c') }}
  />
)

export const LocalBusinessSchema = ({
  settings,
  locale,
}: {
  settings: SiteSetting | null
  locale: Locale
}) => {
  if (!settings) return null
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'AutoRepair',
        name: settings.siteName,
        description: settings.defaultMetaDescription || settings.tagline || undefined,
        url: `${base}/${locale}`,
        telephone: settings.phone || undefined,
        email: settings.email || undefined,
        image: mediaUrl(settings.ogImage, 'hero') || mediaUrl(settings.logo) || undefined,
        address: settings.branches?.map((branch) => ({
          '@type': 'PostalAddress',
          streetAddress: branch.address,
          addressCountry: 'EG',
        })),
        geo: settings.branches?.[0]?.latitude
          ? {
              '@type': 'GeoCoordinates',
              latitude: settings.branches[0].latitude,
              longitude: settings.branches[0].longitude,
            }
          : undefined,
        openingHours: settings.openingHours?.map((entry) => `${entry.days} ${entry.hours}`),
        sameAs: settings.socialLinks?.map((social) => social.url),
      }}
    />
  )
}

export const ProductSchema = ({ product, locale }: { product: Product; locale: Locale }) => {
  const base = process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'
  const image = Array.isArray(product.images) ? product.images[0] : null

  return (
    <JsonLd
      data={{
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.name,
        sku: product.sku,
        brand: product.brand ? { '@type': 'Brand', name: product.brand } : undefined,
        description: product.shortDescription || undefined,
        image: mediaUrl(image, 'card') || undefined,
        offers: {
          '@type': 'Offer',
          price: product.price,
          priceCurrency: 'EGP',
          availability:
            (product.stockQuantity ?? 0) > 0 || product.allowBackorder
              ? 'https://schema.org/InStock'
              : 'https://schema.org/OutOfStock',
          url: `${base}/${locale}/products/${product.slug}`,
        },
      }}
    />
  )
}
