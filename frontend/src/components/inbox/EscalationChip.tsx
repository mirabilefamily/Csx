import { ArrowRight } from 'lucide-react'
import type { TicketDetail } from '@/types'
import { Popover, PopoverContent, PopoverTrigger, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/overlay'
import { useIsPhone } from '@/hooks/useIsPhone'
import { ESCALATION_LABELS } from '@/lib/labels'
import { cn } from '@/lib/utils'

interface Step { key: 'claude' | 'grokbot' | 'human'; label: string; reason: string }

const STEP_STYLE = { claude: 'text-brass-700', grokbot: 'text-slate-700', human: 'text-tobacco-700' }

export function escalationPath(d: TicketDetail, assigneeName: string | null): Step[] {
  const steps: Step[] = [...d.attempts]
    .sort((a, b) => a.createdAt.localeCompare(b.createdAt))
    .map((a) => ({
      key: a.tier,
      label: a.tier === 'claude' ? 'AI' : 'Grokbot',
      reason: a.reason ?? (a.outcome === 'answered' ? 'Answered the customer' : 'Still working on it'),
    }))
  const t = d.ticket
  if (t.status === 'needs_human' || t.resolvedBy === 'human' || t.escalationReason) {
    const why = t.escalationReason ? `${ESCALATION_LABELS[t.escalationReason]}. ` : ''
    steps.push({ key: 'human', label: 'Human', reason: `${why}${assigneeName ? `Assigned to ${assigneeName}` : 'Waiting for an agent'}` })
  }
  return steps
}

export function EscalationChip({ steps }: { steps: Step[] }) {
  const isPhone = useIsPhone()
  if (steps.length < 2) return null
  return (
    <div role="group" aria-label="Escalation path" className="inline-flex flex-wrap items-center gap-0.5 rounded-full border border-border bg-surface-muted px-1 py-0.5" data-testid="escalation-chip">
      {steps.map((s, i) => {
        const btn = (
          <button type="button" className={cn('rounded-full px-2 py-0.5 text-xs font-semibold transition-colors hover:bg-surface focus-visible:bg-surface focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-sm:min-h-11 max-sm:px-3', STEP_STYLE[s.key])} data-testid={`escalation-step-${i}`}>
            {s.label}
            <span className="sr-only">: {s.reason}</span>
          </button>
        )
        return (
          <span key={`${s.key}-${i}`} className="inline-flex items-center gap-0.5">
            {i > 0 && <ArrowRight className="h-3 w-3 text-ink-subtle" aria-hidden />}
            {isPhone ? (
              <Popover>
                <PopoverTrigger asChild>{btn}</PopoverTrigger>
                <PopoverContent side="bottom" className="max-w-[calc(100vw-2rem)] p-3 text-sm" data-testid={`escalation-reason-${i}`}>{s.reason}</PopoverContent>
              </Popover>
            ) : (
              <Tooltip>
                <TooltipTrigger asChild>{btn}</TooltipTrigger>
                <TooltipContent side="bottom" className="max-w-xs" data-testid={`escalation-reason-${i}`}>{s.reason}</TooltipContent>
              </Tooltip>
            )}
          </span>
        )
      })}
    </div>
  )
}
