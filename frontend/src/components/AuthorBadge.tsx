import { Bot, Cog, Sparkles, User, UserRound } from 'lucide-react'
import type { AuthorType } from '@/types'
import { AUTHOR_LABELS } from '@/lib/labels'
import { cn } from '@/lib/utils'

const styles: Record<AuthorType, { cls: string; Icon: typeof User }> = {
  customer: { cls: 'bg-surface-muted text-ink border-border-strong', Icon: UserRound },
  claude: { cls: 'bg-brass-50 text-brass-700 border-brass-300', Icon: Sparkles },
  grokbot: { cls: 'bg-slate-50 text-slate-700 border-slate-300', Icon: Bot },
  agent: { cls: 'bg-tobacco-600 text-white border-tobacco-600', Icon: User },
  system: { cls: 'bg-surface-sunken text-ink-muted border-border', Icon: Cog },
}

interface AuthorBadgeProps {
  type: AuthorType
  label?: string
  className?: string
}

// The single source of author styling. Never restyle locally.
export function AuthorBadge({ type, label, className }: AuthorBadgeProps) {
  const { cls, Icon } = styles[type]
  return (
    <span
      data-testid={`author-badge-${type}`}
      className={cn('inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium leading-5', cls, className)}
    >
      <Icon className="h-3 w-3" aria-hidden />
      {label ?? AUTHOR_LABELS[type]}
    </span>
  )
}
