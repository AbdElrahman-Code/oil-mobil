'use client'

import { useEffect } from 'react'
import { Button } from '@/components/ui/button'

export default function Error({ error, reset }: { error: Error; reset: () => void }) {
  useEffect(() => {
    console.error(error)
  }, [error])

  return (
    <div className="container-page grid min-h-[60svh] place-items-center py-20 text-center">
      <div>
        <h1 className="text-h2">Something went wrong</h1>
        <Button className="mt-6" onClick={reset}>
          Try again
        </Button>
      </div>
    </div>
  )
}
