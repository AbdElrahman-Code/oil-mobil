/**
 * End-to-end check of the recommendation engine against the seeded database.
 *   npx tsx src/seed/verify.ts
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { applyRules, selectSpec } from '../lib/oil-engine'
import type { OilSpecification } from '../payload-types'

const run = async () => {
  const payload = await getPayload({ config })
  let failures = 0

  const check = (label: string, condition: boolean, detail = '') => {
    console.log(`${condition ? '  ✓' : '  ✗'} ${label}${detail ? ` — ${detail}` : ''}`)
    if (!condition) failures += 1
  }

  const rules = await payload.find({
    collection: 'oilAdjustmentRules',
    where: { isActive: { equals: true } },
    sort: 'priority',
    limit: 100,
    depth: 0,
  })

  const findModel = async (brandName: string, modelName: string) => {
    const brand = await payload.find({ collection: 'vehicleBrands', where: { name: { equals: brandName } }, limit: 1 })
    const model = await payload.find({
      collection: 'vehicleModels',
      where: { and: [{ brand: { equals: brand.docs[0]?.id } }, { name: { equals: modelName } }] },
      limit: 1,
      depth: 1,
    })
    return model.docs[0]
  }

  const specsFor = async (modelId: number) => {
    const result = await payload.find({
      collection: 'oilSpecifications',
      where: { vehicleModel: { equals: modelId } },
      limit: 100,
      depth: 2,
    })
    return result.docs as OilSpecification[]
  }

  /* 1 — healthy car, straight lookup */
  console.log('\n1. Toyota Corolla 2019 · 1.6 petrol · 60,000 km · good')
  const corolla = await findModel('Toyota', 'Corolla')
  const corollaSpecs = await specsFor(corolla.id)
  const spec1 = selectSpec(corollaSpecs, { year: 2019, engineCode: '1.6-petrol' })
  check('spec matched', Boolean(spec1))

  if (spec1) {
    const result = applyRules({
      spec: spec1,
      rules: rules.docs,
      input: { mileageKm: 60000, condition: 'good' },
      engine: corolla.engines?.find((e) => e.code === '1.6-petrol'),
    })
    check('viscosity is 5W-30', result.viscosity === '5W-30', result.viscosity)
    check('not adjusted', !result.viscosityAdjusted)
    check('interval 10,000 km', result.intervalKm === 10000, `${result.intervalKm} km`)
    check('quantity 4.2 L', result.quantityLiters === 4.2, `${result.quantityLiters} L`)
    check(
      'recommended product linked',
      typeof spec1.recommendedOilProduct === 'object' && spec1.recommendedOilProduct !== null,
      typeof spec1.recommendedOilProduct === 'object' ? spec1.recommendedOilProduct?.name : 'none',
    )
    check(
      'oil filter linked',
      typeof spec1.oilFilterProduct === 'object' && spec1.oilFilterProduct !== null,
      String(spec1.oilFilterPartNumber),
    )
  }

  /* 2 — high mileage + burns oil: rules must stack */
  console.log('\n2. Same car · 200,000 km · consumes oil')
  if (spec1) {
    const result = applyRules({
      spec: spec1,
      rules: rules.docs,
      input: { mileageKm: 200000, condition: 'consumesOil' },
      engine: corolla.engines?.find((e) => e.code === '1.6-petrol'),
    })
    check('viscosity thickened to 5W-50', result.viscosity === '5W-50', result.viscosity)
    check('marked as adjusted', result.viscosityAdjusted)
    check('interval shortened below 10,000', result.intervalKm < 10000, `${result.intervalKm} km`)
    check('two rules applied', result.appliedRules.length === 2, result.appliedRules.map((r) => r.name).join(' + '))
    check('customer notes returned', result.appliedRules.some((r) => r.note))
  }

  /* 3 — turbo rule forces full synthetic */
  console.log('\n3. Hyundai Tucson 2020 · 1.6 turbo · 40,000 km')
  const tucson = await findModel('Hyundai', 'Tucson')
  const spec3 = selectSpec(await specsFor(tucson.id), { year: 2020, engineCode: '1.6-turbo' })
  check('spec matched', Boolean(spec3))
  if (spec3) {
    const result = applyRules({
      spec: spec3,
      rules: rules.docs,
      input: { mileageKm: 40000, condition: 'good' },
      engine: tucson.engines?.find((e) => e.code === '1.6-turbo'),
    })
    check('forced to full synthetic', result.oilType === 'fullSynthetic', result.oilType)
    check('turbo rule applied', result.appliedRules.some((r) => r.name.toLowerCase().includes('turbo')))
  }

  /* 4 — rebuilt engine flags staff review */
  console.log('\n4. Same Corolla · recently rebuilt')
  if (spec1) {
    const result = applyRules({
      spec: spec1,
      rules: rules.docs,
      input: { mileageKm: 5000, condition: 'rebuilt' },
      engine: corolla.engines?.find((e) => e.code === '1.6-petrol'),
    })
    check('flagged for staff review', result.needsStaffReview)
    check('interval halved', result.intervalKm <= 5000, `${result.intervalKm} km`)
  }

  /* 5 — graceful fallback */
  console.log('\n5. Unknown engine on a known model')
  const spec5 = selectSpec(corollaSpecs, { year: 2019, engineCode: '3.5-v6' })
  check('no spec returned (fallback path)', spec5 === null)

  /* 6 — year-range boundaries */
  console.log('\n6. Year ranges')
  const spec6a = selectSpec(corollaSpecs, { year: 2013, engineCode: '1.6-petrol' })
  check('2013 is outside 2014+ range', spec6a === null)
  const spec6b = selectSpec(corollaSpecs, { year: 2021, engineCode: '2.0-petrol' })
  check('2021 matches the 2019+ 2.0 spec', spec6b?.recommendedViscosity === '0W-20', spec6b?.recommendedViscosity)

  /* 7 — content sanity */
  console.log('\n7. Content')
  const [products, homepage, settings, admins] = await Promise.all([
    payload.count({ collection: 'products', where: { isPublished: { equals: true } } }),
    payload.findGlobal({ slug: 'homepage', locale: 'ar' }),
    payload.findGlobal({ slug: 'siteSettings', locale: 'ar' }),
    payload.count({ collection: 'users' }),
  ])
  check('published products', products.totalDocs >= 40, String(products.totalDocs))
  check('homepage has Arabic sections', (homepage.sections?.length ?? 0) >= 6, String(homepage.sections?.length))
  check('Arabic site name set', Boolean(settings.siteName), settings.siteName ?? '')
  check('staff account exists', admins.totalDocs >= 1)

  console.log(failures === 0 ? '\n✅ All checks passed.' : `\n❌ ${failures} check(s) failed.`)
  process.exit(failures === 0 ? 0 : 1)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
