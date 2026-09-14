import Image from 'next/image'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import { Check, Clock, Mail, MapPin, Phone } from 'lucide-react'
import { Link } from '@/i18n/routing'
import type { SiteSetting } from '@/payload-types'
import { Button } from '@/components/ui/button'
import { Card, SectionHeading } from '@/components/ui/primitives'
import { Reveal, StaggerGroup, StaggerItem } from '@/components/motion/Reveal'
import { Accordion } from '@/components/ui/Accordion'
import { Lightbox } from '@/components/ui/Lightbox'
import { cn, mediaAlt, mediaUrl } from '@/lib/utils'
import { iconFor } from './sections'

type MediaLike = Parameters<typeof mediaUrl>[0]

export const PageHeroSection = ({
  eyebrow,
  heading,
  subheading,
  image,
  align = 'start',
}: {
  eyebrow?: string | null
  heading: string
  subheading?: string | null
  image?: MediaLike
  align?: string | null
}) => {
  const src = mediaUrl(image, 'hero')
  return (
    <section className="surface-dark relative isolate overflow-hidden">
      {src ? (
        <>
          <Image src={src} alt={mediaAlt(image)} fill priority sizes="100vw" className="-z-10 object-cover opacity-40" />
          <div className="absolute inset-0 -z-10 bg-gradient-to-t from-neutral-950 via-neutral-950/75 to-neutral-950/40" />
        </>
      ) : null}

      <div className="container-page relative py-20 lg:py-28">
        <Reveal className={cn('max-w-3xl', align === 'center' && 'mx-auto text-center')}>
          {eyebrow ? (
            <p className="mb-4 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-label uppercase text-primary-300 backdrop-blur">
              <span className="size-1.5 rounded-full bg-primary-400" />
              {eyebrow}
            </p>
          ) : null}
          <h1 className="text-h1 text-white sm:text-display">{heading}</h1>
          {subheading ? (
            <p className="mt-5 max-w-2xl text-body-lg leading-relaxed text-neutral-200">{subheading}</p>
          ) : null}
        </Reveal>
      </div>
    </section>
  )
}

export const ImageTextSection = ({
  eyebrow,
  heading,
  body,
  image,
  imageSide = 'end',
  bullets,
  buttonLabel,
  buttonHref,
}: {
  eyebrow?: string | null
  heading?: string | null
  body?: unknown
  image?: MediaLike
  imageSide?: string | null
  bullets?: { id?: string | null; text: string }[] | null
  buttonLabel?: string | null
  buttonHref?: string | null
}) => {
  const src = mediaUrl(image, 'tablet') ?? mediaUrl(image)
  return (
    <section className="container-page py-16 lg:py-24">
      <div className="grid items-center gap-10 lg:grid-cols-2 lg:gap-16">
        <Reveal className={cn(imageSide === 'start' && 'lg:order-2')}>
          {eyebrow ? (
            <p className="mb-3 text-label uppercase text-primary-dark">{eyebrow}</p>
          ) : null}
          {heading ? <h2 className="text-h2">{heading}</h2> : null}
          {body ? (
            <div className="prose prose-lg mt-5 max-w-none text-neutral-600">
              <RichText data={body as SerializedEditorState} />
            </div>
          ) : null}

          {bullets?.length ? (
            <ul className="mt-6 space-y-3">
              {bullets.map((bullet) => (
                <li key={bullet.id ?? bullet.text} className="flex items-start gap-3">
                  <span className="mt-0.5 grid size-5 shrink-0 place-items-center rounded-full bg-primary-light text-primary-dark">
                    <Check className="size-3" />
                  </span>
                  <span className="text-neutral-700">{bullet.text}</span>
                </li>
              ))}
            </ul>
          ) : null}

          {buttonLabel && buttonHref ? (
            <Button asChild className="mt-8">
              <Link href={buttonHref}>{buttonLabel}</Link>
            </Button>
          ) : null}
        </Reveal>

        {src ? (
          <Reveal delay={0.1} className={cn(imageSide === 'start' && 'lg:order-1')}>
            <div className="relative aspect-[4/3] overflow-hidden rounded-[var(--radius-card)] shadow-[var(--shadow-card)]">
              <Image
                src={src}
                alt={mediaAlt(image)}
                fill
                sizes="(max-width: 1024px) 100vw, 50vw"
                className="object-cover"
              />
            </div>
          </Reveal>
        ) : null}
      </div>
    </section>
  )
}

