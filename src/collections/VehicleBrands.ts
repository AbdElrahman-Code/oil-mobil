import type { CollectionConfig } from 'payload'
import { anyone, isStaff } from '@/access'
import { slugField } from '@/fields/slug'

export const VehicleBrands: CollectionConfig = {
  slug: 'vehicleBrands',
  labels: { singular: { en: 'Car Brand', ar: 'ماركة سيارة' }, plural: { en: 'Car Brands', ar: 'ماركات السيارات' } },
  admin: {
    group: { en: 'Vehicle Reference Data', ar: 'بيانات السيارات المرجعية' },
    useAsTitle: 'name',
    defaultColumns: ['name', 'country', 'isActive'],
    description:
      'The car makers customers can pick from. Add a brand here first, then add its models.',
  },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  defaultSort: 'name',
  fields: [
    { name: 'name', type: 'text', required: true, index: true },
    slugField('name'),
    { name: 'nameAr', type: 'text', label: { en: 'Arabic name', ar: 'الاسم بالعربية' } },
    {
      name: 'logo',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Shown in the Oil Finder brand picker.' },
    },
    { name: 'country', type: 'text', admin: { description: 'Country of origin, e.g. Japan.' } },
    {
      name: 'isActive',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar', description: 'Uncheck to hide this brand from the website.' },
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 100,
      admin: { position: 'sidebar', description: 'Lower numbers appear first.' },
    },
    { name: 'models', type: 'join', collection: 'vehicleModels', on: 'brand' },
  ],
}
