/** Reference data for the demo database. Everything here is editable in /admin afterwards. */

export type SeedEngine = {
  code: string
  label: { en: string; ar: string }
  fuelType: 'petrol' | 'diesel' | 'hybrid' | 'cng'
  displacementLiters?: number
  isTurbo?: boolean
}

export type SeedModel = {
  name: string
  nameAr: string
  yearFrom: number
  yearTo?: number
  bodyType: 'sedan' | 'hatchback' | 'suv' | 'pickup' | 'van' | 'coupe'
  engines: SeedEngine[]
}

export type SeedBrand = {
  name: string
  nameAr: string
  country: string
  order: number
  models: SeedModel[]
}

const petrol = (
  code: string,
  en: string,
  ar: string,
  displacementLiters: number,
  isTurbo = false,
): SeedEngine => ({
  code,
  label: { en, ar },
  fuelType: 'petrol',
  displacementLiters,
  isTurbo,
})

export const brands: SeedBrand[] = [
  {
    name: 'Toyota',
    nameAr: 'تويوتا',
    country: 'Japan',
    order: 10,
    models: [
      {
        name: 'Corolla',
        nameAr: 'كورولا',
        yearFrom: 2014,
        bodyType: 'sedan',
        engines: [
          petrol('1.6-petrol', '1.6L Petrol', '1.6 لتر بنزين', 1.6),
          petrol('2.0-petrol', '2.0L Petrol', '2.0 لتر بنزين', 2),
        ],
      },
      {
        name: 'Yaris',
        nameAr: 'يارس',
        yearFrom: 2015,
        bodyType: 'sedan',
        engines: [petrol('1.5-petrol', '1.5L Petrol', '1.5 لتر بنزين', 1.5)],
      },
      {
        name: 'Fortuner',
        nameAr: 'فورتشنر',
        yearFrom: 2016,
        bodyType: 'suv',
        engines: [
          petrol('2.7-petrol', '2.7L Petrol', '2.7 لتر بنزين', 2.7),
          {
            code: '2.8-diesel',
            label: { en: '2.8L Diesel', ar: '2.8 لتر ديزل' },
            fuelType: 'diesel',
            displacementLiters: 2.8,
            isTurbo: true,
          },
        ],
      },
    ],
  },
  {
    name: 'Hyundai',
    nameAr: 'هيونداي',
    country: 'South Korea',
    order: 20,
    models: [
      {
        name: 'Elantra',
        nameAr: 'إلنترا',
        yearFrom: 2016,
        bodyType: 'sedan',
        engines: [
          petrol('1.6-petrol', '1.6L Petrol', '1.6 لتر بنزين', 1.6),
          petrol('2.0-petrol', '2.0L Petrol', '2.0 لتر بنزين', 2),
        ],
      },
      {
        name: 'Tucson',
        nameAr: 'توسان',
        yearFrom: 2016,
        bodyType: 'suv',
        engines: [
          petrol('1.6-turbo', '1.6L Turbo', '1.6 لتر تيربو', 1.6, true),
          petrol('2.0-petrol', '2.0L Petrol', '2.0 لتر بنزين', 2),
        ],
      },
      {
        name: 'Accent',
        nameAr: 'أكسنت',
        yearFrom: 2015,
        bodyType: 'sedan',
        engines: [petrol('1.6-petrol', '1.6L Petrol', '1.6 لتر بنزين', 1.6)],
      },
    ],
  },
  {
    name: 'Kia',
    nameAr: 'كيا',
    country: 'South Korea',
    order: 30,
    models: [
      {
        name: 'Cerato',
        nameAr: 'سيراتو',
        yearFrom: 2016,
        bodyType: 'sedan',
        engines: [petrol('1.6-petrol', '1.6L Petrol', '1.6 لتر بنزين', 1.6)],
      },
      {
        name: 'Sportage',
        nameAr: 'سبورتاج',
        yearFrom: 2017,
        bodyType: 'suv',
        engines: [petrol('2.0-petrol', '2.0L Petrol', '2.0 لتر بنزين', 2)],
      },
    ],
  },
  {
    name: 'Nissan',
    nameAr: 'نيسان',
    country: 'Japan',
    order: 40,
    models: [
      {
        name: 'Sunny',
        nameAr: 'صني',
        yearFrom: 2014,
        bodyType: 'sedan',
        engines: [petrol('1.5-petrol', '1.5L Petrol', '1.5 لتر بنزين', 1.5)],
      },
      {
        name: 'Qashqai',
        nameAr: 'قشقاي',
        yearFrom: 2017,
        bodyType: 'suv',
        engines: [petrol('2.0-petrol', '2.0L Petrol', '2.0 لتر بنزين', 2)],
      },
    ],
  },
  {
    name: 'Chevrolet',
    nameAr: 'شيفروليه',
    country: 'USA',
    order: 50,
    models: [
      {
        name: 'Optra',
        nameAr: 'أوبترا',
        yearFrom: 2010,
        yearTo: 2022,
        bodyType: 'sedan',
        engines: [petrol('1.6-petrol', '1.6L Petrol', '1.6 لتر بنزين', 1.6)],
      },
      {
        name: 'Captiva',
        nameAr: 'كابتيفا',
        yearFrom: 2015,
        bodyType: 'suv',
        engines: [petrol('2.4-petrol', '2.4L Petrol', '2.4 لتر بنزين', 2.4)],
      },
    ],
  },
  {
    name: 'Volkswagen',
    nameAr: 'فولكس فاجن',
    country: 'Germany',
    order: 60,
    models: [
      {
        name: 'Golf',
        nameAr: 'جولف',
        yearFrom: 2015,
        bodyType: 'hatchback',
        engines: [petrol('1.4-tsi', '1.4L TSI', '1.4 لتر تي إس آي', 1.4, true)],
      },
      {
        name: 'Passat',
        nameAr: 'باسات',
        yearFrom: 2016,
        bodyType: 'sedan',
        engines: [petrol('1.8-tsi', '1.8L TSI', '1.8 لتر تي إس آي', 1.8, true)],
      },
    ],
  },
  {
    name: 'Mercedes-Benz',
    nameAr: 'مرسيدس بنز',
    country: 'Germany',
    order: 70,
    models: [
      {
        name: 'C-Class',
        nameAr: 'الفئة C',
        yearFrom: 2015,
        bodyType: 'sedan',
        engines: [petrol('1.6-turbo', 'C180 1.6L Turbo', 'C180 1.6 تيربو', 1.6, true)],
      },
    ],
  },
  {
    name: 'BMW',
    nameAr: 'بي إم دبليو',
    country: 'Germany',
    order: 80,
    models: [
      {
        name: '320i',
        nameAr: '320i',
        yearFrom: 2015,
        bodyType: 'sedan',
        engines: [petrol('2.0-turbo', '2.0L Turbo', '2.0 لتر تيربو', 2, true)],
      },
    ],
  },
  {
    name: 'Renault',
    nameAr: 'رينو',
    country: 'France',
    order: 90,
    models: [
      {
        name: 'Logan',
        nameAr: 'لوجان',
        yearFrom: 2014,
        bodyType: 'sedan',
        engines: [petrol('1.6-petrol', '1.6L Petrol', '1.6 لتر بنزين', 1.6)],
      },
    ],
  },
  {
    name: 'MG',
    nameAr: 'إم جي',
    country: 'China',
    order: 100,
    models: [
      {
        name: 'MG5',
        nameAr: 'إم جي 5',
        yearFrom: 2020,
        bodyType: 'sedan',
        engines: [petrol('1.5-petrol', '1.5L Petrol', '1.5 لتر بنزين', 1.5)],
      },
      {
        name: 'ZS',
        nameAr: 'زد إس',
        yearFrom: 2019,
        bodyType: 'suv',
        engines: [petrol('1.5-petrol', '1.5L Petrol', '1.5 لتر بنزين', 1.5)],
      },
    ],
  },
]

