import { Archive, Tag, UserPlus, X } from 'lucide-react'
import type { User } from '@/types'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'

interface Props {
  count: number
  users: User[]
  tags: string[]
  onAssign: (u: User) => void
  onTag: (tag: string) => void
  onClose: () => void
  onClear: () => void
}

export function BulkBar({ count, users, tags, onAssign, onTag, onClose, onClear }: Props) {
  return (
    <div className="flex flex-wrap items-center gap-2 border-b border-brass-300 bg-brass-50 px-3 py-2" role="region" aria-label="Bulk actions" data-testid="bulk-bar">
      <span className="mr-auto text-sm font-semibold text-ink" data-testid="bulk-count">{count} selected</span>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" data-testid="bulk-assign"><UserPlus aria-hidden /> Assign</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end">
          {users.map((u) => <DropdownMenuItem key={u.id} onSelect={() => onAssign(u)} data-testid={`bulk-assign-${u.id}`}>{u.name}</DropdownMenuItem>)}
        </DropdownMenuContent>
      </DropdownMenu>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button size="sm" variant="outline" data-testid="bulk-tag"><Tag aria-hidden /> Tag</Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent align="end" className="max-h-72 overflow-y-auto">
          {tags.map((t) => <DropdownMenuItem key={t} onSelect={() => onTag(t)} data-testid={`bulk-tag-${t}`}>{t}</DropdownMenuItem>)}
        </DropdownMenuContent>
      </DropdownMenu>
      <Button size="sm" variant="outline" onClick={onClose} data-testid="bulk-close"><Archive aria-hidden /> Close</Button>
      <Button size="icon-sm" variant="ghost" onClick={onClear} aria-label="Clear selection" data-testid="bulk-clear"><X aria-hidden /></Button>
    </div>
  )
}
