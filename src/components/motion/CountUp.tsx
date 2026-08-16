'use client'

import { useEffect, useRef, useState } from 'react'
import { useInView } from 'framer-motion'

/**
 * Counts up to the numeric part of a stat when it scrolls into view, keeping any
 * prefix or suffix ("+", "4.8/5", "48,000+") exactly as the admin typed it.
 */
export const CountUp = ({ value, duration = 1400 }: { value: string; duration?: number }) => {
  const ref = useRef<HTMLSpanElement>(null)
  const inView = useInView(ref, { once: true, margin: '-80px' })
  const [display, setDisplay] = useState(value)

  const match = /^(\D*)([\d,.]+)(.*)$/.exec(value.trim())
  const target = match ? Number(match[2].replace(/,/g, '')) : null

  useEffect(() => {
    if (!inView || target === null || !match) return

    const prefersReduced = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    if (prefersReduced) {
      setDisplay(value)
      return
    }

    const decimals = match[2].includes('.') ? match[2].split('.')[1].length : 0
    const grouped = match[2].includes(',')
    const start = performance.now()
    let frame = 0

    const tick = (now: number) => {
      const progress = Math.min((now - start) / duration, 1)
      // Ease-out so it decelerates into the final figure.
      const eased = 1 - Math.pow(1 - progress, 3)
      const current = target * eased
      const formatted = grouped
        ? current.toLocaleString(undefined, { maximumFractionDigits: decimals })
        : current.toFixed(decimals)
      setDisplay(`${match[1]}${formatted}${match[3]}`)
      if (progress < 1) frame = requestAnimationFrame(tick)
    }

    frame = requestAnimationFrame(tick)
    return () => cancelAnimationFrame(frame)
  }, [inView, target, value, duration, match])

  return (
    <span ref={ref} className="tabular-nums">
      {display}
    </span>
  )
}
