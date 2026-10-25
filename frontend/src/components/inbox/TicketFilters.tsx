import { SlidersHorizontal } from 'lucide-react'
import type { Channel, Resolver, Ticket, TicketStatus, User } from '@/types'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/overlay'
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
  const set = <K extends keyof Filters>(k: K) => (v?: string) => onChange({ ...filters, [k]: v })
  return (
    <Popover>
      <PopoverTrigger className={cn(buttonVariants({ variant: 'outline', size: 'sm' }), count && 'border-tobacco-500 bg-tobacco-50')} data-testid="filters-button">
        <SlidersHorizontal aria-hidden /> Filters
        {count > 0 && <span className="rounded-full bg-tobacco-600 px-1.5 text-[11px] font-semibold leading-5 text-white" data-testid="active-filter-count">{count}</span>}
      </PopoverTrigger>
      <PopoverContent align="start" className="w-72 space-y-3 p-4" data-testid="filters-panel">
        <FilterSelect id="status" label="Status" value={filters.status} onChange={set('status')} options={Object.entries(STATUS_LABELS)} />
        <FilterSelect id="channel" label="Channel" value={filters.channel} onChange={set('channel')} options={Object.entries(CHANNEL_LABELS)} />
        <FilterSelect id="resolvedBy" label="Resolved by" value={filters.resolvedBy} onChange={set('resolvedBy')} options={Object.entries(RESOLVER_LABELS)} />
        <FilterSelect id="tag" label="Tag" value={filters.tag} onChange={set('tag')} options={tags.map((t) => [t, t])} />
        <FilterSelect id="assignee" label="Assignee" value={filters.assignee} onChange={set('assignee')} options={[['unassigned', 'Unassigned'], ...users.map((u) => [u.id, u.name] as [string, string])]} />
        <Button variant="ghost" size="sm" className="w-full" disabled={!count} onClick={() => onChange({})} data-testid="filters-clear">Clear filters</Button>
      </PopoverContent>
    </Popover>
  )
}
