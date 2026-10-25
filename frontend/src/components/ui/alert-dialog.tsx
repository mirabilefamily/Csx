import * as React from 'react'
import * as AlertDialogPrimitive from '@radix-ui/react-alert-dialog'
import { cn } from '@/lib/utils'
import { buttonVariants } from './button'
import { PHONE_SHEET } from './dialog'

export const AlertDialog = AlertDialogPrimitive.Root
export const AlertDialogTitle = ({ className, ...p }: React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Title>) => (
  <AlertDialogPrimitive.Title className={cn('text-base font-semibold text-ink', className)} {...p} />
)
export const AlertDialogDescription = ({ className, ...p }: React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Description>) => (
  <AlertDialogPrimitive.Description className={cn('mt-2 text-sm text-ink-muted', className)} {...p} />
)

export const AlertDialogContent = React.forwardRef<
  React.ElementRef<typeof AlertDialogPrimitive.Content>,
  React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Content>
>(({ className, ...props }, ref) => (
  <AlertDialogPrimitive.Portal>
    <AlertDialogPrimitive.Overlay className="fixed inset-0 z-[60] bg-ink/40 data-[state=open]:animate-in data-[state=open]:fade-in-0" />
    <AlertDialogPrimitive.Content
      ref={ref}
      className={cn('fixed left-1/2 top-1/2 z-[60] w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl border border-border bg-surface p-6 shadow-popover data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95', PHONE_SHEET, className)}
      {...props}
    />
  </AlertDialogPrimitive.Portal>
))
AlertDialogContent.displayName = 'AlertDialogContent'

export const AlertDialogFooter = ({ className, ...p }: React.HTMLAttributes<HTMLDivElement>) => (
  <div className={cn('mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end', className)} {...p} />
)

export const AlertDialogCancel = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Cancel>>(
  ({ className, ...p }, ref) => <AlertDialogPrimitive.Cancel ref={ref} className={cn(buttonVariants({ variant: 'outline' }), className)} {...p} />,
)
AlertDialogCancel.displayName = 'AlertDialogCancel'

export const AlertDialogAction = React.forwardRef<HTMLButtonElement, React.ComponentPropsWithoutRef<typeof AlertDialogPrimitive.Action>>(
  ({ className, ...p }, ref) => <AlertDialogPrimitive.Action ref={ref} className={cn(buttonVariants({ variant: 'destructive' }), className)} {...p} />,
)
AlertDialogAction.displayName = 'AlertDialogAction'
