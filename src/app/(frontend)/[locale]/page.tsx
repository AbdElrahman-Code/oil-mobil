import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { getFeaturedProducts, getHomepage, getSiteSettings } from '@/lib/payload'
import type { Locale } from '@/i18n/routing'
import { RenderBlocks } from '@/components/blocks/RenderBlocks'
import { HeroSection } from '@/components/blocks/HeroSection'
import { FeaturedProductsSection } from '@/components/blocks/sections'
import { LocalBusinessSchema } from '@/components/seo/StructuredData'

export const revalidate = 300

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const homepage = await getHomepage(locale)
  return {
    title: homepage?.seo?.metaTitle || undefined,
    description: homepage?.seo?.metaDescription || undefined,
  }
}

export default async function HomePage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const [homepage, settings, t] = await Promise.all([
    getHomepage(locale),
    getSiteSettings(locale),
    getTranslations({ locale, namespace: 'home' }),
  ])

  const hasSections = Boolean(homepage?.sections?.length)

  return (
    <>
      <LocalBusinessSchema settings={settings} locale={locale} />

      {hasSections ? (
        <RenderBlocks sections={homepage?.sections} locale={locale} />
      ) : (
        // Before the admin has built the homepage, the site still looks finished.
        <>
          <HeroSection
            headline={t('heroFallbackHeadline')}
            subheadline={t('heroFallbackSub')}
            buttons={[
              { label: t('findMyOil'), href: '/oil-finder', style: 'primary' },
              { label: t('bookWash'), href: '/car-wash', style: 'outline' },
            ]}
          />
          <FeaturedProductsSection
            locale={locale}
            products={await getFeaturedProducts(locale, 8)}
            ctaHref="/shop"
          />
        </>
      )}
    </>
  )
}
