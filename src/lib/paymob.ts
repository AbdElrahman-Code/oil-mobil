import crypto from 'crypto'

/**
 * Paymob (Accept) card payments.
 *
 * Without API keys the module reports itself as unconfigured and checkout falls
 * back to cash on delivery — so the shop can go live before the merchant account
 * is approved, and switch on card payments from Site Settings later.
 */

export const isPaymobConfigured = (): boolean =>
  Boolean(process.env.PAYMOB_API_KEY && process.env.PAYMOB_INTEGRATION_ID)

type BillingData = {
  firstName: string
  lastName: string
  phone: string
  email?: string
  street?: string
  city?: string
}

const API = 'https://accept.paymob.com/api'

const authenticate = async (): Promise<string> => {
  const response = await fetch(`${API}/auth/tokens`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ api_key: process.env.PAYMOB_API_KEY }),
  })
  if (!response.ok) throw new Error(`Paymob auth failed: ${response.status}`)
  const data = (await response.json()) as { token: string }
  return data.token
}

const registerOrder = async ({
  token,
  amountCents,
  merchantOrderId,
}: {
  token: string
  amountCents: number
  merchantOrderId: string
}): Promise<number> => {
  const response = await fetch(`${API}/ecommerce/orders`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: token,
      delivery_needed: false,
      amount_cents: amountCents,
      currency: 'EGP',
      merchant_order_id: merchantOrderId,
      items: [],
    }),
  })
  if (!response.ok) throw new Error(`Paymob order failed: ${response.status}`)
  const data = (await response.json()) as { id: number }
  return data.id
}

const requestPaymentKey = async ({
  token,
  orderId,
  amountCents,
  billing,
}: {
  token: string
  orderId: number
  amountCents: number
  billing: BillingData
}): Promise<string> => {
  const response = await fetch(`${API}/acceptance/payment_keys`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      auth_token: token,
      amount_cents: amountCents,
      expiration: 3600,
      order_id: orderId,
      currency: 'EGP',
      integration_id: Number(process.env.PAYMOB_INTEGRATION_ID),
      billing_data: {
        first_name: billing.firstName,
        last_name: billing.lastName || 'NA',
        phone_number: billing.phone,
        email: billing.email || 'customer@example.com',
        street: billing.street || 'NA',
        city: billing.city || 'Cairo',
        country: 'EG',
        apartment: 'NA',
        floor: 'NA',
        building: 'NA',
        shipping_method: 'NA',
        postal_code: 'NA',
        state: 'NA',
      },
    }),
  })
  if (!response.ok) throw new Error(`Paymob payment key failed: ${response.status}`)
  const data = (await response.json()) as { token: string }
  return data.token
}

export type PaymentSession =
  | { ok: true; iframeUrl: string; paymobOrderId: number }
  | { ok: false; reason: 'notConfigured' | 'failed' }

/** Creates a hosted-checkout session for an order. */
export const createPaymentSession = async ({
  amountEgp,
  merchantOrderId,
  billing,
}: {
  amountEgp: number
  merchantOrderId: string
  billing: BillingData
}): Promise<PaymentSession> => {
  if (!isPaymobConfigured()) return { ok: false, reason: 'notConfigured' }

  try {
    const amountCents = Math.round(amountEgp * 100)
    const token = await authenticate()
    const paymobOrderId = await registerOrder({ token, amountCents, merchantOrderId })
    const paymentKey = await requestPaymentKey({ token, orderId: paymobOrderId, amountCents, billing })

    return {
      ok: true,
      paymobOrderId,
      iframeUrl: `https://accept.paymob.com/api/acceptance/iframes/${process.env.PAYMOB_IFRAME_ID}?payment_token=${paymentKey}`,
    }
  } catch (error) {
    console.error('createPaymentSession failed', error)
    return { ok: false, reason: 'failed' }
  }
}

/**
 * Paymob signs callbacks with an HMAC over a fixed, ordered field list.
 * Never trust a callback that fails this check.
 */
const HMAC_FIELDS = [
  'amount_cents',
  'created_at',
  'currency',
  'error_occured',
  'has_parent_transaction',
  'id',
  'integration_id',
  'is_3d_secure',
  'is_auth',
  'is_capture',
  'is_refunded',
  'is_standalone_payment',
  'is_voided',
  'order.id',
  'owner',
  'pending',
  'source_data.pan',
  'source_data.sub_type',
  'source_data.type',
  'success',
] as const

const readPath = (object: Record<string, unknown>, path: string): string => {
  const value = path.split('.').reduce<unknown>((acc, key) => {
    if (acc && typeof acc === 'object') return (acc as Record<string, unknown>)[key]
    return undefined
  }, object)
  if (typeof value === 'boolean') return value ? 'true' : 'false'
  return value === undefined || value === null ? '' : String(value)
}

export const verifyCallbackHmac = (payload: Record<string, unknown>, receivedHmac: string): boolean => {
  const secret = process.env.PAYMOB_HMAC_SECRET
  if (!secret || !receivedHmac) return false

  const concatenated = HMAC_FIELDS.map((field) => readPath(payload, field)).join('')
  const expected = crypto.createHmac('sha512', secret).update(concatenated).digest('hex')

  const a = Buffer.from(expected)
  const b = Buffer.from(receivedHmac)
  return a.length === b.length && crypto.timingSafeEqual(a, b)
}
