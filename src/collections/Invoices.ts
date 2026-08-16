import type { CollectionConfig } from 'payload'
import { isManagerial, isSalesOrAbove, staffOrOwnCustomerRecord } from '@/access'
import { nextSequentialNumber } from '@/lib/sequence'

export const Invoices: CollectionConfig = {
  slug: 'invoices',
  labels: { singular: { en: 'Invoice', ar: 'فاتورة' }, plural: { en: 'Invoices', ar: 'الفواتير' } },
  admin: {
    group: { en: 'Sales', ar: 'المبيعات' },
    useAsTitle: 'invoiceNumber',
    defaultColumns: ['invoiceNumber', 'customer', 'issueDate', 'total', 'status'],
    description:
      'Numbered sequentially per year and printable as a PDF. VAT fields are ready for Egyptian tax requirements.',
    listSearchableFields: ['invoiceNumber', 'customerName', 'taxRegistrationNumber'],
  },
  access: {
    read: staffOrOwnCustomerRecord('customer'),
    create: isSalesOrAbove,
    update: isManagerial,
    delete: isManagerial,
  },
  defaultSort: '-issueDate',
  fields: [
    {
      name: 'invoiceNumber',
      type: 'text',
      unique: true,
      index: true,
      admin: { position: 'sidebar', readOnly: true, description: 'Generated automatically. Never reused.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'customer',
          type: 'relationship',
          relationTo: 'customers',
          index: true,
          admin: { width: '50%' },
        },
        {
          name: 'customerName',
          type: 'text',
          required: true,
          admin: { width: '50%', description: 'Name printed on the invoice.' },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'issueDate',
          type: 'date',
          required: true,
          defaultValue: () => new Date().toISOString(),
          admin: { width: '33%', date: { pickerAppearance: 'dayOnly', displayFormat: 'dd MMM yyyy' } },
        },
        {
          name: 'source',
          type: 'select',
          required: true,
          defaultValue: 'order',
          admin: { width: '33%' },
          options: [
            { label: { en: 'Shop order', ar: 'طلب من المتجر' }, value: 'order' },
            { label: { en: 'Workshop service', ar: 'صيانة بالورشة' }, value: 'service' },
            { label: { en: 'Manual', ar: 'يدوي' }, value: 'manual' },
          ],
        },
        {
          name: 'status',
          type: 'select',
          required: true,
          defaultValue: 'issued',
          admin: { width: '34%' },
          options: [
            { label: { en: 'Issued', ar: 'صادرة' }, value: 'issued' },
            { label: { en: 'Paid', ar: 'مدفوعة' }, value: 'paid' },
            { label: { en: 'Cancelled', ar: 'ملغاة' }, value: 'cancelled' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'order', type: 'relationship', relationTo: 'orders', admin: { width: '50%' } },
        { name: 'serviceRecord', type: 'relationship', relationTo: 'serviceRecords', admin: { width: '50%' } },
      ],
    },
    {
      name: 'lineItems',
      type: 'array',
      required: true,
      minRows: 1,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'description', type: 'text', required: true, admin: { width: '46%' } },
            { name: 'quantity', type: 'number', required: true, defaultValue: 1, min: 0, admin: { width: '18%' } },
            { name: 'unitPrice', type: 'number', required: true, min: 0, admin: { width: '18%' } },
            {
              name: 'lineTotal',
              type: 'number',
              admin: { width: '18%', readOnly: true },
              hooks: {
                beforeChange: [
                  ({ siblingData }) =>
                    Number(siblingData?.quantity ?? 0) * Number(siblingData?.unitPrice ?? 0),
                ],
              },
            },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'subtotal', type: 'number', admin: { width: '25%', readOnly: true } },
        {
          name: 'vatRate',
          type: 'number',
          defaultValue: 14,
          min: 0,
          max: 100,
          admin: { width: '25%', description: 'VAT %. Egypt is 14% by default. Set 0 if not applicable.' },
        },
        { name: 'vatAmount', type: 'number', admin: { width: '25%', readOnly: true } },
        { name: 'total', type: 'number', admin: { width: '25%', readOnly: true } },
      ],
    },
    {
      type: 'collapsible',
      label: { en: 'Tax details', ar: 'البيانات الضريبية' },
      admin: { initCollapsed: true },
      fields: [
        { name: 'taxRegistrationNumber', type: 'text', admin: { description: 'Customer tax registration number, if they need a tax invoice.' } },
        { name: 'companyName', type: 'text' },
        { name: 'notes', type: 'textarea' },
      ],
    },
  ],
  hooks: {
    beforeChange: [
      async ({ data, operation, req }) => {
        const items = (data.lineItems ?? []) as { quantity?: number; unitPrice?: number }[]
        const subtotal = items.reduce(
          (sum, item) => sum + Number(item.quantity ?? 0) * Number(item.unitPrice ?? 0),
          0,
        )
        const vatAmount = (subtotal * Number(data.vatRate ?? 0)) / 100
        data.subtotal = Math.round(subtotal * 100) / 100
        data.vatAmount = Math.round(vatAmount * 100) / 100
        data.total = Math.round((subtotal + vatAmount) * 100) / 100

        if (operation === 'create' && !data.invoiceNumber) {
          data.invoiceNumber = await nextSequentialNumber({
            payload: req.payload,
            req,
            collection: 'invoices',
            field: 'invoiceNumber',
            prefix: 'INV',
          })
        }
        return data
      },
    ],
  },
  timestamps: true,
}
