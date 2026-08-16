import Image from 'next/image'
import {
  Battery,
  Car,
  Clock,
  Droplet,
  Filter as FilterIcon,
  Package,
  ShieldCheck,
  Sparkles,
  Star,
  Truck,
  Wrench,
} from 'lucide-react'
import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import type { Locale } from '@/i18n/routing'
import type { Product, ProductCategory } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { Card, SectionHeading } from '@/components/ui/primitives'
import { ProductCard } from '@/components/shop/ProductCard'
import { Reveal, StaggerGroup, StaggerItem } from '@/components/motion/Reveal'
import { CountUp } from '@/components/motion/CountUp'
import { Marquee } from '@/components/motion/Marquee'
import { cn, mediaUrl } from '@/lib/utils'

const icons = {
  droplet: Droplet,
  filter: FilterIcon,
  battery: Battery,
  sparkles: Sparkles,
  wrench: Wrench,
  shield: ShieldCheck,
  clock: Clock,
  truck: Truck,
  car: Car,
  package: Package,
} as const

export const iconFor = (name?: string | null) => icons[(name ?? 'droplet') as keyof typeof icons] ?? Droplet

export const ServicesSection = ({
  heading,
  subheading,
  items,
}: {
  heading?: string | null
  subheading?: string | null
  items?: { id?: string | null; title: string; description?: string | null; icon?: string | null; href?: string | null }[]
}) => {
  if (!items?.length) return null
  return (
    <section className="container-page py-20 lg:py-28">
      <SectionHeading title={heading} subtitle={subheading} />
      <StaggerGroup className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:mt-12 lg:grid-cols-4">
        {items.map((item) => {
          const Icon = iconFor(item.icon)
          const content = (
            <Card className="group h-full p-6 transition-all duration-300 hover:-translate-y-1 hover:border-neutral-300 hover:shadow-[var(--shadow-lift)]">
              <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-primary-50 text-primary-600 transition-colors group-hover:bg-primary-500 group-hover:text-white">
                <Icon className="size-5" />
              </div>
              <h3 className="text-body font-semibold text-neutral-950">{item.title}</h3>
              {item.description ? (
                <p className="mt-2 text-body-sm leading-relaxed text-neutral-400">{item.description}</p>
              ) : null}
            </Card>
          )
          return (
            <StaggerItem key={item.id ?? item.title}>
              {item.href ? <Link href={item.href}>{content}</Link> : content}
            </StaggerItem>
          )
        })}
      </StaggerGroup>
    </section>
  )
}

export const CategoriesSection = ({
  heading,
  subheading,
  categories,
}: {
  heading?: string | null
  subheading?: string | null
  categories: ProductCategory[]
}) => {
  if (!categories.length) return null
  return (
    <section className="container-page py-20 lg:py-28">
      <SectionHeading title={heading} subtitle={subheading} />
      <StaggerGroup className="mt-10 grid gap-3 sm:grid-cols-2 sm:gap-4 lg:mt-12 lg:grid-cols-3">
        {categories.map((category) => {
          const Icon = iconFor(category.icon)
          const image = mediaUrl(category.image, 'card')
          return (
            <StaggerItem key={category.id}>
              <Link
                href={`/shop/${category.slug}`}
                className="group relative flex h-52 flex-col justify-end overflow-hidden rounded-[var(--radius-card)] bg-neutral-900 p-6 text-white"
              >
                {image ? (
                  <Image
                    src={image}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover opacity-55 transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105"
                  />
                ) : null}
                <div className="absolute inset-0 bg-gradient-to-t from-neutral-950 via-neutral-950/40 to-transparent" />
                <div className="relative">
                  <Icon className="mb-3 size-6 text-primary-400" />
                  <h3 className="text-h4 font-semibold">{category.name}</h3>
                  {category.description ? (
                    <p className="mt-1 line-clamp-2 text-body-sm text-neutral-200">{category.description}</p>
                  ) : null}
                </div>
              </Link>
            </StaggerItem>
          )
        })}
      </StaggerGroup>
    </section>
  )
}

export const FeaturedProductsSection = async ({
  locale,
  heading,
  subheading,
  products,
  ctaHref,
}: {
  locale: Locale
  heading?: string | null
  subheading?: string | null
  products: Product[]
  ctaHref?: string | null
}) => {
  if (!products.length) return null
  const t = await getTranslations({ locale, namespace: 'common' })

  return (
    <section className="container-page py-20 lg:py-28">
      <div className="flex flex-wrap items-end justify-between gap-6">
        <SectionHeading title={heading} subtitle={subheading} />
        {ctaHref ? (
          <Button asChild variant="outline">
            <Link href={ctaHref}>{t('viewAll')}</Link>
          </Button>
        ) : null}
      </div>
      <div className="mt-10 grid grid-cols-2 gap-3 sm:gap-4 lg:mt-12 lg:grid-cols-4">
        {products.map((product, index) => (
          <ProductCard key={product.id} product={product} index={index} />
        ))}
      </div>
    </section>
  )
}

