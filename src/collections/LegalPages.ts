import type { CollectionConfig } from 'payload'
import { anyone, isManagerial, isStaff } from '@/access'
import { slugField } from '@/fields/slug'

/**
 * Terms, privacy and returns. Plain content pages the shop can rewrite without
 * a developer — seeded with a usable starting draft rather than lorem ipsum.
 */
export const LegalPages: CollectionConfig = {
  slug: 'legalPages',
  labels: {
    singular: { en: 'Legal Page', ar: 'صفحة قانونية' },
    plural: { en: 'Legal Pages', ar: 'الصفحات القانونية' },
  },
  admin: {
    group: { en: 'Content', ar: 'المحتوى' },
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'showInFooter', 'updatedAt'],
    description:
      'Terms of Service, Privacy Policy and Return Policy. Edit the text here — the footer links update automatically.',
  },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isManagerial },
  defaultSort: 'displayOrder',
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    slugField('title'),
    {
      name: 'content',
      type: 'richText',
      required: true,
      localized: true,
      admin: { description: 'The full page text. Headings and lists are supported.' },
    },
    {
      name: 'lastReviewed',
      type: 'date',
      admin: {
        position: 'sidebar',
        date: { pickerAppearance: 'dayOnly', displayFormat: 'dd MMM yyyy' },
        description: 'Shown to visitors as the "last updated" date.',
      },
    },
    {
      name: 'showInFooter',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar' },
    },
    {
      name: 'displayOrder',
      type: 'number',
      defaultValue: 100,
      admin: { position: 'sidebar', description: 'Lower numbers appear first.' },
    },
  ],
  timestamps: true,
}
