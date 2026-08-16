import type { Locale } from '@/i18n/routing'
import { getSiteSettings } from '@/lib/payload'
import { FloatingSocial } from './FloatingSocial'
import { WhatsAppButton } from './WhatsAppButton'

/**
 * Contact shortcuts, driven entirely by Site Settings — add a social profile or
 * change the WhatsApp number in the admin and it appears here.
 */
export const FloatingActions = async ({ locale }: { locale: Locale }) => {
  const settings = await getSiteSettings(locale)

  const socials = (settings?.socialLinks ?? [])
    .filter((social) => social.platform && social.url)
    .map((social) => ({ platform: social.platform as string, url: social.url as string }))

  const mapUrl = settings?.branches?.find((branch) => branch.mapUrl)?.mapUrl ?? null

  return (
    <>
      <FloatingSocial socials={socials} mapUrl={mapUrl} />
      {settings?.whatsappNumber ? (
        <WhatsAppButton phone={settings.whatsappNumber} siteName={settings.siteName} />
      ) : null}
    </>
  )
}
