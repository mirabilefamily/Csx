import { Link, useLocation } from 'react-router-dom'
import { Mail, MessageCircle } from 'lucide-react'
import type { Ticket } from '@/types'
import { StatusPill } from '@/components/StatusPill'
import { AuthorBadge } from '@/components/AuthorBadge'
import { FraudShield } from '@/components/dashboard/FraudBits'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'
import { shortId } from '@/lib/inboxViews'

const RESOLVER_BADGE = { claude: 'claude', grokbot: 'grokbot', human: 'agent' } as const

interface Props {
  t: Ticket
  active: boolean
  checked: boolean
  onCheck: (checked: boolean) => void
  selectable?: boolean
  actions?: React.ReactNode
}

export function TicketRow({ t, active, checked, onCheck, selectable = true, actions }: Props) {
  const { search } = useLocation()
  const ChannelIcon = t.channel === 'email' ? Mail : MessageCircle
  return (
    <li className={cn('flex gap-3 border-b border-border px-3 py-3 transition-colors max-sm:min-h-[64px] max-sm:items-start', active ? 'bg-tobacco-50' : checked ? 'bg-brass-50' : 'hover:bg-surface-sunken')} data-testid={`ticket-row-${t.id}`}>
      {selectable && <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onCheck(e.target.checked)}
        aria-label={`Select ${t.id}: ${t.subject}`}
        data-testid={`ticket-check-${t.id}`}
        className="mt-1 h-4 w-4 shrink-0 cursor-pointer rounded accent-tobacco-600 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 max-sm:h-6 max-sm:w-6"
      />}
      <Link
        to={{ pathname: `/inbox/${t.id}`, search }}
        aria-current={active ? 'true' : undefined}
        data-testid={`ticket-link-${t.id}`}
        className="min-w-0 flex-1 rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
      >
        <span className="flex items-baseline justify-between gap-2">
          <span className="truncate text-sm font-semibold text-ink">{t.customer.name}</span>
          <span className="shrink-0 text-xs text-ink-muted">{timeAgo(t.updatedAt)}</span>
        </span>
        <span className="mt-0.5 block truncate text-sm text-ink">{t.subject}</span>
        <span className="mt-0.5 block truncate text-xs text-ink-muted">{t.preview}</span>
        <span className="mt-2 flex flex-wrap items-center gap-1.5">
          <ChannelIcon className="h-3.5 w-3.5 text-ink-muted" aria-label={t.channel === 'email' ? 'Email' : 'Chat'} role="img" />
          <StatusPill status={t.status} />
          {t.fraud && <FraudShield level={t.fraud.level} testId={`ticket-fraud-${t.id}`} />}
          {t.resolvedBy && (t.status === 'resolved' || t.status === 'closed') && <AuthorBadge type={RESOLVER_BADGE[t.resolvedBy]} />}
          {(t.priority === 'high' || t.priority === 'urgent') && <span className="text-[11px] font-semibold uppercase tracking-wide text-red-700">{t.priority}</span>}
          <span className="ml-auto text-[11px] font-medium text-ink-muted" title={t.id} data-testid={`ticket-short-id-${t.id}`}>{shortId(t.id)}</span>
        </span>
      </Link>
      {actions && <div className="flex shrink-0 flex-col gap-1.5">{actions}</div>}
    </li>
  )
}
