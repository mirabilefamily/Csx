import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Hammer } from 'lucide-react'
import { buttonVariants } from '@/components/ui/button'
import { Card } from '@/components/ui/card'
import { PageHeader } from '@/components/PageHeader'

interface PlaceholderProps {
  title: string
  phase: string
  description: string
  upcoming: string[]
  children?: ReactNode
}

export function PlaceholderPage({ title, phase, description, upcoming, children }: PlaceholderProps) {
  return (
    <div className="space-y-8" data-testid="placeholder-page">
      <PageHeader title={title} />
      {children}
      <Card className="relative overflow-hidden p-8 md:p-12">
        <div className="absolute -right-16 -top-16 h-56 w-56 rounded-full bg-brass-50" aria-hidden />
        <div className="relative max-w-xl space-y-4">
          <span className="inline-flex items-center gap-2 rounded-full border border-brass-300 bg-brass-50 px-3 py-1 text-xs font-medium text-brass-700">
            <Hammer className="h-3.5 w-3.5" aria-hidden /> {phase}
          </span>
          <h2 className="text-base font-semibold text-ink md:text-lg" data-testid="placeholder-heading">
            Coming in a later phase
          </h2>
          <p className="text-sm text-ink-muted">{description}</p>
          <ul className="space-y-2 text-sm text-ink">
            {upcoming.map((u) => (
              <li key={u} className="flex gap-2">
                <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-brass-500" aria-hidden />
                {u}
              </li>
            ))}
          </ul>
          <Link to="/dashboard" className={buttonVariants({ variant: 'outline' })} data-testid="placeholder-back-dashboard">
            <ArrowLeft aria-hidden /> Back to Dashboard
          </Link>
        </div>
      </Card>
    </div>
  )
}
