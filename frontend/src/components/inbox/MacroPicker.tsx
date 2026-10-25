import { useEffect, useState, type MutableRefObject } from 'react'
import type { Macro } from '@/types'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

const esc = (s: string) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;')
export const macroToHtml = (body: string) => body.split(/\n{2,}/).map((p) => `<p>${esc(p).replace(/\n/g, '<br>')}</p>`).join('')

interface Props {
  macros: Macro[]
  source: 'slash' | 'button'
  query: string
  onQuery: (q: string) => void
  onPick: (m: Macro) => void
  onClose: () => void
  keyHandler: MutableRefObject<(e: KeyboardEvent) => boolean>
}

export function MacroPicker({ macros, source, query, onQuery, onPick, onClose, keyHandler }: Props) {
  const [active, setActive] = useState(0)
  const q = query.toLowerCase()
  const list = macros.filter((m) => m.name.toLowerCase().includes(q) || m.shortcut.toLowerCase().includes(q))
  useEffect(() => {
    setActive(0)
  }, [query])

  const handle = (e: KeyboardEvent | React.KeyboardEvent) => {
    if (e.key === 'ArrowDown') setActive((a) => Math.min(list.length - 1, a + 1))
    else if (e.key === 'ArrowUp') setActive((a) => Math.max(0, a - 1))
    else if (e.key === 'Enter' && list[active]) onPick(list[active])
    else if (e.key === 'Escape') onClose()
    else return false
    e.preventDefault()
    return true
  }
  keyHandler.current = handle

  return (
    <div className="absolute bottom-full left-0 z-30 mb-2 w-[min(100%,360px)] rounded-lg border border-border bg-surface p-2 shadow-popover" data-testid="macro-picker">
      <p className="px-2 pb-1 text-[11px] font-semibold uppercase tracking-wider text-ink-muted">Macros</p>
      {source === 'button' && (
        <Input autoFocus value={query} onChange={(e) => onQuery(e.target.value)} onKeyDown={handle} placeholder="Search macros" aria-label="Search macros" className="mb-2 h-9" data-testid="macro-search" />
      )}
      {list.length === 0 ? (
        <p className="px-2 py-3 text-sm text-ink-muted" data-testid="macro-none">No macros found</p>
      ) : (
        <ul role="listbox" aria-label="Macros" className="max-h-60 overflow-y-auto">
          {list.map((m, i) => (
            <li key={m.id} role="option" aria-selected={i === active} data-testid={`macro-option-${m.id}`}
              onMouseDown={(e) => e.preventDefault()} onMouseEnter={() => setActive(i)} onClick={() => onPick(m)}
              className={cn('cursor-pointer rounded-md px-2 py-2', i === active && 'bg-surface-muted ring-1 ring-ring/40')}>
              <span className="flex items-center justify-between gap-2">
                <span className="text-sm font-medium text-ink">{m.name}</span>
                <span className="text-xs text-ink-muted">{m.shortcut}</span>
              </span>
              <span className="block truncate text-xs text-ink-muted">{m.body}</span>
            </li>
          ))}
        </ul>
      )}
    </div>
  )
}
