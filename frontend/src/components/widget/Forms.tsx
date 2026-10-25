import { useState } from 'react'
import { Check, Moon } from 'lucide-react'
import { widgetApi } from '@/api'
import type { FieldMode, WidgetSettings } from '@/types'
import { isValidEmail } from '@/lib/format'

export interface Identity { email: string | null; name: string | null; orderNumber: string | null }

function Field({ id, label, mode, error, children }: { id: string; label: string; mode?: FieldMode; error?: string; children: React.ReactNode }) {
  return (
    <div className="gw-field">
      <label className="gw-label" htmlFor={id}>
        {label} {mode === 'optional' && <span>(optional)</span>}
      </label>
      {children}
      {error && <p className="gw-error" id={`${id}-error`} role="alert" data-testid={`${id}-error`}>{error}</p>}
    </div>
  )
}

export function PreChatForm({ preChat, onSubmit }: { preChat: WidgetSettings['messaging']['preChat']; onSubmit: (id: Identity) => void }) {
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [order, setOrder] = useState('')
  const [error, setError] = useState<string>()
  const submit = (e: React.FormEvent) => {
    e.preventDefault()
    const needsCheck = preChat.email === 'required' || (preChat.email === 'optional' && email.trim())
    if (needsCheck && !isValidEmail(email)) return setError('Enter a valid email address.')
    onSubmit({ email: email.trim() || null, name: name.trim() || null, orderNumber: order.trim() || null })
  }
  return (
    <form className="gw-form" onSubmit={submit} noValidate data-testid="widget-prechat">
      <p className="gw-intro">Before we begin, leave your details so we can follow up by email if we get disconnected.</p>
      {preChat.email !== 'off' && (
        <Field id="gw-prechat-email" label="Email" mode={preChat.email} error={error}>
          <input id="gw-prechat-email" className="gw-input" type="email" autoComplete="email" value={email} aria-required={preChat.email === 'required'} aria-invalid={!!error} aria-describedby={error ? 'gw-prechat-email-error' : undefined} onChange={(e) => { setEmail(e.target.value); setError(undefined) }} data-autofocus="" data-testid="widget-prechat-email" />
        </Field>
      )}
      {preChat.name !== 'off' && (
        <Field id="gw-prechat-name" label="Name" mode={preChat.name}>
          <input id="gw-prechat-name" className="gw-input" autoComplete="name" value={name} onChange={(e) => setName(e.target.value)} data-testid="widget-prechat-name" />
        </Field>
      )}
      {preChat.orderNumber !== 'off' && (
        <Field id="gw-prechat-order" label="Order number" mode={preChat.orderNumber}>
          <input id="gw-prechat-order" className="gw-input" placeholder="#GB20411" value={order} onChange={(e) => setOrder(e.target.value)} data-testid="widget-prechat-order" />
        </Field>
      )}
      <button type="submit" className="gw-primary" data-testid="widget-prechat-submit">Start chat</button>
    </form>
  )
}

export function OfflineView({ settings, defaults }: { settings: WidgetSettings; defaults: Identity }) {
  const [form, setForm] = useState({ name: defaults.name ?? '', email: defaults.email ?? '', message: '' })
  const [errors, setErrors] = useState<{ email?: string; message?: string; form?: string }>({})
  const [busy, setBusy] = useState(false)
  const [sent, setSent] = useState(false)
  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setForm((f) => ({ ...f, [k]: e.target.value }))
    setErrors((x) => ({ ...x, [k]: undefined, form: undefined }))
  }
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const next = { email: isValidEmail(form.email) ? undefined : 'Enter a valid email address.', message: form.message.trim() ? undefined : 'Please add a message.' }
    setErrors(next)
    if (next.email || next.message) return
    setBusy(true)
    try {
      await widgetApi.submitOfflineMessage(form)
      setSent(true)
    } catch {
      setErrors({ form: "Couldn't send your message. Try again." })
    }
    setBusy(false)
  }
  return (
    <div className="gw-form" data-testid="widget-offline">
      <div className="gw-system" style={{ alignSelf: 'flex-start', display: 'inline-flex', gap: 6, alignItems: 'center' }}>
        <Moon size={12} aria-hidden /> We're away right now
      </div>
      <p className="gw-intro" data-testid="widget-offline-message">{settings.messaging.offlineMessage}</p>
      {settings.messaging.offlineEmailFallback &&
        (sent ? (
          <div className="gw-card gw-success" data-testid="widget-offline-sent">
            <span className="gw-success-icon"><Check size={22} aria-hidden /></span>
            <p>Thanks, we'll reply by email within 1 business day</p>
          </div>
        ) : (
          <form className="gw-card" onSubmit={submit} noValidate>
            <h3 className="gw-card-title">Email us instead</h3>
            <Field id="gw-off-name" label="Name" mode="optional">
              <input id="gw-off-name" className="gw-input" value={form.name} onChange={set('name')} data-autofocus="" data-testid="widget-offline-name" />
            </Field>
            <Field id="gw-off-email" label="Email" error={errors.email}>
              <input id="gw-off-email" className="gw-input" type="email" value={form.email} aria-invalid={!!errors.email} onChange={set('email')} data-testid="widget-offline-email" />
            </Field>
            <Field id="gw-off-message" label="Message" error={errors.message}>
              <textarea id="gw-off-message" className="gw-input" value={form.message} aria-invalid={!!errors.message} onChange={set('message')} data-testid="widget-offline-text" />
            </Field>
            {errors.form && <p className="gw-error" role="alert">{errors.form}</p>}
            <button type="submit" className="gw-primary" disabled={busy} data-testid="widget-offline-submit">{busy ? 'Sending…' : 'Send message'}</button>
          </form>
        ))}
    </div>
  )
}
