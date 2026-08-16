import type { GlobalConfig } from 'payload'
import { anyone, isStaff } from '@/access'

const linkFields = [
  {
    type: 'row' as const,
    fields: [
      { name: 'label', type: 'text' as const, required: true, localized: true, admin: { width: '50%' } },
      {
        name: 'href',
        type: 'text' as const,
        required: true,
        admin: { width: '50%', placeholder: '/shop', description: 'Internal path or full URL.' },
      },
    ],
  },
]

export const Navigation: GlobalConfig = {
  slug: 'navigation',
  label: { en: 'Menus', ar: 'القوائم' },
  admin: {
    group: { en: 'Content', ar: 'المحتوى' },
    description: 'The links in the top menu and in the footer. Drag to reorder.',
  },
  access: { read: anyone, update: isStaff },
  fields: [
    {
      name: 'header',
      type: 'array',
      label: { en: 'Header menu', ar: 'القائمة العلوية' },
      fields: [
        ...linkFields,
        {
          name: 'children',
          type: 'array',
          label: { en: 'Dropdown items', ar: 'قائمة منسدلة' },
          admin: { description: 'Leave empty for a plain link.' },
          fields: linkFields,
        },
      ],
    },
    {
      name: 'footerColumns',
      type: 'array',
      label: { en: 'Footer columns', ar: 'أعمدة الفوتر' },
      maxRows: 4,
      fields: [
        { name: 'title', type: 'text', required: true, localized: true },
        { name: 'links', type: 'array', fields: linkFields },
      ],
    },
    {
      name: 'footerNote',
      type: 'text',
      localized: true,
      admin: { description: 'Small line at the very bottom, e.g. copyright.' },
    },
  ],
}
