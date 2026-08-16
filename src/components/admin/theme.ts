/**
 * Shared design tokens for the custom admin views. These mirror globals.css so
 * the dashboard and lookup screens use the same palette and type scale as the
 * storefront — admin components render outside Tailwind's scope, so the values
 * are expressed as plain objects rather than utility classes.
 */
export const brand = {
  primary: '#0047BA',
  primaryDark: '#003488',
  primaryLight: '#E6EDF9',
  accent: '#D42E12',
  accentLight: '#FBE7E3',
  neutral950: '#0B0E14',
  neutral600: '#3D4757',
  neutral400: '#6B7589',
  neutral200: '#E4E8EE',
  neutral100: '#F5F6F8',
  white: '#FFFFFF',
  success: '#12734F',
  warning: '#8A5300',
} as const

export const type = {
  h1: { fontSize: '2.5rem', lineHeight: 1.15, fontWeight: 700 },
  h2: { fontSize: '2rem', lineHeight: 1.2, fontWeight: 700 },
  h3: { fontSize: '1.5rem', lineHeight: 1.3, fontWeight: 600 },
  h4: { fontSize: '1.25rem', lineHeight: 1.4, fontWeight: 600 },
  bodyLg: { fontSize: '1.125rem', lineHeight: 1.6, fontWeight: 400 },
  body: { fontSize: '1rem', lineHeight: 1.6, fontWeight: 400 },
  bodySm: { fontSize: '0.875rem', lineHeight: 1.5, fontWeight: 400 },
  label: {
    fontSize: '0.8125rem',
    lineHeight: 1.4,
    fontWeight: 600,
    letterSpacing: '0.06em',
    textTransform: 'uppercase',
  },
} as const
