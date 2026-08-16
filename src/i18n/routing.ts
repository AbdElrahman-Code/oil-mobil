import { defineRouting } from 'next-intl/routing'
import { createNavigation } from 'next-intl/navigation'

export const locales = ['ar', 'en'] as const
export type Locale = (typeof locales)[number]

export const routing = defineRouting({
  locales,
  defaultLocale: 'ar',
  localePrefix: 'always',
})

export const { Link, redirect, usePathname, useRouter, getPathname } = createNavigation(routing)

export const isRtl = (locale: string): boolean => locale === 'ar'
export const dirFor = (locale: string): 'rtl' | 'ltr' => (isRtl(locale) ? 'rtl' : 'ltr')
