import type { Block } from 'payload'

/**
 * Section types for CMS-built pages (About, Contact, FAQ, and anything the shop
 * adds later). Same philosophy as the homepage: the admin composes a page from
 * these, no developer involved.
 */

export const PageHeroBlock: Block = {
  slug: 'pageHero',
  labels: { singular: { en: 'Page header', ar: 'رأس الصفحة' }, plural: { en: 'Page headers', ar: 'رؤوس الصفحات' } },
  fields: [
    { name: 'eyebrow', type: 'text', localized: true },
    { name: 'heading', type: 'text', required: true, localized: true },
    { name: 'subheading', type: 'textarea', localized: true },
    {
      name: 'backgroundImage',
      type: 'upload',
      relationTo: 'media',
      admin: { description: 'Wide photo behind the title. Darkened automatically so text stays readable.' },
    },
    {
      name: 'align',
      type: 'select',
      defaultValue: 'start',
      options: [
        { label: { en: 'Left / start', ar: 'البداية' }, value: 'start' },
        { label: { en: 'Centred', ar: 'في المنتصف' }, value: 'center' },
      ],
    },
  ],
}

export const ImageTextBlock: Block = {
  slug: 'imageText',
  labels: { singular: { en: 'Image + text', ar: 'صورة ونص' }, plural: { en: 'Image + text', ar: 'صور ونصوص' } },
  fields: [
    { name: 'eyebrow', type: 'text', localized: true },
    { name: 'heading', type: 'text', localized: true },
    { name: 'body', type: 'richText', localized: true },
    { name: 'image', type: 'upload', relationTo: 'media' },
    {
      name: 'imageSide',
      type: 'select',
      defaultValue: 'end',
      admin: { description: 'Which side the photo sits on. Mirrors automatically in Arabic.' },
      options: [
        { label: { en: 'Start', ar: 'البداية' }, value: 'start' },
        { label: { en: 'End', ar: 'النهاية' }, value: 'end' },
      ],
    },
    {
      name: 'bullets',
      type: 'array',
      label: { en: 'Highlights', ar: 'نقاط مميزة' },
      fields: [{ name: 'text', type: 'text', required: true, localized: true }],
    },
    {
      type: 'row',
      fields: [
        { name: 'buttonLabel', type: 'text', localized: true, admin: { width: '50%' } },
        { name: 'buttonHref', type: 'text', admin: { width: '50%' } },
      ],
    },
  ],
}

export const StepsBlock: Block = {
  slug: 'steps',
  labels: { singular: { en: 'How it works', ar: 'كيف تعمل' }, plural: { en: 'How it works', ar: 'كيف تعمل' } },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'subheading', type: 'textarea', localized: true },
    {
      name: 'items',
      type: 'array',
      minRows: 2,
      maxRows: 6,
      fields: [
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'description', type: 'textarea', localized: true },
      ],
    },
  ],
}

export const FaqBlock: Block = {
  slug: 'faq',
  labels: { singular: { en: 'FAQ', ar: 'أسئلة شائعة' }, plural: { en: 'FAQs', ar: 'أسئلة شائعة' } },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'subheading', type: 'textarea', localized: true },
    {
      name: 'items',
      type: 'array',
      minRows: 1,
      labels: { singular: { en: 'Question', ar: 'سؤال' }, plural: { en: 'Questions', ar: 'الأسئلة' } },
      fields: [
        { name: 'question', type: 'text', required: true, localized: true },
        { name: 'answer', type: 'textarea', required: true, localized: true },
      ],
    },
  ],
}

export const ContactBlock: Block = {
  slug: 'contact',
  labels: { singular: { en: 'Contact details', ar: 'بيانات التواصل' }, plural: { en: 'Contact details', ar: 'بيانات التواصل' } },
  fields: [
    {
      name: 'heading',
      type: 'text',
      localized: true,
      admin: { description: 'Phone, WhatsApp, branches and opening hours come from Site Settings.' },
    },
    { name: 'subheading', type: 'textarea', localized: true },
    {
      name: 'showMap',
      type: 'checkbox',
      defaultValue: true,
      admin: { description: 'Show a map for branches that have coordinates.' },
    },
  ],
}

export const GalleryBlock: Block = {
  slug: 'gallery',
  labels: { singular: { en: 'Photo gallery', ar: 'معرض صور' }, plural: { en: 'Photo galleries', ar: 'معارض الصور' } },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    {
      name: 'images',
      type: 'upload',
      relationTo: 'media',
      hasMany: true,
      required: true,
      admin: { description: 'Three to eight photos work best.' },
    },
  ],
}

export const CtaBandBlock: Block = {
  slug: 'ctaBand',
  labels: { singular: { en: 'Call to action band', ar: 'شريط دعوة للإجراء' }, plural: { en: 'Call to action bands', ar: 'أشرطة دعوة' } },
  fields: [
    { name: 'heading', type: 'text', required: true, localized: true },
    { name: 'body', type: 'textarea', localized: true },
    { name: 'backgroundImage', type: 'upload', relationTo: 'media' },
    {
      name: 'buttons',
      type: 'array',
      maxRows: 2,
      fields: [
        {
          type: 'row',
          fields: [
            { name: 'label', type: 'text', required: true, localized: true, admin: { width: '40%' } },
            { name: 'href', type: 'text', required: true, admin: { width: '40%' } },
            {
              name: 'style',
              type: 'select',
              defaultValue: 'accent',
              admin: { width: '20%' },
              options: [
                { label: 'Accent (red)', value: 'accent' },
                { label: 'Primary (blue)', value: 'primary' },
                { label: 'Outline', value: 'outline' },
              ],
            },
          ],
        },
      ],
    },
  ],
}

export const ValuesBlock: Block = {
  slug: 'values',
  labels: { singular: { en: 'Values / promises', ar: 'قيم ووعود' }, plural: { en: 'Values / promises', ar: 'قيم ووعود' } },
  fields: [
    { name: 'heading', type: 'text', localized: true },
    { name: 'subheading', type: 'textarea', localized: true },
    {
      name: 'items',
      type: 'array',
      minRows: 2,
      maxRows: 6,
      fields: [
        {
          name: 'icon',
          type: 'select',
          defaultValue: 'shield',
          options: [
            { label: 'Shield', value: 'shield' },
            { label: 'Wrench', value: 'wrench' },
            { label: 'Clock', value: 'clock' },
            { label: 'Droplet', value: 'droplet' },
            { label: 'Truck', value: 'truck' },
            { label: 'Sparkles', value: 'sparkles' },
            { label: 'Car', value: 'car' },
            { label: 'Battery', value: 'battery' },
          ],
        },
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'description', type: 'textarea', localized: true },
      ],
    },
  ],
}

export const pageBlocks: Block[] = [
  PageHeroBlock,
  ImageTextBlock,
  ValuesBlock,
  StepsBlock,
  GalleryBlock,
  FaqBlock,
  ContactBlock,
  CtaBandBlock,
]
