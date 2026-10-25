import { Link, useLocation } from 'react-router-dom'
import { useEffect, useSyncExternalStore } from 'react'
import { useAuth } from '@/components/auth/AuthContext'
import { cn } from '@/lib/utils'
import { NAV, SETTINGS } from './Sidebar'
import { useShellData } from './ShellData'

let hiders = 0
const subs = new Set<() => void>()
const notify = () => subs.forEach((l) => l())

// Full-screen phone editors (article/macro editor, CSV import) hide the tab bar while open.
export function useHideBottomTabBar(active: boolean) {
  useEffect(() => {
    if (!active) return
    hiders++
    notify()
    return () => { hiders--; notify() }
  }, [active])
}

// Phone-only bottom navigation (<640px). Hidden while a conversation or a full-screen editor is open.
export function BottomTabBar() {
  const { pathname } = useLocation()
  const { user } = useAuth()
  const { needsHuman } = useShellData()
  const hidden = useSyncExternalStore((l) => { subs.add(l); return () => { subs.delete(l) } }, () => hiders > 0)
  if (hidden || /^\/inbox\/.+/.test(pathname)) return null
  const items = user?.role === 'admin' ? [...NAV, SETTINGS] : NAV
  const count = needsHuman?.length ?? 0
  return (
    <nav aria-label="Primary" className="fixed inset-x-0 bottom-0 z-40 border-t border-border bg-white/95 pb-[env(safe-area-inset-bottom)] backdrop-blur-md sm:hidden" data-testid="bottom-tab-bar">
      <ul className="flex">
        {items.map(({ to, label, Icon }) => {
          const active = pathname.startsWith(to)
          const id = label.toLowerCase()
          return (
            <li key={to} className="flex-1">
              <Link
                to={to}
                aria-current={active ? 'page' : undefined}
                className={cn('relative flex h-14 flex-col items-center justify-center gap-0.5 text-[11px] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-ring', active ? 'text-tobacco-700' : 'text-ink-muted')}
                data-testid={`bottom-tab-${id}`}
              >
                {active && <span className="absolute inset-x-6 top-0 h-[3px] rounded-b-full bg-[#B08D57]" aria-hidden data-testid="bottom-tab-active-indicator" />}
                <span className="relative">
                  <Icon className={cn('h-[22px] w-[22px]', active ? 'text-tobacco-600' : 'text-ink-muted')} aria-hidden />
                  {id === 'inbox' && count > 0 && (
                    <span className="absolute -right-3 -top-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full bg-amber-400 px-1 text-[10px] font-semibold leading-4 text-amber-950 ring-2 ring-white" data-testid="bottom-tab-inbox-badge">
                      {count}<span className="sr-only"> need a human</span>
                    </span>
                  )}
                </span>
                {label}
              </Link>
            </li>
          )
        })}
      </ul>
    </nav>
  )
}
