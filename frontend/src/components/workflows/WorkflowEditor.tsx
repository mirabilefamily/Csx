import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import { Link, useNavigate, useSearchParams } from 'react-router-dom'
import { AlertTriangle, ArrowLeft, FlaskConical } from 'lucide-react'
import { toast } from 'sonner'
import type { StepType, Workflow } from '@/types'
import { workflowsApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import { useUnsavedGuard } from '@/components/UnsavedGuard'
import { useAuth } from '@/components/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Skeleton } from '@/components/ui/skeleton'
import { Switch } from '@/components/ui/overlay'
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet'
import { ErrorState } from '@/components/States'
import { SaveBar } from '@/components/settings/SaveBar'
import { PillTabs } from '@/components/dashboard/Panel'
import { duplicateStep, insertAfter, removeStep, swapSteps, tidy, validate } from '@/lib/workflowGraph'
import { StepList } from './StepList'
import { StepSettings, TriggerSettings } from './StepSettings'
import { TestPanel } from './TestPanel'

const StepCanvas = lazy(() => import('./StepCanvas'))
const VIEW_KEY = 'goorin.workflowView'
const useWide = () => { const [w, setW] = useState(() => window.innerWidth >= 1024); useEffect(() => { const f = () => setW(window.innerWidth >= 1024); window.addEventListener('resize', f); return () => window.removeEventListener('resize', f) }, []); return w }

// Workflow editor (REQ-730..745): one model, List and Canvas views, step settings, issues, test panel.
export function WorkflowEditor({ id }: { id: string }) {
  const { data, loading, error, reload } = useApi(() => workflowsApi.getWorkflow(id), [id])
  const { user } = useAuth()
  const nav = useNavigate()
  const wide = useWide()
  const [saved, setSaved] = useState<Workflow | null>(null)
  const [wf, setWf] = useState<Workflow | null>(null)
  const [view, setView] = useState<'list' | 'canvas'>(() => (sessionStorage.getItem(VIEW_KEY) as 'list' | 'canvas') ?? 'list')
  const [selected, setSelected] = useState<string | null>(null)
  const [params] = useSearchParams()
  const [testing, setTesting] = useState(params.get('test') === '1')
  const [current, setCurrent] = useState<string | null>(null)
  const [saving, setSaving] = useState(false)
  useEffect(() => { if (data) { setSaved(data); setWf(data) } }, [data])
  const dirty = !!wf && JSON.stringify(wf) !== JSON.stringify(saved)
  const { confirmLeave } = useUnsavedGuard('workflow-editor', dirty)
  const issues = useMemo(() => (wf ? validate(wf) : []), [wf])
  const issueIds = useMemo(() => new Set(issues.map((i) => i.stepId).filter((x): x is string => !!x)), [issues])
  const mode = wide ? view : 'list'

  if (loading) return <Skeleton className="h-[560px] w-full rounded-2xl" />
  if (error || data === null || !wf) return <ErrorState title={data === null ? "This workflow doesn't exist" : "The workflow didn't load"} onRetry={reload} testId="workflow-error" />

  const patch = (p: Partial<Workflow>) => setWf({ ...wf, ...p })
  const setView2 = (v: 'list' | 'canvas') => { setView(v); sessionStorage.setItem(VIEW_KEY, v) }
  const insert = (src: string, h: string, t: StepType) => { const r = insertAfter(wf, src, h, t); setWf(view === 'canvas' ? tidy(r.wf) : r.wf); setSelected(r.id) }
  const save = async () => {
    setSaving(true)
    try { const s = await workflowsApi.saveWorkflow(wf, user!.name); setSaved(s); setWf(s); toast.success('Workflow saved') } catch (e) { toast.error((e as Error).message) }
    setSaving(false)
  }
  const toggle = async (on: boolean) => {
    if (on && issues.length) return toast.error(`Fix ${issues.length} issue${issues.length === 1 ? '' : 's'} before turning this on.`)
    if (dirty) return toast.error('Save your changes first.')
    try { const s = await workflowsApi.setStatus(wf.id, on ? 'active' : 'off', user!.name); setSaved(s); setWf(s); toast.success(on ? 'Workflow is on' : 'Workflow is off') } catch (e) { toast.error((e as Error).message) }
  }
  const step = wf.steps.find((s) => s.id === selected)
  const settings = selected === 'trigger' ? <><h3 className="mb-4 text-[15px] font-semibold text-ink">Trigger</h3><TriggerSettings t={wf.trigger} set={(trigger) => patch({ trigger })} /></> : step ? (
    <StepSettings wf={wf} step={step} onChange={(config) => patch({ steps: wf.steps.map((s) => (s.id === step.id ? { ...s, config } : s)) })} onClose={() => setSelected(null)} onDelete={() => { setWf(removeStep(wf, step.id)); setSelected(null) }} />
  ) : null

  return (
    <div className="pb-24" data-testid="workflow-editor">
      <div className="mb-4 flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="icon-sm" aria-label="Back to workflows" onClick={() => confirmLeave(() => nav('/ai/workflows'))} data-testid="editor-back"><ArrowLeft aria-hidden /></Button>
        <Input className="h-9 w-72 max-w-full font-semibold" value={wf.name} onChange={(e) => patch({ name: e.target.value })} aria-label="Workflow name" data-testid="editor-name" />
        <label className="flex items-center gap-2 text-sm text-ink"><Switch checked={wf.status === 'active'} onCheckedChange={toggle} aria-label="Workflow on" data-testid="editor-status-toggle" />{wf.status === 'active' ? 'On' : wf.status === 'draft' ? 'Draft' : 'Off'}</label>
        <div className="ml-auto flex items-center gap-2">
          {wide ? <PillTabs tabs={[{ id: 'list', label: 'List' }, { id: 'canvas', label: 'Canvas' }]} value={view} onChange={setView2} label="Editor view" testId="editor-view" /> : <p className="text-xs text-ink-muted" data-testid="editor-canvas-note">Canvas editing works on larger screens.</p>}
          <Button size="sm" variant={testing ? 'secondary' : 'outline'} onClick={() => setTesting((t) => !t)} data-testid="editor-test"><FlaskConical aria-hidden /> Test workflow</Button>
        </div>
      </div>
      {issues.length > 0 && (
        <details className="mb-4 rounded-xl border border-amber-300 bg-amber-50 px-4 py-2 text-sm text-amber-900" data-testid="editor-issues">
          <summary className="flex cursor-pointer items-center gap-2 font-medium"><AlertTriangle className="h-4 w-4" aria-hidden />{issues.length} issue{issues.length === 1 ? '' : 's'} to fix before turning this on</summary>
          <ul className="mt-2 space-y-1">{issues.map((i, n) => <li key={n}><button type="button" className="text-left underline-offset-2 hover:underline" onClick={() => setSelected(i.stepId ?? 'trigger')} data-testid={`editor-issue-${n}`}>{i.text}</button></li>)}</ul>
        </details>
      )}
      <div className="flex min-h-[600px] overflow-hidden rounded-2xl bg-surface shadow-card ring-1 ring-black/[0.04]">
        <div className={cn2('min-w-0 flex-1', mode === 'list' && 'overflow-auto bg-surface-sunken p-6 max-sm:p-3')} data-testid={`editor-${mode}`}>
          {mode === 'list' ? (
            <StepList wf={wf} selected={selected} current={current} issueIds={issueIds} onSelect={setSelected} onInsert={insert} onRemove={(sid) => { setWf(removeStep(wf, sid)); setSelected(null) }} onDuplicate={(sid) => setWf(duplicateStep(wf, sid))} onSwap={(a, b) => setWf(swapSteps(wf, a, b))} />
          ) : (
            <Suspense fallback={<Skeleton className="h-full min-h-[560px] w-full" />}>
              <StepCanvas wf={wf} onInsert={insert} onChange={(w) => setWf({ ...wf, ...w })} selected={selected} current={current} issueIds={issueIds} onSelect={setSelected} />
            </Suspense>
          )}
        </div>
        {settings && wide && <aside className="w-80 shrink-0 overflow-y-auto border-l border-border p-4" aria-label="Step settings" data-testid="settings-panel">{settings}</aside>}
        {testing && wide && <div className="w-[380px] shrink-0"><TestPanel wf={wf} onCurrent={setCurrent} onClose={() => { setTesting(false); setCurrent(null) }} /></div>}
      </div>
      {!wide && (
        <>
          <Sheet open={!!settings} onOpenChange={(o) => !o && setSelected(null)}>
            <SheetContent className="inset-x-0 bottom-0 top-auto h-auto max-h-[85vh] w-full max-w-none overflow-y-auto rounded-t-2xl p-4 sm:max-w-none" data-testid="settings-sheet"><SheetTitle className="sr-only">Step settings</SheetTitle>{settings}</SheetContent>
          </Sheet>
          <Sheet open={testing} onOpenChange={setTesting}>
            <SheetContent className="w-full max-w-none p-0 sm:max-w-none" data-testid="test-sheet"><SheetTitle className="sr-only">Test workflow</SheetTitle><TestPanel wf={wf} onCurrent={setCurrent} onClose={() => setTesting(false)} /></SheetContent>
          </Sheet>
        </>
      )}
      {dirty && (
        <SaveBar>
          <Button variant="ghost" size="sm" onClick={() => setWf(saved)} data-testid="editor-discard">Discard</Button>
          <Button size="sm" onClick={save} loading={saving} data-testid="editor-save">Save</Button>
        </SaveBar>
      )}
      <p className="mt-3 text-xs text-ink-muted">Edited {new Date(wf.editedAt).toLocaleString()} by {wf.editedBy} · <Link to="/ai/routing" className="underline">Routing</Link> decides who gets handed-over tickets.</p>
    </div>
  )
}

const cn2 = (...c: (string | false | undefined)[]) => c.filter(Boolean).join(' ')
