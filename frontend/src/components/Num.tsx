import { Fragment } from 'react'
import { cn } from '@/lib/utils'

// Inter tabular lining figures; unit/suffix runs (h, m, min, %, pts, / 5) render smaller and muted. Text content is unchanged.
export function Num({ value, className, testId }: { value: string; className?: string; testId?: string }) {
  const parts = value.split(/(\d[\d.,]*)/).filter(Boolean)
  return (
    <span className={cn('num', className)} data-testid={testId}>
      {parts.map((p, i) => (/[a-z%/]/i.test(p) ? <span key={i} className="unit">{p}</span> : <Fragment key={i}>{p}</Fragment>))}
    </span>
  )
}
