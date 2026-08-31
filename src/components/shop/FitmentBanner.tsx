'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { AlertTriangle, Car, CheckCircle2 } from 'lucide-react'
import { useGarage, carLabel } from '@/store/garage'
import { cn } from '@/lib/utils'

/**
 * Answers the only question that matters on a parts page — will this fit my
 * car? — before the customer has to work it out from a part number.
 */
export const FitmentBanner = ({ compatibleModelIds }: { compatibleModelIds: number[] }) => {
  const t = useTranslations('garage')
  const { car, openPicker } = useGarage()
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  const universal = compatibleModelIds.length === 0
  const fits = car ? compatibleModelIds.includes(car.modelId) : false

  const state = !car ? 'unknown' : universal ? 'universal' : fits ? 'fits' : 'unsure'

  const styles = {
    unknown: 'border-neutral-300 bg-neutral-100 text-neutral-700',
    universal: 'border-primary/25 bg-primary-light text-primary-dark',
    fits: 'border-success/30 bg-success-light text-success',
    unsure: 'border-warning/30 bg-warning-light text-warning',
  }[state]

  const Icon = state === 'fits' ? CheckCircle2 : state === 'unsure' ? AlertTriangle : Car

  return (
    <div className={cn('mt-6 flex items-center gap-3 rounded-xl border p-4', styles)}>
      <Icon className="size-5 shrink-0" />
      <p className="flex-1 text-body-sm font-medium">
        {state === 'unknown' ? t('selectCar') : null}
        {state === 'universal' ? t('universal') : null}
        {state === 'fits' ? `${t('fitsYourCar')} — ${carLabel(car)}` : null}
        {state === 'unsure' ? `${t('mayNotFit')} — ${carLabel(car)}` : null}
      </p>
      <button
        type="button"
        onClick={openPicker}
        className="shrink-0 text-body-sm font-semibold underline-offset-4 hover:underline"
      >
        {car ? t('orPick') : t('selectCar')}
      </button>
    </div>
  )
}
