'use client'

import { useEffect } from 'react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { Link } from '@/i18n/routing'
import { useRecentlyViewed, type ViewedItem } from '@/store/recently-viewed'
import { formatPrice } from '@/lib/utils'

/** Records the current product, then shows the rest of the trail. */
export const RecentlyViewed = ({ current }: { current: ViewedItem }) => {
  const locale = useLocale()
  const t = useTranslations('shop')
  const push = useRecentlyViewed((state) => state.push)
  const items = useRecentlyViewed((state) => state.items)

  useEffect(() => {
    push(current)
    // Only re-record when the product itself changes.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [current.productId])

  const others = items.filter((item) => item.productId !== current.productId).slice(0, 6)
  if (others.length < 2) return null

  return (
    <section className="mt-20">
      <h2 className="text-h3">{t('recentlyViewed')}</h2>
      <div className="mt-6 flex gap-4 overflow-x-auto pb-2 no-scrollbar">
        {others.map((item) => (
          <Link
            key={item.productId}
            href={`/products/${item.slug}`}
            className="group w-40 shrink-0"
          >
            <div className="relative aspect-square overflow-hidden rounded-xl bg-neutral-100">
              {item.image ? (
                <Image
                  src={item.image}
                  alt=""
                  fill
                  sizes="160px"
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                />
              ) : null}
            </div>
            <p className="mt-2 line-clamp-2 text-body-sm group-hover:text-primary-dark">{item.name}</p>
            <p className="text-body-sm font-semibold">{formatPrice(item.price, locale)}</p>
          </Link>
        ))}
      </div>
    </section>
  )
}
