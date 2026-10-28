import { Bot, Clock } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/overlay'
import type { TicketDetail } from '@/types'
import { focusRing } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const fmt = (iso: string | undefined) => (iso ? new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—')
const SLA_HOURS = 4

// Shown while the latest outbound reply came from AI and the ticket is still open (hidden when a person is needed, REQ-711).
export function AiRepliedBanner({ d }: { d: TicketDetail }) {
  const last = [...d.messages].reverse().find((m) => m.authorType !== 'system' && !m.isInternal)
  if (!last || (last.authorType !== 'claude' && last.authorType !== 'grokbot') || ['resolved', 'closed', 'needs_human', 'open'].includes(d.ticket.status) || d.ticket.handoverReason) return null
  const who = last.authorType === 'claude' ? 'AI' : 'Grokbot'
  return (
    <div className="flex items-start gap-2 border-b border-border bg-surface-sunken px-6 py-3 text-[13px] text-ink max-sm:px-4" role="status" data-testid="ai-replied-banner">
      <Bot className="mt-0.5 h-4 w-4 shrink-0 text-ink-muted" aria-hidden />
      <p><span className="font-semibold">AI replied:</span> {who} answered the latest customer message. No staff handoff yet. This ticket isn't resolved.</p>
    </div>
  )
}

// SLA chip in the conversation header; its popover holds the email/chat timing (REQ-710).
export function SlaChip({ d, compact }: { d: TicketDetail; compact?: boolean }) {
  const firstAi = d.messages.find((m) => (m.authorType === 'claude' || m.authorType === 'grokbot') && !m.isInternal)
  const firstHuman = d.messages.find((m) => m.authorType === 'agent' && !m.isInternal)
  const first = [firstAi, firstHuman].filter(Boolean).map((m) => m!.createdAt).sort()[0]
  const hours = first ? (new Date(first).getTime() - new Date(d.ticket.createdAt).getTime()) / 3.6e6 : null
  const sla = hours === null ? (Date.now() - new Date(d.ticket.createdAt).getTime() > SLA_HOURS * 3.6e6 ? 'Breached' : 'Pending') : hours <= SLA_HOURS ? 'Met' : 'Breached'
  const rows: [string, string][] = [['Received', fmt(d.ticket.createdAt)], ['First AI reply', fmt(firstAi?.createdAt)], ['First human reply', fmt(firstHuman?.createdAt)], [`SLA (${SLA_HOURS}h first response)`, sla]]
  return (
    <Popover>
      <PopoverTrigger className={cn('inline-flex h-7 shrink-0 items-center gap-1.5 rounded-md px-2 text-[13px] font-medium max-sm:h-11', sla === 'Met' ? 'bg-green-50 text-green-800' : sla === 'Breached' ? 'bg-red-50 text-red-700' : 'bg-surface-muted text-ink-muted', focusRing)} aria-label={`SLA ${sla.toLowerCase()}. Show ${d.ticket.channel === 'email' ? 'email' : 'chat'} timing`} data-testid="email-timing-toggle">
        <Clock className="h-3.5 w-3.5" aria-hidden /><span className={compact ? 'sr-only' : undefined} data-testid="email-timing-sla">SLA {sla.toLowerCase()}</span>
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 p-4" data-testid="email-timing">
        <p className="text-[13px] font-semibold text-ink">{d.ticket.channel === 'email' ? 'Email timing' : 'Chat timing'}</p>
        <dl className="mt-3 grid grid-cols-2 gap-x-4 gap-y-3" data-testid="email-timing-rows">
          {rows.map(([k, v]) => <div key={k}><dt className="text-xs text-ink-muted">{k}</dt><dd className="text-[13px] text-ink">{v}</dd></div>)}
        </dl>
      </PopoverContent>
    </Popover>
  )
}
