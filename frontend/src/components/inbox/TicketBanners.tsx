import { useState } from 'react'
import * as Collapsible from '@radix-ui/react-collapsible'
import { Bot, ChevronDown } from 'lucide-react'
import type { TicketDetail } from '@/types'
import { focusRing } from '@/components/ui/button'
import { cn } from '@/lib/utils'

const fmt = (iso: string | undefined) => (iso ? new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' }) : '—')
const SLA_HOURS = 4

// Shown while the latest outbound reply came from AI and the ticket is still open.
export function AiRepliedBanner({ d }: { d: TicketDetail }) {
  const last = [...d.messages].reverse().find((m) => m.authorType !== 'system' && !m.isInternal)
  if (!last || (last.authorType !== 'claude' && last.authorType !== 'grokbot') || ['resolved', 'closed'].includes(d.ticket.status)) return null
  const who = last.authorType === 'claude' ? 'Claude' : 'Grokbot'
  return (
    <div className="flex items-start gap-2.5 border-b border-[#EADFD2] bg-[#FAF5EE] px-4 py-2.5 text-sm text-ink md:px-6" role="status" data-testid="ai-replied-banner">
      <Bot className="mt-0.5 h-4 w-4 shrink-0 text-tobacco-600" aria-hidden />
      <p><span className="font-semibold">AI replied:</span> {who} answered the latest customer message. No staff handoff yet. This ticket isn't resolved.</p>
    </div>
  )
}

export function EmailTiming({ d }: { d: TicketDetail }) {
  const [open, setOpen] = useState(false)
  const firstAi = d.messages.find((m) => (m.authorType === 'claude' || m.authorType === 'grokbot') && !m.isInternal)
  const firstHuman = d.messages.find((m) => m.authorType === 'agent' && !m.isInternal)
  const first = [firstAi, firstHuman].filter(Boolean).map((m) => m!.createdAt).sort()[0]
  const hours = first ? (new Date(first).getTime() - new Date(d.ticket.createdAt).getTime()) / 3.6e6 : null
  const sla = hours === null ? (Date.now() - new Date(d.ticket.createdAt).getTime() > SLA_HOURS * 3.6e6 ? 'Breached' : 'Pending') : hours <= SLA_HOURS ? 'Met' : 'Breached'
  const rows: [string, string][] = [['Received', fmt(d.ticket.createdAt)], ['First AI reply', fmt(firstAi?.createdAt)], ['First human reply', fmt(firstHuman?.createdAt)], [`SLA (${SLA_HOURS}h first response)`, sla]]
  return (
    <Collapsible.Root open={open} onOpenChange={setOpen} className="border-b border-border bg-surface px-4 md:px-6" data-testid="email-timing">
      <Collapsible.Trigger className={cn('flex min-h-10 w-full items-center gap-2 text-xs font-medium text-ink-muted hover:text-ink max-sm:min-h-11', focusRing)} data-testid="email-timing-toggle">
        <ChevronDown className={cn('h-4 w-4 transition-transform', open && 'rotate-180')} aria-hidden />
        {d.ticket.channel === 'email' ? 'Email timing' : 'Chat timing'}
        <span className={cn('ml-1 rounded-full px-2 py-0.5 text-[11px] font-semibold', sla === 'Met' ? 'bg-green-50 text-green-700' : sla === 'Breached' ? 'bg-red-50 text-red-700' : 'bg-surface-muted text-ink-muted')} data-testid="email-timing-sla">SLA {sla.toLowerCase()}</span>
      </Collapsible.Trigger>
      <Collapsible.Content>
        <dl className="grid grid-cols-2 gap-x-6 gap-y-2 pb-3 sm:grid-cols-4" data-testid="email-timing-rows">
          {rows.map(([k, v]) => <div key={k}><dt className="text-[11px] text-ink-muted">{k}</dt><dd className="text-sm text-ink">{v}</dd></div>)}
        </dl>
      </Collapsible.Content>
    </Collapsible.Root>
  )
}
