import type { Block } from 'payload'

/**
 * Homepage sections. The admin adds, removes and reorders these visually — no
 * deploy needed to change a campaign or swap the hero.
 */

export const HeroBlock: Block = {
  slug: 'hero',
  labels: { singular: { en: 'Hero', ar: 'البانر الرئيسي' }, plural: { en: 'Heroes', ar: 'البانرات' } },
  imageAltText: 'Full-width headline with background image and buttons',
  fields: [
    { name: 'eyebrow', type: 'text', localized: true, admin: { description: 'Small line above the headline.' } },
    { name: 'headline', type: 'text', required: true, localized: true },
    { name: 'subheadline', type: 'textarea', localized: true },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Large landscape photo, at least 1920px wide.' },
    },
    {
      name: 'buttons',
      type: 'array',
      maxRows: 2,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true, localized: true, admin: { width: '40%' } },
            { name: 'href', type: 'text', required: true, admin: { width: '40%', placeholder: '/oil-finder' } },
            {
              name: 'style',
              type: 'select',
              defaultValue: 'primary',
              admin: { width: '20%' },
              options: [
                { label: 'Primary', value: 'primary' },
                { label: 'Outline', value: 'outline' },
              ],
            },
          ],
        },
      ],
    },
  ],
}

export const FeaturedCategoriesBlock: Block = {
  slug: 'featuredCategories',
  labels: {
    singular: { en: 'Category tiles', ar: 'بطاقات الأقسام' },
    plural: { en: 'Category tiles', ar: 'بطاقات الأقسام' },
  },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'subheading', type: 'textarea', localized: true },
    {
      name: 'categories',
      type: 'relationship',
      relationTo: 'productCategories',
      hasMany: true,
      admin: { description: 'Leave empty to show every category marked "Show on homepage".' },
    },
  ],
}

export const FeaturedProductsBlock: Block = {
  slug: 'featuredProducts',
  labels: {
    singular: { en: 'Product carousel', ar: 'عرض منتجات' },
    plural: { en: 'Product carousels', ar: 'عروض المنتجات' },
  },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'subheading', type: 'textarea', localized: true },
    {
      name: 'source',
      type: 'select',
      defaultValue: 'featured',
      options: [
        { label: { en: 'Products marked as featured', ar: 'المنتجات المميزة' }, value: 'featured' },
        { label: { en: 'Newest products', ar: 'أحدث المنتجات' }, value: 'newest' },
        { label: { en: 'Products I pick below', ar: 'منتجات أختارها' }, value: 'manual' },
      ],
    },
    {
      name: 'products',
      type: 'relationship',
      relationTo: 'products',
      hasMany: true,
      admin: { condition: (_, siblingData) => siblingData?.source === 'manual' },
    },
    { name: 'limit', type: 'number', defaultValue: 8, min: 2, max: 24 },
    { name: 'ctaHref', type: 'text', admin: { placeholder: '/shop' } },
  ],
}

export const OilFinderCtaBlock: Block = {
  slug: 'oilFinderCta',
  labels: {
    singular: { en: 'Oil Finder call-to-action', ar: 'دعوة لاستخدام دليل الزيوت' },
    plural: { en: 'Oil Finder call-to-actions', ar: 'دعوات دليل الزيوت' },
  },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'body', type: 'textarea', localized: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
    { name: 'buttonLabel', type: 'text', localized: true },
  ],
}

export const PromoBannerBlock: Block = {
  slug: 'promoBanner',
  labels: {
    singular: { en: 'Promotion banner', ar: 'بانر عروض' },
    plural: { en: 'Promotion banners', ar: 'بانرات العروض' },
  },
  fields: [
    { name: 'heading', type: 'text', required: true, localized: true },
    { name: 'body', type: 'textarea', localized: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      type: 'row',
      fields: [
        { name: 'buttonLabel', type: 'text', localized: true, admin: { width: '50%' } },
        { name: 'buttonHref', type: 'text', admin: { width: '50%' } },
      ],
    },
    {
      name: 'theme',
      type: 'select',
      defaultValue: 'accent',
      options: [
        { label: { en: 'Accent colour', ar: 'لون العلامة' }, value: 'accent' },
        { label: { en: 'Dark', ar: 'داكن' }, value: 'dark' },
        { label: { en: 'Light', ar: 'فاتح' }, value: 'light' },
      ],
    },
  ],
}

