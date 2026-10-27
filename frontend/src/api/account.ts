import type { ChangePasswordInput, NotificationPrefs } from '@/types'
import { ApiError, request } from './client'
import { db } from './db'
import { DEFAULT_NOTIFICATION_PREFS } from '@/mocks'

// GET /api/account/notifications
export function getNotificationPrefs(userId: string): Promise<NotificationPrefs> {
  return request(() => db.notificationPrefs[userId] ?? DEFAULT_NOTIFICATION_PREFS)
}

// PUT /api/account/notifications
export function saveNotificationPrefs(userId: string, prefs: NotificationPrefs): Promise<NotificationPrefs> {
  return request(() => (db.notificationPrefs[userId] = { ...prefs }))
}

// POST /api/account/password  { current, next, confirm }. Mock: the current password is "goorin123".
export function changePassword(input: ChangePasswordInput): Promise<{ ok: true }> {
  return request(() => {
    if (input.current !== 'goorin123') throw new ApiError('Your current password is incorrect.', 403)
    if (input.next.length < 8) throw new ApiError('Use at least 8 characters.', 422)
    if (input.next !== input.confirm) throw new ApiError("Passwords don't match.", 422)
    return { ok: true as const }
  })
}

// POST /api/account/sign-out-all
export function signOutAllDevices(): Promise<{ sessions: number }> {
  return request(() => ({ sessions: 3 }))
}
