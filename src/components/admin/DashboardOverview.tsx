import { getPayload } from 'payload'
import configPromise from '@payload-config'
import { addDays } from 'date-fns'
import { brand, type } from './theme'

/**
 * The first thing staff see when they log in: what needs doing today.
 * Every tile links straight into a filtered list view.
 */
const Tile = ({
  label,
  value,
  href,
  tone = 'neutral',
  hint,
}: {
  label: string
  value: number | string
  href: string
  tone?: 'neutral' | 'primary' | 'accent' | 'warning' | 'success'
  hint?: string
}) => {
  const colors: Record<string, string> = {
    neutral: brand.neutral950,
    primary: brand.primary,
    accent: brand.accent,
    warning: brand.warning,
    success: brand.success,
  }
  return (
    <a
      href={href}
      style={{
        display: 'block',
        padding: '18px 20px',
        border: `1px solid var(--theme-elevation-150, ${brand.neutral200})`,
        borderRadius: 12,
        textDecoration: 'none',
        background: `var(--theme-elevation-0, ${brand.white})`,
        minWidth: 170,
        flex: '1 1 170px',
      }}
    >
      <div style={{ ...type.label, opacity: 0.65 }}>{label}</div>
      <div style={{ ...type.h2, marginTop: 6, color: colors[tone] }}>{value}</div>
      {hint ? <div style={{ ...type.bodySm, opacity: 0.6, marginTop: 4 }}>{hint}</div> : null}
    </a>
  )
}

export const DashboardOverview = async () => {
  let stats = {
    pendingOrders: 0,
    todayBookings: 0,
    dueOilChanges: 0,
    lowStock: 0,
    openLeads: 0,
    monthRevenue: 0,
  }

  try {
    const payload = await getPayload({ config: configPromise })
    const now = new Date()
    const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString()
    const todayEnd = addDays(new Date(todayStart), 1).toISOString()
    const monthStart = new Date(now.getFullYear(), now.getMonth(), 1).toISOString()

    const [orders, bookings, dueVehicles, lowStock, leads, monthOrders] = await Promise.all([
      payload.count({ collection: 'orders', where: { orderStatus: { in: ['pending', 'confirmed', 'preparing'] } } }),
      payload.count({
        collection: 'bookings',
        where: {
          and: [
            { requestedDate: { greater_than_equal: todayStart } },
            { requestedDate: { less_than: todayEnd } },
            { status: { not_equals: 'cancelled' } },
          ],
        },
      }),
      payload.count({
        collection: 'vehicles',
        where: { nextOilChangeDate: { less_than_equal: addDays(now, 14).toISOString() } },
      }),
      payload.count({ collection: 'products', where: { stockQuantity: { less_than_equal: 5 } } }),
      payload.count({ collection: 'oilFinderLeads', where: { status: { equals: 'new' } } }),
      payload.find({
        collection: 'orders',
        where: {
          and: [{ createdAt: { greater_than_equal: monthStart } }, { orderStatus: { not_equals: 'cancelled' } }],
        },
        limit: 1000,
        depth: 0,
        pagination: false,
      }),
    ])

    stats = {
      pendingOrders: orders.totalDocs,
      todayBookings: bookings.totalDocs,
      dueOilChanges: dueVehicles.totalDocs,
      lowStock: lowStock.totalDocs,
      openLeads: leads.totalDocs,
      monthRevenue: monthOrders.docs.reduce((sum, order) => sum + (order.total ?? 0), 0),
    }
  } catch {
    // Before the database is migrated the dashboard should still render.
    return null
  }

  const money = new Intl.NumberFormat('en-EG', {
    style: 'currency',
    currency: 'EGP',
    maximumFractionDigits: 0,
  }).format(stats.monthRevenue)

  return (
    <div style={{ marginBottom: 28 }}>
      <h2 style={{ ...type.h4, marginBottom: 14 }}>Today at a glance</h2>
      <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
        <Tile
          label="Orders to handle"
          value={stats.pendingOrders}
          tone="primary"
          href="/admin/collections/orders?where[or][0][and][0][orderStatus][in]=pending,confirmed,preparing"
        />
        <Tile
          label="Oil changes due"
          value={stats.dueOilChanges}
          tone="warning"
          hint="Next 14 days"
          href="/admin/collections/vehicles?sort=nextOilChangeDate"
        />
        <Tile label="Low stock items" value={stats.lowStock} tone="warning" href="/admin/collections/products?sort=stockQuantity" />
        <Tile label="New oil enquiries" value={stats.openLeads} tone="accent" href="/admin/collections/oilFinderLeads" />
        <Tile label="Sales this month" value={money} tone="success" href="/admin/collections/orders" />
      </div>
    </div>
  )
}

export default DashboardOverview