export const ValuesSection = ({
  heading,
  subheading,
  items,
}: {
  heading?: string | null
  subheading?: string | null
  items?: { id?: string | null; icon?: string | null; title: string; description?: string | null }[] | null
}) => {
  if (!items?.length) return null
  return (
    <section className="container-page py-16 lg:py-24">
      <SectionHeading title={heading} subtitle={subheading} align="center" />
      <StaggerGroup className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {items.map((item) => {
          const Icon = iconFor(item.icon)
          return (
            <StaggerItem key={item.id ?? item.title}>
              <Card className="h-full p-6">
                <div className="mb-5 grid size-12 place-items-center rounded-2xl bg-primary-light text-primary-dark">
                  <Icon className="size-5" />
                </div>
                <h3 className="text-h4">{item.title}</h3>
                {item.description ? (
                  <p className="mt-2 leading-relaxed text-neutral-500">{item.description}</p>
                ) : null}
              </Card>
            </StaggerItem>
          )
        })}
      </StaggerGroup>
    </section>
  )
}

export const StepsSection = ({
  heading,
  subheading,
  items,
}: {
  heading?: string | null
  subheading?: string | null
  items?: { id?: string | null; title: string; description?: string | null }[] | null
}) => {
  if (!items?.length) return null
  return (
    <section className="container-page py-16 lg:py-24">
      <SectionHeading title={heading} subtitle={subheading} />
      <StaggerGroup className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
        {items.map((item, index) => (
          <StaggerItem key={item.id ?? item.title}>
            <div className="relative">
              {/* Connector line, hidden on the last item and on small screens. */}
              {index < items.length - 1 ? (
                <span className="absolute top-6 hidden h-px w-full bg-gradient-to-r from-primary/40 to-transparent lg:block ltr:start-14 rtl:end-14" />
              ) : null}
              <span className="grid size-12 place-items-center rounded-full bg-primary text-h4 font-bold text-neutral-950">
                {index + 1}
              </span>
              <h3 className="mt-5 text-h4">{item.title}</h3>
              {item.description ? (
                <p className="mt-2 leading-relaxed text-neutral-500">{item.description}</p>
              ) : null}
            </div>
          </StaggerItem>
        ))}
      </StaggerGroup>
    </section>
  )
}

export const GallerySection = ({
  heading,
  images,
}: {
  heading?: string | null
  images?: MediaLike[] | null
}) => {
  const items = (images ?? [])
    .map((image) => ({ src: mediaUrl(image, 'card'), full: mediaUrl(image, 'tablet') ?? mediaUrl(image), alt: mediaAlt(image) }))
    .filter((item): item is { src: string; full: string; alt: string } => Boolean(item.src && item.full))

  if (!items.length) return null

  return (
    <section className="container-page py-16 lg:py-24">
      <SectionHeading title={heading} />
      <div className="mt-10">
        <Lightbox images={items} />
      </div>
    </section>
  )
}

export const FaqSection = ({
  heading,
  subheading,
  items,
}: {
  heading?: string | null
  subheading?: string | null
  items?: { id?: string | null; question: string; answer: string }[] | null
}) => {
  if (!items?.length) return null
  return (
    <section className="container-page py-16 lg:py-24">
      <div className="mx-auto max-w-3xl">
        <SectionHeading title={heading} subtitle={subheading} align="center" />
        <div className="mt-10">
          <Accordion items={items.map((item) => ({ id: String(item.id ?? item.question), question: item.question, answer: item.answer }))} />
        </div>
      </div>
      {/* FAQPage structured data — these answers can win a rich result. */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'FAQPage',
            mainEntity: items.map((item) => ({
              '@type': 'Question',
              name: item.question,
              acceptedAnswer: { '@type': 'Answer', text: item.answer },
            })),
          }).replace(/</g, '\\u003c'),
        }}
      />
    </section>
  )
}

