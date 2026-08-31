'use client'

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export type SelectedCar = {
  /** Set when the car is one of the customer's saved vehicles. */
  vehicleId?: number | null
  brandId: number
  brandName: string
  modelId: number
  modelName: string
  year: number
  engineCode?: string | null
  engineLabel?: string | null
  plateNumber?: string | null
}

type GarageState = {
  car: SelectedCar | null
  /** Whether listings hide parts that do not fit the selected car. */
  fitmentOnly: boolean
  pickerOpen: boolean
  select: (car: SelectedCar) => void
  clear: () => void
  setFitmentOnly: (value: boolean) => void
  openPicker: () => void
  closePicker: () => void
}

/**
 * The customer's current car. Guests keep it on the device; signed-in customers
 * pick from the vehicles already registered to their account, so the same car
 * drives the shop, the Oil Finder and their service history.
 */
export const useGarage = create<GarageState>()(
  persist(
    (set) => ({
      car: null,
      fitmentOnly: true,
      pickerOpen: false,
      select: (car) => set({ car, pickerOpen: false }),
      clear: () => set({ car: null }),
      setFitmentOnly: (fitmentOnly) => set({ fitmentOnly }),
      openPicker: () => set({ pickerOpen: true }),
      closePicker: () => set({ pickerOpen: false }),
    }),
    { name: 'asc-garage', partialize: (state) => ({ car: state.car, fitmentOnly: state.fitmentOnly }) },
  ),
)

/** "2019 Toyota Corolla 1.6L Petrol" */
export const carLabel = (car: SelectedCar | null): string => {
  if (!car) return ''
  return [car.year, car.brandName, car.modelName, car.engineLabel].filter(Boolean).join(' ')
}
