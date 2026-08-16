import path from 'path'
import type { CollectionConfig } from 'payload'
import { anyone, isStaff } from '@/access'

export const Media: CollectionConfig = {
  slug: 'media',
  labels: { singular: { en: 'Image / File', ar: 'صورة / ملف' }, plural: { en: 'Media Library', ar: 'مكتبة الوسائط' } },
  admin: {
    group: { en: 'Content', ar: 'المحتوى' },
    description: 'Every image on the website lives here. Upload once, reuse anywhere.',
    useAsTitle: 'filename',
  },
  access: { read: anyone, create: isStaff, update: isStaff, delete: isStaff },
  upload: {
    staticDir: path.resolve(process.cwd(), 'media'),
    mimeTypes: ['image/*', 'application/pdf'],
    focalPoint: true,
    imageSizes: [
      { name: 'thumbnail', width: 320, height: 320, position: 'centre' },
      { name: 'card', width: 640, height: 640, position: 'centre' },
      { name: 'tablet', width: 1024, height: undefined },
      { name: 'hero', width: 1920, height: 1080, position: 'centre' },
    ],
  },
  fields: [
    {
      name: 'alt',
      type: 'text',
      localized: true,
      required: true,
      admin: {
        description:
          'Short description of the image, read aloud by screen readers and shown if the image fails to load.',
      },
    },
    {
      name: 'credit',
      type: 'text',
      admin: { description: 'Optional photographer/source credit.' },
    },
  ],
}
