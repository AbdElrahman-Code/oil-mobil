/**
 * Second pass for anything the first photo sourcing run could not match.
 * Tries alternative search terms for records still holding generated artwork.
 *
 *   npx tsx src/seed/photos-retry.ts
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { sourcePhoto } from './images'

/** Fallback searches per product type, tried in order until one returns a photo. */
const alternativesByType: Record<string, string[]> = {
  oil: [
    'engine oil canister garage',
    'synthetic motor oil container',
    'oil change workshop',
    'motor oil pouring funnel',
    'lubricant containers shelf',
    'automotive lubricants',
  ],
  care: ['car shampoo bottle', 'car cleaning products', 'car wax bottle', 'automotive detailing products'],
  accessory: ['tire pressure gauge', 'car tools accessories', 'automotive hand tools', 'car interior accessories'],
  filter: ['automotive filter element', 'car filters spare parts'],
  battery: ['automotive battery', 'lead acid battery'],
  sparePart: ['auto spare parts', 'brake disc pads', 'spark plugs set'],
}

const run = async () => {
  const payload = await getPayload({ config })
  let fixed = 0
  let attempt = 0

  const products = await payload.find({
    collection: 'products',
    limit: 500,
    depth: 1,
    locale: 'en',
    pagination: false,
    overrideAccess: true,
  })

  for (const product of products.docs) {
    const image = Array.isArray(product.images) ? product.images[0] : null
    if (!image || typeof image !== 'object' || image.credit) continue

    const type = product.productType ?? 'accessory'
    const queries = alternativesByType[type] ?? alternativesByType.accessory

    // Walk the alternatives until one actually returns a licensed photo.
    let photo = await sourcePhoto(queries[0], { kind: type as 'oil', title: product.name }, attempt)
    for (let i = 1; i < queries.length && !photo.credit; i += 1) {
      photo = await sourcePhoto(queries[i], { kind: type as 'oil', title: product.name }, attempt + i)
    }
    attempt += queries.length

    if (!photo.credit) {
      console.log(`  still no match: ${product.sku}`)
      continue
    }

    const media = await payload.create({
      collection: 'media',
      locale: 'en',
      data: { alt: product.name, credit: photo.credit },
      file: { data: photo.buffer, mimetype: photo.mimetype, name: photo.filename, size: photo.buffer.length },
      overrideAccess: true,
    })
    await payload.update({
      collection: 'media',
      id: media.id,
      locale: 'ar',
      data: { alt: product.name },
      overrideAccess: true,
    })
    await payload.update({
      collection: 'products',
      id: product.id,
      data: { images: [media.id] },
      overrideAccess: true,
    })
    try {
      await payload.delete({ collection: 'media', id: image.id, overrideAccess: true })
    } catch {
      /* keep it if something still references it */
    }
    fixed += 1
    console.log(`  product: ${product.sku} → photo`)
  }

  const categories = await payload.find({
    collection: 'productCategories',
    limit: 100,
    depth: 1,
    locale: 'en',
    overrideAccess: true,
  })

  for (const category of categories.docs) {
    const image = category.image
    if (!image || typeof image !== 'object' || image.credit) continue

    const photo = await sourcePhoto(
      'car engine oil service',
      { kind: 'category', title: category.name },
      attempt++,
    )
    if (!photo.credit) continue

    const media = await payload.create({
      collection: 'media',
      locale: 'en',
      data: { alt: `${category.name} category`, credit: photo.credit },
      file: { data: photo.buffer, mimetype: photo.mimetype, name: photo.filename, size: photo.buffer.length },
      overrideAccess: true,
    })
    await payload.update({
      collection: 'productCategories',
      id: category.id,
      data: { image: media.id },
      overrideAccess: true,
    })
    try {
      await payload.delete({ collection: 'media', id: image.id, overrideAccess: true })
    } catch {
      /* keep */
    }
    fixed += 1
    console.log(`  category: ${category.slug} → photo`)
  }

  console.log(`\n✅ Replaced ${fixed} generated placeholder(s) with photography.`)
  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
