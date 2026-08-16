/**
 * Pushes the brand colours chosen in Site Settings into the CSS variables the
 * whole UI reads, so rebranding stays a colour picker in the admin — not a
 * deploy. Both ramps are derived from a single hex each, which keeps hover,
 * tint and shade states consistent with the base colour.
 */
const clamp = (value: number) => Math.max(0, Math.min(255, Math.round(value)))

const hexToRgb = (hex: string): [number, number, number] | null => {
  const clean = hex.replace('#', '').trim()
  const full =
    clean.length === 3
      ? clean
          .split('')
          .map((c) => c + c)
          .join('')
      : clean
  if (!/^[0-9a-fA-F]{6}$/.test(full)) return null
  return [
    parseInt(full.slice(0, 2), 16),
    parseInt(full.slice(2, 4), 16),
    parseInt(full.slice(4, 6), 16),
  ]
}

const mix = (rgb: [number, number, number], target: number, amount: number) =>
  rgb.map((channel) => clamp(channel + (target - channel) * amount)) as [number, number, number]

const toHex = (rgb: [number, number, number]) =>
  `#${rgb.map((c) => c.toString(16).padStart(2, '0')).join('')}`

const ramp = (name: 'primary' | 'accent', rgb: [number, number, number]) => ({
  [`--color-${name}`]: toHex(rgb),
  [`--color-${name}-dark`]: toHex(mix(rgb, 0, 0.28)),
  [`--color-${name}-light`]: toHex(mix(rgb, 255, 0.9)),
  [`--color-${name}-50`]: toHex(mix(rgb, 255, 0.95)),
  [`--color-${name}-100`]: toHex(mix(rgb, 255, 0.9)),
  [`--color-${name}-200`]: toHex(mix(rgb, 255, 0.74)),
  [`--color-${name}-300`]: toHex(mix(rgb, 255, 0.5)),
  [`--color-${name}-400`]: toHex(mix(rgb, 255, 0.26)),
  [`--color-${name}-500`]: toHex(rgb),
  [`--color-${name}-600`]: toHex(mix(rgb, 0, 0.28)),
  [`--color-${name}-700`]: toHex(mix(rgb, 0, 0.44)),
})

export const BrandStyle = ({
  primaryColor,
  accentColor,
}: {
  primaryColor?: string | null
  accentColor?: string | null
}) => {
  const primaryRgb = primaryColor ? hexToRgb(primaryColor) : null
  const accentRgb = accentColor ? hexToRgb(accentColor) : null
  if (!primaryRgb && !accentRgb) return null

  const scale = {
    ...(primaryRgb ? ramp('primary', primaryRgb) : {}),
    ...(accentRgb ? ramp('accent', accentRgb) : {}),
  }

  const css = `:root{${Object.entries(scale)
    .map(([key, value]) => `${key}:${value}`)
    .join(';')}}`

  return <style dangerouslySetInnerHTML={{ __html: css }} />
}
