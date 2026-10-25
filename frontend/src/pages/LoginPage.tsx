import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Clock, MailCheck } from 'lucide-react'
import { authApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/components/auth/AuthContext'
import { Button, buttonVariants } from '@/components/ui/button'
import { FieldError, Input, Label } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState } from '@/components/States'
import { isValidEmail } from '@/lib/format'
import { GoorinWordmark } from '@/components/brand/GoorinBrand'

function Field({ id, label, error, ...props }: { id: string; label: string; error?: string | null } & React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <Input id={id} className="mt-1.5" aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} data-testid={`${id}-input`} {...props} />
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  )
}

function FormAlert({ children }: { children?: React.ReactNode }) {
  if (!children) return null
  return <p role="alert" className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-sm font-medium text-red-700" data-testid="login-form-error">{children}</p>
}

function SignInForm({ onForgot }: { onForgot: () => void }) {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState<{ email?: string; password?: string; form?: string }>({})
  const [busy, setBusy] = useState(false)

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const next = { email: isValidEmail(email) ? undefined : 'Enter a valid email address.', password: password ? undefined : 'Enter your password.' }
    setErrors(next)
    if (next.email || next.password) return
    setBusy(true)
    try {
      signIn(await authApi.signIn(email, password))
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setErrors({ form: (err as Error).message })
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5" data-testid="login-form">
      <FormAlert>{errors.form}</FormAlert>
      <Field id="email" label="Email" type="email" autoComplete="email" value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} placeholder="you@goorin.com" />
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="password">Password</Label>
          <button type="button" onClick={onForgot} className="rounded text-sm font-medium text-tobacco-600 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid="forgot-password-link">
            Forgot password?
          </button>
        </div>
        <Input id="password" type="password" autoComplete="current-password" className="mt-1.5" value={password} onChange={(e) => setPassword(e.target.value)} aria-invalid={!!errors.password} aria-describedby={errors.password ? 'password-error' : undefined} data-testid="password-input" />
        <FieldError id="password-error">{errors.password}</FieldError>
      </div>
      <Button type="submit" className="w-full" size="lg" loading={busy} data-testid="login-submit">Sign in</Button>
    </form>
  )
}

function ForgotForm({ onBack }: { onBack: () => void }) {
  const [email, setEmail] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [sent, setSent] = useState<string | null>(null)
  const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(email)) return setError('Enter a valid email address.')
    setError(null)
    setBusy(true)
    try {
      setSent((await authApi.requestPasswordReset(email)).email)
    } catch (err) {
      setError((err as Error).message)
    } finally {
      setBusy(false)
    }
  }
  const back = (
    <button type="button" onClick={onBack} className={buttonVariants({ variant: 'link', className: 'gap-1' })} data-testid="back-to-sign-in">
      <ArrowLeft aria-hidden /> Back to sign in
    </button>
  )
  if (sent)
    return (
      <div className="space-y-5" data-testid="forgot-password-sent">
        <div className="flex items-start gap-3 rounded-lg border border-green-100 bg-green-50 p-4" role="status">
          <MailCheck className="mt-0.5 h-5 w-5 shrink-0 text-green-700" aria-hidden />
          <p className="text-sm text-green-700">If an account exists for {sent}, we've sent a reset link.</p>
        </div>
        {back}
      </div>
    )
  return (
    <form onSubmit={submit} noValidate className="space-y-5" data-testid="forgot-password-form">
      <p className="text-sm text-ink-muted">Enter the email you sign in with and we'll send a link to set a new password.</p>
      <Field id="reset-email" label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} error={error} placeholder="you@goorin.com" />
      <Button type="submit" className="w-full" size="lg" loading={busy} data-testid="forgot-password-submit">Send reset link</Button>
      {back}
    </form>
  )
}

