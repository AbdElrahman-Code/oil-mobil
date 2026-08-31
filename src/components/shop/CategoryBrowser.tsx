import { Battery, Car, Droplet, Filter as FilterIcon, Package, Sparkles, Wrench } from 'lucide-react'
import { Link } from '@/i18n/routing'
import type { CategoryNode } from '@/lib/payload'
import { Reveal } from '@/components/motion/Reveal'

const icons = {
  droplet: Droplet,
  filter: FilterIcon,
  battery: Battery,
  sparkles: Sparkles,
  wrench: Wrench,
  car: Car,
  package: Package,
} as const

/**
 * The whole catalogue on one screen: every section with its sub-categories
 * listed underneath, so a customer can find the part they need by reading
 * rather than by guessing what to search for.
 */
export const CategoryBrowser = ({ tree }: { tree: CategoryNode[] }) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {tree.map((category, index) => {
      const Icon = icons[(category.icon ?? 'package') as keyof typeof icons] ?? Package
      return (
        <Reveal key={category.id} delay={Math.min(index * 0.04, 0.24)}>
          <div className="flex h-full flex-col rounded-[var(--radius-card)] border border-neutral-200 bg-white p-5 transition-all duration-300 hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-lift)]">
            <Link href={`/shop/${category.slug}`} className="flex items-center gap-3">
              <span className="grid size-11 shrink-0 place-items-center rounded-2xl bg-primary-light text-primary">
                <Icon className="size-5" />
              </span>
              <span className="text-h4 hover:text-primary">{category.name}</span>
            </Link>

            {category.children.length ? (
              <ul className="mt-4 space-y-1">
                {category.children.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/shop/${child.slug}`}
                      className="-mx-2 block rounded-lg px-2 py-1.5 text-body-sm text-neutral-600 transition-colors hover:bg-neutral-100 hover:text-primary"
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}
          </div>
        </Reveal>
      )
    })}
  </div>
)
