import type { InboxViewId, Ticket } from '@/types'

interface ViewDef {
  id: InboxViewId
  label: string
  empty: string
  group: 'views' | 'set_aside'
  match: (t: Ticket, userId: string | undefined) => boolean
}

const active = (t: Ticket) => ['open', 'ai_handling', 'grok_handling', 'needs_human'].includes(t.status)
const kept = (fn: ViewDef['match']): ViewDef['match'] => (t, u) => !t.setAside && fn(t, u)

export const INBOX_VIEWS: ViewDef[] = [
  { id: 'all_open', group: 'views', label: 'All open', empty: 'No open tickets. The shop is quiet.', match: kept(active) },
  { id: 'needs_human', group: 'views', label: 'Needs human', empty: 'Nothing needs a human right now', match: kept((t) => t.status === 'needs_human') },
  { id: 'ai_handling', group: 'views', label: 'AI handling', empty: 'Claude and Grokbot are idle', match: kept((t) => t.status === 'ai_handling' || t.status === 'grok_handling') },
  { id: 'mine', group: 'views', label: 'Mine', empty: 'Nothing assigned to you', match: kept((t, uid) => !!uid && t.assignee === uid && t.status !== 'closed') },
  { id: 'unassigned', group: 'views', label: 'Unassigned', empty: 'Every ticket has an owner', match: kept((t) => !t.assignee && t.status !== 'resolved' && t.status !== 'closed') },
  { id: 'resolved', group: 'views', label: 'Resolved', empty: 'No resolved tickets yet', match: kept((t) => t.status === 'resolved') },
  { id: 'closed', group: 'views', label: 'Closed', empty: 'No closed tickets yet', match: kept((t) => t.status === 'closed') },
  { id: 'all', group: 'views', label: 'All', empty: 'No tickets yet', match: kept(() => true) },
  { id: 'spam', group: 'set_aside', label: 'Spam', empty: 'No spam. Nice.', match: (t) => t.setAside === 'spam' },
  { id: 'trash', group: 'set_aside', label: 'Trash', empty: 'Trash is empty', match: (t) => t.setAside === 'trash' },
]

export const viewById = (id: string | null) => INBOX_VIEWS.find((v) => v.id === id) ?? INBOX_VIEWS[0]

export function viewCounts(tickets: Ticket[], userId: string | undefined) {
  return Object.fromEntries(INBOX_VIEWS.map((v) => [v.id, tickets.filter((t) => v.match(t, userId)).length])) as Record<InboxViewId, number>
}

// Short display id like #317FED, stable per ticket id.
export function shortId(id: string) {
  let h = 2166136261
  for (const c of id) h = Math.imul(h ^ c.charCodeAt(0), 16777619)
  return `#${(h >>> 0).toString(16).toUpperCase().padStart(8, '0').slice(-6)}`
}
