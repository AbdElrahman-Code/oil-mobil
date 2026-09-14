import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { NextIntlClientProvider, hasLocale } from 'next-intl'
import { setRequestLocale, getTranslations } from 'next-intl/server'
import { Cairo } from 'next/font/google'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { Toaster } from 'sonner'

import { routing, dirFor, type Locale } from '@/i18n/routing'
import { getSiteSettings } from '@/lib/payload'
import { SiteHeader } from '@/components/layout/SiteHeader'
import { SiteFooter } from '@/components/layout/SiteFooter'
import { CartDrawerMount } from '@/components/shop/CartDrawerMount'
import { ScrollHelpers } from '@/components/layout/ScrollHelpers'
import { FloatingActions } from '@/components/layout/FloatingActions'
import { GarageProvider } from '@/components/garage/GarageProvider'
import { MobileTabBar } from '@/components/layout/MobileTabBar'
import { SiteConfigProvider } from '@/components/layout/SiteConfig'
import { AnalyticsProvider } from '@/components/analytics/AnalyticsProvider'
import { BrandStyle } from '@/components/layout/BrandStyle'
import '../globals.css'

// One typeface for both scripts: switching AR/EN never causes a fallback flash.
const cairo = Cairo({
  subsets: ['arabic', 'latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-cairo',
  display: 'swap',
})

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const [settings, t] = await Promise.all([getSiteSettings(locale), getTranslations({ locale, namespace: 'common' })])
  const name = settings?.siteName || t('brand')

  return {
    metadataBase: new URL(process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000'),
    title: {
      default: settings?.defaultMetaTitle || name,
      template: `%s · ${name}`,
    },
    description: settings?.defaultMetaDescription || settings?.tagline || undefined,
    alternates: {
      canonical: `/${locale}`,
      languages: { ar: '/ar', en: '/en' },
    },
    openGraph: {
      type: 'website',
      siteName: name,
      locale: locale === 'ar' ? 'ar_EG' : 'en_US',
    },
  }
}

export default async function FrontendLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  if (!hasLocale(routing.locales, locale)) notFound()
  setRequestLocale(locale)

  const settings = await getSiteSettings(locale as Locale)

  return (
    <html
      lang={locale}
      dir={dirFor(locale)}
      className={cairo.variable}
      suppressHydrationWarning
    >
      <body className="min-h-dvh antialiased">
        <BrandStyle primaryColor={settings?.primaryColor} accentColor={settings?.accentColor} />
        <NextIntlClientProvider>
          <SiteConfigProvider
            value={{
              siteName: settings?.siteName ?? '',
              whatsappNumber: settings?.whatsappNumber ?? null,
              deliveryFee: settings?.deliveryFee ?? 0,
              freeDeliveryThreshold: settings?.freeDeliveryThreshold ?? 0,
            }}
          >
          <AnalyticsProvider>
            <a
              href="#main"
              className="sr-only focus:not-sr-only focus:absolute focus:start-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-primary focus:px-5 focus:py-2 focus:text-body-sm focus:text-neutral-950"
            >
              {locale === 'ar' ? 'تخطي إلى المحتوى' : 'Skip to content'}
            </a>
            <SiteHeader locale={locale as Locale} />
            <main id="main">{children}</main>
            <SiteFooter locale={locale as Locale} />
            <CartDrawerMount />
            <ScrollHelpers />
            <FloatingActions locale={locale as Locale} />
            <GarageProvider />
            <MobileTabBar />
            <Toaster position={locale === 'ar' ? 'bottom-left' : 'bottom-right'} richColors closeButton />
          </AnalyticsProvider>
          </SiteConfigProvider>
        </NextIntlClientProvider>
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  )
}
