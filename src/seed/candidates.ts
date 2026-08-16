/**
 * Downloads image candidates to a folder for review — nothing touches the
 * database. Used to hand-pick client-facing photography instead of trusting
 * whatever a search returns first.
 *
 *   npx tsx src/seed/candidates.ts "car wash tunnel" 6 wash
 */
import 'dotenv/config'
import fs from 'fs/promises'
import path from 'path'
import sharp from 'sharp'

const UA = 'auto-service-center-seed/1.0 (placeholder content sourcing)'
const OUT = path.resolve(process.cwd(), 'candidates')

type CommonsPage = {
  title: string
  imageinfo?: { thumburl?: string; url?: string; extmetadata?: Record<string, { value?: string }> }[]
}

const stripHtml = (value?: string) =>
  value?.replace(/<[^>]*>/g, '').replace(/\s+/g, ' ').trim() ?? ''

const run = async () => {
  const query = process.argv[2]
  const count = Number(process.argv[3] ?? 6)
  const label = process.argv[4] ?? query.replace(/\s+/g, '-')

  if (!query) {
    console.error('usage: npx tsx src/seed/candidates.ts "<search>" [count] [label]')
    process.exit(1)
  }

  await fs.mkdir(OUT, { recursive: true })

  // A "Category:X" argument lists that category's files, which are curated by
  // topic and far more on-point than free-text search.
  const endpoint = query.startsWith('Category:')
    ? 'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=categorymembers' +
      `&gcmtitle=${encodeURIComponent(query)}&gcmtype=file&gcmlimit=${count}` +
      '&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1400'
    : 'https://commons.wikimedia.org/w/api.php?action=query&format=json&generator=search' +
      `&gsrsearch=${encodeURIComponent(`filetype:bitmap ${query}`)}` +
      `&gsrlimit=${count}&gsrnamespace=6&prop=imageinfo&iiprop=url|extmetadata&iiurlwidth=1400`

  const response = await fetch(endpoint, { headers: { 'User-Agent': UA } })
  const json = (await response.json()) as { query?: { pages?: Record<string, CommonsPage> } }
  const pages = Object.values(json.query?.pages ?? {})

  const manifest: { file: string; title: string; credit: string; source: string }[] = []

  for (const [index, page] of pages.entries()) {
    const info = page.imageinfo?.[0]
    const src = info?.thumburl ?? info?.url
    if (!src) continue

    try {
      const file = await fetch(src, { headers: { 'User-Agent': UA } })
      if (!file.ok) continue
      const raw = Buffer.from(await file.arrayBuffer())
      const buffer = await sharp(raw)
        .resize(900, 900, { fit: 'cover', position: 'attention' })
        .jpeg({ quality: 80 })
        .toBuffer()

      const name = `${label}-${index}.jpg`
      await fs.writeFile(path.join(OUT, name), buffer)

      const meta = info?.extmetadata ?? {}
      manifest.push({
        file: name,
        title: page.title.replace('File:', ''),
        credit: [stripHtml(meta.Artist?.value) || 'Wikimedia Commons', stripHtml(meta.LicenseShortName?.value)]
          .filter(Boolean)
          .join(' · '),
        source: src,
      })
      console.log(`  ${name}  ←  ${page.title.replace('File:', '').slice(0, 70)}`)
    } catch {
      /* skip this candidate */
    }
    await new Promise((resolve) => setTimeout(resolve, 250))
  }

  const manifestPath = path.join(OUT, `${label}.json`)
  await fs.writeFile(manifestPath, JSON.stringify(manifest, null, 2))
  console.log(`\nmanifest: ${manifestPath}`)
  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
