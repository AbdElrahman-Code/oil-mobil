'use client'

import { motion } from 'framer-motion'
import { Facebook, Instagram, Linkedin, MapPin, Music2, Youtube } from 'lucide-react'
import { useTranslations } from 'next-intl'

export type SocialItem = { platform: string; url: string }

const icons: Record<string, typeof Instagram> = {
  instagram: Instagram,
  facebook: Facebook,
  youtube: Youtube,
  linkedin: Linkedin,
  tiktok: Music2,
  x: Music2,
}

/** Brand colours, so each icon is recognisable at a glance. */
const hover: Record<string, string> = {
  instagram: 'hover:bg-[#E1306C]',
  facebook: 'hover:bg-[#1877F2]',
  youtube: 'hover:bg-[#FF0000]',
  linkedin: 'hover:bg-[#0A66C2]',
  tiktok: 'hover:bg-[#010101]',
  x: 'hover:bg-[#010101]',
  location: 'hover:bg-primary',
}

/**
 * Fixed rail down the side of the page: social profiles and directions, always
 * one click away. Each button widens on hover to reveal its label, so nothing
 * depends on recognising an icon.
 */
export const FloatingSocial = ({
  socials,
  mapUrl,
}: {
  socials: SocialItem[]
  mapUrl?: string | null
}) => {
  const t = useTranslations('footer')

  const items = [
    ...socials.map((social) => ({
      key: social.platform,
      label: social.platform.charAt(0).toUpperCase() + social.platform.slice(1),
      href: social.url,
      Icon: icons[social.platform] ?? Instagram,
    })),
    ...(mapUrl
      ? [{ key: 'location', label: t('branches'), href: mapUrl, Icon: MapPin }]
      : []),
  ]

  if (!items.length) return null

  return (
    <motion.aside
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: 0.6, duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
      // Hidden on small screens: a fixed rail would sit on top of the content.
      className="fixed start-0 top-1/2 z-30 hidden -translate-y-1/2 flex-col gap-2 ps-3 lg:flex"
      aria-label="Social links"
    >
      {items.map(({ key, label, href, Icon }) => (
        <a
          key={key}
          href={href}
          target="_blank"
          rel="noreferrer noopener"
          title={label}
          className={`group flex h-11 items-center gap-3 overflow-hidden rounded-full bg-white ps-3 pe-3 text-neutral-600 shadow-[var(--shadow-card)] ring-1 ring-neutral-200 transition-all duration-300 ease-[var(--ease-out-expo)] hover:text-white hover:shadow-[var(--shadow-lift)] ${hover[key] ?? 'hover:bg-primary'}`}
        >
          <Icon className="size-5 shrink-0" />
          <span className="max-w-0 whitespace-nowrap text-body-sm font-medium opacity-0 transition-all duration-300 ease-[var(--ease-out-expo)] group-hover:max-w-32 group-hover:opacity-100">
            {label}
          </span>
        </a>
      ))}
    </motion.aside>
  )
}
