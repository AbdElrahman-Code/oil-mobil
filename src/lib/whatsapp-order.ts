/**
 * Builds the WhatsApp message for an order. Everything the shop needs to act
 * on it is in the text — items, quantities, prices, totals, who, where — so the
 * customer never has to type any of it, and the shop never has to ask.
 */

export type WhatsAppLine = { name: string; quantity: number; price: number; sku?: string | null }

export type WhatsAppOrderInput = {
  locale: 'ar' | 'en'
  siteName?: string | null
  orderNumber?: string | null
  items: WhatsAppLine[]
  subtotal: number
  deliveryFee: number
  total: number
  customer?: { name?: string; phone?: string } | null
  fulfillment?: 'delivery' | 'pickup' | null
  address?: { governorate?: string; city?: string; street?: string; building?: string; apartment?: string; landmark?: string } | null
  car?: string | null
  note?: string | null
}

const money = (value: number, locale: 'ar' | 'en') =>
  new Intl.NumberFormat(locale === 'ar' ? 'ar-EG' : 'en-EG', { maximumFractionDigits: 0 }).format(value) +
  (locale === 'ar' ? ' ج.م' : ' EGP')

export const buildWhatsAppOrderMessage = (input: WhatsAppOrderInput): string => {
  const ar = input.locale === 'ar'
  const L: string[] = []

  L.push(ar ? `مرحباً ${input.siteName ?? ''}`.trim() : `Hello ${input.siteName ?? ''}`.trim())
  L.push(ar ? 'عايز أطلب الطلب التالي:' : 'I would like to place this order:')
  if (input.orderNumber) L.push(ar ? `رقم الطلب: ${input.orderNumber}` : `Order number: ${input.orderNumber}`)
  L.push('')

  input.items.forEach((item, index) => {
    const line = `${index + 1}. ${item.name} × ${item.quantity} — ${money(item.price * item.quantity, input.locale)}`
    L.push(item.sku ? `${line} (${item.sku})` : line)
  })

  L.push('')
  L.push(ar ? `الإجمالي قبل التوصيل: ${money(input.subtotal, input.locale)}` : `Subtotal: ${money(input.subtotal, input.locale)}`)
  L.push(
    ar
      ? `التوصيل: ${input.deliveryFee > 0 ? money(input.deliveryFee, input.locale) : 'مجاني'}`
      : `Delivery: ${input.deliveryFee > 0 ? money(input.deliveryFee, input.locale) : 'Free'}`,
  )
  L.push(ar ? `*الإجمالي: ${money(input.total, input.locale)}*` : `*Total: ${money(input.total, input.locale)}*`)
  L.push('')

  if (input.customer?.name || input.customer?.phone) {
    L.push(ar ? 'بياناتي:' : 'My details:')
    if (input.customer.name) L.push(ar ? `الاسم: ${input.customer.name}` : `Name: ${input.customer.name}`)
    if (input.customer.phone) L.push(ar ? `الموبايل: ${input.customer.phone}` : `Phone: ${input.customer.phone}`)
  }

  if (input.fulfillment === 'pickup') {
    L.push(ar ? 'الاستلام: من الفرع' : 'Fulfilment: pick up from the branch')
  } else if (input.fulfillment === 'delivery' || input.address) {
    const a = input.address
    const parts = [a?.street, a?.building && (ar ? `عمارة ${a.building}` : `Bldg ${a.building}`), a?.apartment && (ar ? `شقة ${a.apartment}` : `Apt ${a.apartment}`), a?.city, a?.governorate]
      .filter(Boolean)
      .join(', ')
    L.push(ar ? `التوصيل إلى: ${parts || '—'}` : `Deliver to: ${parts || '—'}`)
    if (a?.landmark) L.push(ar ? `علامة مميزة: ${a.landmark}` : `Landmark: ${a.landmark}`)
  }

  if (input.car) L.push(ar ? `السيارة: ${input.car}` : `Car: ${input.car}`)
  if (input.note) L.push(ar ? `ملاحظات: ${input.note}` : `Notes: ${input.note}`)

  L.push('')
  L.push(ar ? 'من فضلك أكدوا الطلب والموعد. شكراً 🙏' : 'Please confirm the order and timing. Thank you 🙏')

  return L.join('\n')
}

/** wa.me link with the message pre-filled. Numbers are normalised to E.164 without "+". */
export const whatsAppLink = (phone: string, message: string): string => {
  const digits = phone.replace(/\D/g, '')
  const intl = digits.startsWith('0') ? `20${digits.slice(1)}` : digits
  return `https://wa.me/${intl}?text=${encodeURIComponent(message)}`
}
