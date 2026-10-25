import { formatDistanceToNowStrict } from 'date-fns'
import type { KpiFormat } from '@/types'

export function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime()
  if (diff < 60_000) return 'just now'
  return `${formatDistanceToNowStrict(new Date(iso))} ago`
}

export function formatDuration(minutes: number) {
  if (minutes < 60) return `${minutes.toFixed(1)} min`
  const h = Math.floor(minutes / 60)
  const m = Math.round(minutes % 60)
  return m ? `${h}h ${m}m` : `${h}h`
}

export function formatKpiValue(value: number | null, format: KpiFormat) {
  if (value === null) return '—'
  if (format === 'percent') return `${value.toFixed(1)}%`
  if (format === 'duration') return formatDuration(value)
  if (format === 'score') return value.toFixed(2)
  return value.toLocaleString('en-US')
}

export const isValidEmail = (value: string) => /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(value.trim())

export const formatMoney = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })

export const initials = (name: string) =>
  name
    .split(' ')
    .map((p) => p[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()
