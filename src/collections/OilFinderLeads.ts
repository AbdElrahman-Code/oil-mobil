import type { CollectionConfig } from 'payload'
import { isManagerial, isSalesOrAbove, isStaff } from '@/access'

/**
 * Created automatically whenever the Oil Finder cannot match a car. Turns a dead
 * end into a sales lead the shop can answer — and a to-do list of missing specs.
 */
export const OilFinderLeads: CollectionConfig = {
  slug: 'oilFinderLeads',
  labels: {
    singular: { en: 'Oil Enquiry', ar: 'استفسار زيت' },
    plural: { en: 'Oil Enquiries (unmatched cars)', ar: 'استفسارات الزيوت' },
  },
  admin: {
    group: { en: 'Workshop', ar: 'الورشة' },
    useAsTitle: 'summary',
    defaultColumns: ['summary', 'contactPhone', 'status', 'createdAt'],
    description:
      'A customer looked up a car we have no oil specification for. Answer them, then add the missing spec so the site can answer it automatically next time.',
  },
  access: { read: isStaff, create: () => true, update: isSalesOrAbove, delete: isManagerial },
  defaultSort: '-createdAt',
  fields: [
    {
      name: 'summary',
      type: 'text',
      admin: { readOnly: true, position: 'sidebar' },
      hooks: {
        beforeChange: [
          ({ data }) =>
            [data?.brandName, data?.modelName, data?.year, data?.engineLabel]
              .filter(Boolean)
              .join(' '),
        ],
      },
    },
    {
      type: 'row',
      fields: [
        { name: 'brandName', type: 'text', admin: { width: '25%' } },
        { name: 'modelName', type: 'text', admin: { width: '25%' } },
        { name: 'year', type: 'number', admin: { width: '25%' } },
        { name: 'engineLabel', type: 'text', admin: { width: '25%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'brand', type: 'relationship', relationTo: 'vehicleBrands', admin: { width: '50%' } },
        { name: 'vehicleModel', type: 'relationship', relationTo: 'vehicleModels', admin: { width: '50%' } },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'mileageKm', type: 'number', admin: { width: '50%' } },
        {
          name: 'engineCondition',
          type: 'select',
          admin: { width: '50%' },
          options: [
            { label: { en: 'Excellent', ar: 'ممتازة' }, value: 'excellent' },
            { label: { en: 'Good', ar: 'جيدة' }, value: 'good' },
            { label: { en: 'Consumes oil', ar: 'يستهلك زيت' }, value: 'consumesOil' },
            { label: { en: 'Recently rebuilt', ar: 'تم عمل عمرة حديثاً' }, value: 'rebuilt' },
          ],
        },
      ],
    },
    {
      type: 'row',
      fields: [
        { name: 'contactName', type: 'text', admin: { width: '50%' } },
        { name: 'contactPhone', type: 'text', index: true, admin: { width: '50%' } },
      ],
    },
    {
      name: 'status',
      type: 'select',
      required: true,
      defaultValue: 'new',
      index: true,
      options: [
        { label: { en: 'New', ar: 'جديد' }, value: 'new' },
        { label: { en: 'Contacted', ar: 'تم التواصل' }, value: 'contacted' },
        { label: { en: 'Spec added', ar: 'تمت إضافة المواصفة' }, value: 'specAdded' },
        { label: { en: 'Closed', ar: 'مغلق' }, value: 'closed' },
      ],
    },
    { name: 'staffNotes', type: 'textarea' },
  ],
  timestamps: true,
}
