import { NextResponse } from 'next/server'
import { getPayloadClient } from '@/lib/payload'
import { verifyCallbackHmac } from '@/lib/paymob'

/**
 * Paymob transaction callback. The HMAC is checked before anything is written,
 * so a forged request can never mark an order as paid.
 */
export async function POST(request: Request) {
  const url = new URL(request.url)
  const hmac = url.searchParams.get('hmac') ?? ''

  let body: { obj?: Record<string, unknown> }
  try {
    body = (await request.json()) as { obj?: Record<string, unknown> }
  } catch {
    return NextResponse.json({ error: 'invalidBody' }, { status: 400 })
  }

  const transaction = body.obj
  if (!transaction) return NextResponse.json({ error: 'invalidBody' }, { status: 400 })

  if (!verifyCallbackHmac(transaction, hmac)) {
    return NextResponse.json({ error: 'invalidSignature' }, { status: 401 })
  }

  const order = transaction.order as { merchant_order_id?: string } | undefined
  const merchantOrderId = order?.merchant_order_id
  if (!merchantOrderId) return NextResponse.json({ error: 'missingOrder' }, { status: 400 })

  const success = transaction.success === true

  try {
    const payload = await getPayloadClient()
    const found = await payload.find({
      collection: 'orders',
      where: { orderNumber: { equals: merchantOrderId } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const existing = found.docs[0]
    if (!existing) return NextResponse.json({ error: 'orderNotFound' }, { status: 404 })

    await payload.update({
      collection: 'orders',
      id: existing.id,
      data: {
        paymentStatus: success ? 'paid' : 'failed',
        paymentReference: String(transaction.id ?? ''),
        orderStatus: success && existing.orderStatus === 'pending' ? 'confirmed' : existing.orderStatus,
      },
      overrideAccess: true,
    })

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error('paymob callback failed', error)
    return NextResponse.json({ error: 'serverError' }, { status: 500 })
  }
}
