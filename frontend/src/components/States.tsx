import type { ReactNode } from 'react'
import { AlertCircle, Inbox, RotateCw } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface StateProps {
  title: string
  description?: ReactNode
  icon?: ReactNode
  action?: ReactNode
  compact?: boolean
  className?: string
  testId?: string
}

export function EmptyState({ title, description, icon, action, compact, className, testId = 'empty-state' }: StateProps) {
  return (
    <div data-testid={testId} className={cn('flex flex-col items-center justify-center text-center', compact ? 'gap-2 py-8' : 'gap-3 py-16', className)}>
      <div className={cn('flex items-center justify-center rounded-full bg-surface-muted text-tobacco-500', compact ? 'h-10 w-10' : 'h-14 w-14')}>
        {icon ?? <Inbox className={compact ? 'h-5 w-5' : 'h-6 w-6'} aria-hidden />}
      </div>
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description && <p className="max-w-sm text-sm text-ink-muted">{description}</p>}
      {action}
    </div>
  )
}

interface ErrorStateProps extends Omit<StateProps, 'title' | 'action'> {
  title?: string
  onRetry?: () => void
}

export function ErrorState({ title = "Something didn't load", description = "We couldn't reach the Goorin desk just now.", onRetry, compact, className, testId = 'error-state' }: ErrorStateProps) {
  return (
    <div role="alert" data-testid={testId} className={cn('flex flex-col items-center justify-center text-center', compact ? 'gap-2 py-8' : 'gap-3 py-16', className)}>
      <div className={cn('flex items-center justify-center rounded-full bg-red-50 text-red-600', compact ? 'h-10 w-10' : 'h-14 w-14')}>
        <AlertCircle className={compact ? 'h-5 w-5' : 'h-6 w-6'} aria-hidden />
      </div>
      <p className="text-sm font-semibold text-ink">{title}</p>
      {description && <p className="max-w-sm text-sm text-ink-muted">{description}</p>}
      {onRetry && (
        <Button variant="outline" size="sm" onClick={onRetry} data-testid={`${testId}-retry`}>
          <RotateCw aria-hidden /> Try again
        </Button>
      )}
    </div>
  )
}
