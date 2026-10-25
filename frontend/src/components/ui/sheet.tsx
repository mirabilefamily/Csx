import * as React from 'react'
import * as DialogPrimitive from '@radix-ui/react-dialog'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { focusRing } from './button'

export const Sheet = DialogPrimitive.Root
export const SheetTrigger = DialogPrimitive.Trigger
export const SheetClose = DialogPrimitive.Close
export const SheetTitle = DialogPrimitive.Title
export const SheetDescription = DialogPrimitive.Description

export const SheetContent = React.forwardRef<
  React.ElementRef<typeof DialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof DialogPrimitive.Content>
>(({ className, children, ...props }, ref) => (
  <DialogPrimitive.Portal>
    <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-ink/30 data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
    <DialogPrimitive.Content
      ref={ref}
      className={cn(
        'fixed inset-y-0 right-0 z-50 flex h-full w-full flex-col border-l border-border bg-surface shadow-popover focus:outline-none data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right data-[state=open]:duration-300 data-[state=closed]:duration-200 max-sm:h-[100dvh] max-sm:border-l-0 max-sm:pb-[env(safe-area-inset-bottom)] max-sm:pt-[env(safe-area-inset-top)] max-sm:data-[state=open]:slide-in-from-bottom',
        className,
      )}
      {...props}
    >
      {children}
    </DialogPrimitive.Content>
  </DialogPrimitive.Portal>
))
SheetContent.displayName = 'SheetContent'

export function SheetCloseButton({ label = 'Close', ...props }: { label?: string } & React.ButtonHTMLAttributes<HTMLButtonElement>) {
  return (
    <DialogPrimitive.Close asChild>
      <button type="button" aria-label={label} className={cn('inline-flex h-9 w-9 max-sm:h-11 max-sm:w-11 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-muted hover:text-ink', focusRing)} {...props}>
        <X className="h-4 w-4" aria-hidden />
      </button>
    </DialogPrimitive.Close>
  )
}
