'use client'

import { useState } from 'react'
import Image from 'next/image'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useLocale, useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { CheckCircle2, CreditCard, Loader2, MessageCircle, Store, Truck, Wallet } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Card, FieldError, Input, Label, Textarea } from '@/components/ui/primitives'
import { useCart, cartSubtotal } from '@/store/cart'
import { placeOrder } from '@/actions/orders'
import { cn, formatPrice } from '@/lib/utils'
import { track } from '@/components/analytics/AnalyticsProvider'
import { egyptianPhone } from '@/lib/validation'
import { useSiteConfig } from '@/components/layout/SiteConfig'
import { useGarage, carLabel } from '@/store/garage'
import { buildWhatsAppOrderMessage, whatsAppLink } from '@/lib/whatsapp-order'

const formSchema = z.object({
  contactName: z.string().trim().min(2),
  contactPhone: egyptianPhone,
  fulfillmentMethod: z.enum(['delivery', 'pickup']),
  paymentMethod: z.enum(['cod', 'payAtPickup', 'paymob', 'whatsapp']),
  customerNote: z.string().max(600).optional(),
  governorate: z.string().optional(),
  city: z.string().optional(),
  street: z.string().optional(),
  building: z.string().optional(),
  apartment: z.string().optional(),
  landmark: z.string().optional(),
})

type FormValues = z.infer<typeof formSchema>

