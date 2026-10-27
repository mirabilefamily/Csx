import { Navigate, useParams } from 'react-router-dom'
import { FlaskConical, GitBranch, MessageSquareQuote, Sparkles } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthContext'
import { PageHeader } from '@/components/PageHeader'
import { PageTabs } from '@/components/PageTabs'
import { NoAccess } from '@/components/NoAccess'
import { AiTab } from '@/components/settings/AiTab'
import { BrandVoiceTab } from '@/components/ai/BrandVoiceTab'
import { ConversationTesting } from '@/components/ai/ConversationTesting'

const TABS = [
  { id: 'voice', label: 'Brand voice', to: '/ai/voice', Icon: MessageSquareQuote },
  { id: 'replies', label: 'AI replies', to: '/ai/replies', Icon: Sparkles },
  { id: 'workflows', label: 'Workflows', to: '/ai/workflows', Icon: GitBranch },
  { id: 'testing', label: 'Conversation testing', to: '/ai/testing', Icon: FlaskConical },
]

export default function AiPage() {
  const { user } = useAuth()
  const { tab } = useParams()
  if (user?.role !== 'admin') return <NoAccess title="AI & Workflows" testId="ai-no-access" />
  if (!TABS.some((t) => t.id === tab)) return <Navigate to="/ai/voice" replace />
  return (
    <div className="space-y-6" data-testid="ai-page">
      <PageHeader title="AI & Workflows" description="How Claude sounds, decides and escalates when it replies to customers." />
      <PageTabs tabs={TABS} current={tab!} label="AI & Workflows sections" testIdPrefix="ai-tab" />
      <div className="[&_input:not([type=checkbox]):not([type=radio]):not([type=range])]:max-w-[480px] [&_#sandbox-question]:max-w-none [&_textarea]:max-w-[75ch]">
        {tab === 'voice' && <BrandVoiceTab />}
        {tab === 'replies' && <AiTab part="replies" />}
        {tab === 'workflows' && <AiTab key="wf" part="workflows" />}
        {tab === 'testing' && <ConversationTesting />}
      </div>
    </div>
  )
}
