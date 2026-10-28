import React, { Fragment, useState } from 'react'
import { ArrowDown, ArrowUp, CornerDownRight, GripVertical, MoreHorizontal, Plus, Zap } from 'lucide-react'
import type { Step, StepType, Workflow } from '@/types'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { STEP_GROUPS, STEP_LABEL, TERMINAL, handlesOf, linearNeighbour, outEdge, stepNumbers } from '@/lib/workflowGraph'
import { STEP_ICON, VarText, stepSummary } from './stepMeta'

type W = Pick<Workflow, 'steps' | 'edges' | 'trigger'>
interface Props {
  wf: W
  selected: string | null
  current: string | null
  issueIds: Set<string>
  onSelect: (id: string) => void
  onInsert: (source: string, handle: string, type: StepType) => void
  onRemove: (id: string) => void
  onDuplicate: (id: string) => void
  onSwap: (a: string, b: string) => void
}

export function AddStepMenu({ onPick, label, testId }: { onPick: (t: StepType) => void; label: string; testId: string }) {
  return (
    <DropdownMenu>
      <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'outline', size: 'icon-sm' }), 'rounded-full bg-surface max-sm:h-11 max-sm:w-11')} aria-label={label} data-testid={testId}><Plus aria-hidden /></DropdownMenuTrigger>
      <DropdownMenuContent className="max-h-80 w-56 overflow-y-auto">
        {STEP_GROUPS.map(([g, types], i) => (
          <Fragment key={g}>
            {i > 0 && <DropdownMenuSeparator />}
            <DropdownMenuLabel>{g}</DropdownMenuLabel>
            {types.map((t) => { const I = STEP_ICON[t]; return <DropdownMenuItem key={t} onSelect={() => onPick(t)} data-testid={`add-step-${t}`}><I className="mr-2 h-4 w-4" aria-hidden />{STEP_LABEL[t]}</DropdownMenuItem> })}
          </Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

const Connector = () => <div className="mx-auto h-4 w-px bg-border-strong" aria-hidden />

// Step-by-step List view (REQ-735..737): numbered cards, branches as side-by-side columns.
export function StepList(p: Props) {
  const nums = stepNumbers(p.wf)
  const indeg = (id: string) => p.wf.edges.filter((x) => x.target === id).length
  const rendered = new Set<string>()
  const [drag, setDrag] = useState<string | null>(null)

  const Card = ({ st }: { st: Step }) => {
    const I = STEP_ICON[st.type]
    const up = linearNeighbour(p.wf, st.id, -1)
    const down = linearNeighbour(p.wf, st.id, 1)
    return (
      <div
        draggable={handlesOf(st).length === 1}
        onDragStart={() => setDrag(st.id)}
        onDragOver={(e) => drag && drag !== st.id && e.preventDefault()}
        onDrop={() => { if (drag && drag !== st.id) p.onSwap(drag, st.id); setDrag(null) }}
        className={cn('group flex w-full items-start gap-2 rounded-xl border bg-surface p-3 text-left shadow-[0_1px_2px_rgba(31,29,26,0.04)] transition-colors', p.selected === st.id ? 'border-tobacco-500 ring-2 ring-tobacco-200' : 'border-border hover:border-border-strong', p.current === st.id && 'ring-2 ring-amber-400', p.issueIds.has(st.id) && 'border-amber-400')}
        data-testid={`step-card-${st.id}`} data-current={p.current === st.id || undefined}
      >
        <span className="mt-0.5 cursor-grab text-ink-subtle max-sm:hidden" aria-hidden><GripVertical className="h-4 w-4" /></span>
        <button type="button" onClick={() => p.onSelect(st.id)} className="min-w-0 flex-1 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid={`step-open-${st.id}`}>
          <span className="flex items-center gap-2 text-[13px] font-semibold text-ink"><span className="flex h-5 min-w-5 items-center justify-center rounded-full bg-surface-muted px-1 text-[11px] tabular-nums text-ink-muted">{nums.get(st.id)}</span><I className="h-4 w-4 text-ink-muted" aria-hidden />{STEP_LABEL[st.type]}</span>
          <span className="mt-1 block text-[13px] text-ink-muted" data-testid={`step-summary-${st.id}`}><VarText text={stepSummary(st)} /></span>
        </button>
        <DropdownMenu>
          <DropdownMenuTrigger className={cn(buttonVariants({ variant: 'ghost', size: 'icon-sm' }), 'max-sm:h-11 max-sm:w-11')} aria-label={`Step ${nums.get(st.id)} actions`} data-testid={`step-menu-${st.id}`}><MoreHorizontal aria-hidden /></DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuItem disabled={!up} onSelect={() => up && p.onSwap(up, st.id)} data-testid={`step-up-${st.id}`}><ArrowUp className="mr-2 h-4 w-4" aria-hidden />Move up</DropdownMenuItem>
            <DropdownMenuItem disabled={!down} onSelect={() => down && p.onSwap(st.id, down)} data-testid={`step-down-${st.id}`}><ArrowDown className="mr-2 h-4 w-4" aria-hidden />Move down</DropdownMenuItem>
            <DropdownMenuItem disabled={handlesOf(st).length !== 1} onSelect={() => p.onDuplicate(st.id)} data-testid={`step-duplicate-${st.id}`}>Duplicate</DropdownMenuItem>
            <DropdownMenuItem className="text-red-700" onSelect={() => p.onRemove(st.id)} data-testid={`step-delete-${st.id}`}>Delete</DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  const Marker = ({ text, testId }: { text: string; testId: string }) => <p className="mx-auto flex w-fit items-center gap-1 rounded-full bg-surface-muted px-3 py-1 text-xs font-medium text-ink-muted" data-testid={testId}><CornerDownRight className="h-3.5 w-3.5" aria-hidden />{text}</p>

  const chain = (start: string | null, from: string, handle: string, inBranch: boolean, joins: string[]): React.ReactElement[] => {
    const out: React.ReactElement[] = []
    let id = start, src = from, h = handle
    while (true) {
      const s0 = src, h0 = h
      const plus = <div key={`plus-${src}-${h}`} className="flex justify-center py-1"><AddStepMenu onPick={(t) => p.onInsert(s0, h0, t)} label={`Add step after ${src === 'trigger' ? 'trigger' : `step ${nums.get(src)}`}`} testId={`insert-${src}-${h}`} /></div>
      if (!id) { out.push(plus); out.push(<Marker key={`open-${src}-${h}`} text="Not connected yet" testId={`marker-open-${src}-${h}`} />); break }
      const st = p.wf.steps.find((x) => x.id === id)
      if (!st) break
      if (rendered.has(id)) { out.push(plus); out.push(<Marker key={`goto-${src}-${h}`} text={`Go to step ${nums.get(id)}`} testId={`marker-goto-${id}`} />); break }
      if (inBranch && indeg(id) > 1 && !TERMINAL.includes(st.type)) { joins.push(id); out.push(<Marker key={`cont-${src}-${h}`} text={`Continue at step ${nums.get(id)}`} testId={`marker-continue-${id}`} />); break }
      rendered.add(id)
      out.push(<Fragment key={`c-${id}`}><div className="flex justify-center py-1"><AddStepMenu onPick={(t) => p.onInsert(s0, h0, t)} label={`Insert step before step ${nums.get(id)}`} testId={`insert-${src}-${h}`} /></div><Connector /><Card st={st} /></Fragment>)
      const hs = handlesOf(st)
      if (!hs.length) { out.push(<Marker key={`end-${id}`} text={st.type === 'end' ? 'End' : 'Hand over'} testId={`marker-end-${id}`} />); break }
      if (hs.length === 1) { src = id; h = hs[0][0]; id = outEdge(p.wf, src, h)?.target ?? null; out.push(<Connector key={`k-${src}`} />); continue }
      const myJoins: string[] = []
      out.push(
        <div key={`br-${id}`} className="mt-2 grid gap-3 rounded-2xl bg-surface-sunken p-3" style={{ gridTemplateColumns: `repeat(${hs.length}, minmax(220px, 1fr))` }} data-testid={`branches-${id}`}>
          {hs.map(([hid, label]) => (
            <div key={hid} className="min-w-0" data-testid={`branch-${id}-${hid}`}>
              <p className="mb-1 truncate text-center text-xs font-semibold text-ink" title={label}>{label}</p>
              {chain(outEdge(p.wf, id!, hid)?.target ?? null, id!, hid, true, myJoins)}
            </div>
          ))}
        </div>,
      )
      const next = myJoins.find((j) => !rendered.has(j))
      if (!next) break
      out.push(<Connector key={`j-${next}`} />)
      inBranch = false; src = id!; id = next; h = '__join'
      joins.push(...myJoins.filter((j) => j !== next))
    }
    return out.filter((el) => !(el.key?.toString().startsWith('plus-') && el.key.toString().endsWith('__join')))
  }

  return (
    <div className="mx-auto w-full max-w-[880px] overflow-x-auto pb-12" data-testid="step-list">
      <button type="button" onClick={() => p.onSelect('trigger')} className={cn('flex w-full items-start gap-3 rounded-xl border bg-surface p-3 text-left', p.selected === 'trigger' ? 'border-tobacco-500 ring-2 ring-tobacco-200' : 'border-border')} data-testid="step-card-trigger">
        <Zap className="mt-0.5 h-4 w-4 text-brass-600" aria-hidden />
        <span className="min-w-0"><span className="block text-[13px] font-semibold text-ink">When the AI detects “{p.wf.trigger.intent || 'No intent yet'}”</span><span className="block truncate text-[13px] text-ink-muted">{p.wf.trigger.phrases.map((x) => `“${x}”`).join(', ') || 'No example phrases'} · {p.wf.trigger.channels.join(', ')}</span>{p.wf.trigger.quickReply && <span className="mt-1.5 inline-flex rounded-full border border-border bg-surface-muted px-2.5 py-0.5 text-xs font-medium text-ink" data-testid="trigger-quick-reply">Quick reply: {p.wf.trigger.quickReply}</span>}</span>
      </button>
      <Connector />
      {chain(outEdge(p.wf, 'trigger', 'next')?.target ?? null, 'trigger', 'next', false, [])}
      {p.wf.steps.filter((s) => !rendered.has(s.id)).length > 0 && (
        <div className="mt-6 space-y-2" data-testid="unconnected-steps">
          <p className="text-xs font-semibold text-amber-800">Not connected to the trigger</p>
          {p.wf.steps.filter((s) => !rendered.has(s.id)).map((s) => <Card key={s.id} st={s} />)}
        </div>
      )}
    </div>
  )
}
