import type { CollectionConfig } from 'payload'
import { anyone, isStaff } from '@/access'
import { slugField } from '@/fields/slug'

export const VehicleModels: CollectionConfig = {
  slug: 'vehicleModels',
  labels: { singular: { en: 'Car Model', ar: 'موديل سيارة' }, plural: { en: 'Car Models', ar: 'موديلات السيارات' } },
  admin: {
    group: { en: 'Vehicle Reference Data', ar: 'بيانات السيارات المرجعية' },
    useAsTitle: 'name',
    defaultColumns: ['name', 'brand', 'yearFrom', 'yearTo', 'isActive'],
    description:
      'A model belongs to a brand and covers a range of years. List each engine variant sold in those years — the Oil Finder matches on brand + model + year + engine.',
  },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  defaultSort: 'name',
  fields: [
    {
      type: 'row',
      fields: [
        { name: 'name', type: 'text', required: true, index: true, admin: { width: '50%' } },
        {
          name: 'brand',
          type: 'relationship',
          relationTo: 'vehicleBrands',
          required: true,
          index: true,
          admin: { width: '50%' },
        },
      ],
    },
    slugField('name'),
    { name: 'nameAr', type: 'text', label: { en: 'Arabic name', ar: 'الاسم بالعربية' } },
    {
      type: 'row',
      fields: [
        {
          name: 'yearFrom',
          type: 'number',
          required: true,
          min: 1950,
          max: 2100,
          admin: { width: '50%', description: 'First model year sold.' },
        },
        {
          name: 'yearTo',
          type: 'number',
          min: 1950,
          max: 2100,
          admin: { width: '50%', description: 'Leave blank if still in production.' },
        },
      ],
    },
    {
      name: 'bodyType',
      type: 'select',
      options: [
        { label: { en: 'Sedan', ar: 'سيدان' }, value: 'sedan' },
        { label: { en: 'Hatchback', ar: 'هاتشباك' }, value: 'hatchback' },
        { label: { en: 'SUV / Crossover', ar: 'دفع رباعي / كروس أوفر' }, value: 'suv' },
        { label: { en: 'Pickup', ar: 'بيك أب' }, value: 'pickup' },
        { label: { en: 'Van / Minibus', ar: 'فان / ميكروباص' }, value: 'van' },
        { label: { en: 'Coupe', ar: 'كوبيه' }, value: 'coupe' },
      ],
    },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'engines',
      type: 'array',
      required: true,
      minRows: 1,
      label: { en: 'Engine variants', ar: 'أنواع المحركات' },
      labels: { singular: { en: 'Engine', ar: 'محرك' }, plural: { en: 'Engines', ar: 'المحركات' } },
      admin: {
        description:
          'Every engine option offered for this model, e.g. "1.6L Petrol 16V". Customers pick one of these in the Oil Finder.',
      },
      fields: [
        {
          type: 'row',
          fields: [
            {
              name: 'code',
              type: 'text',
              required: true,
              admin: { width: '35%', description: 'Short key used for matching, e.g. 1.6-petrol.' },
            },
            {
              name: 'label',
              type: 'text',
              required: true,
              localized: true,
              admin: { width: '40%', description: 'What the customer sees, e.g. 1.6L Petrol.' },
            },
            {
              name: 'fuelType',
              type: 'select',
              required: true,
              defaultValue: 'petrol',
              admin: { width: '25%' },
              options: [
                { label: { en: 'Petrol', ar: 'بنزين' }, value: 'petrol' },
                { label: { en: 'Diesel', ar: 'ديزل' }, value: 'diesel' },
                { label: { en: 'Hybrid', ar: 'هجين' }, value: 'hybrid' },
                { label: { en: 'Natural gas (CNG)', ar: 'غاز طبيعي' }, value: 'cng' },
                { label: { en: 'Electric', ar: 'كهرباء' }, value: 'electric' },
              ],
            },
          ],
        },
        {
          type: 'row',
          fields: [
            { name: 'displacementLiters', type: 'number', admin: { width: '50%', step: 0.1 } },
            { name: 'isTurbo', type: 'checkbox', label: { en: 'Turbocharged', ar: 'تيربو' }, admin: { width: '50%' } },
          ],
        },
      ],
    },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar', description: 'Uncheck to hide this model from the website.' },
    },
    { name: 'oilSpecifications', type: 'join', collection: 'oilSpecifications', on: 'vehicleModel' },
  ],
}
