'use client'

import Image from 'next/image'
import { useLocale, useTranslations } from 'next-intl'
import { motion } from 'framer-motion'
import { AlertTriangle, Droplet, Filter, Gauge, Info, RotateCcw, ShoppingBag } from 'lucide-react'
import { toast } from 'sonner'
import { Link } from '@/i18n/routing'
import type { OilFinderProduct, OilFinderSuccess } from '@/actions/oil-finder'
import { Button } from '@/components/ui/button'
import { Badge, Card } from '@/components/ui/primitives'
import { useCart } from '@/store/cart'
import { formatPrice } from '@/lib/utils'
import { track } from '@/components/analytics/AnalyticsProvider'

const Spec = ({ label, value, icon: Icon }: { label: string; value: string; icon: typeof Droplet }) => (
  <div className="rounded-xl border border-white/10 bg-white/5 p-4">
    <div className="mb-1.5 flex items-center gap-2 text-label font-semibold uppercase tracking-[0.14em] text-neutral-300">
      <Icon className="size-3.5 text-primary-400" />
      {label}
    </div>
    <p className="text-h4 font-bold text-white" dir="ltr">
      {value}
    </p>
  </div>
)

const ProductRow = ({
  product,
  highlight = false,
  label,
}: {
  product: OilFinderProduct
  highlight?: boolean
  label?: string
}) => {
  const locale = useLocale()
  const t = useTranslations('shop')
  const add = useCart((state) => state.add)

  return (
    <div className="flex items-center gap-4 rounded-xl border border-neutral-200 bg-white p-4">
      <div className="relative size-16 shrink-0 overflow-hidden rounded-lg bg-neutral-100">
        {product.image ? (
          <Image src={product.image} alt={product.name} fill sizes="64px" className="object-cover" />
        ) : null}
      </div>
      <div className="min-w-0 flex-1">
        {label ? <p className="mb-0.5 text-label font-semibold uppercase tracking-wide text-primary-600">{label}</p> : null}
        <Link href={`/products/${product.slug}`} className="line-clamp-2 text-body-sm font-medium hover:text-primary-600">
          {product.name}
        </Link>
        <p className="mt-1 text-body-sm font-semibold">{formatPrice(product.price, locale)}</p>
        {product.bottles && product.bottles > 1 ? (
          <p className="text-body-sm text-neutral-400">×{product.bottles}</p>
        ) : null}
      </div>
      <Button
        size="sm"
        variant={highlight ? 'accent' : 'outline'}
        onClick={() => {
          add(
            {
              productId: product.id,
              name: product.name,
              slug: product.slug,
              price: product.price,
              image: product.image,
              maxQuantity: product.stockQuantity ?? null,
            },
            product.bottles ?? 1,
          )
          track('oil_finder_add_to_cart', { productId: product.id })
          toast.success(t('added'))
        }}
      >
        <ShoppingBag className="size-4" />
      </Button>
    </div>
  )
}

