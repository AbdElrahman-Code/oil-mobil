import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { redirect } from '@/i18n/routing'
import { getCurrentCustomer } from '@/actions/auth'
import { AuthForm } from '@/components/account/AuthForm'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'account' })
  return { title: t('loginTitle'), robots: { index: false } }
}

export default async function LoginPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: Locale }>
  searchParams: Promise<{ mode?: string }>
}) {
  const { mode } = await searchParams
  const { locale } = await params
  setRequestLocale(locale)

  const customer = await getCurrentCustomer()
  if (customer) redirect({ href: '/account', locale })

  const t = await getTranslations({ locale, namespace: 'account' })

  return (
    <div className="container-page py-16 lg:py-24">
      <div className="mx-auto max-w-md">
        <h1 className="text-h1">{t('loginTitle')}</h1>
        <p className="mt-3 text-neutral-400">{t('loginSubtitle')}</p>
        <AuthForm initialMode={mode === 'signup' ? 'signup' : 'login'} />
      </div>
    </div>
  )
}
