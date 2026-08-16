const C = {
  primary: '#0047BA', primaryDark: '#003488', primaryLight: '#E6EDF9',
  accent: '#D42E12', accentDark: '#A82209', accentLight: '#FBE7E3',
  n950: '#0B0E14', n700: '#2A3242', n600: '#3D4757', n500: '#55607A',
  n400: '#616B7D', n300: '#A7B0BF', n200: '#E4E8EE', n100: '#F5F6F8',
  white: '#FFFFFF',
  success: '#12734F', successLight: '#E6F4EE',
  warning: '#8A5300', warningLight: '#FDF1DE',
  danger: '#B3261E', dangerLight: '#FCE9E7',
}
const lin = (c) => { c /= 255; return c <= 0.03928 ? c / 12.92 : Math.pow((c + 0.055) / 1.055, 2.4) }
const lum = (hex) => {
  const h = hex.replace('#', '')
  const [r, g, b] = [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16))
  return 0.2126 * lin(r) + 0.7152 * lin(g) + 0.0722 * lin(b)
}
const ratio = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05) }

const checks = [
  ['body text on page bg', C.n950, C.n100, 4.5],
  ['body text on white', C.n950, C.white, 4.5],
  ['secondary text on white', C.n400, C.white, 4.5],
  ['secondary text on page bg', C.n400, C.n100, 4.5],
  ['muted text on white', C.n500, C.white, 4.5],
  ['link/primary text on white', C.primary, C.white, 4.5],
  ['primary text on page bg', C.primary, C.n100, 4.5],
  ['white on primary button', C.white, C.primary, 4.5],
  ['white on primary hover', C.white, C.primaryDark, 4.5],
  ['white on accent button', C.white, C.accent, 4.5],
  ['white on accent hover', C.white, C.accentDark, 4.5],
  ['accent text on white (price)', C.accent, C.white, 4.5],
  ['primary-dark on primary-light badge', C.primaryDark, C.primaryLight, 4.5],
  ['accent-dark on accent-light badge', C.accentDark, C.accentLight, 4.5],
  ['success on success-light badge', C.success, C.successLight, 4.5],
  ['warning on warning-light badge', C.warning, C.warningLight, 4.5],
  ['danger on danger-light badge', C.danger, C.dangerLight, 4.5],
  ['hero: n100 text on n950', C.n100, C.n950, 4.5],
  ['hero: white on n950', C.white, C.n950, 4.5],
  ['footer: n300 text on n950', C.n300, C.n950, 4.5],
  ['dark section heading white on n950', C.white, C.n950, 3],
  ['input placeholder n400 on white', C.n400, C.white, 4.5],
  ['input border n400 on white (1.4.11 UI component)', C.n400, C.white, 3],
  ['decorative hairline n200 on white (exempt, informational)', C.n200, C.white, 1],
  ['focus ring primary on white', C.primary, C.white, 3],
]

let fails = 0
for (const [label, fg, bg, min] of checks) {
  const r = ratio(fg, bg)
  const ok = r >= min
  if (!ok) fails++
  console.log(`${ok ? 'PASS' : 'FAIL'}  ${r.toFixed(2).padStart(5)}:1  (min ${min})  ${label}`)
}
console.log(fails === 0 ? '\nAll pairings meet their threshold.' : `\n${fails} pairing(s) below threshold.`)
