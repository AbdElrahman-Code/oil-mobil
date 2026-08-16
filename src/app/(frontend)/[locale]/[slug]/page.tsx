import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import type { Locale } from '@/i18n/routing'
import { getPage, getPages, getSiteSettings } from '@/lib/payload'
import { RenderPageBlocks } from '@/components/blocks/RenderPageBlocks'
import { mediaUrl } from '@/lib/utils'

export const revalidate = 600

export async function generateStaticParams() {
  const pages = await getPages('en')
  return pages.map((page) => ({ slug: page.slug as string }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const page = await getPage(slug, locale)
  if (!page) return {}

  const image = mediaUrl(page.ogImage, 'hero')
  return {
    title: page.metaTitle || page.title,
    description: page.metaDescription ?? undefined,
    openGraph: image ? { images: [{ url: image }] } : undefined,
  }
}

export default async function CmsPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const [page, settings] = await Promise.all([getPage(slug, locale), getSiteSettings(locale)])
  if (!page) notFound()

  return <RenderPageBlocks sections={page.sections} locale={locale} settings={settings} />
}
