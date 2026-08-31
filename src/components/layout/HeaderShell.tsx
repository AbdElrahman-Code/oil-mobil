'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronDown, Heart, Menu, Phone, Search, ShoppingBag, Truck, User, X } from 'lucide-react'
import { Link, usePathname } from '@/i18n/routing'
import type { Locale } from '@/i18n/routing'
import { useCart, cartCount } from '@/store/cart'
import { useWishlist } from '@/store/wishlist'
import { SearchOverlay, useSearchHotkey } from '@/components/search/SearchOverlay'
import { GarageButton } from '@/components/garage/GarageButton'
import { MegaMenu, type MenuCategory } from './MegaMenu'
import { LocaleSwitcher } from './LocaleSwitcher'
import { cn } from '@/lib/utils'

export type HeaderLink = {
  label: string
  href: string
  children?: { label: string; href: string }[]
}

type Props = {
  locale: Locale
  links: HeaderLink[]
  categories: MenuCategory[]
  brandName: string
  logoUrl: string | null
  logoDarkUrl: string | null
  phone: string | null
  whatsapp: string | null
  deliveryNote: string | null
  labels: {
    menu: string
    cart: string
    account: string
    search: string
    language: string
    wishlist: string
    searchHint: string
  }
}

/**
 * Three tiers, ordered by how often each is used: a thin utility strip, the
 * main bar with search always visible, then the category bar. Search is a real
 * control rather than a hidden icon — on a parts shop it is the fastest route
 * to a product.
 */
