/**
 * Extends the catalogue with a second wave of stock and sources a photo for
 * each. Idempotent: products are matched by SKU, so re-running updates rather
 * than duplicates.
 *
 *   npx tsx src/seed/more-products.ts
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'
import { sourcePhoto } from './images'

type NewProduct = {
  sku: string
  categoryKey: string
  productType: 'oil' | 'filter' | 'battery' | 'care' | 'accessory' | 'sparePart'
  brand: string
  price: number
  compareAtPrice?: number
  stock: number
  featured?: boolean
  volumeLiters?: number
  viscosity?: string
  apiSpec?: string
  oilType?: 'fullSynthetic' | 'semiSynthetic' | 'mineral'
  filterType?: 'oil' | 'air' | 'cabin' | 'fuel'
  partNumber?: string
  query: string
  en: { name: string; short: string }
  ar: { name: string; short: string }
}

const products: NewProduct[] = [
  /* ── Engine oils ── */
  {
    sku: 'OIL-MOB-5W30-4', categoryKey: 'engine-oils', productType: 'oil', brand: 'Mobil',
    price: 2100, compareAtPrice: 2400, stock: 34, featured: true, volumeLiters: 4,
    viscosity: '5W-30', apiSpec: 'API SP', oilType: 'fullSynthetic', query: 'motor oil bottle',
    en: { name: 'Mobil 1 ESP 5W-30 4L', short: 'Low-ash full synthetic for modern petrol and diesel engines.' },
    ar: { name: 'موبيل 1 ESP 5W-30 عبوة 4 لتر', short: 'زيت صناعي بالكامل منخفض الرماد للمحركات الحديثة بنزين وديزل.' },
  },
  {
    sku: 'OIL-CAS-0W20-4', categoryKey: 'engine-oils', productType: 'oil', brand: 'Castrol',
    price: 2650, stock: 21, volumeLiters: 4, viscosity: '0W-20', apiSpec: 'API SP',
    oilType: 'fullSynthetic', query: 'engine oil canister',
    en: { name: 'Castrol EDGE 0W-20 4L', short: 'Thin-grade synthetic for hybrids and the newest Japanese engines.' },
    ar: { name: 'كاسترول إيدج 0W-20 عبوة 4 لتر', short: 'زيت خفيف للهجين وأحدث المحركات اليابانية.' },
  },
  {
    sku: 'OIL-SHL-5W30-4', categoryKey: 'engine-oils', productType: 'oil', brand: 'Shell',
    price: 1990, stock: 28, volumeLiters: 4, viscosity: '5W-30', apiSpec: 'API SN',
    oilType: 'fullSynthetic', query: 'motor oil bottles various brands',
    en: { name: 'Shell Helix Ultra 5W-30 4L', short: 'Fully synthetic, strong protection in stop-start traffic.' },
    ar: { name: 'شل هيلكس ألترا 5W-30 عبوة 4 لتر', short: 'صناعي بالكامل، حماية قوية في زحمة المرور.' },
  },
  {
    sku: 'OIL-LM-10W40-4', categoryKey: 'engine-oils', productType: 'oil', brand: 'Liqui Moly',
    price: 1780, stock: 19, volumeLiters: 4, viscosity: '10W-40', apiSpec: 'API SL',
    oilType: 'semiSynthetic', query: 'lubricant oil bottle',
    en: { name: 'Liqui Moly MoS2 10W-40 4L', short: 'Semi-synthetic with friction modifier for higher-mileage engines.' },
    ar: { name: 'ليكوي مولي MoS2 10W-40 عبوة 4 لتر', short: 'نصف صناعي بمادة مقللة للاحتكاك للمحركات كثيرة الاستخدام.' },
  },
  {
    sku: 'OIL-TOT-5W40-5', categoryKey: 'engine-oils', productType: 'oil', brand: 'Total',
    price: 2350, stock: 16, volumeLiters: 5, viscosity: '5W-40', apiSpec: 'API SN',
    oilType: 'fullSynthetic', query: 'synthetic motor oil container',
    en: { name: 'Total Quartz INEO 5W-40 5L', short: 'Five-litre pack — the right size for most SUVs in one go.' },
    ar: { name: 'توتال كوارتز إينيو 5W-40 عبوة 5 لتر', short: 'عبوة 5 لتر — المقاس المناسب لمعظم سيارات الدفع الرباعي.' },
  },
  {
    sku: 'OIL-VAL-5W40-1', categoryKey: 'engine-oils', productType: 'oil', brand: 'Valvoline',
    price: 560, stock: 60, volumeLiters: 1, viscosity: '5W-40', apiSpec: 'API SN',
    oilType: 'fullSynthetic', query: 'motor oil bottle small',
    en: { name: 'Valvoline SynPower 5W-40 1L', short: 'One-litre top-up bottle. Keep one in the boot.' },
    ar: { name: 'فالفولين سينباور 5W-40 عبوة 1 لتر', short: 'عبوة لتر للتزويد. احتفظ بواحدة في الشنطة.' },
  },
  {
    sku: 'OIL-MOB-DIESEL-5', categoryKey: 'engine-oils', productType: 'oil', brand: 'Mobil',
    price: 2450, stock: 14, volumeLiters: 5, viscosity: '5W-30', apiSpec: 'API CK-4',
    oilType: 'fullSynthetic', query: 'diesel engine oil',
    en: { name: 'Mobil Delvac 5W-30 Diesel 5L', short: 'Heavy-duty diesel oil for pickups and light commercials.' },
    ar: { name: 'موبيل دلفاك 5W-30 ديزل عبوة 5 لتر', short: 'زيت ديزل شاق للبيك أب والمركبات التجارية الخفيفة.' },
  },

  /* ── Filters ── */
  {
    sku: 'FIL-AIR-KIA-01', categoryKey: 'filters', productType: 'filter', brand: 'Mobis',
    price: 285, stock: 24, filterType: 'air', partNumber: '28113-D3300', query: 'automotive air filter',
    en: { name: 'Air Filter — Kia Sportage', short: 'Genuine-quality air filter, part 28113-D3300.' },
    ar: { name: 'فلتر هواء — كيا سبورتاج', short: 'فلتر هواء بجودة الوكيل، رقم 28113-D3300.' },
  },
  {
    sku: 'FIL-CAB-NIS-01', categoryKey: 'filters', productType: 'filter', brand: 'Nissan',
    price: 255, stock: 27, filterType: 'cabin', partNumber: '27277-4BA0A', query: 'cabin air filter car',
    en: { name: 'Cabin Filter — Nissan Qashqai', short: 'Activated-carbon cabin filter, part 27277-4BA0A.' },
    ar: { name: 'فلتر مكيف — نيسان قشقاي', short: 'فلتر مكيف بالكربون النشط، رقم 27277-4BA0A.' },
  },
  {
    sku: 'FIL-AIR-VW-01', categoryKey: 'filters', productType: 'filter', brand: 'Mann',
    price: 395, stock: 18, filterType: 'air', partNumber: '5Q0129620D', query: 'car air filter element',
    en: { name: 'Air Filter — VW Golf 1.4 TSI', short: 'Mann filter element, part 5Q0129620D.' },
    ar: { name: 'فلتر هواء — فولكس جولف 1.4', short: 'فلتر مان، رقم 5Q0129620D.' },
  },
  {
    sku: 'FIL-FUE-HYU-01', categoryKey: 'filters', productType: 'filter', brand: 'Mobis',
    price: 480, stock: 15, filterType: 'fuel', partNumber: '31112-1R000', query: 'fuel filter car',
    en: { name: 'Fuel Filter — Hyundai Accent', short: 'In-tank fuel filter, part 31112-1R000.' },
    ar: { name: 'فلتر بنزين — هيونداي أكسنت', short: 'فلتر بنزين داخلي، رقم 31112-1R000.' },
  },
  {
    sku: 'FIL-OIL-MB-02', categoryKey: 'filters', productType: 'filter', brand: 'Mahle',
    price: 545, stock: 11, filterType: 'oil', partNumber: 'A2701800109', query: 'car oil filter',
    en: { name: 'Oil Filter — Mercedes C200', short: 'Mahle oil filter element, part A2701800109.' },
    ar: { name: 'فلتر زيت — مرسيدس C200', short: 'فلتر زيت ماله، رقم A2701800109.' },
  },

  /* ── Batteries ── */
  {
    sku: 'BAT-VAR-70', categoryKey: 'batteries', productType: 'battery', brand: 'Varta',
    price: 6200, stock: 7, featured: true, query: 'car battery automotive',
    en: { name: 'Varta Blue Dynamic 70Ah', short: 'German-made 70Ah battery with high cold-cranking power.' },
    ar: { name: 'بطارية فارتا بلو 70 أمبير', short: 'بطارية ألماني 70 أمبير بقوة تشغيل عالية.' },
  },
  {
    sku: 'BAT-ACD-90', categoryKey: 'batteries', productType: 'battery', brand: 'ACDelco',
    price: 7400, stock: 5, query: 'automotive lead acid battery',
    en: { name: 'ACDelco 90Ah Battery', short: '90Ah for large SUVs and cars with heavy electrical loads.' },
    ar: { name: 'بطارية ايه سي دلكو 90 أمبير', short: '90 أمبير للسيارات الكبيرة وذات الأحمال الكهربائية العالية.' },
  },
  {
    sku: 'BAT-CHL-60', categoryKey: 'batteries', productType: 'battery', brand: 'Chloride',
    price: 3850, stock: 13, query: 'car battery terminals',
    en: { name: 'Chloride 60Ah Battery', short: 'Maintenance-free 60Ah with a two-year warranty.' },
    ar: { name: 'بطارية كلورايد 60 أمبير', short: 'بطارية 60 أمبير بدون صيانة مع ضمان سنتين.' },
  },

  /* ── Car care ── */
  {
    sku: 'CAR-WAX-500', categoryKey: 'car-care', productType: 'care', brand: 'Meguiars',
    price: 620, stock: 26, featured: true, query: 'car wax bottle',
    en: { name: 'Carnauba Liquid Wax 500ml', short: 'Deep gloss and water beading that lasts about three months.' },
    ar: { name: 'شمع كارنوبا سائل 500 مل', short: 'لمعان عميق وطرد للمياه يدوم حوالي ثلاثة شهور.' },
  },
  {
    sku: 'CAR-GLASS-500', categoryKey: 'car-care', productType: 'care', brand: 'Bosch',
    price: 185, stock: 48, query: 'glass cleaner spray bottle',
    en: { name: 'Glass Cleaner 500ml', short: 'Streak-free glass cleaner, safe on tinted windows.' },
    ar: { name: 'منظف زجاج 500 مل', short: 'منظف زجاج بدون خطوط، آمن على الزجاج المظلل.' },
  },
  {
    sku: 'CAR-TYRE-500', categoryKey: 'car-care', productType: 'care', brand: 'Meguiars',
    price: 340, stock: 31, query: 'tire shine product',
    en: { name: 'Tyre Shine Gel 500ml', short: 'Satin finish that does not sling onto the paint.' },
    ar: { name: 'ملمع كاوتش جل 500 مل', short: 'لمعان ساتان لا يتطاير على الدهان.' },
  },
  {
    sku: 'CAR-AC-CLEAN', categoryKey: 'car-care', productType: 'care', brand: 'Liqui Moly',
    price: 420, stock: 22, query: 'car air conditioning cleaner',
    en: { name: 'A/C System Cleaner', short: 'Clears the smell from the air conditioning in one treatment.' },
    ar: { name: 'منظف دورة التكييف', short: 'يزيل رائحة التكييف من أول استخدام.' },
  },

  /* ── Accessories ── */
  {
    sku: 'ACC-MAT-SET', categoryKey: 'accessories', productType: 'accessory', brand: 'Generic',
    price: 890, stock: 20, query: 'car floor mats',
    en: { name: 'All-Weather Floor Mats (set of 4)', short: 'Deep-tray rubber mats that trap water and sand.' },
    ar: { name: 'دواسات مطاطية لكل الفصول (طقم 4)', short: 'دواسات مطاطية عميقة تحبس المياه والرمل.' },
  },
  {
    sku: 'ACC-COVER-M', categoryKey: 'accessories', productType: 'accessory', brand: 'Generic',
    price: 1250, stock: 12, query: 'car cover',
    en: { name: 'Car Body Cover — Medium', short: 'UV-resistant cover for sedans parked outdoors.' },
    ar: { name: 'غطاء سيارة — مقاس متوسط', short: 'غطاء مقاوم للشمس للسيارات السيدان المركونة في الخارج.' },
  },
  {
    sku: 'ACC-CHARGE-45', categoryKey: 'accessories', productType: 'accessory', brand: 'Bosch',
    price: 780, stock: 25, featured: true, query: 'usb car charger',
    en: { name: 'USB-C Fast Car Charger 45W', short: 'Charges two devices at full speed from one socket.' },
    ar: { name: 'شاحن سيارة سريع USB-C بقوة 45 وات', short: 'يشحن جهازين بأقصى سرعة من مخرج واحد.' },
  },
  {
    sku: 'ACC-TRIANGLE', categoryKey: 'accessories', productType: 'accessory', brand: 'Generic',
    price: 210, stock: 40, query: 'warning triangle road',
    en: { name: 'Warning Triangle', short: 'Reflective breakdown triangle — legally required in the car.' },
    ar: { name: 'مثلث تحذير', short: 'مثلث عاكس للأعطال — مطلوب قانوناً في السيارة.' },
  },

  /* ── Spare parts ── */
  {
    sku: 'SPR-BRK-HYU-01', categoryKey: 'spare-parts', productType: 'sparePart', brand: 'Mobis',
    price: 1380, stock: 16, query: 'brake pads automotive',
    en: { name: 'Front Brake Pads — Elantra', short: 'Genuine-quality front pads with low dust output.' },
    ar: { name: 'تيل فرامل أمامي — إلنترا', short: 'تيل أمامي بجودة الوكيل وأتربة أقل.' },
  },
  {
    sku: 'SPR-DISC-FRONT', categoryKey: 'spare-parts', productType: 'sparePart', brand: 'Bosch',
    price: 2450, stock: 9, query: 'brake disc rotor',
    en: { name: 'Front Brake Discs (pair)', short: 'Vented discs — replace with pads for a full front service.' },
    ar: { name: 'هوبات فرامل أمامية (زوج)', short: 'هوبات مهواة — غيّرها مع التيل لخدمة أمامية كاملة.' },
  },
  {
    sku: 'SPR-BELT-TIM', categoryKey: 'spare-parts', productType: 'sparePart', brand: 'Mann',
    price: 1950, stock: 8, query: 'timing belt engine',
    en: { name: 'Timing Belt Kit', short: 'Belt, tensioner and idler — replace as a set, every time.' },
    ar: { name: 'طقم سير كاتينة', short: 'سير وشداد وبكرة — يتم تغييرهم كطقم كامل دائماً.' },
  },
  {
    sku: 'SPR-BULB-H4', categoryKey: 'spare-parts', productType: 'sparePart', brand: 'Bosch',
    price: 320, stock: 44, query: 'car headlight bulb',
    en: { name: 'H4 Headlight Bulbs (pair)', short: 'Brighter than standard, road legal, sold as a pair.' },
    ar: { name: 'لمبات أمامية H4 (زوج)', short: 'أكثر سطوعاً من العادية، مسموح بها قانوناً، تُباع كزوج.' },
  },
]

