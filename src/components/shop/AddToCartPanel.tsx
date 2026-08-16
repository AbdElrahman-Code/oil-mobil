'use client'

import { useState } from 'react'
import { useTranslations } from 'next-intl'
import { toast } from 'sonner'
import { Minus, Plus, ShoppingBag } from 'lucide-react'
import { useRouter } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { useCart } from '@/store/cart'
import { track } from '@/components/analytics/AnalyticsProvider'

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
  const add = useCart((state) => state.add)
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

      <Button size="lg" variant="accent" onClick={() => handleAdd(false)} disabled={outOfStock}>
        <ShoppingBag className="size-4" />
        {outOfStock ? t('outOfStock') : t('addToCart')}
      </Button>

      <Button size="lg" variant="outline" onClick={() => handleAdd(true)} disabled={outOfStock}>
        {t('buyNow')}
      </Button>
    </div>
  )
}
