/**
 * Lighthouse audit against a running production build.
 *
 *   npm run build && npm run start
 *   node src/seed/lighthouse.mjs [baseUrl]
 *
 * Audits the homepage, a product detail page and the Oil Finder on both mobile
 * and desktop, and exits non-zero if any category falls below 90.
 */
import lighthouse from 'lighthouse'
import * as chromeLauncher from 'chrome-launcher'

const base = process.argv[2] || 'http://localhost:3000'

const targets = [
  { name: 'Homepage (AR)', url: `${base}/ar` },
  { name: 'Homepage (EN)', url: `${base}/en` },
  { name: 'Product detail', url: `${base}/en/products/PRODUCT_SLUG` },
  { name: 'Oil Finder', url: `${base}/en/oil-finder` },
]

const settingsFor = (formFactor) =>
  formFactor === 'mobile'
    ? { formFactor: 'mobile', screenEmulation: { mobile: true, width: 390, height: 844, deviceScaleFactor: 2.625, disabled: false } }
    : {
        formFactor: 'desktop',
        screenEmulation: { mobile: false, width: 1440, height: 900, deviceScaleFactor: 1, disabled: false },
        throttling: { rttMs: 40, throughputKbps: 10 * 1024, cpuSlowdownMultiplier: 1 },
      }

const run = async () => {
  // Resolve a real product slug so the PDP audit is not a 404.
  const productSlug = await fetch(`${base}/api/products?limit=1&depth=0`)
    .then((r) => r.json())
    .then((j) => j?.docs?.[0]?.slug)
    .catch(() => null)

  const chrome = await chromeLauncher.launch({ chromeFlags: ['--headless=new', '--no-sandbox'] })
  const rows = []
  let failures = 0

  try {
    for (const target of targets) {
      const url = target.url.replace('PRODUCT_SLUG', productSlug ?? '')
      if (url.includes('PRODUCT_SLUG') || (target.name === 'Product detail' && !productSlug)) {
        console.log(`skipping ${target.name} — no product slug available`)
        continue
      }

      for (const formFactor of ['mobile', 'desktop']) {
        const result = await lighthouse(
          url,
          { port: chrome.port, output: 'json', logLevel: 'error' },
          {
            extends: 'lighthouse:default',
            settings: { ...settingsFor(formFactor), onlyCategories: ['performance', 'accessibility', 'best-practices', 'seo'] },
          },
        )

        const c = result.lhr.categories
        const score = (key) => Math.round((c[key]?.score ?? 0) * 100)
        const row = {
          page: target.name,
          device: formFactor,
          performance: score('performance'),
          accessibility: score('accessibility'),
          bestPractices: score('best-practices'),
          seo: score('seo'),
        }
        rows.push(row)

        const below = Object.entries(row)
          .filter(([key, value]) => typeof value === 'number' && value < 90)
          .map(([key, value]) => `${key} ${value}`)
        if (below.length) failures += 1

        console.log(
          `${row.page.padEnd(16)} ${row.device.padEnd(8)} perf ${String(row.performance).padStart(3)}  a11y ${String(
            row.accessibility,
          ).padStart(3)}  bp ${String(row.bestPractices).padStart(3)}  seo ${String(row.seo).padStart(3)}` +
            (below.length ? `   ← below 90: ${below.join(', ')}` : ''),
        )

        // Surface the biggest opportunities so the number is actionable.
        if (row.performance < 90) {
          const audits = Object.values(result.lhr.audits)
            .filter((a) => a.details?.type === 'opportunity' && a.numericValue > 100)
            .sort((a, b) => b.numericValue - a.numericValue)
            .slice(0, 3)
          for (const a of audits) console.log(`      · ${a.title}: ${Math.round(a.numericValue)}ms`)
        }
        if (row.accessibility < 100) {
          const failed = Object.values(result.lhr.audits).filter(
            (a) => a.score === 0 && a.scoreDisplayMode === 'binary' && result.lhr.categories.accessibility.auditRefs.some((r) => r.id === a.id),
          )
          for (const a of failed) {
            console.log(`      · a11y: ${a.title}`)
            for (const item of (a.details?.items ?? []).slice(0, 3)) {
              const snippet = item.node?.snippet ?? item.node?.selector ?? ''
              if (snippet) console.log(`          ${snippet.replace(/\s+/g, ' ').slice(0, 400)}`)
              if (item.node?.explanation) console.log(`          → ${item.node.explanation}`)
            }
          }
        }

        if (process.env.LH_VERBOSE) {
          const redirects = result.lhr.audits['redirects']
          for (const item of redirects?.details?.items ?? []) {
            console.log(`      redirect: ${item.url} (+${Math.round(item.wastedMs ?? 0)}ms)`)
          }
        }
      }
    }
  } finally {
    await chrome.kill()
  }

  console.log(failures === 0 ? '\nAll audited categories are 90+.' : `\n${failures} run(s) had a category below 90.`)
  process.exit(failures === 0 ? 0 : 1)
}

run().catch((error) => {
  console.error(error)
  process.exit(1)
})
