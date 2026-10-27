import type { ReactNode } from 'react'

export const SG_INDEX: [string, string][] = [
  ['colors', 'Colors'],
  ['type', 'Type scale'],
  ['buttons', 'Buttons'],
  ['inputs', 'Inputs'],
  ['badges', 'Author badges'],
  ['pills', 'Status pills'],
  ['cards', 'Cards'],
  ['tables', 'Tables'],
  ['states', 'States'],
  ['inbox', 'Inbox pieces'],
  ['widget', 'Chat widget'],
  ['dashboard', 'Dashboard pieces'],
  ['navigation', 'Sidebar nav'],
  ['phase9', 'Workspace patterns'],
  ['controls', 'Segmented control'],
  ['settings', 'Settings patterns'],
  ['phone', 'Phone patterns'],
]

// One styleguide section with an anchor id used by the sticky index.
export function SgSection({ id, title, description, children }: { id: string; title: string; description?: ReactNode; children: ReactNode }) {
  return (
    <section id={id} aria-labelledby={`${id}-h`} className="scroll-mt-24 space-y-5" data-testid={`styleguide-${id}`}>
      <div>
        <h2 id={`${id}-h`} className="text-base font-semibold text-ink md:text-lg">{title}</h2>
        {description && <p className="mt-1 max-w-2xl text-sm text-ink-muted">{description}</p>}
      </div>
      {children}
    </section>
  )
}

// Small caption above a specimen.
export function Specimen({ label, children, className }: { label: string; children: ReactNode; className?: string }) {
  return (
    <figure className={className}>
      <figcaption className="mb-2 text-xs font-medium text-ink-muted">{label}</figcaption>
      {children}
    </figure>
  )
}

// Sticky in-page index; horizontal scroller below 1024px.
export function SgIndex() {
  return (
    <nav aria-label="Styleguide sections" data-testid="styleguide-index" className="sticky top-16 z-20 -mx-4 overflow-x-auto bg-background/90 px-4 py-2 backdrop-blur lg:top-24 lg:mx-0 lg:self-start lg:bg-transparent lg:p-0 lg:backdrop-blur-0">
      <ul className="flex gap-1 text-sm lg:flex-col">
        {SG_INDEX.map(([id, label]) => (
          <li key={id}>
            <a href={`#${id}`} className="block whitespace-nowrap rounded-md max-sm:flex max-sm:min-h-11 max-sm:items-center px-2 py-1 text-ink-muted transition-colors hover:bg-surface-muted hover:text-ink focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid={`styleguide-index-${id}`}>{label}</a>
          </li>
        ))}
      </ul>
    </nav>
  )
}
