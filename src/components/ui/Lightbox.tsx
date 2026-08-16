'use client'

import { useCallback, useEffect, useState } from 'react'
import Image from 'next/image'
import { createPortal } from 'react-dom'
import { AnimatePresence, motion } from 'framer-motion'
import { ChevronLeft, ChevronRight, X } from 'lucide-react'

type GalleryImage = { src: string; full: string; alt: string }

/** Masonry-ish gallery that opens into a keyboard-navigable lightbox. */
export const Lightbox = ({ images }: { images: GalleryImage[] }) => {
  const [index, setIndex] = useState<number | null>(null)
  const [mounted, setMounted] = useState(false)

  useEffect(() => setMounted(true), [])

  const close = useCallback(() => setIndex(null), [])
  const next = useCallback(
    () => setIndex((current) => (current === null ? null : (current + 1) % images.length)),
    [images.length],
  )
  const previous = useCallback(
    () => setIndex((current) => (current === null ? null : (current - 1 + images.length) % images.length)),
    [images.length],
  )

  useEffect(() => {
    if (index === null) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') close()
      if (event.key === 'ArrowRight') next()
      if (event.key === 'ArrowLeft') previous()
    }
    document.addEventListener('keydown', onKey)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', onKey)
      document.body.style.overflow = ''
    }
  }, [index, close, next, previous])

  return (
    <>
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {images.map((image, i) => (
          <motion.button
            key={image.src}
            type="button"
            onClick={() => setIndex(i)}
            initial={{ opacity: 0, y: 16 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '-60px' }}
            transition={{ duration: 0.5, delay: Math.min(i * 0.05, 0.3), ease: [0.16, 1, 0.3, 1] }}
            className="group relative aspect-square overflow-hidden rounded-xl bg-neutral-100"
            aria-label={image.alt || `Open image ${i + 1}`}
          >
            <Image
              src={image.src}
              alt={image.alt}
              fill
              sizes="(max-width: 640px) 50vw, 25vw"
              className="object-cover transition-transform duration-700 ease-[var(--ease-out-expo)] group-hover:scale-105"
            />
            <span className="absolute inset-0 bg-primary/0 transition-colors duration-300 group-hover:bg-primary/15" />
          </motion.button>
        ))}
      </div>

      {mounted && index !== null
        ? createPortal(
            <AnimatePresence>
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                className="fixed inset-0 z-[60] grid place-items-center bg-neutral-950/92 p-4 backdrop-blur-sm"
                role="dialog"
                aria-modal="true"
                onClick={close}
              >
                <button
                  type="button"
                  onClick={close}
                  className="absolute end-5 top-5 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                  aria-label="Close"
                >
                  <X className="size-5" />
                </button>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    previous()
                  }}
                  className="absolute start-4 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                  aria-label="Previous"
                >
                  <ChevronLeft className="size-5 rtl:rotate-180" />
                </button>

                <motion.div
                  key={index}
                  initial={{ opacity: 0, scale: 0.97 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="relative h-[80vh] w-full max-w-5xl"
                  onClick={(event) => event.stopPropagation()}
                >
                  <Image
                    src={images[index].full}
                    alt={images[index].alt}
                    fill
                    sizes="100vw"
                    className="object-contain"
                  />
                </motion.div>

                <button
                  type="button"
                  onClick={(event) => {
                    event.stopPropagation()
                    next()
                  }}
                  className="absolute end-4 grid size-11 place-items-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                  aria-label="Next"
                >
                  <ChevronRight className="size-5 rtl:rotate-180" />
                </button>

                <p className="absolute bottom-6 text-body-sm text-white/70 tabular-nums">
                  {index + 1} / {images.length}
                </p>
              </motion.div>
            </AnimatePresence>,
            document.body,
          )
        : null}
    </>
  )
}
