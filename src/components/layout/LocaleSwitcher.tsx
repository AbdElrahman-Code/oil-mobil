'use client'

import { useTransition } from 'react'
import { Globe } from 'lucide-react'
import { usePathname, useRouter } from '@/i18n/routing'
import type { Locale } from '@/i18n/routing'
import { useParams } from 'next/navigation'
import { cn } from '@/lib/utils'

/** Swaps between ar and en, keeping the visitor on the same page. */
export const LocaleSwitcher = ({ locale, label }: { locale: Locale; label: string }) => {
  const router = useRouter()
  const pathname = usePathname()
  const params = useParams()
  const [pending, startTransition] = useTransition()

  const next: Locale = locale === 'ar' ? 'en' : 'ar'

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() =>
        startTransition(() => {
          router.replace(
            // @ts-expect-error — pathname is a valid route for both locales
            { pathname, params },
            { locale: next },
          )
        })
      }
      className={cn(
        'flex items-center gap-1.5 rounded-full px-3 py-2 text-body-sm font-medium text-neutral-700 transition-colors hover:bg-neutral-200',
        pending && 'opacity-60',
      )}
      aria-label={`Switch language to ${next === 'ar' ? 'Arabic' : 'English'}`}
    >
      <Globe className="size-4" />
      <span className="hidden sm:inline">{label}</span>
    </button>
  )
}