export const OilFinderResultCard = ({
  result,
  onReset,
}: {
  result: OilFinderSuccess
  onReset: () => void
}) => {
  const locale = useLocale()
  const t = useTranslations('oilFinder')
  const tFilters = useTranslations('filterLookup')
  const add = useCart((state) => state.add)

  const bundle = [result.recommendedProduct, result.oilFilter].filter(
    (product): product is OilFinderProduct => Boolean(product),
  )

  return (
    <motion.div
      initial={{ opacity: 0, y: 24 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6, ease: [0.16, 1, 0.3, 1] }}
      className="space-y-6"
    >
      <div className="surface-dark overflow-hidden rounded-[var(--radius-card)] p-6 sm:p-8">
        <p className="mb-2 text-label font-semibold uppercase tracking-[0.18em] text-primary-300">
          {t('resultTitle', { car: '' })}
        </p>
        <h2 className="text-h2 text-white sm:text-h1">{result.vehicleLabel}</h2>

        <div className="mt-7 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Spec label={t('viscosity')} value={result.viscosity} icon={Droplet} />
          <Spec
            label={t('specification')}
            value={[result.apiSpec, result.aceaSpec].filter(Boolean).join(' · ') || '—'}
            icon={Info}
          />
          <Spec
            label={t('quantity')}
            value={t('liters', { count: result.quantityLiters })}
            icon={Filter}
          />
          <Spec
            label={t('changeEvery')}
            value={t('kmOrMonths', { km: result.intervalKm, months: result.intervalMonths })}
            icon={Gauge}
          />
        </div>

        {result.viscosityAdjusted ? (
          <p className="mt-5 flex items-start gap-2 text-body-sm text-neutral-200">
            <AlertTriangle className="mt-0.5 size-4 shrink-0 text-warning" />
            <span dir="ltr">
              {result.baseViscosity} → {result.viscosity}
            </span>
          </p>
        ) : null}

        {result.notes.map((note) => (
          <p key={note} className="mt-3 flex items-start gap-2 text-body-sm text-neutral-200">
            <Info className="mt-0.5 size-4 shrink-0 text-primary-400" />
            {note}
          </p>
        ))}

        {result.needsStaffReview ? (
          <div className="mt-5 rounded-xl border border-warning/40 bg-warning/15 p-4 text-body-sm text-warning-light">
            {t('noMatchTitle')}
          </div>
        ) : null}
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card className="p-5">
          <h3 className="mb-4 text-body-sm font-semibold uppercase tracking-wide text-neutral-400">
            {t('recommendedProduct')}
          </h3>
          <div className="space-y-3">
            {result.recommendedProduct ? (
              <ProductRow product={result.recommendedProduct} highlight />
            ) : (
              <p className="text-body-sm text-neutral-400">{tFilters('noneListed')}</p>
            )}

            {result.alternatives.length ? (
              <>
                <p className="pt-2 text-body-sm font-medium uppercase tracking-wide text-neutral-400">
                  {t('alternatives')}
                </p>
                {result.alternatives.map((product) => (
                  <ProductRow key={product.id} product={product} />
                ))}
              </>
            ) : null}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="mb-4 text-body-sm font-semibold uppercase tracking-wide text-neutral-400">
            {t('oilFilter')}
          </h3>
          <div className="space-y-3">
            {result.oilFilter ? (
              <>
                <ProductRow
                  product={result.oilFilter}
                  label={result.oilFilter.partNumber ? `${t('partNumber')} ${result.oilFilter.partNumber}` : undefined}
                />
              </>
            ) : (
              <p className="text-body-sm text-neutral-400">{tFilters('noneListed')}</p>
            )}

            {result.otherFilters.map(({ type, product }) => (
              <ProductRow
                key={product.id}
                product={product}
                label={tFilters(type as 'air' | 'cabin' | 'fuel')}
              />
            ))}
          </div>
        </Card>
      </div>

      <div className="flex flex-wrap gap-3">
        {bundle.length > 1 ? (
          <Button
            size="lg"
            variant="accent"
            onClick={() => {
              bundle.forEach((product) =>
                add(
                  {
                    productId: product.id,
                    name: product.name,
                    slug: product.slug,
                    price: product.price,
                    image: product.image,
                    maxQuantity: product.stockQuantity ?? null,
                  },
                  product.bottles ?? 1,
                ),
              )
              track('oil_finder_bundle_added', { count: bundle.length })
              toast.success(locale === 'ar' ? 'تمت إضافة الزيت والفلتر' : 'Oil and filter added')
            }}
          >
            <ShoppingBag className="size-4" />
            {t('bundleCta')}
          </Button>
        ) : null}

        <Button variant="outline" size="lg" onClick={onReset}>
          <RotateCcw className="size-4" />
          {t('startOver')}
        </Button>

        <Badge tone="neutral" className="self-center">
          {result.oilType}
        </Badge>
      </div>
    </motion.div>
  )
}
