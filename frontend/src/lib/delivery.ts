import type { Message } from '@/types'

export type DeliveryStatus = 'queued' | 'sent' | 'delivered' | 'bounced'
export interface DeliveryEvent { label: string; at: string; detail?: string }

export const DELIVERY_LABEL: Record<DeliveryStatus, string> = { queued: 'Queued', sent: 'Sent', delivered: 'Delivered', bounced: 'Bounced' }

const plus = (iso: string, sec: number) => new Date(new Date(iso).getTime() + sec * 1000).toISOString()

// Mock delivery state for outbound replies, derived from the message so it's stable across reloads.
export function deliveryFor(m: Message, channel: 'email' | 'chat'): { status: DeliveryStatus; events: DeliveryEvent[] } | null {
  if (m.authorType === 'customer' || m.authorType === 'system' || m.isInternal) return null
  const age = (Date.now() - new Date(m.createdAt).getTime()) / 1000
  const via = channel === 'email' ? 'Office 365 (Microsoft Graph)' : 'Chat widget'
  const events: DeliveryEvent[] = [{ label: 'Queued', at: m.createdAt, detail: `Reply by ${m.authorName}` }]
  if (age < 5) return { status: 'queued', events }
  events.push({ label: 'Sent', at: plus(m.createdAt, 2), detail: via })
  if (age < 30) return { status: 'sent', events }
  if (m.body.includes('@bounce')) {
    events.push({ label: 'Bounced', at: plus(m.createdAt, 9), detail: '550 Mailbox unavailable' })
    return { status: 'bounced', events }
  }
  events.push({ label: channel === 'email' ? 'Delivered to inbox' : 'Seen in chat', at: plus(m.createdAt, channel === 'email' ? 6 : 14) })
  return { status: 'delivered', events }
}
