'use server'

import { addMinutes, format, isBefore, parse } from 'date-fns'
import { getPayloadClient } from '@/lib/payload'
import { guard } from '@/lib/rate-limit'
import { bookingSchema } from '@/lib/validation'
import { notify } from '@/lib/notifications'

export type Slot = { time: string; available: boolean; remaining: number }

/**
 * Builds the day's slots from the opening hours, slot length and bay count set
 * in Site Settings, then subtracts what is already booked.
 */
export const getAvailableSlots = async (dateISO: string, serviceId?: number): Promise<Slot[]> => {
  try {
    const payload = await getPayloadClient()
    const settings = await payload.findGlobal({ slug: 'siteSettings', depth: 0 })

    const date = new Date(`${dateISO}T00:00:00`)
    if (Number.isNaN(date.getTime())) return []

    const closedDays = (settings?.closedDays ?? []) as string[]
    if (closedDays.includes(String(date.getDay()))) return []

    const open = settings?.bookingOpenTime || '09:00'
    const close = settings?.bookingCloseTime || '21:00'
    const slotMinutes = settings?.bookingSlotMinutes || 30
    const capacity = settings?.bookingsPerSlot || 2
    const leadHours = settings?.bookingLeadTimeHours ?? 0

    let cursor = parse(open, 'HH:mm', date)
    const end = parse(close, 'HH:mm', date)
    if (Number.isNaN(cursor.getTime()) || Number.isNaN(end.getTime())) return []

    // How long the chosen package occupies a bay, rounded up to whole slots.
    let serviceSlots = 1
    if (serviceId) {
      try {
        const service = await payload.findByID({ collection: 'washServices', id: serviceId, depth: 0 })
        serviceSlots = Math.max(1, Math.ceil((service.durationMinutes ?? slotMinutes) / slotMinutes))
      } catch {
        serviceSlots = 1
      }
    }

    const dayStart = new Date(`${dateISO}T00:00:00`).toISOString()
    const dayEnd = new Date(`${dateISO}T23:59:59`).toISOString()

    const booked = await payload.find({
      collection: 'bookings',
      where: {
        and: [
          { requestedDate: { greater_than_equal: dayStart } },
          { requestedDate: { less_than_equal: dayEnd } },
          { status: { not_in: ['cancelled', 'noShow'] } },
        ],
      },
      limit: 500,
      depth: 0,
      pagination: false,
      overrideAccess: true,
    })

    const taken = new Map<string, number>()
    for (const booking of booked.docs) {
      const key = booking.requestedTimeSlot
      if (key) taken.set(key, (taken.get(key) ?? 0) + 1)
    }

    const earliest = addMinutes(new Date(), leadHours * 60)
    const slots: Slot[] = []

    while (isBefore(addMinutes(cursor, slotMinutes * serviceSlots), addMinutes(end, 1))) {
      const time = format(cursor, 'HH:mm')
      const used = taken.get(time) ?? 0
      const remaining = Math.max(0, capacity - used)
      slots.push({
        time,
        remaining,
        available: remaining > 0 && !isBefore(cursor, earliest),
      })
      cursor = addMinutes(cursor, slotMinutes)
    }

    return slots
  } catch {
    return []
  }
}

export type CreateBookingResult =
  | { ok: true; reference: string }
  | { ok: false; error: 'tooManyRequests' | 'invalidInput' | 'slotTaken' | 'serverError' }

export const createBooking = async (input: unknown): Promise<CreateBookingResult> => {
  const limit = await guard('booking', 6, 60_000)
  if (!limit.ok) return { ok: false, error: 'tooManyRequests' }

  const parsed = bookingSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalidInput' }

  const data = parsed.data

  try {
    const payload = await getPayloadClient()

    // Re-check capacity server-side; the client's view may be stale.
    const slots = await getAvailableSlots(data.date, data.serviceId)
    const slot = slots.find((entry) => entry.time === data.timeSlot)
    if (!slot?.available) return { ok: false, error: 'slotTaken' }

    const service = await payload.findByID({ collection: 'washServices', id: data.serviceId, depth: 0 })

    const customer = await payload.find({
      collection: 'customers',
      where: { phone: { equals: data.contactPhone } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const vehicle = data.plateNumber
      ? await payload.find({
          collection: 'vehicles',
          where: { plateNumber: { equals: data.plateNumber } },
          limit: 1,
          depth: 0,
          overrideAccess: true,
        })
      : null

    const booking = await payload.create({
      collection: 'bookings',
      data: {
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        customer: customer.docs[0]?.id,
        vehicle: vehicle?.docs[0]?.id,
        serviceType: data.serviceId,
        requestedDate: new Date(`${data.date}T00:00:00`).toISOString(),
        requestedTimeSlot: data.timeSlot,
        status: 'pending',
        customerNote: data.note,
        priceAtBooking: service.price ?? 0,
      },
      overrideAccess: true,
    })

    await notify({
      channel: 'whatsapp',
      to: data.contactPhone,
      template: 'bookingReceived',
      variables: { reference: booking.reference ?? '', date: data.date, time: data.timeSlot },
    })

    return { ok: true, reference: booking.reference ?? '' }
  } catch (error) {
    console.error('createBooking failed', error)
    return { ok: false, error: 'serverError' }
  }
}
