import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import type { Ticket } from '@/types'
import { ticketsApi } from '@/api'
import { useApi } from '@/hooks/useApi'

interface ShellData {
  tickets: Ticket[] | undefined
  needsHuman: Ticket[] | undefined
  loading: boolean
  error: Error | null
  reload: () => void
  upsert: (changed: Ticket[]) => void
}

const Ctx = createContext<ShellData | null>(null)

const byUpdated = (a: Ticket, b: Ticket) => b.updatedAt.localeCompare(a.updatedAt)

// Single ticket store for the shell: Inbox views, list rows, the nav badge and the bell all derive from it.
export function ShellDataProvider({ children }: { children: ReactNode }) {
  const { data, loading, error, reload } = useApi(() => ticketsApi.listTickets(), [])
  const [tickets, setTickets] = useState<Ticket[] | undefined>()
  const lastGood = useRef<Ticket[] | undefined>(undefined)
  useEffect(() => {
    setTickets(data)
  }, [data])
  useEffect(() => {
    if (tickets) lastGood.current = tickets
  }, [tickets])

  const upsert = useCallback((changed: Ticket[]) => {
    const merge = (cur: Ticket[] | undefined) => cur && cur.map((t) => changed.find((c) => c.id === t.id) ?? t).sort(byUpdated)
    lastGood.current = merge(lastGood.current)
    setTickets(merge)
  }, [])

  // On a failed refresh keep showing the last good list (flagged by `error`) so the UI stays usable.
  const shown = tickets ?? (error ? lastGood.current : undefined)
  const needsHuman = shown?.filter((t) => t.status === 'needs_human')
  return <Ctx.Provider value={{ tickets: shown, needsHuman, loading: loading || (!!data && !tickets), error, reload, upsert }}>{children}</Ctx.Provider>
}

export function useShellData() {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useShellData must be used inside ShellDataProvider')
  return ctx
}
