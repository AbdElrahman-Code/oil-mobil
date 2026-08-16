'use client'

import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { Check, ImageOff, ShoppingBag } from 'lucide-react'
import { Link } from '@/i18n/routing'
import type { Product } from '@/payload-types'
import { Badge } from '@/components/ui/primitives'
import { cn, formatPrice, mediaUrl } from '@/lib/utils'
import { useCart } from '@/store/cart'
import { track } from '@/components/analytics/AnalyticsProvider'
import { WishlistButton } from './WishlistButton'
import { useState } from 'react'

export const ProductCard = ({
  product,
  index = 0,
  fitsVehicle = false,
}: {
  product: Product
  index?: number
  fitsVehicle?: boolean
}) => {
  const locale = useLocale()
  const t = useTranslations('shop')
  const add = useCart((state) => state.add)
  const [justAdded, setJustAdded] = useState(false)

  const image = Array.isArray(product.images) ? product.images[0] : null
  const imageSrc = mediaUrl(image, 'card')
  const outOfStock = (product.stockQuantity ?? 0) <= 0 && !product.allowBackorder
  const onSale =
    typeof product.compareAtPrice === 'number' && product.compareAtPrice > (product.price ?? 0)

  const handleAdd = () => {
    add(
      {
        productId: product.id,
        name: product.name,
        slug: product.slug ?? String(product.id),
        price: product.price ?? 0,
        image: imageSrc,
        maxQuantity: product.allowBackorder ? null : product.stockQuantity,
      },
      1,
    )
    track('add_to_cart', { productId: product.id, sku: product.sku, price: product.price })
    setJustAdded(true)
    setTimeout(() => setJustAdded(false), 1600)
  }

  return (
    <motion.article
      initial={{ opacity: 0, y: 18 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '-60px' }}
      transition={{ duration: 0.5, delay: Math.min(index * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
      className="group relative flex flex-col overflow-hidden rounded-[var(--radius-card)] border border-neutral-200 bg-white transition-shadow duration-300 hover:shadow-[var(--shadow-lift)]"
    >
      {/* Sits outside the aria-hidden thumbnail link so it keeps its own focus
          order and accessible name. */}
      <div className="absolute end-3 top-3 z-10">
        <WishlistButton
          size="sm"
          item={{
            productId: product.id,
            name: product.name,
            slug: product.slug ?? String(product.id),
            price: product.price ?? 0,
            image: imageSrc,
          }}
        />
      </div>

      {/* The title below links to the same product, so this thumbnail is hidden
          from assistive tech rather than announced as a second, nameless link. */}
      <Link
        href={`/products/${product.slug}`}
        aria-hidden="true"
        tabIndex={-1}
        className="relative block aspect-square overflow-hidden bg-neutral-100"
      >
        {imageSrc ? (
          <Image
            src={imageSrc}
            alt=""
            fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105"
          />
        ) : (
          <div className="grid h-full place-items-center text-neutral-200">
            <ImageOff className="size-8" />
          </div>
        )}

        <div className="absolute start-3 top-3 flex flex-col items-start gap-1.5">
          {onSale ? <Badge tone="accent">-{Math.round((1 - (product.price ?? 0) / (product.compareAtPrice as number)) * 100)}%</Badge> : null}
          {fitsVehicle ? <Badge tone="success">{t('fitsYourCar')}</Badge> : null}
          {outOfStock ? <Badge tone="neutral">{t('outOfStock')}</Badge> : null}
        </div>
      </Link>

      <div className="flex flex-1 flex-col p-4">
        {product.brand ? (
          <p className="mb-1 text-label font-semibold uppercase tracking-wide text-neutral-400">{product.brand}</p>
        ) : null}
        <h3 className="text-body-sm font-medium leading-snug text-neutral-900">
          <Link href={`/products/${product.slug}`} className="hover:text-primary-600">
            {product.name}
          </Link>
        </h3>

        <div className="mt-3 flex items-end justify-between gap-2">
          <div>
            <p className="text-body font-bold text-neutral-950">{formatPrice(product.price, locale)}</p>
            {onSale ? (
              <p className="text-body-sm text-neutral-400 line-through">
                {formatPrice(product.compareAtPrice, locale)}
              </p>
            ) : null}
          </div>

          <button
            type="button"
            onClick={handleAdd}
            disabled={outOfStock}
            className={cn(
              'grid size-10 place-items-center rounded-full transition-colors duration-200',
              outOfStock
                ? 'cursor-not-allowed bg-neutral-200 text-neutral-300'
                : justAdded
                  ? 'bg-success text-white'
                  : 'bg-accent text-white hover:bg-accent-dark',
            )}
            aria-label={t('addToCart')}
          >
            {justAdded ? <Check className="size-4" /> : <ShoppingBag className="size-4" />}
          </button>
        </div>

        {!outOfStock &&
        typeof product.stockQuantity === 'number' &&
        product.stockQuantity <= (product.lowStockThreshold ?? 5) ? (
          <p className="mt-2 text-label font-medium text-accent-dark">
            {t('lowStock', { count: product.stockQuantity })}
          </p>
        ) : null}
      </div>
    </motion.article>
  )
}
