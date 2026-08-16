import { clsx, type ClassValue } from 'clsx'
import { extendTailwindMerge } from 'tailwind-merge'
import type { Media } from '@/payload-types'

/**
 * tailwind-merge has to be told about the project's type-scale tokens. Without
 * this it reads `text-body` as a *colour* utility and silently drops the real
 * colour next to it — which is how white button labels turned dark.
 */
const twMerge = extendTailwindMerge({
  extend: {
    classGroups: {
      'font-size': [
        { text: ['display', 'h1', 'h2', 'h3', 'h4', 'body-lg', 'body', 'body-sm', 'label'] },
      ],
    },
  },
})

export const cn = (...inputs: ClassValue[]) => twMerge(clsx(inputs))

/** EGP prices, formatted the way each locale expects. */
export const formatPrice = (amount: number | null | undefined, locale: string): string => {
  const value = typeof amount === 'number' ? amount : 0
  return new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: value % 1 === 0 ? 0 : 2,
  }).format(value)
}

export const formatNumber = (value: number, locale: string): string =>
  new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-US').format(value)

export const formatDate = (value: string | Date | null | undefined, locale: string): string => {
  if (!value) return '—'
  return new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-GB', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(new Date(value))
}

type MediaLike = number | Media | null | undefined

/**
 * Payload prefixes upload URLs with the configured serverURL. For media we host
 * ourselves that makes an absolute same-origin URL, which next/image treats as a
 * remote host and rejects unless it is whitelisted. Serving it as a relative
 * path is both correct and cheaper. Blob/S3 URLs point elsewhere and are left
 * untouched.
 */
const toSameOriginPath = (url: string): string => {
  const base = process.env.NEXT_PUBLIC_SERVER_URL
  if (base && url.startsWith(base)) return url.slice(base.length) || '/'
  // Any localhost origin is ours during development, whatever the port.
  return url.replace(/^https?:\/\/localhost(:\d+)?/, '')
}

/** Safe accessor for an upload relation that may be an id, an object, or missing. */
export const mediaUrl = (media: MediaLike, size?: 'thumbnail' | 'card' | 'tablet' | 'hero'): string | null => {
  if (!media || typeof media === 'number') return null
  if (size && media.sizes) {
    const sized = media.sizes[size]
    if (sized?.url) return toSameOriginPath(sized.url)
  }
  return media.url ? toSameOriginPath(media.url) : null
}

export const mediaAlt = (media: MediaLike): string => {
  if (!media || typeof media === 'number') return ''
  return media.alt ?? ''
}

/** Turns a relationship value into its id, whatever shape Payload returned. */
export const relId = (value: unknown): number | null => {
  if (typeof value === 'number') return value
  if (value && typeof value === 'object' && 'id' in value) return (value as { id: number }).id
  return null
}

export const isNumber = (value: unknown): value is number =>
  typeof value === 'number' && Number.isFinite(value)
