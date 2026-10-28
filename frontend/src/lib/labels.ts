import type { AuthorType, Channel, EscalationReason, Resolver, TicketStatus } from '@/types'

export const STATUS_LABELS: Record<TicketStatus, string> = {
  open: 'Open',
  ai_handling: 'AI handling',
  grok_handling: 'Grokbot handling',
  needs_human: 'Needs human',
  resolved: 'Resolved',
  closed: 'Closed',
}

export const AUTHOR_LABELS: Record<AuthorType, string> = {
  customer: 'Customer',
  claude: 'AI',
  grokbot: 'Grokbot',
  agent: 'Agent',
  system: 'System',
}

export const RESOLVER_LABELS: Record<Resolver, string> = { claude: 'AI', grokbot: 'Grokbot', human: 'Human' }

export const CHANNEL_LABELS: Record<Channel, string> = { email: 'Email', chat: 'Chat' }

export const ESCALATION_LABELS: Record<EscalationReason, string> = {
  low_confidence: 'Low AI confidence',
  asked_for_human: 'Asked for a human',
  refund_over_limit: 'Refund over limit',
  damaged_item: 'Damaged item',
  custom_order: 'Custom order',
  wholesale: 'Wholesale inquiry',
  negative_sentiment: 'Negative sentiment',
}
