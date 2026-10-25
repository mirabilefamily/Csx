import { useLocation } from 'react-router-dom'
import { Search } from 'lucide-react'
import { Dialog, DialogContent, DialogTitle } from '@/components/ui/dialog'
import { GoorinCastle } from '@/components/brand/GoorinBrand'
import { SheetCloseButton } from '@/components/ui/sheet'
import { useEffect, useState } from 'react'
import { cn } from '@/lib/utils'
import { GlobalSearch } from './GlobalSearch'

const TITLES: [string, string][] = [['/dashboard', 'Dashboard'], ['/inbox', 'Inbox'], ['/guidance', 'Guidance'], ['/settings', 'Settings']]

// Phone top bar left side: castle mark + page title. Large-title pattern: the title fades in only once the page's own h1 has scrolled under the bar.
export function MobileTitle() {
  const { pathname } = useLocation()
  const title = TITLES.find(([p]) => pathname.startsWith(p))?.[1] ?? 'Support Desk'
  const [shown, setShown] = useState(false)
  useEffect(() => {
    let io: IntersectionObserver | undefined
    let tries = 0
    const attach = () => {
      const h1 = document.querySelector<HTMLElement>('main [data-testid=page-title], [data-testid=page-title]')
      if (!h1 || !h1.offsetParent) { if (++tries < 15) return void (timer = window.setTimeout(attach, 100)); return setShown(true) }
      io = new IntersectionObserver(([e]) => setShown(!e.isIntersecting), { rootMargin: '-64px 0px 0px 0px' })
      io.observe(h1)
    }
    let timer = window.setTimeout(attach, 0)
    setShown(false)
    return () => { window.clearTimeout(timer); io?.disconnect() }
  }, [pathname])
  return (
    <div className="flex min-w-0 flex-1 items-center gap-2.5 sm:hidden">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-[#B08D57] text-white" aria-hidden><GoorinCastle width={18} /></span>
      <p className={cn('truncate font-display text-[17px] text-ink transition-opacity duration-200', shown ? 'opacity-100' : 'opacity-0')} aria-hidden={!shown} data-state={shown ? 'shown' : 'hidden'} data-testid="mobile-page-title">{title}</p>
    </div>
  )
}

// Phone search: icon button opening a full-screen search using the same GlobalSearch results.
export function MobileSearch() {
  const [open, setOpen] = useState(false)
  return (
    <>
      <button type="button" onClick={() => setOpen(true)} aria-label="Search" className="inline-flex h-11 w-11 items-center justify-center rounded-lg text-ink-muted hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring sm:hidden" data-testid="mobile-search-trigger">
        <Search className="h-5 w-5" aria-hidden />
      </button>
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-sm:top-0 max-sm:h-[100dvh] max-sm:max-h-none max-sm:rounded-none max-sm:p-4 max-sm:pt-[max(1rem,env(safe-area-inset-top))]" aria-describedby={undefined} data-testid="mobile-search-sheet" onClick={(e) => { if ((e.target as HTMLElement).closest('[role=option]')) setOpen(false) }}>
          <div className="flex items-center gap-2">
            <DialogTitle className="sr-only">Search</DialogTitle>
            <div className="min-w-0 flex-1"><GlobalSearch /></div>
            <SheetCloseButton label="Close search" />
          </div>
        </DialogContent>
      </Dialog>
    </>
  )
}
