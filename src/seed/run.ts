/**
 * Seeds a demo database: reference data, catalogue, customers and content.
 * Safe to re-run — it clears the collections it owns first.
 *
 *   npm run seed
 */
import 'dotenv/config'
import { randomBytes } from 'crypto'
import { addDays, subDays, subMonths } from 'date-fns'
import { getPayload } from 'payload'
import config from '../payload.config'
import {
  adjustmentRules,
  brands,
  categories,
  demoCustomers,
  demoVehicles,
  products as productSeed,
  specs as specSeed,
  testimonials,
  washServices,
} from './data'
import { makeImage } from './images'
import { legalPages as legalSeed } from './legal'

type Payload = Awaited<ReturnType<typeof getPayload>>

/** Minimal Lexical document — enough for seeded rich-text fields. */
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

const uploadImage = async (
  payload: Payload,
  options: Parameters<typeof makeImage>[0] & { altEn: string; altAr: string },
): Promise<number> => {
  const image = await makeImage(options)
  const doc = await payload.create({
    collection: 'media',
    locale: 'en',
    data: { alt: options.altEn },
    file: { data: image.buffer, mimetype: image.mimetype, name: image.filename, size: image.buffer.length },
    overrideAccess: true,
  })
  await payload.update({
    collection: 'media',
    id: doc.id,
    locale: 'ar',
    data: { alt: options.altAr },
    overrideAccess: true,
  })
  return doc.id
}

const wipe = async (payload: Payload) => {
  const collections = [
    'invoices',
    'serviceRecords',
    'orders',
    'bookings',
    'oilFinderLeads',
    'vehicles',
    'customers',
    'oilSpecifications',
    'oilAdjustmentRules',
    'vehicleModels',
    'vehicleBrands',
    'products',
    'productCategories',
    'washServices',
    'legalPages',
    'media',
  ] as const

  for (const collection of collections) {
    await payload.delete({ collection, where: { id: { greater_than: 0 } }, overrideAccess: true })
    console.log(`  cleared ${collection}`)
  }
}