export const OilFinderCtaSection = ({
  heading,
  body,
  buttonLabel,
  imageUrl,
}: {
  heading?: string | null
  body?: string | null
  buttonLabel?: string | null
  imageUrl?: string | null
}) => (
  <section className="container-page py-8 lg:py-12">
    <Reveal className="surface-dark relative isolate overflow-hidden rounded-[2rem]">
      <div className="grid items-center gap-10 p-8 sm:p-12 lg:grid-cols-2 lg:p-16">
        <div>
          <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 px-3.5 py-1.5 text-label font-semibold uppercase tracking-[0.18em] text-primary-300">
            <Droplet className="size-3.5" />
            Oil Finder
          </p>
          <h2 className="text-h2 text-white">{heading}</h2>
          {body ? <p className="mt-4 max-w-md leading-relaxed text-neutral-200">{body}</p> : null}
          <Button asChild size="lg" className="mt-8">
            <Link href="/oil-finder">{buttonLabel || 'Start'}</Link>
          </Button>
        </div>
        {imageUrl ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image src={imageUrl} alt="" fill sizes="(max-width: 1024px) 100vw, 50vw" className="object-cover" />
          </div>
        ) : null}
      </div>
    </Reveal>
  </section>
)

export const PromoBannerSection = ({
  heading,
  body,
  buttonLabel,
  buttonHref,
  imageUrl,
  theme = 'accent',
}: {
  heading: string
  body?: string | null
  buttonLabel?: string | null
  buttonHref?: string | null
  imageUrl?: string | null
  theme?: string | null
}) => (
  <section className="container-page py-8 lg:py-12">
    <Reveal
      className={cn(
        'relative isolate overflow-hidden rounded-[2rem]',
        theme === 'accent' && 'bg-primary-500 text-white',
        theme === 'dark' && 'surface-dark',
        theme === 'light' && 'border border-neutral-200 bg-white',
      )}
    >
      <div className="grid items-center gap-8 p-8 sm:p-12 lg:grid-cols-[1.2fr_1fr]">
        <div>
          <h2 className={cn('text-h2', theme === 'light' ? 'text-neutral-950' : 'text-white')}>
            {heading}
          </h2>
          {body ? (
            <p className={cn('mt-4 max-w-lg leading-relaxed', theme === 'light' ? 'text-neutral-400' : 'text-white/85')}>
              {body}
            </p>
          ) : null}
          {buttonLabel && buttonHref ? (
            <Button
              asChild
              size="lg"
              variant={theme === 'light' ? 'primary' : theme === 'accent' ? 'dark' : 'primary'}
              className="mt-8"
            >
              <Link href={buttonHref}>{buttonLabel}</Link>
            </Button>
          ) : null}
        </div>
        {imageUrl ? (
          <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
            <Image src={imageUrl} alt="" fill sizes="(max-width: 1024px) 100vw, 40vw" className="object-cover" />
          </div>
        ) : null}
      </div>
    </Reveal>
  </section>
)

export const StatsSection = ({ items }: { items?: { id?: string | null; value: string; label: string }[] }) => {
  if (!items?.length) return null
  return (
    <section className="container-page py-16">
      <StaggerGroup className="grid gap-6 rounded-[var(--radius-card)] border border-neutral-200 bg-white p-8 sm:grid-cols-2 lg:grid-cols-4 lg:p-12">
        {items.map((item) => (
          <StaggerItem key={item.id ?? item.label} className="text-center">
            <p className="font-[family-name:var(--font-display)] text-h1 font-bold text-primary lg:text-display">
              <CountUp value={item.value} />
            </p>
            <p className="mt-2 text-body-sm text-neutral-400">{item.label}</p>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  )
}

export const TestimonialsSection = ({
  heading,
  items,
}: {
  heading?: string | null
  items?: { id?: string | null; quote: string; author: string; carModel?: string | null; rating?: number | null }[]
}) => {
  if (!items?.length) return null
  return (
    <section className="container-page py-20 lg:py-28">
      <SectionHeading title={heading} align="center" />
      <StaggerGroup className="mt-12 grid gap-4 lg:grid-cols-3">
        {items.map((item) => (
          <StaggerItem key={item.id ?? item.author}>
            <Card className="flex h-full flex-col p-6">
              <div className="mb-4 flex gap-0.5">
                {Array.from({ length: item.rating ?? 5 }).map((_, index) => (
                  <Star key={index} className="size-4 fill-warning text-warning" />
                ))}
              </div>
              <p className="flex-1 leading-relaxed text-neutral-700">“{item.quote}”</p>
              <div className="mt-6 border-t border-neutral-200 pt-4">
                <p className="text-body-sm font-semibold text-neutral-950">{item.author}</p>
                {item.carModel ? <p className="text-body-sm text-neutral-400">{item.carModel}</p> : null}
              </div>
            </Card>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  )
}

export const BrandLogosSection = ({
  heading,
  logos,
}: {
  heading?: string | null
  logos?: { id?: string | null; image: unknown; name?: string | null }[]
}) => {
  if (!logos?.length) return null
  return (
    <section className="container-page py-16">
      {heading ? (
        <p className="mb-8 text-center text-label font-semibold uppercase tracking-[0.18em] text-neutral-400">
          {heading}
        </p>
      ) : null}
      <Marquee>
        {logos.map((logo, index) => {
          const src = mediaUrl(logo.image as never, 'thumbnail')
          if (!src) return null
          return (
            <Image
              key={logo.id ?? index}
              src={src}
              alt={logo.name ?? ''}
              width={120}
              height={48}
              className="h-10 w-auto opacity-50 grayscale transition-all duration-300 hover:opacity-100 hover:grayscale-0"
            />
          )
        })}
      </Marquee>
    </section>
  )
}
