'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Car, SlidersHorizontal } from 'lucide-react'
import { useGarage, carLabel } from '@/store/garage'
import { cn } from '@/lib/utils'

/**
 * Sits above every listing: says which car is selected and lets the customer
 * turn the fitment filter off. Without a car it is an invitation to pick one,
 * which is the single most useful thing a first-time visitor can do.
 */
export const FitmentBar = ({ className }: { className?: string }) => {
  const t = useTranslations('garage')
  const { car, fitmentOnly, setFitmentOnly, openPicker } = useGarage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  if (!car) {
    return (
      <motion.button
        type="button"
        onClick={openPicker}
        initial={{ opacity: 0, y: -6 }}
        animate={{ opacity: 1, y: 0 }}
        className={cn(
          'flex w-full items-center gap-3 rounded-[var(--radius-card)] border border-dashed border-primary/40 bg-primary-light/60 p-4 text-start transition-colors hover:border-primary hover:bg-primary-light',
          className,
        )}
      >
        <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-neutral-950">
          <Car className="size-5" />
        </span>
        <span className="flex-1">
          <span className="block font-semibold text-primary-dark">{t('selectCar')}</span>
          <span className="block text-body-sm text-neutral-600">{t('subtitle')}</span>
        </span>
        <SlidersHorizontal className="size-4 shrink-0 text-primary-dark" />
      </motion.button>
    )
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: -6 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-primary/25 bg-primary-light/60 p-4',
        className,
      )}
    >
      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary text-neutral-950">
        <Car className="size-5" />
      </span>

      <span className="min-w-0 flex-1">
        <span className="block text-label uppercase text-primary-dark">{t('shoppingFor')}</span>
        <span className="block truncate font-semibold text-neutral-950">{carLabel(car)}</span>
      </span>

      <button
        type="button"
        onClick={openPicker}
        className="rounded-full px-3 py-1.5 text-body-sm font-medium text-primary-dark underline-offset-4 hover:underline"
      >
        {t('orPick')}
      </button>

      {/* A switch, not a checkbox — bigger target, clearer state. */}
      <label className="flex cursor-pointer items-center gap-2.5 rounded-full bg-white px-3 py-2 ring-1 ring-neutral-200">
        <input
          type="checkbox"
          className="peer sr-only"
          checked={fitmentOnly}
          onChange={(event) => setFitmentOnly(event.target.checked)}
        />
        <span className="relative h-5 w-9 rounded-full bg-neutral-300 transition-colors peer-checked:bg-primary peer-focus-visible:ring-2 peer-focus-visible:ring-primary/40">
          <span className="absolute top-0.5 size-4 rounded-full bg-white transition-all ltr:left-0.5 ltr:peer-checked:left-4 rtl:right-0.5 rtl:peer-checked:right-4" />
        </span>
        <span className="text-body-sm font-medium text-neutral-700">{t('onlyFitting')}</span>
      </label>
    </motion.div>
  )
}
