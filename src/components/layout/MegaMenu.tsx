'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronRight, LayoutGrid, X } from 'lucide-react'
import { useTranslations } from 'next-intl'
import { Link, usePathname } from '@/i18n/routing'
import { cn } from '@/lib/utils'
import { categoryStyle, categoryTheme } from '@/lib/category-theme'

export type MenuCategory = {
  id: number
  name: string
  slug: string
  icon?: string | null
  children: { id: number; name: string; slug: string }[]
}

/**
 * "All categories" — the whole catalogue two clicks deep. Hovering a section on
 * desktop reveals its sub-categories beside it; on mobile it is a plain
 * expanding list, which is far easier to operate with a thumb.
 */
export const MegaMenu = ({ categories }: { categories: MenuCategory[] }) => {
  const t = useTranslations('shop')
  const pathname = usePathname()
  const [open, setOpen] = useState(false)
  const [active, setActive] = useState<number | null>(categories[0]?.id ?? null)
  const container = useRef<HTMLDivElement>(null)

  useEffect(() => setOpen(false), [pathname])

  useEffect(() => {
    if (!open) return
    const onClick = (event: MouseEvent) => {
      if (!container.current?.contains(event.target as Node)) setOpen(false)
    }
    const onKey = (event: KeyboardEvent) => event.key === 'Escape' && setOpen(false)
    document.addEventListener('mousedown', onClick)
    document.addEventListener('keydown', onKey)
    return () => {
      document.removeEventListener('mousedown', onClick)
      document.removeEventListener('keydown', onKey)
    }
  }, [open])

  const activeCategory = categories.find((category) => category.id === active) ?? categories[0]

  return (
    <div ref={container} className="relative">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className={cn(
          'flex h-11 items-center gap-2 rounded-full px-4 text-body-sm font-semibold transition-colors',
          open ? 'bg-primary-dark text-white' : 'bg-primary text-white hover:bg-primary-dark',
        )}
      >
        {open ? <X className="size-4" /> : <LayoutGrid className="size-4" />}
        {t('categories')}
      </button>

      <AnimatePresence>
        {open ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 4 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
            className="absolute start-0 top-full z-50 mt-2 w-[min(58rem,calc(100vw-2rem))] overflow-hidden rounded-[var(--radius-card)] border border-neutral-200 bg-white shadow-[var(--shadow-lift)]"
          >
            <div className="grid md:grid-cols-[16rem_1fr]">
              <ul className="max-h-[26rem] overflow-y-auto border-neutral-200 p-2 md:border-e">
                {categories.map((category) => {
                  const { Icon } = categoryTheme(category.slug)
                  const isActive = activeCategory?.id === category.id
                  return (
                    <li key={category.id} style={categoryStyle(category.slug)}>
                      <Link
                        href={`/shop/${category.slug}`}
                        onMouseEnter={() => setActive(category.id)}
                        onFocus={() => setActive(category.id)}
                        className={cn(
                          'flex items-center gap-3 rounded-xl px-3 py-2.5 text-body-sm transition-colors',
                          isActive
                            ? 'bg-[var(--cat-soft)] text-[var(--cat-ink)]'
                            : 'text-neutral-700 hover:bg-neutral-100',
                        )}
                      >
                        <span className="grid size-7 shrink-0 place-items-center rounded-lg bg-[var(--cat)] text-white">
                          <Icon className="size-4" />
                        </span>
                        <span className="flex-1 font-medium">{category.name}</span>
                        <ChevronRight className="size-3.5 opacity-40 rtl:rotate-180" />
                      </Link>
                    </li>
                  )
                })}
              </ul>

              <div className="hidden p-5 md:block" style={categoryStyle(activeCategory?.slug)}>
                {activeCategory ? (
                  <>
                    <Link
                      href={`/shop/${activeCategory.slug}`}
                      className="text-h4 hover:text-[var(--cat-ink)]"
                    >
                      {activeCategory.name}
                    </Link>
                    <ul className="mt-4 grid grid-cols-2 gap-x-6 gap-y-1">
                      {activeCategory.children.map((child) => (
                        <li key={child.id}>
                          <Link
                            href={`/shop/${child.slug}`}
                            className="block rounded-lg px-2 py-1.5 text-body-sm text-neutral-600 transition-colors hover:bg-[var(--cat-soft)] hover:text-[var(--cat-ink)]"
                          >
                            {child.name}
                          </Link>
                        </li>
                      ))}
                    </ul>
                    <Link
                      href={`/shop/${activeCategory.slug}`}
                      className="mt-5 inline-flex items-center gap-1.5 text-body-sm font-semibold text-[var(--cat-ink)] hover:underline"
                    >
                      {t('allProducts')}
                      <ChevronRight className="size-3.5 rtl:rotate-180" />
                    </Link>
                  </>
                ) : null}
              </div>
            </div>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
