'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Heart, Menu, Phone, Search, ShoppingBag, User, X } from 'lucide-react'
import { Link, usePathname } from '@/i18n/routing'
import type { Locale } from '@/i18n/routing'
import { useCart, cartCount } from '@/store/cart'
import { cn } from '@/lib/utils'
import { useWishlist } from '@/store/wishlist'
import { SearchOverlay, useSearchHotkey } from '@/components/search/SearchOverlay'
import { LocaleSwitcher } from './LocaleSwitcher'

export type HeaderLink = {
  label: string
  href: string
  children?: { label: string; href: string }[]
}

type Props = {
  locale: Locale
  links: HeaderLink[]
  brandName: string
  logoUrl: string | null
  logoDarkUrl: string | null
  phone: string | null
  whatsapp: string | null
  labels: { menu: string; cart: string; account: string; search: string; language: string; wishlist: string }
}

export const HeaderShell = ({ locale, links, brandName, logoUrl, phone, labels }: Props) => {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [openMenu, setOpenMenu] = useState<string | null>(null)
  const items = useCart((state) => state.items)
  const openCart = useCart((state) => state.open)
  const savedItems = useWishlist((state) => state.items)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  useSearchHotkey(() => setSearchOpen(true))

  useEffect(() => setMounted(true), [])
  useEffect(() => setMobileOpen(false), [pathname])
  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 8)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  const count = mounted ? cartCount(items) : 0
  const savedCount = mounted ? savedItems.length : 0

  return (
    <header
      className={cn(
        'sticky top-0 z-40 transition-[background-color,box-shadow,backdrop-filter] duration-300',
        scrolled
          ? 'bg-white/85 shadow-[0_1px_0_var(--color-neutral-100),0_10px_30px_-24px_rgb(8_9_11/0.6)] backdrop-blur-xl'
          : 'bg-white',
      )}
    >
      <div className="container-page flex h-16 items-center gap-3 lg:h-20 lg:gap-8">
        <button
          type="button"
          onClick={() => setMobileOpen(true)}
          className="-ms-2 rounded-full p-2 text-neutral-700 transition-colors hover:bg-neutral-200 lg:hidden"
          aria-label={labels.menu}
        >
          <Menu className="size-5" />
        </button>

        <Link href="/" className="flex items-center gap-2.5">
          {logoUrl ? (
            <Image src={logoUrl} alt={brandName} width={148} height={40} className="h-8 w-auto lg:h-10" priority />
          ) : (
            <span className="font-[family-name:var(--font-display)] text-h4 font-bold tracking-tight text-neutral-950 lg:text-h3">
              {brandName}
            </span>
          )}
        </Link>

        <nav className="hidden flex-1 items-center gap-1 lg:flex" aria-label="Primary">
          {links.map((link) => {
            const hasChildren = Boolean(link.children?.length)
            const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
            return (
              <div
                key={link.href}
                className="relative"
                onMouseEnter={() => hasChildren && setOpenMenu(link.href)}
                onMouseLeave={() => setOpenMenu(null)}
              >
                <Link
                  href={link.href}
                  className={cn(
                    'flex items-center gap-1 rounded-full px-3.5 py-2 text-body-sm font-medium transition-colors',
                    active ? 'text-primary-600' : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950',
                  )}
                >
                  {link.label}
                  {hasChildren ? <ChevronDown className="size-3.5 opacity-60" /> : null}
                </Link>

                <AnimatePresence>
                  {hasChildren && openMenu === link.href ? (
                    <motion.div
                      initial={{ opacity: 0, y: 6 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, y: 4 }}
                      transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
                      className="absolute start-0 top-full z-50 min-w-56 rounded-2xl border border-neutral-200 bg-white p-2 shadow-[var(--shadow-lift)]"
                    >
                      {link.children?.map((child) => (
                        <Link
                          key={child.href}
                          href={child.href}
                          className="block rounded-xl px-3 py-2 text-body-sm text-neutral-700 transition-colors hover:bg-neutral-100 hover:text-neutral-950"
                        >
                          {child.label}
                        </Link>
                      ))}
                    </motion.div>
                  ) : null}
                </AnimatePresence>
              </div>
            )
          })}
        </nav>

        <div className="ms-auto flex items-center gap-1 lg:gap-2">
          {phone ? (
            <a
              href={`tel:${phone}`}
              className="hidden items-center gap-2 rounded-full px-3 py-2 text-body-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-100 xl:flex"
              dir="ltr"
            >
              <Phone className="size-4 text-primary-500" />
              {phone}
            </a>
          ) : null}

          <LocaleSwitcher locale={locale} label={labels.language} />

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="rounded-full p-2.5 text-neutral-700 transition-colors hover:bg-primary-light hover:text-primary"
            aria-label={labels.search}
          >
            <Search className="size-5" />
          </button>

          <Link
            href="/wishlist"
            className="relative rounded-full p-2.5 text-neutral-700 transition-colors hover:bg-primary-light hover:text-primary"
            aria-label={labels.wishlist}
          >
            <Heart className="size-5" />
            {savedCount > 0 ? (
              <span className="absolute -end-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-primary text-label font-bold text-white">
                {savedCount}
              </span>
            ) : null}
          </Link>

          <Link
            href="/account"
            className="rounded-full p-2.5 text-neutral-700 transition-colors hover:bg-neutral-200"
            aria-label={labels.account}
          >
            <User className="size-5" />
          </Link>

          <button
            type="button"
            onClick={openCart}
            className="relative rounded-full p-2.5 text-neutral-700 transition-colors hover:bg-neutral-200"
            aria-label={labels.cart}
          >
            <ShoppingBag className="size-5" />
            <AnimatePresence>
              {count > 0 ? (
                <motion.span
                  key={count}
                  initial={{ scale: 0.6, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  exit={{ scale: 0.6, opacity: 0 }}
                  className="absolute -end-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-primary-500 text-label font-bold text-white"
                >
                  {count}
                </motion.span>
              ) : null}
            </AnimatePresence>
          </button>
        </div>
      </div>

      <AnimatePresence>
        {mobileOpen ? (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 bg-neutral-950/50 backdrop-blur-sm lg:hidden"
              onClick={() => setMobileOpen(false)}
            />
            <motion.div
              initial={{ x: locale === 'ar' ? '100%' : '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: locale === 'ar' ? '100%' : '-100%' }}
              transition={{ type: 'spring', damping: 30, stiffness: 300 }}
              className="fixed inset-y-0 start-0 z-50 flex w-[min(20rem,85vw)] flex-col bg-white p-5 lg:hidden"
            >
              <div className="mb-6 flex items-center justify-between">
                <span className="font-[family-name:var(--font-display)] text-h4 font-bold">{brandName}</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full p-2 text-neutral-500 hover:bg-neutral-200"
                  aria-label="Close"
                >
                  <X className="size-5" />
                </button>
              </div>
              <nav className="flex flex-col gap-1 overflow-y-auto">
                {links.map((link) => (
                  <div key={link.href}>
                    <Link
                      href={link.href}
                      className="block rounded-xl px-3 py-3 text-body font-medium text-neutral-900 hover:bg-neutral-100"
                    >
                      {link.label}
                    </Link>
                    {link.children?.length ? (
                      <div className="ms-3 border-s border-neutral-200 ps-3">
                        {link.children.map((child) => (
                          <Link
                            key={child.href}
                            href={child.href}
                            className="block rounded-lg px-3 py-2 text-body-sm text-neutral-500 hover:bg-neutral-100"
                          >
                            {child.label}
                          </Link>
                        ))}
                      </div>
                    ) : null}
                  </div>
                ))}
              </nav>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>
      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
