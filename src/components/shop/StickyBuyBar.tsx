'use client'

import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { AnimatePresence, motion } from 'framer-motion'
import { ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useCart } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { track } from '@/components/analytics/AnalyticsProvider'

/**
 * Mobile-only buy bar. Appears once the main add-to-cart button scrolls out of
 * view, so the primary action is always one thumb-reach away.
 */
export const StickyBuyBar = ({
  productId,
  name,
  slug,
  price,
  image,
  stockQuantity,
}: {
  productId: number
  name: string
  slug: string
  price: number
  image: string | null
  stockQuantity: number | null
}) => {
  const locale = useLocale()
  const t = useTranslations('shop')
  const add = useCart((state) => state.add)
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > 520)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const outOfStock = stockQuantity !== null && stockQuantity <= 0

  return (
    <AnimatePresence>
      {visible ? (
        <motion.div
          initial={{ y: '100%' }}
          animate={{ y: 0 }}
          exit={{ y: '100%' }}
          transition={{ type: 'spring', damping: 30, stiffness: 300 }}
          className="fixed inset-x-0 bottom-[4.25rem] z-40 border-y border-neutral-200 bg-white/95 p-3 backdrop-blur-xl lg:hidden"
        >
          <div className="flex items-center gap-3">
            <div className="min-w-0 flex-1">
              <p className="truncate text-body-sm font-medium">{name}</p>
              <p className="font-bold text-primary-dark">{formatPrice(price, locale)}</p>
            </div>
            <Button
              variant="primary"
              disabled={outOfStock}
              onClick={() => {
                add({ productId, name, slug, price, image, maxQuantity: stockQuantity })
                track('add_to_cart', { productId, price, source: 'sticky_bar' })
                toast.success(t('added'))
              }}
            >
              <ShoppingBag className="size-4" />
              {outOfStock ? t('outOfStock') : t('addToCart')}
            </Button>
          </div>
        </motion.div>
      ) : null}
    </AnimatePresence>
  )
}
