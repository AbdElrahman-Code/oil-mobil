import { getPayload } from 'payload'
import configPromise from '@payload-config'
import type { AdminViewServerProps } from 'payload'
import { brand, type as typeScale } from './theme'

/**
 * Staff-facing search: one box, one screen. Type a plate, a phone or a name and
 * get the customer, their cars, service history and recent orders together —
 * the thing the counter actually needs during a phone call.
 */

const cell: React.CSSProperties = { padding: '8px 10px', ...typeScale.bodySm, verticalAlign: 'top' }
const headCell: React.CSSProperties = {
  ...cell,
  ...typeScale.label,
  textTransform: 'uppercase',
  opacity: 0.65,
  textAlign: 'start',
}

const Section = ({ title, children }: { title: string; children: React.ReactNode }) => (
  <section style={{ marginTop: 24 }}>
    <h3 style={{ ...typeScale.h4, marginBottom: 8 }}>{title}</h3>
    <div style={{ border: '1px solid var(--theme-elevation-150, #E4E8EE)', borderRadius: 10, overflow: 'hidden' }}>
      {children}
    </div>
  </section>
)

export const CustomerLookup = async ({ searchParams }: AdminViewServerProps) => {
  const params = await searchParams
  const rawQuery = params?.q
  const query = (Array.isArray(rawQuery) ? rawQuery[0] : rawQuery)?.trim() ?? ''

  let customers: Awaited<ReturnType<typeof loadResults>> = []

  async function loadResults(search: string) {
    const payload = await getPayload({ config: configPromise })

    // A plate can identify a customer just as well as a phone number.
    const vehicleHits = await payload.find({
      collection: 'vehicles',
      where: { plateNumber: { like: search } },
      limit: 10,
      depth: 0,
      overrideAccess: true,
    })

    const ownerIds = vehicleHits.docs
      .map((vehicle) => (typeof vehicle.owner === 'object' ? vehicle.owner?.id : vehicle.owner))
      .filter((id): id is number => typeof id === 'number')

    const customerHits = await payload.find({
      collection: 'customers',
      where: {
        or: [
          { phone: { like: search } },
          { name: { like: search } },
          ...(ownerIds.length ? [{ id: { in: ownerIds } }] : []),
        ],
      },
      limit: 10,
      depth: 0,
      overrideAccess: true,
    })

    return Promise.all(
      customerHits.docs.map(async (customer) => {
        const [vehicles, orders, history, bookings] = await Promise.all([
          payload.find({ collection: 'vehicles', where: { owner: { equals: customer.id } }, limit: 20, depth: 1, overrideAccess: true }),
          payload.find({ collection: 'orders', where: { customer: { equals: customer.id } }, sort: '-createdAt', limit: 5, depth: 0, overrideAccess: true }),
          payload.find({ collection: 'serviceRecords', where: { customerSnapshot: { equals: customer.id } }, sort: '-serviceDate', limit: 5, depth: 0, overrideAccess: true }),
          payload.find({ collection: 'bookings', where: { customer: { equals: customer.id } }, sort: '-requestedDate', limit: 5, depth: 1, overrideAccess: true }),
        ])
        return { customer, vehicles: vehicles.docs, orders: orders.docs, history: history.docs, bookings: bookings.docs }
      }),
    )
  }

  if (query.length >= 2) {
    try {
      customers = await loadResults(query)
    } catch (error) {
      console.error('customer lookup failed', error)
    }
  }

  return (
    <div style={{ padding: '32px 40px', maxWidth: 1100 }}>
      <h1 style={{ ...typeScale.h2, marginBottom: 6 }}>Customer lookup</h1>
      <p style={{ ...typeScale.body, opacity: 0.65, marginBottom: 20 }}>
        Search by plate number, phone number or name.
      </p>

      <form method="get" style={{ display: 'flex', gap: 8, marginBottom: 8 }}>
        <input
          name="q"
          defaultValue={query}
          placeholder="ط ك ع 1234  ·  01012345678  ·  Ahmed"
          autoFocus
          style={{
            flex: 1,
            padding: '12px 14px',
            borderRadius: 10,
            border: '1px solid var(--theme-elevation-200, #A7B0BF)',
            background: 'var(--theme-input-bg, #FFFFFF)',
            color: 'inherit',
            ...typeScale.body,
          }}
        />
        <button
          type="submit"
          style={{
            padding: '12px 22px',
            borderRadius: 10,
            border: 'none',
            background: brand.primary,
            color: brand.white,
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          Search
        </button>
      </form>

      {query.length >= 2 && customers.length === 0 ? (
        <p style={{ opacity: 0.6, marginTop: 24 }}>Nothing found for “{query}”.</p>
      ) : null}

      {customers.map(({ customer, vehicles, orders, history, bookings }) => (
        <article
          key={customer.id}
          style={{
            marginTop: 28,
            padding: 24,
            border: '1px solid var(--theme-elevation-150, #E4E8EE)',
            borderRadius: 14,
          }}
        >
          <header style={{ display: 'flex', flexWrap: 'wrap', gap: 16, alignItems: 'baseline' }}>
            <h2 style={{ ...typeScale.h3 }}>{customer.name}</h2>
            <span style={{ opacity: 0.7, direction: 'ltr' }}>{customer.phone}</span>
            {customer.email ? <span style={{ opacity: 0.55 }}>{customer.email}</span> : null}
            <span style={{ marginInlineStart: 'auto', display: 'flex', gap: 10 }}>
              <a href={`/admin/collections/customers/${customer.id}`} style={{ ...typeScale.bodySm, color: brand.primary }}>
                Open record →
              </a>
            </span>
          </header>

          <Section title={`Cars (${vehicles.length})`}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr>
                  <th style={headCell}>Plate</th>
                  <th style={headCell}>Car</th>
                  <th style={headCell}>Mileage</th>
                  <th style={headCell}>Next oil change</th>
                  <th style={headCell} />
                </tr>
              </thead>
              <tbody>
                {vehicles.map((vehicle) => (
                  <tr key={vehicle.id} style={{ borderTop: '1px solid var(--theme-elevation-100, #E4E8EE)' }}>
                    <td style={{ ...cell, fontWeight: 600 }}>{vehicle.plateNumber}</td>
                    <td style={cell}>
                      {typeof vehicle.brand === 'object' ? vehicle.brand?.name : ''}{' '}
                      {typeof vehicle.model === 'object' ? vehicle.model?.name : ''} {vehicle.manufacturingYear}
                    </td>
                    <td style={cell}>{vehicle.currentMileage?.toLocaleString() ?? '—'} km</td>
                    <td style={cell}>{vehicle.nextOilChangeDate?.slice(0, 10) ?? '—'}</td>
                    <td style={cell}>
                      <a href={`/admin/collections/vehicles/${vehicle.id}`}>Open</a>
                    </td>
                  </tr>
                ))}
                {vehicles.length === 0 ? (
                  <tr>
                    <td style={{ ...cell, opacity: 0.55 }} colSpan={5}>
                      No cars on file.
                    </td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </Section>

          <Section title="Recent service history">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {history.map((record) => (
                  <tr key={record.id} style={{ borderTop: '1px solid var(--theme-elevation-100, #E4E8EE)' }}>
                    <td style={cell}>{record.serviceDate?.slice(0, 10)}</td>
                    <td style={cell}>{(record.serviceTypes ?? []).join(', ')}</td>
                    <td style={cell}>{record.mileageAtService?.toLocaleString()} km</td>
                    <td style={cell}>{record.cost?.toLocaleString()} EGP</td>
                    <td style={cell}>
                      <a href={`/admin/collections/serviceRecords/${record.id}`}>Open</a>
                    </td>
                  </tr>
                ))}
                {history.length === 0 ? (
                  <tr>
                    <td style={{ ...cell, opacity: 0.55 }}>No service records yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </Section>

          <Section title="Recent orders">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {orders.map((order) => (
                  <tr key={order.id} style={{ borderTop: '1px solid var(--theme-elevation-100, #E4E8EE)' }}>
                    <td style={{ ...cell, fontWeight: 600, direction: 'ltr' }}>{order.orderNumber}</td>
                    <td style={cell}>{order.orderStatus}</td>
                    <td style={cell}>{order.total?.toLocaleString()} EGP</td>
                    <td style={cell}>
                      <a href={`/admin/collections/orders/${order.id}`}>Open</a>
                    </td>
                  </tr>
                ))}
                {orders.length === 0 ? (
                  <tr>
                    <td style={{ ...cell, opacity: 0.55 }}>No orders yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </Section>

          <Section title="Bookings">
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <tbody>
                {bookings.map((booking) => (
                  <tr key={booking.id} style={{ borderTop: '1px solid var(--theme-elevation-100, #E4E8EE)' }}>
                    <td style={cell}>{booking.requestedDate?.slice(0, 10)}</td>
                    <td style={cell}>{booking.requestedTimeSlot}</td>
                    <td style={cell}>
                      {typeof booking.serviceType === 'object' ? booking.serviceType?.name : ''}
                    </td>
                    <td style={cell}>{booking.status}</td>
                    <td style={cell}>
                      <a href={`/admin/collections/bookings/${booking.id}`}>Open</a>
                    </td>
                  </tr>
                ))}
                {bookings.length === 0 ? (
                  <tr>
                    <td style={{ ...cell, opacity: 0.55 }}>No bookings yet.</td>
                  </tr>
                ) : null}
              </tbody>
            </table>
          </Section>
        </article>
      ))}
    </div>
  )
}

export default CustomerLookup
