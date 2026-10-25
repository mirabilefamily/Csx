import type { User } from '@/types'
import { daysAgo, hoursAgo } from './time'

export const users: User[] = [
  { id: 'u-ava', name: 'Ava Martinez', email: 'ava@goorin.com', role: 'admin', status: 'active', lastLoginAt: hoursAgo(1) },
  { id: 'u-sam', name: 'Sam Okafor', email: 'sam@goorin.com', role: 'agent', status: 'active', lastLoginAt: hoursAgo(5) },
  { id: 'u-priya', name: 'Priya Shah', email: 'priya@goorin.com', role: 'agent', status: 'invited', lastLoginAt: null },
]

export const invites = {
  'demo-invite': { email: 'priya@goorin.com', suggestedName: 'Priya Shah', role: 'agent' as const, invitedBy: 'Ava Martinez', sentAt: daysAgo(1) },
}
