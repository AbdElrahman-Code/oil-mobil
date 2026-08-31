import type { Metadata } from 'next'
import { getTranslations, setRequestLocale } from 'next-intl/server'
import { AlertTriangle, Car, FileText, Package, Wrench } from 'lucide-react'
import type { Locale } from '@/i18n/routing'
import { Link, redirect } from '@/i18n/routing'
import { getCurrentCustomer } from '@/actions/auth'
import {
  daysUntil,
  getCustomerInvoices,
  getCustomerOrders,
  getCustomerServiceHistory,
  getCustomerVehicles,
} from '@/lib/account'
import { Badge, Card } from '@/components/ui/primitives'
import { Button } from '@/components/ui/button'
import { LogoutButton } from '@/components/account/LogoutButton'
import { ReorderButton } from '@/components/account/ReorderButton'
import { formatDate, formatPrice } from '@/lib/utils'

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale }>
}): Promise<Metadata> {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: 'account' })
  return { title: t('title'), robots: { index: false } }
}

export default async function AccountPage({ params }: { params: Promise<{ locale: Locale }> }) {
  const { locale } = await params
  setRequestLocale(locale)

  const customer = await getCurrentCustomer()
  if (!customer) redirect({ href: '/account/login', locale })

  const customerId = (customer as NonNullable<typeof customer>).id
  const [vehicles, orders, invoices, history, t, tShop] = await Promise.all([
    getCustomerVehicles(customerId, locale),
    getCustomerOrders(customerId, locale),
    getCustomerInvoices(customerId),
    getCustomerServiceHistory(customerId),
    getTranslations({ locale, namespace: 'account' }),
    getTranslations({ locale, namespace: 'shop' }),
  ])

  const dueVehicles = vehicles
    .map((vehicle) => ({ vehicle, days: daysUntil(vehicle.nextOilChangeDate) }))
    .filter((entry): entry is { vehicle: (typeof vehicles)[number]; days: number } => entry.days !== null)
    .filter((entry) => entry.days <= 30)
    .sort((a, b) => a.days - b.days)

  return (
    <div className="container-page py-10 lg:py-16">
      <header className="mb-10 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-h1 lg:text-h1">{t('title')}</h1>
          <p className="mt-2 text-neutral-400">{(customer as NonNullable<typeof customer>).name}</p>
        </div>
        <LogoutButton />
      </header>

      {dueVehicles.length ? (
        <div className="mb-10 space-y-3">
          {dueVehicles.map(({ vehicle, days }) => (
            <div
              key={vehicle.id}
              className="flex flex-wrap items-center gap-3 rounded-[var(--radius-card)] border border-warning/30 bg-warning-light px-5 py-4"
            >
              <AlertTriangle className="size-5 shrink-0 text-warning" />
              <p className="flex-1 text-body-sm text-warning">
                <span className="font-semibold">{vehicle.plateNumber}</span> —{' '}
                {days < 0 ? t('overdue') : t('dueIn', { days })}
              </p>
              <Button asChild size="sm">
                <Link href="/car-wash">{t('nextOilChange')}</Link>
              </Button>
            </div>
          ))}
        </div>
      ) : null}

      <div className="grid gap-8 lg:grid-cols-2">
        <Card className="p-6">
          <h2 className="mb-5 flex items-center gap-2 text-h4 font-semibold">
            <Car className="size-5 text-primary-500" />
            {t('vehicles')}
          </h2>
          {vehicles.length ? (
            <ul className="divide-y divide-neutral-200">
              {vehicles.map((vehicle) => (
                <li key={vehicle.id} className="flex flex-wrap items-center gap-3 py-3.5">
                  <div className="flex-1">
                    <p className="font-medium">{vehicle.plateNumber}</p>
                    <p className="text-body-sm text-neutral-400">
                      {typeof vehicle.brand === 'object' ? vehicle.brand?.name : ''}{' '}
                      {typeof vehicle.model === 'object' ? vehicle.model?.name : ''}{' '}
                      {vehicle.manufacturingYear}
                    </p>
                  </div>
                  <div className="text-end text-body-sm">
                    <p className="text-neutral-400">{t('nextOilChange')}</p>
                    <p className="font-medium">{formatDate(vehicle.nextOilChangeDate, locale)}</p>
                  </div>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body-sm text-neutral-400">{t('noVehicles')}</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="mb-5 flex items-center gap-2 text-h4 font-semibold">
            <Package className="size-5 text-primary-500" />
            {t('orders')}
          </h2>
          {orders.length ? (
            <ul className="divide-y divide-neutral-200">
              {orders.slice(0, 6).map((order) => (
                <li key={order.id} className="flex flex-wrap items-center gap-3 py-3.5">
                  <div className="flex-1">
                    <p className="font-medium tabular-nums" dir="ltr">
                      {order.orderNumber}
                    </p>
                    <p className="text-body-sm text-neutral-400">{formatDate(order.createdAt, locale)}</p>
                  </div>
                  <Badge tone={order.orderStatus === 'completed' ? 'success' : 'neutral'}>
                    {order.orderStatus}
                  </Badge>
                  <span className="font-semibold">{formatPrice(order.total, locale)}</span>
                  <ReorderButton
                    label={t('reorder')}
                    items={(order.items ?? []).map((item) => ({
                      productId: typeof item.product === 'object' ? item.product.id : item.product,
                      name:
                        typeof item.product === 'object'
                          ? item.product.name
                          : (item.nameSnapshot ?? ''),
                      slug:
                        typeof item.product === 'object'
                          ? (item.product.slug ?? String(item.product.id))
                          : '',
                      price: item.priceAtPurchase ?? 0,
                      quantity: item.quantity ?? 1,
                    }))}
                    addedLabel={tShop('added')}
                  />
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body-sm text-neutral-400">{t('noOrders')}</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="mb-5 flex items-center gap-2 text-h4 font-semibold">
            <Wrench className="size-5 text-primary-500" />
            {t('serviceHistory')}
          </h2>
          {history.length ? (
            <ol className="relative space-y-5 border-s border-neutral-200 ps-5">
              {history.slice(0, 8).map((record) => (
                <li key={record.id} className="relative">
                  <span className="absolute -start-[1.6rem] top-1.5 size-2.5 rounded-full bg-primary-500" />
                  <p className="text-body-sm font-medium">{formatDate(record.serviceDate, locale)}</p>
                  <p className="text-body-sm text-neutral-400">
                    {(record.serviceTypes ?? []).join(' · ')} · {record.mileageAtService} km
                  </p>
                  <p className="text-body-sm font-medium text-neutral-700">{formatPrice(record.cost, locale)}</p>
                </li>
              ))}
            </ol>
          ) : (
            <p className="text-body-sm text-neutral-400">{t('noHistory')}</p>
          )}
        </Card>

        <Card className="p-6">
          <h2 className="mb-5 flex items-center gap-2 text-h4 font-semibold">
            <FileText className="size-5 text-primary-500" />
            {t('invoices')}
          </h2>
          {invoices.length ? (
            <ul className="divide-y divide-neutral-200">
              {invoices.map((invoice) => (
                <li key={invoice.id} className="flex items-center gap-3 py-3.5">
                  <div className="flex-1">
                    <p className="font-medium tabular-nums" dir="ltr">
                      {invoice.invoiceNumber}
                    </p>
                    <p className="text-body-sm text-neutral-400">{formatDate(invoice.issueDate, locale)}</p>
                  </div>
                  <span className="font-semibold">{formatPrice(invoice.total, locale)}</span>
                  <Button asChild size="sm" variant="outline">
                    <Link href={`/account/invoices/${invoice.id}`}>{t('downloadInvoice')}</Link>
                  </Button>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-body-sm text-neutral-400">—</p>
          )}
        </Card>


      </div>
    </div>
  )
}