export const ServicesBlock: Block = {
  slug: 'services',
  labels: { singular: { en: 'Services grid', ar: 'شبكة الخدمات' }, plural: { en: 'Services grids', ar: 'شبكات الخدمات' } },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'subheading', type: 'textarea', localized: true },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      maxRows: 8,
      fields: [
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'description', type: 'textarea', localized: true },
        {
          name: 'icon',
          type: 'select',
          defaultValue: 'droplet',
          options: [
            { label: 'Oil drop', value: 'droplet' },
            { label: 'Filter', value: 'filter' },
            { label: 'Battery', value: 'battery' },
            { label: 'Car wash', value: 'sparkles' },
            { label: 'Wrench', value: 'wrench' },
            { label: 'Shield', value: 'shield' },
            { label: 'Clock', value: 'clock' },
            { label: 'Truck', value: 'truck' },
          ],
        },
        { name: 'href', type: 'text' },
      ],
    },
  ],
}

export const StatsBlock: Block = {
  slug: 'stats',
  labels: { singular: { en: 'Trust numbers', ar: 'أرقام الثقة' }, plural: { en: 'Trust numbers', ar: 'أرقام الثقة' } },
  fields: [
    {
      name: 'items',
      type: 'array',
      minRows: 2,
      maxRows: 4,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'value', type: 'text', required: true, admin: { width: '30%', placeholder: '25,000+' } },
            { name: 'label', type: 'text', required: true, localized: true, admin: { width: '70%' } },
          ],
        },
      ],
    },
  ],
}

export const TestimonialsBlock: Block = {
  slug: 'testimonials',
  labels: { singular: { en: 'Testimonials', ar: 'آراء العملاء' }, plural: { en: 'Testimonials', ar: 'آراء العملاء' } },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      fields: [
        { name: 'quote', type: 'textarea', required: true, localized: true },
        {
          type: 'row',
          fields: [
            { name: 'author', type: 'text', required: true, admin: { width: '40%' } },
            { name: 'carModel', type: 'text', admin: { width: '40%', placeholder: 'Toyota Corolla 2019' } },
            { name: 'rating', type: 'number', defaultValue: 5, min: 1, max: 5, admin: { width: '20%' } },
          ],
        },
      ],
    },
  ],
}

export const BrandLogosBlock: Block = {
  slug: 'brandLogos',
  labels: { singular: { en: 'Brand logos', ar: 'شعارات الماركات' }, plural: { en: 'Brand logos', ar: 'شعارات الماركات' } },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    {
      name: 'logos',
      type: 'array',
      minRows: 1,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'image', type: 'upload', relationTo: 'media', required: true, admin: { width: '50%' } },
            { name: 'name', type: 'text', admin: { width: '50%' } },
          ],
        },
      ],
    },
  ],
}

export const RichTextBlock: Block = {
  slug: 'richText',
  labels: { singular: { en: 'Text section', ar: 'قسم نصي' }, plural: { en: 'Text sections', ar: 'أقسام نصية' } },
  fields: [
    { name: 'content', type: 'richText', localized: true, required: true },
    {
      name: 'width',
      type: 'select',
      defaultValue: 'narrow',
      options: [
        { label: { en: 'Narrow', ar: 'ضيق' }, value: 'narrow' },
        { label: { en: 'Full width', ar: 'عرض كامل' }, value: 'full' },
      ],
    },
  ],
}

export const homepageBlocks: Block[] = [
  HeroBlock,
  ServicesBlock,
  OilFinderCtaBlock,
  FeaturedCategoriesBlock,
  FeaturedProductsBlock,
  PromoBannerBlock,
  StatsBlock,
  TestimonialsBlock,
  BrandLogosBlock,
  RichTextBlock,
]
