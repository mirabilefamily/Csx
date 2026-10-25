import { differenceInCalendarDays, format, parseISO, subDays } from 'date-fns'
import type { DateRange, RangePreset } from '@/types'

export const AVAILABLE_DAYS = 90
export const toKey = (d: Date) => format(d, 'yyyy-MM-dd')

export function earliestAvailableDate() {
  return subDays(new Date(new Date().setHours(0, 0, 0, 0)), AVAILABLE_DAYS - 1)
}

export function rangeForPreset(preset: Exclude<RangePreset, 'custom'>): DateRange {
  const today = new Date()
  const days = { today: 1, '7d': 7, '30d': 30, '90d': 90 }[preset]
  return { from: toKey(subDays(today, days - 1)), to: toKey(today) }
}

export const rangeLength = (r: DateRange) => differenceInCalendarDays(parseISO(r.to), parseISO(r.from)) + 1

export function priorRange(r: DateRange): DateRange {
  const len = rangeLength(r)
  const from = parseISO(r.from)
  return { from: toKey(subDays(from, len)), to: toKey(subDays(from, 1)) }
}

export function formatRangeLabel(r: DateRange) {
  const from = parseISO(r.from)
  const to = parseISO(r.to)
  return r.from === r.to ? format(from, 'MMM d, yyyy') : `${format(from, 'MMM d')} – ${format(to, 'MMM d, yyyy')}`
}