export type SeedSpec = {
  brand: string
  model: string
  engineCode: string
  yearFrom: number
  yearTo?: number
  viscosity: string
  api: string
  acea?: string
  oilType: 'fullSynthetic' | 'semiSynthetic' | 'mineral'
  litres: number
  intervalKm: number
  intervalMonths: number
  oilFilterPart: string
  noteEn?: string
  noteAr?: string
}

export const specs: SeedSpec[] = [
  { brand: 'Toyota', model: 'Corolla', engineCode: '1.6-petrol', yearFrom: 2014, viscosity: '5W-30', api: 'API SN', acea: 'ACEA A3/B4', oilType: 'fullSynthetic', litres: 4.2, intervalKm: 10000, intervalMonths: 6, oilFilterPart: '04152-YZZA1' },
  { brand: 'Toyota', model: 'Corolla', engineCode: '2.0-petrol', yearFrom: 2019, viscosity: '0W-20', api: 'API SP', oilType: 'fullSynthetic', litres: 4.4, intervalKm: 10000, intervalMonths: 6, oilFilterPart: '04152-YZZA6' },
  { brand: 'Toyota', model: 'Yaris', engineCode: '1.5-petrol', yearFrom: 2015, viscosity: '5W-30', api: 'API SN', oilType: 'semiSynthetic', litres: 3.7, intervalKm: 8000, intervalMonths: 6, oilFilterPart: '04152-YZZA1' },
  { brand: 'Toyota', model: 'Fortuner', engineCode: '2.7-petrol', yearFrom: 2016, viscosity: '5W-30', api: 'API SN', oilType: 'fullSynthetic', litres: 5.7, intervalKm: 10000, intervalMonths: 6, oilFilterPart: '04152-YZZA5' },
  { brand: 'Toyota', model: 'Fortuner', engineCode: '2.8-diesel', yearFrom: 2016, viscosity: '5W-30', api: 'API CK-4', acea: 'ACEA C2', oilType: 'fullSynthetic', litres: 7.5, intervalKm: 10000, intervalMonths: 12, oilFilterPart: '04152-YZZA8', noteEn: 'Diesel engine — use a low-SAPS oil only.', noteAr: 'محرك ديزل — استخدم زيت منخفض الرماد فقط.' },
  { brand: 'Hyundai', model: 'Elantra', engineCode: '1.6-petrol', yearFrom: 2016, viscosity: '5W-30', api: 'API SN', oilType: 'fullSynthetic', litres: 3.6, intervalKm: 10000, intervalMonths: 6, oilFilterPart: '26300-35504' },
  { brand: 'Hyundai', model: 'Tucson', engineCode: '1.6-turbo', yearFrom: 2016, viscosity: '5W-30', api: 'API SN', acea: 'ACEA A5/B5', oilType: 'fullSynthetic', litres: 5.3, intervalKm: 8000, intervalMonths: 6, oilFilterPart: '26320-2A500', noteEn: 'Turbocharged — full synthetic only.', noteAr: 'محرك تيربو — زيت صناعي بالكامل فقط.' },
  { brand: 'Hyundai', model: 'Accent', engineCode: '1.6-petrol', yearFrom: 2015, viscosity: '5W-30', api: 'API SN', oilType: 'semiSynthetic', litres: 3.6, intervalKm: 8000, intervalMonths: 6, oilFilterPart: '26300-35503' },
  { brand: 'Kia', model: 'Cerato', engineCode: '1.6-petrol', yearFrom: 2016, viscosity: '5W-30', api: 'API SN', oilType: 'fullSynthetic', litres: 3.6, intervalKm: 10000, intervalMonths: 6, oilFilterPart: '26300-35505' },
  { brand: 'Kia', model: 'Sportage', engineCode: '2.0-petrol', yearFrom: 2017, viscosity: '5W-30', api: 'API SN', oilType: 'fullSynthetic', litres: 4.5, intervalKm: 10000, intervalMonths: 6, oilFilterPart: '26300-35530' },
  { brand: 'Nissan', model: 'Sunny', engineCode: '1.5-petrol', yearFrom: 2014, viscosity: '5W-30', api: 'API SN', oilType: 'semiSynthetic', litres: 3.4, intervalKm: 8000, intervalMonths: 6, oilFilterPart: '15208-65F0C' },
  { brand: 'Nissan', model: 'Qashqai', engineCode: '2.0-petrol', yearFrom: 2017, viscosity: '5W-40', api: 'API SN', oilType: 'fullSynthetic', litres: 4.4, intervalKm: 10000, intervalMonths: 6, oilFilterPart: '15208-65F0A' },
  { brand: 'Chevrolet', model: 'Optra', engineCode: '1.6-petrol', yearFrom: 2010, yearTo: 2022, viscosity: '10W-40', api: 'API SL', oilType: 'semiSynthetic', litres: 3.8, intervalKm: 7500, intervalMonths: 6, oilFilterPart: '25183779' },
  { brand: 'Chevrolet', model: 'Captiva', engineCode: '2.4-petrol', yearFrom: 2015, viscosity: '5W-30', api: 'API SN', oilType: 'fullSynthetic', litres: 5.2, intervalKm: 10000, intervalMonths: 6, oilFilterPart: '25195785' },
  { brand: 'Volkswagen', model: 'Golf', engineCode: '1.4-tsi', yearFrom: 2015, viscosity: '5W-40', api: 'API SN', acea: 'ACEA C3', oilType: 'fullSynthetic', litres: 4.3, intervalKm: 10000, intervalMonths: 12, oilFilterPart: '04E115561H', noteEn: 'VW 502 00 approval required.', noteAr: 'يتطلب اعتماد VW 502 00.' },
  { brand: 'Volkswagen', model: 'Passat', engineCode: '1.8-tsi', yearFrom: 2016, viscosity: '5W-40', api: 'API SN', acea: 'ACEA C3', oilType: 'fullSynthetic', litres: 5.7, intervalKm: 10000, intervalMonths: 12, oilFilterPart: '06L115562' },
  { brand: 'Mercedes-Benz', model: 'C-Class', engineCode: '1.6-turbo', yearFrom: 2015, viscosity: '5W-40', api: 'API SN', acea: 'ACEA C3', oilType: 'fullSynthetic', litres: 5.5, intervalKm: 10000, intervalMonths: 12, oilFilterPart: 'A2701800009', noteEn: 'MB 229.51 approval required.', noteAr: 'يتطلب اعتماد MB 229.51.' },
  { brand: 'BMW', model: '320i', engineCode: '2.0-turbo', yearFrom: 2015, viscosity: '5W-30', api: 'API SN', acea: 'ACEA C3', oilType: 'fullSynthetic', litres: 5.2, intervalKm: 10000, intervalMonths: 12, oilFilterPart: '11427953129', noteEn: 'BMW Longlife-01 approval required.', noteAr: 'يتطلب اعتماد BMW Longlife-01.' },
  { brand: 'Renault', model: 'Logan', engineCode: '1.6-petrol', yearFrom: 2014, viscosity: '5W-40', api: 'API SN', oilType: 'semiSynthetic', litres: 4.8, intervalKm: 10000, intervalMonths: 12, oilFilterPart: '152085505R' },
  { brand: 'MG', model: 'MG5', engineCode: '1.5-petrol', yearFrom: 2020, viscosity: '5W-30', api: 'API SN', oilType: 'fullSynthetic', litres: 4, intervalKm: 10000, intervalMonths: 12, oilFilterPart: '10123456' },
  { brand: 'MG', model: 'ZS', engineCode: '1.5-petrol', yearFrom: 2019, viscosity: '5W-30', api: 'API SN', oilType: 'fullSynthetic', litres: 4, intervalKm: 10000, intervalMonths: 12, oilFilterPart: '10123457' },
]

