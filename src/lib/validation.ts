import { z } from 'zod'

export const egyptianPhone = z
  .string()
  .trim()
  .transform((value) => {
    const digits = value.replace(/[^\d+]/g, '').replace(/^\+/, '')
    if (digits.startsWith('20')) return `0${digits.slice(2)}`
    if (digits.startsWith('0')) return digits
    return `0${digits}`
  })
  .refine((value) => /^01[0-2,5]\d{8}$/.test(value), {
    message: 'invalidPhone',
  })

export const addressSchema = z.object({
  governorate: z.string().trim().min(2),
  city: z.string().trim().min(2),
  street: z.string().trim().min(4),
  building: z.string().trim().optional(),
  apartment: z.string().trim().optional(),
  landmark: z.string().trim().optional(),
})

export const checkoutSchema = z
  .object({
    contactName: z.string().trim().min(2).max(80),
    contactPhone: egyptianPhone,
    fulfillmentMethod: z.enum(['delivery', 'pickup']),
    paymentMethod: z.enum(['cod', 'payAtPickup', 'paymob']),
    customerNote: z.string().trim().max(600).optional(),
    address: addressSchema.optional(),
    items: z
      .array(
        z.object({
          productId: z.number().int().positive(),
          quantity: z.number().int().min(1).max(99),
        }),
      )
      .min(1),
  })
  .refine((data) => data.fulfillmentMethod !== 'delivery' || Boolean(data.address), {
    message: 'addressRequired',
    path: ['address'],
  })

export type CheckoutInput = z.infer<typeof checkoutSchema>
