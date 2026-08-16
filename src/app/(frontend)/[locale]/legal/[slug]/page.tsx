import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { setRequestLocale } from 'next-intl/server'
import { RichText } from '@payloadcms/richtext-lexical/react'
import type { SerializedEditorState } from '@payloadcms/richtext-lexical/lexical'
import type { Locale } from '@/i18n/routing'
import { getLegalPage, getLegalPages } from '@/lib/payload'
import { formatDate } from '@/lib/utils'

export const revalidate = 3600

export async function generateStaticParams() {
  const pages = await getLegalPages('en')
  return pages.map((page) => ({ slug: page.slug as string }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}): Promise<Metadata> {
  const { locale, slug } = await params
  const page = await getLegalPage(slug, locale)
  return { title: page?.title, robots: { index: true } }
}

export default async function LegalPage({
  params,
}: {
  params: Promise<{ locale: Locale; slug: string }>
}) {
  const { locale, slug } = await params
  setRequestLocale(locale)

  const page = await getLegalPage(slug, locale)
  if (!page) notFound()

  return (
    <article className="container-page py-12 lg:py-20">
      <header className="mx-auto max-w-3xl">
        <h1 className="text-h1">{page.title}</h1>
        {page.lastReviewed ? (
          <p className="mt-3 text-body-sm text-neutral-400">
            {locale === 'ar' ? 'آخر تحديث' : 'Last updated'}: {formatDate(page.lastReviewed, locale)}
          </p>
        ) : null}
      </header>

      <div className="prose prose-lg mx-auto mt-10 max-w-3xl">
        <RichText data={page.content as SerializedEditorState} />
      </div>
    </article>
  )
}