const run = async () => {
  const payload = await getPayload({ config })

  const categories = await payload.find({ collection: 'productCategories', limit: 50, depth: 0, overrideAccess: true })
  const categoryIds = new Map(categories.docs.map((category) => [category.slug as string, category.id]))

  let created = 0
  let updated = 0

  for (const [index, item] of products.entries()) {
    const categoryId = categoryIds.get(item.categoryKey)
    if (!categoryId) {
      console.log(`   skipped ${item.sku} — category ${item.categoryKey} not found`)
      continue
    }

    const existing = await payload.find({
      collection: 'products',
      where: { sku: { equals: item.sku } },
      limit: 1,
      depth: 0,
      overrideAccess: true,
    })

    const photo = await sourcePhoto(item.query, { kind: item.productType, title: item.en.name }, index)
    const media = await payload.create({
      collection: 'media',
      locale: 'en',
      data: { alt: item.en.name, credit: photo.credit ?? undefined },
      file: { data: photo.buffer, mimetype: photo.mimetype, name: photo.filename, size: photo.buffer.length },
      overrideAccess: true,
    })
    await payload.update({
      collection: 'media',
      id: media.id,
      locale: 'ar',
      data: { alt: item.ar.name },
      overrideAccess: true,
    })

    const data = {
      name: item.en.name,
      sku: item.sku,
      brand: item.brand,
      category: categoryId,
      productType: item.productType,
      price: item.price,
      compareAtPrice: item.compareAtPrice,
      costPrice: Math.round(item.price * 0.7),
      stockQuantity: item.stock,
      lowStockThreshold: 5,
      unit: item.productType === 'oil' ? ('litre' as const) : ('piece' as const),
      volumeLiters: item.volumeLiters,
      shortDescription: item.en.short,
      images: [media.id],
      isPublished: true,
      isFeatured: item.featured ?? false,
      oilAttributes:
        item.productType === 'oil'
          ? { viscosity: item.viscosity, apiSpec: item.apiSpec, oilType: item.oilType }
          : undefined,
      filterAttributes:
        item.productType === 'filter'
          ? { filterType: item.filterType, partNumber: item.partNumber }
          : undefined,
    }

    const doc = existing.docs[0]
      ? await payload.update({ collection: 'products', id: existing.docs[0].id, locale: 'en', data, overrideAccess: true })
      : await payload.create({ collection: 'products', locale: 'en', data, overrideAccess: true })

    await payload.update({
      collection: 'products',
      id: doc.id,
      locale: 'ar',
      data: { name: item.ar.name, shortDescription: item.ar.short },
      overrideAccess: true,
    })

    existing.docs[0] ? (updated += 1) : (created += 1)
    console.log(`  ${item.sku} ${photo.credit ? '(photo)' : '(generated)'}`)
    await new Promise((resolve) => setTimeout(resolve, 350))
  }

  console.log(`\n✅ Catalogue extended — ${created} new, ${updated} updated.`)
  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