export type SeedProduct = {
  name: { en: string; ar: string }
  sku: string
  brand: string
  categoryKey: string
  productType: 'oil' | 'filter' | 'battery' | 'care' | 'accessory' | 'sparePart'
  price: number
  compareAtPrice?: number
  costPrice?: number
  stock: number
  volumeLiters?: number
  viscosity?: string
  apiSpec?: string
  aceaSpec?: string
  oilType?: 'fullSynthetic' | 'semiSynthetic' | 'mineral'
  filterType?: 'oil' | 'air' | 'cabin' | 'fuel'
  partNumber?: string
  featured?: boolean
  shortEn: string
  shortAr: string
  specs?: { label: { en: string; ar: string }; value: { en: string; ar: string } }[]
}

const oil = (
  name: string,
  sku: string,
  brand: string,
  viscosity: string,
  litres: number,
  price: number,
  oilType: SeedProduct['oilType'],
  apiSpec: string,
  featured = false,
): SeedProduct => ({
  name: { en: `${brand} ${name} ${viscosity} ${litres}L`, ar: `${brand} ${name} ${viscosity} ${litres} لتر` },
  sku,
  brand,
  categoryKey: 'engine-oils',
  productType: 'oil',
  price,
  compareAtPrice: featured ? Math.round(price * 1.15) : undefined,
  costPrice: Math.round(price * 0.72),
  stock: 20 + (sku.length % 30),
  volumeLiters: litres,
  viscosity,
  apiSpec,
  oilType,
  featured,
  shortEn: `${oilType === 'fullSynthetic' ? 'Fully synthetic' : oilType === 'semiSynthetic' ? 'Semi-synthetic' : 'Mineral'} engine oil, ${viscosity}, ${litres} litres.`,
  shortAr: `زيت محرك ${oilType === 'fullSynthetic' ? 'صناعي بالكامل' : oilType === 'semiSynthetic' ? 'نصف صناعي' : 'معدني'} ${viscosity} عبوة ${litres} لتر.`,
  specs: [
    { label: { en: 'Viscosity', ar: 'اللزوجة' }, value: { en: viscosity, ar: viscosity } },
    { label: { en: 'Specification', ar: 'المواصفة' }, value: { en: apiSpec, ar: apiSpec } },
    { label: { en: 'Volume', ar: 'الحجم' }, value: { en: `${litres} L`, ar: `${litres} لتر` } },
  ],
})

