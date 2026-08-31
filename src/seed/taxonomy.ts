/**
 * The full parts taxonomy. Two levels deep on purpose — deeper trees are harder
 * to browse and dilute category pages for search engines.
 *
 * `icon` maps to the icon list on the productCategories collection.
 * `productTypes` records which of the existing product types belong under a
 * branch, which is what lets the remapper move current stock onto the new tree.
 */
export type SubCategory = {
  key: string
  en: string
  ar: string
  productTypes?: string[]
  /** Matched against product name/SKU when remapping existing stock. */
  match?: string[]
}

export type TopCategory = {
  key: string
  en: string
  ar: string
  icon: string
  order: number
  home?: boolean
  children: SubCategory[]
}

export const taxonomy: TopCategory[] = [
  {
    key: 'oils-fluids',
    en: 'Engine Oils & Fluids',
    ar: 'الزيوت والسوائل',
    icon: 'droplet',
    order: 10,
    home: true,
    children: [
      { key: 'engine-oil', en: 'Engine Oil', ar: 'زيت المحرك', productTypes: ['oil'] },
      { key: 'gearbox-oil', en: 'Gearbox & Transmission Oil', ar: 'زيت الفتيس', match: ['gearbox', 'transmission'] },
      { key: 'brake-fluid', en: 'Brake Fluid', ar: 'زيت الفرامل', match: ['brake fluid', 'dot 4'] },
      { key: 'coolant', en: 'Coolant & Antifreeze', ar: 'مياه التبريد', match: ['coolant', 'radiator'] },
      { key: 'power-steering-fluid', en: 'Power Steering Fluid', ar: 'زيت الباور', match: ['power steering'] },
      { key: 'additives', en: 'Additives & Flushes', ar: 'إضافات ومنظفات', match: ['flush', 'additive', 'a/c system'] },
    ],
  },
  {
    key: 'filters',
    en: 'Filters',
    ar: 'الفلاتر',
    icon: 'filter',
    order: 20,
    home: true,
    children: [
      { key: 'oil-filters', en: 'Oil Filters', ar: 'فلاتر الزيت', match: ['oil filter'] },
      { key: 'air-filters', en: 'Air Filters', ar: 'فلاتر الهواء', match: ['air filter'] },
      { key: 'cabin-filters', en: 'Cabin Filters', ar: 'فلاتر المكيف', match: ['cabin filter'] },
      { key: 'fuel-filters', en: 'Fuel Filters', ar: 'فلاتر البنزين', match: ['fuel filter'] },
    ],
  },
  {
    key: 'batteries-electrical',
    en: 'Batteries & Electrical',
    ar: 'البطاريات والكهرباء',
    icon: 'battery',
    order: 30,
    home: true,
    children: [
      { key: 'batteries', en: 'Batteries', ar: 'البطاريات', productTypes: ['battery'] },
      { key: 'bulbs-lighting', en: 'Bulbs & Lighting', ar: 'اللمبات والإضاءة', match: ['bulb', 'headlight'] },
      { key: 'alternators-starters', en: 'Alternators & Starters', ar: 'الدينامو والمارش' },
      { key: 'sensors', en: 'Sensors & Switches', ar: 'الحساسات' },
    ],
  },
  {
    key: 'brakes',
    en: 'Brakes',
    ar: 'الفرامل',
    icon: 'wrench',
    order: 40,
    home: true,
    children: [
      { key: 'brake-pads', en: 'Brake Pads', ar: 'تيل الفرامل', match: ['brake pads'] },
      { key: 'brake-discs', en: 'Discs & Drums', ar: 'الهوبات والطنابير', match: ['brake disc'] },
      { key: 'callipers', en: 'Callipers & Cylinders', ar: 'الفرامل الهيدروليك' },
    ],
  },
  {
    key: 'suspension-steering',
    en: 'Suspension & Steering',
    ar: 'العفشة والدركسيون',
    icon: 'car',
    order: 50,
    children: [
      { key: 'shock-absorbers', en: 'Shock Absorbers', ar: 'المساعدين' },
      { key: 'springs-arms', en: 'Springs & Control Arms', ar: 'السوست والمقصات' },
      { key: 'bushings', en: 'Bushings & Mounts', ar: 'الجلب والكراسي' },
      { key: 'steering', en: 'Steering Parts', ar: 'أجزاء الدركسيون' },
    ],
  },
  {
    key: 'engine-parts',
    en: 'Engine Parts',
    ar: 'أجزاء المحرك',
    icon: 'wrench',
    order: 60,
    home: true,
    children: [
      { key: 'belts-chains', en: 'Belts & Chains', ar: 'السيور والكاتينة', match: ['timing belt', 'belt'] },
      { key: 'spark-plugs', en: 'Spark & Glow Plugs', ar: 'البوچيهات', match: ['spark plug'] },
      { key: 'gaskets', en: 'Gaskets & Seals', ar: 'الجوانات' },
      { key: 'pumps', en: 'Pumps', ar: 'الطلمبات' },
      { key: 'cooling', en: 'Radiators & Cooling', ar: 'الرادياتير والتبريد' },
    ],
  },
  {
    key: 'transmission',
    en: 'Transmission & Drivetrain',
    ar: 'الفتيس ونقل الحركة',
    icon: 'car',
    order: 70,
    children: [
      { key: 'clutch', en: 'Clutch Kits', ar: 'أطقم الدبرياج' },
      { key: 'cv-joints', en: 'CV Joints & Axles', ar: 'العكوس والإكصاصات' },
    ],
  },
  {
    key: 'tyres-wheels',
    en: 'Tyres & Wheels',
    ar: 'الإطارات والجنوط',
    icon: 'car',
    order: 80,
    children: [
      { key: 'tyres', en: 'Tyres', ar: 'الإطارات' },
      { key: 'rims', en: 'Rims', ar: 'الجنوط' },
      { key: 'wheel-accessories', en: 'Wheel Accessories', ar: 'إكسسوارات العجل', match: ['tyre pressure'] },
    ],
  },
  {
    key: 'body-exterior',
    en: 'Body & Exterior',
    ar: 'الهيكل والمظهر الخارجي',
    icon: 'car',
    order: 90,
    children: [
      { key: 'wipers', en: 'Wiper Blades', ar: 'المساحات', match: ['wiper'] },
      { key: 'mirrors', en: 'Mirrors', ar: 'المرايات' },
      { key: 'lights-lenses', en: 'Lights & Lenses', ar: 'الكشافات' },
      { key: 'body-trim', en: 'Trim & Body Parts', ar: 'قطع الهيكل', match: ['car cover'] },
    ],
  },
  {
    key: 'interior-accessories',
    en: 'Interior & Accessories',
    ar: 'الديكور والإكسسوارات',
    icon: 'package',
    order: 100,
    home: true,
    children: [
      { key: 'floor-mats', en: 'Floor Mats', ar: 'الدواسات', match: ['floor mats'] },
      { key: 'seat-covers', en: 'Seat Covers', ar: 'أغطية الكراسي' },
      { key: 'phone-mounts', en: 'Phone Mounts & Chargers', ar: 'حوامل وشواحن', match: ['phone mount', 'charger'] },
      { key: 'organisers', en: 'Organisers & Storage', ar: 'منظمات وتخزين' },
    ],
  },
  {
    key: 'car-care',
    en: 'Car Care & Detailing',
    ar: 'العناية والتلميع',
    icon: 'sparkles',
    order: 110,
    home: true,
    children: [
      { key: 'shampoo', en: 'Shampoo & Wash', ar: 'الشامبو والغسيل', match: ['shampoo', 'glass cleaner'] },
      { key: 'wax-polish', en: 'Wax & Polish', ar: 'الشمع والتلميع', match: ['wax', 'polish'] },
      { key: 'interior-care', en: 'Interior Care', ar: 'العناية الداخلية', match: ['dashboard'] },
      { key: 'tyre-care', en: 'Tyre Care', ar: 'العناية بالإطارات', match: ['tyre shine'] },
      { key: 'cloths-applicators', en: 'Cloths & Applicators', ar: 'الفوط والأدوات', match: ['microfibre', 'microfiber'] },
    ],
  },
  {
    key: 'tools-garage',
    en: 'Tools & Garage',
    ar: 'العدد والأدوات',
    icon: 'wrench',
    order: 120,
    children: [
      { key: 'hand-tools', en: 'Hand Tools', ar: 'عدد يدوية' },
      { key: 'jacks-stands', en: 'Jacks & Stands', ar: 'الكوريك والحوامل' },
      { key: 'diagnostics', en: 'Diagnostics', ar: 'أجهزة الفحص' },
      { key: 'emergency', en: 'Emergency & Safety', ar: 'الطوارئ والسلامة', match: ['jump starter', 'warning triangle', 'vacuum'] },
    ],
  },
]

/** Flat list of every category, parents first — handy for seeding. */
export const flatTaxonomy = taxonomy.flatMap((top) => [
  { ...top, parentKey: null as string | null },
  ...top.children.map((child) => ({ ...child, icon: top.icon, order: 10, parentKey: top.key })),
])
