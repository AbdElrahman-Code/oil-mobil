import type { CollectionConfig } from 'payload'
import { anyone, isManagerial, isStaff } from '@/access'
import { slugField } from '@/fields/slug'
import { pageBlocks } from '@/blocks/page-blocks'
import { homepageBlocks } from '@/blocks'

/**
 * Free-form content pages — About, Contact, FAQ and anything the shop adds
 * later. Built from the same block library as the homepage, so a new page is a
 * content task, never a code change.
 */
export const Pages: CollectionConfig = {
  slug: 'pages',
  labels: { singular: { en: 'Page', ar: 'صفحة' }, plural: { en: 'Pages', ar: 'الصفحات' } },
  admin: {
    group: { en: 'Content', ar: 'المحتوى' },
    useAsTitle: 'title',
    defaultColumns: ['title', 'slug', 'showInHeader', 'showInFooter', 'updatedAt'],
    description:
      'Build a page by stacking sections. The address is the slug in the sidebar, e.g. "about" becomes /about.',
    preview: (doc) => `/${doc?.slug}`,
    livePreview: { url: ({ data }) => `/en/${data?.slug}` },
  },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isManagerial },
  defaultSort: 'displayOrder',
  versions: { drafts: true },
  fields: [
    { name: 'title', type: 'text', required: true, localized: true },
    slugField('title'),
    {
      name: 'sections',
      type: 'blocks',
      label: { en: 'Page sections', ar: 'أقسام الصفحة' },
      labels: { singular: { en: 'Section', ar: 'قسم' }, plural: { en: 'Sections', ar: 'الأقسام' } },
      // Page-specific sections first, then everything the homepage can use.
      blocks: [...pageBlocks, ...homepageBlocks],
      admin: { initCollapsed: true },
    },
    {
      type: 'collapsible',
      label: { en: 'SEO', ar: 'تحسين محركات البحث' },
      admin: { initCollapsed: true },
      fields: [
        { name: 'metaTitle', type: 'text', localized: true },
        { name: 'metaDescription', type: 'textarea', localized: true, maxLength: 180 },
        { name: 'ogImage', type: 'upload', relationTo: 'media' },
      ],
    },
    {
      name: 'showInHeader',
      type: 'checkbox',
      defaultValue: false,
      admin: { position: 'sidebar', description: 'Add a link to the top menu.' },
    },
    {
      name: 'showInFooter',
      type: 'checkbox',
      defaultValue: true,
      admin: { position: 'sidebar', description: 'Add a link to the footer.' },
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
