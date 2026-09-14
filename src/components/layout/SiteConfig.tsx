'use client'

import { createContext, useContext } from 'react'

export type SiteConfig = {
  siteName: string
  whatsappNumber: string | null
  deliveryFee: number
  freeDeliveryThreshold: number
}

const Ctx = createContext<SiteConfig>({
  siteName: '',
  whatsappNumber: null,
  deliveryFee: 0,
  freeDeliveryThreshold: 0,
})

/** Read-only shop settings made available to client components. */
export const SiteConfigProvider = ({ value, children }: { value: SiteConfig; children: React.ReactNode }) => (
  <Ctx.Provider value={value}>{children}</Ctx.Provider>
)

export const useSiteConfig = () => useContext(Ctx)