export const CheckoutForm = ({
  deliveryFee,
  freeDeliveryThreshold,
  codEnabled,
  onlinePaymentEnabled,
}: {
  deliveryFee: number
  freeDeliveryThreshold: number
  codEnabled: boolean
  onlinePaymentEnabled: boolean
}) => {
  const locale = useLocale()
  const t = useTranslations('checkout')
  const tCart = useTranslations('cart')
  const tCommon = useTranslations('common')
  const { items, clear } = useCart()
  const [submitting, setSubmitting] = useState(false)
  const [serverError, setServerError] = useState<string | null>(null)
  const [success, setSuccess] = useState<{ orderNumber: string; phone: string; whatsapp?: string } | null>(null)
  const { siteName, whatsappNumber } = useSiteConfig()
  const car = useGarage((state) => state.car)

  const {
    register,
    handleSubmit,
    watch,
    formState: { errors },
  } = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: { fulfillmentMethod: 'delivery', paymentMethod: codEnabled ? 'cod' : 'payAtPickup' },
  })

  const fulfillment = watch('fulfillmentMethod')
  const paymentMethod = watch('paymentMethod')
  const subtotal = cartSubtotal(items)
  const shipping =
    fulfillment === 'delivery' && (freeDeliveryThreshold === 0 || subtotal < freeDeliveryThreshold)
      ? deliveryFee
      : 0
  const total = subtotal + shipping

  const onSubmit = async (values: FormValues) => {
    setSubmitting(true)
    setServerError(null)

    const result = await placeOrder({
      contactName: values.contactName,
      contactPhone: values.contactPhone,
      fulfillmentMethod: values.fulfillmentMethod,
      paymentMethod: values.paymentMethod,
      customerNote: values.customerNote,
      address:
        values.fulfillmentMethod === 'delivery'
          ? {
              governorate: values.governorate ?? '',
              city: values.city ?? '',
              street: values.street ?? '',
              building: values.building,
              apartment: values.apartment,
              landmark: values.landmark,
            }
          : undefined,
      items: items.map((item) => ({ productId: item.productId, quantity: item.quantity })),
    })

    setSubmitting(false)

    if (result.ok) {
      track('order_placed', { orderNumber: result.orderNumber, total: result.total, method: values.paymentMethod })

      let whatsapp: string | undefined
      if (values.paymentMethod === 'whatsapp' && whatsappNumber) {
        // The order is already saved; the chat is how it gets confirmed.
        const message = buildWhatsAppOrderMessage({
          locale: locale === 'ar' ? 'ar' : 'en',
          siteName,
          orderNumber: result.orderNumber,
          items: items.map((item) => ({ name: item.name, quantity: item.quantity, price: item.price })),
          subtotal,
          deliveryFee: shipping,
          total,
          customer: { name: values.contactName, phone: values.contactPhone },
          fulfillment: values.fulfillmentMethod,
          address:
            values.fulfillmentMethod === 'delivery'
              ? {
                  governorate: values.governorate,
                  city: values.city,
                  street: values.street,
                  building: values.building,
                  apartment: values.apartment,
                  landmark: values.landmark,
                }
              : null,
          car: carLabel(car) || null,
          note: values.customerNote,
        })
        whatsapp = whatsAppLink(whatsappNumber, message)
        window.open(whatsapp, '_blank', 'noopener')
      }

      clear()
      setSuccess({ orderNumber: result.orderNumber, phone: values.contactPhone, whatsapp })
    } else {
      setServerError(result.error)
    }
  }

  if (success) {
    return (
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5, ease: [0.16, 1, 0.3, 1] }}
        className="mx-auto max-w-xl text-center"
      >
        <CheckCircle2 className="mx-auto mb-5 size-14 text-success" />
        <h2 className="text-h2">{t('successTitle')}</h2>
        <p className="mt-3 text-neutral-500">
          {success.whatsapp
            ? t('whatsappSuccessBody', { orderNumber: success.orderNumber })
            : t('successBody', { orderNumber: success.orderNumber, phone: success.phone })}
        </p>
        <div className="mt-8 flex flex-wrap justify-center gap-3">
          {success.whatsapp ? (
            <Button asChild size="lg" variant="whatsapp">
              <a href={success.whatsapp} target="_blank" rel="noreferrer noopener">
                <MessageCircle className="size-4" />
                {t('openWhatsApp')}
              </a>
            </Button>
          ) : null}
          <Button asChild size="lg" variant={success.whatsapp ? 'outline' : 'primary'}>
            <Link href="/shop">{tCart('continueShopping')}</Link>
          </Button>
        </div>
      </motion.div>
    )
  }

  if (!items.length) {
    return (
      <div className="mx-auto max-w-md text-center">
        <p className="text-neutral-400">{tCart('empty')}</p>
        <Button asChild className="mt-6">
          <Link href="/shop">{tCart('startShopping')}</Link>
        </Button>
      </div>
    )
  }

  const optionClass = (active: boolean) =>
    cn(
      'flex flex-1 cursor-pointer items-center gap-3 rounded-xl border p-4 text-body-sm transition-colors',
      active ? 'border-primary-500 bg-primary-50/60' : 'border-neutral-300 hover:border-neutral-400',
    )

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="grid gap-8 lg:grid-cols-[1fr_22rem]">
      <div className="space-y-8">
        <Card className="p-6">
          <h2 className="mb-5 text-h4 font-semibold">{t('contactDetails')}</h2>
          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <Label htmlFor="contactName">{tCommon('name')}</Label>
              <Input id="contactName" autoComplete="name" {...register('contactName')} />
              <FieldError>{errors.contactName ? tCommon('required') : null}</FieldError>
            </div>
            <div>
              <Label htmlFor="contactPhone">{tCommon('phone')}</Label>
              <Input
                id="contactPhone"
                inputMode="tel"
                autoComplete="tel"
                dir="ltr"
                placeholder="01012345678"
                {...register('contactPhone')}
              />
              <FieldError>
                {errors.contactPhone ? (locale === 'ar' ? 'رقم غير صحيح' : 'Invalid phone number') : null}
              </FieldError>
            </div>
          </div>
        </Card>

        <Card className="p-6">
          <h2 className="mb-5 text-h4 font-semibold">{t('howToGetIt')}</h2>
          <div className="flex flex-col gap-3 sm:flex-row">
            <label className={optionClass(fulfillment === 'delivery')}>
              <input type="radio" value="delivery" className="sr-only" {...register('fulfillmentMethod')} />
              <Truck className="size-5 text-primary-500" />
              {t('delivery')}
            </label>
            <label className={optionClass(fulfillment === 'pickup')}>
              <input type="radio" value="pickup" className="sr-only" {...register('fulfillmentMethod')} />
              <Store className="size-5 text-primary-500" />
              {t('pickup')}
            </label>
          </div>

          {fulfillment === 'delivery' ? (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              className="mt-6 grid gap-4 sm:grid-cols-2"
            >
              <div>
                <Label htmlFor="governorate">{t('governorate')}</Label>
                <Input id="governorate" {...register('governorate')} />
              </div>
              <div>
                <Label htmlFor="city">{t('city')}</Label>
                <Input id="city" {...register('city')} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="street">{t('street')}</Label>
                <Input id="street" autoComplete="street-address" {...register('street')} />
              </div>
              <div>
                <Label htmlFor="building">{t('building')}</Label>
                <Input id="building" {...register('building')} />
              </div>
              <div>
                <Label htmlFor="apartment">{t('apartment')}</Label>
                <Input id="apartment" {...register('apartment')} />
              </div>
              <div className="sm:col-span-2">
                <Label htmlFor="landmark">{t('landmark')}</Label>
                <Input id="landmark" {...register('landmark')} />
              </div>
            </motion.div>
          ) : null}
        </Card>

        <Card className="p-6">
          <h2 className="mb-5 text-h4 font-semibold">{t('payment')}</h2>
          <div className="grid gap-3 sm:grid-cols-2">
            {codEnabled && fulfillment === 'delivery' ? (
              <label className={optionClass(paymentMethod === 'cod')}>
                <input type="radio" value="cod" className="sr-only" {...register('paymentMethod')} />
                <Wallet className="size-5 text-primary-500" />
                {t('cod')}
              </label>
            ) : null}
            {fulfillment === 'pickup' ? (
              <label className={optionClass(paymentMethod === 'payAtPickup')}>
                <input type="radio" value="payAtPickup" className="sr-only" {...register('paymentMethod')} />
                <Store className="size-5 text-primary-500" />
                {t('payAtPickup')}
              </label>
            ) : null}
            {whatsappNumber ? (
              <label className={cn(optionClass(paymentMethod === 'whatsapp'), paymentMethod === 'whatsapp' && 'border-[var(--color-whatsapp)] bg-[var(--color-whatsapp-light)]')}>
                <input type="radio" value="whatsapp" className="sr-only" {...register('paymentMethod')} />
                <MessageCircle className="size-5 text-[var(--color-whatsapp-ink)]" />
                <span>
                  <span className="block font-medium">{t('whatsapp')}</span>
                  <span className="block text-body-sm text-neutral-500">{t('whatsappHint')}</span>
                </span>
              </label>
            ) : null}
            {onlinePaymentEnabled ? (
              <label className={optionClass(paymentMethod === 'paymob')}>
                <input type="radio" value="paymob" className="sr-only" {...register('paymentMethod')} />
                <CreditCard className="size-5 text-primary-500" />
                {t('card')}
              </label>
            ) : null}
          </div>

          <div className="mt-6">
            <Label htmlFor="customerNote">{t('orderNote')}</Label>
            <Textarea id="customerNote" {...register('customerNote')} />
          </div>
        </Card>
      </div>

      <aside className="lg:sticky lg:top-24 lg:h-fit">
        <Card className="p-6">
          <h2 className="mb-5 text-h4 font-semibold">{tCart('title')}</h2>
          <ul className="mb-5 space-y-3">
            {items.map((item) => (
              <li key={item.productId} className="flex items-center gap-3">
                <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                  {item.image ? (
                    <Image src={item.image} alt={item.name} fill sizes="48px" className="object-cover" />
                  ) : null}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-body-sm">{item.name}</p>
                  <p className="text-body-sm text-neutral-400">×{item.quantity}</p>
                </div>
                <span className="text-body-sm font-medium">{formatPrice(item.price * item.quantity, locale)}</span>
              </li>
            ))}
          </ul>

          <dl className="space-y-2 border-t border-neutral-200 pt-4 text-body-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-500">{tCart('subtotal')}</dt>
              <dd>{formatPrice(subtotal, locale)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">{tCart('delivery')}</dt>
              <dd>{shipping === 0 ? tCart('freeDelivery') : formatPrice(shipping, locale)}</dd>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-3 text-body font-semibold">
              <dt>{tCart('total')}</dt>
              <dd>{formatPrice(total, locale)}</dd>
            </div>
          </dl>

          {serverError ? (
            <p className="mt-4 rounded-lg bg-danger-light px-4 py-3 text-body-sm text-danger">
              {tCommon('error')}
            </p>
          ) : null}

          <Button
            type="submit"
            size="lg"
            variant={paymentMethod === 'whatsapp' ? 'whatsapp' : 'primary'}
            block
            className="mt-6"
            disabled={submitting}
          >
            {submitting ? <Loader2 className="size-4 animate-spin" /> : paymentMethod === 'whatsapp' ? <MessageCircle className="size-4" /> : null}
            {paymentMethod === 'whatsapp' ? t('whatsapp') : t('placeOrder')}
          </Button>
        </Card>
      </aside>
    </form>
  )
}
