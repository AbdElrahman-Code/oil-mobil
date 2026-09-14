'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { MessageCircle, Minus, Plus, ShoppingBag } from 'lucide-react'
import { useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { useCart } from '@/store/cart'
import { track } from '@/components/analytics/AnalyticsProvider'
import { useSiteConfig } from '@/components/layout/SiteConfig'
import { useGarage, carLabel } from '@/store/garage'
import { buildWhatsAppOrderMessage, whatsAppLink } from '@/lib/whatsapp-order'
import { useLocale } from 'next-intl'

export const AddToCartPanel = ({
  productId,
  name,
  slug,
  price,
  image,
  stockQuantity,
  sku,
}: {
  productId: number
  name: string
  slug: string
  price: number
  image: string | null
  stockQuantity: number | null
  sku?: string | null
}) => {
  const t = useTranslations('shop')
  const tCart = useTranslations('cart')
  const router = useRouter()
  const locale = useLocale()
  const add = useCart((state) => state.add)
  const { siteName, whatsappNumber } = useSiteConfig()
  const car = useGarage((state) => state.car)
  const [quantity, setQuantity] = useState(1)

  const outOfStock = stockQuantity !== null && stockQuantity <= 0
  const max = stockQuantity ?? 99

  const handleAdd = (thenCheckout = false) => {
    add({ productId, name, slug, price, image, maxQuantity: stockQuantity }, quantity)
    track('add_to_cart', { productId, sku, price, quantity })
    toast.success(t('added'))
    if (thenCheckout) router.push('/checkout')
  }

  return (
    <div className="mt-8 flex flex-wrap items-center gap-3">
      <div className="flex h-12 items-center rounded-full border border-neutral-300">
        <button
          type="button"
          onClick={() => setQuantity((value) => Math.max(1, value - 1))}
          className="grid size-11 place-items-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100"
          aria-label={`${tCart('quantity')} -`}
          disabled={outOfStock}
        >
          <Minus className="size-4" />
        </button>
        <span className="w-10 text-center font-medium tabular-nums" aria-live="polite">
          {quantity}
        </span>
        <button
          type="button"
          onClick={() => setQuantity((value) => Math.min(max, value + 1))}
          className="grid size-11 place-items-center rounded-full text-neutral-600 transition-colors hover:bg-neutral-100"
          aria-label={`${tCart('quantity')} +`}
          disabled={outOfStock}
        >
          <Plus className="size-4" />
        </button>
      </div>

      <Button size="lg" variant="primary" onClick={() => handleAdd(false)} disabled={outOfStock}>
        <ShoppingBag className="size-4" />
        {outOfStock ? t('outOfStock') : t('addToCart')}
      </Button>

      <Button size="lg" variant="outline" onClick={() => handleAdd(true)} disabled={outOfStock}>
        {t('buyNow')}
      </Button>

      {whatsappNumber ? (
        <Button asChild size="lg" variant="whatsapp" className="w-full sm:w-auto">
          <a
            href={whatsAppLink(
              whatsappNumber,
              buildWhatsAppOrderMessage({
                locale: locale === 'ar' ? 'ar' : 'en',
                siteName,
                items: [{ name, quantity, price, sku }],
                subtotal: price * quantity,
                deliveryFee: 0,
                total: price * quantity,
                car: carLabel(car) || null,
              }),
            )}
            target="_blank"
            rel="noreferrer noopener"
            onClick={() => track('whatsapp_order_from_product', { productId, quantity })}
          >
            <MessageCircle className="size-4" />
            {t('buyViaWhatsApp')}
          </a>
        </Button>
      ) : null}
    </div>
  )
}
