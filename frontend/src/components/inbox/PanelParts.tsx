import { useState } from 'react'
import { Link, useLocation } from 'react-router-dom'
import { ChevronDown, ChevronRight, ExternalLink, Mail, MessageCircle, Plus, Tag, X } from 'lucide-react'
import type { Customer, TicketDetail, TicketPatch } from '@/types'
import { viewsApi } from '@/api'
import { StatusPill } from '@/components/StatusPill'
import { Button, focusRing } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/overlay'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'

export function Disclosure({ label, children, testId }: { label: string; children: React.ReactNode; testId: string }) {
  const [open, setOpen] = useState(false)
  return (
    <div>
      <button type="button" aria-expanded={open} onClick={() => setOpen(!open)} className={cn('inline-flex min-h-8 items-center gap-1 rounded text-xs font-medium text-ink-muted hover:text-ink max-sm:min-h-11', focusRing)} data-testid={testId}>
        <ChevronRight className={cn('h-3.5 w-3.5 transition-transform', open && 'rotate-90')} aria-hidden />{label}
      </button>
      {open && <div className="mt-2 space-y-2 pl-4">{children}</div>}
    </div>
  )
}

export function TicketTags({ d, onPatch, allTags }: { d: TicketDetail; onPatch: (p: TicketPatch) => void; allTags: string[] }) {
  const [more, setMore] = useState(false)
  const [q, setQ] = useState('')
  const [fields, setFields] = useState<Record<string, string>>({})
  const tags = d.ticket.tags
  const shown = more ? tags : tags.slice(0, 3)
  const add = (t: string) => { const v = t.trim().toLowerCase(); if (v && !tags.includes(v)) onPatch({ tags: [...tags, v] }); setQ('') }
  return (
    <div className="space-y-4" data-testid="ticket-details">
      <div className="flex flex-wrap items-center gap-1.5">
        {shown.map((t) => (
          <span key={t} className="inline-flex h-6 items-center gap-1 rounded-md bg-tobacco-50 pl-2 pr-0.5 text-xs text-ink" data-testid={`ticket-tag-${t}`}>
            <span className="h-2 w-2 rounded-full" style={{ background: viewsApi.TAG_COLORS[t] ?? '#8A7F73' }} aria-hidden />{t}
            <button type="button" aria-label={`Remove tag ${t}`} onClick={() => onPatch({ tags: tags.filter((x) => x !== t) })} className={cn('rounded-full p-0.5 hover:bg-surface-muted', focusRing)} data-testid={`ticket-tag-remove-${t}`}><X className="h-3 w-3" aria-hidden /></button>
          </span>
        ))}
        {tags.length > 3 && <button type="button" onClick={() => setMore(!more)} aria-expanded={more} className={cn('inline-flex min-h-6 items-center gap-0.5 rounded-full bg-surface-muted px-2 text-xs font-medium text-ink-muted', focusRing)} data-testid="ticket-tags-overflow">{more ? 'Less' : `+${tags.length - 3}`}<ChevronDown className={cn('h-3 w-3', more && 'rotate-180')} aria-hidden /></button>}
        <Popover>
          <PopoverTrigger className={cn('inline-flex h-7 items-center gap-1 rounded-md px-2 text-xs font-medium text-ink-muted hover:bg-tobacco-50 hover:text-ink max-sm:h-11', focusRing)} data-testid="ticket-tag-add"><Plus className="h-3.5 w-3.5" aria-hidden />Add tag</PopoverTrigger>
          <PopoverContent align="start" className="w-60 p-2">
            <form onSubmit={(e) => { e.preventDefault(); add(q) }}><Input autoFocus aria-label="Tag name" placeholder="Add or search tags" className="h-9" value={q} onChange={(e) => setQ(e.target.value)} data-testid="ticket-tag-input" /></form>
            <ul className="mt-2 max-h-40 overflow-y-auto">{allTags.filter((t) => !tags.includes(t) && t.includes(q.toLowerCase())).slice(0, 8).map((t) => <li key={t}><button type="button" onClick={() => add(t)} className={cn('flex min-h-8 w-full items-center gap-2 rounded px-2 text-left text-sm hover:bg-surface-muted', focusRing)} data-testid={`ticket-tag-option-${t}`}><span className="h-2 w-2 rounded-full" style={{ background: viewsApi.TAG_COLORS[t] ?? '#8A7F73' }} aria-hidden />{t}</button></li>)}</ul>
          </PopoverContent>
        </Popover>
      </div>
      <dl className="grid grid-cols-[112px_minmax(0,1fr)] gap-x-3 gap-y-2 text-[13px]" data-testid="ticket-fields">
        {viewsApi.TICKET_FIELDS.map((f) => (
          <div key={f.id} className="contents">
            <dt className="flex min-h-7 items-center text-ink-muted"><label htmlFor={`tf-${f.id}`}>{f.label}</label></dt>
            <dd className="flex min-h-7 items-center">
              <select id={`tf-${f.id}`} value={fields[f.id] ?? ''} onChange={(e) => setFields({ ...fields, [f.id]: e.target.value })} className={cn('-ml-[5px] h-7 w-[calc(100%+5px)] cursor-pointer rounded-md border border-transparent bg-transparent px-1 text-[13px] hover:border-border hover:bg-tobacco-50 max-sm:h-11', fields[f.id] ? 'text-ink' : 'text-ink-subtle', focusRing)} data-testid={`ticket-field-${f.id}`}>
                <option value="">Not set</option>{f.options.map((o) => <option key={o}>{o}</option>)}
              </select>
            </dd>
          </div>
        ))}
      </dl>
    </div>
  )
}