export const HeaderShell = ({
  locale,
  links,
  categories,
  brandName,
  logoUrl,
  phone,
  deliveryNote,
  labels,
}: Props) => {
  const pathname = usePathname()
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const items = useCart((state) => state.items)
  const openCart = useCart((state) => state.open)
  const savedItems = useWishlist((state) => state.items)

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

  const iconButton =
    'relative grid size-11 place-items-center rounded-full text-neutral-700 transition-colors hover:bg-primary-light hover:text-primary'

  return (
    <header className="sticky top-0 z-40">
      {/* Utility strip — quiet, but carries what people ask first. */}
      <div className="hidden bg-neutral-950 text-neutral-200 lg:block">
        <div className="container-page flex h-9 items-center justify-between text-body-sm">
          {deliveryNote ? (
            <p className="flex items-center gap-2">
              <Truck className="size-3.5 text-primary-300" />
              {deliveryNote}
            </p>
          ) : (
            <span />
          )}
          <div className="flex items-center gap-4">
            {phone ? (
              <a href={`tel:${phone}`} className="flex items-center gap-2 hover:text-white" dir="ltr">
                <Phone className="size-3.5 text-primary-300" />
                {phone}
              </a>
            ) : null}
            <LocaleSwitcher locale={locale} label={labels.language} />
          </div>
        </div>
      </div>

      <div
        className={cn(
          'bg-white transition-shadow duration-300',
          scrolled && 'shadow-[0_1px_0_var(--color-neutral-200),0_10px_30px_-24px_rgb(11_14_20/0.6)]',
        )}
      >
        <div className="container-page flex h-16 items-center gap-3 lg:h-20 lg:gap-6">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="-ms-2 rounded-full p-2 text-neutral-700 transition-colors hover:bg-neutral-100 lg:hidden"
            aria-label={labels.menu}
          >
            <Menu className="size-6" />
          </button>

          <Link href="/" className="shrink-0">
            {logoUrl ? (
              <Image
                src={logoUrl}
                alt={brandName}
                width={200}
                height={49}
                className="h-9 w-auto lg:h-11"
                priority
              />
            ) : (
              <span className="font-[family-name:var(--font-display)] text-h4 font-bold text-neutral-950">
                {brandName}
              </span>
            )}
          </Link>

          <button
            type="button"
            onClick={() => setSearchOpen(true)}
            className="hidden h-11 flex-1 items-center gap-3 rounded-full border border-neutral-300 px-4 text-start text-body-sm text-neutral-400 transition-colors hover:border-primary hover:text-neutral-600 lg:flex"
          >
            <Search className="size-4" />
            <span className="flex-1">{labels.searchHint}</span>
            <kbd className="rounded border border-neutral-200 px-1.5 py-0.5 text-label text-neutral-400">⌘K</kbd>
          </button>

          <div className="ms-auto flex items-center gap-0.5 lg:gap-1">
            <button
              type="button"
              onClick={() => setSearchOpen(true)}
              className={cn(iconButton, 'lg:hidden')}
              aria-label={labels.search}
            >
              <Search className="size-5" />
            </button>

            <Link href="/wishlist" className={iconButton} aria-label={labels.wishlist}>
              <Heart className="size-5" />
              {savedCount > 0 ? (
                <span className="absolute -end-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-primary text-label font-bold text-white">
                  {savedCount}
                </span>
              ) : null}
            </Link>

            <Link href="/account" className={cn(iconButton, 'hidden sm:grid')} aria-label={labels.account}>
              <User className="size-5" />
            </Link>

            <button type="button" onClick={openCart} className={iconButton} aria-label={labels.cart}>
              <ShoppingBag className="size-5" />
              <AnimatePresence>
                {count > 0 ? (
                  <motion.span
                    key={count}
                    initial={{ scale: 0.6, opacity: 0 }}
                    animate={{ scale: 1, opacity: 1 }}
                    exit={{ scale: 0.6, opacity: 0 }}
                    className="absolute -end-0.5 -top-0.5 grid size-5 place-items-center rounded-full bg-accent text-label font-bold text-white"
                  >
                    {count}
                  </motion.span>
                ) : null}
              </AnimatePresence>
            </button>
          </div>
        </div>

        {/* Category bar — the whole catalogue, with the car selector beside it. */}
        <div className="hidden border-t border-neutral-200 lg:block">
          <div className="container-page flex h-14 items-center gap-4">
            <MegaMenu categories={categories} />

            <nav className="flex flex-1 items-center gap-1" aria-label="Primary">
              {links.map((link) => {
                const active = pathname === link.href || pathname.startsWith(`${link.href}/`)
                return (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={cn(
                      'rounded-full px-3.5 py-2 text-body-sm font-medium transition-colors',
                      active
                        ? 'bg-primary-light text-primary-dark'
                        : 'text-neutral-700 hover:bg-neutral-100 hover:text-neutral-950',
                    )}
                  >
                    {link.label}
                  </Link>
                )
              })}
            </nav>

            <GarageButton />
          </div>
        </div>
      </div>

      {/* Mobile: the car selector where a thumb can reach it. */}
      <div className="border-t border-neutral-200 bg-white px-4 py-2 lg:hidden">
        <GarageButton compact />
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
              className="fixed inset-y-0 start-0 z-50 flex w-[min(21rem,88vw)] flex-col bg-white lg:hidden"
            >
              <div className="flex items-center justify-between border-b border-neutral-200 p-4">
                <span className="font-[family-name:var(--font-display)] text-h4 font-bold">{brandName}</span>
                <button
                  type="button"
                  onClick={() => setMobileOpen(false)}
                  className="rounded-full p-2 text-neutral-500 hover:bg-neutral-100"
                  aria-label="Close"
                >
                  <X className="size-5" />
                </button>
              </div>

              <nav className="flex-1 overflow-y-auto p-3">
                {categories.map((category) => (
                  <details key={category.id} className="group">
                    <summary className="flex cursor-pointer items-center justify-between rounded-xl px-3 py-3 text-body font-medium text-neutral-900 marker:content-none hover:bg-neutral-100">
                      {category.name}
                      <ChevronDown className="size-4 opacity-50 transition-transform group-open:rotate-180" />
                    </summary>
                    <div className="ms-3 border-s border-neutral-200 ps-3">
                      <Link
                        href={`/shop/${category.slug}`}
                        className="block rounded-lg px-3 py-2 text-body-sm font-medium text-primary"
                      >
                        {category.name}
                      </Link>
                      {category.children.map((child) => (
                        <Link
                          key={child.id}
                          href={`/shop/${child.slug}`}
                          className="block rounded-lg px-3 py-2 text-body-sm text-neutral-600 hover:bg-neutral-100"
                        >
                          {child.name}
                        </Link>
                      ))}
                    </div>
                  </details>
                ))}

                <div className="my-3 h-px bg-neutral-200" />

                {links.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className="block rounded-xl px-3 py-3 text-body font-medium text-neutral-900 hover:bg-neutral-100"
                  >
                    {link.label}
                  </Link>
                ))}
                <Link
                  href="/account"
                  className="block rounded-xl px-3 py-3 text-body font-medium text-neutral-900 hover:bg-neutral-100"
                >
                  {labels.account}
                </Link>
              </nav>

              <div className="border-t border-neutral-200 p-4">
                <LocaleSwitcher locale={locale} label={labels.language} />
              </div>
            </motion.div>
          </>
        ) : null}
      </AnimatePresence>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </header>
  )
}
