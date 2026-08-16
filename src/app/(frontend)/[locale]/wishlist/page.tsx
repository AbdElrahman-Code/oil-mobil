import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { WishlistGrid } from '@/components/shop/WishlistGrid'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'shop' })
  return { title: t('wishlist'), robots: { index: false } }
}

export default async function WishlistPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations({ locale, namespace: 'shop' })

  return (
    <div className="container-page py-10 lg:py-16">
      <h1 className="mb-8 text-h1">{t('wishlist')}</h1>
      <WishlistGrid />
    </div>
  )
}
