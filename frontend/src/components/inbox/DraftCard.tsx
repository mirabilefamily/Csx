import { BookOpen, Check, Pencil, Trash2 } from 'lucide-react'
import type { AIDraft } from '@/types'
import { AuthorBadge } from '@/components/AuthorBadge'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface Props {
  draft: AIDraft
  titles: Record<string, string>
  editing: boolean
  busy: boolean
  onApprove: () => void
  onEdit: () => void
  onDiscard: () => void
}

export function DraftCard({ draft, titles, editing, busy, onApprove, onEdit, onDiscard }: Props) {
  const tier = draft.tier === 'claude' ? 'Claude' : 'Grokbot'
  const pct = Math.round(draft.confidence * 100)
  return (
    <li className={cn('rounded-xl border-2 border-dashed p-4', draft.tier === 'claude' ? 'border-brass-300 bg-brass-50/60' : 'border-slate-300 bg-slate-50/70')} data-testid={`draft-card-${draft.id}`} aria-label={`${tier} draft awaiting approval`}>
      <div className="flex flex-wrap items-center gap-2">
        <AuthorBadge type={draft.tier} />
        <p className="text-sm font-semibold text-ink" data-testid="draft-label">{tier} draft · Awaiting approval</p>
        <div className="ml-auto flex items-center gap-2" data-testid="draft-confidence">
          <span className="text-xs text-ink-muted">Confidence</span>
          <div className="h-2 w-24 overflow-hidden rounded-full bg-surface-muted" role="meter" aria-valuemin={0} aria-valuemax={100} aria-valuenow={pct} aria-label="Confidence">
            <div className={cn('h-full rounded-full', pct >= 70 ? 'bg-green-600' : pct >= 55 ? 'bg-brass-500' : 'bg-red-500')} style={{ width: `${pct}%` }} />
          </div>
          <span className="text-xs font-semibold tabular-nums text-ink">{pct}%</span>
        </div>
      </div>
      <p className="mt-3 whitespace-pre-wrap rounded-lg bg-surface p-3 text-sm text-ink">{draft.body}</p>
      <div className="mt-3 flex flex-wrap items-center gap-1.5" data-testid="draft-guidance">
        <span className="text-xs text-ink-muted">Guidance used:</span>
        {draft.guidanceIds.map((id) => (
          <span key={id} className="inline-flex items-center gap-1 rounded-full border border-border bg-surface px-2 py-0.5 text-xs text-ink">
            <BookOpen className="h-3 w-3 text-tobacco-500" aria-hidden /> {titles[id] ?? id}
          </span>
        ))}
      </div>
      <div className="mt-4 flex flex-wrap items-center gap-2">
        <Button size="sm" onClick={onApprove} loading={busy} data-testid="draft-approve"><Check aria-hidden /> Approve</Button>
        <Button size="sm" variant="outline" onClick={onEdit} disabled={busy} data-testid="draft-edit"><Pencil aria-hidden /> Edit</Button>
        <Button size="sm" variant="ghost" onClick={onDiscard} disabled={busy} data-testid="draft-discard"><Trash2 aria-hidden /> Discard</Button>
        {editing && <span className="text-xs font-medium text-brass-700" data-testid="draft-editing">Editing in composer</span>}
      </div>
    </li>
  )
}
