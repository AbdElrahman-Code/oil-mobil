'use client'

import { useEffect, useState, useTransition } from 'react'
import { createPortal } from 'react-dom'
import { useLocale, useTranslations } from 'next-intl'
import { AnimatePresence, motion } from 'framer-motion'
import { Car, Check, Loader2, X } from 'lucide-react'
import type { Locale } from '@/i18n/routing'
import type { VehicleBrand, VehicleModel } from '@/payload-types'
import { getMyCars, listModels, saveCarToGarage, type GarageCar } from '@/actions/garage'
import { useGarage } from '@/store/garage'
import { Button } from '@/components/ui/button'
import { Label, NativeSelect } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'
import { track } from '@/components/analytics/AnalyticsProvider'

/**
 * Four plain questions — brand, model, year, engine — and the whole shop starts
 * answering "does this fit my car?". Signed-in customers skip straight to the
 * cars already in their garage.
 */
export const CarPicker = ({ brands }: { brands: VehicleBrand[] }) => {
  const locale = useLocale() as Locale
  const t = useTranslations('garage')
  const tCommon = useTranslations('common')

  const { pickerOpen, closePicker, select } = useGarage()
  const [mounted, setMounted] = useState(false)
  const [pending, startTransition] = useTransition()

  const [myCars, setMyCars] = useState<GarageCar[]>([])
  const [brandId, setBrandId] = useState<number | null>(null)
  const [models, setModels] = useState<VehicleModel[]>([])
  const [modelId, setModelId] = useState<number | null>(null)
  const [year, setYear] = useState<number | null>(null)
  const [engineCode, setEngineCode] = useState('')
  const [saving, setSaving] = useState(false)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!pickerOpen) return
    document.body.style.overflow = 'hidden'
    getMyCars(locale).then(setMyCars)
    return () => {
      document.body.style.overflow = ''
    }
  }, [pickerOpen, locale])

  const model = models.find((item) => item.id === modelId) ?? null
  const brand = brands.find((item) => item.id === brandId) ?? null

  const years = (() => {
    if (!model) return []
    const from = model.yearFrom ?? 1990
    const to = model.yearTo ?? new Date().getFullYear()
    return Array.from({ length: to - from + 1 }, (_, index) => to - index)
  })()

  const engines = model?.engines ?? []
  const ready = Boolean(brandId && modelId && year)

  const confirm = async () => {
    if (!ready || !brand || !model) return
    setSaving(true)
    const engine = engines.find((item) => item.code === engineCode)

    select({
      brandId: brand.id,
      brandName: locale === 'ar' && brand.nameAr ? brand.nameAr : brand.name,
      modelId: model.id,
      modelName: locale === 'ar' && model.nameAr ? model.nameAr : model.name,
      year: year as number,
      engineCode: engineCode || null,
      engineLabel: engine?.label ?? null,
    })
    track('garage_car_selected', { brandId: brand.id, modelId: model.id, year })

    // Saves silently for signed-in customers; guests simply keep it on device.
    await saveCarToGarage({
      brandId: brand.id,
      modelId: model.id,
      year: year as number,
      engineCode: engineCode || null,
    })
    setSaving(false)
  }

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {pickerOpen ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[80] grid place-items-end bg-neutral-950/60 backdrop-blur-sm sm:place-items-center sm:p-6"
          onClick={closePicker}
        >
          <motion.div
            initial={{ y: '100%', opacity: 0.6 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ y: '100%', opacity: 0.6 }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={t('title')}
            className="w-full max-w-xl rounded-t-[2rem] bg-white p-6 sm:rounded-[var(--radius-card)] sm:p-8"
          >
            <div className="mb-6 flex items-start justify-between gap-4">
              <div>
                <h2 className="text-h3">{t('title')}</h2>
                <p className="mt-1 text-body-sm text-neutral-500">{t('subtitle')}</p>
              </div>
              <button
                type="button"
                onClick={closePicker}
                className="rounded-full p-2 text-neutral-400 transition-colors hover:bg-neutral-100"
                aria-label={tCommon('close')}
              >
                <X className="size-5" />
              </button>
            </div>

            {myCars.length ? (
              <div className="mb-6">
                <p className="mb-2 text-label uppercase text-neutral-400">{t('myCars')}</p>
                <div className="flex flex-col gap-2">
                  {myCars.map((car) => (
                    <button
                      key={car.vehicleId}
                      type="button"
                      onClick={() => {
                        select(car)
                        track('garage_car_selected', { source: 'saved' })
                      }}
                      className="flex items-center gap-3 rounded-xl border border-neutral-200 p-3 text-start transition-colors hover:border-primary hover:bg-primary-light"
                    >
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-primary-light text-primary-dark">
                        <Car className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block truncate font-medium">
                          {[car.year, car.brandName, car.modelName].filter(Boolean).join(' ')}
                        </span>
                        {car.plateNumber && !car.plateNumber.startsWith('TMP-') ? (
                          <span className="block text-body-sm text-neutral-400">{car.plateNumber}</span>
                        ) : null}
                      </span>
                      <Check className="size-4 text-primary-dark opacity-0 transition-opacity group-hover:opacity-100" />
                    </button>
                  ))}
                </div>
                <p className="mt-4 text-label uppercase text-neutral-400">{t('orPick')}</p>
              </div>
            ) : null}

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <Label htmlFor="garage-brand">{t('brand')}</Label>
                <NativeSelect
                  id="garage-brand"
                  value={brandId ?? ''}
                  onChange={(event) => {
                    const value = Number(event.target.value)
                    setBrandId(value)
                    setModelId(null)
                    setYear(null)
                    setEngineCode('')
                    startTransition(async () => setModels(await listModels(value, locale)))
                  }}
                >
                  <option value="">{tCommon('selectPlaceholder')}</option>
                  {brands.map((item) => (
                    <option key={item.id} value={item.id}>
                      {locale === 'ar' && item.nameAr ? item.nameAr : item.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div>
                <Label htmlFor="garage-model">{t('model')}</Label>
                <NativeSelect
                  id="garage-model"
                  value={modelId ?? ''}
                  disabled={!brandId || pending}
                  onChange={(event) => {
                    setModelId(Number(event.target.value))
                    setYear(null)
                    setEngineCode('')
                  }}
                >
                  <option value="">{pending ? tCommon('loading') : tCommon('selectPlaceholder')}</option>
                  {models.map((item) => (
                    <option key={item.id} value={item.id}>
                      {locale === 'ar' && item.nameAr ? item.nameAr : item.name}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div>
                <Label htmlFor="garage-year">{t('year')}</Label>
                <NativeSelect
                  id="garage-year"
                  value={year ?? ''}
                  disabled={!modelId}
                  onChange={(event) => setYear(Number(event.target.value))}
                >
                  <option value="">{tCommon('selectPlaceholder')}</option>
                  {years.map((value) => (
                    <option key={value} value={value}>
                      {value}
                    </option>
                  ))}
                </NativeSelect>
              </div>

              <div>
                <Label htmlFor="garage-engine">
                  {t('engine')} <span className="font-normal text-neutral-400">({tCommon('optional')})</span>
                </Label>
                <NativeSelect
                  id="garage-engine"
                  value={engineCode}
                  disabled={!modelId}
                  onChange={(event) => setEngineCode(event.target.value)}
                >
                  <option value="">{tCommon('selectPlaceholder')}</option>
                  {engines.map((engine) => (
                    <option key={engine.code} value={engine.code}>
                      {engine.label}
                    </option>
                  ))}
                </NativeSelect>
              </div>
            </div>

            <div className={cn('mt-7 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end')}>
              <Button variant="ghost" onClick={closePicker}>
                {tCommon('cancel')}
              </Button>
              <Button onClick={confirm} disabled={!ready || saving} size="lg">
                {saving ? <Loader2 className="size-4 animate-spin" /> : <Car className="size-4" />}
                {t('useThisCar')}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}
