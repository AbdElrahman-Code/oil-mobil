'use client'

import { useEffect, useState, useTransition } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { useLocale, useTranslations } from 'next-intl'
import { Car, Check, ImageOff, LogIn, ShoppingBag, Sparkles, X } from 'lucide-react'
import { toast } from 'sonner'
import { Link } from '@/i18n/routing'
import type { Locale } from '@/i18n/routing'
import { getCarRecommendations, type AdvisorPick, type AdvisorResult } from '@/actions/advisor'
import { isSignedIn } from '@/actions/auth'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/primitives'
import { track } from '@/components/analytics/AnalyticsProvider'
import { cn, formatPrice } from '@/lib/utils'
import { useCart } from '@/store/cart'
import { useGarage, carLabel } from '@/store/garage'

/**
 * Floating "What should I buy for my car?" — the home-page entry to the AI
 * advisor. Guests are asked to sign in first; a signed-in customer picks a car
 * (or uses the one already selected), taps a question and gets a short list of
 * fitting parts with a reason for each, ready to add to the cart.
 */
export const CarAdvisor = () => {
  const t = useTranslations('advisor')
  const locale = useLocale() as Locale
  const { car, openPicker, pickerOpen } = useGarage()
  const addToCart = useCart((state) => state.add)
  const [open, setOpen] = useState(false)
  const [mounted, setMounted] = useState(false)
  const [signedIn, setSignedIn] = useState<boolean | null>(null)
  const [question, setQuestion] = useState<string>('')
  const [result, setResult] = useState<AdvisorResult | null>(null)
  const [pending, startTransition] = useTransition()

  useEffect(() => setMounted(true), [])

  // Only asked once the sheet opens, so the home page stays static and cached.
  useEffect(() => {
    if (!open || signedIn !== null) return
    isSignedIn().then(setSignedIn).catch(() => setSignedIn(false))
  }, [open, signedIn])
  const selectedCar = mounted ? car : null

  // Keep the page still while the sheet is open.
  useEffect(() => {
    if (!open) return
    const previous = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    return () => {
      document.body.style.overflow = previous
    }
  }, [open])

  const prompts: { key: string; label: string }[] = [
    { key: 'everything', label: t('promptEverything') },
    { key: 'oilChange', label: t('promptOilChange') },
    { key: 'brakes', label: t('promptBrakes') },
    { key: 'summer', label: t('promptSummer') },
    { key: 'care', label: t('promptCare') },
  ]

  const ask = (chosen: string) => {
    if (!selectedCar) {
      openPicker()
      return
    }
    setQuestion(chosen)
    setResult(null)
    track('advisor_ask', { prompt: chosen })
    startTransition(async () => {
      const response = await getCarRecommendations({ locale, car: selectedCar, question: chosen })
      setResult(response)
    })
  }

  const add = (pick: AdvisorPick) => {
    addToCart({
      productId: pick.productId,
      name: pick.name,
      slug: pick.slug,
      price: pick.price,
      image: pick.image,
      maxQuantity: pick.maxQuantity ?? undefined,
    })
    toast.success(t('added'))
  }

  const priorityTone = { now: 'danger', soon: 'warning', nice: 'primary' } as const

  return (
    <>
      {/* Launcher — sits opposite the WhatsApp button, above the mobile tab bar. */}
      <motion.button
        type="button"
        onClick={() => {
          setOpen(true)
          track('advisor_open')
        }}
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6, type: 'spring', damping: 16, stiffness: 200 }}
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.96 }}
        className={cn(
          'fixed bottom-24 end-4 z-40 flex items-center gap-2 rounded-full bg-neutral-950 py-3 pe-5 ps-3 text-white shadow-[0_14px_36px_-10px_rgb(11_14_20/0.7)] ring-1 ring-white/10 lg:bottom-6 lg:end-6',
          (open || pickerOpen) && 'pointer-events-none opacity-0',
        )}
        aria-label={t('launcher')}
      >
        <span className="grid size-9 place-items-center rounded-full bg-primary text-neutral-950">
          <Sparkles className="size-5" />
        </span>
        <span className="text-start leading-tight">
          <span className="block text-label font-semibold uppercase tracking-wide text-primary-300">{t('kicker')}</span>
          <span className="block text-body-sm font-semibold">{t('launcher')}</span>
        </span>
      </motion.button>

      <AnimatePresence>
        {open ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-50 bg-neutral-950/50 backdrop-blur-sm"
            />
            <motion.section
              role="dialog"
              aria-modal="true"
              aria-labelledby="advisor-title"
              initial={{ y: '100%' }}
              animate={{ y: 0 }}
              exit={{ y: '100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-x-0 bottom-0 z-50 mx-auto flex max-h-[92dvh] w-full max-w-2xl flex-col rounded-t-[2rem] bg-white shadow-[var(--shadow-lift)] lg:bottom-6 lg:rounded-[2rem]"
            >
              <header className="surface-dark flex items-start gap-3 rounded-t-[2rem] px-5 pb-5 pt-6 text-white">
                <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary text-neutral-950">
                  <Sparkles className="size-6" />
                </span>
                <div className="min-w-0 flex-1">
                  <h2 id="advisor-title" className="text-h4 font-bold">
                    {t('title')}
                  </h2>
                  <p className="mt-1 text-body-sm text-neutral-300">{t('subtitle')}</p>
                </div>
                <button
                  type="button"
                  onClick={() => setOpen(false)}
                  className="-me-2 -mt-1 rounded-full p-2 text-neutral-300 transition-colors hover:bg-white/10 hover:text-white"
                  aria-label={t('close')}
                >
                  <X className="size-5" />
                </button>
              </header>

              <div className="flex-1 overflow-y-auto px-5 py-5">
                {signedIn === null ? (
                  <div className="h-40 animate-pulse rounded-[var(--radius-card)] bg-neutral-100" />
                ) : !signedIn ? (
                  <div className="rounded-[var(--radius-card)] border border-neutral-200 bg-neutral-50 p-5 text-center">
                    <span className="mx-auto grid size-12 place-items-center rounded-full bg-primary-light text-primary-dark">
                      <LogIn className="size-6" />
                    </span>
                    <h3 className="mt-4 text-h4 font-bold text-neutral-950">{t('signInTitle')}</h3>
                    <p className="mt-2 text-body-sm text-neutral-600">{t('signInBody')}</p>
                    <div className="mt-5 flex flex-col gap-2 sm:flex-row sm:justify-center">
                      <Button asChild variant="primary">
                        <Link href="/account/login">{t('signIn')}</Link>
                      </Button>
                      <Button asChild variant="outline">
                        <Link href="/account/login?mode=signup">{t('createAccount')}</Link>
                      </Button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* Which car */}
                    <button
                      type="button"
                      onClick={openPicker}
                      className={cn(
                        'flex w-full items-center gap-3 rounded-[var(--radius-card)] border p-4 text-start transition-colors',
                        selectedCar
                          ? 'border-primary/30 bg-primary-light hover:border-primary'
                          : 'border-dashed border-neutral-300 bg-neutral-50 hover:border-primary',
                      )}
                    >
                      <span
                        className={cn(
                          'grid size-10 shrink-0 place-items-center rounded-full',
                          selectedCar ? 'bg-primary text-neutral-950' : 'bg-neutral-200 text-neutral-600',
                        )}
                      >
                        <Car className="size-5" />
                      </span>
                      <span className="min-w-0 flex-1">
                        <span className="block text-label font-semibold uppercase tracking-wide text-neutral-500">
                          {t('yourCar')}
                        </span>
                        <span className="block truncate text-body font-semibold text-neutral-950">
                          {selectedCar ? carLabel(selectedCar) : t('pickCar')}
                        </span>
                      </span>
                      <span className="text-body-sm font-medium text-primary-dark">
                        {selectedCar ? t('change') : t('select')}
                      </span>
                    </button>

                    {/* What to ask */}
                    <p className="mb-2 mt-5 text-body-sm font-semibold text-neutral-700">{t('askLabel')}</p>
                    <div className="flex flex-wrap gap-2">
                      {prompts.map((prompt) => (
                        <button
                          key={prompt.key}
                          type="button"
                          disabled={pending}
                          onClick={() => ask(prompt.label)}
                          className={cn(
                            'rounded-full border px-4 py-2 text-body-sm font-medium transition-colors disabled:opacity-60',
                            question === prompt.label
                              ? 'border-neutral-950 bg-neutral-950 text-white'
                              : 'border-neutral-300 bg-white text-neutral-800 hover:border-primary hover:bg-primary-light',
                          )}
                        >
                          {prompt.label}
                        </button>
                      ))}
                    </div>

                    {/* Answer */}
                    <div className="mt-5" aria-live="polite">
                      {pending ? (
                        <div className="space-y-3">
                          <div className="h-4 w-3/4 animate-pulse rounded bg-neutral-200" />
                          {[0, 1, 2].map((index) => (
                            <div key={index} className="flex gap-3 rounded-[var(--radius-card)] border border-neutral-200 p-3">
                              <div className="size-16 animate-pulse rounded-xl bg-neutral-200" />
                              <div className="flex-1 space-y-2">
                                <div className="h-4 w-2/3 animate-pulse rounded bg-neutral-200" />
                                <div className="h-3 w-full animate-pulse rounded bg-neutral-100" />
                              </div>
                            </div>
                          ))}
                          <p className="text-center text-body-sm text-neutral-500">{t('thinking')}</p>
                        </div>
                      ) : result && !result.ok ? (
                        <p className="rounded-[var(--radius-card)] bg-warning-light p-4 text-body-sm text-warning">
                          {t(`error_${result.error}`)}
                        </p>
                      ) : result?.ok ? (
                        <div>
                          <p className="text-body leading-relaxed text-neutral-800">{result.summary}</p>
                          <ul className="mt-4 space-y-3">
                            {result.picks.map((pick, index) => (
                              <motion.li
                                key={pick.productId}
                                initial={{ opacity: 0, y: 8 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.05 }}
                                className="flex gap-3 rounded-[var(--radius-card)] border border-neutral-200 bg-white p-3"
                              >
                                <Link
                                  href={`/products/${pick.slug}`}
                                  className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100"
                                >
                                  {pick.image ? (
                                    <Image src={pick.image} alt={pick.name} fill sizes="80px" className="object-cover" />
                                  ) : (
                                    <ImageOff className="absolute inset-0 m-auto size-6 text-neutral-400" />
                                  )}
                                </Link>
                                <div className="min-w-0 flex-1">
                                  <div className="flex flex-wrap items-center gap-2">
                                    <Badge tone={priorityTone[pick.priority]}>{t(`priority_${pick.priority}`)}</Badge>
                                    {pick.category ? (
                                      <span className="text-label text-neutral-500">{pick.category}</span>
                                    ) : null}
                                  </div>
                                  <Link
                                    href={`/products/${pick.slug}`}
                                    className="mt-1 block truncate text-body font-semibold text-neutral-950 hover:text-primary-dark"
                                  >
                                    {pick.name}
                                  </Link>
                                  <p className="mt-0.5 text-body-sm leading-snug text-neutral-600">{pick.reason}</p>
                                  <div className="mt-2 flex items-center justify-between gap-2">
                                    <span className="font-semibold text-neutral-950">{formatPrice(pick.price, locale)}</span>
                                    <Button size="sm" variant="primary" onClick={() => add(pick)}>
                                      <ShoppingBag />
                                      {t('addToCart')}
                                    </Button>
                                  </div>
                                </div>
                              </motion.li>
                            ))}
                          </ul>
                          <p className="mt-4 flex items-center gap-1.5 text-label text-neutral-500">
                            <Check className="size-3.5" />
                            {result.source === 'ai' ? t('poweredBy') : t('basedOnFitment')}
                          </p>
                        </div>
                      ) : (
                        <p className="text-body-sm text-neutral-500">{t('hint')}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            </motion.section>
          </>
        ) : null}
      </AnimatePresence>
    </>
  )
}
