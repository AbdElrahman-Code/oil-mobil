/**
 * Applies the launch settings: brand name, real phone / WhatsApp number, and
 * clears the old generated logo so the shipped Drift artwork shows.
 *
 *   NODE_ENV=production npx tsx src/seed/settings.ts
 *
 * Safe to re-run. Site Settings is localized, so each locale is written on its
 * own with its existing array rows carried across (rows are matched by id).
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../payload.config'

const PHONE = '+20 10 27204231'
const WHATSAPP = '201027204231'

const run = async () => {
  const payload = await getPayload({ config })

  for (const locale of ['en', 'ar'] as const) {
    const current = await payload.findGlobal({ slug: 'siteSettings', locale, depth: 0 })
    const branches = (current.branches ?? []).map((branch) => ({ ...branch, phone: PHONE }))

    await payload.updateGlobal({
      slug: 'siteSettings',
      locale,
      data: {
        siteName: locale === 'ar' ? 'دريفت' : 'Drift',
        tagline: locale === 'ar' ? 'زيوت · أداء · حماية' : 'Oils · Performance · Protection',
        phone: PHONE,
        whatsappNumber: WHATSAPP,
        logo: null,
        logoDark: null,
        favicon: null,
        branches,
      },
    })
    console.log(`  ${locale}: name, phone ${PHONE}, WhatsApp ${WHATSAPP}`)
  }

  console.log('\n✅ Settings applied.')
  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
