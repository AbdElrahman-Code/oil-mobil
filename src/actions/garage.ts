'use server'

import type { Locale } from '@/i18n/routing'
import type { VehicleBrand, VehicleModel } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'
import { getCurrentCustomer } from './auth'
import { guard } from '@/lib/rate-limit'

export type GarageCar = {
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

/** The signed-in customer's registered cars, shaped for the picker. */
export const getMyCars = async (locale: Locale = 'ar'): Promise<GarageCar[]> => {
  const customer = await getCurrentCustomer()
  if (!customer) return []

  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'vehicles',
      locale,
      where: { owner: { equals: customer.id } },
      limit: 20,
      depth: 2,
      overrideAccess: true,
    })

    return result.docs.map((vehicle) => {
      const brand = typeof vehicle.brand === 'object' ? vehicle.brand : null
      const model = typeof vehicle.model === 'object' ? vehicle.model : null
      const engine = model?.engines?.find((item) => item.code === vehicle.engineType)

      return {
        vehicleId: vehicle.id,
        brandId: brand?.id ?? 0,
        brandName: brand?.name ?? '',
        modelId: model?.id ?? 0,
        modelName: model?.name ?? '',
        year: vehicle.manufacturingYear ?? new Date().getFullYear(),
        engineCode: vehicle.engineType ?? null,
        engineLabel: engine?.label ?? null,
        plateNumber: vehicle.plateNumber ?? null,
      }
    })
  } catch {
    return []
  }
}

export type SaveCarResult =
  | { ok: true; vehicleId: number }
  | { ok: false; error: 'notSignedIn' | 'duplicate' | 'invalid' | 'serverError' }

/**
 * Saves the car the shopper just picked into their garage, so it is there next
 * time and the workshop can attach service history to it.
 */
export const saveCarToGarage = async (
  car: { brandId: number; modelId: number; year: number; engineCode?: string | null; plateNumber?: string | null },
): Promise<SaveCarResult> => {
  const limit = await guard('save-car', 10, 60_000)
  if (!limit.ok) return { ok: false, error: 'serverError' }

  const customer = await getCurrentCustomer()
  if (!customer) return { ok: false, error: 'notSignedIn' }

  if (!car.brandId || !car.modelId || !car.year) return { ok: false, error: 'invalid' }

  try {
    const payload = await getPayloadClient()

    // A plate is the unique key; without one, fall back to make/model/year so a
    // customer cannot end up with the same car listed twice.
    const existing = await payload.find({
      collection: 'vehicles',
      where: car.plateNumber
        ? { plateNumber: { equals: car.plateNumber } }
        : {
            and: [
              { owner: { equals: customer.id } },
              { model: { equals: car.modelId } },
              { manufacturingYear: { equals: car.year } },
            ],
          },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    if (existing.docs[0]) return { ok: true, vehicleId: existing.docs[0].id }

    const created = await payload.create({
      collection: 'vehicles',
      data: {
        owner: customer.id,
        brand: car.brandId,
        model: car.modelId,
        manufacturingYear: car.year,
        engineType: car.engineCode ?? undefined,
        // Placeholder plate: the branch fills in the real one on first visit.
        plateNumber: car.plateNumber || `TMP-${customer.id}-${car.modelId}-${car.year}`,
      },
      overrideAccess: true,
    })

    return { ok: true, vehicleId: created.id }
  } catch (error) {
    console.error('saveCarToGarage failed', error)
    return { ok: false, error: 'serverError' }
  }
}

/* ── Vehicle reference data, used by the car picker ─────────────────────── */

export const listBrands = async (): Promise<VehicleBrand[]> => {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'vehicleBrands',
      where: { isActive: { equals: true } },
      sort: 'displayOrder',
      limit: 200,
      depth: 1,
    })
    return result.docs
  } catch {
    return []
  }
}

export const listModels = async (brandId: number, locale: Locale = 'ar'): Promise<VehicleModel[]> => {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'vehicleModels',
      locale,
      where: { and: [{ brand: { equals: brandId } }, { isActive: { equals: true } }] },
      sort: 'name',
      limit: 300,
      depth: 0,
    })
    return result.docs
  } catch {
    return []
  }
}
