# Phase 9 — Marketplace-grade storefront with a connected garage

## Goal

Turn the shop from a small catalogue into a **marketplace-grade auto-parts store**
with the browsing patterns people already know from Alibaba, Amazon and Noon —
but simpler, better looking, and built around one thing those sites cannot do:
**it knows which car you drive.**

The customer registers their car once. From then on the entire shop answers a
single question for them: *does this fit my car?*

## Scope decision (assumption — flag if wrong)

This is a **single-store marketplace experience**, not a multi-vendor platform.
Alibaba's *browsing and search UX* is the reference; its *supplier marketplace*
(many sellers, RFQ, trade assurance, per-supplier storefronts) is not in scope,
because the brand, pricing and fulfilment are all the client's own. If genuine
third-party sellers are wanted later, that is a separate build: a `suppliers`
collection, per-supplier storefronts, split orders, commission and payouts.

## Principles

1. **Non-technical first.** A customer who does not know what "viscosity" means
   must still buy the right oil. Plate number or car picker, never jargon.
2. **Fitment everywhere.** Every product, listing and search result answers
   "does this fit my car?" before the customer has to ask.
3. **Two clicks to anything.** Mega-menu covers the whole catalogue; search
   covers the rest.
4. **Bilingual and RTL.** Everything mirrors properly in Arabic.
5. **Admin-editable.** Categories, fitment and content stay in the CMS.

---

## 1. Category taxonomy — every part of a car

Replace the six-category catalogue with a full auto-parts tree, two levels deep,
covering what an Egyptian parts shop actually sells:

| Top level | Sub-categories |
| --- | --- |
| Engine Oils & Fluids | Engine oil · Gearbox & transmission · Brake fluid · Coolant · Power steering · Additives |
| Filters | Oil · Air · Cabin · Fuel · Transmission |
| Batteries & Electrical | Batteries · Alternators · Starters · Bulbs & lighting · Fuses & relays · Sensors |
| Brakes | Pads · Discs & drums · Callipers · Brake hoses |
| Suspension & Steering | Shock absorbers · Springs · Control arms · Bushings · Steering racks |
| Engine Parts | Belts & chains · Spark & glow plugs · Gaskets · Pumps · Radiators & cooling |
| Transmission & Drivetrain | Clutch kits · CV joints & axles · Mounts |
| Tyres & Wheels | Tyres · Rims · Wheel accessories |
| Body & Exterior | Mirrors · Wipers · Lights & lenses · Trim |
| Interior & Accessories | Mats · Covers · Phone mounts · Chargers · Organisers |
| Car Care & Detailing | Shampoo · Wax & polish · Interior care · Tyre care · Tools |
| Tools & Garage | Hand tools · Jacks & stands · Diagnostics · Emergency |

Rules:
- Two levels only. Deeper trees confuse and hurt SEO.
- Each category carries an icon, image and display order, all admin-editable.
- Existing products are remapped onto the new tree; nothing is orphaned.

## 2. My Garage — the connection between the customer and the catalogue

**Data.** The existing `customers` → `vehicles` model stays exactly as it is.
Registered cars are the source of truth for a signed-in customer.

**Guests.** A guest can still pick a car; it is held in local storage and merged
into their account on sign-up. No forced registration to shop.

**The selector.** A persistent control in the header:
- Signed out or no cars → "Select your car"
- Selected → "2019 Toyota Corolla 1.6" with a change/remove control
- Picker: Brand → Model → Year → Engine, cascading, driven by the same
  `vehicleBrands` / `vehicleModels` data the Oil Finder already uses
- Signed-in customers pick from their registered cars in one tap, or add a new
  one, which saves to their garage

**What it changes once set:**
- Every listing gains a **"Fits your car"** badge on matching products
- A **"Only show parts that fit"** switch on listings, on by default once a car
  is selected
- Product pages show an explicit fitment banner: fits / does not fit / universal
- The Oil Finder pre-fills from the selected car
- The cart warns before checkout if an item does not fit the selected car

**Fitment rules:**
- `compatibleVehicles` empty → universal, always shown, no badge
- contains the selected model → "Fits your car"
- non-empty and no match → hidden while the filter is on, warning badge when off

## 3. Marketplace browsing

- **Mega-menu** — full taxonomy in a two-level flyout with icons, plus quick
  links to Oil Finder, Filter Lookup and Car Wash.
- **Listing page** — faceted filters (category, brand, price, availability,
  fitment), sort, grid/list toggle, result count, pagination, and empty states
  that offer a way forward rather than a dead end.
- **Search** — instant overlay already built; extended to respect the selected
  car and to show category suggestions.
- **Product page** — fitment banner, specification table, related and
  frequently-bought-together, delivery and warranty information.
- **Homepage** — search-first hero with the car selector directly in it, then
  category tiles, deals, and the Oil Finder call to action.

## 4. Simplicity guardrails

- Never show a part number where a plain-language name will do; keep the number
  as secondary detail.
- Every filter and switch has a visible label in both languages.
- Prices always include what the customer pays; delivery stated up front.
- Any dead end (no results, no fitment data, out of stock) offers a next step:
  contact on WhatsApp, notify me, or ask a technician.

## Definition of done

- Full taxonomy live, all products mapped, nothing orphaned.
- A guest can select a car in under five seconds and see the catalogue filtered.
- A signed-in customer's registered cars appear in the selector, and a car added
  during shopping is saved to their garage.
- "Fits your car" is correct on listings, search and product pages.
- Everything works in Arabic RTL and on a phone.
- `npm run build` clean; existing oil-engine assertions still pass.
