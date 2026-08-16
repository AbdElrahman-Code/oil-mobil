'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Heart } from 'lucide-react'
import { toast } from 'sonner'
import { useWishlist, type WishlistItem } from '@/store/wishlist'
import { track } from '@/components/analytics/AnalyticsProvider'
import { cn } from '@/lib/utils'

export const WishlistButton = ({
  item,
  className,
  size = 'md',
}: {
  item: WishlistItem
  className?: string
  size?: 'sm' | 'md'
}) => {
  const t = useTranslations('shop')
  const toggle = useWishlist((state) => state.toggle)
  const items = useWishlist((state) => state.items)
  const [mounted, setMounted] = useState(false)

  // The list lives in localStorage, so the server render can't know it yet.
  useEffect(() => setMounted(true), [])
  const saved = mounted && items.some((i) => i.productId === item.productId)

  return (
    <motion.button
      type="button"
      whileTap={{ scale: 0.85 }}
      onClick={(event) => {
        event.preventDefault()
        event.stopPropagation()
        const added = toggle(item)
        track(added ? 'wishlist_added' : 'wishlist_removed', { productId: item.productId })
        toast.success(added ? t('savedToWishlist') : t('removedFromWishlist'))
      }}
      aria-pressed={saved}
      aria-label={saved ? t('removeFromWishlist') : t('saveToWishlist')}
      className={cn(
        'grid place-items-center rounded-full backdrop-blur transition-colors',
        size === 'sm' ? 'size-9' : 'size-10',
        saved
          ? 'bg-accent-light text-accent'
          : 'bg-white/85 text-neutral-500 hover:bg-white hover:text-accent',
        className,
      )}
    >
      <Heart className={cn(size === 'sm' ? 'size-4' : 'size-[1.15rem]', saved && 'fill-current')} />
    </motion.button>
  )
}
