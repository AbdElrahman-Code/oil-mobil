import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

const buttonVariants = cva(
  'inline-flex items-center justify-center gap-2 whitespace-nowrap font-medium transition-[background-color,color,box-shadow,transform] duration-200 ease-[var(--ease-out-expo)] disabled:pointer-events-none disabled:opacity-50 active:translate-y-px [&_svg]:size-[1.1em] [&_svg]:shrink-0',
  {
    variants: {
      variant: {
        // Orange with dark text — the only orange/text pairing that clears AA
        // with room to spare, and the most recognisable buy-button pattern.
        primary:
          'bg-primary text-neutral-950 shadow-[0_8px_20px_-10px_var(--color-primary)] hover:bg-primary-600',
        // Navy carries the secondary solid action.
        accent: 'bg-accent text-white shadow-[0_8px_20px_-10px_var(--color-accent)] hover:bg-accent-dark',
        // WhatsApp's own green, reserved for opening a chat.
        whatsapp:
          'bg-[var(--color-whatsapp)] text-neutral-950 shadow-[0_8px_20px_-10px_var(--color-whatsapp)] hover:bg-[var(--color-whatsapp-dark)]',
        dark: 'bg-neutral-950 text-neutral-100 hover:bg-neutral-800',
        outline:
          'border border-neutral-300 bg-transparent text-neutral-900 hover:border-primary hover:bg-primary-light hover:text-primary-dark',
        outlineInverted: 'border border-white/30 bg-transparent text-white hover:border-white hover:bg-white/10',
        ghost: 'text-neutral-700 hover:bg-primary-light hover:text-primary-dark',
        link: 'text-primary-dark underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-9 rounded-full px-4 text-body-sm',
        md: 'h-11 rounded-full px-6 text-body-sm',
        lg: 'h-13 rounded-full px-8 text-body',
        icon: 'size-10 rounded-full',
      },
      block: { true: 'w-full', false: '' },
    },
    defaultVariants: { variant: 'primary', size: 'md', block: false },
  },
)

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  asChild?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, block, asChild = false, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp className={cn(buttonVariants({ variant, size, block }), className)} ref={ref} {...props} />
    )
  },
)
Button.displayName = 'Button'

export { buttonVariants }
