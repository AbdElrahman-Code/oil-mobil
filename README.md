# Auto Service Center — platform

Bilingual (Arabic-first, RTL) commercial platform for an Egyptian automotive
service centre: shop, smart oil recommendation engine, filter lookup, car-wash
booking, customer portal, and a self-service admin panel.

**Stack:** Next.js 15 (App Router, RSC, TS strict) · Payload CMS 3 (same app) ·
PostgreSQL · Tailwind v4 · Framer Motion · next-intl · Zustand ·
React Hook Form + Zod.

---

## Getting started

```bash
npm install
cp .env.example .env      # then fill in DATABASE_URI and PAYLOAD_SECRET
npm run seed              # demo data: catalogue, cars, customers, homepage
npm run dev               # http://localhost:3000
```

- Storefront: `http://localhost:3000/ar` (Arabic, default) or `/en`
- Admin: `http://localhost:3000/admin`
- Staff lookup: `http://localhost:3000/admin/customer-lookup`
- API: `/api/...` (REST) and `/api/graphql`

The seed prints the admin and demo-customer credentials when it finishes.

### Required environment

| Variable | Purpose |
| --- | --- |
| `DATABASE_URI` | PostgreSQL connection string |
| `PAYLOAD_SECRET` | Signing secret for auth tokens |
| `NEXT_PUBLIC_SERVER_URL` | Public base URL, used for SEO and callbacks |

Everything else in `.env.example` is optional — S3/R2 media storage, Paymob,
WhatsApp/SMS, PostHog. Each degrades gracefully when unset: media goes to local
disk, card payment stays off, notifications are logged instead of sent.

---

## Scripts

| Command | What it does |
| --- | --- |
| `npm run dev` | Development server |
| `npm run build` / `start` | Production build and serve |
| `npm run typecheck` | `tsc --noEmit` |
| `npm run seed` | Wipes demo collections and reseeds them |
| `npm run generate:types` | Regenerates `src/payload-types.ts` after schema edits |
| `npm run generate:importmap` | Rebuilds the admin import map after adding admin components |
| `npx tsx src/seed/verify.ts` | Asserts the oil engine against the seeded reference data |
| `npx tsx src/seed/photos.ts` | Sources real, openly-licensed product photography |
| `npx tsx src/seed/rotate-admin.ts` | Issues a new strong admin password and prints it once |
| `node src/seed/contrast-audit.mjs` | Checks every brand colour pairing against WCAG AA |
| `node src/seed/lighthouse.mjs` | Lighthouse audit of homepage, PDP and Oil Finder |

Run `generate:types` and `generate:importmap` whenever you change a collection
or an admin component.

---

## Design system

