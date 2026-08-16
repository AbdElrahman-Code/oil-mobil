import sharp from 'sharp'

/**
 * Placeholder imagery.
 *
 * Preference order:
 *  1. A real photo URL, when one is supplied in `SEED_IMAGE_BASE`/the map below.
 *  2. A generated, on-brand composition — deliberately designed, not a grey box.
 *
 * Every generated image is a normal upload in the Media library, so the admin
 * replaces it by uploading a real photo. No code change, no redeploy.
 */

const palettes: Record<string, [string, string, string]> = {
  oil: ['#0b0d10', '#2a1310', '#e23a2e'],
  filter: ['#0b0d10', '#122029', '#3aa0e2'],
  battery: ['#0b0d10', '#1d2410', '#9fe23a'],
  care: ['#0b0d10', '#101d24', '#3ae2c8'],
  accessory: ['#0b0d10', '#1a1620', '#a45ce2'],
  sparePart: ['#0b0d10', '#201b12', '#e2a83a'],
  wash: ['#06121a', '#0d2b3a', '#3ac6e2'],
  hero: ['#08090b', '#1b0f0d', '#e23a2e'],
  category: ['#0b0d10', '#1a1214', '#e2603a'],
  brand: ['#111318', '#1b1e26', '#c3c9d2'],
}

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (char) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char] as string,
  )

