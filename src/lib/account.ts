import type { Locale } from '@/i18n/routing'
import type { Booking, Invoice, Order, ServiceRecord, Vehicle } from '@/payload-types'
import { getPayloadClient } from './payload'

/**
 * All portal reads are scoped to one customer id, which the caller has already
 * authenticated — never to anything supplied by the browser.
 */
export const getCustomerVehicles = async (customerId: number, locale: Locale): Promise<Vehicle[]> => {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'vehicles',
      locale,
      where: { owner: { equals: customerId } },
      limit: 50,
      depth: 1,
      overrideAccess: true,
    })
    return result.docs
  } catch {
    return []
  }
}

export const getCustomerOrders = async (customerId: number, locale: Locale): Promise<Order[]> => {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'orders',
      locale,
      where: { customer: { equals: customerId } },
      sort: '-createdAt',
      limit: 50,
      depth: 2,
      overrideAccess: true,
    })
    return result.docs
  } catch {
    return []
  }
}

export const getCustomerBookings = async (customerId: number, locale: Locale): Promise<Booking[]> => {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'bookings',
      locale,
      where: { customer: { equals: customerId } },
      sort: '-requestedDate',
      limit: 50,
      depth: 1,
      overrideAccess: true,
    })
    return result.docs
  } catch {
    return []
  }
}

export const getCustomerInvoices = async (customerId: number): Promise<Invoice[]> => {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'invoices',
      where: { customer: { equals: customerId } },
      sort: '-issueDate',
      limit: 50,
      depth: 0,
      overrideAccess: true,
    })
    return result.docs
  } catch {
    return []
  }
}

export const getCustomerServiceHistory = async (customerId: number): Promise<ServiceRecord[]> => {
  try {
    const payload = await getPayloadClient()
    const result = await payload.find({
      collection: 'serviceRecords',
      where: { customerSnapshot: { equals: customerId } },
      sort: '-serviceDate',
      limit: 100,
      depth: 1,
      overrideAccess: true,
    })
    return result.docs
  } catch {
    return []
  }
}

/** Days until the next oil change; negative means overdue. */
export const daysUntil = (date?: string | null): number | null => {
  if (!date) return null
  const diff = new Date(date).getTime() - Date.now()
  return Math.ceil(diff / (1000 * 60 * 60 * 24))
}
