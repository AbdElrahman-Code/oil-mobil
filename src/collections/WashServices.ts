import type { CollectionConfig } from 'payload'
import { anyone, isManagerial, isStaff } from '@/access'
import { slugField } from '@/fields/slug'

export const WashServices: CollectionConfig = {
  slug: 'washServices',
  labels: {
    singular: { en: 'Wash / Detailing Service', ar: 'خدمة غسيل' },
    plural: { en: 'Wash & Detailing Services', ar: 'خدمات الغسيل والتلميع' },
  },
  admin: {
    group: { en: 'Bookings', ar: 'الحجوزات' },
    // Car wash was retired from the storefront. Hidden rather than deleted so
    // the existing bookings and packages are not destroyed.
    hidden: true,
    useAsTitle: 'name',
    defaultColumns: ['name', 'price', 'durationMinutes', 'isActive'],
    description:
      'Your wash and detailing packages. Add a new package here and it appears on the booking page immediately.',
  },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isManagerial },
  defaultSort: 'displayOrder',
  fields: [
    { name: 'name', type: 'text', required: true, localized: true },
    slugField('name'),
    { name: 'description', type: 'textarea', localized: true },
    {
      type: 'row',
      fields: [
        {
          name: 'price',
          type: 'number',
          required: true,
          min: 0,
          admin: { width: '33%', description: 'Price in EGP.' },
        },
        {
          name: 'durationMinutes',
          type: 'number',
          required: true,
          defaultValue: 45,
          min: 5,
          admin: { width: '33%', description: 'How long a bay is occupied. Used for time slots.' },
        },
        {
          name: 'displayOrder',
          type: 'number',
          defaultValue: 100,
          admin: { width: '34%', description: 'Lower numbers appear first.' },
        },
      ],
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'includes',
      type: 'array',
      label: { en: 'What is included', ar: 'ماذا تشمل' },
      admin: { description: 'Bullet points shown on the package card.' },
      fields: [{ name: 'item', type: 'text', required: true, localized: true }],
    },
    {
      name: 'isPopular',
      type: 'checkbox',
      admin: { position: 'sidebar', description: 'Shows a "Most popular" badge.' },
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar', description: 'Untick to stop taking bookings for this package.' },
    },
  ],
}
