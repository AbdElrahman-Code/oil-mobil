import type { Field } from 'payload'

export const slugify = (value: string): string =>
  value
    .toString()
    .normalize('NFKD')
    .toLowerCase()
    .trim()
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '')

/**
 * URL slug that auto-fills from `sourceField` when left blank, so admins never
 * have to think about it, but can still override it for SEO.
 */
export const slugField = (sourceField = 'name'): Field => ({
  name: 'slug',
  type: 'text',
  index: true,
  unique: true,
  admin: {
    position: 'sidebar',
    description: 'Leave blank to generate automatically from the name.',
  },
  hooks: {
    beforeValidate: [
      ({ value, data, originalDoc }) => {
        if (typeof value === 'string' && value.length > 0) return slugify(value)
        const source =
          (data?.[sourceField] as string | { en?: string; ar?: string } | undefined) ??
          (originalDoc?.[sourceField] as string | undefined)
        if (!source) return value
        const raw = typeof source === 'string' ? source : (source.en ?? source.ar ?? '')
        return raw ? slugify(raw) : value
      },
    ],
  },
})
