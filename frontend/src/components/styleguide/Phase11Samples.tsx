import { Sparkles } from 'lucide-react'
import { StatusPill } from '@/components/StatusPill'
import { viewRowCls, ViewCount } from '@/components/inbox/InboxViewsPanel'
import { CountBadge } from '@/components/inbox/DetailParts'

// Phase 11 AI-first Inbox patterns (static samples; live versions are in /inbox).
export function Phase11Samples() {
  return (
    <div className="grid gap-4 lg:grid-cols-3" data-testid="sg-phase11">
      <div className="space-y-0.5 rounded-lg border border-border bg-background p-2" data-testid="sg-view-rows">
        {([['Needs you', 7, false, true], ['Assigned to me', 2, true, false], ['AI handling', 13, false, false]] as const).map(([l, n, a, amber]) => (
          <div key={l} className={viewRowCls(a)}><span>{l}</span><ViewCount n={n} active={a} amber={amber} /></div>
        ))}
        <p className="px-2.5 pt-2 text-xs text-ink-muted">32px rows, 6px radius. Selected: tobacco-50 token fill, semibold; hover surface-sunken. Needs you count is amber.</p>
        <p className="flex items-center gap-1.5 px-2.5 pt-2 text-[13px] font-semibold text-ink" data-testid="sg-count-badge">Past tickets <CountBadge n={1} /> <CountBadge n={0} /> <CountBadge n={7} tone="amber" /><span className="text-xs font-normal text-ink-muted">CountBadge: 20px, tobacco-50, 12px medium; 0 muted; amber for Needs you</span></p>
      </div>
      <div className="rounded-lg border border-border bg-white p-3" data-testid="sg-needs-card">
        <p className="text-[13px] font-semibold text-ink">Margaret Chen</p>
        <p className="text-[13px] text-ink">Hat arrived crushed</p>
        <p className="text-xs text-ink-muted">Damaged fedora needs an overnight replacement before a wedding</p>
        <p className="mt-2 flex items-center gap-1.5"><span className="rounded bg-surface-muted px-1.5 text-[11px] font-medium text-ink-muted">Draft ready</span><span className="text-[11px] text-ink-muted">Waiting 5h</span></p>
        <div className="mt-3 flex flex-wrap gap-2"><StatusPill status="needs_human" /><StatusPill status="ai_handling" /><StatusPill status="resolved" /></div>
      </div>
      <div className="rounded-xl border border-[#F1D9B0]/60 bg-surface p-4 shadow-glow-ai" data-testid="sg-why-brief">
        <p className="mb-2 font-mono text-[11px] text-ink-muted" data-testid="sg-glow-token">shadow-glow-ai + border-[#F1D9B0]/60 — only on “Why you're here” (phones: shadow-glow-ai-sm)</p>
        <p className="flex items-center gap-1.5 text-[11px] font-medium uppercase tracking-[0.1em] text-ink-muted"><Sparkles className="h-3.5 w-3.5" aria-hidden />Why you're here</p>
        <p className="mt-1 text-[15px] font-semibold text-ink">Refund of $451 is over the $75 auto-refund limit</p>
        <p className="mt-1 text-xs text-ink">Up to 3 "What the AI did" bullets with source icons, a suggested next step, and a collapsed "How the AI got here".</p>
      </div>
      <div className="rounded-xl border border-border bg-surface p-4 lg:col-span-3" data-testid="sg-phase13">
        <p className="text-[15px] font-semibold text-ink">Workflow step card, canvas node, test panel (Phase 13)</p>
        <div className="mt-3 grid gap-3 sm:grid-cols-3">
          <div className="rounded-xl border border-border bg-surface p-3 text-[13px]"><p className="font-semibold text-ink">2 · Ask a question</p><p className="text-ink-muted">What email did you use? → <span className="rounded bg-tobacco-50 px-1 font-mono text-[11px] text-tobacco-800">email</span></p></div>
          <div className="w-full rounded-xl border-2 border-dashed border-amber-500 bg-surface p-3 text-[13px]"><p className="font-semibold text-ink">Canvas node with an issue</p><p className="text-xs text-ink-muted">Handles top (in) and bottom (one per path)</p></div>
          <div className="rounded-xl bg-surface-sunken p-3 text-xs text-ink"><p className="font-semibold">Customer inbox (mock)</p><p className="text-ink-muted">Your Goorin verification code · 6 digits</p></div>
        </div>
      </div>
      <div className="rounded-xl border border-border bg-surface p-4 lg:col-span-3" data-testid="sg-phase12">
        <p className="text-[15px] font-semibold text-ink">Dashboard KPI delta (Phase 12)</p>
        <p className="mt-2 text-xs"><span className="font-medium text-green-700">↓ 8%</span> <span className="text-ink-muted">vs prior 30 days</span> · <span className="font-medium text-red-700">↓ 0.11</span> <span className="text-ink-muted">vs prior 30 days</span> · plain text, no pill; time KPIs are good when down.</p>
      </div>
    </div>
  )
}
