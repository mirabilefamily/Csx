import * as React from 'react'
import { Slot } from '@radix-ui/react-slot'
import { cva, type VariantProps } from 'class-variance-authority'
import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

export const focusRing = 'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background'

export const buttonVariants = cva(
  `inline-flex items-center justify-center gap-2 whitespace-nowrap rounded-lg text-sm font-medium transition-[background-color,color,border-color,box-shadow,transform] duration-150 active:translate-y-px disabled:pointer-events-none disabled:opacity-50 [&_svg]:size-4 [&_svg]:shrink-0 ${focusRing}`,
  {
    variants: {
      variant: {
        primary: 'bg-tobacco-600 text-white hover:bg-tobacco-700',
        secondary: 'bg-brass-100 text-tobacco-800 hover:bg-brass-200',
        outline: 'border border-border-strong bg-surface text-ink hover:bg-surface-muted',
        ghost: 'text-ink hover:bg-surface-muted',
        destructive: 'bg-red-600 text-white hover:bg-red-700',
        link: 'h-auto px-0 text-tobacco-600 underline-offset-4 hover:underline',
      },
      size: {
        sm: 'h-8 px-3 max-sm:h-11',
        md: 'h-10 px-4 max-sm:h-11',
        lg: 'h-12 px-6 text-base',
        icon: 'h-10 w-10 max-sm:h-11 max-sm:w-11',
        'icon-sm': 'h-8 w-8 max-sm:h-11 max-sm:w-11',
      },
    },
    defaultVariants: { variant: 'primary', size: 'md' },
  },
)

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement>, VariantProps<typeof buttonVariants> {
  asChild?: boolean
  loading?: boolean
}

export const Button = React.forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, asChild = false, loading = false, children, disabled, ...props }, ref) => {
    const Comp = asChild ? Slot : 'button'
    return (
      <Comp ref={ref} className={cn(buttonVariants({ variant, size }), className)} disabled={disabled || loading} {...props}>
        {asChild ? children : (
          <>
            {loading && <Loader2 className="animate-spin" aria-hidden />}
            {children}
          </>
        )}
      </Comp>
    )
  },
)
Button.displayName = 'Button'
