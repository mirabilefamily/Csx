import { useState } from 'react'
import { Check, CheckCircle2, ChevronDown, Copy, Mail, MessageCircle, Sparkles } from 'lucide-react'
import { toast } from 'sonner'
import type { Message } from '@/types'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/overlay'
import { DELIVERY_LABEL, deliveryFor } from '@/lib/delivery'
import { cn } from '@/lib/utils'

export const richText = '[&_a]:text-tobacco-700 [&_a]:underline [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-2 [&_strong]:font-semibold [&_u]:underline [&_ul]:list-disc [&_ul]:pl-5'

const AVATAR: Record<string, string> = { customer: 'bg-surface-muted text-ink', claude: 'bg-tobacco-100 text-tobacco-800', grokbot: 'bg-tobacco-700 text-white', agent: 'bg-brass-100 text-brass-700' }
const DOT = { queued: 'bg-slate-400', sent: 'bg-brass-500', delivered: 'bg-green-600', bounced: 'bg-red-600' } as const
const isAi = (m: Message) => m.authorType === 'claude' || m.authorType === 'grokbot'

export function stamp(iso: string) {
  const d = new Date(iso)
  const t = d.toLocaleTimeString([], { hour: 'numeric', minute: '2-digit' })
  const days = Math.round((new Date().setHours(0, 0, 0, 0) - new Date(iso).setHours(0, 0, 0, 0)) / 864e5)
  return days === 0 ? `Today at ${t}` : days === 1 ? `Yesterday at ${t}` : `${d.toLocaleDateString([], { month: 'short', day: 'numeric' })} at ${t}`
}

function Time({ iso }: { iso: string }) {
  return <time dateTime={iso} title={new Date(iso).toLocaleString()} className="whitespace-nowrap text-xs text-ink-muted">{stamp(iso)}</time>
}

function Avatar({ m }: { m: Message }) {
  const initials = m.authorType === 'claude' ? 'C' : m.authorType === 'grokbot' ? 'G' : m.authorName.split(' ').map((w) => w[0]).join('').slice(0, 2)
  return <span className={cn('flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-[11px] font-semibold', AVATAR[m.authorType])} aria-hidden>{initials}</span>
}

