import type { Page, SiteSetting } from '@/payload-types'
import type { Locale } from '@/i18n/routing'
import { RenderBlocks } from './RenderBlocks'
import {
  ContactSection,
  CtaBandSection,
  FaqSection,
  GallerySection,
  ImageTextSection,
  PageHeroSection,
  StepsSection,
  ValuesSection,
} from './page-sections'

type Section = NonNullable<Page['sections']>[number]

/**
 * Renders a CMS page. Page-specific sections are handled here; anything the
 * homepage also uses is delegated to RenderBlocks so there is one implementation
 * of each shared section.
 */
export const RenderPageBlocks = async ({
  sections,
  locale,
  settings,
}: {
  sections?: Page['sections']
  locale: Locale
  settings: SiteSetting | null
}) => {
  if (!sections?.length) return null

  const rendered = await Promise.all(
    sections.map(async (section: Section, index) => {
      const key = `${section.blockType}-${section.id ?? index}`

      switch (section.blockType) {
        case 'pageHero':
          return (
            <PageHeroSection
              key={key}
              eyebrow={section.eyebrow}
              heading={section.heading}
              subheading={section.subheading}
              image={section.backgroundImage}
              align={section.align}
            />
          )

        case 'imageText':
          return (
            <ImageTextSection
              key={key}
              eyebrow={section.eyebrow}
              heading={section.heading}
              body={section.body}
              image={section.image}
              imageSide={section.imageSide}
              bullets={section.bullets}
              buttonLabel={section.buttonLabel}
              buttonHref={section.buttonHref}
            />
          )

        case 'values':
          return (
            <ValuesSection
              key={key}
              heading={section.heading}
              subheading={section.subheading}
              items={section.items}
            />
          )

        case 'steps':
          return (
            <StepsSection
              key={key}
              heading={section.heading}
              subheading={section.subheading}
              items={section.items}
            />
          )

        case 'gallery':
          return <GallerySection key={key} heading={section.heading} images={section.images} />

        case 'faq':
          return (
            <FaqSection
              key={key}
              heading={section.heading}
              subheading={section.subheading}
              items={section.items}
            />
          )

        case 'contact':
          return (
            <ContactSection
              key={key}
              heading={section.heading}
              subheading={section.subheading}
              showMap={section.showMap}
              settings={settings}
              locale={locale}
            />
          )

        case 'ctaBand':
          return (
            <CtaBandSection
              key={key}
              heading={section.heading}
              body={section.body}
              image={section.backgroundImage}
              buttons={section.buttons}
            />
          )

        default:
          // Shared homepage sections (hero, products, stats, testimonials…).
          return (
            <RenderBlocks
              key={key}
              locale={locale}
              sections={[section] as never}
            />
          )
      }
    }),
  )

  return <>{rendered}</>
}
