'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { useLocale, useTranslations } from 'next-intl'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, Search, X } from 'lucide-react'
import { useRouter } from '@/i18n/routing'
import type { Locale } from '@/i18n/routing'
import { searchProducts, type SearchHit } from '@/actions/search'
import { formatPrice } from '@/lib/utils'
import { track } from '@/components/analytics/AnalyticsProvider'
import { cn } from '@/lib/utils'

/**
 * Instant catalogue search. Opens on click or ⌘K / Ctrl-K, debounced, fully
 * keyboard driven — arrow keys move, Enter opens, Escape closes.
 */
export const SearchOverlay = ({ open, onClose }: { open: boolean; onClose: () => void }) => {
  const locale = useLocale() as Locale
  const t = useTranslations('shop')
  const tCommon = useTranslations('common')
  const router = useRouter()

  const [term, setTerm] = useState('')
  const [hits, setHits] = useState<SearchHit[]>([])
  const [loading, setLoading] = useState(false)
  const [active, setActive] = useState(0)
  const [mounted, setMounted] = useState(false)
  const inputRef = useRef<HTMLInputElement>(null)

  useEffect(() => setMounted(true), [])

  useEffect(() => {
    if (!open) return
    document.body.style.overflow = 'hidden'
    const focus = setTimeout(() => inputRef.current?.focus(), 60)
    return () => {
      document.body.style.overflow = ''
      clearTimeout(focus)
    }
  }, [open])

  useEffect(() => {
    if (!open) {
      setTerm('')
      setHits([])
      setActive(0)
    }
  }, [open])

  // Debounce so a fast typist fires one query, not eight.
  useEffect(() => {
    if (term.trim().length < 2) {
      setHits([])
      setLoading(false)
      return
    }
    setLoading(true)
    const timer = setTimeout(async () => {
      const results = await searchProducts(term, locale)
      setHits(results)
      setActive(0)
      setLoading(false)
      track('search_performed', { term, results: results.length })
    }, 220)
    return () => clearTimeout(timer)
  }, [term, locale])

  const goTo = useCallback(
    (hit: SearchHit) => {
      onClose()
      router.push(`/products/${hit.slug}`)
    },
    [onClose, router],
  )

  const onKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') return onClose()
    if (event.key === 'ArrowDown') {
      event.preventDefault()
      setActive((index) => Math.min(index + 1, hits.length - 1))
    }
    if (event.key === 'ArrowUp') {
      event.preventDefault()
      setActive((index) => Math.max(index - 1, 0))
    }
    if (event.key === 'Enter') {
      event.preventDefault()
      if (hits[active]) goTo(hits[active])
      else if (term.trim()) {
        onClose()
        router.push(`/shop?q=${encodeURIComponent(term.trim())}` as never)
      }
    }
  }

  if (!mounted) return null

  return createPortal(
    <AnimatePresence>
      {open ? (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.18 }}
          className="fixed inset-0 z-[70] bg-neutral-950/60 p-4 backdrop-blur-sm sm:p-8"
          onClick={onClose}
        >
          <motion.div
            initial={{ opacity: 0, y: -16, scale: 0.98 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -12, scale: 0.98 }}
            transition={{ duration: 0.24, ease: [0.16, 1, 0.3, 1] }}
            className="mx-auto w-full max-w-2xl overflow-hidden rounded-[var(--radius-card)] bg-white shadow-[var(--shadow-lift)]"
            onClick={(event) => event.stopPropagation()}
            role="dialog"
            aria-modal="true"
            aria-label={tCommon('search')}
          >
            <div className="flex items-center gap-3 border-b border-neutral-200 px-5">
              <Search className="size-5 shrink-0 text-neutral-400" />
              <input
                ref={inputRef}
                value={term}
                onChange={(event) => setTerm(event.target.value)}
                onKeyDown={onKeyDown}
                placeholder={t('searchPlaceholder')}
                className="h-16 flex-1 bg-transparent text-body-lg outline-none placeholder:text-neutral-400"
                aria-label={tCommon('search')}
                autoComplete="off"
              />
              {loading ? <Loader2 className="size-4 animate-spin text-neutral-400" /> : null}
              <button
                type="button"
                onClick={onClose}
                className="grid size-8 place-items-center rounded-full text-neutral-400 transition-colors hover:bg-neutral-100"
                aria-label={tCommon('close')}
              >
                <X className="size-4" />
              </button>
            </div>

            <div className="max-h-[60vh] overflow-y-auto">
              {hits.length ? (
                <ul role="listbox">
                  {hits.map((hit, index) => (
                    <li key={hit.id}>
                      <button
                        type="button"
                        onClick={() => goTo(hit)}
                        onMouseEnter={() => setActive(index)}
                        aria-selected={index === active}
                        role="option"
                        className={cn(
                          'flex w-full items-center gap-4 px-5 py-3 text-start transition-colors',
                          index === active ? 'bg-primary-light' : 'hover:bg-neutral-50',
                        )}
                      >
                        <div className="relative size-12 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
                          {hit.image ? (
                            <Image src={hit.image} alt="" fill sizes="48px" className="object-cover" />
                          ) : null}
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate font-medium text-neutral-950">{hit.name}</p>
                          <p className="truncate text-body-sm text-neutral-400">
                            {[hit.brand, hit.category].filter(Boolean).join(' · ')}
                          </p>
                        </div>
                        <div className="text-end">
                          <p className="font-semibold">{formatPrice(hit.price, locale)}</p>
                          {!hit.inStock ? (
                            <p className="text-label text-neutral-400">{t('outOfStock')}</p>
                          ) : null}
                        </div>
                      </button>
                    </li>
                  ))}
                </ul>
              ) : term.trim().length >= 2 && !loading ? (
                <p className="px-5 py-10 text-center text-neutral-400">{t('noResults')}</p>
              ) : (
                <p className="px-5 py-10 text-center text-body-sm text-neutral-400">
                  {t('searchPlaceholder')}
                </p>
              )}
            </div>

            <div className="flex items-center justify-between border-t border-neutral-200 px-5 py-3 text-label text-neutral-400">
              <span className="hidden sm:inline">↑ ↓ · Enter · Esc</span>
              {term.trim() ? (
                <button
                  type="button"
                  onClick={() => {
                    onClose()
                    router.push(`/shop?q=${encodeURIComponent(term.trim())}` as never)
                  }}
                  className="font-semibold text-primary hover:underline"
                >
                  {t('allProducts')} →
                </button>
              ) : null}
            </div>
          </motion.div>
        </motion.div>
      ) : null}
    </AnimatePresence>,
    document.body,
  )
}

/** Registers the ⌘K / Ctrl-K shortcut for a search trigger. */
export const useSearchHotkey = (onOpen: () => void) => {
  useEffect(() => {
    const handler = (event: KeyboardEvent) => {
      if ((event.metaKey || event.ctrlKey) && event.key.toLowerCase() === 'k') {
        event.preventDefault()
        onOpen()
      }
    }
    window.addEventListener('keydown', handler)
    return () => window.removeEventListener('keydown', handler)
  }, [onOpen])
}
