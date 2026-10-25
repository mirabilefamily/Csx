import { CheckCircle2, StickyNote } from 'lucide-react'
import type { Message } from '@/types'
import { AuthorBadge } from '@/components/AuthorBadge'
import { timeAgo } from '@/lib/format'
import { cn } from '@/lib/utils'

const BUBBLE: Record<Exclude<Message['authorType'], 'system'>, string> = {
  customer: 'mr-auto bg-surface border-border',
  claude: 'ml-auto bg-brass-50 border-brass-200',
  grokbot: 'ml-auto bg-slate-50 border-slate-100',
  agent: 'ml-auto bg-tobacco-50 border-tobacco-100',
}

export const richText = '[&_a]:text-tobacco-700 [&_a]:underline [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p+p]:mt-2 [&_strong]:font-semibold [&_ul]:list-disc [&_ul]:pl-5'

function Time({ iso }: { iso: string }) {
  return <time dateTime={iso} title={new Date(iso).toLocaleString()} className="text-xs text-ink-muted">{timeAgo(iso)}</time>
}

export function MessageItem({ m }: { m: Message }) {
  if (m.authorType === 'system')
    return (
      <li className="flex justify-center" data-testid={`message-${m.id}`} data-author="system">
        <span className="inline-flex max-w-full flex-wrap items-center justify-center gap-2 rounded-full bg-surface-muted px-3 py-1 text-xs text-ink-muted">
          <AuthorBadge type="system" />
          <span className="text-ink">{m.body}</span>
          <Time iso={m.createdAt} />
        </span>
      </li>
    )
  return (
    <li
      data-testid={`message-${m.id}`}
      data-author={m.authorType}
      data-internal={m.isInternal || undefined}
      className={cn('w-full max-w-[min(100%,620px)] rounded-xl border p-4', m.isInternal ? 'ml-auto border-dashed border-amber-300 bg-amber-50' : BUBBLE[m.authorType])}
    >
      <div className="mb-2 flex flex-wrap items-center gap-2">
        <AuthorBadge type={m.authorType} />
        <span className="text-sm font-medium text-ink">{m.authorName}</span>
        {m.isInternal && (
          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-xs font-semibold text-amber-900" data-testid="internal-note-label">
            <StickyNote className="h-3 w-3" aria-hidden /> Internal note
          </span>
        )}
        <span className="ml-auto"><Time iso={m.createdAt} /></span>
      </div>
      {m.format === 'html' ? (
        <div className={cn('text-sm text-ink', richText)} dangerouslySetInnerHTML={{ __html: m.body }} />
      ) : (
        <p className="whitespace-pre-wrap text-sm text-ink">{m.body}</p>
      )}
      {m.approvedBy && (
        <p className="mt-3 inline-flex items-center gap-1 text-xs font-medium text-green-700" data-testid="approved-by">
          <CheckCircle2 className="h-3.5 w-3.5" aria-hidden /> Approved by {m.approvedBy}
        </p>
      )}
    </li>
  )
}
