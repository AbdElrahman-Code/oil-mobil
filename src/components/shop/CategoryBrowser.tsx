import { ArrowRight } from 'lucide-react'
import { Link } from '@/i18n/routing'
import type { CategoryNode } from '@/lib/payload'
import { categoryStyle, categoryTheme } from '@/lib/category-theme'
import { Reveal } from '@/components/motion/Reveal'

/**
 * The whole catalogue on one screen. Each section carries its own colour, so
 * the aisles are recognisable at a glance and a customer can find a part by
 * reading rather than guessing what to type into a search box.
 */
export const CategoryBrowser = ({ tree, compact = false }: { tree: CategoryNode[]; compact?: boolean }) => (
  <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
    {tree.map((category, index) => {
      const { Icon } = categoryTheme(category.slug)
      return (
        <Reveal key={category.id} delay={Math.min(index * 0.04, 0.24)}>
          <div
            style={categoryStyle(category.slug)}
            className="group relative flex h-full flex-col overflow-hidden rounded-[1.5rem] border border-neutral-200 bg-white p-5 transition-all duration-300 hover:-translate-y-1 hover:border-[var(--cat)] hover:shadow-[var(--shadow-lift)]"
          >
            {/* Colour wash that grows on hover — the section's own hue. */}
            <span
              aria-hidden
              className="pointer-events-none absolute -end-10 -top-10 size-32 rounded-full bg-[var(--cat-soft)] transition-transform duration-500 ease-[var(--ease-out-expo)] group-hover:scale-150"
            />

            <Link href={`/shop/${category.slug}`} className="relative flex items-center gap-3">
              <span className="grid size-12 shrink-0 place-items-center rounded-2xl bg-[var(--cat)] text-white shadow-[0_8px_18px_-8px_var(--cat)]">
                <Icon className="size-6" />
              </span>
              <span className="text-h4 text-neutral-950 transition-colors group-hover:text-[var(--cat-ink)]">
                {category.name}
              </span>
            </Link>

            {category.children.length && !compact ? (
              <ul className="relative mt-4 space-y-0.5">
                {category.children.map((child) => (
                  <li key={child.id}>
                    <Link
                      href={`/shop/${child.slug}`}
                      className="-mx-2 block rounded-lg px-2 py-1.5 text-body-sm text-neutral-600 transition-colors hover:bg-[var(--cat-soft)] hover:text-[var(--cat-ink)]"
                    >
                      {child.name}
                    </Link>
                  </li>
                ))}
              </ul>
            ) : null}

            <Link
              href={`/shop/${category.slug}`}
              className="relative mt-auto inline-flex items-center gap-1.5 pt-4 text-body-sm font-semibold text-[var(--cat-ink)]"
            >
              <span className="border-b border-transparent transition-colors group-hover:border-current">
                {category.name}
              </span>
              <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5 rtl:rotate-180 rtl:group-hover:-translate-x-0.5" />
            </Link>
          </div>
        </Reveal>
      )
    })}
  </div>
)
