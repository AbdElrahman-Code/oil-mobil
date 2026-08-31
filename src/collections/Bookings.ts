import type { CollectionConfig } from 'payload'
import { isManagerial, isSalesOrAbove, staffOrOwnCustomerRecord } from '@/access'

export const Bookings: CollectionConfig = {
  slug: 'bookings',
  labels: { singular: { en: 'Booking', ar: 'حجز' }, plural: { en: 'Bookings', ar: 'الحجوزات' } },
  admin: {
    group: { en: 'Bookings', ar: 'الحجوزات' },
    // Car wash was retired from the storefront. Hidden rather than deleted so
    // the existing bookings and packages are not destroyed.
    hidden: true,
    useAsTitle: 'reference',
    defaultColumns: ['reference', 'contactName', 'serviceType', 'requestedDate', 'requestedTimeSlot', 'status'],
    description: 'Car wash and detailing appointments. Confirm or cancel with the Status field.',
    listSearchableFields: ['reference', 'contactPhone', 'contactName'],
  },
  access: {
    read: staffOrOwnCustomerRecord('customer'),
    create: () => true,
    update: isSalesOrAbove,
    delete: isManagerial,
  },
  fields: [
    {
      name: 'reference',
      type: 'text',
      unique: true,
      index: true,
      admin: { position: 'sidebar', readOnly: true },
      hooks: {
        beforeChange: [
          ({ value }) =>
            value ?? `WSH-${Date.now().toString(36).toUpperCase().slice(-6)}`,
        ],
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'contactName', type: 'text', required: true, admin: { width: '50%' } },
        { name: 'contactPhone', type: 'text', required: true, index: true, admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'customer',
          type: 'relationship',
          relationTo: 'customers',
          index: true,
          admin: { width: '50%', description: 'Linked automatically when a logged-in customer books.' },
        },
        {
          name: 'vehicle',
          type: 'relationship',
          relationTo: 'vehicles',
          admin: { width: '50%' },
          filterOptions: ({ data }) => (data?.customer ? { owner: { equals: data.customer } } : true),
        },
      ],
    },
    {
      name: 'serviceType',
      type: 'relationship',
      relationTo: 'washServices',
      required: true,
      admin: { description: 'Which package the customer booked.' },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'requestedDate',
          type: 'date',
          required: true,
          index: true,
          admin: {
            width: '50%',
            date: { pickerAppearance: 'dayOnly', displayFormat: 'dd MMM yyyy' },
          },
        },
        {
          name: 'requestedTimeSlot',
          type: 'text',
          required: true,
          admin: { width: '50%', description: 'Start time, e.g. 14:30.' },
        },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'pending',
      index: true,
      options: [
        { label: { en: 'Pending', ar: 'قيد الانتظار' }, value: 'pending' },
        { label: { en: 'Confirmed', ar: 'تم التأكيد' }, value: 'confirmed' },
        { label: { en: 'In progress', ar: 'جاري التنفيذ' }, value: 'inProgress' },
        { label: { en: 'Completed', ar: 'مكتمل' }, value: 'completed' },
        { label: { en: 'Cancelled', ar: 'ملغي' }, value: 'cancelled' },
        { label: { en: 'No show', ar: 'لم يحضر' }, value: 'noShow' },
      ],
    },
    { name: 'customerNote', type: 'textarea' },
    { name: 'staffNotes', type: 'textarea', admin: { description: 'Internal only.' } },
    {
      name: 'priceAtBooking',
      type: 'number',
      min: 0,
      admin: { position: 'sidebar', description: 'Package price when the booking was made.' },
    },
  ],
  timestamps: true,
}