export function CustomerRows({ email, c }: { email: string; c: Customer | null }) {
  const [note, setNote] = useState<string | null>(null)
  const row = 'grid grid-cols-[64px_1fr] items-center gap-2 text-xs'
  const link = 'truncate font-medium text-tobacco-700 underline-offset-2 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'
  return (
    <div className="space-y-1.5" data-testid="customer-rows">
      <div className={row}><span className="text-ink-muted">Email</span><a href={`mailto:${email}`} className={link} data-testid="customer-email-link">{email}</a></div>
      <div className={row}><span className="text-ink-muted">Phone</span>{c?.phone ? <a href={`tel:${c.phone}`} className={link} data-testid="customer-phone-link">{c.phone}</a> : <span className="text-ink-subtle">Not set</span>}</div>
      <div className={row}><span className="text-ink-muted">Note</span>{note === null ? <button type="button" onClick={() => setNote('')} className={cn('w-fit text-left font-medium text-tobacco-700 hover:underline', focusRing)} data-testid="customer-note-add">+ Add</button> : <Input aria-label="Customer note" autoFocus className="h-8 text-xs" value={note} onChange={(e) => setNote(e.target.value)} data-testid="customer-note-input" />}</div>
      <Disclosure label="Customer fields" testId="customer-fields-toggle"><p className="text-xs text-ink-muted" data-testid="customer-fields-empty">No customer fields yet</p></Disclosure>
    </div>
  )
}

import { CountBadge } from './DetailParts'
export function PastTickets({ d }: { d: TicketDetail }) {
  const { search } = useLocation()
  const [all, setAll] = useState(false)
  const list = all ? d.pastTickets : d.pastTickets.slice(0, 3)
  if (!d.pastTickets.length) return <p className="text-[13px] text-ink-muted">No other tickets from this customer</p>
  return (
    <div className="space-y-2">
      <ul className="space-y-1.5">
        {list.map((t) => {
          const Icon = t.channel === 'email' ? Mail : MessageCircle
          return (
            <li key={t.id}>
              <Link to={{ pathname: `/inbox/${t.id}`, search }} className="block rounded-lg border border-border px-3 py-2.5 hover:bg-tobacco-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid={`past-ticket-${t.id}`}>
                <span className="flex items-center gap-1.5 text-[13px] font-medium text-ink"><Icon className="h-4 w-4 shrink-0 text-ink-muted" aria-hidden /><span className="truncate">{t.subject}</span></span>
                <span className="mt-1 flex flex-wrap items-center gap-1.5 text-xs text-ink-muted"><span>{timeAgo(t.updatedAt)}{t.tags[0] && ` · ${t.tags[0]}`}</span><span className="ml-auto"><StatusPill status={t.status} /></span></span>
              </Link>
            </li>
          )
        })}
      </ul>
      {d.pastTickets.length > 3 && <Button variant="ghost" size="sm" className="-ml-2 text-ink-muted" onClick={() => setAll(!all)} data-testid="past-tickets-show-all">{all ? 'Show less' : <>Show all <CountBadge n={d.pastTickets.length} /></>}</Button>}
    </div>
  )
}
