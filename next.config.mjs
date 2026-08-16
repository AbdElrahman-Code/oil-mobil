import { withPayload } from '@payloadcms/next/withPayload'
import createNextIntlPlugin from 'next-intl/plugin'
import path from 'path'
import { fileURLToPath } from 'url'

const dirname = path.dirname(fileURLToPath(import.meta.url))

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts')

/** @type {import('next').NextConfig} */
const nextConfig = {
  // D:\ has a stray package-lock.json at the drive root; without this Next infers
  // the whole drive as the workspace root and builds hang with zero output.
  outputFileTracingRoot: dirname,
  reactStrictMode: true,
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**.r2.dev' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: 'plus.unsplash.com' },
    ],
    formats: ['image/avif', 'image/webp'],
  },
  experimental: {
    reactCompiler: false,
    // These packages export huge barrels; without this every icon and every
    // motion helper is pulled into the client bundle.
    optimizePackageImports: ['lucide-react', 'framer-motion', 'date-fns'],
  },
}

export default withPayload(withNextIntl(nextConfig), { devBundleServerPackages: false })
