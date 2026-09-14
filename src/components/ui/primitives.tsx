import * as React from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/* Small shared primitives. Kept in one file so the vocabulary stays visible. */

export const Card = ({ className, ...props }: React.HTMLAttributes<HTMLDivElement>) => (
  <div
    className={cn(
      'rounded-[var(--radius-card)] border border-neutral-200 bg-white shadow-[var(--shadow-card)]',
      className,
    )}
    {...props}
  />
)

const badgeVariants = cva(
  'inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-label font-semibold uppercase tracking-wide',
  {
    variants: {
      tone: {
        neutral: 'bg-neutral-100 text-neutral-600',
        primary: 'bg-primary-light text-primary-dark',
        accent: 'bg-accent-light text-accent-dark',
        whatsapp: 'bg-[var(--color-whatsapp-light)] text-[var(--color-whatsapp-ink)]',
        success: 'bg-success-light text-success',
        warning: 'bg-warning-light text-warning',
        danger: 'bg-danger-light text-danger',
        inverted: 'bg-white/10 text-white',
      },
    },
    defaultVariants: { tone: 'neutral' },
  },
)

export const Badge = ({
  className,
  tone,
  ...props
}: React.HTMLAttributes<HTMLSpanElement> & VariantProps<typeof badgeVariants>) => (
  <span className={cn(badgeVariants({ tone }), className)} {...props} />
)

export const Input = React.forwardRef<HTMLInputElement, React.InputHTMLAttributes<HTMLInputElement>>(
  ({ className, ...props }, ref) => (
    <input
      ref={ref}
      className={cn(
        'h-11 w-full rounded-xl border border-neutral-400 bg-white px-4 text-body-sm text-neutral-900 transition-colors placeholder:text-neutral-400 hover:border-neutral-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:bg-neutral-100',
        className,
      )}
      {...props}
    />
  ),
)
Input.displayName = 'Input'

export const Textarea = React.forwardRef<
  HTMLTextAreaElement,
  React.TextareaHTMLAttributes<HTMLTextAreaElement>
>(({ className, ...props }, ref) => (
  <textarea
    ref={ref}
    className={cn(
      'min-h-24 w-full rounded-xl border border-neutral-400 bg-white px-4 py-3 text-body-sm text-neutral-900 transition-colors placeholder:text-neutral-400 hover:border-neutral-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25',
      className,
    )}
    {...props}
  />
))
Textarea.displayName = 'Textarea'

export const NativeSelect = React.forwardRef<
  HTMLSelectElement,
  React.SelectHTMLAttributes<HTMLSelectElement>
>(({ className, ...props }, ref) => (
  <select
    ref={ref}
    className={cn(
      'h-11 w-full appearance-none rounded-xl border border-neutral-400 bg-white bg-[length:1rem] bg-no-repeat px-4 text-body-sm text-neutral-900 transition-colors hover:border-neutral-500 focus:border-primary focus:outline-none focus:ring-2 focus:ring-primary/25 disabled:bg-neutral-100 disabled:text-neutral-400',
      className,
    )}
    {...props}
  />
))
NativeSelect.displayName = 'NativeSelect'

export const Label = ({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) => (
  <label className={cn('mb-1.5 block text-body-sm font-medium text-neutral-700', className)} {...props} />
)

export const FieldError = ({ children }: { children?: React.ReactNode }) =>
  children ? <p className="mt-1.5 text-body-sm text-danger">{children}</p> : null

export const SectionHeading = ({
  eyebrow,
  title,
  subtitle,
  align = 'start',
  inverted = false,
}: {
  eyebrow?: string | null
  title?: string | null
  subtitle?: string | null
  align?: 'start' | 'center'
  inverted?: boolean
}) => {
  if (!title && !subtitle && !eyebrow) return null
  return (
    <div className={cn('max-w-2xl', align === 'center' && 'mx-auto text-center')}>
      {eyebrow ? (
        <p className={cn('mb-3 text-label font-semibold uppercase tracking-[0.18em]', inverted ? 'text-primary-300' : 'text-primary-dark')}>
          {eyebrow}
        </p>
      ) : null}
      {title ? (
        <h2 className={cn('text-h2', inverted ? 'text-white' : 'text-neutral-950')}>{title}</h2>
      ) : null}
      {subtitle ? (
        <p className={cn('mt-4 text-body leading-relaxed', inverted ? 'text-neutral-200' : 'text-neutral-400')}>
          {subtitle}
        </p>
      ) : null}
    </div>
  )
}

export const Skeleton = ({ className }: { className?: string }) => (
  <div className={cn('animate-pulse rounded-xl bg-neutral-200', className)} />
)
