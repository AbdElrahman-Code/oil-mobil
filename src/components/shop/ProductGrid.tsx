'use client'

import { useTranslations } from 'next-intl'
import { PackageSearch } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/routing'
import type { Product } from '@/payload-types'
import { ProductCard } from './ProductCard'
import { cn } from '@/lib/utils'

export const ProductGrid = ({
  products,
  page = 1,
  totalPages = 1,
  basePath = '/shop',
}: {
  products: Product[]
  page?: number
  totalPages?: number
  basePath?: string
}) => {
  const t = useTranslations('shop')
  const searchParams = useSearchParams()

  if (!products.length) {
    return (
      <div className="grid place-items-center rounded-[var(--radius-card)] border border-dashed border-neutral-300 py-24 text-center">
        <PackageSearch className="mb-4 size-10 text-neutral-200" />
        <p className="text-neutral-400">{t('noResults')}</p>
        <Link href={basePath} className="mt-3 text-body-sm font-medium text-primary-600 hover:underline">
          {t('clearFilters')}
        </Link>
      </div>
    )
  }

  const hrefForPage = (target: number) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    params.set('page', String(target))
    return `${basePath}?${params.toString()}`
  }

  return (
    <div>
      <div className="grid grid-cols-2 gap-4 lg:grid-cols-3 xl:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>

      {totalPages > 1 ? (
        <nav className="mt-12 flex justify-center gap-1.5" aria-label="Pagination">
          {Array.from({ length: totalPages }).map((_, index) => {
            const target = index + 1
            return (
              <Link
                key={target}
                href={hrefForPage(target)}
                className={cn(
                  'grid size-10 place-items-center rounded-full text-body-sm font-medium transition-colors',
                  target === page ? 'bg-neutral-950 text-white' : 'text-neutral-500 hover:bg-neutral-200',
                )}
                aria-current={target === page ? 'page' : undefined}
              >
                {target}
              </Link>
            )
          })}
        </nav>
      ) : null}
    </div>
  )
}
