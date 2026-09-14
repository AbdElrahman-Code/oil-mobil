/**
 * Generates the brand logo (mark + wordmark) as PNG uploads and points Site
 * Settings at them, so the header shows a logo instead of plain text.
 *
 *   npx tsx src/seed/logo.ts                 # uses the current site name
 *   npx tsx src/seed/logo.ts "Mobil Drift"   # or set one explicitly
 *
 * Re-run any time the name changes. The shop can also just upload its own
 * artwork in Site Settings → Brand and it takes over immediately.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import sharp from 'sharp'
import config from '../payload.config'

const BLUE = '#F26B1D'
const RED = '#1E3A5F'

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (char) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char] as string,
  )

/**
 * An oil droplet cut by a motion line — reads as "oil" at a glance and still
 * holds together at favicon size, where a detailed illustration would not.
 */
const lockup = ({ name, tagline, onDark }: { name: string; tagline: string; onDark: boolean }) => {
  const text = onDark ? '#FFFFFF' : '#0B0E14'
  const sub = onDark ? '#A7B0BF' : '#616B7D'
  const markBg = onDark ? '#FFFFFF' : BLUE
  const dropFill = onDark ? BLUE : '#FFFFFF'

  const upper = name.toUpperCase()
  // Keep the wordmark from colliding with the mark on long names.
  const fontSize = upper.length > 18 ? 52 : upper.length > 13 ? 62 : 72
  const trackedTagline = tagline.toUpperCase()

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="900" height="220" viewBox="0 0 900 220">
  <rect width="900" height="220" fill="none"/>

  <g transform="translate(20 30)">
    <rect width="160" height="160" rx="40" fill="${markBg}"/>
    <path d="M 80 32 C 118 74 130 96 130 114 A 50 50 0 0 1 30 114 C 30 96 42 74 80 32 Z" fill="${dropFill}"/>
    <path d="M 34 118 L 126 118" stroke="${markBg}" stroke-width="10" stroke-linecap="round" opacity="0.9"/>
    <circle cx="80" cy="132" r="11" fill="${RED}"/>
  </g>

  <text x="215" y="${tagline ? 108 : 125}" fill="${text}"
        font-family="Segoe UI, Tahoma, Arial, sans-serif"
        font-size="${fontSize}" font-weight="800" letter-spacing="1">${escapeXml(upper)}</text>
  ${
    tagline
      ? `<text x="218" y="152" fill="${sub}" font-family="Segoe UI, Tahoma, Arial, sans-serif"
        font-size="26" font-weight="600" letter-spacing="6">${escapeXml(trackedTagline)}</text>`
      : ''
  }
</svg>`
}

/** Square mark on its own — used for the favicon and the admin icon. */
const markOnly = () => `
<svg xmlns="http://www.w3.org/2000/svg" width="512" height="512" viewBox="0 0 512 512">
  <rect width="512" height="512" rx="128" fill="${BLUE}"/>
  <path d="M 256 96 C 378 230 416 300 416 358 A 160 160 0 0 1 96 358 C 96 300 134 230 256 96 Z" fill="#FFFFFF"/>
  <path d="M 108 370 L 404 370" stroke="${BLUE}" stroke-width="32" stroke-linecap="round"/>
  <circle cx="256" cy="416" r="34" fill="${RED}"/>
</svg>`

const run = async () => {
  const payload = await getPayload({ config })

  const settings = await payload.findGlobal({ slug: 'siteSettings', locale: 'en' })
  const name = process.argv[2] || settings.siteName || 'Auto Service Center'
  const tagline = process.argv[3] ?? 'OIL · FILTERS · CARE'

  const assets = [
    { key: 'logo', svg: lockup({ name, tagline, onDark: false }), alt: `${name} logo`, file: 'logo.png' },
    { key: 'logoDark', svg: lockup({ name, tagline, onDark: true }), alt: `${name} logo (light)`, file: 'logo-light.png' },
    { key: 'favicon', svg: markOnly(), alt: `${name} icon`, file: 'logo-mark.png' },
  ] as const

  const ids: Record<string, number> = {}

  for (const asset of assets) {
    // PNG keeps the transparent background that a logo needs.
    const buffer = await sharp(Buffer.from(asset.svg)).png().toBuffer()
    const doc = await payload.create({
      collection: 'media',
      locale: 'en',
      data: { alt: asset.alt },
      file: { data: buffer, mimetype: 'image/png', name: asset.file, size: buffer.length },
      overrideAccess: true,
    })
    await payload.update({
      collection: 'media',
      id: doc.id,
      locale: 'ar',
      data: { alt: `شعار ${name}` },
      overrideAccess: true,
    })
    ids[asset.key] = doc.id
    console.log(`  ${asset.file} → media ${doc.id}`)
  }

  for (const locale of ['en', 'ar'] as const) {
    await payload.updateGlobal({
      slug: 'siteSettings',
      locale,
      data: { logo: ids.logo, logoDark: ids.logoDark, favicon: ids.favicon },
    })
  }

  console.log(`\n✅ Logo set for "${name}".`)
  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
