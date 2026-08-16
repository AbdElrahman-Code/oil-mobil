'use client'

import { useState, useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { useSearchParams } from 'next/navigation'
import { SlidersHorizontal } from 'lucide-react'
import { Link, usePathname, useRouter } from '@/i18n/routing'
import type { ProductCategory } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { Input, Label, NativeSelect } from '@/components/ui/primitives'
import { cn } from '@/lib/utils'

export const ShopFilters = ({
  categories,
  brands,
  activeCategorySlug,
}: {
  categories: ProductCategory[]
  brands: string[]
  activeCategorySlug?: string
}) => {
  const t = useTranslations('shop')
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()
  const [open, setOpen] = useState(false)

  const setParam = (key: string, value: string) => {
    const params = new URLSearchParams(searchParams?.toString() ?? '')
    if (value) params.set(key, value)
    else params.delete(key)
    params.delete('page')
    startTransition(() => {
      router.replace(`${pathname}?${params.toString()}` as never)
    })
  }

  const topLevel = categories.filter((category) => !category.parent)

  return (
    <aside>
      <Button
        type="button"
        variant="outline"
        block
        className="lg:hidden"
        onClick={() => setOpen((value) => !value)}
      >
        <SlidersHorizontal className="size-4" />
        {t('filters')}
      </Button>

      <div className={cn('mt-4 space-y-8 lg:mt-0 lg:block', open ? 'block' : 'hidden')}>
        <div>
          <Label htmlFor="shop-search">{t('searchPlaceholder')}</Label>
          <Input
            id="shop-search"
            defaultValue={searchParams?.get('q') ?? ''}
            placeholder={t('searchPlaceholder')}
            onKeyDown={(event) => {
              if (event.key === 'Enter') setParam('q', (event.target as HTMLInputElement).value)
            }}
          />
        </div>

        <div>
          <p className="mb-3 text-label font-semibold uppercase tracking-[0.14em] text-neutral-400">
            {t('categories')}
          </p>
          <ul className="space-y-1">
            <li>
              <Link
                href="/shop"
                className={cn(
                  'block rounded-lg px-3 py-2 text-body-sm transition-colors',
                  !activeCategorySlug ? 'bg-neutral-950 text-white' : 'text-neutral-600 hover:bg-neutral-200',
                )}
              >
                {t('allProducts')}
              </Link>
            </li>
            {topLevel.map((category) => (
              <li key={category.id}>
                <Link
                  href={`/shop/${category.slug}`}
                  className={cn(
                    'block rounded-lg px-3 py-2 text-body-sm transition-colors',
                    activeCategorySlug === category.slug
                      ? 'bg-neutral-950 text-white'
                      : 'text-neutral-600 hover:bg-neutral-200',
                  )}
                >
                  {category.name}
                </Link>
              </li>
            ))}
          </ul>
        </div>

        {brands.length ? (
          <div>
            <Label htmlFor="shop-brand">{t('brand')}</Label>
            <NativeSelect
              id="shop-brand"
              defaultValue={searchParams?.get('brand') ?? ''}
              onChange={(event) => setParam('brand', event.target.value)}
            >
              <option value="">{t('allProducts')}</option>
              {brands.map((brand) => (
                <option key={brand} value={brand}>
                  {brand}
                </option>
              ))}
            </NativeSelect>
          </div>
        ) : null}

        <div>
          <Label>{t('priceRange')}</Label>
          <div className="flex items-center gap-2">
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="0"
              defaultValue={searchParams?.get('min') ?? ''}
              onBlur={(event) => setParam('min', event.target.value)}
            />
            <span className="text-neutral-400">—</span>
            <Input
              type="number"
              inputMode="numeric"
              min={0}
              placeholder="5000"
              defaultValue={searchParams?.get('max') ?? ''}
              onBlur={(event) => setParam('max', event.target.value)}
            />
          </div>
        </div>

        <div>
          <Label htmlFor="shop-sort">{t('sort')}</Label>
          <NativeSelect
            id="shop-sort"
            defaultValue={searchParams?.get('sort') ?? 'newest'}
            onChange={(event) => setParam('sort', event.target.value)}
          >
            <option value="newest">{t('sortNewest')}</option>
            <option value="priceAsc">{t('sortPriceAsc')}</option>
            <option value="priceDesc">{t('sortPriceDesc')}</option>
          </NativeSelect>
        </div>
      </div>
    </aside>
  )
}
