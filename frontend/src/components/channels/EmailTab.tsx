import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Send } from 'lucide-react'
import { toast } from 'sonner'
import type { EmailChannelSettings, TestResult } from '@/types'
import { channelsApi, settingsApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/components/auth/AuthContext'
import { useUnsavedGuard } from '@/components/UnsavedGuard'
import { Button } from '@/components/ui/button'
import { Input, Label, Textarea } from '@/components/ui/input'
import { Switch } from '@/components/ui/overlay'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/States'
import { SaveState } from '@/components/PageTabs'
import { FormSection, SaveBar } from '@/components/settings/SaveBar'
import { LogoTile, Result } from '@/components/settings/IntegrationsTab'
import { isValidEmail } from '@/lib/format'

function Loaded({ initial }: { initial: EmailChannelSettings }) {
  const { user } = useAuth()
  const office = useApi(() => settingsApi.getIntegration('outlook'), [])
  const resend = useApi(() => settingsApi.getIntegration('resend'), [])
  const [saved, setSaved] = useState(initial)
  const [d, setD] = useState(initial)
  const [saving, setSaving] = useState(false)
  const [to, setTo] = useState(user?.email ?? '')
  const [res, setRes] = useState<TestResult | null>(null)
  const [testing, setTesting] = useState(false)
  const dirty = useMemo(() => JSON.stringify(d) !== JSON.stringify(saved), [d, saved])
  useUnsavedGuard('email-channel', dirty)
  const replyBad = !isValidEmail(d.replyTo)
  const save = async () => {
    setSaving(true)
    try { const s = await channelsApi.saveEmailChannel(d); setSaved(s); setD(s); toast.success('Email settings saved') } catch (e) { toast.error((e as Error).message) }
    setSaving(false)
  }
  const test = async () => {
    setTesting(true)
    try { setRes(await settingsApi.sendTestEmail(to)) } catch (e) { setRes({ ok: false, ms: 0, message: (e as Error).message }) }
    setTesting(false)
  }
  const o = office.data
  const r = resend.data
  const sig = d.signature.replace('{agent_first_name}', user?.name.split(' ')[0] ?? 'Ava')
  return (
    <div className="pb-24" data-testid="email-tab">
      <div className="mb-3 flex justify-end"><SaveState dirty={dirty} testId="email-save-state" /></div>
      <div className="divide-y divide-border/70 rounded-2xl bg-surface px-6 py-6 shadow-card ring-1 ring-black/[0.04] max-sm:px-4">
        <FormSection title="Connected mailbox" description="Where customer email arrives and replies are sent from." testId="email-section-mailbox">
          <div className="flex flex-wrap items-center gap-3 rounded-xl bg-surface-sunken p-4" data-testid="email-mailbox">
            <LogoTile id="outlook" />
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-ink">{d.mailbox}</p>
              <p className="text-xs text-ink-muted">via Office 365 · {o ? (o.status === 'connected' ? 'Connected' : 'Not connected') : 'Checking…'}</p>
              {o?.attention && <p className="mt-1 flex items-center gap-1 text-xs font-medium text-amber-800" data-testid="email-mailbox-attention"><AlertTriangle className="h-3 w-3" aria-hidden /> Needs attention: {o.attention}</p>}
            </div>
            <Link to="/settings/integrations/outlook" className="inline-flex min-h-11 items-center text-sm font-medium text-tobacco-700 underline underline-offset-2" data-testid="email-manage-integration">Manage in Integrations</Link>
          </div>
        </FormSection>
        <FormSection title="Sender" description="What customers see in their inbox." testId="email-section-sender">
          <div><Label htmlFor="email-from">From name</Label><Input id="email-from" className="mt-1.5" value={d.fromName} onChange={(e) => setD({ ...d, fromName: e.target.value })} data-testid="email-from-name" /></div>
          <div>
            <Label htmlFor="email-reply-to">Reply-to</Label>
            <Input id="email-reply-to" type="email" className="mt-1.5" value={d.replyTo} onChange={(e) => setD({ ...d, replyTo: e.target.value })} aria-invalid={replyBad} data-testid="email-reply-to" />
            {replyBad && <p role="alert" className="mt-1.5 text-xs font-medium text-red-700">Enter a valid email address.</p>}
          </div>
        </FormSection>
        <FormSection title="Signature" description="Added under every agent and AI email. {agent_first_name} fills in automatically." testId="email-section-signature">
          <div className="grid gap-4 xl:grid-cols-2">
            <div><Label htmlFor="email-signature">Signature</Label><Textarea id="email-signature" rows={5} className="mt-1.5 font-mono text-[13px]" value={d.signature} onChange={(e) => setD({ ...d, signature: e.target.value })} data-testid="email-signature" /></div>
            <div><p className="text-sm font-medium text-ink">Preview</p><p className="mt-1.5 whitespace-pre-wrap rounded-xl border border-border bg-white p-4 text-sm text-ink" data-testid="email-signature-preview">{sig}</p></div>
          </div>
        </FormSection>
        <FormSection title="Auto-acknowledgement" description="An instant reply when a new email arrives." testId="email-section-ack">
          <label className="flex min-h-11 items-center gap-2.5 text-sm font-medium text-ink"><Switch checked={d.autoAck.enabled} onCheckedChange={(v) => setD({ ...d, autoAck: { ...d.autoAck, enabled: v } })} data-testid="email-ack-enabled" aria-label="Send auto-acknowledgement" /> Send an acknowledgement</label>
          {d.autoAck.enabled && <Textarea aria-label="Acknowledgement message" className="max-w-[75ch]" value={d.autoAck.message} onChange={(e) => setD({ ...d, autoAck: { ...d.autoAck, message: e.target.value } })} data-testid="email-ack-message" />}
        </FormSection>
        <FormSection title="Sending domain" description="Outbound mail and CSAT surveys go through Resend." testId="email-section-domain">
          <div className="flex items-center gap-3"><LogoTile id="resend" /><div><p className="text-sm font-semibold text-ink">{r?.details['Sending domain'] ?? '…'}</p><p className="text-xs text-ink-muted">{r?.status === 'connected' ? 'Verified and sending' : 'Not verified'}</p></div></div>
          <ul className="flex flex-wrap gap-2" data-testid="email-domain-checks">
            {r?.checklist?.map((c) => <li key={c.label} className="inline-flex items-center gap-1.5 rounded-full bg-surface-muted px-2.5 py-1 text-xs text-ink">{c.ok ? <CheckCircle2 className="h-3.5 w-3.5 text-green-700" aria-hidden /> : <AlertTriangle className="h-3.5 w-3.5 text-amber-700" aria-hidden />}{c.label.replace(' record', '')}</li>)}
          </ul>
          <div className="flex flex-wrap items-end gap-2">
            <div className="min-w-0 flex-1 basis-60"><Label htmlFor="email-test-to">Send a test to</Label><Input id="email-test-to" type="email" className="mt-1.5" value={to} onChange={(e) => setTo(e.target.value)} data-testid="email-test-to" /></div>
            <Button variant="outline" onClick={test} loading={testing} data-testid="email-send-test"><Send aria-hidden /> Send test email</Button>
          </div>
          <Result r={res} />
        </FormSection>
      </div>
      {dirty && (
        <SaveBar>
          <Button variant="ghost" size="sm" onClick={() => setD(saved)} data-testid="email-discard">Discard</Button>
          <Button size="sm" onClick={save} loading={saving} disabled={replyBad || !d.fromName.trim()} data-testid="email-save">Save</Button>
        </SaveBar>
      )}
    </div>
  )
}

export function EmailTab() {
  const { data, loading, error, reload } = useApi(() => channelsApi.getEmailChannel(), [])
  if (loading) return <Skeleton className="h-[640px] w-full rounded-2xl" data-testid="email-loading" />
  if (error || !data) return <ErrorState title="Email settings didn't load" onRetry={reload} testId="email-error" />
  return <Loaded initial={data} />
}
