import { useState, type FormEvent } from 'react'
import { Link, Navigate, useNavigate, useSearchParams } from 'react-router-dom'
import { ArrowLeft, Clock, Eye, EyeOff, Lock, Mail, MailCheck, User as UserIcon, type LucideIcon } from 'lucide-react'
import { authApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/components/auth/AuthContext'
import { Button, buttonVariants } from '@/components/ui/button'
import { FieldError, Input, Label } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState } from '@/components/States'
import { isValidEmail } from '@/lib/format'
import { GoorinCastle, GoorinWordmark } from '@/components/brand/GoorinBrand'
import { cn } from '@/lib/utils'

type FieldProps = { id: string; label: string; error?: string | null; Icon?: LucideIcon; testId?: string; trailing?: React.ReactNode } & React.InputHTMLAttributes<HTMLInputElement>

// Label above a 44px input with an optional leading icon and trailing control.
function Field({ id, label, error, Icon, testId, trailing, className, ...props }: FieldProps) {
  return (
    <div>
      <Label htmlFor={id}>{label}</Label>
      <div className="relative mt-1.5">
        {Icon && <Icon className="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-subtle" aria-hidden />}
        <Input id={id} className={cn('h-12 text-base sm:h-11 sm:text-sm', Icon && 'pl-10', trailing && 'pr-12', className)} aria-invalid={!!error} aria-describedby={error ? `${id}-error` : undefined} data-testid={testId ?? `${id}-input`} {...props} />
        {trailing}
      </div>
      <FieldError id={`${id}-error`}>{error}</FieldError>
    </div>
  )
}

// Password field with a show/hide eye toggle.
function PasswordField(props: Omit<FieldProps, 'type' | 'Icon' | 'trailing'>) {
  const [show, setShow] = useState(false)
  const toggle = (
    <button type="button" onClick={() => setShow((s) => !s)} aria-label={show ? 'Hide password' : 'Show password'} aria-pressed={show} className="absolute right-0.5 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-md text-ink-muted transition-colors hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid={`${props.id}-visibility-toggle`}>
      {show ? <EyeOff className="h-4 w-4" aria-hidden /> : <Eye className="h-4 w-4" aria-hidden />}
    </button>
  )
  return <Field {...props} type={show ? 'text' : 'password'} Icon={Lock} trailing={toggle} />
}

