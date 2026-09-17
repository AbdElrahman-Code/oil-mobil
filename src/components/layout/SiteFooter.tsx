import Image from 'next/image'
import { getTranslations } from 'next-intl/server'
import { BRAND_LOGO } from '@/lib/brand'
import { mediaUrl } from '@/lib/utils'
import {
  BadgeCheck,
  Clock,
  Facebook,
  Instagram,
  Linkedin,
  Mail,
  MapPin,
  Music2,
  Phone,
  ShieldCheck,
  Truck,
  Youtube,
} from 'lucide-react'
import { Link } from '@/i18n/routing'
import type { Locale } from '@/i18n/routing'
import { getCategoryTree, getLegalPages, getNavigation, getSiteSettings } from '@/lib/payload'
import { formatPrice } from '@/lib/utils'

const socialIcon = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
  tiktok: Music2,
  x: Music2,
} as const

export const SiteFooter = async ({ locale }: { locale: Locale }) => {
  const [settings, navigation, legalPages, tree, t, tNav] = await Promise.all([
    getSiteSettings(locale),
    getNavigation(locale),
    getLegalPages(locale),
    getCategoryTree(locale),
    getTranslations({ locale, namespace: 'footer' }),
    getTranslations({ locale, namespace: 'nav' }),
  ])

  const brandName = settings?.siteName || tNav('home')
  const year = new Date().getFullYear()
  const ar = locale === 'ar'

  const promises = [
    {
      Icon: ShieldCheck,
      title: ar ? 'قطع أصلية' : 'Genuine parts',
      body: ar ? 'مصدر معروف ومكتوب في فاتورتك' : 'Traceable, and printed on your invoice',
    },
    {
      Icon: Truck,
      title: ar ? 'توصيل سريع' : 'Fast delivery',
      body:
        (settings?.freeDeliveryThreshold ?? 0) > 0
          ? ar
            ? `مجاني فوق ${formatPrice(settings?.freeDeliveryThreshold, locale)}`
            : `Free over ${formatPrice(settings?.freeDeliveryThreshold, locale)}`
          : ar
            ? 'لكل القاهرة الكبرى'
            : 'Across Greater Cairo',
    },
    {
      Icon: BadgeCheck,
      title: ar ? 'تركيب بضمان' : 'Fitting guaranteed',
      body: ar ? 'على يد فنيين في الفرع' : 'By our technicians at the branch',
    },
    {
      Icon: Clock,
      title: ar ? 'سجل رقمي' : 'Digital records',
      body: ar ? 'تاريخ صيانة عربيتك في حسابك' : 'Your service history in your account',
    },
  ]

  // The catalogue is the most useful thing a footer can offer on a shop.
  const shopColumn = tree.slice(0, 6)

  return (
    <footer className="mt-20">
      {/* Reassurance band — the four things a first-time buyer worries about. */}
      <div className="border-y border-neutral-200 bg-white">
        <div className="container-page grid gap-6 py-8 sm:grid-cols-2 lg:grid-cols-4">
          {promises.map(({ Icon, title, body }) => (
            <div key={title} className="flex items-start gap-3">
              <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-light text-primary-dark">
                <Icon className="size-5" />
              </span>
              <span>
                <span className="block font-semibold text-neutral-950">{title}</span>
                <span className="block text-body-sm text-neutral-500">{body}</span>
              </span>
            </div>
          ))}
        </div>
      </div>

      <div className="surface-dark">
        <div className="container-page grid gap-10 py-14 lg:grid-cols-[1.3fr_1fr_1fr_1.1fr] lg:py-16">
          <div>
            <Link href="/" className="inline-block rounded-2xl bg-white px-4 py-3">
              <Image
                src={mediaUrl(settings?.logo) ?? BRAND_LOGO}
                alt={brandName}
                width={800}
                height={347}
                className="h-12 w-auto"
              />
            </Link>
            {settings?.tagline ? (
              <p className="mt-3 max-w-sm text-body-sm leading-relaxed text-neutral-300">{settings.tagline}</p>
            ) : null}

            <ul className="mt-6 space-y-3 text-body-sm text-neutral-200">
              {settings?.phone ? (
                <li>
                  <a href={`tel:${settings.phone}`} className="flex items-center gap-2.5 hover:text-white" dir="ltr">
                    <Phone className="size-4 text-primary-300" />
                    {settings.phone}
                  </a>
                </li>
              ) : null}
              {settings?.email ? (
                <li>
                  <a href={`mailto:${settings.email}`} className="flex items-center gap-2.5 hover:text-white">
                    <Mail className="size-4 text-primary-300" />
                    {settings.email}
                  </a>
                </li>
              ) : null}
            </ul>

            {settings?.socialLinks?.length ? (
              <div className="mt-6 flex gap-2">
                {settings.socialLinks.map((social) => {
                  const Icon = socialIcon[social.platform as keyof typeof socialIcon] ?? Instagram
                  return (
                    <a
                      key={social.id ?? social.url}
                      href={social.url}
                      target="_blank"
                      rel="noreferrer noopener"
                      className="grid size-10 place-items-center rounded-full border border-white/15 text-neutral-200 transition-colors hover:border-primary-300 hover:bg-primary hover:text-neutral-950"
                      aria-label={social.platform ?? 'social'}
                    >
                      <Icon className="size-4" />
                    </a>
                  )
                })}
              </div>
            ) : null}
          </div>

          <div>
            <p className="mb-4 text-label uppercase text-neutral-400">{tNav('shop')}</p>
            <ul className="space-y-2.5 text-body-sm text-neutral-200">
              {shopColumn.map((category) => (
                <li key={category.id}>
                  <Link href={`/shop/${category.slug}`} className="transition-colors hover:text-white">
                    {category.name}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div>
            <p className="mb-4 text-label uppercase text-neutral-400">{t('contact')}</p>
            <ul className="space-y-2.5 text-body-sm text-neutral-200">
              {(navigation?.footerColumns ?? [])
                .filter((column) => column.title !== tNav('shop'))
                .flatMap((column) => column.links ?? [])
                .slice(0, 6)
                .map((link) => (
                  <li key={link.id ?? link.href}>
                    <Link href={link.href} className="transition-colors hover:text-white">
                      {link.label}
                    </Link>
                  </li>
                ))}
            </ul>
          </div>

          <div>
            {settings?.branches?.length ? (
              <>
                <p className="mb-4 text-label uppercase text-neutral-400">{t('branches')}</p>
                <ul className="space-y-4 text-body-sm text-neutral-200">
                  {settings.branches.slice(0, 2).map((branch) => (
                    <li key={branch.id ?? branch.name} className="flex gap-2.5">
                      <MapPin className="mt-0.5 size-4 shrink-0 text-primary-300" />
                      <span>
                        <span className="block font-medium text-white">{branch.name}</span>
                        <span className="text-neutral-300">{branch.address}</span>
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}

            {settings?.openingHours?.length ? (
              <>
                <p className="mb-3 mt-6 text-label uppercase text-neutral-400">{t('openingHours')}</p>
                <ul className="space-y-2 text-body-sm text-neutral-200">
                  {settings.openingHours.map((entry) => (
                    <li key={entry.id ?? entry.days} className="flex justify-between gap-4">
                      <span>{entry.days}</span>
                      <span className="text-neutral-300" dir="ltr">
                        {entry.hours}
                      </span>
                    </li>
                  ))}
                </ul>
              </>
            ) : null}
          </div>
        </div>

        <div className="border-t border-white/10">
          <div className="container-page flex flex-col gap-3 py-6 text-body-sm text-neutral-300 sm:flex-row sm:items-center sm:justify-between">
            <p>{navigation?.footerNote || `© ${year} ${brandName}`}</p>
            {legalPages.length ? (
              <nav className="flex flex-wrap gap-x-5 gap-y-2" aria-label="Legal">
                {legalPages
                  .filter((page) => page.showInFooter)
                  .map((page) => (
                    <Link
                      key={page.id}
                      href={`/legal/${page.slug}`}
                      className="transition-colors hover:text-white"
                    >
                      {page.title}
                    </Link>
                  ))}
              </nav>
            ) : null}
          </div>
        </div>
      </div>
    </footer>
  )
}
