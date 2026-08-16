/**
 * Builds the About, Contact and FAQ pages, sources their imagery, and links
 * them from the header and footer menus.
 *
 *   npx tsx src/seed/content.ts
 *
 * Re-runnable: existing pages are updated in place rather than duplicated.
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { sourcePhoto } from './images'
import { aboutContent, contactContent, faqContent, pageMeta } from './pages'

type Payload = Awaited<ReturnType<typeof getPayload>>

const richText = (paragraphs: string[]) => ({
  root: {
    type: 'root',
    format: '' as const,
    indent: 0,
    version: 1,
    direction: 'ltr' as const,
    children: paragraphs.map((text) => ({
      type: 'paragraph',
      format: '' as const,
      indent: 0,
      version: 1,
      direction: 'ltr' as const,
      textFormat: 0,
      children: [{ type: 'text', text, format: 0, style: '', mode: 'normal', detail: 0, version: 1 }],
    })),
  },
})

const upload = async (
  payload: Payload,
  { query, pick, title, altEn, altAr }: { query: string; pick: number; title: string; altEn: string; altAr: string },
): Promise<number> => {
  const photo = await sourcePhoto(query, { kind: 'hero', title }, pick)
  const doc = await payload.create({
    collection: 'media',
    locale: 'en',
    data: { alt: altEn, credit: photo.credit ?? undefined },
    file: { data: photo.buffer, mimetype: photo.mimetype, name: photo.filename, size: photo.buffer.length },
    overrideAccess: true,
  })
  await payload.update({
    collection: 'media',
    id: doc.id,
    locale: 'ar',
    data: { alt: altAr },
    overrideAccess: true,
  })
  console.log(`   image: ${title} ${photo.credit ? '(photo)' : '(generated)'}`)
  return doc.id
}

const upsertPage = async (
  payload: Payload,
  slug: string,
  enData: Record<string, unknown>,
  arData: Record<string, unknown>,
) => {
  const existing = await payload.find({
    collection: 'pages',
    where: { slug: { equals: slug } },
    limit: 1,
    overrideAccess: true,
  })

  // Drafts are enabled on this collection, so seeded pages are published
  // explicitly — otherwise they would never appear on the site.
  const published = { ...enData, _status: 'published' } as never

  const doc = existing.docs[0]
    ? await payload.update({
        collection: 'pages',
        id: existing.docs[0].id,
        locale: 'en',
        draft: false,
        data: published,
        overrideAccess: true,
      })
    : await payload.create({
        collection: 'pages',
        locale: 'en',
        draft: false,
        data: published,
        overrideAccess: true,
      })

  await payload.update({
    collection: 'pages',
    id: doc.id,
    locale: 'ar',
    draft: false,
    data: { ...arData, _status: 'published' } as never,
    overrideAccess: true,
  })

  console.log(`→ page: /${slug}`)
  return doc.id
}

const run = async () => {
  const payload = await getPayload({ config })

  console.log('→ sourcing page imagery')
  // Wikimedia throttles bursts, so these are fetched one at a time — nine
  // parallel requests mostly came back empty and fell through to generated art.
  const imageQueue = [
    { query: 'auto repair workshop interior', title: 'About hero', altEn: 'Inside the service centre workshop', altAr: 'داخل ورشة مركز الخدمة' },
    { query: 'mechanic working on car engine', title: 'Our story', altEn: 'A technician working on an engine', altAr: 'فني أثناء العمل على محرك' },
    { query: 'car service reception', title: 'Contact hero', altEn: 'The service centre reception', altAr: 'استقبال مركز الخدمة' },
    { query: 'car engine bay', title: 'FAQ hero', altEn: 'Close-up of an engine bay', altAr: 'لقطة قريبة لغرفة المحرك' },
    { query: 'car maintenance garage', title: 'CTA band', altEn: 'A car being serviced', altAr: 'سيارة أثناء الصيانة' },
    { query: 'car lift garage', title: 'Gallery lift', altEn: 'A car on the workshop lift', altAr: 'سيارة على رافعة الورشة' },
    { query: 'oil change engine', title: 'Gallery oil change', altEn: 'An oil change in progress', altAr: 'تغيير زيت أثناء التنفيذ' },
    { query: 'car wash foam', title: 'Gallery wash', altEn: 'A car being washed', altAr: 'غسيل سيارة' },
    { query: 'automotive tools workshop', title: 'Gallery tools', altEn: 'Workshop tools', altAr: 'أدوات الورشة' },
  ]

  const imageIds: number[] = []
  for (const [index, spec] of imageQueue.entries()) {
    imageIds.push(await upload(payload, { ...spec, pick: index }))
    await new Promise((resolve) => setTimeout(resolve, 400))
  }

  const [aboutHero, storyImage, contactHero, faqHero, ctaImage, ...galleryIds] = imageIds

  /* ── About ── */
  const about = aboutContent
  await upsertPage(
    payload,
    'about',
    {
      title: pageMeta.about.en.title,
      slug: 'about',
      metaTitle: pageMeta.about.en.metaTitle,
      metaDescription: pageMeta.about.en.metaDescription,
      ogImage: aboutHero,
      showInHeader: pageMeta.about.showInHeader,
      showInFooter: true,
      displayOrder: pageMeta.about.order,
      sections: [
        { blockType: 'pageHero', ...about.hero.en, backgroundImage: aboutHero, align: 'start' },
        {
          blockType: 'imageText',
          eyebrow: about.story.en.eyebrow,
          heading: about.story.en.heading,
          body: richText(about.story.en.body),
          image: storyImage,
          imageSide: 'end',
          bullets: about.story.en.bullets.map((text) => ({ text })),
          buttonLabel: 'See what we stock',
          buttonHref: '/shop',
        },
        { blockType: 'values', ...about.values.en },
        { blockType: 'steps', ...about.steps.en },
        { blockType: 'gallery', heading: 'Inside the workshop', images: galleryIds },
        {
          blockType: 'stats',
          items: [
            { value: '15+', label: 'Years in business' },
            { value: '48,000+', label: 'Cars serviced' },
            { value: '16', label: 'Technicians' },
            { value: '4.8/5', label: 'Average rating' },
          ],
        },
        { blockType: 'ctaBand', ...about.cta.en, backgroundImage: ctaImage },
      ],
    },
    {
      title: pageMeta.about.ar.title,
      metaTitle: pageMeta.about.ar.metaTitle,
      metaDescription: pageMeta.about.ar.metaDescription,
      sections: [
        { blockType: 'pageHero', ...about.hero.ar, backgroundImage: aboutHero, align: 'start' },
        {
          blockType: 'imageText',
          eyebrow: about.story.ar.eyebrow,
          heading: about.story.ar.heading,
          body: richText(about.story.ar.body),
          image: storyImage,
          imageSide: 'end',
          bullets: about.story.ar.bullets.map((text) => ({ text })),
          buttonLabel: 'شوف اللي عندنا',
          buttonHref: '/shop',
        },
        { blockType: 'values', ...about.values.ar },
        { blockType: 'steps', ...about.steps.ar },
        { blockType: 'gallery', heading: 'من داخل الورشة', images: galleryIds },
        {
          blockType: 'stats',
          items: [
            { value: '+15', label: 'سنة خبرة' },
            { value: '+48,000', label: 'عربية تمت خدمتها' },
            { value: '16', label: 'فني' },
            { value: '4.8/5', label: 'متوسط التقييم' },
          ],
        },
        { blockType: 'ctaBand', ...about.cta.ar, backgroundImage: ctaImage },
      ],
    },
  )

  /* ── Contact ── */
  await upsertPage(
    payload,
    'contact',
    {
      title: pageMeta.contact.en.title,
      slug: 'contact',
      metaTitle: pageMeta.contact.en.metaTitle,
      metaDescription: pageMeta.contact.en.metaDescription,
      ogImage: contactHero,
      showInHeader: pageMeta.contact.showInHeader,
      showInFooter: true,
      displayOrder: pageMeta.contact.order,
      sections: [
        { blockType: 'pageHero', ...contactContent.hero.en, backgroundImage: contactHero, align: 'center' },
        { blockType: 'contact', ...contactContent.contact.en, showMap: true },
        { blockType: 'faq', ...contactContent.faq.en },
      ],
    },
    {
      title: pageMeta.contact.ar.title,
      metaTitle: pageMeta.contact.ar.metaTitle,
      metaDescription: pageMeta.contact.ar.metaDescription,
      sections: [
        { blockType: 'pageHero', ...contactContent.hero.ar, backgroundImage: contactHero, align: 'center' },
        { blockType: 'contact', ...contactContent.contact.ar, showMap: true },
        { blockType: 'faq', ...contactContent.faq.ar },
      ],
    },
  )

  /* ── FAQ ── */
  await upsertPage(
    payload,
    'faq',
    {
      title: pageMeta.faq.en.title,
      slug: 'faq',
      metaTitle: pageMeta.faq.en.metaTitle,
      metaDescription: pageMeta.faq.en.metaDescription,
      ogImage: faqHero,
      showInHeader: pageMeta.faq.showInHeader,
      showInFooter: true,
      displayOrder: pageMeta.faq.order,
      sections: [
        { blockType: 'pageHero', ...faqContent.hero.en, backgroundImage: faqHero, align: 'center' },
        ...faqContent.groups.map((group) => ({ blockType: 'faq' as const, ...group.en })),
        { blockType: 'ctaBand', ...faqContent.cta.en },
      ],
    },
    {
      title: pageMeta.faq.ar.title,
      metaTitle: pageMeta.faq.ar.metaTitle,
      metaDescription: pageMeta.faq.ar.metaDescription,
      sections: [
        { blockType: 'pageHero', ...faqContent.hero.ar, backgroundImage: faqHero, align: 'center' },
        ...faqContent.groups.map((group) => ({ blockType: 'faq' as const, ...group.ar })),
        { blockType: 'ctaBand', ...faqContent.cta.ar },
      ],
    },
  )

  /* ── Menus ── */
  console.log('→ linking pages in the menus')

  /**
   * Localized array rows are matched by id. Writing the Arabic pass without
   * carrying the ids over creates new rows and silently drops the English
   * labels — so English is written first, re-read to collect the generated ids,
   * and only then translated.
   */
  const headerEn = [
    { label: 'Shop', href: '/shop' },
    { label: 'Oil Finder', href: '/oil-finder' },
    { label: 'Filter Lookup', href: '/filters' },
    { label: 'Car Wash', href: '/car-wash' },
    { label: 'About us', href: '/about' },
    { label: 'Contact', href: '/contact' },
  ]
  const headerAr = ['المتجر', 'دليل الزيوت', 'دليل الفلاتر', 'غسيل السيارات', 'من نحن', 'تواصل معنا']

  const footerEn = [
    {
      title: 'Shop',
      links: [
        { label: 'Engine Oils', href: '/shop/engine-oils' },
        { label: 'Filters', href: '/shop/filters' },
        { label: 'Batteries', href: '/shop/batteries' },
        { label: 'Car Care', href: '/shop/car-care' },
      ],
    },
    {
      title: 'Services',
      links: [
        { label: 'Oil Finder', href: '/oil-finder' },
        { label: 'Filter Lookup', href: '/filters' },
        { label: 'Car Wash Booking', href: '/car-wash' },
      ],
    },
    {
      title: 'Company',
      links: [
        { label: 'About us', href: '/about' },
        { label: 'Contact', href: '/contact' },
        { label: 'FAQ', href: '/faq' },
      ],
    },
    {
      title: 'Account',
      links: [
        { label: 'My Account', href: '/account' },
        { label: 'Saved items', href: '/wishlist' },
      ],
    },
  ]
  const footerAr = [
    { title: 'المتجر', links: ['زيوت المحركات', 'الفلاتر', 'البطاريات', 'العناية بالسيارة'] },
    { title: 'الخدمات', links: ['دليل الزيوت', 'دليل الفلاتر', 'حجز غسيل'] },
    { title: 'الشركة', links: ['من نحن', 'تواصل معنا', 'الأسئلة الشائعة'] },
    { title: 'حسابي', links: ['حسابي', 'المحفوظات'] },
  ]

  await payload.updateGlobal({
    slug: 'navigation',
    locale: 'en',
    data: {
      header: headerEn.map((item) => ({ ...item, children: [] })),
      footerColumns: footerEn,
      footerNote: '© Auto Service Center. All rights reserved.',
    },
  })

  const saved = await payload.findGlobal({ slug: 'navigation', locale: 'en' })

  await payload.updateGlobal({
    slug: 'navigation',
    locale: 'ar',
    data: {
      header: (saved.header ?? []).map((item, index) => ({
        id: item.id,
        label: headerAr[index] ?? item.label,
        href: item.href,
        children: [],
      })),
      footerColumns: (saved.footerColumns ?? []).map((column, index) => ({
        id: column.id,
        title: footerAr[index]?.title ?? column.title,
        links: (column.links ?? []).map((link, linkIndex) => ({
          id: link.id,
          label: footerAr[index]?.links[linkIndex] ?? link.label,
          href: link.href,
        })),
      })),
      footerNote: '© مركز خدمة السيارات. جميع الحقوق محفوظة.',
    },
  })

  console.log('\n✅ Pages created: /about, /contact, /faq')
  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
