import type { ReactNode } from 'react'
import { Outlet, useLocation } from 'react-router-dom'
import { cn } from '@/lib/utils'
import { Sidebar } from './Sidebar'
import { GlobalSearch } from './GlobalSearch'
import { NotificationBell } from './NotificationBell'
import { UserMenu } from './UserMenu'
import { ShellDataProvider } from './ShellData'
import { BottomTabBar } from './BottomTabBar'
import { MobileSearch, MobileTitle } from './MobileTopBar'

export function AppShell({ children }: { children?: ReactNode }) {
  const fullBleed = useLocation().pathname.startsWith('/inbox') && !children
  return (
    <ShellDataProvider>
      <a href="#main" className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-[80] focus:rounded-md focus:bg-surface focus:px-3 focus:py-2 focus:text-sm focus:shadow-popover">
        Skip to content
      </a>
      <div className="flex min-h-screen bg-background">
        <Sidebar />
        <div className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-30 flex h-16 items-center gap-3 border-b border-border bg-background/85 px-4 backdrop-blur-md md:px-8 max-sm:h-14 max-sm:gap-1 max-sm:pr-2 max-sm:pt-[env(safe-area-inset-top)] max-sm:box-content" data-testid="top-bar">
            <MobileTitle />
            <div className="contents max-sm:hidden"><GlobalSearch /></div>
            <div className="ml-auto flex items-center gap-1 max-sm:ml-0 max-sm:gap-0">
              <MobileSearch />
              <NotificationBell />
              <UserMenu />
            </div>
          </header>
          <main
            id="main"
            tabIndex={-1}
            className={cn('w-full focus:outline-none', fullBleed ? 'h-[calc(100vh-4rem)] flex-none overflow-hidden max-sm:h-[calc(100dvh-3.5rem-3.5rem-env(safe-area-inset-bottom)-env(safe-area-inset-top))]' : 'min-w-0 flex-1 px-4 pb-24 pt-8 md:px-8 2xl:px-12 max-sm:pb-[calc(6rem+env(safe-area-inset-bottom))] max-sm:pt-5')}
          >
            {children ?? <Outlet />}
          </main>
        </div>
      </div>
      <BottomTabBar />
    </ShellDataProvider>
  )
}
