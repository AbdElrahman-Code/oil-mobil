'use client'

import { useMemo, useState, useTransition } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { AnimatePresence, motion } from 'framer-motion'
import { ArrowLeft, ArrowRight, Car, Cog, Gauge, Loader2, Stethoscope } from 'lucide-react'
import type { VehicleBrand, VehicleModel } from '@/payload-types'
import type { Locale } from '@/i18n/routing'
import { listModels, recommendOil, type OilFinderResult } from '@/actions/oil-finder'
import { Button } from '@/components/ui/button'
import { Card, Input, Label, NativeSelect } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'
import { track } from '@/components/analytics/AnalyticsProvider'
import { OilFinderResultCard } from './OilFinderResultCard'
import { OilFinderLeadForm } from './OilFinderLeadForm'

const conditions = ['excellent', 'good', 'consumesOil', 'rebuilt'] as const
type Condition = (typeof conditions)[number]

const stepIcons = [Car, Cog, Gauge, Stethoscope]

export const OilFinderWizard = ({ brands }: { brands: VehicleBrand[] }) => {
  const locale = useLocale() as Locale
  const t = useTranslations('oilFinder')
  const tCommon = useTranslations('common')

  const [step, setStep] = useState(0)
  const [direction, setDirection] = useState(1)
  const [pending, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)

  const [brandId, setBrandId] = useState<number | null>(null)
  const [models, setModels] = useState<VehicleModel[]>([])
  const [modelId, setModelId] = useState<number | null>(null)
  const [year, setYear] = useState<number | null>(null)
  const [engineCode, setEngineCode] = useState<string>('')
  const [mileage, setMileage] = useState<string>('')
  const [condition, setCondition] = useState<Condition | ''>('')
  const [result, setResult] = useState<OilFinderResult | null>(null)

  const model = models.find((item) => item.id === modelId) ?? null
  const brand = brands.find((item) => item.id === brandId) ?? null

  const years = useMemo(() => {
    if (!model) return []
    const from = model.yearFrom ?? 1990
    const to = model.yearTo ?? new Date().getFullYear()
    return Array.from({ length: to - from + 1 }, (_, index) => to - index)
  }, [model])

  const stepLabels = [t('stepVehicle'), t('stepEngine'), t('stepMileage'), t('stepCondition')]

  const canContinue = [
    Boolean(brandId && modelId && year),
    Boolean(engineCode),
    true,
    true,
  ][step]

  const goTo = (next: number) => {
    setDirection(next > step ? 1 : -1)
    setStep(next)
  }

  const onBrandChange = (value: number) => {
    setBrandId(value)
    setModelId(null)
    setYear(null)
    setEngineCode('')
    startTransition(async () => {
      setModels(await listModels(value, locale))
    })
  }

  const submit = async () => {
    if (!modelId || !year || !engineCode) return
    setLoading(true)
    track('oil_finder_submitted', { brandId, modelId, year, engineCode, condition })

    const response = await recommendOil(
      {
        brandId: brandId as number,
        modelId,
        year,
        engineCode,
        mileageKm: mileage ? Number(mileage) : undefined,
        condition: condition || undefined,
      },
      locale,
    )

    setLoading(false)
    setResult(response)
    track('oil_finder_completed', { status: response.status })
  }

  if (result?.status === 'matched') {
    return (
      <OilFinderResultCard
        result={result}
        onReset={() => {
          setResult(null)
          setStep(0)
        }}
      />
    )
  }

  if (result?.status === 'noMatch') {
    return (
      <OilFinderLeadForm
        vehicleLabel={result.vehicleLabel}
        brandId={brandId}
        modelId={modelId}
        brandName={brand?.name}
        modelName={model?.name}
        year={year ?? undefined}
        engineLabel={model?.engines?.find((engine) => engine.code === engineCode)?.label}
        mileageKm={mileage ? Number(mileage) : undefined}
        condition={condition || undefined}
        onReset={() => {
          setResult(null)
          setStep(0)
        }}
      />
    )
  }

  const Arrow = locale === 'ar' ? ArrowLeft : ArrowRight
  const BackArrow = locale === 'ar' ? ArrowRight : ArrowLeft
  // Flip the travel axis so forward always moves "onward" in the reading order.
  const axis = locale === 'ar' ? -1 : 1

  return (
    <Card className="overflow-hidden">
      <ol className="flex border-b border-neutral-200" role="list">
        {stepLabels.map((label, index) => {
          const Icon = stepIcons[index]
          const done = index < step
          const active = index === step
          return (
            <li key={label} className="flex-1">
              <button
                type="button"
                onClick={() => index < step && goTo(index)}
                disabled={index > step}
                className={cn(
                  'flex w-full items-center justify-center gap-2 px-2 py-4 text-body-sm font-medium transition-colors sm:text-body-sm',
                  active && 'text-primary-600',
                  done && 'text-neutral-500 hover:text-neutral-900',
                  !active && !done && 'text-neutral-400',
                )}
                aria-current={active ? 'step' : undefined}
                aria-label={label}
              >
                <span
                  className={cn(
                    'grid size-7 place-items-center rounded-full transition-colors',
                    active ? 'bg-primary-500 text-white' : done ? 'bg-neutral-950 text-white' : 'bg-neutral-200 text-neutral-400',
                  )}
                >
                  <Icon className="size-3.5" />
                </span>
                <span className="hidden sm:inline">{label}</span>
              </button>
            </li>
          )
        })}
      </ol>

      <div className="relative min-h-[22rem] p-6 sm:p-8">
        <AnimatePresence mode="wait" initial={false} custom={direction}>
          <motion.div
            key={step}
            custom={direction}
            initial={{ opacity: 0, x: direction * axis * 32 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: direction * axis * -32 }}
            transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1] }}
          >
            {step === 0 ? (
              <div className="grid gap-5 sm:grid-cols-3">
                <div>
                  <Label htmlFor="of-brand">{t('brand')}</Label>
                  <NativeSelect
                    id="of-brand"
                    value={brandId ?? ''}
                    onChange={(event) => onBrandChange(Number(event.target.value))}
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
                  <Label htmlFor="of-model">{t('model')}</Label>
                  <NativeSelect
                    id="of-model"
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
                  <Label htmlFor="of-year">{t('year')}</Label>
                  <NativeSelect
                    id="of-year"
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
              </div>
            ) : null}

            {step === 1 ? (
              <fieldset>
                <legend className="mb-4 text-body-sm font-medium text-neutral-700">{t('engine')}</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {(model?.engines ?? []).map((engine) => (
                    <label
                      key={engine.code}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-body-sm transition-colors',
                        engineCode === engine.code
                          ? 'border-primary-500 bg-primary-50/60'
                          : 'border-neutral-300 hover:border-neutral-400',
                      )}
                    >
                      <input
                        type="radio"
                        name="engine"
                        className="sr-only"
                        value={engine.code}
                        checked={engineCode === engine.code}
                        onChange={() => setEngineCode(engine.code)}
                      />
                      <Cog className="size-5 text-primary-500" />
                      <span>
                        <span className="block font-medium text-neutral-900">{engine.label}</span>
                        <span className="text-body-sm text-neutral-400">
                          {engine.fuelType}
                          {engine.isTurbo ? ' · Turbo' : ''}
                        </span>
                      </span>
                    </label>
                  ))}
                </div>
              </fieldset>
            ) : null}

            {step === 2 ? (
              <div className="max-w-sm">
                <Label htmlFor="of-mileage">{t('mileage')}</Label>
                <Input
                  id="of-mileage"
                  type="number"
                  inputMode="numeric"
                  min={0}
                  placeholder="120000"
                  value={mileage}
                  onChange={(event) => setMileage(event.target.value)}
                />
                <p className="mt-2 text-body-sm text-neutral-400">{tCommon('optional')}</p>
              </div>
            ) : null}

            {step === 3 ? (
              <fieldset>
                <legend className="mb-4 text-body-sm font-medium text-neutral-700">{t('condition')}</legend>
                <div className="grid gap-3 sm:grid-cols-2">
                  {conditions.map((value) => (
                    <label
                      key={value}
                      className={cn(
                        'flex cursor-pointer items-center gap-3 rounded-xl border p-4 text-body-sm transition-colors',
                        condition === value
                          ? 'border-primary-500 bg-primary-50/60'
                          : 'border-neutral-300 hover:border-neutral-400',
                      )}
                    >
                      <input
                        type="radio"
                        name="condition"
                        className="sr-only"
                        value={value}
                        checked={condition === value}
                        onChange={() => setCondition(value)}
                      />
                      <Stethoscope className="size-5 text-primary-500" />
                      {t(
                        `condition${value.charAt(0).toUpperCase()}${value.slice(1)}` as
                          | 'conditionExcellent'
                          | 'conditionGood'
                          | 'conditionConsumesOil'
                          | 'conditionRebuilt',
                      )}
                    </label>
                  ))}
                </div>
                <p className="mt-3 text-body-sm text-neutral-400">{tCommon('optional')}</p>
              </fieldset>
            ) : null}
          </motion.div>
        </AnimatePresence>
      </div>

      <div className="flex items-center justify-between gap-3 border-t border-neutral-200 p-6">
        <Button
          type="button"
          variant="ghost"
          onClick={() => goTo(Math.max(0, step - 1))}
          disabled={step === 0}
        >
          <BackArrow className="size-4" />
          {tCommon('back')}
        </Button>

        {step < 3 ? (
          <Button type="button" onClick={() => goTo(step + 1)} disabled={!canContinue}>
            {tCommon('next')}
            <Arrow className="size-4" />
          </Button>
        ) : (
          <Button type="button" size="lg" variant="accent" onClick={submit} disabled={loading}>
            {loading ? <Loader2 className="size-4 animate-spin" /> : null}
            {t('getResult')}
          </Button>
        )}
      </div>
    </Card>
  )
}