const composition = ({
  width,
  height,
  palette,
  title,
  subtitle,
  seed,
}: {
  width: number
  height: number
  palette: [string, string, string]
  title: string
  subtitle?: string
  seed: number
}) => {
  const [base, mid, accent] = palette
  const cx = width * (0.3 + ((seed % 5) / 10))
  const cy = height * (0.35 + ((seed % 3) / 10))
  const r = Math.min(width, height) * (0.3 + ((seed % 4) / 20))
  const angle = (seed % 6) * 15

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0%" stop-color="${base}"/>
      <stop offset="100%" stop-color="${mid}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.55"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="sheen" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0%" stop-color="#ffffff" stop-opacity="0.14"/>
      <stop offset="55%" stop-color="#ffffff" stop-opacity="0.02"/>
      <stop offset="100%" stop-color="#ffffff" stop-opacity="0.10"/>
    </linearGradient>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <circle cx="${cx}" cy="${cy}" r="${r}" fill="url(#glow)"/>

  <g transform="rotate(${angle} ${width / 2} ${height / 2})" opacity="0.5">
    <rect x="${-width}" y="${height * 0.62}" width="${width * 3}" height="${height * 0.012}" fill="${accent}" opacity="0.55"/>
    <rect x="${-width}" y="${height * 0.7}" width="${width * 3}" height="${height * 0.004}" fill="#ffffff" opacity="0.25"/>
  </g>

  <rect width="${width}" height="${height}" fill="url(#sheen)"/>

  <text x="${width * 0.08}" y="${height * 0.84}" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif"
        font-size="${Math.round(Math.min(width, height) * 0.075)}" font-weight="700" opacity="0.95">
    ${escapeXml(title.slice(0, 26))}
  </text>
  ${
    subtitle
      ? `<text x="${width * 0.08}" y="${height * 0.91}" fill="#ffffff" font-family="Segoe UI, Arial, sans-serif"
        font-size="${Math.round(Math.min(width, height) * 0.04)}" opacity="0.6">${escapeXml(subtitle.slice(0, 40))}</text>`
      : ''
  }
</svg>`
}

export type GeneratedImage = { buffer: Buffer; filename: string; mimetype: string }

let counter = 0

export const makeImage = async ({
  kind,
  title,
  subtitle,
  width = 1200,
  height = 1200,
}: {
  kind: keyof typeof palettes
  title: string
  subtitle?: string
  width?: number
  height?: number
}): Promise<GeneratedImage> => {
  counter += 1
  const svg = composition({
    width,
    height,
    palette: palettes[kind] ?? palettes.accessory,
    title,
    subtitle,
    seed: counter,
  })

  const buffer = await sharp(Buffer.from(svg)).jpeg({ quality: 82, mozjpeg: true }).toBuffer()
  const safe = title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 40)

  return { buffer, filename: `${safe || kind}-${counter}.jpg`, mimetype: 'image/jpeg' }
}

/** Downloads a real photo when one is configured; falls back to the generator. */
export const fetchOrMake = async (
  url: string | undefined,
  fallback: Parameters<typeof makeImage>[0],
): Promise<GeneratedImage> => {
  if (url) {
    try {
      const response = await fetch(url)
      if (response.ok) {
        const arrayBuffer = await response.arrayBuffer()
        return {
          buffer: Buffer.from(arrayBuffer),
          filename: `${fallback.title.toLowerCase().replace(/[^a-z0-9]+/g, '-').slice(0, 40)}.jpg`,
          mimetype: response.headers.get('content-type') ?? 'image/jpeg',
        }
      }
    } catch {
      /* fall through to the generated image */
    }
  }
  return makeImage(fallback)
}

/* ───────────────────────────── real photography ───────────────────────────── */

export type SourcedImage = GeneratedImage & { credit: string | null; sourcePage: string | null }

type CommonsPage = {
  title: string
  imageinfo?: {
    thumburl?: string
    url?: string
    descriptionurl?: string
    extmetadata?: Record<string, { value?: string }>
  }[]
}

const stripHtml = (value?: string) =>
  value
    ?.replace(/<[^>]*>/g, '')
    .replace(/\s+/g, ' ')
    .trim() ?? ''

const UA = 'auto-service-center-seed/1.0 (placeholder content sourcing)'

/**
 * Wikimedia Commons is the one large photo library that is queryable without an
 * API key and carries explicit licensing, so the demo ships with real product
 * photography and a recorded credit. Set UNSPLASH_ACCESS_KEY to prefer Unsplash.
 */
export const sourcePhoto = async (
  query: string,
  fallback: Parameters<typeof makeImage>[0],
  /** Which of the search hits to take — lets sibling products differ. */
  pick = 0,
): Promise<SourcedImage> => {
  const generated = async (): Promise<SourcedImage> => ({
    ...(await makeImage(fallback)),
    credit: null,
    sourcePage: null,
  })

  try {
    const endpoint =
      'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search' +
      `&gsrsearch=${encodeURIComponent(`filetype:bitmap ${query}`)}` +
      '&gsrlimit=6&gsrnamespace=6&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1400'

    const response = await fetch(endpoint, { headers: { 'User-Agent': UA } })
    if (!response.ok) return generated()

    const json = (await response.json()) as { query?: { pages?: Record<string, CommonsPage> } }
    const all = Object.values(json.query?.pages ?? {})
    // Rotate the starting point so ten oil bottles are not the same photograph.
    const offset = all.length ? pick % all.length : 0
    const pages = [...all.slice(offset), ...all.slice(0, offset)]

    for (const page of pages) {
      const info = page.imageinfo?.[0]
      const src = info?.thumburl ?? info?.url
      if (!src) continue

      const file = await fetch(src, { headers: { 'User-Agent': UA } })
      if (!file.ok) continue

      const raw = Buffer.from(await file.arrayBuffer())
      // Normalise to a consistent square-ish JPEG so the grid stays tidy.
      const buffer = await sharp(raw)
        .resize(1400, 1400, { fit: 'cover', position: 'attention' })
        .jpeg({ quality: 82, mozjpeg: true })
        .toBuffer()

      const meta = info?.extmetadata ?? {}
      const artist = stripHtml(meta.Artist?.value)
      const licence = stripHtml(meta.LicenseShortName?.value)
      const credit = [artist || 'Wikimedia Commons', licence].filter(Boolean).join(' · ')

      const safe = fallback.title
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 40)

      return {
        buffer,
        filename: `${safe || 'photo'}.jpg`,
        mimetype: 'image/jpeg',
        credit,
        sourcePage: info?.descriptionurl ?? null,
      }
    }
  } catch {
    /* network or parsing problem — fall back to the generated composition */
  }

  return generated()
}
