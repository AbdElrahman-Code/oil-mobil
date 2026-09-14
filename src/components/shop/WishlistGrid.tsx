'use client'

import Image from 'next/image'
import { useEffect, useState } from 'react'
import { useLocale, useTranslations } from 'next-intl'
import { motion, AnimatePresence } from 'framer-motion'
import { Heart, ShoppingBag, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'
import { Card } from '@/components/ui/primitives'
import { useWishlist } from '@/store/wishlist'
import { useCart } from '@/store/cart'
import { formatPrice } from '@/lib/utils'

export const WishlistGrid = () => {
  const locale = useLocale()
  const t = useTranslations('shop')
  const tCart = useTranslations('cart')
  const { items, remove } = useWishlist()
  const add = useCart((state) => state.add)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])
  if (!mounted) return null

  if (!items.length) {
    return (
      <div className="grid place-items-center rounded-[var(--radius-card)] border border-dashed border-neutral-300 py-24 text-center">
        <Heart className="mb-4 size-10 text-neutral-300" />
        <p className="text-neutral-500">{t('wishlistEmpty')}</p>
        <Button asChild className="mt-6">
          <Link href="/shop">{tCart('startShopping')}</Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      <AnimatePresence mode="popLayout">
        {items.map((item) => (
          <motion.div key={item.productId} layout exit={{ opacity: 0, scale: 0.95 }}>
            <Card className="flex h-full flex-col overflow-hidden">
              <Link href={`/products/${item.slug}`} className="relative block aspect-square bg-neutral-100">
                {item.image ? (
                  <Image src={item.image} alt="" fill sizes="(max-width:640px) 50vw, 25vw" className="object-cover" />
                ) : null}
              </Link>
              <div className="flex flex-1 flex-col p-4">
                <Link href={`/products/${item.slug}`} className="text-body-sm font-medium hover:text-primary-dark">
                  {item.name}
                </Link>
                <p className="mt-2 font-bold">{formatPrice(item.price, locale)}</p>
                <div className="mt-auto flex gap-2 pt-4">
                  <Button
                    size="sm"
                    variant="primary"
                    className="flex-1"
                    onClick={() => {
                      add({ ...item, maxQuantity: null })
                      toast.success(t('added'))
                    }}
                  >
                    <ShoppingBag className="size-4" />
                    {t('addToCart')}
                  </Button>
                  <Button
                    size="sm"
                    variant="ghost"
                    aria-label={t('removeFromWishlist')}
                    onClick={() => remove(item.productId)}
                  >
                    <Trash2 className="size-4" />
                  </Button>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}
