import { useEffect, useRef, useState } from 'react'
import { Braces, Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import type { Macro } from '@/types'
import { directoryApi, guidanceApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import { useUnsavedGuard } from '@/components/UnsavedGuard'
import { Button } from '@/components/ui/button'
import { FieldError, Input, Label, Textarea } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState } from '@/components/States'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'

const PLACEHOLDERS = ['{{customer.first_name}}', '{{order.number}}', '{{order.tracking_url}}', '{{order.carrier}}']
const SAMPLE: Record<string, string> = { 'customer.first_name': 'Margaret', 'order.number': '#GB20398', 'order.tracking_url': 'https://tracking.example.com/ups/1Z20398', 'order.carrier': 'UPS', 'agent.first_name': 'Ava', 'customer.name': 'Margaret Okonkwo' }
const fillSample = (s: string) => s.replace(/\{\{\s*([\w.]+)\s*\}\}/g, (m, k: string) => SAMPLE[k] ?? m)

function MacroEditor({ macro, onDone }: { macro: Macro | null; onDone: () => void }) {
  const initial = { name: macro?.name ?? '', body: macro?.body ?? '' }
  const [form, setForm] = useState(initial)
  const [error, setError] = useState<string | null>(null)
  const [confirmDelete, setConfirmDelete] = useState(false)
  const [saving, setSaving] = useState(false)
  const body = useRef<HTMLTextAreaElement>(null)
  const { confirmLeave } = useUnsavedGuard('macro-editor', JSON.stringify(form) !== JSON.stringify(initial))

  const insert = (p: string) => {
    const el = body.current
    const at = el?.selectionStart ?? form.body.length
    setForm((f) => ({ ...f, body: f.body.slice(0, at) + p + f.body.slice(el?.selectionEnd ?? at) }))
    setTimeout(() => { el?.focus(); el?.setSelectionRange(at + p.length, at + p.length) }, 0)
  }
  const save = async () => {
    if (!form.name.trim()) return setError('Name is required.')
    setSaving(true)
    try {
      await guidanceApi.saveMacro({ id: macro?.id, ...form })
      toast.success('Macro saved')
      onDone()
    } catch (e) {
      setError((e as Error).message)
      setSaving(false)
    }
  }
  return (
    <Card className="space-y-4 p-5" data-testid="macro-editor">
      <div>
        <Label htmlFor="macro-name">Name</Label>
        <Input id="macro-name" className="mt-1.5" value={form.name} aria-invalid={!!error} onChange={(e) => { setForm({ ...form, name: e.target.value }); setError(null) }} data-testid="macro-name" />
        <FieldError>{error}</FieldError>
      </div>
      <div>
        <div className="flex items-center justify-between">
          <Label htmlFor="macro-body">Body</Label>
          <DropdownMenu>
            <DropdownMenuTrigger asChild><Button variant="ghost" size="sm" data-testid="insert-placeholder"><Braces aria-hidden /> Insert placeholder</Button></DropdownMenuTrigger>
            <DropdownMenuContent align="end">{PLACEHOLDERS.map((p) => <DropdownMenuItem key={p} onSelect={() => insert(p)} data-testid={`placeholder-${p}`}>{p}</DropdownMenuItem>)}</DropdownMenuContent>
          </DropdownMenu>
        </div>
        <Textarea id="macro-body" ref={body} className="mt-1.5 min-h-[140px]" value={form.body} onChange={(e) => setForm({ ...form, body: e.target.value })} data-testid="macro-body" />
      </div>
      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-ink-muted">Preview with sample values</p>
        <p className="mt-1.5 whitespace-pre-wrap rounded-lg bg-surface-muted p-3 text-sm text-ink" data-testid="macro-preview">{fillSample(form.body) || 'Nothing to preview yet.'}</p>
      </div>
      <div className="flex flex-wrap gap-2">
        {macro && <Button variant="ghost" className="text-red-700" onClick={() => setConfirmDelete(true)} data-testid="macro-delete"><Trash2 aria-hidden /> Delete</Button>}
        <Button variant="outline" className="ml-auto" onClick={() => confirmLeave(onDone)}>Cancel</Button>
        <Button onClick={save} loading={saving} data-testid="macro-save">Save</Button>
      </div>
      <AlertDialog open={confirmDelete} onOpenChange={setConfirmDelete}>
        <AlertDialogContent data-testid="macro-delete-dialog">
          <AlertDialogTitle>Delete {macro?.name}?</AlertDialogTitle>
          <AlertDialogDescription>It will disappear from the Inbox macro picker.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction data-testid="macro-delete-confirm" onClick={async () => { if (macro) { await guidanceApi.deleteMacro(macro.id); toast.success('Macro deleted'); setForm(initial); onDone() } }}>Delete</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Card>
  )
}

export function MacrosTab() {
  const [rev, setRev] = useState(0)
  const { data, loading, error, reload } = useApi(() => directoryApi.listMacros(), [rev])
  const [editing, setEditing] = useState<string | null>(null)
  const { confirmLeave } = useUnsavedGuard()
  useEffect(() => { if (editing && editing !== 'new' && data && !data.some((m) => m.id === editing)) setEditing(null) }, [data, editing])
  const done = () => { setEditing(null); setRev((r) => r + 1) }

  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]" data-testid="macros-tab">
      <Card className="overflow-hidden">
        <div className="flex items-center justify-between border-b border-border px-4 py-3">
          <p className="text-sm font-semibold text-ink">{data?.length ?? 0} macros</p>
          <Button size="sm" onClick={() => confirmLeave(() => setEditing('new'))} data-testid="new-macro"><Plus aria-hidden /> New macro</Button>
        </div>
        {loading ? <div className="space-y-2 p-4">{[0, 1, 2, 3].map((i) => <Skeleton key={i} className="h-12 w-full" />)}</div>
          : error ? <ErrorState compact title="Macros didn't load" onRetry={reload} testId="macros-error" />
          : !data?.length ? <EmptyState compact title="No macros yet" description="Create one to reuse a reply." testId="macros-empty" />
          : (
            <ul className="divide-y divide-border" data-testid="macro-list">
              {data.map((m) => (
                <li key={m.id}>
                  <button type="button" onClick={() => confirmLeave(() => setEditing(m.id))} data-testid={`macro-row-${m.id}`} className={cn('w-full px-4 py-3 text-left transition-colors hover:bg-surface-sunken focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring', editing === m.id && 'bg-tobacco-50')}>
                    <span className="flex items-baseline justify-between gap-2"><span className="text-sm font-medium text-ink">{m.name}</span><span className="text-xs text-ink-muted">{m.shortcut}</span></span>
                    <span className="mt-0.5 block truncate text-xs text-ink-muted">{m.body}</span>
                    <span className="mt-1 block text-xs text-ink-subtle">Used {m.usageCount} times · updated {timeAgo(m.updatedAt)}</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
      </Card>
      {editing ? <MacroEditor key={editing} macro={data?.find((m) => m.id === editing) ?? null} onDone={done} /> : (
        <Card className="hidden lg:block"><EmptyState compact title="Pick a macro to edit" description="Or create a new one. Changes show up in the Inbox / picker." /></Card>
      )}
    </div>
  )
}
