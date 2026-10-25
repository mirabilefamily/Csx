import type { ReactNode } from 'react'
import { BarChart3 } from 'lucide-react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState } from '@/components/States'
import { cn } from '@/lib/utils'

interface ChartCardProps {
  title: string
  description?: string
  loading?: boolean
  empty?: boolean
  legend?: ReactNode
  action?: ReactNode
  className?: string
  testId: string
  children?: ReactNode
  height?: number
}

export function ChartCard({ title, description, loading, empty, legend, action, className, testId, children, height = 260 }: ChartCardProps) {
  return (
    <Card className={cn('flex min-w-0 flex-col', className)} data-testid={testId}>
      <CardHeader>
        <div className="min-w-0">
          <CardTitle>{title}</CardTitle>
          {description && <CardDescription>{description}</CardDescription>}
        </div>
        {action}
      </CardHeader>
      <CardContent className="flex flex-1 flex-col gap-3">
        {loading ? (
          <Skeleton className="w-full" style={{ height }} data-testid={`${testId}-skeleton`} />
        ) : empty ? (
          <div style={{ minHeight: height }} className="flex items-center justify-center">
            <EmptyState compact title="No data for this period" description="Try a wider date range." icon={<BarChart3 className="h-5 w-5" aria-hidden />} testId={`${testId}-empty`} />
          </div>
        ) : (
          <>
            {legend}
            {children}
          </>
        )}
      </CardContent>
    </Card>
  )
}

export function Legend({ items }: { items: { label: string; color: string; value?: string }[] }) {
  return (
    <ul className="flex flex-wrap gap-x-4 gap-y-1">
      {items.map((i) => (
        <li key={i.label} className="flex items-center gap-1.5 text-xs text-ink-muted">
          <span className="h-2.5 w-2.5 rounded-sm" style={{ background: i.color }} aria-hidden />
          {i.label}
          {i.value && <span className="font-medium text-ink">{i.value}</span>}
        </li>
      ))}
    </ul>
  )
}
