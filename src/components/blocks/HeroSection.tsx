'use client'

import Image from 'next/image'
import { motion } from 'framer-motion'
import { ArrowLeft, ArrowRight } from 'lucide-react'
import { useLocale } from 'next-intl'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'

export type HeroProps = {
  eyebrow?: string | null
  headline: string
  subheadline?: string | null
  imageUrl?: string | null
  imageAlt?: string
  buttons?: { id?: string | null; label: string; href: string; style?: string | null }[]
}

export const HeroSection = ({ eyebrow, headline, subheadline, imageUrl, imageAlt, buttons }: HeroProps) => {
  const locale = useLocale()
  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight

  return (
    <section className="surface-dark relative isolate overflow-hidden">
      {imageUrl ? (
        <>
          <Image
            src={imageUrl}
            alt={imageAlt ?? ''}
            fill
            priority
            sizes="100vw"
            className="-z-10 object-cover opacity-45"
          />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-neutral-950 via-neutral-950/70 to-neutral-950/30" />
        </>
      ) : null}

      <div className="container-page relative flex min-h-[68svh] flex-col justify-center py-16 sm:min-h-[76svh] sm:py-20 lg:min-h-[86svh] lg:py-28">
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
          className="max-w-3xl"
        >
          {eyebrow ? (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.1, duration: 0.6 }}
              className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-label font-semibold uppercase tracking-[0.18em] text-primary-300 backdrop-blur"
            >
              <span className="size-1.5 rounded-full bg-primary-400" />
              {eyebrow}
            </motion.p>
          ) : null}

          <h1 className="text-h2 leading-[1.08] text-white sm:text-h1 lg:text-display">
            {headline}
          </h1>

          {subheadline ? (
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.18, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mt-6 max-w-xl text-body leading-relaxed text-neutral-200 sm:text-h4"
            >
              {subheadline}
            </motion.p>
          ) : null}

          {buttons?.length ? (
            <motion.div
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.28, duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
              className="mt-9 flex flex-wrap gap-3"
            >
              {buttons.map((button, index) => (
                <Button
                  key={button.id ?? `${button.href}-${index}`}
                  asChild
                  size="lg"
                  variant={button.style === 'outline' ? 'outlineInverted' : 'primary'}
                >
                  <Link href={button.href}>
                    {button.label}
                    <Arrow className="size-4" />
                  </Link>
                </Button>
              ))}
            </motion.div>
          ) : null}
        </motion.div>
      </div>

      <div className="pointer-events-none absolute inset-x-0 bottom-0 h-24 bg-gradient-to-t from-[var(--surface)] to-transparent" />
    </section>
  )
}
