import { Link } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { GoorinCastle, GoorinWordmark } from '@/components/brand/GoorinBrand'

// Sidebar brand: collapsed shows a white castle on a brass tile; expanded shows a left-aligned one-line lockup.
export function Wordmark({ compact = false, className }: { compact?: boolean; className?: string }) {
  return (
    <Link
      to="/dashboard"
      aria-label={compact ? 'Goorin Bros. Support Desk home' : undefined}
      data-testid="wordmark"
      className={cn('group inline-flex items-center rounded-md max-sm:min-h-11 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#B08D57] focus-visible:ring-offset-2 focus-visible:ring-offset-white', className)}
    >
      {compact ? (
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#B08D57] text-white shadow-[inset_0_-1px_0_rgba(31,29,26,0.12)] transition-colors group-hover:bg-[#A27F4A]" data-testid="sidebar-logo-tile">
          <GoorinCastle width={26} />
        </span>
      ) : (
        <span className="flex items-center" data-testid="sidebar-lockup">
          <GoorinWordmark width={100} tone="black" alt="Goorin Bros." />
          <span className="mx-[11px] h-4 w-px bg-border" aria-hidden />
          <span className="whitespace-nowrap text-[13px] font-medium leading-none text-ink-muted" data-testid="sidebar-support-desk-label">Support Desk</span>
        </span>
      )}
    </Link>
  )
}
