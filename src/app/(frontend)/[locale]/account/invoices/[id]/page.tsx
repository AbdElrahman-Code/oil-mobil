import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { redirect } from '@/i18n/routing'
import { getCurrentCustomer } from '@/actions/auth'
import { getPayloadClient, getSiteSettings } from '@/lib/payload'
import { formatDate, formatPrice } from '@/lib/utils'
import { PrintButton } from '@/components/account/PrintButton'

export const metadata = { robots: { index: false } }

export default async function InvoicePage({
  params,
}: {
  params: Promise<{ locale: Locale; id: string }>
}) {
  const { locale, id } = await params
  setRequestLocale(locale)

  const customer = await getCurrentCustomer()
  if (!customer) redirect({ href: '/account/login', locale })

  const payload = await getPayloadClient()
  const invoice = await payload
    .findByID({ collection: 'invoices', id: Number(id), depth: 0, overrideAccess: true })
    .catch(() => null)

  const ownerId = typeof invoice?.customer === 'object' ? invoice?.customer?.id : invoice?.customer
  if (!invoice || ownerId !== (customer as NonNullable<typeof customer>).id) notFound()

  const settings = await getSiteSettings(locale)

  return (
    <div className="container-page py-10 print:py-0">
      <div className="mx-auto max-w-3xl">
        <div className="mb-6 flex justify-end print:hidden">
          <PrintButton />
        </div>

        <article className="rounded-[var(--radius-card)] border border-neutral-200 bg-white p-8 print:border-0 print:p-0">
          <header className="flex flex-wrap items-start justify-between gap-6 border-b border-neutral-200 pb-6">
            <div>
              <p className="font-[family-name:var(--font-display)] text-h3 font-bold">
                {settings?.siteName}
              </p>
              {settings?.phone ? <p className="mt-1 text-body-sm text-neutral-400">{settings.phone}</p> : null}
              {settings?.branches?.[0]?.address ? (
                <p className="mt-1 max-w-xs text-body-sm text-neutral-400">{settings.branches[0].address}</p>
              ) : null}
            </div>
            <div className="text-end">
              <p className="text-label font-semibold uppercase tracking-[0.16em] text-neutral-400">
                {locale === 'ar' ? 'فاتورة' : 'Invoice'}
              </p>
              <p className="mt-1 text-h4 font-bold tabular-nums" dir="ltr">
                {invoice.invoiceNumber}
              </p>
              <p className="mt-1 text-body-sm text-neutral-400">{formatDate(invoice.issueDate, locale)}</p>
            </div>
          </header>

          <section className="py-6">
            <p className="text-label font-semibold uppercase tracking-[0.16em] text-neutral-400">
              {locale === 'ar' ? 'العميل' : 'Billed to'}
            </p>
            <p className="mt-1 font-medium">{invoice.customerName}</p>
            {invoice.companyName ? <p className="text-body-sm text-neutral-400">{invoice.companyName}</p> : null}
            {invoice.taxRegistrationNumber ? (
              <p className="text-body-sm text-neutral-400" dir="ltr">
                {invoice.taxRegistrationNumber}
              </p>
            ) : null}
          </section>

          <table className="w-full text-body-sm">
            <thead>
              <tr className="border-b border-neutral-200 text-start text-label uppercase tracking-wide text-neutral-400">
                <th className="py-2 text-start font-semibold">
                  {locale === 'ar' ? 'البيان' : 'Description'}
                </th>
                <th className="py-2 text-end font-semibold">{locale === 'ar' ? 'الكمية' : 'Qty'}</th>
                <th className="py-2 text-end font-semibold">{locale === 'ar' ? 'السعر' : 'Unit'}</th>
                <th className="py-2 text-end font-semibold">{locale === 'ar' ? 'الإجمالي' : 'Total'}</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-200">
              {(invoice.lineItems ?? []).map((item) => (
                <tr key={item.id ?? item.description}>
                  <td className="py-3">{item.description}</td>
                  <td className="py-3 text-end tabular-nums">{item.quantity}</td>
                  <td className="py-3 text-end tabular-nums">{formatPrice(item.unitPrice, locale)}</td>
                  <td className="py-3 text-end tabular-nums">
                    {formatPrice((item.quantity ?? 0) * (item.unitPrice ?? 0), locale)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <dl className="mt-6 ms-auto max-w-xs space-y-2 text-body-sm">
            <div className="flex justify-between">
              <dt className="text-neutral-500">{locale === 'ar' ? 'الإجمالي قبل الضريبة' : 'Subtotal'}</dt>
              <dd className="tabular-nums">{formatPrice(invoice.subtotal, locale)}</dd>
            </div>
            <div className="flex justify-between">
              <dt className="text-neutral-500">
                {locale === 'ar' ? 'ضريبة القيمة المضافة' : 'VAT'} ({invoice.vatRate}%)
              </dt>
              <dd className="tabular-nums">{formatPrice(invoice.vatAmount, locale)}</dd>
            </div>
            <div className="flex justify-between border-t border-neutral-200 pt-2 text-body font-bold">
              <dt>{locale === 'ar' ? 'الإجمالي' : 'Total'}</dt>
              <dd className="tabular-nums">{formatPrice(invoice.total, locale)}</dd>
            </div>
          </dl>

          {invoice.notes ? <p className="mt-8 text-body-sm text-neutral-400">{invoice.notes}</p> : null}
        </article>
      </div>
    </div>
  )
}
