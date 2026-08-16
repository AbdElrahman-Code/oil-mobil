import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { listBrands } from '@/actions/oil-finder'
import { OilFinderWizard } from '@/components/oil-finder/OilFinderWizard'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'oilFinder' })
  return { title: t('title'), description: t('subtitle') }
}

export default async function OilFinderPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const [brands, t] = await Promise.all([
    listBrands(),
    getTranslations({ locale, namespace: 'oilFinder' }),
  ])

  return (
    <div className="container-page py-10 lg:py-16">
      <header className="mb-10 max-w-2xl">
        <h1 className="text-h1 lg:text-display">{t('title')}</h1>
        <p className="mt-4 text-h4 leading-relaxed text-neutral-400">{t('subtitle')}</p>
      </header>

      <div className="mx-auto max-w-4xl">
        <OilFinderWizard brands={brands} />
      </div>
    </div>
  )
}
