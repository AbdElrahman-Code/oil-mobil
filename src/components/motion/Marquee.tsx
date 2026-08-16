'use client'

import { motion } from 'framer-motion'
import type { ReactNode } from 'react'

/**
 * Seamless logo strip. The row is duplicated and translated by exactly half its
 * width, so the loop has no visible seam.
 */
export const Marquee = ({ children, speed = 34 }: { children: ReactNode; speed?: number }) => (
  <div className="relative overflow-hidden [mask-image:linear-gradient(to_right,transparent,black_8%,black_92%,transparent)]">
    <motion.div
      className="flex w-max gap-14"
      animate={{ x: ['0%', '-50%'] }}
      transition={{ duration: speed, ease: 'linear', repeat: Infinity }}
    >
      <div className="flex shrink-0 items-center gap-14">{children}</div>
      <div className="flex shrink-0 items-center gap-14" aria-hidden>
        {children}
      </div>
    </motion.div>
  </div>
)
