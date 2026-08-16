import type { Payload, PayloadRequest } from 'payload'

/**
 * Next number in a per-year sequence, e.g. ORD-2026-000123.
 * Reads the highest existing number for the current year and adds one.
 */
export const nextSequentialNumber = async ({
  payload,
  req,
  collection,
  field,
  prefix,
  padding = 6,
}: {
  payload: Payload
  req?: PayloadRequest
  collection: 'orders' | 'invoices'
  field: string
  prefix: string
  padding?: number
}): Promise<string> => {
  const year = new Date().getFullYear()
  const scope = `${prefix}-${year}-`

  const existing = await payload.find({
    collection,
    where: { [field]: { like: scope } },
    sort: `-${field}`,
    limit: 1,
    depth: 0,
    pagination: false,
    req,
  })

  const last = existing.docs[0] as unknown as Record<string, unknown> | undefined
  const lastValue = typeof last?.[field] === 'string' ? (last[field] as string) : undefined
  const lastSeq = lastValue ? Number.parseInt(lastValue.slice(scope.length), 10) : 0
  const next = Number.isFinite(lastSeq) ? lastSeq + 1 : 1

  return `${scope}${String(next).padStart(padding, '0')}`
}
