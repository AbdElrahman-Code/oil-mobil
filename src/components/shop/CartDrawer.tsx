'use client'

import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { AnimatePresence, motion } from 'framer-motion'
import { MessageCircle, Minus, Plus, ShoppingBag, Trash2, X } from 'lucide-react'
import { Link } from '@/i18n/routing'
import { useCart, cartSubtotal } from '@/store/cart'
import { Button } from '@/components/ui/button'
import { formatPrice } from '@/lib/utils'
import { useSiteConfig } from '@/components/layout/SiteConfig'
import { useGarage, carLabel } from '@/store/garage'
import { buildWhatsAppOrderMessage, whatsAppLink } from '@/lib/whatsapp-order'
import { track } from '@/components/analytics/AnalyticsProvider'

export const CartDrawer = () => {
  const locale = useLocale()
  const t = useTranslations('cart')
  const { items, isOpen, close, remove, setQuantity } = useCart()
  const subtotal = cartSubtotal(items)
  const isRtl = locale === 'ar'
  const { siteName, whatsappNumber, deliveryFee, freeDeliveryThreshold } = useSiteConfig()
  const car = useGarage((state) => state.car)

  const whatsappHref = whatsappNumber
    ? whatsAppLink(
        whatsappNumber,
        buildWhatsAppOrderMessage({
          locale: isRtl ? 'ar' : 'en',
          siteName,
          items: items.map((item) => ({ name: item.name, quantity: item.quantity, price: item.price })),
          subtotal,
          deliveryFee: freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold ? 0 : deliveryFee,
          total: subtotal + (freeDeliveryThreshold > 0 && subtotal >= freeDeliveryThreshold ? 0 : deliveryFee),
          car: carLabel(car) || null,
        }),
      )
    : null

  return (
    <AnimatePresence>
      {isOpen ? (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.2 }}
            onClick={close}
            className="fixed inset-0 z-50 bg-neutral-950/50 backdrop-blur-sm"
            aria-hidden
          />
          <motion.aside
            role="dialog"
            aria-modal="true"
            aria-label={t('title')}
            initial={{ x: isRtl ? '-100%' : '100%' }}
            animate={{ x: 0 }}
            exit={{ x: isRtl ? '-100%' : '100%' }}
            transition={{ type: 'spring', damping: 32, stiffness: 320 }}
            className="fixed inset-y-0 end-0 z-50 flex w-[min(26rem,100vw)] flex-col bg-white shadow-[var(--shadow-lift)]"
          >
            <header className="flex items-center justify-between border-b border-neutral-200 px-5 py-4">
              <h2 className="text-h4 font-semibold">{t('title')}</h2>
              <button
                type="button"
                onClick={close}
                className="rounded-full p-2 text-neutral-500 transition-colors hover:bg-neutral-200"
                aria-label={t('continueShopping')}
              >
                <X className="size-5" />
              </button>
            </header>

            {items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-6 text-center">
                <div className="grid size-16 place-items-center rounded-full bg-neutral-100">
                  <ShoppingBag className="size-7 text-neutral-300" />
                </div>
                <p className="text-neutral-400">{t('empty')}</p>
                <Button asChild variant="dark" onClick={close}>
                  <Link href="/shop">{t('startShopping')}</Link>
                </Button>
              </div>
            ) : (
              <>
                <ul className="flex-1 divide-y divide-neutral-200 overflow-y-auto px-5">
                  {items.map((item) => (
                    <li key={item.productId} className="flex gap-3 py-4">
                      <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                        {item.image ? (
                          <Image src={item.image} alt={item.name} fill sizes="80px" className="object-cover" />
                        ) : null}
                      </div>
                      <div className="min-w-0 flex-1">
                        <Link
                          href={`/products/${item.slug}`}
                          onClick={close}
                          className="line-clamp-2 text-body-sm font-medium text-neutral-900 hover:text-primary-dark"
                        >
                          {item.name}
                        </Link>
                        <p className="mt-1 text-body-sm font-semibold text-primary-dark">
                          {formatPrice(item.price, locale)}
                        </p>
                        <div className="mt-2 flex items-center gap-2">
                          <div className="flex items-center rounded-full border border-neutral-300">
                            <button
                              type="button"
                              onClick={() => setQuantity(item.productId, item.quantity - 1)}
                              className="grid size-8 place-items-center rounded-full text-neutral-600 hover:bg-neutral-100"
                              aria-label={`${t('quantity')} -`}
                            >
                              <Minus className="size-3.5" />
                            </button>
                            <span className="w-8 text-center text-body-sm font-medium tabular-nums">
                              {item.quantity}
                            </span>
                            <button
                              type="button"
                              onClick={() => setQuantity(item.productId, item.quantity + 1)}
                              className="grid size-8 place-items-center rounded-full text-neutral-600 hover:bg-neutral-100"
                              aria-label={`${t('quantity')} +`}
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                          <button
                            type="button"
                            onClick={() => remove(item.productId)}
                            className="grid size-8 place-items-center rounded-full text-neutral-400 transition-colors hover:bg-danger-light hover:text-danger"
                            aria-label={t('remove')}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        </div>
                      </div>
                    </li>
                  ))}
                </ul>

                <footer className="border-t border-neutral-200 px-5 py-5">
                  <div className="mb-4 flex items-center justify-between text-body-sm">
                    <span className="text-neutral-500">{t('subtotal')}</span>
                    <span className="text-h4 font-semibold">{formatPrice(subtotal, locale)}</span>
                  </div>
                  <Button asChild size="lg" variant="primary" block onClick={close}>
                    <Link href="/checkout">{t('checkout')}</Link>
                  </Button>
                  {whatsappHref ? (
                    <>
                      <p className="my-2 text-center text-label uppercase text-neutral-400">{t('orText')}</p>
                      <Button asChild size="lg" variant="whatsapp" block>
                        <a
                          href={whatsappHref}
                          target="_blank"
                          rel="noreferrer noopener"
                          onClick={() => track('whatsapp_order_from_cart', { items: items.length, subtotal })}
                        >
                          <MessageCircle className="size-4" />
                          {t('orderViaWhatsApp')}
                        </a>
                      </Button>
                    </>
                  ) : null}
                </footer>
              </>
            )}
          </motion.aside>
        </>
      ) : null}
    </AnimatePresence>
  )
}
