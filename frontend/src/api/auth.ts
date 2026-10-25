import type { Invite, SessionUser } from '@/types'
import { isValidEmail } from '@/lib/format'
import { ApiError, request } from './client'
import { db } from './db'

// POST /api/auth/login
export function signIn(email: string, password: string): Promise<SessionUser> {
  return request(() => {
    if (!isValidEmail(email) || !password) throw new ApiError('Incorrect email or password.', 401)
    if (email.trim().toLowerCase() === 'error@goorin.com') throw new ApiError('Incorrect email or password.', 401)
    const ava = db.users.find((u) => u.id === 'u-ava')!
    return { id: ava.id, name: ava.name, email: ava.email, role: ava.role }
  })
}

// POST /api/auth/password-reset
export function requestPasswordReset(email: string): Promise<{ email: string }> {
  return request(() => ({ email: email.trim() }))
}

// GET /api/invites/:token
export function getInvite(token: string): Promise<Invite | null> {
  return request<Invite | null>(
    () => {
      const base = db.invites['demo-invite']
      return { token, ...base, expired: token === 'expired' }
    },
    { empty: () => null },
  )
}

// POST /api/invites/:token/accept
export function acceptInvite(token: string, name: string, password: string): Promise<SessionUser> {
  return request(() => {
    if (token === 'expired') throw new ApiError('This invite has expired', 410)
    if (password.length < 8) throw new ApiError('Use at least 8 characters.', 422)
    const invitee = db.users.find((u) => u.email === db.invites['demo-invite'].email)!
    invitee.status = 'active'
    invitee.name = name.trim()
    return { id: invitee.id, name: invitee.name, email: invitee.email, role: invitee.role }
  })
}
