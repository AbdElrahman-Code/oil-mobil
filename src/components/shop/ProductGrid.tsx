'use client'

import { useMemo } from 'react'
import { useTranslations } from 'next-intl'
import { PackageSearch } from 'lucide-react'
import { useSearchParams } from 'next/navigation'
import { Link } from '@/i18n/routing'
import type { Product } from '@/payload-types'
import { ProductCard } from './ProductCard'
import { FitmentBar } from './FitmentBar'
import { useGarage } from '@/store/garage'
import { Button } from '@/components/ui/button'
import { cn, relId } from '@/lib/utils'

/** Ids of the models a product is listed as fitting. Empty means universal. */
const fitsList = (product: Product): number[] =>
  (product.compatibleVehicles ?? [])
    .map((vehicle) => relId(vehicle))
    .filter((id): id is number => id !== null)

export const ProductGrid = ({
  products,
  page = 1,
  totalPages = 1,
  basePath = '/shop',
  showFitmentBar = true,
}: {
  products: Product[]
  page?: number
  totalPages?: number
  basePath?: string
  showFitmentBar?: boolean
}) => {
  const t = useTranslations('shop')
  const tGarage = useTranslations('garage')
  const searchParams = useSearchParams()
  const { car, fitmentOnly, setFitmentOnly } = useGarage()

  // Fitment is decided on the client because the selected car lives on the
  // device — the server render stays cacheable for everyone.
  const decorated = useMemo(
    () =>
      products.map((product) => {
        const list = fitsList(product)
        return {
          product,
          universal: list.length === 0,
          fits: car ? list.includes(car.modelId) : false,
          known: list.length > 0,
        }
      }),
    [products, car],
  )

  const visible = car && fitmentOnly ? decorated.filter((item) => item.fits || item.universal) : decorated

  const hrefForPage = (target: number) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    params.set('page', String(target))
    return `${basePath}?${params.toString()}`
  }

  return (
    <div>
      {showFitmentBar ? <FitmentBar className="mb-6" /> : null}

      {!visible.length ? (
        <div className="grid place-items-center rounded-[var(--radius-card)] border border-dashed border-neutral-300 py-20 text-center">
          <PackageSearch className="mb-4 size-10 text-neutral-300" />
          {car && fitmentOnly && products.length ? (
            <>
              <p className="text-neutral-500">{tGarage('noFittingParts')}</p>
              <Button variant="outline" className="mt-4" onClick={() => setFitmentOnly(false)}>
                {tGarage('showAllInstead')}
              </Button>
            </>
          ) : (
            <>
              <p className="text-neutral-500">{t('noResults')}</p>
              <Link href={basePath} className="mt-3 text-body-sm font-medium text-primary hover:underline">
                {t('clearFilters')}
              </Link>
            </>
          )}
        </div>
      ) : (
        <>
          <p className="mb-4 text-body-sm text-neutral-500">
            {visible.length}
            {visible.length !== products.length ? ` / ${products.length}` : ''}
          </p>

          <div className="grid grid-cols-2 gap-3 sm:gap-4 lg:grid-cols-3 xl:grid-cols-4">
            {visible.map(({ product, fits }, index) => (
              <ProductCard key={product.id} product={product} index={index} fitsVehicle={fits} />
            ))}
          </div>
        </>
      )}

      {totalPages > 1 ? (
        <nav className="mt-12 flex flex-wrap justify-center gap-1.5" aria-label="Pagination">
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
