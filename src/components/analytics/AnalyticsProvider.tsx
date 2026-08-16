'use client'

import { useEffect } from 'react'
import posthog from 'posthog-js'

/**
 * PostHog is optional: without a key the provider is a no-op, so local dev and
 * previews never depend on it.
 */
export const AnalyticsProvider = ({ children }: { children: React.ReactNode }) => {
  useEffect(() => {
    const key = process.env.NEXT_PUBLIC_POSTHOG_KEY
    if (!key || posthog.__loaded) return
    posthog.init(key, {
      api_host: process.env.NEXT_PUBLIC_POSTHOG_HOST || 'https://eu.i.posthog.com',
      capture_pageview: true,
      capture_pageleave: true,
      persistence: 'localStorage+cookie',
    })
  }, [])

  return <>{children}</>
}

/** Fire-and-forget product event. Safe to call when analytics is disabled. */
export const track = (event: string, properties?: Record<string, unknown>) => {
  if (typeof window === 'undefined') return
  if (!process.env.NEXT_PUBLIC_POSTHOG_KEY) return
  posthog.capture(event, properties)
}
