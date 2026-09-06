'use client'

import { useEffect, useState } from 'react'
import { useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Home, LayoutGrid, Search, ShoppingBag, User } from 'lucide-react'
import { Link, usePathname } from '@/i18n/routing'
import { useCart, cartCount } from '@/store/cart'
import { SearchOverlay } from '@/components/search/SearchOverlay'
import { cn } from '@/lib/utils'

/**
 * Bottom tab bar — the pattern every shopper already knows from their phone.
 * Five destinations, thumb height, always visible. On a phone this replaces
 * hunting through a hamburger menu, which is the single biggest usability win
 * for customers who do not use websites often.
 */
export const MobileTabBar = () => {
  const t = useTranslations('nav')
  const tShop = useTranslations('shop')
  const tCommon = useTranslations('common')
  const pathname = usePathname()
  const [searchOpen, setSearchOpen] = useState(false)
  const [mounted, setMounted] = useState(false)

  const items = useCart((state) => state.items)
  const openCart = useCart((state) => state.open)

  useEffect(() => setMounted(true), [])
  const count = mounted ? cartCount(items) : 0

  const isHome = pathname === '/'
  const isShop = pathname.startsWith('/shop')
  const isAccount = pathname.startsWith('/account')

  const tab = 'relative flex flex-1 flex-col items-center gap-1 py-2 text-[0.6875rem] font-medium transition-colors'
  const activeTab = 'text-primary'
  const idleTab = 'text-neutral-500'

  return (
    <>
      <nav
        className="fixed inset-x-0 bottom-0 z-40 border-t border-neutral-200 bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl lg:hidden"
        aria-label="Main"
      >
        <div className="flex items-stretch">
          <Link href="/" className={cn(tab, isHome ? activeTab : idleTab)}>
            {isHome ? <ActivePip /> : null}
            <Home className="size-5" />
            {t('home')}
          </Link>

          <Link href="/shop" className={cn(tab, isShop ? activeTab : idleTab)}>
            {isShop ? <ActivePip /> : null}
            <LayoutGrid className="size-5" />
            {tShop('categories')}
          </Link>

          <button type="button" onClick={() => setSearchOpen(true)} className={cn(tab, idleTab)}>
            <Search className="size-5" />
            {tCommon('search')}
          </button>

          <button type="button" onClick={openCart} className={cn(tab, idleTab)}>
            <span className="relative">
              <ShoppingBag className="size-5" />
              {count > 0 ? (
                <span className="absolute -end-2 -top-1.5 grid size-4 place-items-center rounded-full bg-accent text-[0.625rem] font-bold text-white">
                  {count}
                </span>
              ) : null}
            </span>
            {t('cart')}
          </button>

          <Link href="/account" className={cn(tab, isAccount ? activeTab : idleTab)}>
            {isAccount ? <ActivePip /> : null}
            <User className="size-5" />
            {t('account')}
          </Link>
        </div>
      </nav>

      <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}

/** Small marker above the active tab. */
const ActivePip = () => (
  <motion.span
    layoutId="tab-pip"
    className="absolute inset-x-6 top-0 h-0.5 rounded-full bg-primary"
    transition={{ type: 'spring', damping: 26, stiffness: 320 }}
  />
)
