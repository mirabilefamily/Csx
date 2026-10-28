import type { InboxViewId, Ticket } from '@/types'

interface ViewDef {
  id: InboxViewId
  label: string
  empty: string
  group: 'views' | 'more' | 'set_aside'
  match: (t: Ticket, userId: string | undefined) => boolean
}

const kept = (fn: ViewDef['match']): ViewDef['match'] => (t, u) => !t.setAside && fn(t, u)
const isToday = (iso: string) => new Date(iso).toDateString() === new Date().toDateString()

export type AiState = 'replying' | 'waiting' | 'resolved_today'
export const AI_STATE_LABEL: Record<AiState, string> = { replying: 'Replying', waiting: 'Waiting on customer', resolved_today: 'Resolved by AI today' }
export function aiState(t: Ticket): AiState | null {
  if (t.status === 'ai_handling') return 'replying'
  if (t.status === 'grok_handling') return 'waiting'
  if (t.status === 'resolved' && t.resolvedBy && t.resolvedBy !== 'human' && isToday(t.updatedAt)) return 'resolved_today'
  return null
}

export const INBOX_VIEWS: ViewDef[] = [
  { id: 'needs_you', group: 'views', label: 'Needs you', empty: "You're all caught up. The AI is handling everything else.", match: kept((t) => t.status === 'needs_human') },
  { id: 'mine', group: 'views', label: 'Assigned to me', empty: 'Nothing assigned to you', match: kept((t, uid) => !!uid && t.assignee === uid && t.status !== 'closed' && t.status !== 'resolved') },
  { id: 'ai_handling', group: 'views', label: 'AI handling', empty: 'AI and Grokbot are idle', match: kept((t) => aiState(t) !== null) },
  { id: 'resolved', group: 'views', label: 'Resolved', empty: 'No resolved tickets yet', match: kept((t) => t.status === 'resolved') },
  { id: 'all', group: 'views', label: 'All', empty: 'No tickets yet', match: kept(() => true) },
  { id: 'closed', group: 'more', label: 'Closed', empty: 'No closed tickets yet', match: kept((t) => t.status === 'closed') },
  { id: 'spam', group: 'set_aside', label: 'Spam', empty: 'No spam. Nice.', match: (t) => t.setAside === 'spam' },
  { id: 'trash', group: 'set_aside', label: 'Trash', empty: 'Trash is empty', match: (t) => t.setAside === 'trash' },
]

const ALIAS: Record<string, InboxViewId> = { needs_human: 'needs_you', all_open: 'all', unassigned: 'all' }
export const viewById = (id: string | null) => INBOX_VIEWS.find((v) => v.id === (id && (ALIAS[id] ?? id))) ?? INBOX_VIEWS[0]

export function viewCounts(tickets: Ticket[], userId: string | undefined) {
  return Object.fromEntries(INBOX_VIEWS.map((v) => [v.id, tickets.filter((t) => v.match(t, userId)).length])) as Record<InboxViewId, number>
}

// Minutes since the customer last wrote (updatedAt) and the SLA tone (24h SLA, amber from 18h).
export const SLA_MIN = 1440
export function waiting(t: Ticket) {
  const min = Math.max(0, Math.round((Date.now() - new Date(t.updatedAt).getTime()) / 60000))
  const label = min < 60 ? `${min}m` : min < 1440 ? `${Math.floor(min / 60)}h` : `${Math.floor(min / 1440)}d`
  return { min, label: `Waiting ${label}`, tone: min >= SLA_MIN ? 'breached' : min >= SLA_MIN * 0.75 ? 'close' : 'ok' } as const
}

export type NeedsSort = 'urgency' | 'longest' | 'newest'
export function sortNeeds(list: Ticket[], sort: NeedsSort) {
  const w = (t: Ticket) => waiting(t).min
  const copy = [...list]
  if (sort === 'newest') return copy.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  if (sort === 'longest') return copy.sort((a, b) => w(b) - w(a))
  return copy.sort((a, b) => Number(w(b) >= SLA_MIN) - Number(w(a) >= SLA_MIN) || w(b) - w(a))
}

// Short display id like #317FED, stable per ticket id.
export function shortId(id: string) {
  let h = 2166136261
  for (const c of id) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return `#${(h >>> 0).toString(16).toUpperCase().padStart(8, '0').slice(-6)}`
}
