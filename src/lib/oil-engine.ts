import type { OilAdjustmentRule, OilSpecification, Product, VehicleModel } from '@/payload-types'

export type EngineCondition = 'excellent' | 'good' | 'consumesOil' | 'rebuilt'

export type OilEngineInput = {
  model: VehicleModel
  year: number
  engineCode: string
  mileageKm?: number
  condition?: EngineCondition
}

export type OilRecommendation = {
  viscosity: string
  baseViscosity: string
  viscosityAdjusted: boolean
  oilType: NonNullable<OilSpecification['oilType']>
  apiSpec?: string | null
  aceaSpec?: string | null
  quantityLiters: number
  intervalKm: number
  intervalMonths: number
  appliedRules: { id: number; name: string; note?: string | null }[]
  needsStaffReview: boolean
  notes?: OilSpecification['notes']
  spec: OilSpecification
}

/* ---------------------------------------------------------------- viscosity */

const VISCOSITY_RE = /^(\d+)W-?(\d+)$/i

/**
 * Shifts the high-temperature half of an SAE grade by one step (10), e.g.
 * 5W-30 → 5W-40. Unrecognised grades are returned untouched rather than mangled.
 */
export const shiftViscosity = (grade: string, direction: 'thicker' | 'thinner'): string => {
  const match = VISCOSITY_RE.exec(grade.trim())
  if (!match) return grade
  const winter = Number(match[1])
  const hot = Number(match[2])
  const next = direction === 'thicker' ? hot + 10 : hot - 10
  // Stay inside grades that actually exist on a shelf.
  if (next < 20 || next > 60) return grade
  return `${winter}W-${next}`
}

/* -------------------------------------------------------------- spec lookup */

/** Picks the spec row whose year range and engine code fit the car, narrowest first. */
export const selectSpec = (
  specs: OilSpecification[],
  { year, engineCode }: { year: number; engineCode: string },
): OilSpecification | null => {
  const candidates = specs.filter((spec) => {
    const fromOk = typeof spec.yearFrom === 'number' ? year >= spec.yearFrom : true
    const toOk = typeof spec.yearTo === 'number' ? year <= spec.yearTo : true
    const engineOk = spec.engineCode?.toLowerCase() === engineCode.toLowerCase()
    return fromOk && toOk && engineOk
  })

  if (!candidates.length) return null

  // Prefer the most specific range (smallest span) so a targeted override wins.
  return candidates.sort((a, b) => {
    const spanA = (a.yearTo ?? year + 50) - (a.yearFrom ?? 0)
    const spanB = (b.yearTo ?? year + 50) - (b.yearFrom ?? 0)
    return spanA - spanB
  })[0]
}

/* -------------------------------------------------------------------- rules */

const ruleMatches = (
  rule: OilAdjustmentRule,
  input: { mileageKm?: number; condition?: EngineCondition; fuelType?: string; isTurbo?: boolean },
): boolean => {
  if (rule.isActive === false) return false

  if (rule.engineConditions?.length) {
    if (!input.condition || !rule.engineConditions.includes(input.condition)) return false
  }
  if (typeof rule.minMileageKm === 'number') {
    if (typeof input.mileageKm !== 'number' || input.mileageKm < rule.minMileageKm) return false
  }
  if (typeof rule.maxMileageKm === 'number') {
    if (typeof input.mileageKm !== 'number' || input.mileageKm > rule.maxMileageKm) return false
  }
  if (rule.fuelTypes?.length) {
    if (!input.fuelType || !rule.fuelTypes.includes(input.fuelType as never)) return false
  }
  if (rule.turboOnly && !input.isTurbo) return false

  return true
}

/**
 * Applies the admin-editable rules on top of the base specification.
 * Rules are additive and evaluated in priority order — the shop's technicians
 * change behaviour by editing rows, never by editing code.
 */
export const applyRules = ({
  spec,
  rules,
  input,
  engine,
  locale = 'ar',
}: {
  spec: OilSpecification
  rules: OilAdjustmentRule[]
  input: { mileageKm?: number; condition?: EngineCondition }
  engine?: NonNullable<VehicleModel['engines']>[number]
  locale?: 'ar' | 'en'
}): OilRecommendation => {
  const baseViscosity = spec.recommendedViscosity ?? ''
  let viscosity = baseViscosity
  let oilType = spec.oilType ?? 'fullSynthetic'
  let intervalKm = spec.recommendedChangeIntervalKm ?? 10000
  let intervalMonths = spec.recommendedChangeIntervalMonths ?? 6
  let needsStaffReview = false
  const appliedRules: OilRecommendation['appliedRules'] = []

  const matchContext = {
    mileageKm: input.mileageKm,
    condition: input.condition,
    fuelType: engine?.fuelType ?? undefined,
    isTurbo: engine?.isTurbo ?? false,
  }

  const ordered = [...rules].sort((a, b) => (a.priority ?? 100) - (b.priority ?? 100))

  for (const rule of ordered) {
    if (!ruleMatches(rule, matchContext)) continue

    if (rule.viscosityShift === 'thicker') viscosity = shiftViscosity(viscosity, 'thicker')
    if (rule.viscosityShift === 'thinner') viscosity = shiftViscosity(viscosity, 'thinner')
    if (rule.forceOilType) oilType = rule.forceOilType
    if (typeof rule.intervalKmMultiplier === 'number') intervalKm *= rule.intervalKmMultiplier
    if (typeof rule.intervalMonthsMultiplier === 'number') intervalMonths *= rule.intervalMonthsMultiplier
    if (rule.flagForStaffReview) needsStaffReview = true

    appliedRules.push({
      id: rule.id,
      name: rule.name,
      note: typeof rule.customerNote === 'string' ? rule.customerNote : null,
    })
  }

  return {
    viscosity,
    baseViscosity,
    viscosityAdjusted: viscosity !== baseViscosity,
    oilType,
    apiSpec: spec.requiredAPISpec,
    aceaSpec: spec.requiredACEASpec,
    quantityLiters: spec.requiredOilQuantityLiters ?? 0,
    // Round to something a service desk would actually quote.
    intervalKm: Math.max(1000, Math.round(intervalKm / 500) * 500),
    intervalMonths: Math.max(1, Math.round(intervalMonths)),
    appliedRules,
    needsStaffReview,
    notes: spec.notes,
    spec,
  }
}

/** How many bottles of a given size cover the required litres. */
export const bottlesNeeded = (litresRequired: number, bottleLitres?: number | null): number => {
  if (!bottleLitres || bottleLitres <= 0) return 1
  return Math.max(1, Math.ceil(litresRequired / bottleLitres))
}

export const productMatchesViscosity = (product: Product, viscosity: string): boolean => {
  const productViscosity = product.oilAttributes?.viscosity
  if (!productViscosity) return false
  return productViscosity.replace(/\s/g, '').toLowerCase() === viscosity.replace(/\s/g, '').toLowerCase()
}
