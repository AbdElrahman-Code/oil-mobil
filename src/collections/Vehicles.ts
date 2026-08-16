import type { CollectionConfig } from 'payload'
import { isStaff, isTechnicalOrAboveField, staffOrOwnCustomerRecord } from '@/access'
import { slugify } from '@/fields/slug'

const randomToken = (length = 8): string => {
  const alphabet = 'abcdefghijkmnpqrstuvwxyz23456789'
  let out = ''
  for (let i = 0; i < length; i++) out += alphabet[Math.floor(Math.random() * alphabet.length)]
  return out
}

export const Vehicles: CollectionConfig = {
  slug: 'vehicles',
  labels: { singular: { en: 'Vehicle', ar: 'سيارة' }, plural: { en: 'Vehicles', ar: 'السيارات' } },
  admin: {
    group: { en: 'Customers & Vehicles', ar: 'العملاء والسيارات' },
    useAsTitle: 'plateNumber',
    defaultColumns: ['plateNumber', 'owner', 'brand', 'model', 'manufacturingYear', 'nextOilChangeDate'],
    description:
      'Every car we service. Search by plate number. The next oil change is worked out automatically from the last service, but you can override it.',
    listSearchableFields: ['plateNumber', 'oilViscosity'],
  },
  access: {
    read: staffOrOwnCustomerRecord('owner'),
    create: ({ req: { user } }) => Boolean(user),
    update: staffOrOwnCustomerRecord('owner'),
    delete: isStaff,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'plateNumber',
          type: 'text',
          required: true,
          unique: true,
          index: true,
          admin: { width: '50%', description: 'Egyptian plate, e.g. "ط ك ع 1234".' },
        },
        {
          name: 'owner',
          type: 'relationship',
          relationTo: 'customers',
          required: true,
          index: true,
          admin: { width: '50%' },
        },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: { en: 'Car details', ar: 'بيانات السيارة' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'brand',
                  type: 'relationship',
                  relationTo: 'vehicleBrands',
                  required: true,
                  admin: { width: '33%' },
                },
                {
                  name: 'model',
                  type: 'relationship',
                  relationTo: 'vehicleModels',
                  required: true,
                  admin: { width: '33%' },
                  filterOptions: ({ data }) =>
                    data?.brand ? { brand: { equals: data.brand } } : true,
                },
                {
                  name: 'manufacturingYear',
                  type: 'number',
                  required: true,
                  min: 1950,
                  max: 2100,
                  admin: { width: '34%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'engineType',
                  type: 'text',
                  admin: {
                    width: '50%',
                    description: 'Engine code from the model, e.g. 1.6-petrol.',
                  },
                },
                {
                  name: 'currentMileage',
                  type: 'number',
                  min: 0,
                  admin: { width: '50%', description: 'Latest odometer reading, in kilometres.' },
                },
              ],
            },
            { name: 'colour', type: 'text' },
            { name: 'vin', type: 'text', label: { en: 'Chassis / VIN', ar: 'رقم الشاسيه' } },
          ],
        },
        {
          label: { en: 'Oil & filters in use', ar: 'الزيت والفلاتر الحالية' },
          fields: [
            {
              type: 'row',
              fields: [
                { name: 'oilBrandUsed', type: 'text', admin: { width: '33%' } },
                { name: 'oilViscosity', type: 'text', admin: { width: '33%', placeholder: '5W-30' } },
                { name: 'oilFilterUsed', type: 'text', admin: { width: '34%' } },
              ],
            },
          ],
        },
        {
          label: { en: 'Service schedule', ar: 'مواعيد الصيانة' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'lastServiceDate',
                  type: 'date',
                  admin: { width: '50%', date: { pickerAppearance: 'dayOnly', displayFormat: 'dd MMM yyyy' } },
                },
                {
                  name: 'lastServiceMileage',
                  type: 'number',
                  min: 0,
                  admin: { width: '50%' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'nextOilChangeMileage',
                  type: 'number',
                  min: 0,
                  admin: {
                    width: '50%',
                    description: 'Filled in automatically after a service. You can overwrite it.',
                  },
                },
                {
                  name: 'nextOilChangeDate',
                  type: 'date',
                  index: true,
                  admin: {
                    width: '50%',
                    date: { pickerAppearance: 'dayOnly', displayFormat: 'dd MMM yyyy' },
                    description: 'Drives the reminder list on the dashboard.',
                  },
                },
              ],
            },
            {
              name: 'reminderSent',
              type: 'checkbox',
              defaultValue: false,
              admin: {
                position: 'sidebar',
                description: 'Cleared automatically each time the car is serviced.',
              },
            },
          ],
        },
      ],
    },
    {
      name: 'qrCodeSlug',
      type: 'text',
      unique: true,
      index: true,
      admin: {
        position: 'sidebar',
        readOnly: true,
        description: 'Used by the vehicle QR sticker. Generated automatically.',
      },
      hooks: {
        beforeChange: [
          ({ value, data }) =>
            value ?? `${slugify(String(data?.plateNumber ?? 'car'))}-${randomToken()}`,
        ],
      },
    },
    {
      name: 'serviceHistory',
      type: 'join',
      collection: 'serviceRecords',
      on: 'vehicle',
      admin: { description: 'Everything we have ever done to this car.' },
    },
    {
      name: 'staffNotes',
      type: 'textarea',
      access: { read: isTechnicalOrAboveField },
      admin: { description: 'Internal only — never shown to the customer.' },
    },
  ],
  timestamps: true,
}
