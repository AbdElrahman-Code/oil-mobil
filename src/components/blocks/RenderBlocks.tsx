import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { Homepage, Product, ProductCategory } from '@/payload-types'
import type { Locale } from '@/i18n/routing'
import { getCategories, getFeaturedProducts, getProductsByIds } from '@/lib/payload'
import { mediaAlt, mediaUrl, relId } from '@/lib/utils'
import { HeroSection } from './HeroSection'
import {
  BrandLogosSection,
  CategoriesSection,
  FeaturedProductsSection,
  PromoBannerSection,
  ServicesSection,
  StatsSection,
  TestimonialsSection,
} from './sections'

type Section = NonNullable<Homepage['sections']>[number]

const resolveCategories = async (
  locale: Locale,
  picked: Section extends { categories?: infer C } ? C : never,
): Promise<ProductCategory[]> => {
  const explicit = (picked as unknown[] | null | undefined)?.filter(
    (item): item is ProductCategory => typeof item === 'object' && item !== null,
  )
  if (explicit?.length) return explicit
  const all = await getCategories(locale)
  return all.filter((category) => category.showOnHomepage)
}

export const RenderBlocks = async ({
  sections,
  locale,
}: {
  sections?: Homepage['sections']
  locale: Locale
}) => {
  if (!sections?.length) return null

  const rendered = await Promise.all(
    sections.map(async (section, index) => {
      const key = `${section.blockType}-${section.id ?? index}`

      switch (section.blockType) {
        case 'hero':
          return (
            <HeroSection
              key={key}
              eyebrow={section.eyebrow}
              headline={section.headline}
              subheadline={section.subheadline}
              imageUrl={mediaUrl(section.backgroundImage, 'hero')}
              imageAlt={mediaAlt(section.backgroundImage)}
              buttons={section.buttons?.map((button) => ({
                id: button.id,
                label: button.label,
                href: button.href,
                style: button.style,
              }))}
            />
          )

        case 'services':
          return (
            <ServicesSection
              key={key}
              heading={section.heading}
              subheading={section.subheading}
              items={section.items ?? []}
            />
          )

        case 'featuredCategories':
          return (
            <CategoriesSection
              key={key}
              heading={section.heading}
              subheading={section.subheading}
              categories={await resolveCategories(locale, section.categories as never)}
            />
          )

        case 'featuredProducts': {
          const limit = section.limit ?? 8
          let products: Product[] = []
          if (section.source === 'manual') {
            const ids = (section.products ?? [])
              .map((product) => relId(product))
              .filter((id): id is number => id !== null)
            products = await getProductsByIds(locale, ids.slice(0, limit))
          } else {
            products = await getFeaturedProducts(locale, limit, section.source === 'newest' ? 'newest' : 'featured')
          }
          return (
            <FeaturedProductsSection
              key={key}
              locale={locale}
              heading={section.heading}
              subheading={section.subheading}
              products={products}
              ctaHref={section.ctaHref}
            />
          )
        }

        case 'promoBanner':
          return (
            <PromoBannerSection
              key={key}
              heading={section.heading}
              body={section.body}
              buttonLabel={section.buttonLabel}
              buttonHref={section.buttonHref}
              imageUrl={mediaUrl(section.image, 'card')}
              theme={section.theme}
            />
          )

        case 'stats':
          return <StatsSection key={key} items={section.items ?? []} />

        case 'testimonials':
          return <TestimonialsSection key={key} heading={section.heading} items={section.items ?? []} />

        case 'brandLogos':
          return <BrandLogosSection key={key} heading={section.heading} logos={section.logos ?? []} />

        case 'richText':
          return (
            <section key={key} className="container-page py-16">
              <div
                className={
                  section.width === 'full'
                    ? 'prose prose-lg max-w-none'
                    : 'prose prose-lg mx-auto max-w-3xl'
                }
              >
                <RichText data={section.content as SerializedEditorState} />
              </div>
            </section>
          )

        default:
          return null
      }
    }),
  )

  return <>{rendered}</>
}
