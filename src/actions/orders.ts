'use server'

import { getPayloadClient } from '@/lib/payload'
import { guard } from '@/lib/rate-limit'
import { checkoutSchema } from '@/lib/validation'
import { notify } from '@/lib/notifications'

export type PlaceOrderResult =
  | { ok: true; orderNumber: string; total: number }
  | { ok: false; error: string; fieldErrors?: Record<string, string[]> }

/**
 * Creates an order. Prices, stock and totals are re-read from the database —
 * the client only ever sends product ids and quantities.
 */
export const placeOrder = async (input: unknown): Promise<PlaceOrderResult> => {
  const limit = await guard('checkout', 8, 60_000)
  if (!limit.ok) return { ok: false, error: 'tooManyRequests' }

  const parsed = checkoutSchema.safeParse(input)
  if (!parsed.success) {
    return {
      ok: false,
      error: 'invalidInput',
      fieldErrors: parsed.error.flatten().fieldErrors as Record<string, string[]>,
    }
  }

  const data = parsed.data
  const payload = await getPayloadClient()

  const products = await payload.find({
    collection: 'products',
    where: { id: { in: data.items.map((item) => item.productId) } },
    limit: data.items.length,
    depth: 0,
  })

  if (!products.docs.length) return { ok: false, error: 'emptyCart' }

  const items = data.items
    .map((item) => {
      const product = products.docs.find((doc) => doc.id === item.productId)
      if (!product || !product.isPublished) return null
      const available = product.allowBackorder
        ? item.quantity
        : Math.min(item.quantity, product.stockQuantity ?? 0)
      if (available <= 0) return null
      return {
        product: product.id,
        quantity: available,
        priceAtPurchase: product.price ?? 0,
        nameSnapshot: product.name,
      }
    })
    .filter((item): item is NonNullable<typeof item> => item !== null)

  if (!items.length) return { ok: false, error: 'outOfStock' }

  const settings = await payload.findGlobal({ slug: 'siteSettings', depth: 0 })
  const subtotal = items.reduce((sum, item) => sum + item.priceAtPurchase * item.quantity, 0)
  const threshold = settings?.freeDeliveryThreshold ?? 0
  const deliveryFee =
    data.fulfillmentMethod === 'delivery' && (threshold === 0 || subtotal < threshold)
      ? (settings?.deliveryFee ?? 0)
      : 0

  // Link the order to an existing customer when the phone number is known.
  const existingCustomer = await payload.find({
    collection: 'customers',
    where: { phone: { equals: data.contactPhone } },
    limit: 1,
    depth: 0,
  })

  try {
    const order = await payload.create({
      collection: 'orders',
      data: {
        customer: existingCustomer.docs[0]?.id,
        contactName: data.contactName,
        contactPhone: data.contactPhone,
        items,
        fulfillmentMethod: data.fulfillmentMethod,
        orderStatus: 'pending',
        paymentMethod: data.paymentMethod,
        paymentStatus: 'unpaid',
        deliveryFee,
        discount: 0,
        customerNote: data.customerNote,
        deliveryAddress: data.fulfillmentMethod === 'delivery' ? data.address : undefined,
      },
      overrideAccess: true,
    })

    await notify({
      channel: 'whatsapp',
      to: data.contactPhone,
      template: 'orderReceived',
      variables: { orderNumber: order.orderNumber ?? '', total: String(order.total ?? 0) },
    })

    return { ok: true, orderNumber: order.orderNumber ?? '', total: order.total ?? 0 }
  } catch (error) {
    console.error('placeOrder failed', error)
    return { ok: false, error: 'serverError' }
  }
}

/** Public order lookup for the confirmation page — by number plus matching phone. */
export const getOrderStatus = async (orderNumber: string, phone: string) => {
  const payload = await getPayloadClient()
  const result = await payload.find({
    collection: 'orders',
    where: { and: [{ orderNumber: { equals: orderNumber } }, { contactPhone: { equals: phone } }] },
    limit: 1,
    depth: 1,
    overrideAccess: true,
  })
  return result.docs[0] ?? null
}
