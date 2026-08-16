import type { GlobalConfig } from 'payload'
import { anyone, isStaff } from '@/access'
import { homepageBlocks } from '@/blocks'

export const Homepage: GlobalConfig = {
  slug: 'homepage',
  label: { en: 'Homepage', ar: 'الصفحة الرئيسية' },
  admin: {
    group: { en: 'Content', ar: 'المحتوى' },
    description:
      'Build the homepage by adding sections and dragging them into the order you want. Changes go live as soon as you save.',
    preview: () => '/',
  },
  access: { read: anyone, update: isStaff },
  versions: { drafts: true },
  fields: [
    {
      name: 'sections',
      type: 'blocks',
      label: { en: 'Homepage sections', ar: 'أقسام الصفحة الرئيسية' },
      labels: { singular: { en: 'Section', ar: 'قسم' }, plural: { en: 'Sections', ar: 'الأقسام' } },
      blocks: homepageBlocks,
      admin: { initCollapsed: true },
    },
    {
      name: 'seo',
      type: 'group',
      label: { en: 'Page SEO', ar: 'SEO الصفحة' },
      fields: [
        { name: 'metaTitle', type: 'text', localized: true },
        { name: 'metaDescription', type: 'textarea', localized: true, maxLength: 180 },
      ],
    },
  ],
}