export const ContactSection = ({
  heading,
  subheading,
  showMap = true,
  settings,
  locale,
}: {
  heading?: string | null
  subheading?: string | null
  showMap?: boolean | null
  settings: SiteSetting | null
  locale: string
}) => {
  const branches = settings?.branches ?? []

  return (
    <section className="container-page py-16 lg:py-24">
      <SectionHeading title={heading} subtitle={subheading} />

      <div className="mt-12 grid gap-6 lg:grid-cols-3">
        <Card className="p-6">
          <h3 className="text-h4">{locale === 'ar' ? 'اتصل بنا' : 'Talk to us'}</h3>
          <ul className="mt-5 space-y-4 text-body-sm">
            {settings?.phone ? (
              <li>
                <a href={`tel:${settings.phone}`} className="flex items-center gap-3 text-neutral-700 hover:text-primary-dark">
                  <span className="grid size-10 place-items-center rounded-full bg-primary-light text-primary-dark">
                    <Phone className="size-4" />
                  </span>
                  <span dir="ltr">{settings.phone}</span>
                </a>
              </li>
            ) : null}
            {settings?.whatsappNumber ? (
              <li>
                <a
                  href={`https://wa.me/${settings.whatsappNumber}`}
                  target="_blank"
                  rel="noreferrer noopener"
                  className="flex items-center gap-3 text-neutral-700 hover:text-primary-dark"
                >
                  <span className="grid size-10 place-items-center rounded-full bg-success-light text-success">
                    <Phone className="size-4" />
                  </span>
                  WhatsApp
                </a>
              </li>
            ) : null}
            {settings?.email ? (
              <li>
                <a href={`mailto:${settings.email}`} className="flex items-center gap-3 text-neutral-700 hover:text-primary-dark">
                  <span className="grid size-10 place-items-center rounded-full bg-primary-light text-primary-dark">
                    <Mail className="size-4" />
                  </span>
                  {settings.email}
                </a>
              </li>
            ) : null}
          </ul>

          {settings?.openingHours?.length ? (
            <>
              <h3 className="mt-8 text-h4">{locale === 'ar' ? 'مواعيد العمل' : 'Opening hours'}</h3>
              <ul className="mt-4 space-y-2 text-body-sm">
                {settings.openingHours.map((entry) => (
                  <li key={entry.id ?? entry.days} className="flex items-center justify-between gap-4">
                    <span className="flex items-center gap-2 text-neutral-600">
                      <Clock className="size-3.5 text-neutral-400" />
                      {entry.days}
                    </span>
                    <span className="text-neutral-500" dir="ltr">
                      {entry.hours}
                    </span>
                  </li>
                ))}
              </ul>
            </>
          ) : null}
        </Card>

        <div className="grid gap-6 lg:col-span-2 lg:grid-cols-2">
          {branches.map((branch) => (
            <Card key={branch.id ?? branch.name} className="flex flex-col overflow-hidden">
              {showMap && branch.latitude && branch.longitude ? (
                <iframe
                  title={branch.name}
                  loading="lazy"
                  className="h-44 w-full border-0"
                  referrerPolicy="no-referrer-when-downgrade"
                  src={`https://www.openstreetmap.org/export/embed.html?bbox=${branch.longitude - 0.01}%2C${
                    branch.latitude - 0.008
                  }%2C${branch.longitude + 0.01}%2C${branch.latitude + 0.008}&layer=mapnik&marker=${branch.latitude}%2C${
                    branch.longitude
                  }`}
                />
              ) : null}
              <div className="flex-1 p-6">
                <h3 className="text-h4">{branch.name}</h3>
                <p className="mt-2 flex items-start gap-2 text-body-sm text-neutral-500">
                  <MapPin className="mt-0.5 size-4 shrink-0 text-primary-dark" />
                  {branch.address}
                </p>
                <div className="mt-4 flex flex-wrap gap-2">
                  {branch.phone ? (
                    <Button asChild size="sm" variant="outline">
                      <a href={`tel:${branch.phone}`} dir="ltr">
                        {branch.phone}
                      </a>
                    </Button>
                  ) : null}
                  {branch.mapUrl ? (
                    <Button asChild size="sm" variant="ghost">
                      <a href={branch.mapUrl} target="_blank" rel="noreferrer noopener">
                        {locale === 'ar' ? 'الاتجاهات' : 'Directions'}
                      </a>
                    </Button>
                  ) : null}
                </div>
              </div>
            </Card>
          ))}
        </div>
      </div>
    </section>
  )
}

export const CtaBandSection = ({
  heading,
  body,
  image,
  buttons,
}: {
  heading: string
  body?: string | null
  image?: MediaLike
  buttons?: { id?: string | null; label: string; href: string; style?: string | null }[] | null
}) => {
  const src = mediaUrl(image, 'hero')
  return (
    <section className="container-page py-10 lg:py-16">
      <Reveal className="surface-dark relative isolate overflow-hidden rounded-[2rem]">
        {src ? (
          <>
            <Image src={src} alt="" fill sizes="100vw" className="-z-10 object-cover opacity-25" />
            <div className="absolute inset-0 -z-10 bg-neutral-950/50" />
          </>
        ) : null}
        <div className="px-8 py-14 text-center sm:px-12 lg:py-20">
          <h2 className="mx-auto max-w-2xl text-h2 text-white">{heading}</h2>
          {body ? <p className="mx-auto mt-4 max-w-xl leading-relaxed text-neutral-200">{body}</p> : null}
          {buttons?.length ? (
            <div className="mt-9 flex flex-wrap justify-center gap-3">
              {buttons.map((button, index) => (
                <Button
                  key={button.id ?? `${button.href}-${index}`}
                  asChild
                  size="lg"
                  variant={
                    button.style === 'outline' ? 'outlineInverted' : button.style === 'primary' ? 'primary' : 'accent'
                  }
                >
                  <Link href={button.href}>{button.label}</Link>
                </Button>
              ))}
            </div>
          ) : null}
        </div>
      </Reveal>
    </section>
  )
}
