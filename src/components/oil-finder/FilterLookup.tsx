'use client'

import { useMemo, useState, useTransition } from 'react'
import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { AnimatePresence, motion } from 'framer-motion'
import { Filter as FilterIcon, Loader2, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { Link } from '@/i18n/routing'
import type { Locale } from '@/i18n/routing'
import type { VehicleBrand, VehicleModel } from '@/payload-types'
import { listModels, recommendOil, type OilFinderProduct, type OilFinderResult } from '@/actions/oil-finder'
import { Button } from '@/components/ui/button'
import { Badge, Card, Label, NativeSelect } from '@/components/ui/primitives'
import { useCart } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { track } from '@/components/analytics/AnalyticsProvider'

type FilterEntry = { type: 'oil' | 'air' | 'cabin' | 'fuel'; product: OilFinderProduct | null; partNumber?: string | null }

export const FilterLookup = ({ brands }: { brands: VehicleBrand[] }) => {
  const locale = useLocale() as Locale
  const t = useTranslations('filterLookup')
  const tOil = useTranslations('oilFinder')
  const tShop = useTranslations('shop')
  const tCommon = useTranslations('common')
  const add = useCart((state) => state.add)

  const [pending, startTransition] = useTransition()
  const [loading, setLoading] = useState(false)
  const [brandId, setBrandId] = useState<number | null>(null)
  const [models, setModels] = useState<VehicleModel[]>([])
  const [modelId, setModelId] = useState<number | null>(null)
  const [year, setYear] = useState<number | null>(null)
  const [engineCode, setEngineCode] = useState('')
  const [result, setResult] = useState<OilFinderResult | null>(null)

  const model = models.find((item) => item.id === modelId) ?? null

  const years = useMemo(() => {
    if (!model) return []
    const from = model.yearFrom ?? 1990
    const to = model.yearTo ?? new Date().getFullYear()
    return Array.from({ length: to - from + 1 }, (_, index) => to - index)
  }, [model])

  const search = async () => {
    if (!brandId || !modelId || !year || !engineCode) return
    setLoading(true)
    const response = await recommendOil({ brandId, modelId, year, engineCode }, locale)
    setLoading(false)
    setResult(response)
    track('filter_lookup_completed', { status: response.status })
  }

  const entries: FilterEntry[] =
    result?.status === 'matched'
      ? [
          { type: 'oil', product: result.oilFilter, partNumber: result.oilFilter?.partNumber },
          ...result.otherFilters.map((entry) => ({
            type: entry.type as FilterEntry['type'],
            product: entry.product,
          })),
        ]
      : []

  const missing = (['oil', 'air', 'cabin', 'fuel'] as const).filter(
    (type) => !entries.some((entry) => entry.type === type && entry.product),
  )

  return (
    <div className="space-y-8">
      <Card className="p-6">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
          <div>
            <Label htmlFor="fl-brand">{tOil('brand')}</Label>
            <NativeSelect
              id="fl-brand"
              value={brandId ?? ''}
              onChange={(event) => {
                const value = Number(event.target.value)
                setBrandId(value)
                setModelId(null)
                setYear(null)
                setEngineCode('')
                setResult(null)
                startTransition(async () => setModels(await listModels(value, locale)))
              }}
            >
              <option value="">{tCommon('selectPlaceholder')}</option>
              {brands.map((brand) => (
                <option key={brand.id} value={brand.id}>
                  {locale === 'ar' && brand.nameAr ? brand.nameAr : brand.name}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div>
            <Label htmlFor="fl-model">{tOil('model')}</Label>
            <NativeSelect
              id="fl-model"
              value={modelId ?? ''}
              disabled={!brandId || pending}
              onChange={(event) => {
                setModelId(Number(event.target.value))
                setYear(null)
                setEngineCode('')
                setResult(null)
              }}
            >
              <option value="">{pending ? tCommon('loading') : tCommon('selectPlaceholder')}</option>
              {models.map((item) => (
                <option key={item.id} value={item.id}>
                  {locale === 'ar' && item.nameAr ? item.nameAr : item.name}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div>
            <Label htmlFor="fl-year">{tOil('year')}</Label>
            <NativeSelect
              id="fl-year"
              value={year ?? ''}
              disabled={!modelId}
              onChange={(event) => setYear(Number(event.target.value))}
            >
              <option value="">{tCommon('selectPlaceholder')}</option>
              {years.map((value) => (
                <option key={value} value={value}>
                  {value}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div>
            <Label htmlFor="fl-engine">{tOil('engine')}</Label>
            <NativeSelect
              id="fl-engine"
              value={engineCode}
              disabled={!modelId}
              onChange={(event) => setEngineCode(event.target.value)}
            >
              <option value="">{tCommon('selectPlaceholder')}</option>
              {(model?.engines ?? []).map((engine) => (
                <option key={engine.code} value={engine.code}>
                  {engine.label}
                </option>
              ))}
            </NativeSelect>
          </div>

          <div className="flex items-end">
            <Button block onClick={search} disabled={!engineCode || loading}>
              {loading ? <Loader2 className="size-4 animate-spin" /> : <FilterIcon className="size-4" />}
              {tCommon('search')}
            </Button>
          </div>
        </div>
      </Card>

      <AnimatePresence mode="wait">
        {result?.status === 'matched' ? (
          <motion.div
            key="results"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.45, ease: [0.16, 1, 0.3, 1] }}
            className="grid gap-4 sm:grid-cols-2"
          >
            {entries
              .filter((entry) => entry.product)
              .map((entry) => {
                const product = entry.product as OilFinderProduct
                const inStock = (product.stockQuantity ?? 0) > 0
                return (
                  <Card key={`${entry.type}-${product.id}`} className="flex gap-4 p-5">
                    <div className="relative size-20 shrink-0 overflow-hidden rounded-xl bg-neutral-100">
                      {product.image ? (
                        <Image src={product.image} alt={product.name} fill sizes="80px" className="object-cover" />
                      ) : null}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="mb-1 text-label font-semibold uppercase tracking-wide text-primary-600">
                        {t(entry.type)}
                      </p>
                      <Link
                        href={`/products/${product.slug}`}
                        className="line-clamp-2 text-body-sm font-medium hover:text-primary-600"
                      >
                        {product.name}
                      </Link>
                      {entry.partNumber ? (
                        <p className="mt-1 text-body-sm text-neutral-400" dir="ltr">
                          {tOil('partNumber')}: {entry.partNumber}
                        </p>
                      ) : null}
                      <div className="mt-2 flex items-center gap-3">
                        <span className="font-semibold">{formatPrice(product.price, locale)}</span>
                        <Badge tone={inStock ? 'success' : 'neutral'}>
                          {inStock ? tShop('inStock') : tShop('outOfStock')}
                        </Badge>
                      </div>
                    </div>
                    <Button
                      size="icon"
                      variant="outline"
                      aria-label={tShop('addToCart')}
                      disabled={!inStock}
                      onClick={() => {
                        add({
                          productId: product.id,
                          name: product.name,
                          slug: product.slug,
                          price: product.price,
                          image: product.image,
                          maxQuantity: product.stockQuantity ?? null,
                        })
                        toast.success(tShop('added'))
                      }}
                    >
                      <ShoppingBag className="size-4" />
                    </Button>
                  </Card>
                )
              })}

            {missing.map((type) => (
              <Card key={type} className="flex items-center gap-4 border-dashed p-5 text-body-sm text-neutral-400">
                <FilterIcon className="size-5 text-neutral-200" />
                <span>
                  <span className="block font-medium text-neutral-600">{t(type)}</span>
                  {t('noneListed')}
                </span>
              </Card>
            ))}
          </motion.div>
        ) : null}

        {result?.status === 'noMatch' ? (
          <motion.div key="nomatch" initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
            <Card className="p-8 text-center">
              <p className="text-h4 font-medium">{tOil('noMatchTitle')}</p>
              <p className="mt-2 text-body-sm text-neutral-500">{tOil('noMatchBody')}</p>
              <Button asChild className="mt-6">
                <Link href="/oil-finder">{tOil('title')}</Link>
              </Button>
            </Card>
          </motion.div>
        ) : null}
      </AnimatePresence>
    </div>
  )
}
