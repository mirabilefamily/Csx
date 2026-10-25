import type { InboxViewId, Ticket } from '@/types'

interface ViewDef {
  id: InboxViewId
  label: string
  empty: string
  match: (t: Ticket, userId: string | undefined) => boolean
}

const active = (t: Ticket) => ['open', 'ai_handling', 'grok_handling', 'needs_human'].includes(t.status)

export const INBOX_VIEWS: ViewDef[] = [
  { id: 'all_open', label: 'All open', empty: 'No open tickets. The shop is quiet.', match: active },
  { id: 'needs_human', label: 'Needs human', empty: 'Nothing needs a human right now', match: (t) => t.status === 'needs_human' },
  { id: 'ai_handling', label: 'AI handling', empty: 'Claude and Grokbot are idle', match: (t) => t.status === 'ai_handling' || t.status === 'grok_handling' },
  { id: 'mine', label: 'Mine', empty: 'Nothing assigned to you', match: (t, uid) => !!uid && t.assignee === uid && t.status !== 'closed' },
  { id: 'unassigned', label: 'Unassigned', empty: 'Every ticket has an owner', match: (t) => !t.assignee && t.status !== 'resolved' && t.status !== 'closed' },
  { id: 'resolved', label: 'Resolved', empty: 'No resolved tickets yet', match: (t) => t.status === 'resolved' },
  { id: 'closed', label: 'Closed', empty: 'No closed tickets yet', match: (t) => t.status === 'closed' },
]

export const viewById = (id: string | null) => INBOX_VIEWS.find((v) => v.id === id) ?? INBOX_VIEWS[0]

export function viewCounts(tickets: Ticket[], userId: string | undefined) {
  return Object.fromEntries(INBOX_VIEWS.map((v) => [v.id, tickets.filter((t) => v.match(t, userId)).length])) as Record<InboxViewId, number>
}
