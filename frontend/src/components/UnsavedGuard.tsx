import { createContext, useCallback, useContext, useEffect, useRef, useState, type ReactNode } from 'react'
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogTitle } from '@/components/ui/alert-dialog'

interface Guard {
  setDirty: (key: string, dirty: boolean) => void
  confirmLeave: (proceed: () => void) => void
}

const Ctx = createContext<Guard | null>(null)

// App-wide "Discard unsaved changes?" guard for editors and settings forms.
export function UnsavedGuardProvider({ children }: { children: ReactNode }) {
  const dirty = useRef(new Set<string>())
  const [pending, setPending] = useState<(() => void) | null>(null)
  const setDirty = useCallback((key: string, d: boolean) => {
    if (d) dirty.current.add(key)
    else dirty.current.delete(key)
  }, [])
  const confirmLeave = useCallback((proceed: () => void) => {
    if (dirty.current.size) setPending(() => proceed)
    else proceed()
  }, [])

  useEffect(() => {
    const onUnload = (e: BeforeUnloadEvent) => {
      if (dirty.current.size) e.preventDefault()
    }
    window.addEventListener('beforeunload', onUnload)
    return () => window.removeEventListener('beforeunload', onUnload)
  }, [])

  return (
    <Ctx.Provider value={{ setDirty, confirmLeave }}>
      {children}
      <AlertDialog open={!!pending} onOpenChange={(o) => !o && setPending(null)}>
        <AlertDialogContent data-testid="unsaved-dialog">
          <AlertDialogTitle>Discard unsaved changes?</AlertDialogTitle>
          <AlertDialogDescription>Your edits haven't been saved.</AlertDialogDescription>
          <AlertDialogFooter>
            <AlertDialogCancel data-testid="unsaved-keep-editing">Keep editing</AlertDialogCancel>
            <AlertDialogAction
              data-testid="unsaved-discard"
              onClick={() => {
                dirty.current.clear()
                pending?.()
                setPending(null)
              }}
            >
              Discard
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Ctx.Provider>
  )
}

export function useUnsavedGuard(key?: string, isDirty?: boolean) {
  const ctx = useContext(Ctx)
  if (!ctx) throw new Error('useUnsavedGuard must be used inside UnsavedGuardProvider')
  const { setDirty } = ctx
  useEffect(() => {
    if (!key) return
    setDirty(key, !!isDirty)
    return () => setDirty(key, false)
  }, [key, isDirty, setDirty])
  return ctx
}
