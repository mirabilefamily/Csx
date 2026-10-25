import { createContext, useCallback, useContext, useMemo, useState, type ReactNode } from 'react'
import { Navigate, Outlet, useLocation } from 'react-router-dom'
import type { Role, SessionUser } from '@/types'

const KEY = 'goorin.session'

interface AuthValue {
  user: SessionUser | null
  signIn: (user: SessionUser) => void
  signOut: () => void
  setRole: (role: Role) => void
}

const AuthContext = createContext<AuthValue | null>(null)

const read = (): SessionUser | null => {
  try {
    return JSON.parse(sessionStorage.getItem(KEY) ?? 'null')
  } catch {
    return null
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<SessionUser | null>(read)
  const persist = useCallback((u: SessionUser | null) => {
    if (u) sessionStorage.setItem(KEY, JSON.stringify(u))
    else sessionStorage.removeItem(KEY)
    setUser(u)
  }, [])
  const value = useMemo<AuthValue>(
    () => ({
      user,
      signIn: persist,
      signOut: () => persist(null),
      setRole: (role) => user && persist({ ...user, role }),
    }),
    [user, persist],
  )
  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth() {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider')
  return ctx
}

export function RequireAuth() {
  const { user } = useAuth()
  const location = useLocation()
  if (!user) return <Navigate to="/login" replace state={{ from: location.pathname }} />
  return <Outlet />
}
