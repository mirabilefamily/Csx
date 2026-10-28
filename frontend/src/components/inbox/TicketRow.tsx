import { Link, useLocation } from 'react-router-dom'
import { Mail, MessageCircle, Sparkles } from 'lucide-react'
import type { Ticket, User } from '@/types'
import { StatusPill } from '@/components/StatusPill'
import { AuthorBadge } from '@/components/AuthorBadge'
import { FraudShield } from '@/components/dashboard/FraudBits'
import { Button } from '@/components/ui/button'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'
import { AI_STATE_LABEL, aiState, shortId, waiting } from '@/lib/inboxViews'

const RESOLVER_BADGE = { claude: 'claude', grokbot: 'grokbot', human: 'agent' } as const
const TONE = { ok: 'text-ink-muted', close: 'font-semibold text-amber-700', breached: 'font-semibold text-red-700' } as const

interface Props {
  t: Ticket
  active: boolean
  checked: boolean
  onCheck: (checked: boolean) => void
  selectable?: boolean
  actions?: React.ReactNode
  variant?: 'default' | 'needs' | 'ai'
  users?: User[]
  onTakeOver?: (t: Ticket) => void
}

const initials = (n: string) => n.split(' ').map((w) => w[0]).join('').slice(0, 2)

function NeedsMeta({ t, users }: { t: Ticket; users?: User[] }) {
  const w = waiting(t)
  const owner = users?.find((u) => u.id === t.assignee)
  return (
    <>
      {t.handoverReason && <span className="mt-0.5 block truncate text-xs text-ink-muted" data-testid={`ticket-reason-${t.id}`}>{t.handoverReason}</span>}
      <span className="mt-2 flex flex-wrap items-center gap-1.5">
        {t.draftReady && <span className="inline-flex h-5 items-center rounded px-1.5 text-[11px] font-medium text-ink-muted bg-surface-muted" data-testid={`ticket-draft-ready-${t.id}`}>Draft ready</span>}
        {t.fraud && <FraudShield level={t.fraud.level} testId={`ticket-fraud-${t.id}`} />}
        <span className={cn('text-[11px]', TONE[w.tone])} data-testid={`ticket-waiting-${t.id}`} data-tone={w.tone}>{w.label}</span>
        {owner && <span className="ml-auto flex h-5 w-5 items-center justify-center rounded-full bg-border text-[10px] font-semibold text-ink" title={`Assigned to ${owner.name}`} aria-label={`Assigned to ${owner.name}`} data-testid={`ticket-assignee-${t.id}`}>{initials(owner.name)}</span>}
      </span>
    </>
  )
}

function AiMeta({ t, onTakeOver }: { t: Ticket; onTakeOver?: (t: Ticket) => void }) {
  const st = aiState(t)
  const who = t.status === 'grok_handling' || t.resolvedBy === 'grokbot' ? 'Grokbot' : 'AI'
  return (
    <span className="mt-2 flex flex-wrap items-center gap-1.5 text-[11px] text-ink-muted">
      <span className="inline-flex items-center gap-1 font-medium text-ink" data-testid={`ticket-ai-state-${t.id}`}><Sparkles className="h-3 w-3 text-ink-muted" aria-hidden />{st ? AI_STATE_LABEL[st] : '—'}</span>
      <span>· {who}</span>
      {t.aiConfidence != null && <span data-testid={`ticket-ai-confidence-${t.id}`}>· {Math.round(t.aiConfidence * 100)}%</span>}
      {onTakeOver && st !== 'resolved_today' && <Button size="sm" variant="outline" className="ml-auto h-7 px-2 text-xs max-sm:h-11" onClick={(e) => { e.preventDefault(); onTakeOver(t) }} data-testid={`take-over-${t.id}`}>Take over</Button>}
    </span>
  )
}

export function TicketRow({ t, active, checked, onCheck, selectable = true, actions, variant = 'default', users, onTakeOver, anySelected = false }: Props & { anySelected?: boolean }) {
  const { search } = useLocation()
  const ChannelIcon = t.channel === 'email' ? Mail : MessageCircle
  const showCheck = selectable && (anySelected || checked)
  return (
    <li className={cn('group relative flex gap-3 border-b border-border px-4 py-3 transition-colors max-sm:min-h-[64px] max-sm:items-start', active ? 'bg-tobacco-50 shadow-[inset_3px_0_0_theme(colors.tobacco.600)]' : checked ? 'bg-surface-muted' : 'bg-white hover:bg-surface-sunken')} data-testid={`ticket-row-${t.id}`}>
      <span className="relative mt-0.5 flex h-4 w-4 shrink-0 items-center justify-center max-sm:h-6 max-sm:w-6">
        <ChannelIcon className={cn('h-4 w-4 text-ink-muted transition-opacity', selectable && (showCheck ? 'opacity-0' : 'group-focus-within:opacity-0 group-hover:opacity-0'))} aria-label={t.channel === 'email' ? 'Email' : 'Chat'} role="img" data-testid={`ticket-channel-${t.id}`} />
        {selectable && <input
          type="checkbox"
          checked={checked}
          onChange={(e) => onCheck(e.target.checked)}
          aria-label={`Select ${t.id}: ${t.subject}`}
          data-testid={`ticket-check-${t.id}`}
          data-shown={showCheck || undefined}
          className={cn('absolute inset-0 h-4 w-4 cursor-pointer rounded accent-tobacco-600 transition-opacity focus:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 group-focus-within:opacity-100 group-hover:opacity-100 max-sm:h-6 max-sm:w-6', showCheck ? 'opacity-100' : 'opacity-0')}
        />}
      </span>
      <div className="min-w-0 flex-1">
        <Link to={{ pathname: `/inbox/${t.id}`, search }} aria-current={active ? 'true' : undefined} data-testid={`ticket-link-${t.id}`} className="block rounded-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2">
          <span className="flex items-baseline justify-between gap-2">
            <span className="truncate text-[13px] font-semibold text-ink">{t.customer.name}</span>
            <span className="shrink-0 text-xs text-ink-muted">{timeAgo(t.updatedAt)}</span>
          </span>
          <span className="mt-0.5 block truncate text-[13px] text-ink">{t.subject}</span>
          {variant === 'needs' ? <NeedsMeta t={t} users={users} /> : variant === 'default' && (
            <>
              <span className="mt-0.5 block truncate text-xs text-ink-muted">{t.preview}</span>
              <span className="mt-2 flex flex-wrap items-center gap-1.5">
                <StatusPill status={t.status} />
                {t.fraud && <FraudShield level={t.fraud.level} testId={`ticket-fraud-${t.id}`} />}
                {t.resolvedBy && (t.status === 'resolved' || t.status === 'closed') && <AuthorBadge type={RESOLVER_BADGE[t.resolvedBy]} />}
                <span className="ml-auto text-[11px] font-medium text-ink-muted" title={t.id} data-testid={`ticket-short-id-${t.id}`}>{shortId(t.id)}</span>
              </span>
            </>
          )}
        </Link>
        {variant === 'ai' && <AiMeta t={t} onTakeOver={onTakeOver} />}
      </div>
      {actions && <div className="flex shrink-0 flex-col gap-1.5">{actions}</div>}
    </li>
  )
}
