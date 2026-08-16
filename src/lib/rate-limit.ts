import { headers } from 'next/headers'

type Bucket = { count: number; resetAt: number }

// Per-instance limiter. Enough to stop casual abuse of the public endpoints;
// swap for Redis/Upstash if the app is ever scaled to many instances.
const buckets = new Map<string, Bucket>()

export const clientKey = async (scope: string): Promise<string> => {
  const headerList = await headers()
  const ip =
    headerList.get('x-forwarded-for')?.split(',')[0]?.trim() ||
    headerList.get('x-real-ip') ||
    'unknown'
  return `${scope}:${ip}`
}

export const rateLimit = ({
  key,
  limit = 10,
  windowMs = 60_000,
}: {
  key: string
  limit?: number
  windowMs?: number
}): { ok: boolean; retryAfterSeconds: number } => {
  const now = Date.now()
  const bucket = buckets.get(key)

  if (!bucket || bucket.resetAt <= now) {
    buckets.set(key, { count: 1, resetAt: now + windowMs })
    return { ok: true, retryAfterSeconds: 0 }
  }

  if (bucket.count >= limit) {
    return { ok: false, retryAfterSeconds: Math.ceil((bucket.resetAt - now) / 1000) }
  }

  bucket.count += 1
  return { ok: true, retryAfterSeconds: 0 }
}

/** Convenience wrapper for server actions. */
export const guard = async (scope: string, limit = 10, windowMs = 60_000) => {
  const key = await clientKey(scope)
  return rateLimit({ key, limit, windowMs })
}
