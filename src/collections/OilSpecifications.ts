import type { CollectionConfig } from 'payload'
import { anyone, isStaff, isTechnicalOrAbove } from '@/access'

/**
 * The reference table the Oil Finder reads. One row = one model + year range +
 * engine variant, with the oil and filters that fit it.
 */
export const OilSpecifications: CollectionConfig = {
  slug: 'oilSpecifications',
  labels: {
    singular: { en: 'Oil Specification', ar: 'مواصفة زيت' },
    plural: { en: 'Oil Specifications', ar: 'مواصفات الزيوت' },
  },
  admin: {
    group: { en: 'Vehicle Reference Data', ar: 'بيانات السيارات المرجعية' },
    useAsTitle: 'title',
    defaultColumns: ['title', 'vehicleModel', 'engineCode', 'recommendedViscosity', 'yearFrom', 'yearTo'],
    description:
      'This is what powers the Oil Finder. Add one entry per model + year range + engine. If a car has no entry, the site shows a "we will confirm for you" message and logs an enquiry for you to answer.',
  },
  access: { read: anyone, create: isTechnicalOrAbove, update: isTechnicalOrAbove, delete: isStaff },
  fields: [
    {
      name: 'title',
      type: 'text',
      admin: {
        readOnly: true,
        position: 'sidebar',
        description: 'Generated automatically so this entry is easy to recognise in lists.',
      },
      hooks: {
        beforeChange: [
          async ({ data, req, value }) => {
            if (!data?.vehicleModel) return value
            try {
              const modelId =
                typeof data.vehicleModel === 'object' ? data.vehicleModel.id : data.vehicleModel
              const model = await req.payload.findByID({
                collection: 'vehicleModels',
                id: modelId,
                depth: 1,
                req,
              })
              const brand = typeof model.brand === 'object' && model.brand ? model.brand.name : ''
              const years = data.yearTo ? `${data.yearFrom}-${data.yearTo}` : `${data.yearFrom}+`
              return [brand, model.name, years, data.engineCode].filter(Boolean).join(' ')
            } catch {
              return value
            }
          },
        ],
      },
    },
    {
      type: 'row',
      fields: [
        {
          name: 'vehicleModel',
          type: 'relationship',
          relationTo: 'vehicleModels',
          required: true,
          index: true,
          admin: { width: '60%' },
        },
        {
          name: 'engineCode',
          type: 'text',
          required: true,
          index: true,
          admin: {
            width: '40%',
            description: 'Must match an engine "code" on the selected model, e.g. 1.6-petrol.',
          },
        },
      ],
    },
    {
      type: 'row',
      fields: [
        {
          name: 'yearFrom',
          type: 'number',
          required: true,
          min: 1950,
          max: 2100,
          admin: { width: '50%', description: 'This spec applies from this model year onwards.' },
        },
        {
          name: 'yearTo',
          type: 'number',
          min: 1950,
          max: 2100,
          admin: { width: '50%', description: 'Leave blank to apply to all newer years.' },
        },
      ],
    },
    {
      type: 'tabs',
      tabs: [
        {
          label: { en: 'Oil', ar: 'الزيت' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'recommendedViscosity',
                  type: 'text',
                  required: true,
                  admin: { width: '33%', placeholder: '5W-30', description: 'SAE grade, e.g. 5W-30.' },
                },
                {
                  name: 'requiredAPISpec',
                  type: 'text',
                  admin: { width: '33%', placeholder: 'API SN', description: 'Minimum API service class.' },
                },
                {
                  name: 'requiredACEASpec',
                  type: 'text',
                  admin: { width: '34%', placeholder: 'ACEA A3/B4' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'oilType',
                  type: 'select',
                  defaultValue: 'fullSynthetic',
                  admin: { width: '50%' },
                  options: [
                    { label: { en: 'Full synthetic', ar: 'صناعي بالكامل' }, value: 'fullSynthetic' },
                    { label: { en: 'Semi synthetic', ar: 'نصف صناعي' }, value: 'semiSynthetic' },
                    { label: { en: 'Mineral', ar: 'معدني' }, value: 'mineral' },
                  ],
                },
                {
                  name: 'requiredOilQuantityLiters',
                  type: 'number',
                  required: true,
                  min: 0.5,
                  max: 30,
                  admin: {
                    width: '50%',
                    step: 0.1,
                    description: 'Total litres for a full oil change, including filling the new filter.',
                  },
                },
              ],
            },
            {
              name: 'recommendedOilProduct',
              type: 'relationship',
              relationTo: 'products',
              admin: {
                description: 'The product we recommend first. Shown with an add-to-cart button.',
              },
              filterOptions: () => ({ productType: { equals: 'oil' } }),
            },
            {
              name: 'alternativeOilProducts',
              type: 'relationship',
              relationTo: 'products',
              hasMany: true,
              admin: { description: 'Shown as "other options that also fit your car".' },
              filterOptions: () => ({ productType: { equals: 'oil' } }),
            },
          ],
        },
        {
          label: { en: 'Filters', ar: 'الفلاتر' },
          fields: [
            {
              name: 'oilFilterPartNumber',
              type: 'text',
              admin: { description: 'Manufacturer part number for the oil filter.' },
            },
            {
              name: 'oilFilterProduct',
              type: 'relationship',
              relationTo: 'products',
              label: { en: 'Oil filter (product)', ar: 'فلتر الزيت (منتج)' },
              filterOptions: () => ({ productType: { equals: 'filter' } }),
            },
            {
              name: 'airFilterProduct',
              type: 'relationship',
              relationTo: 'products',
              label: { en: 'Air filter (product)', ar: 'فلتر الهواء (منتج)' },
              filterOptions: () => ({ productType: { equals: 'filter' } }),
            },
            {
              name: 'cabinFilterProduct',
              type: 'relationship',
              relationTo: 'products',
              label: { en: 'Cabin filter (product)', ar: 'فلتر المكيف (منتج)' },
              filterOptions: () => ({ productType: { equals: 'filter' } }),
            },
            {
              name: 'fuelFilterProduct',
              type: 'relationship',
              relationTo: 'products',
              label: { en: 'Fuel filter (product)', ar: 'فلتر البنزين (منتج)' },
              filterOptions: () => ({ productType: { equals: 'filter' } }),
            },
          ],
        },
        {
          label: { en: 'Change interval', ar: 'موعد التغيير' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'recommendedChangeIntervalKm',
                  type: 'number',
                  required: true,
                  defaultValue: 10000,
                  min: 1000,
                  admin: { width: '50%', description: 'Distance between oil changes, in kilometres.' },
                },
                {
                  name: 'recommendedChangeIntervalMonths',
                  type: 'number',
                  required: true,
                  defaultValue: 6,
                  min: 1,
                  max: 36,
                  admin: { width: '50%', description: 'Maximum time between changes, whichever comes first.' },
                },
              ],
            },
            {
              name: 'notes',
              type: 'richText',
              localized: true,
              admin: {
                description:
                  'Shown to the customer under the recommendation. Use for edge cases, e.g. "turbo engine — full synthetic only".',
              },
            },
          ],
        },
      ],
    },
  ],
}
