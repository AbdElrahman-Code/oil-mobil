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

/**
 * Every generated composition sits on the brand's blue, with only the accent
 * hue changing per product family. Red is kept out of large fills, matching the
 * rule the site follows everywhere else.
 */
const palettes: Record<string, [string, string, string]> = {
  oil: ['#0b0e14', '#0d1b33', '#4d80d1'],
  filter: ['#0b0e14', '#0c1a2e', '#3a8fd1'],
  battery: ['#0b0e14', '#0d1c2b', '#5fa8d1'],
  care: ['#0b0e14', '#0b1d2b', '#4fc0d1'],
  accessory: ['#0b0e14', '#111a2e', '#7f9fd8'],
  sparePart: ['#0b0e14', '#141c2c', '#9ab0d8'],
  wash: ['#08131f', '#0b2340', '#63b8e8'],
  hero: ['#08090f', '#0a1730', '#0047ba'],
  category: ['#0b0e14', '#0f1c33', '#0047ba'],
  brand: ['#111318', '#1b1e26', '#c3c9d2'],
}

const escapeXml = (value: string) =>
  value.replace(/[<>&'"]/g, (char) =>
    ({ '<': '&lt;', '>': '&gt;', '&': '&amp;', "'": '&apos;', '"': '&quot;' })[char] as string,
  )

type Glyph = 'droplet' | 'bubbles' | 'filter' | 'battery' | 'spark' | 'none'

const glyphFor = (kind: string): Glyph =>
  kind === 'oil' || kind === 'hero'
    ? 'droplet'
    : kind === 'wash' || kind === 'care'
      ? 'bubbles'
      : kind === 'filter'
        ? 'filter'
        : kind === 'battery'
          ? 'battery'
          : kind === 'category'
            ? 'spark'
            : 'none'

/** Simple line art, drawn large and low-contrast so it reads as texture. */
const glyphPath = (glyph: Glyph, cx: number, cy: number, size: number, accent: string) => {
  const s = size
  switch (glyph) {
    case 'droplet':
      return `<path d="M ${cx} ${cy - s} C ${cx + s * 0.85} ${cy - s * 0.1} ${cx + s * 0.62} ${cy + s * 0.72} ${cx} ${cy + s * 0.72} C ${cx - s * 0.62} ${cy + s * 0.72} ${cx - s * 0.85} ${cy - s * 0.1} ${cx} ${cy - s} Z" fill="none" stroke="${accent}" stroke-width="${s * 0.055}" opacity="0.5"/>`
    case 'bubbles':
      return [
        [cx - s * 0.45, cy + s * 0.15, s * 0.42],
        [cx + s * 0.35, cy - s * 0.25, s * 0.3],
        [cx + s * 0.15, cy + s * 0.5, s * 0.18],
        [cx - s * 0.05, cy - s * 0.55, s * 0.14],
      ]
        .map(([x, y, r]) => `<circle cx="${x}" cy="${y}" r="${r}" fill="none" stroke="${accent}" stroke-width="${s * 0.05}" opacity="0.45"/>`)
        .join('')
    case 'filter':
      return `<rect x="${cx - s * 0.45}" y="${cy - s * 0.6}" width="${s * 0.9}" height="${s * 1.2}" rx="${s * 0.16}" fill="none" stroke="${accent}" stroke-width="${s * 0.055}" opacity="0.45"/>` +
        [0.2, 0.5, 0.8].map((t) => `<line x1="${cx - s * 0.45}" y1="${cy - s * 0.6 + s * 1.2 * t}" x2="${cx + s * 0.45}" y2="${cy - s * 0.6 + s * 1.2 * t}" stroke="${accent}" stroke-width="${s * 0.035}" opacity="0.32"/>`).join('')
    case 'battery':
      return `<rect x="${cx - s * 0.55}" y="${cy - s * 0.38}" width="${s * 1.1}" height="${s * 0.76}" rx="${s * 0.12}" fill="none" stroke="${accent}" stroke-width="${s * 0.055}" opacity="0.45"/><rect x="${cx + s * 0.55}" y="${cy - s * 0.12}" width="${s * 0.1}" height="${s * 0.24}" fill="${accent}" opacity="0.4"/>`
    case 'spark':
      return `<path d="M ${cx} ${cy - s * 0.7} L ${cx + s * 0.18} ${cy - s * 0.18} L ${cx + s * 0.7} ${cy} L ${cx + s * 0.18} ${cy + s * 0.18} L ${cx} ${cy + s * 0.7} L ${cx - s * 0.18} ${cy + s * 0.18} L ${cx - s * 0.7} ${cy} L ${cx - s * 0.18} ${cy - s * 0.18} Z" fill="none" stroke="${accent}" stroke-width="${s * 0.05}" opacity="0.4"/>`
    default:
      return ''
  }
}

const composition = ({
  width,
  height,
  palette,
  title,
  subtitle,
  seed,
  glyph,
  showTitle = true,
}: {
  width: number
  height: number
  palette: [string, string, string]
  title: string
  subtitle?: string
  seed: number
  glyph: Glyph
  showTitle?: boolean
}) => {
  const [base, mid, accent] = palette
  const min = Math.min(width, height)
  const cx = width * 0.5
  const cy = height * (showTitle ? 0.42 : 0.5)
  const glyphSize = min * 0.26
  const tilt = -18 + (seed % 5) * 9

  return `
<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 0 ${width} ${height}">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="0.8" y2="1">
      <stop offset="0%" stop-color="${base}"/>
      <stop offset="100%" stop-color="${mid}"/>
    </linearGradient>
    <radialGradient id="glow" cx="50%" cy="42%" r="58%">
      <stop offset="0%" stop-color="${accent}" stop-opacity="0.4"/>
      <stop offset="100%" stop-color="${accent}" stop-opacity="0"/>
    </radialGradient>
    <linearGradient id="fade" x1="0" y1="0" x2="0" y2="1">
      <stop offset="55%" stop-color="#000000" stop-opacity="0"/>
      <stop offset="100%" stop-color="#000000" stop-opacity="0.55"/>
    </linearGradient>
  </defs>

  <rect width="${width}" height="${height}" fill="url(#bg)"/>
  <rect width="${width}" height="${height}" fill="url(#glow)"/>

  <g transform="rotate(${tilt} ${cx} ${cy})" opacity="0.55">
    ${[0.18, 0.42, 0.66]
      .map(
        (t, i) =>
          `<path d="M ${-width * 0.2} ${height * (t + 0.06)} Q ${cx} ${height * (t - 0.12)} ${width * 1.2} ${height * (t + 0.1)}" fill="none" stroke="${accent}" stroke-width="${min * (i === 1 ? 0.011 : 0.005)}" opacity="${i === 1 ? 0.5 : 0.28}"/>`,
      )
      .join('')}
  </g>

  ${glyphPath(glyph, cx, cy, glyphSize, accent)}

  <rect width="${width}" height="${height}" fill="url(#fade)"/>

  ${
    showTitle
      ? `<text x="${cx}" y="${height * 0.8}" fill="#ffffff" text-anchor="middle"
        font-family="Segoe UI, Tahoma, Arial, sans-serif"
        font-size="${Math.round(min * 0.07)}" font-weight="700" opacity="0.96">${escapeXml(title.slice(0, 28))}</text>`
      : ''
  }
  ${
    showTitle && subtitle
      ? `<text x="${cx}" y="${height * 0.87}" fill="#ffffff" text-anchor="middle"
        font-family="Segoe UI, Tahoma, Arial, sans-serif" letter-spacing="2"
        font-size="${Math.round(min * 0.032)}" opacity="0.6">${escapeXml(subtitle.slice(0, 40))}</text>`
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
  showTitle = true,
}: {
  kind: keyof typeof palettes
  title: string
  subtitle?: string
  width?: number
  height?: number
  /** Off for decorative backgrounds, where baked-in text would be wrong. */
  showTitle?: boolean
}): Promise<GeneratedImage> => {
  counter += 1
  const svg = composition({
    width,
    height,
    palette: palettes[kind] ?? palettes.accessory,
    title,
    subtitle,
    seed: counter,
    glyph: glyphFor(kind),
    showTitle,
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
