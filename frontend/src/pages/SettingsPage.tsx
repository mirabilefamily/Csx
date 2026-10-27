import { Navigate, useLocation, useParams } from 'react-router-dom'
import { Plug, Star, UserRound, Users } from 'lucide-react'
import { settingsApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import { useAuth } from '@/components/auth/AuthContext'
import { PageHeader } from '@/components/PageHeader'
import { PageTabs } from '@/components/PageTabs'
import { NoAccess } from '@/components/NoAccess'
import { IntegrationsTab } from '@/components/settings/IntegrationsTab'
import { IntegrationDetail } from '@/components/settings/IntegrationDetail'
import { UsersTab } from '@/components/settings/UsersTab'
import { AccountTab } from '@/components/settings/AccountTab'
import { CsatTab } from '@/components/settings/CsatTab'

const TABS = [
  { id: 'account', label: 'Account', Icon: UserRound },
  { id: 'users', label: 'Users', Icon: Users },
  { id: 'integrations', label: 'Integrations', Icon: Plug },
  { id: 'csat', label: 'CSAT', Icon: Star },
]

function Tabs({ tab }: { tab: string }) {
  const { data } = useApi(() => settingsApi.listIntegrations(), [])
  const attention = !!data?.some((i) => i.attention || i.status === 'error')
  const tabs = TABS.map((t) => ({
    ...t,
    to: `/settings/${t.id}`,
    extra: t.id === 'integrations' && attention ? <span className="h-1.5 w-1.5 rounded-full bg-amber-500" aria-label="An integration needs attention" role="img" data-testid="settings-tab-integrations-alert" /> : undefined,
  }))
  return <PageTabs tabs={tabs} current={tab} label="Settings sections" testIdPrefix="settings-tab" />
}

export default function SettingsPage() {
  const { user } = useAuth()
  const params = useParams()
  const { hash } = useLocation()
  const tab = params.integrationId ? 'integrations' : params.tab
  if (user?.role !== 'admin') return <NoAccess title="Settings" />
  if (tab === 'widget') return <Navigate to={hash === '#install' ? '/channels/install' : '/channels/chat'} replace />
  if (tab === 'ai') return <Navigate to="/ai/replies" replace />
  if (params.integrationId === 'shopify' && params.sub) return <Navigate to={params.sub === 'install' ? '/channels/install' : '/channels/chat'} replace />
  if (!TABS.some((t) => t.id === tab)) return <Navigate to="/settings/integrations" replace />

  return (
    <div className="space-y-8 [&_input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color])]:max-w-[480px] [&_button[role=combobox]]:max-w-[480px]" data-testid="settings-page">
      <div className="space-y-6">
        <PageHeader title="Settings" description={<span data-testid="settings-tab-description">Technical credentials for your mailbox, store, AI providers and email. Day-to-day controls live in Channels and AI & Workflows.</span>} />
        <Tabs tab={tab!} />
      </div>
      {tab === 'integrations' && (params.integrationId ? <IntegrationDetail id={params.integrationId} sub={params.sub} /> : <IntegrationsTab />)}
      {tab === 'account' && <AccountTab />}
      {tab === 'users' && <UsersTab />}
      {tab === 'csat' && <CsatTab />}
    </div>
  )
}