const filter = (
  name: { en: string; ar: string },
  sku: string,
  brand: string,
  filterType: NonNullable<SeedProduct['filterType']>,
  partNumber: string,
  price: number,
): SeedProduct => ({
  name,
  sku,
  brand,
  categoryKey: 'filters',
  productType: 'filter',
  price,
  costPrice: Math.round(price * 0.6),
  stock: 15 + (sku.length % 25),
  filterType,
  partNumber,
  shortEn: `Genuine-quality ${filterType} filter, part ${partNumber}.`,
  shortAr: `فلتر ${filterType === 'oil' ? 'زيت' : filterType === 'air' ? 'هواء' : filterType === 'cabin' ? 'مكيف' : 'بنزين'} بجودة الوكيل، رقم ${partNumber}.`,
  specs: [{ label: { en: 'Part number', ar: 'رقم القطعة' }, value: { en: partNumber, ar: partNumber } }],
})

export const products: SeedProduct[] = [
  // --- Engine oils
  oil('Super 3000', 'OIL-MOB-5W40-4', 'Mobil', '5W-40', 4, 1850, 'fullSynthetic', 'API SN', true),
  oil('Super 3000', 'OIL-MOB-5W40-1', 'Mobil', '5W-40', 1, 520, 'fullSynthetic', 'API SN'),
  oil('Mobil 1', 'OIL-MOB-0W20-4', 'Mobil', '0W-20', 4, 2450, 'fullSynthetic', 'API SP', true),
  oil('Super 2000', 'OIL-MOB-10W40-4', 'Mobil', '10W-40', 4, 1150, 'semiSynthetic', 'API SL'),
  oil('Magnatec', 'OIL-CAS-5W30-4', 'Castrol', '5W-30', 4, 1950, 'fullSynthetic', 'API SN', true),
  oil('Magnatec', 'OIL-CAS-5W30-1', 'Castrol', '5W-30', 1, 540, 'fullSynthetic', 'API SN'),
  oil('GTX', 'OIL-CAS-10W40-4', 'Castrol', '10W-40', 4, 1080, 'semiSynthetic', 'API SL'),
  oil('EDGE', 'OIL-CAS-5W40-4', 'Castrol', '5W-40', 4, 2250, 'fullSynthetic', 'API SN'),
  oil('Top Tec 4200', 'OIL-LM-5W30-5', 'Liqui Moly', '5W-30', 5, 3200, 'fullSynthetic', 'API SN', true),
  oil('Molygen', 'OIL-LM-5W40-4', 'Liqui Moly', '5W-40', 4, 2950, 'fullSynthetic', 'API SN'),
  oil('MaxLife', 'OIL-VAL-10W40-4', 'Valvoline', '10W-40', 4, 1290, 'semiSynthetic', 'API SN'),
  oil('SynPower', 'OIL-VAL-5W30-4', 'Valvoline', '5W-30', 4, 1990, 'fullSynthetic', 'API SN'),
  oil('Helix HX8', 'OIL-SHL-5W40-4', 'Shell', '5W-40', 4, 1890, 'fullSynthetic', 'API SN'),
  oil('Helix HX7', 'OIL-SHL-10W40-4', 'Shell', '10W-40', 4, 1120, 'semiSynthetic', 'API SL'),
  oil('Quartz 9000', 'OIL-TOT-5W30-4', 'Total', '5W-30', 4, 1780, 'fullSynthetic', 'API SN'),
  oil('Quartz 7000', 'OIL-TOT-10W40-4', 'Total', '10W-40', 4, 1050, 'semiSynthetic', 'API SL'),

  // --- Filters
  filter({ en: 'Oil Filter — Toyota 1.6/1.8', ar: 'فلتر زيت — تويوتا 1.6/1.8' }, 'FIL-OIL-TOY-01', 'Denso', 'oil', '04152-YZZA1', 185),
  filter({ en: 'Oil Filter — Toyota 2.0 Dual VVT', ar: 'فلتر زيت — تويوتا 2.0' }, 'FIL-OIL-TOY-02', 'Denso', 'oil', '04152-YZZA6', 210),
  filter({ en: 'Oil Filter — Toyota 2.7 / Fortuner', ar: 'فلتر زيت — تويوتا 2.7' }, 'FIL-OIL-TOY-03', 'Denso', 'oil', '04152-YZZA5', 235),
  filter({ en: 'Oil Filter — Toyota 2.8 Diesel', ar: 'فلتر زيت — تويوتا 2.8 ديزل' }, 'FIL-OIL-TOY-04', 'Denso', 'oil', '04152-YZZA8', 320),
  filter({ en: 'Oil Filter — Hyundai/Kia 1.6', ar: 'فلتر زيت — هيونداي/كيا 1.6' }, 'FIL-OIL-HYU-01', 'Mobis', 'oil', '26300-35504', 175),
  filter({ en: 'Oil Filter — Hyundai 1.6 Turbo', ar: 'فلتر زيت — هيونداي 1.6 تيربو' }, 'FIL-OIL-HYU-02', 'Mobis', 'oil', '26320-2A500', 265),
  filter({ en: 'Oil Filter — Hyundai Accent', ar: 'فلتر زيت — هيونداي أكسنت' }, 'FIL-OIL-HYU-03', 'Mobis', 'oil', '26300-35503', 165),
  filter({ en: 'Oil Filter — Kia Cerato', ar: 'فلتر زيت — كيا سيراتو' }, 'FIL-OIL-KIA-01', 'Mobis', 'oil', '26300-35505', 180),
  filter({ en: 'Oil Filter — Kia Sportage 2.0', ar: 'فلتر زيت — كيا سبورتاج' }, 'FIL-OIL-KIA-02', 'Mobis', 'oil', '26300-35530', 195),
  filter({ en: 'Oil Filter — Nissan 1.5', ar: 'فلتر زيت — نيسان 1.5' }, 'FIL-OIL-NIS-01', 'Nissan', 'oil', '15208-65F0C', 190),
  filter({ en: 'Oil Filter — Nissan 2.0', ar: 'فلتر زيت — نيسان 2.0' }, 'FIL-OIL-NIS-02', 'Nissan', 'oil', '15208-65F0A', 205),
  filter({ en: 'Oil Filter — Chevrolet Optra', ar: 'فلتر زيت — شيفروليه أوبترا' }, 'FIL-OIL-CHV-01', 'ACDelco', 'oil', '25183779', 155),
  filter({ en: 'Oil Filter — Chevrolet Captiva', ar: 'فلتر زيت — شيفروليه كابتيفا' }, 'FIL-OIL-CHV-02', 'ACDelco', 'oil', '25195785', 230),
  filter({ en: 'Oil Filter — VW 1.4 TSI', ar: 'فلتر زيت — فولكس 1.4 TSI' }, 'FIL-OIL-VW-01', 'Mann', 'oil', '04E115561H', 340),
  filter({ en: 'Oil Filter — VW 1.8 TSI', ar: 'فلتر زيت — فولكس 1.8 TSI' }, 'FIL-OIL-VW-02', 'Mann', 'oil', '06L115562', 385),
  filter({ en: 'Oil Filter — Mercedes C180', ar: 'فلتر زيت — مرسيدس C180' }, 'FIL-OIL-MB-01', 'Mann', 'oil', 'A2701800009', 520),
  filter({ en: 'Oil Filter — BMW 320i', ar: 'فلتر زيت — بي إم دبليو 320i' }, 'FIL-OIL-BMW-01', 'Mahle', 'oil', '11427953129', 495),
  filter({ en: 'Oil Filter — Renault Logan', ar: 'فلتر زيت — رينو لوجان' }, 'FIL-OIL-REN-01', 'Mann', 'oil', '152085505R', 210),
  filter({ en: 'Oil Filter — MG 1.5', ar: 'فلتر زيت — إم جي 1.5' }, 'FIL-OIL-MG-01', 'MG', 'oil', '10123456', 220),
  filter({ en: 'Air Filter — Corolla 1.6', ar: 'فلتر هواء — كورولا 1.6' }, 'FIL-AIR-TOY-01', 'Denso', 'air', '17801-0T030', 290),
  filter({ en: 'Air Filter — Elantra 1.6', ar: 'فلتر هواء — إلنترا 1.6' }, 'FIL-AIR-HYU-01', 'Mobis', 'air', '28113-F2000', 265),
  filter({ en: 'Cabin Filter — Corolla', ar: 'فلتر مكيف — كورولا' }, 'FIL-CAB-TOY-01', 'Denso', 'cabin', '87139-0N010', 245),
  filter({ en: 'Cabin Filter — Elantra', ar: 'فلتر مكيف — إلنترا' }, 'FIL-CAB-HYU-01', 'Mobis', 'cabin', '97133-F2000', 235),
  filter({ en: 'Fuel Filter — Fortuner Diesel', ar: 'فلتر بنزين — فورتشنر ديزل' }, 'FIL-FUE-TOY-01', 'Denso', 'fuel', '23390-0L041', 690),

  // --- Batteries
  {
    name: { en: 'Chloride 70Ah Battery', ar: 'بطارية كلورايد 70 أمبير' },
    sku: 'BAT-CHL-70',
    brand: 'Chloride',
    categoryKey: 'batteries',
    productType: 'battery',
    price: 4200,
    costPrice: 3300,
    stock: 12,
    featured: true,
    shortEn: 'Maintenance-free 70Ah battery with 2-year warranty.',
    shortAr: 'بطارية 70 أمبير بدون صيانة مع ضمان سنتين.',
    specs: [
      { label: { en: 'Capacity', ar: 'السعة' }, value: { en: '70 Ah', ar: '70 أمبير' } },
      { label: { en: 'Warranty', ar: 'الضمان' }, value: { en: '2 years', ar: 'سنتان' } },
    ],
  },
  {
    name: { en: 'Chloride 45Ah Battery', ar: 'بطارية كلورايد 45 أمبير' },
    sku: 'BAT-CHL-45',
    brand: 'Chloride',
    categoryKey: 'batteries',
    productType: 'battery',
    price: 3100,
    costPrice: 2400,
    stock: 9,
    shortEn: 'Compact 45Ah battery for small engines.',
    shortAr: 'بطارية 45 أمبير مناسبة للمحركات الصغيرة.',
  },
  {
    name: { en: 'Varta Blue Dynamic 60Ah', ar: 'بطارية فارتا بلو 60 أمبير' },
    sku: 'BAT-VAR-60',
    brand: 'Varta',
    categoryKey: 'batteries',
    productType: 'battery',
    price: 5400,
    costPrice: 4300,
    stock: 6,
    shortEn: 'German-made 60Ah battery, high cold-cranking amps.',
    shortAr: 'بطارية ألماني 60 أمبير بقوة تشغيل عالية.',
  },

  // --- Care products
  {
    name: { en: 'Engine Flush 400ml', ar: 'منظف محرك 400 مل' },
    sku: 'CAR-FLUSH-400',
    brand: 'Liqui Moly',
    categoryKey: 'car-care',
    productType: 'care',
    price: 460,
    costPrice: 330,
    stock: 40,
    shortEn: 'Cleans the engine internals before an oil change.',
    shortAr: 'ينظف المحرك من الداخل قبل تغيير الزيت.',
  },
  {
    name: { en: 'Radiator Coolant 1L', ar: 'مياه رادياتير 1 لتر' },
    sku: 'CAR-COOL-1',
    brand: 'Total',
    categoryKey: 'car-care',
    productType: 'care',
    price: 240,
    costPrice: 160,
    stock: 60,
    shortEn: 'Ready-to-use long-life coolant.',
    shortAr: 'سائل تبريد جاهز للاستخدام طويل العمر.',
  },
  {
    name: { en: 'Brake Fluid DOT 4', ar: 'زيت فرامل DOT 4' },
    sku: 'CAR-BRAKE-DOT4',
    brand: 'Bosch',
    categoryKey: 'car-care',
    productType: 'care',
    price: 320,
    costPrice: 220,
    stock: 35,
    shortEn: 'DOT 4 brake fluid, 1 litre.',
    shortAr: 'زيت فرامل DOT 4 عبوة 1 لتر.',
  },
  {
    name: { en: 'Car Shampoo 1L', ar: 'شامبو غسيل سيارات 1 لتر' },
    sku: 'CAR-SHAMPOO-1',
    brand: 'Meguiars',
    categoryKey: 'car-care',
    productType: 'care',
    price: 380,
    costPrice: 250,
    stock: 45,
    featured: true,
    shortEn: 'pH-neutral shampoo, safe on wax and ceramic coatings.',
    shortAr: 'شامبو متعادل الحموضة آمن على الطلاء والسيراميك.',
  },
  {
    name: { en: 'Dashboard Polish 500ml', ar: 'ملمع تابلوه 500 مل' },
    sku: 'CAR-DASH-500',
    brand: 'Meguiars',
    categoryKey: 'car-care',
    productType: 'care',
    price: 290,
    costPrice: 190,
    stock: 50,
    shortEn: 'Non-greasy interior polish with UV protection.',
    shortAr: 'ملمع داخلي غير دهني مع حماية من الشمس.',
  },

  // --- Accessories
  {
    name: { en: 'Microfibre Cloth (3 pack)', ar: 'فوطة مايكروفايبر (3 قطع)' },
    sku: 'ACC-MFC-3',
    brand: 'Generic',
    categoryKey: 'accessories',
    productType: 'accessory',
    price: 180,
    costPrice: 110,
    stock: 80,
    shortEn: 'Lint-free cloths for drying and polishing.',
    shortAr: 'فوط بدون وبر للتجفيف والتلميع.',
  },
  {
    name: { en: 'Digital Tyre Pressure Gauge', ar: 'جهاز قياس ضغط الإطارات' },
    sku: 'ACC-TPG-01',
    brand: 'Michelin',
    categoryKey: 'accessories',
    productType: 'accessory',
    price: 620,
    costPrice: 430,
    stock: 22,
    shortEn: 'Accurate digital gauge with backlit display.',
    shortAr: 'جهاز رقمي دقيق بشاشة مضيئة.',
  },
  {
    name: { en: 'Car Vacuum 12V', ar: 'مكنسة سيارة 12 فولت' },
    sku: 'ACC-VAC-12',
    brand: 'Bosch',
    categoryKey: 'accessories',
    productType: 'accessory',
    price: 1350,
    costPrice: 980,
    stock: 14,
    featured: true,
    shortEn: 'Plugs into the cigarette lighter, 5m cable.',
    shortAr: 'تعمل من ولاعة السيارة، سلك 5 متر.',
  },
  {
    name: { en: 'Phone Mount — Air Vent', ar: 'حامل موبايل للتكييف' },
    sku: 'ACC-MNT-01',
    brand: 'Generic',
    categoryKey: 'accessories',
    productType: 'accessory',
    price: 240,
    costPrice: 140,
    stock: 65,
    shortEn: 'Magnetic mount that clips to the air vent.',
    shortAr: 'حامل مغناطيسي يثبت على فتحة التكييف.',
  },
  {
    name: { en: 'Jump Starter 12000mAh', ar: 'جهاز تشغيل بطارية 12000 مللي' },
    sku: 'ACC-JMP-12',
    brand: 'Generic',
    categoryKey: 'accessories',
    productType: 'accessory',
    price: 2450,
    costPrice: 1800,
    stock: 8,
    shortEn: 'Starts a flat battery and charges your phone.',
    shortAr: 'يشغل البطارية الفاضية ويشحن الموبايل.',
  },

  // --- Spare parts
  {
    name: { en: 'Front Brake Pads — Corolla', ar: 'تيل فرامل أمامي — كورولا' },
    sku: 'SPR-BRK-TOY-01',
    brand: 'Bosch',
    categoryKey: 'spare-parts',
    productType: 'sparePart',
    price: 1450,
    costPrice: 1050,
    stock: 18,
    shortEn: 'Ceramic front pads, low dust.',
    shortAr: 'تيل سيراميك أمامي قليل الأتربة.',
  },
  {
    name: { en: 'Spark Plugs — Iridium (set of 4)', ar: 'بوچيهات إيريديوم (طقم 4)' },
    sku: 'SPR-PLG-IR-4',
    brand: 'Denso',
    categoryKey: 'spare-parts',
    productType: 'sparePart',
    price: 1780,
    costPrice: 1300,
    stock: 25,
    featured: true,
    shortEn: 'Long-life iridium plugs, up to 100,000 km.',
    shortAr: 'بوچيهات إيريديوم تدوم حتى 100 ألف كم.',
  },
  {
    name: { en: 'Wiper Blades 24" + 16"', ar: 'مساحات زجاج 24 + 16 بوصة' },
    sku: 'SPR-WIP-2416',
    brand: 'Bosch',
    categoryKey: 'spare-parts',
    productType: 'sparePart',
    price: 690,
    costPrice: 470,
    stock: 30,
    shortEn: 'Flat-blade wipers, quiet in heavy rain.',
    shortAr: 'مساحات مسطحة هادئة في المطر الغزير.',
  },
]

