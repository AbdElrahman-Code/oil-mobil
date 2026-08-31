/**
 * Installs the full parts taxonomy and remaps existing stock onto it.
 *
 *   npx tsx src/seed/categories.ts
 *
 * Safe to re-run: categories are matched by slug and updated in place, and no
 * product is left without a category.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { taxonomy } from './taxonomy'

const run = async () => {
  const payload = await getPayload({ config })

  /* ── Categories ───────────────────────────────────────────────────────── */
  const ids = new Map<string, number>()

  const upsert = async ({
    key,
    en,
    ar,
    icon,
    order,
    parent,
    home,
  }: {
    key: string
    en: string
    ar: string
    icon: string
    order: number
    parent?: number
    home?: boolean
  }) => {
    const existing = await payload.find({
      collection: 'productCategories',
      where: { slug: { equals: key } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const data = {
      name: en,
      slug: key,
      icon: icon as 'droplet',
      displayOrder: order,
      parent,
      showInNav: !parent,
      showOnHomepage: Boolean(home),
    }

    const doc = existing.docs[0]
      ? await payload.update({
          collection: 'productCategories',
          id: existing.docs[0].id,
          locale: 'en',
          data,
          overrideAccess: true,
        })
      : await payload.create({ collection: 'productCategories', locale: 'en', data, overrideAccess: true })

    await payload.update({
      collection: 'productCategories',
      id: doc.id,
      locale: 'ar',
      data: { name: ar },
      overrideAccess: true,
    })

    ids.set(key, doc.id)
    return doc.id
  }

  for (const top of taxonomy) {
    const parentId = await upsert({ ...top, home: top.home })
    for (const [index, child] of top.children.entries()) {
      await upsert({
        key: child.key,
        en: child.en,
        ar: child.ar,
        icon: top.icon,
        order: (index + 1) * 10,
        parent: parentId,
      })
    }
    console.log(`→ ${top.en} (${top.children.length} sub-categories)`)
  }

  /* ── Remap existing products ──────────────────────────────────────────── */
  const products = await payload.find({
    collection: 'products',
    limit: 500,
    depth: 0,
    locale: 'en',
    pagination: false,
    overrideAccess: true,
  })

  // Build the lookup once: keyword → category id, and product type → fallback.
  const keywordMap: { needle: string; id: number }[] = []
  const typeMap = new Map<string, number>()

  for (const top of taxonomy) {
    for (const child of top.children) {
      const id = ids.get(child.key)
      if (!id) continue
      for (const needle of child.match ?? []) keywordMap.push({ needle: needle.toLowerCase(), id })
      for (const type of child.productTypes ?? []) typeMap.set(type, id)
    }
  }

  // Longest keyword first, so "oil filter" beats "oil".
  keywordMap.sort((a, b) => b.needle.length - a.needle.length)

  const fallbackByType: Record<string, string> = {
    oil: 'engine-oil',
    filter: 'oil-filters',
    battery: 'batteries',
    care: 'shampoo',
    accessory: 'phone-mounts',
    sparePart: 'spark-plugs',
  }

  let moved = 0
  for (const product of products.docs) {
    const haystack = `${product.name} ${product.sku}`.toLowerCase()
    const keyword = keywordMap.find((entry) => haystack.includes(entry.needle))

    const target =
      keyword?.id ??
      typeMap.get(product.productType ?? '') ??
      ids.get(fallbackByType[product.productType ?? 'accessory'] ?? 'phone-mounts')

    if (!target) continue
    const current = typeof product.category === 'object' ? product.category?.id : product.category
    if (current === target) continue

    await payload.update({
      collection: 'products',
      id: product.id,
      data: { category: target },
      overrideAccess: true,
    })
    moved += 1
  }

  /* ── Retire the old six categories once nothing points at them ────────── */
  // 'car-care' is deliberately absent: it is a live taxonomy key, and deleting
  // it orphans its children.
  const legacy = ['engine-oils', 'accessories', 'spare-parts']
  let removed = 0
  for (const slug of legacy) {
    const found = await payload.find({
      collection: 'productCategories',
      where: { slug: { equals: slug } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    const doc = found.docs[0]
    if (!doc) continue

    const inUse = await payload.count({ collection: 'products', where: { category: { equals: doc.id } } })
    if (inUse.totalDocs > 0) {
      console.log(`   kept ${slug} — still has ${inUse.totalDocs} product(s)`)
      continue
    }
    try {
      await payload.delete({ collection: 'productCategories', id: doc.id, overrideAccess: true })
      removed += 1
    } catch {
      /* referenced by content somewhere; leave it */
    }
  }

  console.log(`\n✅ Taxonomy installed — ${ids.size} categories, ${moved} products remapped, ${removed} legacy removed.`)
  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
