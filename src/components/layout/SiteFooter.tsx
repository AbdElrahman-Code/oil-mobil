import { getTranslations } from 'next-intl/server'
import { Facebook, Instagram, Linkedin, Mail, MapPin, Phone, Youtube } from 'lucide-react'
import { Link } from '@/i18n/routing'
import type { Locale } from '@/i18n/routing'
import { getLegalPages, getNavigation, getSiteSettings } from '@/lib/payload'

const socialIcon = {
  facebook: Facebook,
  instagram: Instagram,
  youtube: Youtube,
  linkedin: Linkedin,
  tiktok: Instagram,
  x: Instagram,
} as const

export const SiteFooter = async ({ locale }: { locale: Locale }) => {
  const [settings, navigation, legalPages, t, tNav] = await Promise.all([
    getSiteSettings(locale),
    getNavigation(locale),
    getLegalPages(locale),
    getTranslations({ locale, namespace: 'footer' }),
    getTranslations({ locale, namespace: 'nav' }),
  ])

  const brandName = settings?.siteName || tNav('home')
  const year = new Date().getFullYear()

  const columns = navigation?.footerColumns?.length
    ? navigation.footerColumns
    : [
        {
          id: 'default',
          title: tNav('shop'),
          links: [
            { id: 'a', label: tNav('shop'), href: '/shop' },
            { id: 'b', label: tNav('oilFinder'), href: '/oil-finder' },
            { id: 'c', label: tNav('filters'), href: '/filters' },
            { id: 'd', label: tNav('carWash'), href: '/car-wash' },
          ],
        },
      ]

  return (
    <footer className="surface-dark mt-24">
      <div className="container-page grid gap-12 py-16 lg:grid-cols-[1.4fr_repeat(3,1fr)] lg:py-20">
        <div>
          <p className="font-[family-name:var(--font-display)] text-h3 font-bold">{brandName}</p>
          {settings?.tagline ? (
            <p className="mt-3 max-w-sm text-body-sm leading-relaxed text-neutral-300">{settings.tagline}</p>
          ) : null}

          <div className="mt-6 space-y-3 text-body-sm text-neutral-200">
            {settings?.phone ? (
              <a href={`tel:${settings.phone}`} className="flex items-center gap-2.5 hover:text-white" dir="ltr">
                <Phone className="size-4 text-primary-400" />
                {settings.phone}
              </a>
            ) : null}
            {settings?.email ? (
              <a href={`mailto:${settings.email}`} className="flex items-center gap-2.5 hover:text-white">
                <Mail className="size-4 text-primary-400" />
                {settings.email}
              </a>
            ) : null}
          </div>

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
                    className="grid size-10 place-items-center rounded-full border border-white/15 text-neutral-200 transition-colors hover:border-white/40 hover:text-white"
                    aria-label={social.platform}
                  >
                    <Icon className="size-4" />
                  </a>
                )
              })}
            </div>
          ) : null}
        </div>

        {columns.map((column) => (
          <div key={column.id ?? column.title}>
            <p className="mb-4 text-label font-semibold uppercase tracking-[0.18em] text-neutral-400">
              {column.title}
            </p>
            <ul className="space-y-2.5 text-body-sm text-neutral-200">
              {column.links?.map((link) => (
                <li key={link.id ?? link.href}>
                  <Link href={link.href} className="transition-colors hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>
        ))}

        {settings?.branches?.length ? (
          <div>
            <p className="mb-4 text-label font-semibold uppercase tracking-[0.18em] text-neutral-400">
              {t('branches')}
            </p>
            <ul className="space-y-4 text-body-sm text-neutral-200">
              {settings.branches.slice(0, 3).map((branch) => (
                <li key={branch.id ?? branch.name} className="flex gap-2.5">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary-400" />
                  <span>
                    <span className="block font-medium text-white">{branch.name}</span>
                    <span className="text-neutral-300">{branch.address}</span>
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}

        {settings?.openingHours?.length ? (
          <div>
            <p className="mb-4 text-label font-semibold uppercase tracking-[0.18em] text-neutral-400">
              {t('openingHours')}
            </p>
            <ul className="space-y-2.5 text-body-sm text-neutral-200">
              {settings.openingHours.map((entry) => (
                <li key={entry.id ?? entry.days} className="flex justify-between gap-4">
                  <span>{entry.days}</span>
                  <span className="text-neutral-300" dir="ltr">
                    {entry.hours}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        ) : null}
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
    </footer>
  )
}