const run = async () => {
  // This script deletes data. It must never run against a live shop by accident.
  if (process.env.NODE_ENV === 'production' && process.env.SEED_ALLOW_PRODUCTION !== 'true') {
    console.error(
      'Refusing to seed: NODE_ENV is production. Set SEED_ALLOW_PRODUCTION=true only if you really mean to wipe this database.',
    )
    process.exit(1)
  }

  const payload = await getPayload({ config })

  console.log('→ clearing existing demo data')
  await wipe(payload)

  /* ------------------------------------------------------------- staff user */
  const adminEmail = process.env.SEED_ADMIN_EMAIL || 'admin@servicecenter.eg'
  // Demo credentials are generated, not hardcoded, so a forgotten default can
  // never become the production login. Set SEED_ADMIN_PASSWORD to choose one.
  const adminPassword =
    process.env.SEED_ADMIN_PASSWORD ||
    `Asc-${randomBytes(9).toString('base64url')}!${new Date().getFullYear()}`
  const demoCustomerPassword =
    process.env.SEED_CUSTOMER_PASSWORD || `Demo-${randomBytes(6).toString('base64url')}!`
  const existingAdmins = await payload.find({ collection: 'users', limit: 1, overrideAccess: true })

  if (!existingAdmins.docs.length) {
    await payload.create({
      collection: 'users',
      data: { name: 'Shop Owner', email: adminEmail, password: adminPassword, role: 'superadmin', isActive: true },
      overrideAccess: true,
    })
    console.log(`→ admin created: ${adminEmail} / ${adminPassword}`)
  } else {
    console.log('→ admin already exists, leaving it alone')
  }

  /* ------------------------------------------------------------- categories */
  console.log('→ categories')
  const categoryIds = new Map<string, number>()
  for (const category of categories) {
    const imageId = await uploadImage(payload, {
      kind: 'category',
      title: category.en,
      subtitle: 'Category',
      width: 1200,
      height: 800,
      altEn: `${category.en} category`,
      altAr: `قسم ${category.ar}`,
    })

    const doc = await payload.create({
      collection: 'productCategories',
      locale: 'en',
      data: {
        name: category.en,
        slug: category.key,
        icon: category.icon as 'droplet',
        displayOrder: category.order,
        showInNav: true,
        showOnHomepage: category.home,
        image: imageId,
      },
      overrideAccess: true,
    })
    await payload.update({
      collection: 'productCategories',
      id: doc.id,
      locale: 'ar',
      data: { name: category.ar },
      overrideAccess: true,
    })
    categoryIds.set(category.key, doc.id)
  }

  /* ---------------------------------------------------------------- brands */
  console.log('→ vehicle brands and models')
  const brandIds = new Map<string, number>()
  const modelIds = new Map<string, number>()

  for (const brand of brands) {
    const brandDoc = await payload.create({
      collection: 'vehicleBrands',
      data: {
        name: brand.name,
        nameAr: brand.nameAr,
        country: brand.country,
        displayOrder: brand.order,
        isActive: true,
      },
      overrideAccess: true,
    })
    brandIds.set(brand.name, brandDoc.id)

    for (const model of brand.models) {
      const modelDoc = await payload.create({
        collection: 'vehicleModels',
        locale: 'en',
        data: {
          name: model.name,
          nameAr: model.nameAr,
          brand: brandDoc.id,
          yearFrom: model.yearFrom,
          yearTo: model.yearTo,
          bodyType: model.bodyType,
          isActive: true,
          engines: model.engines.map((engine) => ({
            code: engine.code,
            label: engine.label.en,
            fuelType: engine.fuelType,
            displacementLiters: engine.displacementLiters,
            isTurbo: engine.isTurbo ?? false,
          })),
        },
        overrideAccess: true,
      })

      await payload.update({
        collection: 'vehicleModels',
        id: modelDoc.id,
        locale: 'ar',
        data: {
          // Non-localized subfields must be repeated here: sending partial rows
          // would blank isTurbo/displacement for every locale.
          engines: modelDoc.engines?.map((row) => ({
            id: row.id,
            code: row.code,
            label: model.engines.find((engine) => engine.code === row.code)?.label.ar ?? row.label,
            fuelType: row.fuelType,
            displacementLiters: row.displacementLiters,
            isTurbo: row.isTurbo,
          })),
        },
        overrideAccess: true,
      })

      modelIds.set(`${brand.name}|${model.name}`, modelDoc.id)
    }
  }

  /* -------------------------------------------------------------- products */
  console.log('→ products')
  const productIds = new Map<string, number>()

  for (const product of productSeed) {
    const imageId = await uploadImage(payload, {
      kind: product.productType,
      title: product.name.en,
      subtitle: product.brand,
      altEn: product.name.en,
      altAr: product.name.ar,
    })

    const doc = await payload.create({
      collection: 'products',
      locale: 'en',
      data: {
        name: product.name.en,
        sku: product.sku,
        brand: product.brand,
        category: categoryIds.get(product.categoryKey) as number,
        productType: product.productType,
        price: product.price,
        compareAtPrice: product.compareAtPrice,
        costPrice: product.costPrice,
        stockQuantity: product.stock,
        lowStockThreshold: 5,
        unit: product.productType === 'oil' ? 'litre' : 'piece',
        volumeLiters: product.volumeLiters,
        shortDescription: product.shortEn,
        description: richText([product.shortEn]),
        images: [imageId],
        isPublished: true,
        isFeatured: product.featured ?? false,
        specifications: product.specs?.map((spec) => ({ label: spec.label.en, value: spec.value.en })),
        oilAttributes:
          product.productType === 'oil'
            ? { viscosity: product.viscosity, apiSpec: product.apiSpec, aceaSpec: product.aceaSpec, oilType: product.oilType }
            : undefined,
        filterAttributes:
          product.productType === 'filter'
            ? { filterType: product.filterType, partNumber: product.partNumber }
            : undefined,
      },
      overrideAccess: true,
    })

    await payload.update({
      collection: 'products',
      id: doc.id,
      locale: 'ar',
      data: {
        name: product.name.ar,
        shortDescription: product.shortAr,
        description: richText([product.shortAr]),
        specifications: product.specs?.map((spec) => ({ label: spec.label.ar, value: spec.value.ar })),
      },
      overrideAccess: true,
    })

    productIds.set(product.sku, doc.id)
  }

  const productByPartNumber = new Map<string, number>()
  for (const product of productSeed) {
    if (product.partNumber) productByPartNumber.set(product.partNumber, productIds.get(product.sku) as number)
  }

  const oilProductsByViscosity = new Map<string, number[]>()
  for (const product of productSeed) {
    if (product.productType !== 'oil' || !product.viscosity) continue
    const list = oilProductsByViscosity.get(product.viscosity) ?? []
    list.push(productIds.get(product.sku) as number)
    oilProductsByViscosity.set(product.viscosity, list)
  }

  /* --------------------------------------------------------- oil specs */
  console.log('→ oil specifications')
  for (const spec of specSeed) {
    const modelId = modelIds.get(`${spec.brand}|${spec.model}`)
    if (!modelId) continue

    const matchingOils = oilProductsByViscosity.get(spec.viscosity) ?? []

    const doc = await payload.create({
      collection: 'oilSpecifications',
      locale: 'en',
      data: {
        vehicleModel: modelId,
        engineCode: spec.engineCode,
        yearFrom: spec.yearFrom,
        yearTo: spec.yearTo,
        recommendedViscosity: spec.viscosity,
        requiredAPISpec: spec.api,
        requiredACEASpec: spec.acea,
        oilType: spec.oilType,
        requiredOilQuantityLiters: spec.litres,
        recommendedChangeIntervalKm: spec.intervalKm,
        recommendedChangeIntervalMonths: spec.intervalMonths,
        oilFilterPartNumber: spec.oilFilterPart,
        oilFilterProduct: productByPartNumber.get(spec.oilFilterPart),
        recommendedOilProduct: matchingOils[0],
        alternativeOilProducts: matchingOils.slice(1, 4),
        notes: spec.noteEn ? richText([spec.noteEn]) : undefined,
      },
      overrideAccess: true,
    })

    if (spec.noteAr) {
      await payload.update({
        collection: 'oilSpecifications',
        id: doc.id,
        locale: 'ar',
        data: { notes: richText([spec.noteAr]) },
        overrideAccess: true,
      })
    }
  }

  /* ------------------------------------------------------- adjustment rules */
  console.log('→ oil recommendation rules')
  for (const rule of adjustmentRules) {
    const doc = await payload.create({
      collection: 'oilAdjustmentRules',
      locale: 'en',
      data: {
        name: rule.name,
        priority: rule.priority,
        isActive: true,
        engineConditions: rule.engineConditions as ('excellent' | 'good' | 'consumesOil' | 'rebuilt')[] | undefined,
        minMileageKm: rule.minMileageKm,
        maxMileageKm: rule.maxMileageKm,
        turboOnly: rule.turboOnly ?? false,
        viscosityShift: rule.viscosityShift ?? 'none',
        forceOilType: rule.forceOilType,
        intervalKmMultiplier: rule.intervalKmMultiplier ?? 1,
        intervalMonthsMultiplier: rule.intervalMonthsMultiplier ?? 1,
        flagForStaffReview: rule.flagForStaffReview ?? false,
        customerNote: rule.noteEn,
      },
      overrideAccess: true,
    })
    await payload.update({
      collection: 'oilAdjustmentRules',
      id: doc.id,
      locale: 'ar',
      data: { customerNote: rule.noteAr },
      overrideAccess: true,
    })
  }

  /* ---------------------------------------------------------- wash services */
  console.log('→ wash services')
  const washServiceIds: number[] = []
  for (const [index, service] of washServices.entries()) {
    const imageId = await uploadImage(payload, {
      kind: 'wash',
      title: service.en,
      subtitle: `${service.minutes} min`,
      width: 1200,
      height: 800,
      altEn: service.en,
      altAr: service.ar,
    })

    const doc = await payload.create({
      collection: 'washServices',
      locale: 'en',
      data: {
        name: service.en,
        description: service.descEn,
        price: service.price,
        durationMinutes: service.minutes,
        displayOrder: (index + 1) * 10,
        isPopular: service.popular,
        isActive: true,
        image: imageId,
        includes: service.includes.map((item) => ({ item: item.en })),
      },
      overrideAccess: true,
    })

    await payload.update({
      collection: 'washServices',
      id: doc.id,
      locale: 'ar',
      data: {
        name: service.ar,
        description: service.descAr,
        includes: service.includes.map((item) => ({ item: item.ar })),
      },
      overrideAccess: true,
    })

    washServiceIds.push(doc.id)
  }

  /* ------------------------------------------------- customers and vehicles */
  console.log('→ customers, vehicles and history')
  const customerIds: number[] = []
  for (const customer of demoCustomers) {
    const doc = await payload.create({
      collection: 'customers',
      data: {
        name: customer.name,
        phone: customer.phone,
        username: customer.phone,
        password: demoCustomerPassword,
        preferredLanguage: 'ar',
        loyaltyPoints: Math.floor(Math.random() * 400),
        addresses: [
          {
            label: 'Home',
            governorate: 'Cairo',
            city: customer.city,
            street: '15 El Nasr Street',
            building: '7',
            apartment: '3',
            isDefault: true,
          },
        ],
      },
      overrideAccess: true,
    })
    customerIds.push(doc.id)
  }

  const vehicleIds: number[] = []
  for (const vehicle of demoVehicles) {
    const doc = await payload.create({
      collection: 'vehicles',
      data: {
        plateNumber: vehicle.plate,
        owner: customerIds[vehicle.customerIndex],
        brand: brandIds.get(vehicle.brand) as number,
        model: modelIds.get(`${vehicle.brand}|${vehicle.model}`) as number,
        manufacturingYear: vehicle.year,
        engineType: vehicle.engine,
        currentMileage: vehicle.mileage,
        oilBrandUsed: 'Mobil',
        oilViscosity: '5W-30',
        lastServiceDate: subMonths(new Date(), 4).toISOString(),
        lastServiceMileage: vehicle.mileage - 4200,
        nextOilChangeMileage: vehicle.mileage + 5800,
        nextOilChangeDate: addDays(new Date(), (vehicle.mileage % 9) * 7 - 10).toISOString(),
      },
      overrideAccess: true,
    })
    vehicleIds.push(doc.id)
  }

  // Service history — the afterChange hook rolls the next-service dates forward.
  for (const [index, vehicleId] of vehicleIds.entries()) {
    await payload.create({
      collection: 'serviceRecords',
      data: {
        vehicle: vehicleId,
        serviceDate: subMonths(new Date(), 4 + (index % 3)).toISOString(),
        mileageAtService: demoVehicles[index].mileage - 4200,
        serviceTypes: ['oilChange', 'filterChange'],
        workPerformed: richText(['Full oil and filter change, fluid levels checked, tyre pressures set.']),
        oilQuantityLiters: 4,
        oilViscosityUsed: '5W-30',
        labourCost: 150,
        cost: 1850 + index * 40,
      },
      overrideAccess: true,
    })
  }

  /* ------------------------------------------------------ orders & invoices */
  console.log('→ orders, invoices and bookings')
  const orderableProducts = productSeed.slice(0, 12)

  for (let index = 0; index < 6; index += 1) {
    const customerIndex = index % customerIds.length
    const first = orderableProducts[index % orderableProducts.length]
    const second = orderableProducts[(index + 3) % orderableProducts.length]

    const order = await payload.create({
      collection: 'orders',
      data: {
        customer: customerIds[customerIndex],
        contactName: demoCustomers[customerIndex].name,
        contactPhone: demoCustomers[customerIndex].phone,
        items: [
          {
            product: productIds.get(first.sku) as number,
            quantity: 1,
            priceAtPurchase: first.price,
            nameSnapshot: first.name.en,
          },
          {
            product: productIds.get(second.sku) as number,
            quantity: index % 2 === 0 ? 2 : 1,
            priceAtPurchase: second.price,
            nameSnapshot: second.name.en,
          },
        ],
        fulfillmentMethod: index % 2 === 0 ? 'delivery' : 'pickup',
        orderStatus: (['pending', 'confirmed', 'preparing', 'completed', 'completed', 'cancelled'] as const)[index],
        paymentMethod: index % 2 === 0 ? 'cod' : 'payAtPickup',
        paymentStatus: index >= 3 ? 'paid' : 'unpaid',
        deliveryFee: index % 2 === 0 ? 50 : 0,
        discount: 0,
        deliveryAddress:
          index % 2 === 0
            ? { governorate: 'Cairo', city: demoCustomers[customerIndex].city, street: '15 El Nasr Street', building: '7' }
            : undefined,
      },
      overrideAccess: true,
    })

    if (index >= 3) {
      await payload.create({
        collection: 'invoices',
        data: {
          customer: customerIds[customerIndex],
          customerName: demoCustomers[customerIndex].name,
          issueDate: subDays(new Date(), index * 5).toISOString(),
          source: 'order',
          status: 'paid',
          order: order.id,
          vatRate: 14,
          lineItems: [
            { description: first.name.en, quantity: 1, unitPrice: first.price },
            { description: second.name.en, quantity: index % 2 === 0 ? 2 : 1, unitPrice: second.price },
          ],
        },
        overrideAccess: true,
      })
    }
  }

  for (let index = 0; index < 5; index += 1) {
    await payload.create({
      collection: 'bookings',
      data: {
        contactName: demoCustomers[index % demoCustomers.length].name,
        contactPhone: demoCustomers[index % demoCustomers.length].phone,
        customer: customerIds[index % customerIds.length],
        vehicle: vehicleIds[index % vehicleIds.length],
        serviceType: washServiceIds[index % washServiceIds.length],
        requestedDate: addDays(new Date(), index).toISOString(),
        requestedTimeSlot: ['10:00', '11:30', '13:00', '15:30', '17:00'][index],
        status: (['pending', 'confirmed', 'confirmed', 'completed', 'pending'] as const)[index],
        priceAtBooking: washServices[index % washServices.length].price,
      },
      overrideAccess: true,
    })
  }

  /* ----------------------------------------------------------- legal pages */
  console.log('→ legal pages')
  for (const page of legalSeed) {
    const doc = await payload.create({
      collection: 'legalPages',
      locale: 'en',
      data: {
        title: page.en.title,
        slug: page.slug,
        content: richText(page.en.blocks),
        lastReviewed: new Date().toISOString(),
        showInFooter: true,
        displayOrder: page.order,
      },
      overrideAccess: true,
    })
    await payload.update({
      collection: 'legalPages',
      id: doc.id,
      locale: 'ar',
      data: { title: page.ar.title, content: richText(page.ar.blocks) },
      overrideAccess: true,
    })
  }

  /* ---------------------------------------------------------------- globals */
  console.log('→ site settings, menus and homepage')

  const heroImage = await uploadImage(payload, {
    kind: 'hero',
    title: 'Service Center',
    subtitle: 'Oil change · Filters · Car wash',
    width: 1920,
    height: 1080,
    altEn: 'Service centre workshop',
    altAr: 'مركز خدمة السيارات',
  })

  const oilFinderImage = await uploadImage(payload, {
    kind: 'oil',
    title: 'Oil Finder',
    subtitle: 'Find the right oil in 30 seconds',
    width: 1200,
    height: 900,
    altEn: 'Engine oil being poured',
    altAr: 'صب زيت المحرك',
  })

  const promoImage = await uploadImage(payload, {
    kind: 'wash',
    title: 'Wash & Detailing',
    subtitle: 'Book online',
    width: 1200,
    height: 900,
    altEn: 'Car being washed',
    altAr: 'غسيل سيارة',
  })

  await payload.updateGlobal({
    slug: 'siteSettings',
    locale: 'en',
    data: {
      siteName: 'Drift',
      tagline: 'The right oil for your car, fitted by people who know engines.',
      primaryColor: '#F26B1D',
      accentColor: '#1E3A5F',
      phone: '19XXX',
      whatsappNumber: '201001234567',
      email: 'hello@servicecenter.eg',
      deliveryFee: 50,
      freeDeliveryThreshold: 1500,
      codEnabled: true,
      onlinePaymentEnabled: false,
      bookingOpenTime: '09:00',
      bookingCloseTime: '21:00',
      bookingSlotMinutes: 30,
      bookingsPerSlot: 2,
      bookingLeadTimeHours: 2,
      closedDays: ['5'],
      branches: [
        {
          name: 'Nasr City Branch',
          address: '112 Abbas El Akkad Street, Nasr City, Cairo',
          phone: '0221234567',
          latitude: 30.0626,
          longitude: 31.3399,
        },
        {
          name: '6th of October Branch',
          address: 'Central Axis, 6th of October City, Giza',
          phone: '0238765432',
        },
      ],
      openingHours: [
        { days: 'Saturday – Thursday', hours: '9:00 – 21:00' },
        { days: 'Friday', hours: 'Closed' },
      ],
      socialLinks: [
        { platform: 'facebook', url: 'https://facebook.com' },
        { platform: 'instagram', url: 'https://instagram.com' },
      ],
      defaultMetaTitle: 'Auto Service Center — Engine oils, filters and car care in Egypt',
      defaultMetaDescription:
        'Genuine engine oils, filters, batteries and accessories, with expert fitting, online booking and a free digital service record for your car.',
      ogImage: heroImage,
    },
  })

  await payload.updateGlobal({
    slug: 'siteSettings',
    locale: 'ar',
    data: {
      siteName: 'دريفت',
      tagline: 'الزيت الصح لعربيتك، على يد ناس فاهمة في المحركات.',
      branches: [
        {
          name: 'فرع مدينة نصر',
          address: '112 شارع عباس العقاد، مدينة نصر، القاهرة',
          phone: '0221234567',
          latitude: 30.0626,
          longitude: 31.3399,
        },
        {
          name: 'فرع 6 أكتوبر',
          address: 'المحور المركزي، مدينة 6 أكتوبر، الجيزة',
          phone: '0238765432',
        },
      ],
      openingHours: [
        { days: 'السبت – الخميس', hours: '9:00 – 21:00' },
        { days: 'الجمعة', hours: 'مغلق' },
      ],
      defaultMetaTitle: 'مركز خدمة السيارات — زيوت وفلاتر وعناية بالسيارة في مصر',
      defaultMetaDescription:
        'زيوت محركات وفلاتر وبطاريات وإكسسوارات أصلية، مع تركيب على يد فنيين وحجز أونلاين وسجل صيانة رقمي مجاني لعربيتك.',
    },
  })

  await payload.updateGlobal({
    slug: 'navigation',
    locale: 'en',
    data: {
      header: [
        {
          label: 'Shop',
          href: '/shop',
          children: categories.map((category) => ({ label: category.en, href: `/shop/${category.key}` })),
        },
        { label: 'Oil Finder', href: '/oil-finder', children: [] },
        { label: 'Filter Lookup', href: '/filters', children: [] },
        { label: 'Car Wash', href: '/car-wash', children: [] },
      ],
      footerColumns: [
        {
          title: 'Shop',
          links: categories.slice(0, 4).map((category) => ({ label: category.en, href: `/shop/${category.key}` })),
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
          title: 'Account',
          links: [
            { label: 'My Account', href: '/account' },
            { label: 'Order History', href: '/account' },
          ],
        },
      ],
      footerNote: '© Auto Service Center. All rights reserved.',
    },
  })

  await payload.updateGlobal({
    slug: 'navigation',
    locale: 'ar',
    data: {
      header: [
        {
          label: 'المتجر',
          href: '/shop',
          children: categories.map((category) => ({ label: category.ar, href: `/shop/${category.key}` })),
        },
        { label: 'دليل الزيوت', href: '/oil-finder', children: [] },
        { label: 'دليل الفلاتر', href: '/filters', children: [] },
        { label: 'غسيل السيارات', href: '/car-wash', children: [] },
      ],
      footerColumns: [
        { title: 'المتجر', links: categories.slice(0, 4).map((c) => ({ label: c.ar, href: `/shop/${c.key}` })) },
        {
          title: 'الخدمات',
          links: [
            { label: 'دليل الزيوت', href: '/oil-finder' },
            { label: 'دليل الفلاتر', href: '/filters' },
            { label: 'حجز غسيل', href: '/car-wash' },
          ],
        },
        {
          title: 'حسابي',
          links: [
            { label: 'حسابي', href: '/account' },
            { label: 'طلباتي', href: '/account' },
          ],
        },
      ],
      footerNote: '© مركز خدمة السيارات. جميع الحقوق محفوظة.',
    },
  })

  await payload.updateGlobal({
    slug: 'homepage',
    locale: 'en',
    data: {
      sections: [
        {
          blockType: 'hero',
          eyebrow: 'Since 2009 · Cairo & Giza',
          headline: 'The right oil for your car, first time',
          subheadline:
            'Genuine oils, filters and parts, fitted by technicians who keep a full digital record of every car they touch.',
          backgroundImage: heroImage,
          buttons: [
            { label: 'Find my oil', href: '/oil-finder', style: 'primary' },
            { label: 'Book a wash', href: '/car-wash', style: 'outline' },
          ],
        },
        {
          blockType: 'services',
          heading: 'Everything your car needs, in one place',
          subheading: 'Four services, one record. Whatever we do to your car is saved to your account.',
          items: [
            { title: 'Oil change', description: 'The exact grade your engine needs, fitted while you wait.', icon: 'droplet', href: '/oil-finder' },
            { title: 'Filters', description: 'Oil, air, cabin and fuel filters for most cars on Egyptian roads.', icon: 'filter', href: '/filters' },
            { title: 'Batteries', description: 'Tested, fitted and disposed of properly — with a warranty.', icon: 'battery', href: '/shop/batteries' },
            { title: 'Wash & detailing', description: 'From a 30-minute express wash to full paint detailing.', icon: 'sparkles', href: '/car-wash' },
          ],
        },
        {
          blockType: 'featuredCategories',
          heading: 'Shop by category',
          subheading: 'Everything we stock, organised the way a workshop thinks.',
        },
        {
          blockType: 'featuredProducts',
          heading: 'Popular right now',
          subheading: 'What our customers are buying this month.',
          source: 'featured',
          limit: 8,
          ctaHref: '/shop',
        },
        {
          blockType: 'stats',
          items: [
            { value: '15+', label: 'Years serving Egyptian drivers' },
            { value: '48,000+', label: 'Cars serviced' },
            { value: '2', label: 'Branches in Cairo & Giza' },
            { value: '4.8/5', label: 'Average customer rating' },
          ],
        },
        {
          blockType: 'promoBanner',
          heading: 'Free delivery on orders over 1,500 EGP',
          body: 'Order oil and filters online and we will deliver anywhere in Greater Cairo — or fit them for you at the branch.',
          buttonLabel: 'Shop now',
          buttonHref: '/shop',
          image: promoImage,
          theme: 'accent',
        },
        {
          blockType: 'testimonials',
          heading: 'What our customers say',
          items: testimonials.map((item) => ({
            quote: item.quoteEn,
            author: item.author,
            carModel: item.car,
            rating: 5,
          })),
        },
      ],
      seo: {
        metaTitle: 'Auto Service Center — the right oil for your car',
        metaDescription:
          'Find the exact engine oil and filter for your car, order online with cash on delivery, and book a car wash in seconds.',
      },
    },
  })

  await payload.updateGlobal({
    slug: 'homepage',
    locale: 'ar',
    data: {
      sections: [
        {
          blockType: 'hero',
          eyebrow: 'منذ 2009 · القاهرة والجيزة',
          headline: 'الزيت الصح لعربيتك من أول مرة',
          subheadline:
            'زيوت وفلاتر وقطع غيار أصلية، بتركيب فنيين محترفين وسجل رقمي كامل لكل عربية بنخدمها.',
          backgroundImage: heroImage,
          buttons: [
            { label: 'اعرف زيت عربيتك', href: '/oil-finder', style: 'primary' },
            { label: 'احجز غسيل', href: '/car-wash', style: 'outline' },
          ],
        },
        {
          blockType: 'services',
          heading: 'كل اللي عربيتك محتاجاه في مكان واحد',
          subheading: 'أربع خدمات وسجل واحد. أي حاجة بنعملها لعربيتك بتتسجل في حسابك.',
          items: [
            { title: 'تغيير الزيت', description: 'اللزوجة المناسبة بالظبط لمحرك عربيتك، وانت مستني.', icon: 'droplet', href: '/oil-finder' },
            { title: 'الفلاتر', description: 'فلاتر زيت وهواء ومكيف وبنزين لمعظم العربيات في مصر.', icon: 'filter', href: '/filters' },
            { title: 'البطاريات', description: 'اختبار وتركيب وتخلص آمن من القديمة — مع ضمان.', icon: 'battery', href: '/shop/batteries' },
            { title: 'الغسيل والتلميع', description: 'من غسيل سريع في 30 دقيقة لتلميع شامل للدهان.', icon: 'sparkles', href: '/car-wash' },
          ],
        },
        { blockType: 'featuredCategories', heading: 'تسوق حسب القسم', subheading: 'كل اللي عندنا مرتب بطريقة الورشة.' },
        {
          blockType: 'featuredProducts',
          heading: 'الأكثر طلباً',
          subheading: 'اللي عملاؤنا بيشتروه الشهر ده.',
          source: 'featured',
          limit: 8,
          ctaHref: '/shop',
        },
        {
          blockType: 'stats',
          items: [
            { value: '+15', label: 'سنة في خدمة سائقي مصر' },
            { value: '+48,000', label: 'عربية تمت خدمتها' },
            { value: '2', label: 'فرع في القاهرة والجيزة' },
            { value: '4.8/5', label: 'متوسط تقييم العملاء' },
          ],
        },
        {
          blockType: 'promoBanner',
          heading: 'توصيل مجاني للطلبات فوق 1500 جنيه',
          body: 'اطلب الزيت والفلاتر أونلاين ونوصلهالك في القاهرة الكبرى — أو ركبهم عندنا في الفرع.',
          buttonLabel: 'تسوق الآن',
          buttonHref: '/shop',
          image: promoImage,
          theme: 'accent',
        },
        {
          blockType: 'testimonials',
          heading: 'رأي عملائنا',
          items: testimonials.map((item) => ({
            quote: item.quoteAr,
            author: item.author,
            carModel: item.car,
            rating: 5,
          })),
        },
      ],
      seo: {
        metaTitle: 'مركز خدمة السيارات — الزيت الصح لعربيتك',
        metaDescription:
          'اعرف الزيت والفلتر المناسبين لعربيتك بالظبط، اطلب أونلاين بالدفع عند الاستلام، واحجز غسيل في ثواني.',
      },
    },
  })

  console.log('\n✅ Seed complete.')
  console.log(`   Admin:    ${adminEmail} / ${adminPassword}`)
  console.log(`   Customer: 01001234567 / ${demoCustomerPassword}`)
  console.log('   These are demo accounts. Delete them before the shop goes live.')
  process.exit(0)
}

run().catch((error) => {
  console.error('Seed failed:', error)
  process.exit(1)
})
