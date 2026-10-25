import { Link, Navigate, useNavigate, useParams } from 'react-router-dom'
import { MessageCircle, Plug, ShieldOff, Sparkles, Users, type LucideIcon } from 'lucide-react'
import { settingsApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/components/auth/AuthContext'
import { useUnsavedGuard } from '@/components/UnsavedGuard'
import { EmptyState } from '@/components/States'
import { PageHeader } from '@/components/PageHeader'
import { Card } from '@/components/ui/card'
import { buttonVariants } from '@/components/ui/button'
import { IntegrationsTab } from '@/components/settings/IntegrationsTab'
import { AiTab } from '@/components/settings/AiTab'
import { UsersTab } from '@/components/settings/UsersTab'
import { WidgetSettingsTab } from '@/components/widgetSettings/WidgetSettingsTab'
import { cn } from '@/lib/utils'

const TABS: { id: string; label: string; Icon: LucideIcon; description: string }[] = [
  { id: 'integrations', label: 'Integrations', Icon: Plug, description: 'Connections to your mailbox, store, AI providers and email.' },
  { id: 'ai', label: 'AI', Icon: Sparkles, description: 'How Claude and Grokbot answer, when they escalate and when the team is in.' },
  { id: 'widget', label: 'Chat Widget', Icon: MessageCircle, description: 'How the chat widget looks and behaves on your Shopify store.' },
  { id: 'users', label: 'Users', Icon: Users, description: 'Who can sign in to the desk and what they can change.' },
]

function NoAccess() {
  return (
    <div className="space-y-8" data-testid="settings-no-access">
      <PageHeader title="Settings" />
      <Card>
        <EmptyState title="You don't have access to Settings" description="Settings are limited to admins. Ask an admin if you need something changed." icon={<ShieldOff className="h-6 w-6" aria-hidden />}
          action={<Link to="/dashboard" className={buttonVariants({ variant: 'outline' })} data-testid="no-access-back-dashboard">Back to Dashboard</Link>} testId="no-access-state" />
      </Card>
    </div>
  )
}

function TabBar({ tab }: { tab: string }) {
  const navigate = useNavigate()
  const { confirmLeave } = useUnsavedGuard()
  const { data } = useApi(() => settingsApi.listIntegrations(), [])
  const hasError = !!data?.some((i) => i.status === 'error')
  return (
    <nav aria-label="Settings sections" className="max-w-full overflow-x-auto">
      <div className="inline-flex gap-1 rounded-xl bg-surface-muted p-1">
        {TABS.map((t) => {
          const active = tab === t.id
          return (
            <Link
              key={t.id}
              to={`/settings/${t.id}`}
              aria-current={active ? 'page' : undefined}
              data-testid={`settings-tab-${t.id}`}
              onClick={(e) => { if (!active) { e.preventDefault(); confirmLeave(() => navigate(`/settings/${t.id}`)) } }}
              className={cn(
                'relative inline-flex h-9 items-center gap-2 whitespace-nowrap rounded-lg px-3.5 text-sm font-medium transition-[background-color,color,box-shadow] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring',
                active ? 'bg-surface text-ink shadow-card' : 'text-ink-muted hover:text-ink',
              )}
            >
              <t.Icon className={cn('h-4 w-4', active ? 'text-tobacco-600' : 'text-ink-subtle')} aria-hidden />
              {t.label}
              {t.id === 'integrations' && hasError && <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-label="An integration has an error" role="img" data-testid="settings-tab-integrations-alert" />}
            </Link>
          )
        })}
      </div>
    </nav>
  )
}

export default function SettingsPage() {
  const { user } = useAuth()
  const { tab } = useParams()
  if (user?.role !== 'admin') return <NoAccess />
  const current = TABS.find((t) => t.id === tab)
  if (!current) return <Navigate to="/settings/integrations" replace />

  return (
    <div className="space-y-8" data-testid="settings-page">
      <div className="space-y-6">
        <PageHeader title="Settings" description={<span data-testid="settings-tab-description">{current.description}</span>} />
        <TabBar tab={current.id} />
      </div>
      {tab === 'integrations' && <IntegrationsTab />}
      {tab === 'ai' && <AiTab />}
      {tab === 'users' && <UsersTab />}
      {tab === 'widget' && <WidgetSettingsTab />}
    </div>
  )
}
