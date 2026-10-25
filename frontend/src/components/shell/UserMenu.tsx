import { useNavigate } from 'react-router-dom'
import { ChevronDown, LogOut } from 'lucide-react'
import type { Role } from '@/types'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import { useAuth } from '@/components/auth/AuthContext'
import { focusRing } from '@/components/ui/button'
import { initials } from '@/lib/format'
import { cn } from '@/lib/utils'
import { toast } from 'sonner'

export function UserMenu() {
  const { user, setRole, signOut } = useAuth()
  const navigate = useNavigate()
  if (!user) return null
  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        data-testid="user-menu-trigger"
        className={cn('flex h-10 items-center gap-2 rounded-lg pl-1 pr-2 transition-colors hover:bg-surface-muted', focusRing)}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-brass-100 text-xs font-semibold text-tobacco-800" aria-hidden>
          {initials(user.name)}
        </span>
        <span className="hidden flex-col items-start leading-tight md:flex">
          <span className="whitespace-nowrap text-sm font-medium text-ink" data-testid="user-menu-name">{user.name}</span>
          <span className="text-xs capitalize text-ink-muted" data-testid="user-menu-role">{user.role}</span>
        </span>
        <span className="sr-only md:hidden">{user.name}</span>
        <ChevronDown className="h-4 w-4 text-ink-muted" aria-hidden />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="w-64" data-testid="user-menu">
        <div className="px-2.5 py-2">
          <p className="text-sm font-semibold text-ink" data-testid="user-menu-fullname">{user.name}</p>
          <p className="text-xs text-ink-muted">{user.email}</p>
        </div>
        <DropdownMenuSeparator />
        <DropdownMenuLabel>View as</DropdownMenuLabel>
        <DropdownMenuRadioGroup
          value={user.role}
          onValueChange={(v) => {
            setRole(v as Role)
            toast(`Now viewing as ${v === 'admin' ? 'Admin' : 'Agent'}`)
          }}
        >
          <DropdownMenuRadioItem value="admin" data-testid="role-toggle-admin">Admin</DropdownMenuRadioItem>
          <DropdownMenuRadioItem value="agent" data-testid="role-toggle-agent">Agent</DropdownMenuRadioItem>
        </DropdownMenuRadioGroup>
        <DropdownMenuSeparator />
        <DropdownMenuItem
          data-testid="sign-out"
          onSelect={() => {
            signOut()
            navigate('/login', { replace: true })
          }}
        >
          <LogOut aria-hidden /> Sign out
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}