export const categories = [
  { key: 'engine-oils', en: 'Engine Oils', ar: 'زيوت المحركات', icon: 'droplet', order: 10, home: true },
  { key: 'filters', en: 'Filters', ar: 'الفلاتر', icon: 'filter', order: 20, home: true },
  { key: 'batteries', en: 'Batteries', ar: 'البطاريات', icon: 'battery', order: 30, home: true },
  { key: 'car-care', en: 'Car Care', ar: 'العناية بالسيارة', icon: 'sparkles', order: 40, home: true },
  { key: 'accessories', en: 'Accessories', ar: 'الإكسسوارات', icon: 'package', order: 50, home: true },
  { key: 'spare-parts', en: 'Spare Parts', ar: 'قطع الغيار', icon: 'wrench', order: 60, home: true },
]

export const washServices = [
  {
    en: 'Express Wash',
    ar: 'غسيل سريع',
    descEn: 'Exterior wash and hand dry in under half an hour.',
    descAr: 'غسيل خارجي وتجفيف يدوي في أقل من نصف ساعة.',
    price: 150,
    minutes: 30,
    popular: false,
    includes: [
      { en: 'Exterior foam wash', ar: 'غسيل بالرغوة' },
      { en: 'Hand dry', ar: 'تجفيف يدوي' },
      { en: 'Tyre shine', ar: 'تلميع الكاوتش' },
    ],
  },
  {
    en: 'Full Wash — Inside & Out',
    ar: 'غسيل كامل داخلي وخارجي',
    descEn: 'Exterior wash plus a full interior vacuum and wipe-down.',
    descAr: 'غسيل خارجي مع تنظيف داخلي كامل بالمكنسة والمسح.',
    price: 280,
    minutes: 60,
    popular: true,
    includes: [
      { en: 'Everything in Express Wash', ar: 'كل ما في الغسيل السريع' },
      { en: 'Interior vacuum', ar: 'شفط داخلي' },
      { en: 'Dashboard and door panels', ar: 'تنظيف التابلوه والأبواب' },
      { en: 'Window cleaning', ar: 'تنظيف الزجاج' },
    ],
  },
  {
    en: 'Polish & Wax',
    ar: 'تلميع وشمع',
    descEn: 'Machine polish and protective wax for a deep gloss.',
    descAr: 'تلميع بالمكينة وطبقة شمع حماية للمعان عميق.',
    price: 900,
    minutes: 150,
    popular: false,
    includes: [
      { en: 'Full wash', ar: 'غسيل كامل' },
      { en: 'Machine polish', ar: 'تلميع بالمكينة' },
      { en: 'Protective wax layer', ar: 'طبقة شمع حماية' },
    ],
  },
  {
    en: 'Full Detailing',
    ar: 'تفصيل شامل',
    descEn: 'Deep interior and exterior detailing, engine bay included.',
    descAr: 'تنظيف عميق داخلي وخارجي شامل غرفة المحرك.',
    price: 2200,
    minutes: 240,
    popular: false,
    includes: [
      { en: 'Everything in Polish & Wax', ar: 'كل ما في التلميع والشمع' },
      { en: 'Seat and carpet shampoo', ar: 'غسيل الكراسي والموكيت' },
      { en: 'Engine bay clean', ar: 'تنظيف غرفة المحرك' },
      { en: 'Headlight restoration', ar: 'تلميع الكشافات' },
    ],
  },
]

