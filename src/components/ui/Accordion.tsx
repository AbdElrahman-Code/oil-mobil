'use client'

import { useState } from 'react'
import { AnimatePresence, motion } from 'framer-motion'
import { Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

/** Accessible disclosure list — one open at a time, keyboard operable. */
export const Accordion = ({
  items,
}: {
  items: { id: string; question: string; answer: string }[]
}) => {
  const [open, setOpen] = useState<string | null>(items[0]?.id ?? null)

  return (
    <div className="divide-y divide-neutral-200 overflow-hidden rounded-[var(--radius-card)] border border-neutral-200 bg-white">
      {items.map((item) => {
        const isOpen = open === item.id
        return (
          <div key={item.id}>
            <h3>
              <button
                type="button"
                onClick={() => setOpen(isOpen ? null : item.id)}
                aria-expanded={isOpen}
                aria-controls={`faq-panel-${item.id}`}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-start transition-colors hover:bg-neutral-50"
              >
                <span className={cn('font-semibold', isOpen ? 'text-primary-dark' : 'text-neutral-950')}>
                  {item.question}
                </span>
                <motion.span
                  animate={{ rotate: isOpen ? 45 : 0 }}
                  transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
                  className={cn(
                    'grid size-8 shrink-0 place-items-center rounded-full transition-colors',
                    isOpen ? 'bg-primary text-neutral-950' : 'bg-neutral-100 text-neutral-600',
                  )}
                >
                  <Plus className="size-4" />
                </motion.span>
              </button>
            </h3>

            <AnimatePresence initial={false}>
              {isOpen ? (
                <motion.div
                  id={`faq-panel-${item.id}`}
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.16, 1, 0.3, 1] }}
                  className="overflow-hidden"
                >
                  <p className="px-5 pb-5 leading-relaxed text-neutral-600">{item.answer}</p>
                </motion.div>
              ) : null}
            </AnimatePresence>
          </div>
        )
      })}
    </div>
  )
}
