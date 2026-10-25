import type { AIAttempt, AIDraft, Customer, Message, Ticket, TicketStatus } from '@/types'
import { request } from './client'
import { db } from './db'

const byNewest = (a: { updatedAt: string }, b: { updatedAt: string }) => b.updatedAt.localeCompare(a.updatedAt)

// GET /api/tickets?status=
export function listTickets(filter: { status?: TicketStatus } = {}): Promise<Ticket[]> {
  return request(() => db.tickets.filter((t) => !filter.status || t.status === filter.status).sort(byNewest), { empty: () => [] })
}

// GET /api/tickets?status=needs_human  (bell + Inbox badge)
export const listNeedsHuman = () => listTickets({ status: 'needs_human' })

// GET /api/tickets/:id
export function getTicket(id: string): Promise<Ticket | null> {
  return request(() => db.tickets.find((t) => t.id === id) ?? null, { empty: () => null })
}

// GET /api/tickets/:id/messages
export function listMessages(ticketId: string): Promise<Message[]> {
  return request(() => db.messages.filter((m) => m.ticketId === ticketId), { empty: () => [] })
}

// GET /api/tickets/:id/ai-attempts
export function listAiAttempts(ticketId: string): Promise<AIAttempt[]> {
  return request(() => db.aiAttempts.filter((a) => a.ticketId === ticketId), { empty: () => [] })
}

// GET /api/tickets/:id/ai-draft
export function getAiDraft(ticketId: string): Promise<AIDraft | null> {
  return request(() => db.aiDrafts.find((d) => d.ticketId === ticketId) ?? null, { empty: () => null })
}

// GET /api/customers/:id
export function getCustomer(id: string): Promise<Customer | null> {
  return request(() => db.customers.find((c) => c.id === id) ?? null, { empty: () => null })
}
