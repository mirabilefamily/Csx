import { useState } from 'react'
import { parseISO } from 'date-fns'
import { CalendarDays } from 'lucide-react'
import type { DateRange as DpRange } from 'react-day-picker'
import type { DateRange, RangePreset } from '@/types'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/overlay'
import { Calendar } from '@/components/ui/calendar'
import { Button, focusRing } from '@/components/ui/button'
import { earliestAvailableDate, formatRangeLabel, rangeForPreset, toKey } from '@/lib/dateRange'
import { cn } from '@/lib/utils'

const PRESETS: { id: Exclude<RangePreset, 'custom'>; label: string }[] = [
  { id: 'today', label: 'Last 24 hours' },
  { id: '7d', label: '7d' },
  { id: '30d', label: '30d' },
  { id: '90d', label: '90d' },
]

interface Props {
  preset: RangePreset
  range: DateRange
  onChange: (preset: RangePreset, range: DateRange) => void
}

const segment = cn('h-8 rounded-full px-3.5 text-sm font-medium transition-colors', focusRing)

export function DateRangePicker({ preset, range, onChange }: Props) {
  const [open, setOpen] = useState(false)
  const [draft, setDraft] = useState<DpRange | undefined>()
  const min = earliestAvailableDate()
  const today = new Date()
  const wide = typeof window !== 'undefined' && window.innerWidth >= 900

  return (
    <div role="group" aria-label="Date range" className="inline-flex flex-wrap items-center gap-0.5 rounded-full bg-surface-muted p-1" data-testid="date-range-picker">
      {PRESETS.map((p) => (
        <button
          key={p.id}
          type="button"
          aria-pressed={preset === p.id}
          data-testid={`range-${p.id}`}
          onClick={() => onChange(p.id, rangeForPreset(p.id))}
          className={cn(segment, preset === p.id ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(31,29,26,0.12)]' : 'text-ink-muted hover:text-ink')}
        >
          {p.label}
        </button>
      ))}
      <Popover
        open={open}
        onOpenChange={(o) => {
          setOpen(o)
          if (o) setDraft(preset === 'custom' ? { from: parseISO(range.from), to: parseISO(range.to) } : undefined)
        }}
      >
        <PopoverTrigger
          aria-pressed={preset === 'custom'}
          data-testid="range-custom"
          className={cn(segment, 'inline-flex items-center gap-1.5', preset === 'custom' ? 'bg-surface text-ink shadow-[0_1px_2px_rgba(31,29,26,0.12)]' : 'text-ink-muted hover:text-ink')}
        >
          <CalendarDays className="h-4 w-4" aria-hidden />
          {preset === 'custom' ? formatRangeLabel(range) : 'Custom'}
        </PopoverTrigger>
        <PopoverContent className="w-auto max-w-[calc(100vw-2rem)] p-0" data-testid="custom-range-popover">
          <Calendar
            mode="range"
            selected={draft}
            onSelect={setDraft}
            numberOfMonths={wide ? 2 : 1}
            defaultMonth={wide ? new Date(today.getFullYear(), today.getMonth() - 1) : today}
            startMonth={min}
            endMonth={today}
            disabled={[{ before: min }, { after: today }]}
          />
          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-border px-4 py-3">
            <p className="text-xs text-ink-muted">Data is available for the last 90 days.</p>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => setOpen(false)}>Cancel</Button>
              <Button
                size="sm"
                data-testid="custom-range-apply"
                disabled={!draft?.from}
                onClick={() => {
                  if (!draft?.from) return
                  onChange('custom', { from: toKey(draft.from), to: toKey(draft.to ?? draft.from) })
                  setOpen(false)
                }}
              >
                Apply
              </Button>
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  )
}
