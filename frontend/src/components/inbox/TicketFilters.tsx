import { SlidersHorizontal } from 'lucide-react'
import { useState } from 'react'
import { DialogTrigger } from '@radix-ui/react-dialog'
import { Dialog, DialogContent, DialogTitle, SheetGrabber } from '@/components/ui/dialog'
import { useIsPhone } from '@/hooks/useIsPhone'
import type { Channel, Resolver, Ticket, TicketStatus, User } from '@/types'
import { Popover, PopoverContent, PopoverTrigger, Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/overlay'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Label } from '@/components/ui/input'
import { Button, buttonVariants } from '@/components/ui/button'
import { CHANNEL_LABELS, RESOLVER_LABELS, STATUS_LABELS } from '@/lib/labels'
import { cn } from '@/lib/utils'

export interface Filters {
  status?: TicketStatus
  channel?: Channel
  resolvedBy?: Resolver
  tag?: string
  assignee?: string
}

export const activeFilterCount = (f: Filters) => Object.values(f).filter(Boolean).length

export function matchFilters(t: Ticket, f: Filters) {
  return (
    (!f.status || t.status === f.status) &&
    (!f.channel || t.channel === f.channel) &&
    (!f.resolvedBy || t.resolvedBy === f.resolvedBy) &&
    (!f.tag || t.tags.includes(f.tag)) &&
    (!f.assignee || (f.assignee === 'unassigned' ? !t.assignee : t.assignee === f.assignee))
  )
}

interface Props {
  filters: Filters
  onChange: (f: Filters) => void
  tags: string[]
  users: User[]
}

function FilterSelect({ id, label, value, options, onChange }: { id: string; label: string; value?: string; options: [string, string][]; onChange: (v?: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label htmlFor={`filter-${id}`} className="text-xs text-ink-muted">{label}</Label>
      <Select value={value ?? 'any'} onValueChange={(v) => onChange(v === 'any' ? undefined : v)}>
        <SelectTrigger id={`filter-${id}`} className="h-9" data-testid={`filter-${id}`}><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="any">Any</SelectItem>
          {options.map(([v, l]) => <SelectItem key={v} value={v} data-testid={`filter-${id}-${v}`}>{l}</SelectItem>)}
        </SelectContent>
      </Select>
    </div>
  )
}

export function TicketFilters({ filters, onChange, tags, users }: Props) {
  const count = activeFilterCount(filters)
  const isPhone = useIsPhone()
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<Filters>(filters)
  const value = isPhone ? draft : filters
  const set = <K extends keyof Filters>(k: K) => (v?: string) => (isPhone ? setDraft({ ...draft, [k]: v }) : onChange({ ...filters, [k]: v }))
  const fields = (
    <>
      <FilterSelect id="status" label="Status" value={value.status} onChange={set('status')} options={Object.entries(STATUS_LABELS)} />
      <FilterSelect id="channel" label="Channel" value={value.channel} onChange={set('channel')} options={Object.entries(CHANNEL_LABELS)} />
      <FilterSelect id="resolvedBy" label="Resolved by" value={value.resolvedBy} onChange={set('resolvedBy')} options={Object.entries(RESOLVER_LABELS)} />
      <FilterSelect id="tag" label="Tag" value={value.tag} onChange={set('tag')} options={tags.map((t) => [t, t])} />
      <FilterSelect id="assignee" label="Assignee" value={value.assignee} onChange={set('assignee')} options={[['unassigned', 'Unassigned'], ...users.map((u) => [u.id, u.name] as [string, string])]} />
    </>
  )
  const trigger = (
    <>
      <SlidersHorizontal aria-hidden /> Filters
      {count > 0 && <span className="rounded-full bg-tobacco-600 px-1.5 text-[11px] font-semibold leading-5 text-white" data-testid="active-filter-count">{count}</span>}
    </>
  )
  if (isPhone)
    return (
      <Dialog open={open} onOpenChange={(o) => { setOpen(o); if (o) setDraft(filters) }}>
        <DialogTrigger className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), count && 'border-tobacco-500 bg-tobacco-50')} data-testid="filters-button">{trigger}</DialogTrigger>
        <DialogContent className="space-y-3 pt-3" aria-describedby={undefined} data-testid="filters-panel">
          <SheetGrabber />
          <DialogTitle className="text-base font-semibold text-ink">Filters</DialogTitle>
          {fields}
          <div className="sticky bottom-0 -mx-6 grid grid-cols-2 gap-2 border-t border-border bg-surface px-6 pt-3">
            <Button variant="outline" onClick={() => { onChange({}); setOpen(false) }} data-testid="filters-clear">Clear</Button>
            <Button onClick={() => { onChange(draft); setOpen(false) }} data-testid="filters-apply">Apply</Button>
          </div>
        </DialogContent>
      </Dialog>
    )
  return (
    <Popover>
      <Tooltip>
        <TooltipTrigger asChild>
          <PopoverTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }), 'relative', count && 'bg-tobacco-50 text-tobacco-700')} aria-label={count ? `Filter tickets, ${count} active` : 'Filter tickets'} data-testid="filters-button">
            <SlidersHorizontal aria-hidden />
            {count > 0 && <span className="absolute -right-1 -top-1 rounded-full bg-tobacco-600 px-1 text-[10px] font-semibold leading-4 text-white" data-testid="active-filter-count">{count}</span>}
          </PopoverTrigger>
        </TooltipTrigger>
        <TooltipContent>Filter</TooltipContent>
      </Tooltip>
      <PopoverContent align="start" className="w-72 space-y-3 p-4" data-testid="filters-panel">
        {fields}
        <Button variant="ghost" size="sm" className="w-full" disabled={!count} onClick={() => onChange({})} data-testid="filters-clear">Clear filters</Button>
      </PopoverContent>
    </Popover>
  )
}
