/**
 * Moves products onto the Phase 9 taxonomy. Split out from categories.ts so it
 * can be re-run on its own — the full installer makes hundreds of round trips
 * and Neon will drop a long-lived connection part way through.
 *
 *   npx tsx src/seed/remap-products.ts
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { taxonomy } from './taxonomy'

const fallbackByType: Record<string, string> = {
  oil: 'engine-oil',
  filter: 'oil-filters',
  battery: 'batteries',
  care: 'shampoo',
  accessory: 'phone-mounts',
  sparePart: 'spark-plugs',
}

const run = async () => {
  const payload = await getPayload({ config })

  const categories = await payload.find({
    collection: 'productCategories',
    limit: 200,
    depth: 0,
    locale: 'en',
    pagination: false,
    overrideAccess: true,
  })
  const bySlug = new Map(categories.docs.map((category) => [category.slug as string, category.id]))

  const keywordMap: { needle: string; id: number }[] = []
  const typeMap = new Map<string, number>()

  for (const top of taxonomy) {
    for (const child of top.children) {
      const id = bySlug.get(child.key)
      if (!id) continue
      for (const needle of child.match ?? []) keywordMap.push({ needle: needle.toLowerCase(), id })
      for (const type of child.productTypes ?? []) typeMap.set(type, id)
    }
  }
  // Longest keyword wins, so "oil filter" beats "oil".
  keywordMap.sort((a, b) => b.needle.length - a.needle.length)

  const leafSlugs = new Set(taxonomy.flatMap((top) => top.children.map((child) => child.key)))

  const products = await payload.find({
    collection: 'products',
    limit: 500,
    depth: 1,
    locale: 'en',
    pagination: false,
    overrideAccess: true,
  })

  let moved = 0
  for (const product of products.docs) {
    const current = typeof product.category === 'object' ? product.category : null
    // Anything already on a leaf of the new tree is left alone.
    if (current?.slug && leafSlugs.has(current.slug)) continue

    const haystack = `${product.name} ${product.sku}`.toLowerCase()
    const target =
      keywordMap.find((entry) => haystack.includes(entry.needle))?.id ??
      typeMap.get(product.productType ?? '') ??
      bySlug.get(fallbackByType[product.productType ?? 'accessory'] ?? 'phone-mounts')

    if (!target) continue

    await payload.update({
      collection: 'products',
      id: product.id,
      data: { category: target },
      overrideAccess: true,
    })
    moved += 1
    console.log(`  ${product.sku} → ${[...bySlug.entries()].find(([, id]) => id === target)?.[0]}`)
  }

  /* Retire legacy categories that nothing points at any more. */
  let removed = 0
  // Only slugs the taxonomy does not use — deleting a live parent orphans its
  // children.
  for (const slug of ['engine-oils', 'accessories', 'spare-parts']) {
    const id = bySlug.get(slug)
    if (!id || leafSlugs.has(slug)) continue
    const inUse = await payload.count({ collection: 'products', where: { category: { equals: id } } })
    if (inUse.totalDocs > 0) continue
    try {
      await payload.delete({ collection: 'productCategories', id, overrideAccess: true })
      removed += 1
    } catch {
      /* referenced by a homepage block; leave it */
    }
  }

  console.log(`\n✅ ${moved} products remapped, ${removed} legacy categories removed.`)
  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