export const adjustmentRules = [
  {
    name: 'High mileage — over 150,000 km',
    priority: 10,
    minMileageKm: 150000,
    viscosityShift: 'thicker' as const,
    intervalKmMultiplier: 0.85,
    intervalMonthsMultiplier: 1,
    noteEn: 'Your engine has covered a high mileage, so we suggest a slightly thicker oil and a shorter interval.',
    noteAr: 'عربيتك مشيت مسافة كبيرة، لذلك نرشح لزوجة أعلى قليلاً وفترة تغيير أقصر.',
  },
  {
    name: 'Engine consumes oil',
    priority: 20,
    engineConditions: ['consumesOil'],
    viscosityShift: 'thicker' as const,
    intervalKmMultiplier: 0.8,
    intervalMonthsMultiplier: 0.8,
    noteEn: 'Because the engine burns oil, check the level every 1,000 km and top up as needed.',
    noteAr: 'لأن المحرك بيستهلك زيت، افحص المستوى كل 1000 كم وأضف عند اللزوم.',
  },
  {
    name: 'Recently rebuilt engine',
    priority: 30,
    engineConditions: ['rebuilt'],
    intervalKmMultiplier: 0.5,
    intervalMonthsMultiplier: 0.5,
    flagForStaffReview: true,
    noteEn: 'After a rebuild the first oil change should come early — our technician will confirm the running-in oil.',
    noteAr: 'بعد العمرة، أول تغيير زيت لازم يكون مبكر — الفني هيأكد لك زيت التجربة المناسب.',
  },
  {
    name: 'Turbo engines — synthetic only',
    priority: 40,
    turboOnly: true,
    forceOilType: 'fullSynthetic' as const,
    intervalKmMultiplier: 0.9,
    intervalMonthsMultiplier: 1,
    noteEn: 'Turbocharged engines run hotter — full synthetic oil only.',
    noteAr: 'المحركات التيربو حرارتها أعلى — زيت صناعي بالكامل فقط.',
  },
  {
    name: 'Nearly new engine — under 20,000 km',
    priority: 50,
    maxMileageKm: 20000,
    engineConditions: ['excellent'],
    intervalKmMultiplier: 1,
    intervalMonthsMultiplier: 1,
    noteEn: 'Your engine is in excellent condition — stick to the manufacturer interval.',
    noteAr: 'محرك عربيتك في حالة ممتازة — التزم بالفترة الموصى بها من المصنع.',
  },
]

