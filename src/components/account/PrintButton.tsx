'use client'

import { useTranslations } from 'next-intl'
import { Printer } from 'lucide-react'
import { Button } from '@/components/ui/button'

/** Browser print dialog — "Save as PDF" produces the downloadable invoice. */
export const PrintButton = () => {
  const t = useTranslations('account')
  return (
    <Button variant="outline" onClick={() => window.print()}>
      <Printer className="size-4" />
      {t('downloadInvoice')}
    </Button>
  )
}
