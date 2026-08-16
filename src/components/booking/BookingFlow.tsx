'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { addDays, format } from 'date-fns'
import { useLocale, useTranslations } from 'next-intl'
import { AnimatePresence, motion } from 'framer-motion'
import { CalendarDays, CheckCircle2, Clock, Loader2, Sparkles } from 'lucide-react'
import type { WashService } from '@/payload-types'
import { createBooking, getAvailableSlots, type Slot } from '@/actions/bookings'
import { Button } from '@/components/ui/button'
import { Badge, Card, FieldError, Input, Label, Textarea } from '@/components/ui/primitives'
import { cn, formatPrice, mediaUrl } from '@/lib/utils'
import { track } from '@/components/analytics/AnalyticsProvider'

const DAYS_AHEAD = 14

export const BookingFlow = ({ services }: { services: WashService[] }) => {
  const locale = useLocale()
  const t = useTranslations('booking')
  const tCommon = useTranslations('common')

  const [serviceId, setServiceId] = useState<number | null>(services[0]?.id ?? null)
  const [date, setDate] = useState<string>(format(new Date(), 'yyyy-MM-dd'))
  const [slots, setSlots] = useState<Slot[]>([])
  const [slotsLoading, setSlotsLoading] = useState(false)
  const [time, setTime] = useState<string>('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [plate, setPlate] = useState('')
  const [note, setNote] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [reference, setReference] = useState<string | null>(null)

  const service = services.find((item) => item.id === serviceId) ?? null

  useEffect(() => {
    let cancelled = false
    setSlotsLoading(true)
    setTime('')
    getAvailableSlots(date, serviceId ?? undefined).then((result) => {
      if (cancelled) return
      setSlots(result)
      setSlotsLoading(false)
    })
    return () => {
      cancelled = true
    }
  }, [date, serviceId])

  const days = Array.from({ length: DAYS_AHEAD }, (_, index) => addDays(new Date(), index))

  const submit = async (event: React.FormEvent) => {
    event.preventDefault()
    if (!serviceId || !time) return
    setSubmitting(true)
    setError(null)

    const result = await createBooking({
      serviceId,
      date,
      timeSlot: time,
      contactName: name,
      contactPhone: phone,
      plateNumber: plate || undefined,
      note: note || undefined,
    })

    setSubmitting(false)
    if (result.ok) {
      track('booking_created', { serviceId, date, time })
      setReference(result.reference)
    } else {
      setError(result.error)
      if (result.error === 'slotTaken') {
        setSlots(await getAvailableSlots(date, serviceId))
      }
    }
  }

  if (reference) {
    return (
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <Card className="p-10 text-center">
          <CheckCircle2 className="mx-auto mb-4 size-14 text-success" />
          <h2 className="text-h2">{t('successTitle')}</h2>
          <p className="mt-3 text-neutral-500">{t('successBody', { reference })}</p>
        </Card>
      </motion.div>
    )
  }

  return (
    <form onSubmit={submit} className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-8">
        <section>
          <h2 className="mb-4 text-h4 font-semibold">{t('selectService')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            {services.map((item) => {
              const image = mediaUrl(item.image, 'card')
              const active = serviceId === item.id
              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => setServiceId(item.id)}
                  className={cn(
                    'group overflow-hidden rounded-[var(--radius-card)] border text-start transition-all',
                    active
                      ? 'border-primary-500 shadow-[var(--shadow-card)]'
                      : 'border-neutral-200 hover:border-neutral-400',
                  )}
                  aria-pressed={active}
                >
                  <div className="relative aspect-[16/9] bg-neutral-100">
                    {image ? (
                      <Image src={image} alt={item.name} fill sizes="(max-width:640px) 100vw, 33vw" className="object-cover" />
                    ) : (
                      <div className="grid h-full place-items-center text-neutral-200">
                        <Sparkles className="size-8" />
                      </div>
                    )}
                    {item.isPopular ? (
                      <Badge tone="accent" className="absolute start-3 top-3">
                        {t('popular')}
                      </Badge>
                    ) : null}
                  </div>
                  <div className="p-4">
                    <div className="flex items-baseline justify-between gap-3">
                      <h3 className="font-semibold text-neutral-950">{item.name}</h3>
                      <span className="font-bold text-primary-600">{formatPrice(item.price, locale)}</span>
                    </div>
                    {item.description ? (
                      <p className="mt-1.5 line-clamp-2 text-body-sm text-neutral-400">{item.description}</p>
                    ) : null}
                    <p className="mt-3 flex items-center gap-1.5 text-body-sm text-neutral-400">
                      <Clock className="size-3.5" />
                      {t('duration', { minutes: item.durationMinutes ?? 0 })}
                    </p>
                    {item.includes?.length ? (
                      <ul className="mt-3 space-y-1 text-body-sm text-neutral-500">
                        {item.includes.slice(0, 3).map((entry) => (
                          <li key={entry.id ?? entry.item}>• {entry.item}</li>
                        ))}
                      </ul>
                    ) : null}
                  </div>
                </button>
              )
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-h4 font-semibold">{t('selectDate')}</h2>
          <div className="flex gap-2 overflow-x-auto pb-2 no-scrollbar">
            {days.map((day) => {
              const value = format(day, 'yyyy-MM-dd')
              const active = value === date
              return (
                <button
                  key={value}
                  type="button"
                  onClick={() => setDate(value)}
                  className={cn(
                    'flex min-w-16 flex-col items-center gap-1 rounded-2xl border px-3 py-3 text-body-sm transition-colors',
                    active
                      ? 'border-primary-500 bg-primary-500 text-white'
                      : 'border-neutral-300 text-neutral-600 hover:border-neutral-400',
                  )}
                  aria-pressed={active}
                >
                  <span className="text-label uppercase opacity-70">
                    {new Intl.DateTimeFormat(locale === 'ar' ? 'ar-EG' : 'en-GB', { weekday: 'short' }).format(day)}
                  </span>
                  <span className="text-h4 font-semibold tabular-nums">{format(day, 'd')}</span>
                </button>
              )
            })}
          </div>
        </section>

        <section>
          <h2 className="mb-4 text-h4 font-semibold">{t('selectTime')}</h2>
          <AnimatePresence mode="wait">
            {slotsLoading ? (
              <motion.p key="loading" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex items-center gap-2 text-body-sm text-neutral-400">
                <Loader2 className="size-4 animate-spin" />
                {tCommon('loading')}
              </motion.p>
            ) : slots.length === 0 ? (
              <motion.p key="none" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-body-sm text-neutral-400">
                {t('closedDay')}
              </motion.p>
            ) : slots.every((slot) => !slot.available) ? (
              <motion.p key="full" initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-body-sm text-neutral-400">
                {t('noSlots')}
              </motion.p>
            ) : (
              <motion.div
                key="slots"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className="grid grid-cols-3 gap-2 sm:grid-cols-5 lg:grid-cols-6"
              >
                {slots.map((slot) => (
                  <button
                    key={slot.time}
                    type="button"
                    disabled={!slot.available}
                    onClick={() => setTime(slot.time)}
                    className={cn(
                      'rounded-xl border py-2.5 text-body-sm font-medium tabular-nums transition-colors',
                      time === slot.time
                        ? 'border-primary-500 bg-primary-500 text-white'
                        : slot.available
                          ? 'border-neutral-300 text-neutral-700 hover:border-neutral-500'
                          : 'cursor-not-allowed border-neutral-200 text-neutral-200 line-through',
                    )}
                    dir="ltr"
                  >
                    {slot.time}
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </section>
      </div>

      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <Card className="p-6">
          <h2 className="mb-5 text-h4 font-semibold">{t('yourDetails')}</h2>

          <div className="space-y-4">
            <div>
              <Label htmlFor="bk-name">{tCommon('name')}</Label>
              <Input id="bk-name" required minLength={2} value={name} onChange={(event) => setName(event.target.value)} />
            </div>
            <div>
              <Label htmlFor="bk-phone">{tCommon('phone')}</Label>
              <Input
                id="bk-phone"
                required
                inputMode="tel"
                dir="ltr"
                placeholder="01012345678"
                value={phone}
                onChange={(event) => setPhone(event.target.value)}
              />
            </div>
            <div>
              <Label htmlFor="bk-plate">
                {locale === 'ar' ? 'رقم اللوحة' : 'Plate number'} ({tCommon('optional')})
              </Label>
              <Input id="bk-plate" value={plate} onChange={(event) => setPlate(event.target.value)} />
            </div>
            <div>
              <Label htmlFor="bk-note">{tCommon('notes')}</Label>
              <Textarea id="bk-note" value={note} onChange={(event) => setNote(event.target.value)} />
            </div>
          </div>

          <dl className="mt-6 space-y-2 border-t border-neutral-200 pt-4 text-body-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-500">{t('selectService')}</dt>
              <dd className="font-medium">{service?.name ?? '—'}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">
                <CalendarDays className="me-1 inline size-3.5" />
                {t('selectDate')}
              </dt>
              <dd className="font-medium tabular-nums" dir="ltr">
                {date} {time}
              </dd>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-3 text-body font-semibold">
              <dt>{tCommon('from')}</dt>
              <dd>{formatPrice(service?.price ?? 0, locale)}</dd>
            </div>
          </dl>

          <FieldError>
            {error === 'slotTaken'
              ? t('noSlots')
              : error
                ? tCommon('error')
                : null}
          </FieldError>

          <Button type="submit" size="lg" variant="accent" block className="mt-5" disabled={submitting || !time}>
            {submitting ? <Loader2 className="size-4 animate-spin" /> : null}
            {t('confirm')}
          </Button>
        </Card>
      </aside>
    </form>
  )
}