export const demoCustomers = [
  { name: 'Ahmed Hassan', nameAr: 'أحمد حسن', phone: '01001234567', city: 'Nasr City' },
  { name: 'Mona Saeed', nameAr: 'منى سعيد', phone: '01112345678', city: 'Maadi' },
  { name: 'Karim Fouad', nameAr: 'كريم فؤاد', phone: '01223456789', city: '6th of October' },
  { name: 'Sara Adel', nameAr: 'سارة عادل', phone: '01034567890', city: 'Heliopolis' },
  { name: 'Mahmoud Zaki', nameAr: 'محمود زكي', phone: '01145678901', city: 'Giza' },
  { name: 'Nourhan Ali', nameAr: 'نورهان علي', phone: '01256789012', city: 'New Cairo' },
]

export const demoVehicles = [
  { plate: 'س ن ر 4521', brand: 'Toyota', model: 'Corolla', year: 2019, engine: '1.6-petrol', mileage: 84000, customerIndex: 0 },
  { plate: 'ط ك ع 1234', brand: 'Hyundai', model: 'Elantra', year: 2021, engine: '1.6-petrol', mileage: 42000, customerIndex: 1 },
  { plate: 'ل م ي 7788', brand: 'Kia', model: 'Cerato', year: 2018, engine: '1.6-petrol', mileage: 132000, customerIndex: 2 },
  { plate: 'ب ح د 9012', brand: 'Nissan', model: 'Sunny', year: 2017, engine: '1.5-petrol', mileage: 165000, customerIndex: 3 },
  { plate: 'ق ص ف 3344', brand: 'Volkswagen', model: 'Golf', year: 2020, engine: '1.4-tsi', mileage: 58000, customerIndex: 4 },
  { plate: 'أ ب ج 5566', brand: 'MG', model: 'MG5', year: 2022, engine: '1.5-petrol', mileage: 26000, customerIndex: 5 },
  { plate: 'ر ز و 2211', brand: 'Toyota', model: 'Fortuner', year: 2020, engine: '2.7-petrol', mileage: 71000, customerIndex: 0 },
  { plate: 'ه ع خ 8899', brand: 'Hyundai', model: 'Tucson', year: 2019, engine: '1.6-turbo', mileage: 96000, customerIndex: 1 },
]

export const testimonials = [
  {
    quoteEn: 'They told me exactly which oil my Corolla needs and fitted it the same day. No guessing, no upselling.',
    quoteAr: 'قالولي بالظبط الزيت المناسب للكورولا وركبوه في نفس اليوم. من غير تخمين ولا كلام زيادة.',
    author: 'Ahmed Hassan',
    car: 'Toyota Corolla 2019',
  },
  {
    quoteEn: 'The service history on my account is genuinely useful — I know exactly when the next change is due.',
    quoteAr: 'سجل الصيانة في حسابي مفيد جداً — بعرف بالظبط موعد التغيير الجاي.',
    author: 'Mona Saeed',
    car: 'Hyundai Elantra 2021',
  },
  {
    quoteEn: 'Booked a full wash online in a minute and the car was ready exactly on time.',
    quoteAr: 'حجزت غسيل كامل أونلاين في دقيقة والعربية كانت جاهزة في الميعاد بالظبط.',
    author: 'Karim Fouad',
    car: 'Kia Cerato 2018',
  },
]
