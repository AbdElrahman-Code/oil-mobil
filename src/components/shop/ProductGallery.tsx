'use client'

import { useState } from 'react'
import Image from 'next/image'
import { AnimatePresence, motion } from 'framer-motion'
import { ImageOff } from 'lucide-react'
import { cn } from '@/lib/utils'

export const ProductGallery = ({
  images,
  name,
}: {
  images: { url: string; alt: string }[]
  name: string
}) => {
  const [active, setActive] = useState(0)

  if (!images.length) {
    return (
      <div className="grid aspect-square place-items-center rounded-[var(--radius-card)] bg-neutral-100 text-neutral-200">
        <ImageOff className="size-10" />
      </div>
    )
  }

  return (
    <div>
      <div className="relative aspect-square overflow-hidden rounded-[var(--radius-card)] bg-neutral-100">
        <AnimatePresence mode="wait">
          <motion.div
            key={active}
            initial={{ opacity: 0, scale: 1.02 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.35, ease: [0.16, 1, 0.3, 1] }}
            className="absolute inset-0"
          >
            <Image
              src={images[active].url}
              alt={images[active].alt || name}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover"
            />
          </motion.div>
        </AnimatePresence>
      </div>

      {images.length > 1 ? (
        <div className="mt-4 flex gap-3 overflow-x-auto no-scrollbar">
          {images.map((image, index) => (
            <button
              key={image.url}
              type="button"
              onClick={() => setActive(index)}
              className={cn(
                'relative size-20 shrink-0 overflow-hidden rounded-xl border-2 transition-colors',
                index === active ? 'border-primary-500' : 'border-transparent hover:border-neutral-300',
              )}
              aria-label={`${name} — ${index + 1}`}
              aria-current={index === active}
            >
              <Image src={image.url} alt="" fill sizes="80px" className="object-cover" />
            </button>
          ))}
        </div>
      ) : null}
    </div>
  )
}
