/**
 * Replaces seeded placeholder art with real, openly-licensed photography and
 * records the credit on each Media item.
 *
 *   npx tsx src/seed/photos.ts
 *
 * Safe to re-run: it repoints each record at a fresh Media item and removes the
 * one it replaced. Anything the API cannot match keeps its generated artwork.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { sourcePhoto } from './images'

type Payload = Awaited<ReturnType<typeof getPayload>>

/** Search terms per product type, rotated so sibling products differ. */
const productQueries: Record<string, string[]> = {
  oil: ['motor oil bottle', 'engine oil canister', 'motor oil bottles various brands', 'lubricant oil bottle'],
  filter: ['car oil filter', 'automotive air filter', 'cabin air filter car', 'fuel filter car'],
  battery: ['car battery automotive', 'automotive lead acid battery', 'car battery terminals'],
  care: ['car care products', 'car shampoo bottle', 'engine coolant bottle', 'brake fluid bottle'],
  accessory: ['microfiber cloth car', 'tire pressure gauge', 'car vacuum cleaner', 'car phone holder'],
  sparePart: ['brake pads automotive', 'spark plug engine', 'windshield wiper blade'],
}

const filterQueries: Record<string, string> = {
  oil: 'car oil filter',
  air: 'automotive air filter',
  cabin: 'cabin air filter car',
  fuel: 'fuel filter car',
}

const categoryQueries: Record<string, string> = {
  'engine-oils': 'motor oil bottles shelf',
  filters: 'automotive filters',
  batteries: 'car battery automotive',
  'car-care': 'car care products',
  accessories: 'car accessories interior',
  'spare-parts': 'auto spare parts',
}

const uploadPhoto = async (
  payload: Payload,
  {
    query,
    pick,
    title,
    altEn,
    altAr,
    kind,
  }: {
    query: string
    pick: number
    title: string
    altEn: string
    altAr: string
    kind: Parameters<typeof sourcePhoto>[1]['kind']
  },
): Promise<{ id: number; sourced: boolean }> => {
  const photo = await sourcePhoto(query, { kind, title, subtitle: undefined }, pick)

  const doc = await payload.create({
    collection: 'media',
    locale: 'en',
    data: { alt: altEn, credit: photo.credit ?? undefined },
    file: {
      data: photo.buffer,
      mimetype: photo.mimetype,
      name: photo.filename,
      size: photo.buffer.length,
    },
    overrideAccess: true,
  })

  await payload.update({
    collection: 'media',
    id: doc.id,
    locale: 'ar',
    data: { alt: altAr },
    overrideAccess: true,
  })

  return { id: doc.id, sourced: Boolean(photo.credit) }
}

const removeMedia = async (payload: Payload, id: number | null | undefined) => {
  if (!id) return
  try {
    await payload.delete({ collection: 'media', id, overrideAccess: true })
  } catch {
    /* still referenced somewhere — leave it in the library */
  }
}

