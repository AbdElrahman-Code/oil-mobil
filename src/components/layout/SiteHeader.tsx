import { getTranslations } from 'next-intl/server'
import { getCategoryTree, getNavigation, getSiteSettings } from '@/lib/payload'
import { formatPrice, mediaUrl } from '@/lib/utils'
import { BRAND_LOGO } from '@/lib/brand'
import type { Locale } from '@/i18n/routing'
import { HeaderShell, type HeaderLink } from './HeaderShell'
import type { MenuCategory } from './MegaMenu'

export const SiteHeader = async ({ locale }: { locale: Locale }) => {
  const [settings, navigation, tree, t, tShop] = await Promise.all([
    getSiteSettings(locale),
    getNavigation(locale),
    getCategoryTree(locale),
    getTranslations({ locale, namespace: 'nav' }),
    getTranslations({ locale, namespace: 'shop' }),
  ])

  const categories: MenuCategory[] = tree.map((category) => ({
    id: category.id,
    name: category.name,
    slug: category.slug as string,
    icon: category.icon,
    children: category.children.map((child) => ({
      id: child.id,
      name: child.name,
      slug: child.slug as string,
    })),
  }))

  // The category bar carries services; the catalogue lives in the mega-menu, so
  // shop links are filtered out to avoid saying the same thing twice.
  const configured: HeaderLink[] =
    navigation?.header
      ?.filter((item) => item.href !== '/shop')
      .map((item) => ({ label: item.label, href: item.href })) ?? []

  const fallback: HeaderLink[] = [
    { label: t('about'), href: '/about' },
    { label: t('contact'), href: '/contact' },
  ]

  const threshold = settings?.freeDeliveryThreshold ?? 0
  const deliveryNote =
    threshold > 0
      ? locale === 'ar'
        ? `توصيل مجاني للطلبات فوق ${formatPrice(threshold, locale)}`
        : `Free delivery on orders over ${formatPrice(threshold, locale)}`
      : null

  return (
    <HeaderShell
      locale={locale}
      links={configured.length ? configured : fallback}
      categories={categories}
      brandName={settings?.siteName || t('home')}
      logoUrl={mediaUrl(settings?.logo) ?? BRAND_LOGO}
      logoDarkUrl={mediaUrl(settings?.logoDark) ?? BRAND_LOGO}
      phone={settings?.phone ?? null}
      whatsapp={settings?.whatsappNumber ?? null}
      deliveryNote={deliveryNote}
      labels={{
        menu: t('menu'),
        cart: t('cart'),
        account: t('account'),
        search: tShop('title'),
        wishlist: t('wishlist'),
        searchHint: tShop('searchPlaceholder'),
        language: t('language'),
      }}
    />
  )
}