function InviteForm({ token }: { token: string }) {
  const { signIn } = useAuth()
  const navigate = useNavigate()
  const { data: invite, loading, error, reload } = useApi(() => authApi.getInvite(token), [token])
  const [name, setName] = useState('')
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [errors, setErrors] = useState<{ name?: string; password?: string; confirm?: string; form?: string }>({})
  const [busy, setBusy] = useState(false)

  if (loading) return <div className="space-y-4" data-testid="invite-loading">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-16 w-full" />)}</div>
  if (error) return <ErrorState compact title="We couldn't load this invite" onRetry={reload} testId="invite-error" />
  if (!invite) return <EmptyState compact title="We couldn't find this invite" description="Check the link in your email." action={<Link to="/login" className={buttonVariants({ variant: 'outline' })}>Back to sign in</Link>} testId="invite-not-found" />
  if (invite.expired)
    return (
      <div className="space-y-5" data-testid="invite-expired">
        <div className="flex items-start gap-3 rounded-lg border border-amber-300 bg-amber-50 p-4">
          <Clock className="mt-0.5 h-5 w-5 shrink-0 text-amber-700" aria-hidden />
          <div>
            <p className="text-sm font-semibold text-ink">This invite has expired</p>
            <p className="mt-1 text-sm text-ink-muted">Invites last 7 days. Ask your admin to send a fresh one.</p>
          </div>
        </div>
        <Link to="/login" className={buttonVariants({ variant: 'outline', className: 'w-full' })} data-testid="invite-back-to-sign-in">Back to sign in</Link>
      </div>
    )

  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const next = {
      name: name.trim() ? undefined : 'Enter your name.',
      password: password.length >= 8 ? undefined : 'Use at least 8 characters.',
      confirm: confirm === password ? undefined : "Passwords don't match.",
    }
    setErrors(next)
    if (next.name || next.password || next.confirm) return
    setBusy(true)
    try {
      signIn(await authApi.acceptInvite(token, name, password))
      navigate('/dashboard', { replace: true })
    } catch (err) {
      setErrors({ form: (err as Error).message })
      setBusy(false)
    }
  }

  return (
    <form onSubmit={submit} noValidate className="space-y-5" data-testid="invite-form">
      <p className="text-sm text-ink-muted">
        {invite.invitedBy} invited <span className="font-medium text-ink">{invite.email}</span> to join as {invite.role === 'admin' ? 'an Admin' : 'an Agent'}.
      </p>
      <FormAlert>{errors.form}</FormAlert>
      <Field id="invite-name" label="Your name" value={name} onChange={(e) => setName(e.target.value)} error={errors.name} placeholder={invite.suggestedName} autoComplete="name" />
      <Field id="invite-password" label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} autoComplete="new-password" />
      <Field id="invite-confirm" label="Confirm password" type="password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} autoComplete="new-password" />
      <Button type="submit" className="w-full" size="lg" loading={busy} data-testid="invite-submit">Accept invite</Button>
    </form>
  )
}

export default function LoginPage() {
  const { user } = useAuth()
  const [params] = useSearchParams()
  const invite = params.get('invite')
  const [mode, setMode] = useState<'signin' | 'forgot'>('signin')
  if (user && !invite) return <Navigate to="/dashboard" replace />

  const title = invite ? 'Join the desk' : mode === 'forgot' ? 'Reset your password' : 'Sign in to Support Desk'
  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center bg-background px-4 py-10" data-testid="login-page">
      <main className="w-full max-w-[400px] rounded-2xl bg-surface px-6 py-9 shadow-[0_1px_2px_rgba(31,29,26,0.04),0_12px_32px_-12px_rgba(31,29,26,0.14)] sm:px-9" data-testid="login-card">
        <GoorinWordmark width={168} className="mx-auto" alt="Goorin Bros." />
        <span className="sr-only" data-testid="login-logo">Goorin Bros.</span>
        <h1 className="mt-7 text-center text-xl font-semibold tracking-tight text-ink" data-testid="login-title">{title}</h1>
        {invite && <p className="mt-1.5 text-center text-sm text-ink-muted">Set up your account to start helping customers.</p>}
        <div className="mt-7">
          {invite ? <InviteForm token={invite} /> : mode === 'forgot' ? <ForgotForm onBack={() => setMode('signin')} /> : <SignInForm onForgot={() => setMode('forgot')} />}
        </div>
      </main>
      <p className="mt-6 text-xs text-ink-subtle">Hat makers since 1895 · <Link to="/styleguide" className="underline underline-offset-2 hover:text-ink">Styleguide</Link></p>
    </div>
  )
}