**Colour.** Blue (`--color-primary`, #0047BA) carries the identity: navigation,
links, headings, form focus, most buttons. Red (`--color-accent`, #D42E12) is
reserved for commerce and urgency — add to cart, buy now, book now, place order,
sale and low-stock badges — and never used as a large background fill. Neutrals
run from #0B0E14 to #F5F6F8.

Every colour in the UI resolves through a token in
[globals.css](src/app/(frontend)/globals.css); no component contains a hex value.
The shop owner can re-brand both ramps from **Site Settings → Brand** without a
deploy — [BrandStyle](src/components/layout/BrandStyle.tsx) derives the full
tint/shade scale from the two chosen colours at request time.

`node src/seed/contrast-audit.mjs` checks all 24 text and UI pairings against
WCAG AA and is the reason `--color-neutral-400` is #616B7D rather than something
lighter.

**Type.** One typeface — **Cairo** — for Arabic and Latin, so switching locale
never causes a fallback flash. The scale is defined once as Tailwind tokens and
used everywhere: `text-display`, `text-h1`…`text-h4`, `text-body-lg`,
`text-body`, `text-body-sm`, `text-label`. There are no ad hoc sizes in the
codebase. The admin panel uses the same face and scale via
[custom.scss](src/app/(payload)/custom.scss) and
[admin/theme.ts](src/components/admin/theme.ts).

> If you add a type token, also add it to the `font-size` class group in
> [utils.ts](src/lib/utils.ts). `tailwind-merge` cannot tell a custom `text-*`
> size from a `text-*` colour, and will silently strip the colour beside it.

---

## How it is put together

```
src/
  payload.config.ts       collections, globals, localisation, storage, admin
  collections/            16 collections — the whole business model
  globals/                siteSettings · homepage (blocks) · navigation
  blocks/                 homepage section types the admin drags into order
  actions/                server actions: orders, bookings, oil finder, auth
  lib/                    oil-engine, products, payload client, paymob,
                          notifications, rate limiting, validation
  components/             ui · layout · shop · oil-finder · booking · account · admin
  app/(payload)/          admin panel + REST/GraphQL routes
  app/(frontend)/[locale] the public site
  seed/                   demo data and generated placeholder imagery
```

**Nothing that the shop might want to change lives in code.** Products, prices,
stock, car brands/models/engines, oil specifications, wash packages, homepage
sections, menus, delivery fees and booking capacity are all collections or
globals, editable in `/admin`.

### The oil recommendation engine

`src/lib/oil-engine.ts` is pure, testable logic; `src/actions/oil-finder.ts`
wraps it as a server action so the future mobile app can call the same API.

1. Match `oilSpecifications` on model + year range + engine code, preferring the
   narrowest year range so a targeted override wins.
2. Apply **`oilAdjustmentRules`** — admin-editable rows, not `if` statements.
   Each rule matches on mileage, engine condition, fuel type or turbo, and can
   shift viscosity a grade, scale the change interval, force an oil type, add a
   customer-facing note, or flag the result for staff review.
3. Return viscosity, API/ACEA spec, litres, interval, the recommended product
   (with the number of bottles), alternatives and the matching filters.
4. No match → an `oilFinderLeads` record is created and the customer is asked
   for their number, instead of hitting a dead end.

### Access control

Four staff roles (`superadmin`, `manager`, `technician`, `salesStaff`) with
per-collection and per-field rules — for example technicians can write service
records but cannot see or change `costPrice`. Customers authenticate against a
separate `customers` collection (login is the phone number) and can only ever
read their own vehicles, orders, invoices and bookings.

### Payments and notifications

Cash on delivery and pay-at-branch work out of the box. Paymob is implemented
including HMAC verification of the callback (`/api/paymob/callback`); it stays
disabled until keys exist and the switch in Site Settings is turned on.
Notifications go through one `notify()` interface with WhatsApp and SMS
adapters; without credentials the message is logged so staff can follow up.

---

## Placeholder content

Product, category and service imagery is **real photography**, sourced from
Wikimedia Commons — the one large library that is queryable without an API key
and carries explicit licensing. Each Media record stores the photographer and
licence in its `credit` field. Anything the search cannot match falls back to a
generated on-brand composition rather than a grey box.

Everything is an ordinary Media record, so the shop replaces any image by
uploading its own photo — no code change, no redeploy.

```bash
npx tsx src/seed/photos.ts        # source photography for all content
npx tsx src/seed/photos-retry.ts  # second pass for anything left unmatched
```

These are stand-ins for review. Before launch, replace them with the client's
own photography — the licences are fine for a demo but the shop should own the
images it sells with.

---

## Before going live

- [ ] Rotate the admin password: `npx tsx src/seed/rotate-admin.ts`
- [ ] Delete the six demo customers and their vehicles, orders and bookings
- [ ] Replace seeded photography with the client's own images
- [ ] Have a lawyer review the three pages in **Legal Pages** — they are a
      starting draft written for this business, not legal advice
- [ ] Set `PAYLOAD_SECRET` to a fresh value and move media to S3/R2
- [ ] Turn on card payment in Site Settings once Paymob keys are in place

`npm run seed` refuses to run when `NODE_ENV=production` unless
`SEED_ALLOW_PRODUCTION=true`, and generates its demo passwords rather than
using fixed ones.

---

## Notes for deployment

- Host on Vercel with managed Postgres (Neon/Supabase) and R2/S3 for media.
- `push: true` (schema auto-sync) is used outside production; for production
  generate migrations with `npm run migrate:create` and run `npm run migrate`.
- `outputFileTracingRoot` is pinned in `next.config.mjs` because a stray
  `package-lock.json` at the `D:\` drive root otherwise makes Next treat the
  whole drive as the workspace and builds hang with no output.
