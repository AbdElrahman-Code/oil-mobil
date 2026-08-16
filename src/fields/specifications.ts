import type { Field } from 'payload'

/**
 * Free-form key/value specs. Lets a battery and an oil filter live in the same
 * collection with completely different spec sheets and no schema change.
 */
export const specificationsField: Field = {
  name: 'specifications',
  type: 'array',
  label: { en: 'Specifications', ar: 'المواصفات' },
  labels: {
    singular: { en: 'Specification', ar: 'مواصفة' },
    plural: { en: 'Specifications', ar: 'المواصفات' },
  },
  admin: {
    description:
      'Any spec you want shown on the product page, e.g. "Viscosity" / "5W-30". Add as many rows as you need.',
    initCollapsed: true,
  },
  fields: [
    {
      type: 'row',
      fields: [
        {
          name: 'label',
          type: 'text',
          required: true,
          localized: true,
          admin: { width: '40%' },
        },
        {
          name: 'value',
          type: 'text',
          required: true,
          localized: true,
          admin: { width: '60%' },
        },
      ],
    },
  ],
}
