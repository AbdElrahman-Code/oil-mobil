'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { CheckCircle2, Loader2, PhoneCall, RotateCcw } from 'lucide-react'
import { submitOilLead } from '@/actions/oil-finder'
import { Button } from '@/components/ui/button'
import { Card, FieldError, Input, Label } from '@/components/ui/primitives'
import { track } from '@/components/analytics/AnalyticsProvider'

/** The graceful fallback: no dead end, and the shop gets a lead it can act on. */
export const OilFinderLeadForm = ({
  vehicleLabel,
  brandId,
  modelId,
  brandName,
  modelName,
  year,
  engineLabel,
  mileageKm,
  condition,
  onReset,
}: {
  vehicleLabel: string
  brandId: number | null
  modelId: number | null
  brandName?: string
  modelName?: string
  year?: number
  engineLabel?: string
  mileageKm?: number
  condition?: 'excellent' | 'good' | 'consumesOil' | 'rebuilt'
  onReset: () => void
}) => {
  const t = useTranslations('oilFinder')
  const tCommon = useTranslations('common')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sending, setSending] = useState(false)
  const [sent, setSent] = useState(false)

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    setSending(true)
    setError(null)

    const result = await submitOilLead({
      brandId: brandId ?? undefined,
      modelId: modelId ?? undefined,
      brandName,
      modelName,
      year,
      engineLabel,
      mileageKm,
      condition,
      contactName: name,
      contactPhone: phone,
    })

    setSending(false)
    if (result.ok) {
      track('oil_finder_lead_submitted', { brandId, modelId, year })
      setSent(true)
    } else {
      setError(result.error ?? 'serverError')
    }
  }

  if (sent) {
    return (
      <Card className="p-10 text-center">
        <CheckCircle2 className="mx-auto mb-4 size-12 text-success" />
        <p className="text-h4 font-medium">{t('leadSent')}</p>
        <Button variant="outline" className="mt-6" onClick={onReset}>
          <RotateCcw className="size-4" />
          {t('startOver')}
        </Button>
      </Card>
    )
  }

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}>
      <Card className="p-6 sm:p-8">
        <div className="mb-6 flex items-start gap-4">
          <div className="grid size-12 shrink-0 place-items-center rounded-2xl bg-primary-50 text-primary-600">
            <PhoneCall className="size-5" />
          </div>
          <div>
            <h2 className="text-h3">{t('noMatchTitle')}</h2>
            <p className="mt-2 text-body-sm leading-relaxed text-neutral-500">{t('noMatchBody')}</p>
            <p className="mt-2 text-body-sm font-medium text-neutral-700">{vehicleLabel}</p>
          </div>
        </div>

        <form onSubmit={submit} className="grid gap-4 sm:grid-cols-2">
          <div>
            <Label htmlFor="lead-name">{tCommon('name')}</Label>
            <Input
              id="lead-name"
              required
              minLength={2}
              value={name}
              onChange={(event) => setName(event.target.value)}
            />
          </div>
          <div>
            <Label htmlFor="lead-phone">{tCommon('phone')}</Label>
            <Input
              id="lead-phone"
              required
              inputMode="tel"
              dir="ltr"
              placeholder="01012345678"
              value={phone}
              onChange={(event) => setPhone(event.target.value)}
            />
            <FieldError>{error ? tCommon('error') : null}</FieldError>
          </div>
          <div className="sm:col-span-2">
            <Button type="submit" size="lg" disabled={sending}>
              {sending ? <Loader2 className="size-4 animate-spin" /> : null}
              {t('leaveNumber')}
            </Button>
          </div>
        </form>
      </Card>
    </motion.div>
  )
}