const SUBMIT = 'h-12 w-full bg-tobacco-600 text-base text-white hover:bg-tobacco-800 sm:text-sm'
const EMAIL = { type: 'email', inputMode: 'email', autoComplete: 'username', autoCapitalize: 'none', autoCorrect: 'off', spellCheck: false } as const
const TAP = 'inline-flex min-h-11 items-center rounded px-1 text-sm font-medium text-tobacco-600 underline-offset-4 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring'

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
      <Field id="email" label="Email" {...EMAIL} Icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} error={errors.email} placeholder="you@goorin.com" />
      <div className="space-y-1">
        <PasswordField id="password" label="Password" testId="password-input" autoComplete="current-password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} />
        <div className="-mr-1 flex justify-end">
          <button type="button" onClick={onForgot} className={TAP} data-testid="forgot-password-link">
            Forgot password?
          </button>
        </div>
      </div>
      <Button type="submit" className={SUBMIT} loading={busy} data-testid="login-submit">{busy ? 'Signing in…' : 'Sign in'}</Button>
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
    <button type="button" onClick={onBack} className={cn(TAP, 'gap-1')} data-testid="back-to-sign-in">
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
      <Field id="reset-email" label="Email" {...EMAIL} Icon={Mail} value={email} onChange={(e) => setEmail(e.target.value)} error={error} placeholder="you@goorin.com" />
      <Button type="submit" className={SUBMIT} loading={busy} data-testid="forgot-password-submit">Send reset link</Button>
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
        <Link to="/login" className={buttonVariants({ variant: 'outline', className: 'h-12 w-full' })} data-testid="invite-back-to-sign-in">Back to sign in</Link>
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
      <Field id="invite-name" label="Your name" Icon={UserIcon} value={name} onChange={(e) => setName(e.target.value)} error={errors.name} placeholder={invite.suggestedName} autoComplete="name" />
      <PasswordField id="invite-password" label="Password" value={password} onChange={(e) => setPassword(e.target.value)} error={errors.password} autoComplete="new-password" />
      <PasswordField id="invite-confirm" label="Confirm password" value={confirm} onChange={(e) => setConfirm(e.target.value)} error={errors.confirm} autoComplete="new-password" />
      <Button type="submit" className={SUBMIT} loading={busy} data-testid="invite-submit">Accept invite</Button>
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
  const subline = invite ? 'Set up your account to start helping customers.' : mode === 'signin' ? 'Use your Goorin work email.' : null
  return (
    <div
      className="flex min-h-[100dvh] flex-col items-center justify-center"
      style={{
        background: 'radial-gradient(ellipse 70% 55% at 50% 40%, #FFFFFF 0%, #FBF9F6 45%, #FAF8F5 70%, #F4EFE7 100%)',
        paddingTop: 'max(2.5rem, env(safe-area-inset-top))',
        paddingBottom: 'max(1.5rem, env(safe-area-inset-bottom))',
        paddingLeft: 'max(1rem, env(safe-area-inset-left))',
        paddingRight: 'max(1rem, env(safe-area-inset-right))',
      }}
      data-testid="login-page"
    >
      <main className="relative w-full max-w-[400px] overflow-hidden rounded-2xl bg-surface px-5 pb-8 pt-9 shadow-[0_1px_2px_rgba(31,29,26,0.05),0_6px_16px_-10px_rgba(31,29,26,0.12)] duration-200 animate-in fade-in slide-in-from-bottom-2 motion-reduce:animate-none sm:px-9 sm:pb-9 sm:pt-10 sm:shadow-[0_1px_2px_rgba(31,29,26,0.04),0_12px_32px_-12px_rgba(31,29,26,0.14)]" data-testid="login-card">
        <span className="absolute inset-x-0 top-0 h-0.5 bg-brass-500" aria-hidden />
        <GoorinWordmark width={168} className="mx-auto max-w-[140px] sm:max-w-none" alt="Goorin Bros." />
        <span className="sr-only" data-testid="login-logo">Goorin Bros.</span>
        <p className="mt-3 flex items-center justify-center gap-2.5 text-[10px] font-medium uppercase tracking-[0.2em] text-brass-700" data-testid="login-heritage">
          <span className="h-px w-8 bg-brass-400" aria-hidden />
          Est. 1895
          <span className="h-px w-8 bg-brass-400" aria-hidden />
        </p>
        <h1 className="mt-7 text-center font-display text-[26px] font-semibold leading-tight tracking-tight text-ink" data-testid="login-title">{title}</h1>
        {subline && <p className="mt-1.5 text-center text-sm text-ink-muted" data-testid="login-subline">{subline}</p>}
        <div className="mt-7">
          {invite ? <InviteForm token={invite} /> : mode === 'forgot' ? <ForgotForm onBack={() => setMode('signin')} /> : <SignInForm onForgot={() => setMode('forgot')} />}
        </div>
      </main>
      <footer className="mt-6 flex max-w-[400px] flex-wrap items-center justify-center gap-x-2 text-center text-xs text-ink-muted" data-testid="login-footer">
        <GoorinCastle width={14} className="text-brass-600" />
        <span>Goorin Bros. · Hat makers since 1895</span>
        <span aria-hidden>·</span>
        <Link to="/styleguide" className="inline-flex min-h-11 items-center rounded px-1 underline underline-offset-2 hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid="login-styleguide-link">Styleguide</Link>
      </footer>
    </div>
  )
}
