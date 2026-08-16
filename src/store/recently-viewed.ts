'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type ViewedItem = {
  productId: number
  name: string
  slug: string
  price: number
  image?: string | null
}

type State = {
  items: ViewedItem[]
  push: (item: ViewedItem) => void
}

const MAX = 8

/** Recently viewed products, newest first, capped so it stays useful. */
export const useRecentlyViewed = create<State>()(
  persist(
    (set) => ({
      items: [],
      push: (item) =>
        set((state) => ({
          items: [item, ...state.items.filter((i) => i.productId !== item.productId)].slice(0, MAX),
        })),
    }),
    { name: 'asc-recently-viewed' },
  ),
)
