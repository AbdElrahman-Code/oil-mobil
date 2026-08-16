'use client'

import { useTransition } from 'react'
import { useTranslations } from 'next-intl'
import { LogOut } from 'lucide-react'
import { useRouter } from '@/i18n/routing'
import { logoutCustomer } from '@/actions/auth'
import { Button } from '@/components/ui/button'

export const LogoutButton = () => {
  const t = useTranslations('nav')
  const router = useRouter()
  const [pending, startTransition] = useTransition()

  return (
    <Button
      variant="outline"
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await logoutCustomer()
          router.push('/')
          router.refresh()
        })
      }
    >
      <LogOut className="size-4" />
      {t('logout')}
    </Button>
  )
}
