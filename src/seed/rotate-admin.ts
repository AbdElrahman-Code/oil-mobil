/**
 * Rotates the seeded admin password to a freshly generated strong one and
 * prints it once. Run this on any environment that was seeded with defaults.
 *
 *   npx tsx src/seed/rotate-admin.ts [email]
 */
import 'dotenv/config'
import { randomBytes } from 'crypto'
import { getPayload } from 'payload'
import config from '../payload.config'

const generate = () => {
  // 18 URL-safe characters plus punctuation: comfortably past any brute force,
  // still typeable by a shop owner reading it off a screen.
  const core = randomBytes(14).toString('base64url')
  return `Asc-${core}!`
}

const run = async () => {
  const payload = await getPayload({ config })
  const email = process.argv[2] || process.env.SEED_ADMIN_EMAIL || 'admin@servicecenter.eg'

  const found = await payload.find({
    collection: 'users',
    where: { email: { equals: email } },
    limit: 1,
    overrideAccess: true,
  })

  const user = found.docs[0]
  if (!user) {
    console.error(`No staff account found for ${email}`)
    process.exit(1)
  }

  const password = process.env.NEW_ADMIN_PASSWORD || generate()

  await payload.update({
    collection: 'users',
    id: user.id,
    data: { password },
    overrideAccess: true,
  })

  console.log('\n✅ Admin password rotated.')
  console.log(`   Email:    ${email}`)
  console.log(`   Password: ${password}`)
  console.log('   Store this in a password manager — it is not recoverable from the database.\n')
  process.exit(0)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
