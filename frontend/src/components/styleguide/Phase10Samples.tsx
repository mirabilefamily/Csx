import { Sparkles } from 'lucide-react'

const swatch = 'rounded-xl border border-border bg-surface p-4'

// Phase 10 Modern Inbox patterns (static samples; live versions are in /inbox).
export function Phase10Samples() {
  return (
    <div className="grid gap-4 lg:grid-cols-3" data-testid="sg-phase10">
      <div className="space-y-1 rounded-xl bg-[#F6F1EA] p-3" data-testid="sg-views-panel">
        <p className="px-2.5 text-xs font-semibold text-ink-muted">Default views</p>
        <div className="flex min-h-9 items-center rounded-lg bg-white px-2.5 text-sm font-semibold text-ink shadow-card ring-1 ring-black/5">All <span className="ml-auto rounded-md bg-tobacco-600 px-1.5 text-xs text-white">40</span></div>
        <div className="flex min-h-9 items-center px-2.5 text-sm text-ink">Unassigned <span className="ml-auto rounded-md bg-surface-muted px-1.5 text-xs text-ink-muted">17</span></div>
        <div className="mt-3 flex min-h-10 items-center gap-2 rounded-full bg-white px-3.5 text-sm font-medium text-ink shadow-card ring-1 ring-black/5"><Sparkles className="h-4 w-4 text-tobacco-600" aria-hidden /> Ask Goorin AI <kbd className="ml-auto text-[11px] text-ink-muted">⌘G</kbd></div>
      </div>
      <div className="rounded-xl border border-amber-200 bg-[#FBF3E4] p-4" data-testid="sg-handover">
        <p className="flex items-center gap-2 text-sm font-semibold text-ink"><Sparkles className="h-4 w-4 text-amber-700" aria-hidden /> Handover summary</p>
        <p className="mt-2 text-sm text-ink">Cream card with a sparkle, timestamp, collapse and Refresh / Try again. Followed by a white Handover reason card with intent, a bold conclusion and sourced bullets.</p>
      </div>
      <div className={swatch} data-testid="sg-message-card">
        <p className="text-xs text-ink-muted">AI / agent message card</p>
        <div className="mt-2 rounded-xl border border-[#EADFD2] bg-[#FAF5EE] px-4 py-3 text-sm text-ink">Tinted, offset right, copy icon in the left gutter.<p className="mt-2 border-t border-[#EADFD2] pt-2 text-xs text-ink-muted">This response was created by Goorin AI Assistant · Show reasoning</p></div>
      </div>
    </div>
  )
}
