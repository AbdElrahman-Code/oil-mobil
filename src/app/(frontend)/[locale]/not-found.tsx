import { getTranslations } from 'next-intl/server'
import { Link } from '@/i18n/routing'
import { Button } from '@/components/ui/button'

export default async function NotFound() {
  const t = await getTranslations('nav')
  return (
    <div className="container-page grid min-h-[60svh] place-items-center py-20 text-center">
      <div>
        <p className="font-[family-name:var(--font-display)] text-display font-bold text-primary-500">404</p>
        <h1 className="mt-4 text-h2">Page not found</h1>
        <Button asChild className="mt-8">
          <Link href="/">{t('home')}</Link>
        </Button>
      </div>
    </div>
  )
}
