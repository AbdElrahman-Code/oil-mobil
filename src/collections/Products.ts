import type { CollectionConfig } from 'payload'
import { anyone, isManagerialField, isSalesOrAbove, isStaff } from '@/access'
import { slugField } from '@/fields/slug'
import { specificationsField } from '@/fields/specifications'

export const Products: CollectionConfig = {
  slug: 'products',
  labels: { singular: { en: 'Product', ar: 'منتج' }, plural: { en: 'Products', ar: 'المنتجات' } },
  admin: {
    group: { en: 'Shop', ar: 'المتجر' },
    useAsTitle: 'name',
    defaultColumns: ['name', 'sku', 'category', 'price', 'stockQuantity', 'isPublished'],
    description:
      'Everything you sell. Prices are in Egyptian pounds. A product is only visible on the website when "Published" is ticked.',
    listSearchableFields: ['name', 'sku', 'brand'],
    preview: (doc) => `/products/${doc?.slug}`,
  },
  access: {
    read: ({ req: { user } }) => {
      if (user && (user as { collection?: string }).collection === 'users') return true
      return { isPublished: { equals: true } }
    },
    create: isSalesOrAbove,
    update: isSalesOrAbove,
    delete: isStaff,
  },
  fields: [
    {
      type: 'tabs',
      tabs: [
        {
          label: { en: 'Basics', ar: 'الأساسيات' },
          fields: [
            { name: 'name', type: 'text', required: true, localized: true, index: true },
            {
              type: 'row',
              fields: [
                {
                  name: 'sku',
                  type: 'text',
                  required: true,
                  unique: true,
                  index: true,
                  admin: { width: '50%', description: 'Your internal product code. Must be unique.' },
                },
                {
                  name: 'brand',
                  type: 'text',
                  admin: { width: '50%', description: 'Manufacturer, e.g. Mobil, Bosch, Valvoline.' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'category',
                  type: 'relationship',
                  relationTo: 'productCategories',
                  required: true,
                  index: true,
                  admin: { width: '50%' },
                },
                {
                  name: 'productType',
                  type: 'select',
                  required: true,
                  defaultValue: 'accessory',
                  index: true,
                  admin: {
                    width: '50%',
                    description:
                      'Controls where the product can be used, e.g. only "Engine oil" items can be attached to an oil specification.',
                  },
                  options: [
                    { label: { en: 'Engine oil', ar: 'زيت محرك' }, value: 'oil' },
                    { label: { en: 'Filter', ar: 'فلتر' }, value: 'filter' },
                    { label: { en: 'Battery', ar: 'بطارية' }, value: 'battery' },
                    { label: { en: 'Car care', ar: 'العناية بالسيارة' }, value: 'care' },
                    { label: { en: 'Accessory', ar: 'إكسسوار' }, value: 'accessory' },
                    { label: { en: 'Spare part', ar: 'قطعة غيار' }, value: 'sparePart' },
                  ],
                },
              ],
            },
            {
              name: 'shortDescription',
              type: 'textarea',
              localized: true,
              maxLength: 220,
              admin: { description: 'One or two lines, shown on product cards and search results.' },
            },
            { name: 'description', type: 'richText', localized: true },
            slugField('name'),
          ],
        },
        {
          label: { en: 'Price & stock', ar: 'السعر والمخزون' },
          fields: [
            {
              type: 'row',
              fields: [
                {
                  name: 'price',
                  type: 'number',
                  required: true,
                  min: 0,
                  access: { update: isManagerialField },
                  admin: { width: '33%', description: 'Selling price in EGP.' },
                },
                {
                  name: 'compareAtPrice',
                  type: 'number',
                  min: 0,
                  access: { update: isManagerialField },
                  admin: {
                    width: '33%',
                    description: 'Old price, shown crossed out. Leave empty if not on sale.',
                  },
                },
                {
                  name: 'costPrice',
                  type: 'number',
                  min: 0,
                  access: { read: isManagerialField, update: isManagerialField },
                  admin: { width: '34%', description: 'What you paid. Used for profit reports. Never shown publicly.' },
                },
              ],
            },
            {
              type: 'row',
              fields: [
                {
                  name: 'stockQuantity',
                  type: 'number',
                  required: true,
                  defaultValue: 0,
                  min: 0,
                  admin: { width: '50%', description: 'Reduced automatically when an order is confirmed.' },
                },
                {
                  name: 'lowStockThreshold',
                  type: 'number',
                  defaultValue: 5,
                  min: 0,
                  admin: { width: '50%', description: 'Below this, the product shows up in the low-stock report.' },
                },
              ],
            },
            {
              name: 'allowBackorder',
              type: 'checkbox',
              defaultValue: false,
              admin: { description: 'Let customers order this even when stock is zero.' },
            },
            {
              name: 'unit',
              type: 'select',
              defaultValue: 'piece',
              options: [
                { label: { en: 'Piece', ar: 'قطعة' }, value: 'piece' },
                { label: { en: 'Litre', ar: 'لتر' }, value: 'litre' },
                { label: { en: 'Pack', ar: 'عبوة' }, value: 'pack' },
              ],
            },
            {
              name: 'volumeLiters',
              type: 'number',
              min: 0,
              admin: {
                step: 0.1,
                condition: (data) => data?.productType === 'oil',
                description: 'Bottle size in litres. Used to work out how many bottles a car needs.',
              },
            },
          ],
        },
        {
          label: { en: 'Images & specs', ar: 'الصور والمواصفات' },
          fields: [
            {
              name: 'images',
              type: 'upload',
              relationTo: 'media',
              hasMany: true,
              admin: { description: 'First image is used as the main product photo.' },
            },
            specificationsField,
          ],
        },
        {
          label: { en: 'Fitment', ar: 'التوافق' },
          fields: [
            {
              name: 'compatibleVehicles',
              type: 'relationship',
              relationTo: 'vehicleModels',
              hasMany: true,
              admin: {
                description:
                  'Optional. Car models this part fits — powers the "fits your car" badge and the filter lookup.',
              },
            },
            {
              name: 'oilAttributes',
              type: 'group',
              admin: { condition: (data) => data?.productType === 'oil' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    { name: 'viscosity', type: 'text', admin: { width: '33%', placeholder: '5W-30' } },
                    { name: 'apiSpec', type: 'text', admin: { width: '33%', placeholder: 'API SP' } },
                    { name: 'aceaSpec', type: 'text', admin: { width: '34%', placeholder: 'ACEA A3/B4' } },
                  ],
                },
                {
                  name: 'oilType',
                  type: 'select',
                  options: [
                    { label: { en: 'Full synthetic', ar: 'صناعي بالكامل' }, value: 'fullSynthetic' },
                    { label: { en: 'Semi synthetic', ar: 'نصف صناعي' }, value: 'semiSynthetic' },
                    { label: { en: 'Mineral', ar: 'معدني' }, value: 'mineral' },
                  ],
                },
              ],
            },
            {
              name: 'filterAttributes',
              type: 'group',
              admin: { condition: (data) => data?.productType === 'filter' },
              fields: [
                {
                  type: 'row',
                  fields: [
                    {
                      name: 'filterType',
                      type: 'select',
                      admin: { width: '50%' },
                      options: [
                        { label: { en: 'Oil filter', ar: 'فلتر زيت' }, value: 'oil' },
                        { label: { en: 'Air filter', ar: 'فلتر هواء' }, value: 'air' },
                        { label: { en: 'Cabin filter', ar: 'فلتر مكيف' }, value: 'cabin' },
                        { label: { en: 'Fuel filter', ar: 'فلتر بنزين' }, value: 'fuel' },
                      ],
                    },
                    {
                      name: 'partNumber',
                      type: 'text',
                      index: true,
                      admin: { width: '50%', description: 'Manufacturer part number.' },
                    },
                  ],
                },
              ],
            },
          ],
        },
        {
          label: { en: 'SEO', ar: 'تحسين محركات البحث' },
          fields: [
            { name: 'metaTitle', type: 'text', localized: true },
            { name: 'metaDescription', type: 'textarea', localized: true, maxLength: 180 },
          ],
        },
      ],
    },
    {
      name: 'isPublished',
      type: 'checkbox',
      defaultValue: true,
      index: true,
      admin: { position: 'sidebar', description: 'Untick to hide from the website without deleting.' },
    },
    {
      name: 'isFeatured',
      type: 'checkbox',
      defaultValue: false,
      index: true,
      admin: { position: 'sidebar', description: 'Show in the "Featured products" homepage section.' },
    },
  ],
  timestamps: true,
}
