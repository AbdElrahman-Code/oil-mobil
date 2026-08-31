import { Battery, Car, Droplet, Filter, Package, Sparkles, Wrench, type LucideIcon } from 'lucide-react'

/**
 * Each section of the catalogue gets its own colour and icon, so the shop reads
 * as colourful rather than uniform and customers learn the aisles by sight.
 * Keyed by slug, with a sensible fallback for anything the admin adds later.
 */
export type CategoryTheme = {
  /** CSS variable names from globals.css — never raw hex in components. */
  color: string
  soft: string
  ink: string
  Icon: LucideIcon
}

const themes: Record<string, CategoryTheme> = {
  'oils-fluids': { color: '--color-cat-oil', soft: '--color-cat-oil-soft', ink: '--color-cat-oil-ink', Icon: Droplet },
  filters: { color: '--color-cat-filter', soft: '--color-cat-filter-soft', ink: '--color-cat-filter-ink', Icon: Filter },
  'batteries-electrical': { color: '--color-cat-battery', soft: '--color-cat-battery-soft', ink: '--color-cat-battery-ink', Icon: Battery },
  brakes: { color: '--color-cat-brake', soft: '--color-cat-brake-soft', ink: '--color-cat-brake-ink', Icon: Wrench },
  'suspension-steering': { color: '--color-cat-suspension', soft: '--color-cat-suspension-soft', ink: '--color-cat-suspension-ink', Icon: Car },
  'engine-parts': { color: '--color-cat-engine', soft: '--color-cat-engine-soft', ink: '--color-cat-engine-ink', Icon: Wrench },
  transmission: { color: '--color-cat-transmission', soft: '--color-cat-transmission-soft', ink: '--color-cat-transmission-ink', Icon: Car },
  'tyres-wheels': { color: '--color-cat-tyre', soft: '--color-cat-tyre-soft', ink: '--color-cat-tyre-ink', Icon: Car },
  'body-exterior': { color: '--color-cat-body', soft: '--color-cat-body-soft', ink: '--color-cat-body-ink', Icon: Car },
  'interior-accessories': { color: '--color-cat-interior', soft: '--color-cat-interior-soft', ink: '--color-cat-interior-ink', Icon: Package },
  'car-care': { color: '--color-cat-care', soft: '--color-cat-care-soft', ink: '--color-cat-care-ink', Icon: Sparkles },
  'tools-garage': { color: '--color-cat-tools', soft: '--color-cat-tools-soft', ink: '--color-cat-tools-ink', Icon: Wrench },
}

const fallback: CategoryTheme = {
  color: '--color-primary',
  soft: '--color-primary-light',
  ink: '--color-primary-dark',
  Icon: Package,
}

export const categoryTheme = (slug?: string | null): CategoryTheme =>
  (slug ? themes[slug] : undefined) ?? fallback

/** Inline style bag so a component can theme itself from one call. */
export const categoryStyle = (slug?: string | null) => {
  const theme = categoryTheme(slug)
  return {
    ['--cat' as string]: `var(${theme.color})`,
    ['--cat-soft' as string]: `var(${theme.soft})`,
    ['--cat-ink' as string]: `var(${theme.ink})`,
  } as React.CSSProperties
}
