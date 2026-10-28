import type { TicketStatus } from '@/types'
import { STATUS_LABELS } from '@/lib/labels'
import { cn } from '@/lib/utils'

// Tint background, darker text and a 6px dot. All pairs pass WCAG AA (≥4.5:1) at 12px.
const styles: Record<TicketStatus, { cls: string; dot: string }> = {
  needs_human: { cls: 'bg-[#FEF3C7] text-[#92400E]', dot: 'bg-[#F59E0B]' },
  open: { cls: 'bg-surface-muted text-ink-muted', dot: 'bg-ink-subtle' },
  ai_handling: { cls: 'bg-[#F1F5F9] text-[#334155]', dot: 'bg-[#64748B]' },
  grok_handling: { cls: 'bg-[#F1F5F9] text-[#334155]', dot: 'bg-[#94A3B8]' },
  resolved: { cls: 'bg-[#ECFDF3] text-[#166534]', dot: 'bg-[#22C55E]' },
  closed: { cls: 'bg-surface-muted text-ink-muted', dot: 'bg-border-strong' },
}

// The single source of status styling. needs_human stands out by colour, not size.
export function StatusPill({ status, className, label }: { status: TicketStatus; className?: string; label?: string }) {
  const { cls, dot } = styles[status]
  return (
    <span data-testid={`status-pill-${status}`} className={cn('inline-flex h-[22px] items-center gap-1.5 whitespace-nowrap rounded-full px-2 text-xs font-medium', cls, className)}>
      <span className={cn('h-1.5 w-1.5 shrink-0 rounded-full', dot)} aria-hidden />
      {label ?? STATUS_LABELS[status]}
    </span>
  )
}
