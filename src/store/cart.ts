'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type CartItem = {
  productId: number
  name: string
  slug: string
  price: number
  image?: string | null
  quantity: number
  maxQuantity?: number | null
}

type CartState = {
  items: CartItem[]
  isOpen: boolean
  add: (item: Omit<CartItem, 'quantity'>, quantity?: number) => void
  remove: (productId: number) => void
  setQuantity: (productId: number, quantity: number) => void
  clear: () => void
  open: () => void
  close: () => void
  toggle: () => void
}

export const useCart = create<CartState>()(
  persist(
    (set) => ({
      items: [],
      isOpen: false,
      add: (item, quantity = 1) =>
        set((state) => {
          const existing = state.items.find((i) => i.productId === item.productId)
          const cap = item.maxQuantity ?? Number.POSITIVE_INFINITY
          const items = existing
            ? state.items.map((i) =>
                i.productId === item.productId
                  ? { ...i, ...item, quantity: Math.min(i.quantity + quantity, cap) }
                  : i,
              )
            : [...state.items, { ...item, quantity: Math.min(quantity, cap) }]
          return { items, isOpen: true }
        }),
      remove: (productId) =>
        set((state) => ({ items: state.items.filter((i) => i.productId !== productId) })),
      setQuantity: (productId, quantity) =>
        set((state) => ({
          items:
            quantity <= 0
              ? state.items.filter((i) => i.productId !== productId)
              : state.items.map((i) =>
                  i.productId === productId
                    ? { ...i, quantity: Math.min(quantity, i.maxQuantity ?? Number.POSITIVE_INFINITY) }
                    : i,
                ),
        })),
      clear: () => set({ items: [] }),
      open: () => set({ isOpen: true }),
      close: () => set({ isOpen: false }),
      toggle: () => set((state) => ({ isOpen: !state.isOpen })),
    }),
    { name: 'asc-cart', partialize: (state) => ({ items: state.items }) },
  ),
)

export const cartCount = (items: CartItem[]) => items.reduce((sum, i) => sum + i.quantity, 0)
export const cartSubtotal = (items: CartItem[]) =>
  items.reduce((sum, i) => sum + i.price * i.quantity, 0)
