'use client'

import { useTranslations } from 'next-intl'
import { RotateCcw } from 'lucide-react'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { useCart } from '@/store/cart'

type ReorderItem = {
  productId: number
  name: string
  slug: string
  price: number
  quantity: number
}

/** One click puts a previous order back in the cart at today's saved prices. */
export const ReorderButton = ({
  items,
  label,
  addedLabel,
}: {
  items: ReorderItem[]
  label: string
  addedLabel: string
}) => {
  const add = useCart((state) => state.add)
  const tCommon = useTranslations('common')

  if (!items.length) return null

  return (
    <Button
      size="sm"
      variant="ghost"
      aria-label={label}
      title={label}
      onClick={() => {
        items.forEach((item) => {
          if (!item.productId) return
          add(
            {
              productId: item.productId,
              name: item.name || tCommon('brand'),
              slug: item.slug,
              price: item.price,
              image: null,
              maxQuantity: null,
            },
            item.quantity,
          )
        })
        toast.success(addedLabel)
      }}
    >
      <RotateCcw className="size-4" />
    </Button>
  )
}
