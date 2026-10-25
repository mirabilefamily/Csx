import type { AiSettings, IntegrationId, IntegrationStatus, Role, TestResult, User } from '@/types'
import { isValidEmail } from '@/lib/format'
import { ApiError, request } from './client'
import { db } from './db'

const ms = () => Math.round(120 + Math.random() * 380)

// GET /api/integrations
export function listIntegrations(): Promise<IntegrationStatus[]> {
  return request(() => db.integrations, { empty: () => [] })
}

// POST /api/integrations/:id/test
export function testIntegration(id: IntegrationId): Promise<TestResult> {
  return request(() => {
    const i = db.integrations.find((x) => x.id === id)!
    if (i.status !== 'connected') return { ok: false, ms: ms(), message: `Connection failed: ${i.error}` }
    i.lastSyncAt = new Date().toISOString()
    const t = ms()
    return { ok: true, ms: t, message: `Connection OK · ${t}ms` }
  })
}

// POST /api/integrations/:id/prompt  { model, prompt }
export function testPrompt(id: 'claude' | 'grokbot', model: string, prompt: string): Promise<TestResult> {
  return request(() => {
    const i = db.integrations.find((x) => x.id === id)!
    if (i.status !== 'connected') return { ok: false, ms: ms(), message: `Request failed: ${i.error}` }
    i.model = model
    const t = 600 + Math.round(Math.random() * 900)
    return { ok: true, ms: t, message: `(${model}) Thanks for asking! Based on our guidance: ${prompt.trim().slice(0, 80) || 'your question'} — happy to help with that. Our fedoras run true to size, and exchanges are always free.` }
  })
}

// POST /api/integrations/resend/test-email  { to }
export function sendTestEmail(to: string): Promise<TestResult> {
  return request(() => {
    if (!isValidEmail(to)) throw new ApiError('Enter a valid email address.', 422)
    const r = db.integrations.find((x) => x.id === 'resend')!
    if (r.status !== 'connected') return { ok: false, ms: ms(), message: `Couldn't send: ${r.error}` }
    return { ok: true, ms: ms(), message: `Test email sent to ${to}` }
  })
}

// GET /api/settings/ai
export function getAiSettings(): Promise<AiSettings> {
  return request(() => db.aiSettings)
}

// PUT /api/settings/ai
export function saveAiSettings(s: AiSettings): Promise<AiSettings> {
  return request(() => {
    if (s.hours.some((h) => h.open && h.to <= h.from)) throw new ApiError('Closing time must be after opening time.', 422)
    db.aiSettings = structuredClone(s)
    return db.aiSettings
  })
}

// POST /api/users/invite  { email, role }
export function inviteUser(email: string, role: Role): Promise<User> {
  return request(() => {
    const e = email.trim().toLowerCase()
    if (!isValidEmail(e)) throw new ApiError('Enter a valid email address.', 422)
    if (db.users.some((u) => u.email === e)) throw new ApiError('A user with this email already exists.', 409)
    const user: User = { id: `u-${Date.now()}`, name: e.split('@')[0].replace(/^\w/, (c) => c.toUpperCase()), email: e, role, status: 'invited', lastLoginAt: null }
    db.users.push(user)
    return user
  })
}

// PATCH /api/users/:id  { role?, status? }
export function updateUser(id: string, patch: Partial<Pick<User, 'role' | 'status'>>, actorId: string): Promise<User> {
  return request(() => {
    if (id === actorId) throw new ApiError("You can't change your own account", 403)
    const u = db.users.find((x) => x.id === id)!
    Object.assign(u, patch)
    return u
  })
}

// POST /api/users/:id/reset-password
export function resetPassword(id: string): Promise<{ email: string }> {
  return request(() => ({ email: db.users.find((x) => x.id === id)!.email }))
}
