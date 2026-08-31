'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { Car, ChevronDown, X } from 'lucide-react'
import { useGarage, carLabel } from '@/store/garage'
import { cn } from '@/lib/utils'

/**
 * The shop's most important control: which car am I shopping for. Reads as a
 * plain sentence rather than a filter, so it makes sense to someone who has
 * never used a parts site before.
 */
export const GarageButton = ({ compact = false }: { compact?: boolean }) => {
  const t = useTranslations('garage')
  const { car, openPicker, clear } = useGarage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  const selected = mounted ? car : null

  return (
    <div className="flex items-center gap-1">
      <button
        type="button"
        onClick={openPicker}
        className={cn(
          'flex items-center gap-2 rounded-full border px-3 py-2 text-body-sm font-medium transition-colors',
          selected
            ? 'border-primary/30 bg-primary-light text-primary-dark hover:border-primary'
            : 'border-neutral-300 text-neutral-700 hover:border-primary hover:bg-primary-light hover:text-primary-dark',
          compact && 'w-full justify-between',
        )}
      >
        <Car className="size-4 shrink-0" />
        <span className={cn('truncate', !compact && 'hidden max-w-44 sm:inline')}>
          {selected ? carLabel(selected) : t('selectCar')}
        </span>
        <ChevronDown className="size-3.5 shrink-0 opacity-60" />
      </button>

      {selected ? (
        <button
          type="button"
          onClick={clear}
          className="hidden rounded-full p-1.5 text-neutral-400 transition-colors hover:bg-neutral-100 hover:text-neutral-700 sm:block"
          aria-label={t('clearCar')}
          title={t('clearCar')}
        >
          <X className="size-4" />
        </button>
      ) : null}
    </div>
  )
}
