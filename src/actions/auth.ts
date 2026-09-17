'use server'

import { cookies, headers } from 'next/headers'
import { z } from 'zod'
import type { Customer } from '@/payload-types'
import { getPayloadClient } from '@/lib/payload'
import { guard } from '@/lib/rate-limit'
import { egyptianPhone } from '@/lib/validation'

const COOKIE = 'payload-token'

const loginSchema = z.object({
  phone: egyptianPhone,
  password: z.string().min(6).max(120),
})

const signupSchema = loginSchema.extend({
  name: z.string().trim().min(2).max(80),
  email: z.string().email().optional().or(z.literal('')),
})

export type AuthResult = { ok: true } | { ok: false; error: string }

const setSessionCookie = async (token: string, expiresInSeconds: number) => {
  const store = await cookies()
  store.set(COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: expiresInSeconds,
  })
}

export const loginCustomer = async (input: unknown): Promise<AuthResult> => {
  const limit = await guard('login', 10, 5 * 60_000)
  if (!limit.ok) return { ok: false, error: 'tooManyRequests' }

  const parsed = loginSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalidInput' }

  try {
    const payload = await getPayloadClient()
    const result = await payload.login({
      collection: 'customers',
      data: { username: parsed.data.phone, password: parsed.data.password },
    })
    if (!result.token) return { ok: false, error: 'invalidCredentials' }
    await setSessionCookie(result.token, 60 * 60 * 24 * 30)
    return { ok: true }
  } catch {
    return { ok: false, error: 'invalidCredentials' }
  }
}

export const signupCustomer = async (input: unknown): Promise<AuthResult> => {
  const limit = await guard('signup', 5, 10 * 60_000)
  if (!limit.ok) return { ok: false, error: 'tooManyRequests' }

  const parsed = signupSchema.safeParse(input)
  if (!parsed.success) return { ok: false, error: 'invalidInput' }

  try {
    const payload = await getPayloadClient()

    const existing = await payload.find({
      collection: 'customers',
      where: { phone: { equals: parsed.data.phone } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (existing.docs.length) return { ok: false, error: 'phoneTaken' }

    await payload.create({
      collection: 'customers',
      data: {
        name: parsed.data.name,
        phone: parsed.data.phone,
        username: parsed.data.phone,
        email: parsed.data.email || undefined,
        password: parsed.data.password,
        preferredLanguage: 'ar',
      },
      overrideAccess: true,
    })

    return await loginCustomer({ phone: parsed.data.phone, password: parsed.data.password })
  } catch (error) {
    console.error('signupCustomer failed', error)
    return { ok: false, error: 'serverError' }
  }
}

export const logoutCustomer = async (): Promise<void> => {
  const store = await cookies()
  store.delete(COOKIE)
}

/** The signed-in customer, or null. Used by every /account page. */
/** Cheap yes/no for client components that must not make a static page dynamic. */
export const isSignedIn = async (): Promise<boolean> => Boolean(await getCurrentCustomer())

export const getCurrentCustomer = async (): Promise<Customer | null> => {
  try {
    const payload = await getPayloadClient()
    const headerList = await headers()
    const { user } = await payload.auth({ headers: headerList })
    if (!user || (user as { collection?: string }).collection !== 'customers') return null
    return user as unknown as Customer
  } catch {
    return null
  }
}
