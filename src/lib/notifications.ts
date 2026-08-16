/**
 * Notification service. Every channel is an adapter behind one interface, so the
 * app never talks to WhatsApp or an SMS gateway directly. Missing credentials
 * degrade to a logged notification instead of an error — the shop can go live on
 * COD before any messaging contract is signed.
 */

export type NotificationChannel = 'whatsapp' | 'sms' | 'email' | 'log'

export type NotificationTemplate =
  | 'orderReceived'
  | 'orderConfirmed'
  | 'orderReady'
  | 'bookingReceived'
  | 'bookingConfirmed'
  | 'oilChangeDue'
  | 'oilEnquiryReceived'

export type NotificationInput = {
  channel: NotificationChannel
  to: string
  template: NotificationTemplate
  variables?: Record<string, string>
  locale?: 'ar' | 'en'
}

export type NotificationResult = { sent: boolean; channel: NotificationChannel; detail?: string }

const bodies: Record<NotificationTemplate, { ar: (v: Record<string, string>) => string; en: (v: Record<string, string>) => string }> = {
  orderReceived: {
    ar: (v) => `تم استلام طلبك رقم ${v.orderNumber}. الإجمالي ${v.total} ج.م. هنتواصل معك للتأكيد.`,
    en: (v) => `We received order ${v.orderNumber}. Total ${v.total} EGP. We will call you to confirm.`,
  },
  orderConfirmed: {
    ar: (v) => `تم تأكيد طلبك رقم ${v.orderNumber} وجاري التجهيز.`,
    en: (v) => `Order ${v.orderNumber} is confirmed and being prepared.`,
  },
  orderReady: {
    ar: (v) => `طلبك رقم ${v.orderNumber} جاهز للاستلام.`,
    en: (v) => `Order ${v.orderNumber} is ready for pickup.`,
  },
  bookingReceived: {
    ar: (v) => `تم استلام حجزك ${v.reference} يوم ${v.date} الساعة ${v.time}.`,
    en: (v) => `We received booking ${v.reference} on ${v.date} at ${v.time}.`,
  },
  bookingConfirmed: {
    ar: (v) => `تم تأكيد حجز الغسيل ${v.reference} يوم ${v.date} الساعة ${v.time}.`,
    en: (v) => `Your wash booking ${v.reference} on ${v.date} at ${v.time} is confirmed.`,
  },
  oilChangeDue: {
    ar: (v) => `موعد تغيير زيت سيارتك ${v.plate} اقترب. احجز الآن.`,
    en: (v) => `Your car ${v.plate} is due for an oil change. Book now.`,
  },
  oilEnquiryReceived: {
    ar: () => `استلمنا استفسارك عن الزيت المناسب. فني هيتواصل معك قريباً.`,
    en: () => `We received your oil enquiry. One of our technicians will call you shortly.`,
  },
}

const renderBody = (input: NotificationInput): string => {
  const locale = input.locale ?? 'ar'
  return bodies[input.template][locale](input.variables ?? {})
}

const sendWhatsApp = async (input: NotificationInput): Promise<NotificationResult> => {
  const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID
  const token = process.env.WHATSAPP_ACCESS_TOKEN
  if (!phoneNumberId || !token) return { sent: false, channel: 'whatsapp', detail: 'notConfigured' }

  const to = input.to.startsWith('0') ? `20${input.to.slice(1)}` : input.to

  try {
    const response = await fetch(`https://graph.facebook.com/v21.0/${phoneNumberId}/messages`, {
      method: 'POST',
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: renderBody(input) },
      }),
    })
    return { sent: response.ok, channel: 'whatsapp', detail: response.ok ? undefined : await response.text() }
  } catch (error) {
    return { sent: false, channel: 'whatsapp', detail: String(error) }
  }
}

const sendSms = async (input: NotificationInput): Promise<NotificationResult> => {
  if (!process.env.SMS_PROVIDER_API_KEY) return { sent: false, channel: 'sms', detail: 'notConfigured' }
  // Adapter point: plug in the local SMS gateway (Victory Link / SMSMisr / Twilio).
  console.info('[sms]', input.to, renderBody(input))
  return { sent: true, channel: 'sms' }
}

export const notify = async (input: NotificationInput): Promise<NotificationResult> => {
  const result =
    input.channel === 'whatsapp'
      ? await sendWhatsApp(input)
      : input.channel === 'sms'
        ? await sendSms(input)
        : { sent: false, channel: input.channel, detail: 'noAdapter' }

  if (!result.sent) {
    // Always leave a trace so staff can follow up manually.
    console.info(`[notification:${input.template}] → ${input.to}: ${renderBody(input)}`)
  }
  return result
}
