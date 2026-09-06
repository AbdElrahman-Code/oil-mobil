/**
 * Rewrites the homepage as a shop-first page: hero, catalogue, popular stock,
 * trust numbers, reviews. Everything that pointed at the retired service
 * modules is gone.
 *
 *   npx tsx src/seed/homepage.ts
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'

const run = async () => {
  const payload = await getPayload({ config })

  // Keep whatever hero imagery is already in place.
  const current = await payload.findGlobal({ slug: 'homepage', locale: 'en' })
  const heroImage = current.sections?.find((section) => section.blockType === 'hero')?.backgroundImage

  const build = (locale: 'en' | 'ar') => {
    const ar = locale === 'ar'
    return [
      {
        blockType: 'hero' as const,
        eyebrow: ar ? 'قطع غيار وزيوت أصلية' : 'Genuine parts and oils',
        headline: ar ? 'كل اللي عربيتك محتاجاه' : 'Everything your car needs',
        subheadline: ar
          ? 'اختر عربيتك مرة واحدة، وهنعرض لك القطع المناسبة ليها بس — بأسعار واضحة وتوصيل لحد باب البيت.'
          : 'Pick your car once and we will only show the parts that fit it — clear prices, delivered to your door.',
        backgroundImage: heroImage,
        buttons: [
          { label: ar ? 'تسوق الآن' : 'Shop now', href: '/shop', style: 'primary' },
          { label: ar ? 'أنشئ حسابك' : 'Create an account', href: '/account/login', style: 'outline' },
        ],
      },
      {
        blockType: 'featuredCategories' as const,
        heading: ar ? 'تسوق حسب القسم' : 'Shop by category',
        subheading: ar
          ? 'من الزيوت والفلاتر للفرامل والعفشة والإكسسوارات.'
          : 'From oils and filters to brakes, suspension and accessories.',
      },
      {
        blockType: 'featuredProducts' as const,
        heading: ar ? 'الأكثر طلباً' : 'Popular right now',
        subheading: ar ? 'اللي عملاؤنا بيشتروه الشهر ده.' : 'What our customers are buying this month.',
        source: 'featured' as const,
        limit: 8,
        ctaHref: '/shop',
      },
      {
        blockType: 'stats' as const,
        items: ar
          ? [
              { value: '+15', label: 'سنة خبرة' },
              { value: '+48,000', label: 'عربية تمت خدمتها' },
              { value: '+80', label: 'منتج في المتجر' },
              { value: '4.8/5', label: 'متوسط التقييم' },
            ]
          : [
              { value: '15+', label: 'Years in business' },
              { value: '48,000+', label: 'Cars serviced' },
              { value: '80+', label: 'Products in stock' },
              { value: '4.8/5', label: 'Average rating' },
            ],
      },
      {
        blockType: 'testimonials' as const,
        heading: ar ? 'رأي عملائنا' : 'What our customers say',
        items: ar
          ? [
              { quote: 'قالولي بالظبط الزيت المناسب للكورولا والفلتر، ووصلني تاني يوم.', author: 'أحمد حسن', carModel: 'تويوتا كورولا 2019', rating: 5 },
              { quote: 'أول مرة أعرف أطلب قطع غيار من غير ما أسأل حد. الموقع بيقول لك المناسب لعربيتك.', author: 'منى سعيد', carModel: 'هيونداي إلنترا 2021', rating: 5 },
              { quote: 'الأسعار واضحة والفاتورة فيها كل حاجة. مفيش مفاجآت.', author: 'كريم فؤاد', carModel: 'كيا سيراتو 2018', rating: 5 },
            ]
          : [
              { quote: 'They told me exactly which oil and filter my Corolla needs, and it arrived the next day.', author: 'Ahmed Hassan', carModel: 'Toyota Corolla 2019', rating: 5 },
              { quote: 'First time I have ordered parts without asking someone. The site tells you what fits your car.', author: 'Mona Saeed', carModel: 'Hyundai Elantra 2021', rating: 5 },
              { quote: 'Clear prices and everything itemised on the invoice. No surprises.', author: 'Karim Fouad', carModel: 'Kia Cerato 2018', rating: 5 },
            ],
      },
    ]
  }

  const seo = {
    en: {
      metaTitle: 'Genuine car parts and oils, delivered',
      metaDescription:
        'Pick your car and order the oils, filters, brakes and accessories that fit it — clear prices and fast delivery.',
    },
    ar: {
      metaTitle: 'قطع غيار وزيوت أصلية لعربيتك',
      metaDescription:
        'اختر عربيتك واطلب الزيوت والفلاتر والفرامل والإكسسوارات المناسبة ليها، بأسعار واضحة وتوصيل سريع.',
    },
  }

  // English first, then re-read to collect the generated block ids. Writing the
  // Arabic pass without them creates a second set of blocks and wipes the
  // English values — localized arrays are matched by id, not by position.
  await payload.updateGlobal({
    slug: 'homepage',
    locale: 'en',
    draft: false,
    data: { _status: 'published', sections: build('en') as never, seo: seo.en },
  })
  console.log('→ homepage rebuilt (en)')

  const saved = await payload.findGlobal({ slug: 'homepage', locale: 'en' })
  const arabic = build('ar') as Record<string, unknown>[]

  const withIds = (saved.sections ?? []).map((section, index) => {
    const source = arabic[index]
    if (!source) return section

    const merged: Record<string, unknown> = { ...source, id: section.id }

    // Nested rows carry ids of their own; carry those across too.
    for (const key of ['buttons', 'items']) {
      const existing = (section as unknown as Record<string, unknown>)[key]
      const incoming = source[key]
      if (Array.isArray(existing) && Array.isArray(incoming)) {
        merged[key] = incoming.map((row, rowIndex) => ({
          ...(row as Record<string, unknown>),
          id: (existing[rowIndex] as { id?: string } | undefined)?.id,
        }))
      }
    }
    return merged
  })

  await payload.updateGlobal({
    slug: 'homepage',
    locale: 'ar',
    draft: false,
    data: { _status: 'published', sections: withIds as never, seo: seo.ar },
  })
  console.log('→ homepage rebuilt (ar)')

  console.log('\n✅ Homepage is now shop-first; car wash sections removed.')
  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
