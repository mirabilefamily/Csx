import { useEffect, useState, type FormEvent } from 'react'
import { LogOut } from 'lucide-react'
import { toast } from 'sonner'
import type { NotificationPrefs } from '@/types'
import { accountApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/components/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { FieldError, Input, Label } from '@/components/ui/input'
import { Switch } from '@/components/ui/overlay'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/States'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { FormSection } from './SaveBar'

function Password() {
  const [f, setF] = useState({ current: '', next: '', confirm: '' })
  const [errors, setErrors] = useState<{ current?: string; next?: string; confirm?: string }>({})
  const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const next = {
      current: f.current ? undefined : 'Enter your current password.',
      next: f.next.length >= 8 ? undefined : 'Use at least 8 characters.',
      confirm: f.confirm === f.next ? undefined : "Passwords don't match.",
    }
    setErrors(next)
    if (next.current || next.next || next.confirm) return
    setBusy(true)
    try { await accountApi.changePassword(f); toast.success('Password changed'); setF({ current: '', next: '', confirm: '' }) } catch (err) { setErrors({ current: (err as Error).message }) }
    setBusy(false)
  }
  const field = (k: keyof typeof f, label: string, auto: string) => (
    <div>
      <Label htmlFor={`acct-${k}`}>{label}</Label>
      <Input id={`acct-${k}`} type="password" autoComplete={auto} className="mt-1.5" value={f[k]} onChange={(e) => setF({ ...f, [k]: e.target.value })} aria-invalid={!!errors[k]} aria-describedby={errors[k] ? `acct-${k}-error` : undefined} data-testid={`account-password-${k}`} />
      <FieldError id={`acct-${k}-error`}>{errors[k]}</FieldError>
    </div>
  )
  return (
    <form onSubmit={submit} noValidate className="space-y-4" data-testid="account-password-form">
      {field('current', 'Current password', 'current-password')}
      {field('next', 'New password', 'new-password')}
      {field('confirm', 'Confirm new password', 'new-password')}
      <Button type="submit" loading={busy} data-testid="account-password-submit">Change password</Button>
    </form>
  )
}

const NOTIFS: [keyof NotificationPrefs, string][] = [['needsHuman', 'A ticket needs a human'], ['lowCsat', 'A customer leaves a low CSAT score'], ['fraudAlerts', 'A new fraud alert is raised']]

function Notifications({ userId }: { userId: string }) {
  const { data, loading, error, reload } = useApi(() => accountApi.getNotificationPrefs(userId), [userId])
  const [p, setP] = useState<NotificationPrefs | null>(null)
  useEffect(() => setP(data ?? null), [data])
  if (loading) return <Skeleton className="h-28 w-full max-w-[480px]" />
  if (error || !p) return <ErrorState compact title="Notification settings didn't load" onRetry={reload} testId="account-notifs-error" />
  const toggle = async (k: keyof NotificationPrefs, v: boolean) => {
    const next = { ...p, [k]: v }
    setP(next)
    try { await accountApi.saveNotificationPrefs(userId, next); toast.success('Notification settings saved') } catch { setP(p); toast.error("Couldn't save. Try again.") }
  }
  return (
    <ul className="max-w-[480px] divide-y divide-border rounded-xl border border-border" data-testid="account-notifs">
      {NOTIFS.map(([k, l]) => (
        <li key={k} className="flex min-h-12 items-center justify-between gap-3 px-4">
          <span className="text-sm text-ink" id={`notif-${k}`}>Email me when {l.charAt(0).toLowerCase() + l.slice(1)}</span>
          <Switch checked={p[k]} onCheckedChange={(v) => toggle(k, v)} aria-labelledby={`notif-${k}`} data-testid={`account-notif-${k}`} />
        </li>
      ))}
    </ul>
  )
}

export function AccountTab() {
  const { user } = useAuth()
  const [confirm, setConfirm] = useState(false)
  if (!user) return null
  const initials = user.name.split(' ').map((w) => w[0]).join('').slice(0, 2)
  const signOutAll = async () => {
    try { const r = await accountApi.signOutAllDevices(); toast.success(`Signed out of ${r.sessions} other sessions`) } catch { toast.error("Couldn't sign out other devices. Try again.") }
  }
  return (
    <div className="divide-y divide-border/70 rounded-2xl bg-surface px-6 py-6 shadow-card ring-1 ring-black/[0.04] max-sm:px-4" data-testid="account-tab">
      <FormSection title="Profile" description="How you appear to the team and in internal notes." testId="account-section-profile">
        <div className="flex items-center gap-4" data-testid="account-profile">
          <span className="flex h-14 w-14 items-center justify-center rounded-full bg-tobacco-100 text-lg font-semibold text-tobacco-800" aria-hidden>{initials}</span>
          <div>
            <p className="text-[15px] font-semibold text-ink" data-testid="account-name">{user.name}</p>
            <p className="text-sm text-ink-muted" data-testid="account-email">{user.email} · {user.role === 'admin' ? 'Admin' : 'Agent'}</p>
          </div>
        </div>
      </FormSection>
      <FormSection title="Change password" description="At least 8 characters. Mock: the current password is goorin123." testId="account-section-password"><Password /></FormSection>
      <FormSection title="Notifications" description="Email alerts for things that need you." testId="account-section-notifications"><Notifications userId={user.id} /></FormSection>
      <FormSection title="Sessions" description="Sign out everywhere except this browser." testId="account-section-sessions">
        <Button variant="outline" onClick={() => setConfirm(true)} data-testid="account-sign-out-all"><LogOut aria-hidden /> Sign out of all devices</Button>
      </FormSection>
      <AlertDialog open={confirm} onOpenChange={setConfirm}>
        <AlertDialogContent data-testid="account-sign-out-dialog">
          <AlertDialogTitle>Sign out of all other devices?</AlertDialogTitle>
          <AlertDialogDescription>You'll stay signed in here. Other browsers and phones will need to sign in again.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="account-sign-out-cancel">Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={signOutAll} data-testid="account-sign-out-confirm">Sign out everywhere</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
