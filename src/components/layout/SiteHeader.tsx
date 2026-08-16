import { getTranslations } from 'next-intl/server'
import { getNavigation, getSiteSettings, getCategories } from '@/lib/payload'
import { mediaUrl } from '@/lib/utils'
import type { Locale } from '@/i18n/routing'
import { HeaderShell, type HeaderLink } from './HeaderShell'

export const SiteHeader = async ({ locale }: { locale: Locale }) => {
  const [settings, navigation, categories, t] = await Promise.all([
    getSiteSettings(locale),
    getNavigation(locale),
    getCategories(locale),
    getTranslations({ locale, namespace: 'nav' }),
  ])

  // Fall back to a sensible menu before the admin has built one.
  const configured: HeaderLink[] =
    navigation?.header?.map((item) => ({
      label: item.label,
      href: item.href,
      children: item.children?.map((child) => ({ label: child.label, href: child.href })) ?? [],
    })) ?? []

  const fallback: HeaderLink[] = [
    {
      label: t('shop'),
      href: '/shop',
      children: categories
        .filter((category) => category.showInNav && !category.parent)
        .map((category) => ({ label: category.name, href: `/shop/${category.slug}` })),
    },
    { label: t('oilFinder'), href: '/oil-finder', children: [] },
    { label: t('filters'), href: '/filters', children: [] },
    { label: t('carWash'), href: '/car-wash', children: [] },
  ]

  return (
    <HeaderShell
      locale={locale}
      links={configured.length ? configured : fallback}
      brandName={settings?.siteName || t('home')}
      logoUrl={mediaUrl(settings?.logo)}
      logoDarkUrl={mediaUrl(settings?.logoDark)}
      phone={settings?.phone ?? null}
      whatsapp={settings?.whatsappNumber ?? null}
      labels={{
        menu: t('menu'),
        cart: t('cart'),
        account: t('account'),
        search: t('shop'),
        wishlist: t('wishlist'),
        language: t('language'),
      }}
    />
  )
}
