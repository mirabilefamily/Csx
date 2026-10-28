import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertTriangle, Mail, MessageCircle, MoreHorizontal, NotebookPen, Plus, Workflow as WorkflowIcon } from 'lucide-react'
import { toast } from 'sonner'
import type { Workflow, WorkflowChannel } from '@/types'
import { workflowsApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/components/auth/AuthContext'
import { Button, buttonVariants } from '@/components/ui/button'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/overlay'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle } from '@/components/ui/alert-dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { EmptyState, ErrorState } from '@/components/States'
import { StatusPill } from '@/components/StatusPill'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'
import { validate } from '@/lib/workflowGraph'

const CH_ICON: Record<WorkflowChannel, [typeof Mail, string]> = { chat: [MessageCircle, 'Chat widget'], form: [NotebookPen, 'Contact form'], email: [Mail, 'Email'] }
const STATUS_LABEL = { active: 'Active', off: 'Off', draft: 'Draft' } as const

function NewMenu({ templates, onCreate }: { templates: { id: string; name: string }[]; onCreate: (tpl?: string) => void }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={buttonVariants({ size: 'sm' })} data-testid="workflow-new"><Plus aria-hidden /> New workflow</DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-60">
        <DropdownMenuItem onSelect={() => onCreate()} data-testid="workflow-new-blank">Start from blank</DropdownMenuItem>
        <DropdownMenuSeparator />
        {templates.map((t) => <DropdownMenuItem key={t.id} onSelect={() => onCreate(t.id)} data-testid={`workflow-new-${t.id}`}>Use template: {t.name}</DropdownMenuItem>)}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

// Workflows list (REQ-721..729): stats, rows, templates, duplicate-trigger warning, empty state.
export function WorkflowsTab() {
  const { data, loading, error, reload } = useApi(() => workflowsApi.listWorkflows(), [])
  const tpls = useApi(() => workflowsApi.listTemplates(), [])
  const { user } = useAuth()
  const nav = useNavigate()
  const [list, setList] = useState<Workflow[] | null>(null)
  const rows = list ?? data ?? []
  const refresh = async () => setList(await workflowsApi.listWorkflows())
  const create = async (tpl?: string) => { const wf = await workflowsApi.createWorkflow(user!.name, tpl); toast.success(tpl ? 'Template added as a draft' : 'Workflow created'); nav(`/ai/workflows/${wf.id}`) }
  const toggle = async (wf: Workflow, on: boolean) => {
    try { await workflowsApi.setStatus(wf.id, on ? 'active' : 'off', user!.name); await refresh(); toast.success(`${wf.name} is ${on ? 'on' : 'off'}`) } catch (e) { toast.error((e as Error).message) }
  }
  const move = async (i: number, d: -1 | 1) => { const ids = rows.map((r) => r.id); [ids[i], ids[i + d]] = [ids[i + d], ids[i]]; setList(await workflowsApi.reorderWorkflows(ids)) }
  const active = rows.filter((w) => w.status === 'active')
  const dupes = active.filter((w, i) => active.some((o, j) => j !== i && o.trigger.intent.toLowerCase() === w.trigger.intent.toLowerCase() && o.trigger.channels.some((c) => w.trigger.channels.includes(c))))
  const runs = rows.reduce((s, w) => s + w.runs7d, 0)
  const withPct = rows.filter((w) => w.completedPct !== null && w.runs7d)
  const handed = withPct.length ? 100 - Math.round(withPct.reduce((s, w) => s + w.completedPct! * w.runs7d, 0) / withPct.reduce((s, w) => s + w.runs7d, 0)) : null
  const [renaming, setRenaming] = useState<Workflow | null>(null)
  const [newName, setNewName] = useState('')
  const [deleting, setDeleting] = useState<Workflow | null>(null)
  const completed = withPct.length ? Math.round(withPct.reduce((s, w) => s + w.completedPct! * w.runs7d, 0) / withPct.reduce((s, w) => s + w.runs7d, 0)) : null

  if (loading && !list) return <Skeleton className="h-[420px] w-full rounded-2xl" />
  if (error && !list) return <ErrorState title="Workflows didn't load" onRetry={reload} testId="workflows-error" />

  return (
    <div className="space-y-6" data-testid="workflows-list">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <dl className="flex flex-wrap gap-x-8 gap-y-2" data-testid="workflows-stats">
          {[['Active', `${active.length} of ${rows.length}`], ['Runs, last 7 days', runs.toLocaleString()], ['Completed without a person', completed === null ? '—' : `${completed}%`], ['Handed to a person', handed === null ? '—' : `${handed}%`]].map(([k, v]) => <div key={k}><dt className="text-xs text-ink-muted">{k}</dt><dd className="text-lg text-ink" data-testid={`workflows-stat-${k.split(' ')[0].toLowerCase()}`}>{v}</dd></div>)}
        </dl>
        <NewMenu templates={tpls.data ?? []} onCreate={create} />
      </div>
      {dupes.length > 0 && <p role="alert" className="flex items-center gap-2 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900" data-testid="workflows-duplicate-warning"><AlertTriangle className="h-4 w-4" aria-hidden />Two active workflows use this trigger. The first one in the list runs.<span className="sr-only"> ({dupes.map((d) => d.name).join(' and ')})</span></p>}
      {rows.length === 0 ? (
        <div className="rounded-2xl bg-surface p-6 shadow-card"><EmptyState title="No workflows yet" description="Workflows are process automations the AI runs, like order tracking with an email code." icon={<WorkflowIcon className="h-6 w-6" aria-hidden />} testId="workflows-empty" action={<NewMenu templates={tpls.data ?? []} onCreate={create} />} /></div>
      ) : (
        <ul className="divide-y divide-border/70 overflow-hidden rounded-2xl bg-surface shadow-card ring-1 ring-black/[0.04]" data-testid="workflows-rows">
          {rows.map((w, i) => {
            const issues = validate(w).length
            return (
              <li key={w.id} className="grid items-center gap-x-4 gap-y-2 px-6 py-4 hover:bg-surface-sunken max-sm:px-4 md:grid-cols-[minmax(0,1fr)_auto_auto_auto]" data-testid={`workflow-row-${w.id}`}>
                <button type="button" onClick={() => nav(`/ai/workflows/${w.id}`)} className="min-w-0 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid={`workflow-open-${w.id}`}>
                  <span className="flex items-center gap-2"><span className="truncate text-sm font-semibold text-ink">{w.name}</span>{issues > 0 && <span className="text-xs font-medium text-amber-800" data-testid={`workflow-issues-${w.id}`}>{issues} issue{issues === 1 ? '' : 's'}</span>}</span>
                  <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-xs text-ink-muted">
                    <span>When “{w.trigger.intent || 'no intent'}”</span>
                    <span className="flex items-center gap-1" aria-label={`Channels: ${w.trigger.channels.map((c) => CH_ICON[c][1]).join(', ')}`}>{w.trigger.channels.map((c) => { const [I] = CH_ICON[c]; return <I key={c} className="h-3.5 w-3.5" aria-hidden /> })}</span>
                    <span>· Edited {timeAgo(w.editedAt)} by {w.editedBy}</span>
                  </span>
                </button>
                <span className="text-xs text-ink-muted tabular-nums" data-testid={`workflow-runs-${w.id}`}>{w.runs7d.toLocaleString()} runs · {w.completedPct === null ? '—' : `${w.completedPct}% completed`}</span>
                <span className="flex items-center gap-2"><StatusPill status={w.status === 'active' ? 'resolved' : 'closed'} label={STATUS_LABEL[w.status]} /><Switch checked={w.status === 'active'} onCheckedChange={(on) => toggle(w, on)} aria-label={`${w.name} on`} data-testid={`workflow-toggle-${w.id}`} /></span>
                <DropdownMenu>
                  <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }), 'max-sm:h-11 max-sm:w-11')} aria-label={`${w.name} actions`} data-testid={`workflow-menu-${w.id}`}><MoreHorizontal aria-hidden /></DropdownMenuTrigger>
                  <DropdownMenuContent align="end">
                    <DropdownMenuItem onSelect={() => nav(`/ai/workflows/${w.id}`)}>Edit</DropdownMenuItem>
                    <DropdownMenuItem onSelect={async () => { await workflowsApi.duplicateWorkflow(w.id, user!.name); await refresh(); toast.success('Workflow duplicated') }} data-testid={`workflow-duplicate-${w.id}`}>Duplicate</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => nav(`/ai/workflows/${w.id}?test=1`)} data-testid={`workflow-test-${w.id}`}>Test</DropdownMenuItem>
                    <DropdownMenuItem onSelect={() => { setNewName(w.name); setRenaming(w) }} data-testid={`workflow-rename-${w.id}`}>Rename</DropdownMenuItem>
                    <DropdownMenuItem disabled={i === 0} onSelect={() => move(i, -1)}>Move up</DropdownMenuItem>
                    <DropdownMenuItem disabled={i === rows.length - 1} onSelect={() => move(i, 1)}>Move down</DropdownMenuItem>
                    <DropdownMenuSeparator />
                    <DropdownMenuItem className="text-red-700" onSelect={() => setDeleting(w)} data-testid={`workflow-delete-${w.id}`}>Delete</DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </li>
            )
          })}
        </ul>
      )}
      <Dialog open={!!renaming} onOpenChange={(o) => !o && setRenaming(null)}>
        <DialogContent data-testid="rename-dialog">
          <DialogTitle className="text-base font-semibold text-ink">Rename workflow</DialogTitle>
          <form className="mt-4 space-y-4" onSubmit={async (e) => { e.preventDefault(); if (!renaming || !newName.trim()) return; await workflowsApi.renameWorkflow(renaming.id, newName.trim(), user!.name); setRenaming(null); await refresh(); toast.success('Workflow renamed') }}>
            <Input autoFocus value={newName} onChange={(e) => setNewName(e.target.value)} aria-label="Workflow name" data-testid="rename-input" />
            <div className="flex justify-end gap-2"><Button type="button" variant="outline" onClick={() => setRenaming(null)} data-testid="rename-cancel">Cancel</Button><Button type="submit" disabled={!newName.trim()} data-testid="rename-save">Rename</Button></div>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={!!deleting} onOpenChange={(o) => !o && setDeleting(null)}>
        <AlertDialogContent data-testid="delete-dialog">
          <AlertDialogTitle>Delete {deleting?.name}?</AlertDialogTitle>
          <AlertDialogDescription>The workflow and its settings are removed. This can't be undone.</AlertDialogDescription>
          <AlertDialogFooter><AlertDialogCancel data-testid="delete-cancel">Cancel</AlertDialogCancel><AlertDialogAction onClick={async () => { if (!deleting) return; await workflowsApi.deleteWorkflow(deleting.id); setDeleting(null); await refresh(); toast.success('Workflow deleted') }} data-testid="delete-confirm">Delete</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
      <section aria-labelledby="tpl-title" data-testid="workflow-templates">
        <h2 id="tpl-title" className="mb-3 text-[15px] font-semibold text-ink">Templates</h2>
        <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          {(tpls.data ?? []).map((t) => (
            <article key={t.id} className="flex flex-col rounded-2xl bg-surface p-4 shadow-card ring-1 ring-black/[0.04]" data-testid={`template-${t.id}`}>
              <h3 className="text-sm font-semibold text-ink">{t.name}</h3>
              <p className="mt-1 flex-1 text-xs text-ink-muted">{t.description}</p>
              <p className="mt-2 text-xs text-ink-muted">{t.steps} steps · ships Off</p>
              <Button size="sm" variant="outline" className="mt-3 w-fit" onClick={() => create(t.id)} data-testid={`template-use-${t.id}`}>Use template</Button>
            </article>
          ))}
        </div>
      </section>
    </div>
  )
}
