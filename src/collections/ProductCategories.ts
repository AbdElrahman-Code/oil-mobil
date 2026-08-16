import type { CollectionConfig } from 'payload'
import { anyone, isManagerial, isStaff } from '@/access'
import { slugField } from '@/fields/slug'

export const ProductCategories: CollectionConfig = {
  slug: 'productCategories',
  labels: {
    singular: { en: 'Category', ar: 'قسم' },
    plural: { en: 'Product Categories', ar: 'أقسام المنتجات' },
  },
  admin: {
    group: { en: 'Shop', ar: 'المتجر' },
    useAsTitle: 'name',
    defaultColumns: ['name', 'parent', 'displayOrder', 'showInNav'],
    description:
      'The shop menu. Leave "Parent category" empty for a top-level section; pick a parent to nest a sub-category under it. Drag rows to reorder, or set the order number.',
  },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isManagerial },
  defaultSort: 'displayOrder',
  fields: [
    { name: 'name', type: 'text', required: true, localized: true, index: true },
    slugField('name'),
    {
      name: 'parent',
      type: 'relationship',
      relationTo: 'productCategories',
      admin: { description: 'Leave empty for a top-level category.' },
      filterOptions: ({ id }) => (id ? { id: { not_equals: id } } : true),
    },
    { name: 'description', type: 'textarea', localized: true },
    {
      name: 'image',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Used on the homepage category tiles.' },
    },
    {
      name: 'icon',
      type: 'select',
      defaultValue: 'droplet',
      admin: { description: 'Small icon shown next to the category name.' },
      options: [
        { label: 'Oil drop', value: 'droplet' },
        { label: 'Filter', value: 'filter' },
        { label: 'Battery', value: 'battery' },
        { label: 'Sparkle (care)', value: 'sparkles' },
        { label: 'Wrench (parts)', value: 'wrench' },
        { label: 'Car', value: 'car' },
        { label: 'Package', value: 'package' },
      ],
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 100,
      admin: { position: 'sidebar', description: 'Lower numbers appear first.' },
    },
    {
      name: 'showInNav',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar', description: 'Show this category in the main menu.' },
    },
    {
      name: 'showOnHomepage',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Feature it in the homepage categories section.' },
    },
  ],
}
