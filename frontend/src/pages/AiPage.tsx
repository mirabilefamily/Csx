import { Navigate, useParams } from 'react-router-dom'
import { FlaskConical, GitBranch, MessageSquareQuote, Route as RouteIcon, Sparkles } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthContext'
import { PageHeader } from '@/components/PageHeader'
import { PageTabs } from '@/components/PageTabs'
import { NoAccess } from '@/components/NoAccess'
import { AiTab } from '@/components/settings/AiTab'
import { BrandVoiceTab } from '@/components/ai/BrandVoiceTab'
import { ConversationTesting } from '@/components/ai/ConversationTesting'
import { WorkflowsTab } from '@/components/workflows/WorkflowsTab'
import { WorkflowEditor } from '@/components/workflows/WorkflowEditor'

const TABS = [
  { id: 'voice', label: 'Brand voice', to: '/ai/voice', Icon: MessageSquareQuote },
  { id: 'replies', label: 'AI replies', to: '/ai/replies', Icon: Sparkles },
  { id: 'workflows', label: 'Workflows', to: '/ai/workflows', Icon: GitBranch },
  { id: 'routing', label: 'Routing', to: '/ai/routing', Icon: RouteIcon },
  { id: 'testing', label: 'Conversation testing', to: '/ai/testing', Icon: FlaskConical },
]

export default function AiPage() {
  const { user } = useAuth()
  const { tab, workflowId } = useParams()
  const current = workflowId ? 'workflows' : tab
  if (user?.role !== 'admin') return <NoAccess title="AI & Workflows" testId="ai-no-access" />
  if (!TABS.some((t) => t.id === current)) return <Navigate to="/ai/voice" replace />
  return (
    <div className="space-y-6" data-testid="ai-page">
      <PageHeader title="AI & Workflows" description="How the AI sounds, what it can do on its own, and when it hands over to your team." />
      <PageTabs tabs={TABS} current={current!} label="AI & Workflows sections" testIdPrefix="ai-tab" />
      <div className="[&_#sandbox-question]:max-w-none [&_textarea]:max-w-[75ch]">
        {current === 'voice' && <BrandVoiceTab />}
        {current === 'replies' && <AiTab part="replies" />}
        {current === 'workflows' && (workflowId ? <WorkflowEditor key={workflowId} id={workflowId} /> : <WorkflowsTab />)}
        {current === 'routing' && <AiTab key="routing" part="routing" />}
        {current === 'testing' && <ConversationTesting />}
      </div>
    </div>
  )
}
