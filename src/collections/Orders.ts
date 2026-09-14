import type { CollectionConfig } from 'payload'
import { isManagerial, isSalesOrAbove, staffOrOwnCustomerRecord } from '@/access'
import { nextSequentialNumber } from '@/lib/sequence'

export const ORDER_STATUSES = [
  'pending',
  'confirmed',
  'preparing',
  'outForDelivery',
  'readyForPickup',
  'completed',
  'cancelled',
] as const

export const Orders: CollectionConfig = {
  slug: 'orders',
  labels: { singular: { en: 'Order', ar: 'طلب' }, plural: { en: 'Orders', ar: 'الطلبات' } },
  admin: {
    group: { en: 'Sales', ar: 'المبيعات' },
    useAsTitle: 'orderNumber',
    defaultColumns: ['orderNumber', 'customer', 'orderStatus', 'paymentStatus', 'total', 'createdAt'],
    description:
      'Move an order through the pipeline with the Status field. Stock is deducted the moment you set it to Confirmed.',
    listSearchableFields: ['orderNumber', 'contactPhone'],
  },
  access: {
    read: staffOrOwnCustomerRecord('customer'),
    create: () => true, // guest checkout
    update: isSalesOrAbove,
    delete: isManagerial,
  },
  fields: [
    {
      name: 'orderNumber',
      type: 'text',
      unique: true,
      index: true,
      admin: { position: 'sidebar', readOnly: true, description: 'Generated automatically.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'customer',
          type: 'relationship',
          relationTo: 'customers',
          index: true,
          admin: { width: '50%', description: 'Empty for guest checkout.' },
        },
        {
          name: 'contactPhone',
          type: 'text',
          required: true,
          index: true,
          admin: { width: '50%', description: 'Phone we call about this order.' },
        },
      ],
    },
    { name: 'contactName', type: 'text', required: true },
    {
      name: 'items',
      type: 'array',
      required: true,
      minRows: 1,
      labels: { singular: { en: 'Item', ar: 'صنف' }, plural: { en: 'Items', ar: 'الأصناف' } },
      admin: { description: 'Prices are copied in when the order is placed, so later price changes do not alter old orders.' },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'product',
              type: 'relationship',
              relationTo: 'products',
              required: true,
              admin: { width: '40%' },
            },
            { name: 'quantity', type: 'number', required: true, min: 1, defaultValue: 1, admin: { width: '20%' } },
            {
              name: 'priceAtPurchase',
              type: 'number',
              required: true,
              min: 0,
              admin: { width: '20%', description: 'EGP each.' },
            },
            {
              name: 'lineTotal',
              type: 'number',
              admin: { width: '20%', readOnly: true },
              hooks: {
                beforeChange: [
                  ({ siblingData }) =>
                    Number(siblingData?.quantity ?? 0) * Number(siblingData?.priceAtPurchase ?? 0),
                ],
              },
            },
          ],
        },
        { name: 'nameSnapshot', type: 'text', admin: { readOnly: true, description: 'Product name at time of order.' } },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: { en: 'Fulfilment', ar: 'التسليم' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'fulfillmentMethod',
                  type: 'select',
                  required: true,
                  defaultValue: 'delivery',
                  admin: { width: '50%' },
                  options: [
                    { label: { en: 'Delivery', ar: 'توصيل' }, value: 'delivery' },
                    { label: { en: 'Pick up from branch', ar: 'استلام من الفرع' }, value: 'pickup' },
                  ],
                },
                {
                  name: 'orderStatus',
                  type: 'select',
                  required: true,
                  defaultValue: 'pending',
                  index: true,
                  admin: { width: '50%' },
                  options: [
                    { label: { en: 'Pending', ar: 'قيد الانتظار' }, value: 'pending' },
                    { label: { en: 'Confirmed', ar: 'تم التأكيد' }, value: 'confirmed' },
                    { label: { en: 'Preparing', ar: 'جاري التجهيز' }, value: 'preparing' },
                    { label: { en: 'Out for delivery', ar: 'خرج للتوصيل' }, value: 'outForDelivery' },
                    { label: { en: 'Ready for pickup', ar: 'جاهز للاستلام' }, value: 'readyForPickup' },
                    { label: { en: 'Completed', ar: 'مكتمل' }, value: 'completed' },
                    { label: { en: 'Cancelled', ar: 'ملغي' }, value: 'cancelled' },
                  ],
                },
              ],
            },
            {
              name: 'deliveryAddress',
              type: 'group',
              admin: { condition: (data) => data?.fulfillmentMethod === 'delivery' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'governorate', type: 'text', admin: { width: '50%' } },
                    { name: 'city', type: 'text', admin: { width: '50%' } },
                  ],
                },
                { name: 'street', type: 'textarea' },
                {
                  type: 'row',
                  fields: [
                    { name: 'building', type: 'text', admin: { width: '33%' } },
                    { name: 'apartment', type: 'text', admin: { width: '33%' } },
                    { name: 'landmark', type: 'text', admin: { width: '34%' } },
                  ],
                },
              ],
            },
            { name: 'customerNote', type: 'textarea', admin: { description: 'Anything the customer asked for.' } },
            { name: 'staffNotes', type: 'textarea', admin: { description: 'Internal only.' } },
          ],
        },
        {
          label: { en: 'Payment', ar: 'الدفع' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'paymentMethod',
                  type: 'select',
                  required: true,
                  defaultValue: 'cod',
                  admin: { width: '50%' },
                  options: [
                    { label: { en: 'Cash on delivery', ar: 'الدفع عند الاستلام' }, value: 'cod' },
                    { label: { en: 'Pay at branch', ar: 'الدفع في الفرع' }, value: 'payAtPickup' },
                    { label: { en: 'Order via WhatsApp', ar: 'طلب عبر واتساب' }, value: 'whatsapp' },
                    { label: { en: 'Card online (Paymob)', ar: 'بطاقة أونلاين' }, value: 'paymob' },
                  ],
                },
                {
                  name: 'paymentStatus',
                  type: 'select',
                  required: true,
                  defaultValue: 'unpaid',
                  admin: { width: '50%' },
                  options: [
                    { label: { en: 'Unpaid', ar: 'غير مدفوع' }, value: 'unpaid' },
                    { label: { en: 'Paid', ar: 'مدفوع' }, value: 'paid' },
                    { label: { en: 'Refunded', ar: 'مسترد' }, value: 'refunded' },
                    { label: { en: 'Failed', ar: 'فشل' }, value: 'failed' },
                  ],
                },
              ],
            },
            {
              name: 'paymentReference',
              type: 'text',
              admin: { description: 'Paymob transaction id, filled in automatically for card payments.' },
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'subtotal',
                  type: 'number',
                  admin: { width: '25%', readOnly: true },
                },
                {
                  name: 'deliveryFee',
                  type: 'number',
                  defaultValue: 0,
                  min: 0,
                  admin: { width: '25%' },
                },
                {
                  name: 'discount',
                  type: 'number',
                  defaultValue: 0,
                  min: 0,
                  admin: { width: '25%' },
                },
                {
                  name: 'total',
                  type: 'number',
                  admin: { width: '25%', readOnly: true },
                },
              ],
            },
          ],
        },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        // Totals are always recomputed server-side; never trust a client-sent total.
        const items = (data.items ?? []) as { quantity?: number; priceAtPurchase?: number }[]
        const subtotal = items.reduce(
          (sum, item) => sum + Number(item.quantity ?? 0) * Number(item.priceAtPurchase ?? 0),
          0,
        )
        data.subtotal = Math.round(subtotal * 100) / 100
        data.total =
          Math.round((subtotal + Number(data.deliveryFee ?? 0) - Number(data.discount ?? 0)) * 100) / 100

        if (operation === 'create' && !data.orderNumber) {
          data.orderNumber = await nextSequentialNumber({
            payload: req.payload,
            req,
            collection: 'orders',
            field: 'orderNumber',
            prefix: 'ORD',
          })
        }
        return data
      },
    ],
    afterChange: [
      async ({ doc, previousDoc, operation, req }) => {
        // Deduct stock exactly once, on the transition into `confirmed`.
        const becameConfirmed =
          doc.orderStatus === 'confirmed' &&
          (operation === 'create' || previousDoc?.orderStatus !== 'confirmed')
        if (!becameConfirmed) return doc

        for (const item of doc.items ?? []) {
          const productId = typeof item.product === 'object' ? item.product?.id : item.product
          if (!productId) continue
          try {
            const product = await req.payload.findByID({
              collection: 'products',
              id: productId,
              depth: 0,
              req,
            })
            await req.payload.update({
              collection: 'products',
              id: productId,
              data: { stockQuantity: Math.max(0, (product.stockQuantity ?? 0) - (item.quantity ?? 0)) },
              req,
              context: { skipRevalidate: true },
            })
          } catch (error) {
            req.payload.logger.error({ err: error }, `Could not adjust stock for product ${productId}`)
          }
        }
        return doc
      },
    ],
  },
  timestamps: true,
}
