import type { CollectionConfig } from 'payload'
import { isSalesOrAbove, staffOrSelf } from '@/access'

/** Normalises Egyptian numbers to a single comparable form: 01XXXXXXXXX. */
export const normalisePhone = (input: string): string => {
  const digits = input.replace(/[^\d+]/g, '').replace(/^\+/, '')
  if (digits.startsWith('20')) return `0${digits.slice(2)}`
  if (digits.startsWith('0')) return digits
  return `0${digits}`
}

export const Customers: CollectionConfig = {
  slug: 'customers',
  labels: { singular: { en: 'Customer', ar: 'عميل' }, plural: { en: 'Customers', ar: 'العملاء' } },
  auth: {
    tokenExpiration: 60 * 60 * 24 * 30,
    maxLoginAttempts: 10,
    lockTime: 10 * 60 * 1000,
    // Customers sign in with the phone number the branch already has on file.
    loginWithUsername: { allowEmailLogin: true, requireEmail: false, requireUsername: true },
  },
  admin: {
    group: { en: 'Customers & Vehicles', ar: 'العملاء والسيارات' },
    useAsTitle: 'name',
    defaultColumns: ['name', 'phone', 'email', 'loyaltyPoints', 'createdAt'],
    description: 'Search by phone number — it is the fastest way to find a customer.',
    listSearchableFields: ['name', 'phone', 'email'],
  },
  access: {
    read: staffOrSelf,
    create: () => true, // public sign-up
    update: staffOrSelf,
    delete: isSalesOrAbove,
    admin: () => false, // customers never reach the staff admin panel
  },
  fields: [
    { name: 'name', type: 'text', required: true },
    {
      name: 'phone',
      type: 'text',
      required: true,
      unique: true,
      index: true,
      admin: { description: 'Primary lookup key. Stored as 01XXXXXXXXX.' },
      hooks: { beforeValidate: [({ value }) => (typeof value === 'string' ? normalisePhone(value) : value)] },
      validate: (value: string | null | undefined) => {
        if (!value) return 'Phone number is required.'
        return /^01[0-2,5]\d{8}$/.test(value) || 'Enter a valid Egyptian mobile number, e.g. 01012345678.'
      },
    },
    {
      name: 'preferredLanguage',
      type: 'select',
      defaultValue: 'ar',
      options: [
        { label: { en: 'Arabic', ar: 'العربية' }, value: 'ar' },
        { label: { en: 'English', ar: 'الإنجليزية' }, value: 'en' },
      ],
      admin: { description: 'Language used for SMS/WhatsApp notifications sent to this customer.' },
    },
    {
      name: 'addresses',
      type: 'array',
      labels: { singular: { en: 'Address', ar: 'عنوان' }, plural: { en: 'Addresses', ar: 'العناوين' } },
      admin: { initCollapsed: true },
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', admin: { width: '40%', placeholder: 'Home / Work' } },
            { name: 'governorate', type: 'text', required: true, admin: { width: '30%' } },
            { name: 'city', type: 'text', required: true, admin: { width: '30%' } },
          ],
        },
        { name: 'street', type: 'textarea', required: true },
        {
          type: 'row',
          fields: [
            { name: 'building', type: 'text', admin: { width: '33%' } },
            { name: 'apartment', type: 'text', admin: { width: '33%' } },
            { name: 'landmark', type: 'text', admin: { width: '34%' } },
          ],
        },
        { name: 'isDefault', type: 'checkbox', defaultValue: false },
      ],
    },
    {
      name: 'loyaltyPoints',
      type: 'number',
      defaultValue: 0,
      min: 0,
      access: { update: ({ req: { user } }) => Boolean(user && (user as { collection?: string }).collection === 'users') },
      admin: { position: 'sidebar' },
    },
    {
      name: 'notes',
      type: 'textarea',
      access: { read: ({ req: { user } }) => Boolean(user && (user as { collection?: string }).collection === 'users') },
      admin: { description: 'Internal notes. Never shown to the customer.' },
    },
    {
      name: 'vehicles',
      type: 'join',
      collection: 'vehicles',
      on: 'owner',
      admin: { description: 'Cars registered to this customer.' },
    },
    { name: 'orders', type: 'join', collection: 'orders', on: 'customer' },
    { name: 'bookings', type: 'join', collection: 'bookings', on: 'customer' },
  ],
  hooks: {
    beforeValidate: [
      ({ data }) => {
        // The login username is always the phone number — one identity, no confusion.
        if (data?.phone) data.username = normalisePhone(String(data.phone))
        return data
      },
    ],
  },
  timestamps: true,
}
