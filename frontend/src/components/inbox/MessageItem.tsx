import { Fragment } from 'react'
import { CheckCircle2, StickyNote } from 'lucide-react'
import type { Message } from '@/types'
import { AuthorBadge } from '@/components/AuthorBadge'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/overlay'
import { DELIVERY_LABEL, deliveryFor } from '@/lib/delivery'
import { CHANNEL_LABELS } from '@/lib/labels'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'

export const richText = '[&_a]:text-tobacco-700 [&_a]:underline [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-2 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5'

const AVATAR: Record<string, string> = { customer: 'bg-surface-muted text-ink', claude: 'bg-[#F6E6DC] text-[#9A4A2A]', grokbot: 'bg-slate-700 text-white', agent: 'bg-tobacco-100 text-tobacco-800' }
const DOT = { queued: 'bg-slate-400', sent: 'bg-brass-500', delivered: 'bg-green-600', bounced: 'bg-red-600' } as const

function Time({ iso }: { iso: string }) {
  return <time dateTime={iso} title={new Date(iso).toLocaleString()} className="text-xs text-ink-muted">{timeAgo(iso)}</time>
}

function Avatar({ m }: { m: Message }) {
  const initials = m.authorType === 'claude' ? 'C' : m.authorType === 'grokbot' ? 'G' : m.authorName.split(' ').map((w) => w[0]).join('').slice(0, 2)
  return <span className={cn('mt-0.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold', AVATAR[m.authorType])} aria-hidden>{initials}</span>
}

function Delivery({ m, channel }: { m: Message; channel: 'email' | 'chat' }) {
  const d = deliveryFor(m, channel)
  if (!d) return null
  return (
    <Popover>
      <PopoverTrigger className="inline-flex min-h-8 items-center gap-1.5 rounded px-1 text-xs text-ink-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-sm:min-h-11" data-testid={`delivery-${m.id}`}>
        <span className={cn('h-1.5 w-1.5 rounded-full', DOT[d.status])} aria-hidden />
        {DELIVERY_LABEL[d.status]}<span className="sr-only">: show delivery timeline</span>
      </PopoverTrigger>
      <PopoverContent align="end" className="w-72 p-4" data-testid={`delivery-timeline-${m.id}`}>
        <p className="text-sm font-semibold text-ink">Delivery timeline</p>
        <ol className="mt-3 space-y-3 border-l border-border pl-4">
          {d.events.map((e, i) => (
            <li key={i} className="relative">
              <span className={cn('absolute -left-[21px] top-1 h-2.5 w-2.5 rounded-full ring-2 ring-white', i === d.events.length - 1 ? DOT[d.status] : 'bg-ink-subtle')} aria-hidden />
              <p className="text-sm font-medium text-ink">{e.label}</p>
              <p className="text-xs text-ink-muted">{new Date(e.at).toLocaleTimeString([], { hour: 'numeric', minute: '2-digit', second: '2-digit' })}{e.detail && ` · ${e.detail}`}</p>
            </li>
          ))}
        </ol>
      </PopoverContent>
    </Popover>
  )
}

export function MessageItem({ m, channel = 'email' }: { m: Message; channel?: 'email' | 'chat' }) {
  if (m.authorType === 'system')
    return (
      <li className="flex justify-center" data-testid={`message-${m.id}`} data-author="system">
        <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full bg-surface-muted px-3 py-1 text-xs text-ink-muted">
          <AuthorBadge type="system" />
          <span className="text-ink">{m.body}</span>
          <Time iso={m.createdAt} />
        </span>
      </li>
    )
  const inbound = m.authorType === 'customer'
  const pill = inbound ? <span className="rounded-full bg-surface-muted px-2 py-0.5 text-[11px] font-semibold text-ink-muted">Customer</span> : <AuthorBadge type={m.authorType} />
  const meta = [<span key="n" className="text-sm font-medium text-ink">{m.authorName}</span>, pill, <span key="c" className="text-xs text-ink-muted">{CHANNEL_LABELS[channel]}</span>, <Time key="t" iso={m.createdAt} />]
  return (
    <li data-testid={`message-${m.id}`} data-author={m.authorType} data-internal={m.isInternal || undefined} className={cn('flex w-full gap-3', inbound ? 'justify-start' : 'flex-row-reverse justify-start')}>
      <Avatar m={m} />
      <div className={cn('min-w-0 max-w-[min(100%,620px)] flex-1 rounded-2xl border p-4', inbound ? 'rounded-tl-md border-border bg-surface' : 'rounded-tr-md', !inbound && (m.isInternal ? 'border-dashed border-amber-300 bg-amber-50' : 'border-[#EADFD2] bg-[#FAF5EE]'))}>
        <div className={cn('mb-2 flex flex-wrap items-center gap-2', !inbound && 'flex-row-reverse')}>
          {(inbound ? meta : [...meta].reverse()).map((x, i) => <Fragment key={i}>{x}</Fragment>)}
          {m.isInternal && (
            <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900" data-testid="internal-note-label">
              <StickyNote className="h-3 w-3" aria-hidden /> Internal note
            </span>
          )}
        </div>
        {m.format === 'html' ? (
          <div className={cn('text-sm text-ink', richText)} dangerouslySetInnerHTML={{ __html: m.body }} />
        ) : (
          <p className="whitespace-pre-wrap text-sm text-ink">{m.body}</p>
        )}
        <div className={cn('mt-2 flex flex-wrap items-center gap-3', !inbound && 'justify-end')}>
          {m.approvedBy && (
            <p className="inline-flex items-center gap-1 text-xs font-medium text-green-700" data-testid="approved-by">
              <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Approved by {m.approvedBy}
            </p>
          )}
          <Delivery m={m} channel={channel} />
        </div>
      </div>
    </li>
  )
}
