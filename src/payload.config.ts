import path from 'path'
import { fileURLToPath } from 'url'
import { buildConfig } from 'payload'
import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { s3Storage } from '@payloadcms/storage-s3'
import { ar } from '@payloadcms/translations/languages/ar'
import { en } from '@payloadcms/translations/languages/en'
import sharp from 'sharp'

import { Bookings } from '@/collections/Bookings'
import { Customers } from '@/collections/Customers'
import { Invoices } from '@/collections/Invoices'
import { LegalPages } from '@/collections/LegalPages'
import { Media } from '@/collections/Media'
import { OilAdjustmentRules } from '@/collections/OilAdjustmentRules'
import { OilFinderLeads } from '@/collections/OilFinderLeads'
import { OilSpecifications } from '@/collections/OilSpecifications'
import { Orders } from '@/collections/Orders'
import { ProductCategories } from '@/collections/ProductCategories'
import { Products } from '@/collections/Products'
import { ServiceRecords } from '@/collections/ServiceRecords'
import { Users } from '@/collections/Users'
import { VehicleBrands } from '@/collections/VehicleBrands'
import { VehicleModels } from '@/collections/VehicleModels'
import { Vehicles } from '@/collections/Vehicles'
import { WashServices } from '@/collections/WashServices'
import { Homepage } from '@/globals/Homepage'
import { Navigation } from '@/globals/Navigation'
import { SiteSettings } from '@/globals/SiteSettings'

const filename = fileURLToPath(import.meta.url)
const dirname = path.dirname(filename)

const useS3 = Boolean(process.env.S3_BUCKET && process.env.S3_ACCESS_KEY_ID)

export default buildConfig({
  serverURL: process.env.NEXT_PUBLIC_SERVER_URL || 'http://localhost:3000',
  admin: {
    user: Users.slug,
    meta: {
      titleSuffix: '— Service Center Admin',
    },
    components: {
      beforeDashboard: ['@/components/admin/DashboardOverview#DashboardOverview'],
      views: {
        customerLookup: {
          Component: '@/components/admin/CustomerLookup#CustomerLookup',
          path: '/customer-lookup',
          exact: true,
          meta: { title: 'Customer lookup' },
        },
      },
      graphics: {
        Logo: '@/components/admin/AdminLogo#AdminLogo',
        Icon: '@/components/admin/AdminIcon#AdminIcon',
      },
    },
    importMap: { baseDir: path.resolve(dirname) },
    livePreview: {
      breakpoints: [
        { label: 'Mobile', name: 'mobile', width: 390, height: 844 },
        { label: 'Tablet', name: 'tablet', width: 768, height: 1024 },
        { label: 'Desktop', name: 'desktop', width: 1440, height: 900 },
      ],
    },
  },
  collections: [
    Products,
    ProductCategories,
    Orders,
    Invoices,
    Customers,
    Vehicles,
    ServiceRecords,
    Bookings,
    WashServices,
    VehicleBrands,
    VehicleModels,
    OilSpecifications,
    OilAdjustmentRules,
    OilFinderLeads,
    LegalPages,
    Media,
    Users,
  ],
  globals: [Homepage, Navigation, SiteSettings],
  localization: {
    locales: [
      { label: { en: 'Arabic', ar: 'العربية' }, code: 'ar', rtl: true },
      { label: { en: 'English', ar: 'الإنجليزية' }, code: 'en' },
    ],
    defaultLocale: 'ar',
    fallback: true,
  },
  i18n: {
    supportedLanguages: { ar, en },
    fallbackLanguage: 'en',
  },
  editor: lexicalEditor(),
  db: postgresAdapter({
    pool: { connectionString: process.env.DATABASE_URI || '' },
    push: process.env.NODE_ENV !== 'production',
  }),
  secret: process.env.PAYLOAD_SECRET || '',
  typescript: { outputFile: path.resolve(dirname, 'payload-types.ts') },
  graphQL: { schemaOutputFile: path.resolve(dirname, '../generated-schema.graphql') },
  sharp,
  plugins: useS3
    ? [
        s3Storage({
          collections: { media: true },
          bucket: process.env.S3_BUCKET as string,
          config: {
            endpoint: process.env.S3_ENDPOINT,
            region: process.env.S3_REGION || 'auto',
            credentials: {
              accessKeyId: process.env.S3_ACCESS_KEY_ID as string,
              secretAccessKey: process.env.S3_SECRET_ACCESS_KEY as string,
            },
          },
        }),
      ]
    : [],
  upload: { limits: { fileSize: 10_000_000 } },
})
