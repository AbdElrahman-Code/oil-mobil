/**
 * Replaces the car-wash and promotional imagery with clean, on-brand artwork.
 *
 *   npx tsx src/seed/fix-wash-images.ts
 *
 * Wikimedia's "car wash" results are dominated by amateur snapshots and swimwear
 * shots that have no place on a service centre's site, so these slots use
 * generated brand artwork instead of a photo. The shop replaces any of them by
 * uploading its own photograph in the admin — no code change needed.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { makeImage } from './images'

type Payload = Awaited<ReturnType<typeof getPayload>>

const upload = async (
  payload: Payload,
  {
    kind,
    title,
    subtitle,
    altEn,
    altAr,
    width = 1400,
    height = 1000,
    showTitle = true,
  }: {
    kind: 'wash' | 'hero' | 'care' | 'category'
    title: string
    subtitle?: string
    altEn: string
    altAr: string
    width?: number
    height?: number
    showTitle?: boolean
  },
): Promise<number> => {
  const image = await makeImage({ kind, title, subtitle, width, height, showTitle })
  const doc = await payload.create({
    collection: 'media',
    locale: 'en',
    data: { alt: altEn },
    file: { data: image.buffer, mimetype: image.mimetype, name: image.filename, size: image.buffer.length },
    overrideAccess: true,
  })
  await payload.update({
    collection: 'media',
    id: doc.id,
    locale: 'ar',
    data: { alt: altAr },
    overrideAccess: true,
  })
  return doc.id
}

const remove = async (payload: Payload, id: unknown) => {
  const mediaId = typeof id === 'object' && id !== null ? (id as { id: number }).id : id
  if (typeof mediaId !== 'number') return
  try {
    await payload.delete({ collection: 'media', id: mediaId, overrideAccess: true })
  } catch {
    /* still referenced elsewhere */
  }
}

const run = async () => {
  const payload = await getPayload({ config })

  /* ── Wash service cards ── */
  const services = await payload.find({
    collection: 'washServices',
    limit: 20,
    depth: 0,
    locale: 'en',
    overrideAccess: true,
  })

  for (const service of services.docs) {
    const previous = service.image
    const id = await upload(payload, {
      kind: 'wash',
      title: service.name,
      subtitle: 'CAR WASH & DETAILING',
      altEn: `${service.name} package`,
      altAr: `باقة ${service.name}`,
      width: 1400,
      height: 1000,
    })
    await payload.update({
      collection: 'washServices',
      id: service.id,
      data: { image: id },
      overrideAccess: true,
    })
    await remove(payload, previous)
    console.log(`  wash service: ${service.slug}`)
  }

  /* ── Homepage promo banner and Oil Finder art ── */
  for (const locale of ['en', 'ar'] as const) {
    const homepage = await payload.findGlobal({ slug: 'homepage', locale })
    let promoId: number | null = null
    let finderId: number | null = null

    const sections = await Promise.all(
      (homepage.sections ?? []).map(async (section) => {
        if (section.blockType === 'promoBanner') {
          if (!promoId) {
            promoId = await upload(payload, {
              kind: 'wash',
              title: '',
              altEn: 'Promotional banner artwork',
              altAr: 'خلفية بانر العروض',
              width: 1600,
              height: 1200,
              showTitle: false,
            })
          }
          if (locale === 'en') await remove(payload, section.image)
          return { ...section, image: promoId }
        }
        if (section.blockType === 'oilFinderCta') {
          if (!finderId) {
            finderId = await upload(payload, {
              kind: 'oil' as 'hero',
              title: '',
              altEn: 'Engine oil artwork',
              altAr: 'خلفية زيت المحرك',
              width: 1600,
              height: 1200,
              showTitle: false,
            })
          }
          return { ...section, image: finderId }
        }
        return section
      }),
    )

    await payload.updateGlobal({ slug: 'homepage', locale, data: { sections } })
  }
  console.log('  homepage: promo banner + oil finder art')

  /* ── About page gallery ── */
  const about = await payload.find({
    collection: 'pages',
    where: { slug: { equals: 'about' } },
    limit: 1,
    locale: 'en',
    depth: 0,
    overrideAccess: true,
  })

  const aboutDoc = about.docs[0]
  if (aboutDoc) {
    const washTiles = [
      { title: 'Wash bay', subtitle: 'FOAM & RINSE' },
      { title: 'Detailing', subtitle: 'POLISH & WAX' },
    ]
    const replacements: number[] = []
    for (const tile of washTiles) {
      replacements.push(
        await upload(payload, {
          kind: 'wash',
          title: tile.title,
          subtitle: tile.subtitle,
          altEn: tile.title,
          altAr: tile.title,
          width: 1200,
          height: 1200,
        }),
      )
    }

    for (const locale of ['en', 'ar'] as const) {
      const page = await payload.findByID({
        collection: 'pages',
        id: aboutDoc.id,
        locale,
        depth: 0,
        overrideAccess: true,
      })

      const sections = (page.sections ?? []).map((section) => {
        if (section.blockType !== 'gallery') return section
        const images = (section.images ?? []) as number[]
        // Swap the last two tiles — those were the wash photographs.
        const kept = images.slice(0, Math.max(0, images.length - 2))
        return { ...section, images: [...kept, ...replacements] }
      })

      await payload.update({
        collection: 'pages',
        id: aboutDoc.id,
        locale,
        draft: false,
        data: { sections, _status: 'published' } as never,
        overrideAccess: true,
      })
    }
    console.log('  about page: gallery tiles')
  }

  console.log('\n✅ Wash and promotional imagery replaced with brand artwork.')
  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
