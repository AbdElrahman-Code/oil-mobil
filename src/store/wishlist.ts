'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type WishlistItem = {
  productId: number
  name: string
  slug: string
  price: number
  image?: string | null
}

type WishlistState = {
  items: WishlistItem[]
  toggle: (item: WishlistItem) => boolean
  remove: (productId: number) => void
  clear: () => void
  has: (productId: number) => boolean
}

/** Saved-for-later list. Local to the device — no account required. */
export const useWishlist = create<WishlistState>()(
  persist(
    (set, get) => ({
      items: [],
      toggle: (item) => {
        const exists = get().items.some((i) => i.productId === item.productId)
        set((state) => ({
          items: exists
            ? state.items.filter((i) => i.productId !== item.productId)
            : [...state.items, item],
        }))
        return !exists
      },
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      clear: () => set({ items: [] }),
      has: (productId) => get().items.some((i) => i.productId === productId),
    }),
    { name: 'asc-wishlist' },
  ),
)
