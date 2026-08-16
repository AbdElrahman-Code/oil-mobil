'use client'

import { useEffect, useState } from 'react'
import { AnimatePresence, motion, useScroll, useSpring } from 'framer-motion'
import { ArrowUp } from 'lucide-react'
import { useTranslations } from 'next-intl'

/**
 * Reading progress along the top of the page, plus a back-to-top button that
 * only appears once scrolling it would actually save the visitor time.
 */
export const ScrollHelpers = () => {
  const t = useTranslations('nav')
  const { scrollYProgress } = useScroll()
  const progress = useSpring(scrollYProgress, { stiffness: 140, damping: 26, restDelta: 0.001 })
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    const onScroll = () => setVisible(window.scrollY > window.innerHeight)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  return (
    <>
      <motion.div
        style={{ scaleX: progress }}
        className="fixed inset-x-0 top-0 z-50 h-0.5 origin-[0%] bg-primary rtl:origin-[100%]"
        aria-hidden
      />

      <AnimatePresence>
        {visible ? (
          <motion.button
            type="button"
            initial={{ opacity: 0, y: 12 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 12 }}
            onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
            className="fixed bottom-6 end-6 z-40 grid size-11 place-items-center rounded-full bg-neutral-950 text-white shadow-[var(--shadow-lift)] transition-colors hover:bg-primary"
            aria-label={t('backToTop')}
          >
            <ArrowUp className="size-5" />
          </motion.button>
        ) : null}
      </AnimatePresence>
    </>
  )
}