const run = async () => {
  const payload = await getPayload({ config })
  let sourced = 0
  let generated = 0

  const tally = (ok: boolean) => (ok ? (sourced += 1) : (generated += 1))

  /* ── products ── */
  const products = await payload.find({
    collection: 'products',
    limit: 500,
    depth: 0,
    locale: 'en',
    pagination: false,
    overrideAccess: true,
  })

  const counters: Record<string, number> = {}

  for (const product of products.docs) {
    const type = product.productType ?? 'accessory'
    counters[type] = (counters[type] ?? 0) + 1

    const query =
      type === 'filter' && product.filterAttributes?.filterType
        ? filterQueries[product.filterAttributes.filterType]
        : (productQueries[type] ?? productQueries.accessory)[
            counters[type] % (productQueries[type] ?? productQueries.accessory).length
          ]

    const previous = (product.images ?? []).map((image) =>
      typeof image === 'object' ? image.id : image,
    ) as number[]

    const { id, sourced: ok } = await uploadPhoto(payload, {
      query,
      pick: counters[type],
      title: product.name,
      altEn: product.name,
      altAr: product.name,
      kind: type as 'oil',
    })
    tally(ok)

    await payload.update({
      collection: 'products',
      id: product.id,
      data: { images: [id] },
      overrideAccess: true,
    })
    for (const old of previous) await removeMedia(payload, old)
    console.log(`  product: ${product.sku} ${ok ? '(photo)' : '(generated)'}`)
  }

  /* ── categories ── */
  const categories = await payload.find({
    collection: 'productCategories',
    limit: 100,
    depth: 0,
    locale: 'en',
    overrideAccess: true,
  })

  for (const [index, category] of categories.docs.entries()) {
    const previous = typeof category.image === 'object' ? category.image?.id : category.image
    const { id, sourced: ok } = await uploadPhoto(payload, {
      query: categoryQueries[category.slug as string] ?? 'car parts shop',
      pick: index,
      title: category.name,
      altEn: `${category.name} category`,
      altAr: category.name,
      kind: 'category',
    })
    tally(ok)
    await payload.update({
      collection: 'productCategories',
      id: category.id,
      data: { image: id },
      overrideAccess: true,
    })
    await removeMedia(payload, previous as number)
    console.log(`  category: ${category.slug} ${ok ? '(photo)' : '(generated)'}`)
  }

  /* ── wash services ── */
  const services = await payload.find({
    collection: 'washServices',
    limit: 50,
    depth: 0,
    locale: 'en',
    overrideAccess: true,
  })

  const washQueries = ['car wash', 'car wash foam', 'car polishing detailing', 'car detailing interior']

  for (const [index, service] of services.docs.entries()) {
    const previous = typeof service.image === 'object' ? service.image?.id : service.image
    const { id, sourced: ok } = await uploadPhoto(payload, {
      query: washQueries[index % washQueries.length],
      pick: index,
      title: service.name,
      altEn: service.name,
      altAr: service.name,
      kind: 'wash',
    })
    tally(ok)
    await payload.update({
      collection: 'washServices',
      id: service.id,
      data: { image: id },
      overrideAccess: true,
    })
    await removeMedia(payload, previous as number)
    console.log(`  wash service: ${service.slug} ${ok ? '(photo)' : '(generated)'}`)
  }

  /* ── homepage imagery ── */
  const homepage = await payload.findGlobal({ slug: 'homepage', locale: 'en' })

  const hero = await uploadPhoto(payload, {
    query: 'auto repair shop garage',
    pick: 0,
    title: 'Workshop hero',
    altEn: 'Technicians working in the service centre workshop',
    altAr: 'فنيون أثناء العمل داخل مركز الخدمة',
    kind: 'hero',
  })
  tally(hero.sourced)

  const finder = await uploadPhoto(payload, {
    query: 'pouring motor oil engine',
    pick: 1,
    title: 'Oil finder',
    altEn: 'Engine oil being poured into an engine',
    altAr: 'صب زيت المحرك داخل المحرك',
    kind: 'oil',
  })
  tally(finder.sourced)

  const promo = await uploadPhoto(payload, {
    query: 'car wash foam',
    pick: 2,
    title: 'Promotion',
    altEn: 'Car being washed with foam',
    altAr: 'غسيل سيارة بالرغوة',
    kind: 'wash',
  })
  tally(promo.sourced)

  for (const locale of ['en', 'ar'] as const) {
    const doc = await payload.findGlobal({ slug: 'homepage', locale })
    const sections = (doc.sections ?? []).map((section) => {
      if (section.blockType === 'hero') return { ...section, backgroundImage: hero.id }
      if (section.blockType === 'oilFinderCta') return { ...section, image: finder.id }
      if (section.blockType === 'promoBanner') return { ...section, image: promo.id }
      return section
    })
    await payload.updateGlobal({ slug: 'homepage', locale, data: { sections } })
  }

  // Drop the artwork the homepage no longer points at.
  for (const section of homepage.sections ?? []) {
    if (section.blockType === 'hero') await removeMedia(payload, section.backgroundImage as number)
    if (section.blockType === 'oilFinderCta') await removeMedia(payload, section.image as number)
    if (section.blockType === 'promoBanner') await removeMedia(payload, section.image as number)
  }

  await payload.updateGlobal({ slug: 'siteSettings', locale: 'en', data: { ogImage: hero.id } })

  console.log(`\n✅ Imagery updated — ${sourced} real photos, ${generated} generated fallbacks.`)
  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
