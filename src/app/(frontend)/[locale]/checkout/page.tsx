import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { getSiteSettings } from '@/lib/payload'
import { CheckoutForm } from '@/components/shop/CheckoutForm'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'checkout' })
  return { title: t('title'), robots: { index: false } }
}

export default async function CheckoutPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const [settings, t] = await Promise.all([
    getSiteSettings(locale),
    getTranslations({ locale, namespace: 'checkout' }),
  ])

  return (
    <div className="container-page py-10 lg:py-16">
      <h1 className="mb-10 text-h1 lg:text-h1">{t('title')}</h1>
      <CheckoutForm
        deliveryFee={settings?.deliveryFee ?? 0}
        freeDeliveryThreshold={settings?.freeDeliveryThreshold ?? 0}
        codEnabled={settings?.codEnabled ?? true}
        onlinePaymentEnabled={settings?.onlinePaymentEnabled ?? false}
      />
    </div>
  )
}
