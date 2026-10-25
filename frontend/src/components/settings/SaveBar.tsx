import type { ReactNode } from 'react'

// Shared sticky unsaved-changes bar for Settings tabs (AI, Chat Widget).
export function SaveBar({ note, children }: { note?: ReactNode; children: ReactNode }) {
  return (
    <div
      className="fixed bottom-16 left-1/2 z-40 flex w-[min(600px,calc(100vw-2rem))] -translate-x-1/2 items-center gap-3 rounded-2xl bg-surface/95 px-4 py-3 shadow-popover ring-1 ring-black/5 backdrop-blur-md animate-in fade-in slide-in-from-bottom-2"
      role="region"
      aria-label="Unsaved changes"
      data-testid="unsaved-bar"
    >
      <span className="h-2 w-2 shrink-0 rounded-full bg-amber-400" aria-hidden />
      <p className="mr-auto text-sm font-medium text-ink">You have unsaved changes</p>
      {note}
      {children}
    </div>
  )
}

// Label + help on the left (~1/3), controls on the right (~2/3); stacks below 1024px.
export function FormSection({ title, description, children, testId }: { title: string; description?: ReactNode; children: ReactNode; testId?: string }) {
  return (
    <section className="grid gap-4 py-8 first:pt-2 last:pb-2 lg:grid-cols-[minmax(0,1fr)_minmax(0,2fr)] lg:gap-10" data-testid={testId}>
      <div>
        <h2 className="text-[15px] font-semibold text-ink">{title}</h2>
        {description && <p className="mt-1 text-sm leading-relaxed text-ink-muted">{description}</p>}
      </div>
      <div className="min-w-0 space-y-4">{children}</div>
    </section>
  )
}
