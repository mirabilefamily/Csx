import { useState, type FormEvent } from 'react'
import { toast } from 'sonner'
import type { Channel, Ticket } from '@/types'
import { inboxApi } from '@/api'
import { useAuth } from '@/components/auth/AuthContext'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FieldError, Input, Label, Textarea } from '@/components/ui/input'
import { isValidEmail } from '@/lib/format'
import { cn } from '@/lib/utils'

// "+ New" ticket composer (MOCKED): creates a ticket at the top of the list and opens it.
export function NewTicketDialog({ open, onOpenChange, onCreated }: { open: boolean; onOpenChange: (o: boolean) => void; onCreated: (t: Ticket) => void }) {
  const { user } = useAuth()
  const [f, setF] = useState({ email: '', subject: '', body: '', channel: 'email' as Channel, isInternal: false })
  const [errors, setErrors] = useState<{ email?: string; subject?: string; form?: string }>({})
  const [busy, setBusy] = useState(false)
  const submit = async (e: FormEvent) => {
    e.preventDefault()
    const next = { email: isValidEmail(f.email) ? undefined : 'Enter a valid email address.', subject: f.subject.trim() ? undefined : 'Add a subject.' }
    setErrors(next)
    if (next.email || next.subject || !user) return
    setBusy(true)
    try {
      const t = await inboxApi.createTicket(f, user)
      toast.success(`Ticket ${t.id} created`)
      setF({ email: '', subject: '', body: '', channel: 'email', isInternal: false })
      onCreated(t)
    } catch (err) { setErrors({ form: (err as Error).message }) }
    setBusy(false)
  }
  const seg = (on: boolean) => cn('min-h-9 rounded-md px-3 text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-sm:min-h-11', on ? 'bg-surface font-medium text-ink shadow-card' : 'text-ink-muted hover:text-ink')
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg" data-testid="new-ticket-dialog">
        <DialogTitle className="text-base font-semibold text-ink">New ticket</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-ink-muted">Start a conversation with a customer. It's assigned to you.</DialogDescription>
        <form onSubmit={submit} noValidate className="mt-5 space-y-4">
          {errors.form && <p role="alert" className="rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{errors.form}</p>}
          <div><Label htmlFor="nt-email">Customer email</Label><Input id="nt-email" type="email" className="mt-1.5" placeholder="grace@example.com" value={f.email} onChange={(e) => setF({ ...f, email: e.target.value })} aria-invalid={!!errors.email} data-testid="new-ticket-email" /><FieldError>{errors.email}</FieldError></div>
          <div><Label htmlFor="nt-subject">Subject</Label><Input id="nt-subject" className="mt-1.5" value={f.subject} onChange={(e) => setF({ ...f, subject: e.target.value })} aria-invalid={!!errors.subject} data-testid="new-ticket-subject" /><FieldError>{errors.subject}</FieldError></div>
          <div className="flex flex-wrap gap-3">
            <div role="radiogroup" aria-label="Channel" className="inline-flex gap-1 rounded-lg bg-surface-muted p-1">
              {(['email', 'chat'] as const).map((c) => <button key={c} type="button" role="radio" aria-checked={f.channel === c} onClick={() => setF({ ...f, channel: c })} className={cn(seg(f.channel === c), 'capitalize')} data-testid={`new-ticket-channel-${c}`}>{c}</button>)}
            </div>
            <div role="radiogroup" aria-label="Message type" className="inline-flex gap-1 rounded-lg bg-surface-muted p-1">
              {([[false, 'Reply'], [true, 'Internal note']] as const).map(([v, l]) => <button key={l} type="button" role="radio" aria-checked={f.isInternal === v} onClick={() => setF({ ...f, isInternal: v })} className={seg(f.isInternal === v)} data-testid={`new-ticket-type-${v ? 'note' : 'reply'}`}>{l}</button>)}
            </div>
          </div>
          <div><Label htmlFor="nt-body">Message</Label><Textarea id="nt-body" rows={5} className="mt-1.5" value={f.body} onChange={(e) => setF({ ...f, body: e.target.value })} data-testid="new-ticket-body" /></div>
          <div className="flex justify-end gap-2">
            <Button type="button" variant="ghost" onClick={() => onOpenChange(false)} data-testid="new-ticket-cancel">Cancel</Button>
            <Button type="submit" loading={busy} data-testid="new-ticket-submit">Create ticket</Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
