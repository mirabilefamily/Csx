import { AlertTriangle, Bot, CheckCircle2, Circle, Lock, Sparkles } from 'lucide-react'
import type { TicketStatus } from '@/types'
import { STATUS_LABELS } from '@/lib/labels'
import { cn } from '@/lib/utils'

const styles: Record<TicketStatus, { cls: string; Icon: typeof Circle }> = {
  open: { cls: 'bg-tobacco-50 text-tobacco-700 border-tobacco-200', Icon: Circle },
  ai_handling: { cls: 'bg-brass-50 text-brass-700 border-brass-300', Icon: Sparkles },
  grok_handling: { cls: 'bg-slate-50 text-slate-700 border-slate-300', Icon: Bot },
  needs_human: { cls: 'bg-amber-400 text-amber-900 border-amber-500 font-semibold shadow-[0_0_0_3px_theme(colors.amber.100)]', Icon: AlertTriangle },
  resolved: { cls: 'bg-green-50 text-green-700 border-green-100', Icon: CheckCircle2 },
  closed: { cls: 'bg-surface-muted text-ink-muted border-border', Icon: Lock },
}

// The single source of status styling. needs_human is always the loudest pill.
export function StatusPill({ status, className }: { status: TicketStatus; className?: string }) {
  const { cls, Icon } = styles[status]
  return (
    <span
      data-testid={`status-pill-${status}`}
      className={cn('inline-flex items-center gap-1 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-medium leading-5', cls, className)}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {STATUS_LABELS[status]}
    </span>
  )
}
