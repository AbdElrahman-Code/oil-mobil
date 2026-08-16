'use client'

import dynamic from 'next/dynamic'
import { useCart } from '@/store/cart'

/**
 * The drawer's markup and animation are only fetched once a customer actually
 * opens the cart, keeping that weight out of every first page load.
 */
const CartDrawer = dynamic(() => import('./CartDrawer').then((mod) => mod.CartDrawer), {
  ssr: false,
})

export const CartDrawerMount = () => {
  const isOpen = useCart((state) => state.isOpen)
  const hasItems = useCart((state) => state.items.length > 0)

  // Mount once there is anything to show; after that it stays mounted so the
  // close animation can play.
  if (!isOpen && !hasItems) return null
  return <CartDrawer />
}
