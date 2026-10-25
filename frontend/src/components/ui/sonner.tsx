import { Toaster as Sonner } from 'sonner'

export function Toaster() {
  return (
    <Sonner
      position="top-center"
      toastOptions={{
        classNames: {
          toast: 'rounded-lg border border-border bg-surface text-ink shadow-popover font-sans',
          title: 'text-sm font-medium',
          description: 'text-xs text-ink-muted',
          success: '[&_[data-icon]]:text-green-600',
          error: '[&_[data-icon]]:text-red-600',
        },
      }}
    />
  )
}