function Delivery({ m, channel }: { m: Message; channel: 'email' | 'chat' }) {
  const d = deliveryFor(m, channel)
  if (!d) return null
  return (
    <Popover>
      <PopoverTrigger className="inline-flex h-6 w-6 items-center justify-center rounded text-green-700 hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-sm:h-11 max-sm:w-11" title={DELIVERY_LABEL[d.status]} data-testid={`delivery-${m.id}`} data-status={d.status}>
        <Check className={cn('h-3.5 w-3.5', d.status === 'bounced' && 'text-red-700', d.status === 'queued' && 'text-ink-muted')} aria-hidden />
        <span className="sr-only">{DELIVERY_LABEL[d.status]}: show delivery timeline</span>
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

const plain = (m: Message) => (m.format === 'html' ? new DOMParser().parseFromString(m.body, 'text/html').body.textContent ?? '' : m.body)

function AiFooter({ m, reasoning }: { m: Message; reasoning?: string[] }) {
  const [open, setOpen] = useState(false)
  return (
    <div className="mt-2 text-xs text-ink-muted" data-testid={`ai-footer-${m.id}`}>
      <p className="flex flex-wrap items-center gap-1">
        <span>Created by Goorin AI Assistant{m.approvedBy ? ` · Approved by ${m.approvedBy}` : ''}</span><span aria-hidden>·</span>
        <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className="inline-flex min-h-6 items-center gap-0.5 rounded font-medium text-ink-muted hover:text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-sm:min-h-11" data-testid={`ai-reasoning-toggle-${m.id}`}>
          {open ? 'Hide reasoning' : 'Show reasoning'}<ChevronDown className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-180')} aria-hidden />
        </button>
      </p>
      {open && (
        <ul className="mt-1.5 list-disc space-y-1 pl-4 text-ink" data-testid={`ai-reasoning-${m.id}`}>
          {(reasoning?.length ? reasoning : ['Matched the customer question to published guidance.', 'Checked the order status in Shopify before replying.']).map((r) => <li key={r}>{r}</li>)}
          <li>Model: {m.authorName}</li>
        </ul>
      )}
    </div>
  )
}

const chipCls = 'inline-flex h-5 items-center gap-1 rounded bg-surface-muted px-1.5 text-[11px] font-medium text-ink-muted'

export function MessageItem({ m, channel = 'email', email, reasoning }: { m: Message; channel?: 'email' | 'chat'; email?: string; reasoning?: string[] }) {
  if (m.authorType === 'system') {
    return (
      <li className="flex justify-center py-4 max-sm:py-3" data-testid={`message-${m.id}`} data-author="system">
        <span className="flex w-full max-w-[760px] items-center gap-3 text-xs text-ink-muted" data-testid="event-line">
          <span className="h-px min-w-6 flex-1 bg-border" aria-hidden />
          <span className="max-w-[80%] text-center">{m.body} <span aria-hidden>·</span> <Time iso={m.createdAt} /></span>
          <span className="h-px min-w-6 flex-1 bg-border" aria-hidden />
        </span>
      </li>
    )
  }
  const inbound = m.authorType === 'customer'
  const ChannelIcon = channel === 'email' ? Mail : MessageCircle
  const copy = async () => { await navigator.clipboard?.writeText(plain(m)).catch(() => undefined); toast.success('Message copied') }
  return (
    <li data-testid={`message-${m.id}`} data-author={m.authorType} data-internal={m.isInternal || undefined} className={cn('group flex w-full py-2 max-sm:py-1.5', inbound ? 'justify-start' : 'justify-end')}>
      <div className={cn('w-full max-w-[min(85%,760px)] rounded-xl border p-4 shadow-card max-sm:max-w-[92%] min-[1440px]:p-5', m.isInternal ? 'border-[#F3E3B5] bg-[#FFFCF3]' : 'border-border bg-surface')}>
        <div className="flex flex-wrap items-center gap-x-2 gap-y-1">
          <Avatar m={m} />
          <span className="text-sm font-semibold text-ink">{m.authorName}</span>
          {inbound ? email && <span className="truncate text-xs text-ink-muted">&lt;{email}&gt;</span> : isAi(m) ? <span className={chipCls} data-testid="ai-label"><Sparkles className="h-3 w-3" aria-hidden />AI</span> : <span className={chipCls} data-testid="agent-label">Agent</span>}
          {m.isInternal && <span className={cn(chipCls, 'bg-amber-50 text-amber-800')} data-testid="internal-note-label">Internal note</span>}
          <span className="ml-auto inline-flex items-center gap-1 text-ink-muted">
            <ChannelIcon className="h-3.5 w-3.5" aria-label={channel === 'email' ? 'Email' : 'Chat'} />
            <Time iso={m.createdAt} />
            {!inbound && !m.isInternal && <Delivery m={m} channel={channel} />}
            <button type="button" onClick={copy} aria-label="Copy message" className="inline-flex h-6 w-6 items-center justify-center rounded text-ink-muted opacity-0 hover:bg-surface-muted group-hover:opacity-100 focus-visible:opacity-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-sm:h-11 max-sm:w-11 max-sm:opacity-100" data-testid={`message-copy-${m.id}`}><Copy className="h-3.5 w-3.5" aria-hidden /></button>
          </span>
        </div>
        <div className="mt-2">
          {m.format === 'html' ? (
            <div className={cn('text-[14px] leading-[1.55] text-ink', richText)} dangerouslySetInnerHTML={{ __html: m.body }} />
          ) : (
            <p className="whitespace-pre-wrap text-[14px] leading-[1.55] text-ink">{m.body}</p>
          )}
        </div>
        {m.approvedBy && !isAi(m) && <p className="mt-2 inline-flex items-center gap-1 text-xs font-medium text-green-700" data-testid="approved-by"><CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Approved by {m.approvedBy}</p>}
        {m.approvedBy && isAi(m) && <span className="sr-only" data-testid="approved-by">Approved by {m.approvedBy}</span>}
        {isAi(m) && <AiFooter m={m} reasoning={reasoning} />}
      </div>
    </li>
  )
}
