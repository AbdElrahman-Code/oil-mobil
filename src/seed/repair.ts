/**
 * One-off repair for databases seeded before the locale-update fix: restores the
 * non-localized engine fields (isTurbo, displacement) and branch contact details
 * that partial Arabic updates had blanked out.
 *
 *   npx tsx src/seed/repair.ts
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { brands } from './data'

const run = async () => {
  const payload = await getPayload({ config })

  const models = await payload.find({ collection: 'vehicleModels', limit: 500, depth: 1, locale: 'en' })
  let repaired = 0

  for (const model of models.docs) {
    const brandName = typeof model.brand === 'object' ? model.brand?.name : undefined
    const source = brands.find((brand) => brand.name === brandName)?.models.find((m) => m.name === model.name)
    if (!source || !model.engines?.length) continue

    const engines = model.engines.map((row) => {
      const seedEngine = source.engines.find((engine) => engine.code === row.code)
      return {
        id: row.id,
        code: row.code,
        label: row.label,
        fuelType: row.fuelType,
        displacementLiters: seedEngine?.displacementLiters ?? row.displacementLiters,
        isTurbo: seedEngine?.isTurbo ?? false,
      }
    })

    await payload.update({
      collection: 'vehicleModels',
      id: model.id,
      locale: 'en',
      data: { engines },
      overrideAccess: true,
    })
    repaired += 1
  }

  console.log(`→ repaired engine flags on ${repaired} models`)

  const settings = await payload.findGlobal({ slug: 'siteSettings', locale: 'en' })
  const contact = [
    { phone: '0221234567', latitude: 30.0626, longitude: 31.3399 },
    { phone: '0238765432' },
  ]

  if (settings.branches?.length) {
    await payload.updateGlobal({
      slug: 'siteSettings',
      locale: 'en',
      data: {
        branches: settings.branches.map((branch, index) => ({
          ...branch,
          phone: branch.phone ?? contact[index]?.phone,
          latitude: branch.latitude ?? contact[index]?.latitude,
          longitude: branch.longitude ?? contact[index]?.longitude,
        })),
      },
    })
    console.log('→ restored branch contact details')
  }

  console.log('✅ Repair complete.')
  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
