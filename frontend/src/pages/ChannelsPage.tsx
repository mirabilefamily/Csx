import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { Mail, MessageCircle, MonitorDown } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthContext'
import { useUnsavedGuard } from '@/components/UnsavedGuard'
import { PageHeader } from '@/components/PageHeader'
import { PageTabs, SubTabs } from '@/components/PageTabs'
import { NoAccess } from '@/components/NoAccess'
import { WidgetSettingsTab } from '@/components/widgetSettings/WidgetSettingsTab'
import { ContactFormEditor } from '@/components/channels/ContactFormEditor'
import { EmailTab } from '@/components/channels/EmailTab'
import { ShopifyMark } from '@/components/brand/ShopifyMark'

const TABS = [
  { id: 'chat', label: 'Chat & form', to: '/channels/chat', Icon: MessageCircle },
  { id: 'email', label: 'Email', to: '/channels/email', Icon: Mail },
  { id: 'install', label: 'Installation', to: '/channels/install', Icon: MonitorDown },
]
type Kind = 'chat' | 'form'
type Panel = 'appearance' | 'preferences'

function ChatAndForm() {
  const [params, setParams] = useSearchParams()
  const { confirmLeave } = useUnsavedGuard()
  const kind: Kind = params.get('kind') === 'form' ? 'form' : 'chat'
  const panel: Panel = params.get('panel') === 'preferences' ? 'preferences' : 'appearance'
  const go = (k: Kind, p: Panel) => setParams(p === 'appearance' ? (k === 'chat' ? {} : { kind: k }) : { kind: k, panel: p }, { replace: true })
  return (
    <div className="space-y-5" data-testid="channels-chat">
      <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
        <div role="radiogroup" aria-label="Channel" className="inline-flex gap-1 rounded-full bg-surface-muted p-1">
          {([['chat', 'Chat'], ['form', 'Contact form']] as const).map(([k, l]) => (
            <button key={k} type="button" role="radio" aria-checked={kind === k} onClick={() => kind !== k && confirmLeave(() => go(k, 'appearance'))} className={`min-h-9 rounded-full px-4 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-sm:min-h-11 ${kind === k ? 'bg-[#1F1D1A] text-white' : 'text-ink-muted hover:text-ink'}`} data-testid={`channels-kind-${k}`}>{l}</button>
          ))}
        </div>
        <div className="min-w-0 flex-1">
          <SubTabs tabs={[{ id: 'appearance', label: 'Appearance' }, { id: 'preferences', label: 'Preferences' }]} value={panel} onChange={(p) => go(kind, p)} label={`${kind === 'chat' ? 'Chat' : 'Contact form'} settings`} testIdPrefix="channels-panel" />
        </div>
      </div>
      {kind === 'chat' ? <WidgetSettingsTab group={panel} /> : <ContactFormEditor panel={panel} />}
    </div>
  )
}

function Install() {
  return (
    <div className="space-y-6" data-testid="channels-install">
      <WidgetSettingsTab view="install" />
      <section className="flex flex-wrap items-start gap-4 rounded-2xl bg-surface p-6 shadow-card ring-1 ring-black/[0.04] max-sm:px-4" data-testid="install-contact-form">
        <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-white ring-1 ring-inset ring-border"><ShopifyMark size={22} /></span>
        <div className="min-w-0 flex-1">
          <h3 className="text-[15px] font-semibold text-ink">Contact form</h3>
          <p className="mt-0.5 max-w-[75ch] text-sm text-ink-muted">Add the "Goorin contact form" app block to your Contact page template in the theme editor. Submissions arrive in the Inbox as email tickets.</p>
          <ol className="mt-3 list-decimal space-y-1 pl-5 text-sm text-ink">
            <li>Online Store → Themes → Customize → Pages → Contact</li>
            <li>Add block → Apps → Goorin contact form</li>
            <li>Save. The block uses the fields from Channels → Chat & form → Contact form.</li>
          </ol>
          <p className="mt-3 inline-flex items-center gap-1.5 rounded-full bg-green-50 px-2.5 py-1 text-xs font-medium text-green-800" data-testid="install-contact-form-status"><span className="h-1.5 w-1.5 rounded-full bg-green-600" aria-hidden /> Live on /pages/contact</p>
        </div>
      </section>
    </div>
  )
}

export default function ChannelsPage() {
  const { user } = useAuth()
  const { tab } = useParams()
  if (user?.role !== 'admin') return <NoAccess title="Channels" testId="channels-no-access" />
  if (!TABS.some((t) => t.id === tab)) return <Navigate to="/channels/chat" replace />
  return (
    <div className="space-y-6" data-testid="channels-page">
      <PageHeader title="Channels" description="How customers reach you: the chat widget, contact form and email." />
      <PageTabs tabs={TABS} current={tab!} label="Channels sections" testIdPrefix="channels-tab" />
      <div className="[&_input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color])]:max-w-[480px]">
        {tab === 'chat' && <ChatAndForm />}
        {tab === 'email' && <EmailTab />}
        {tab === 'install' && <Install />}
      </div>
    </div>
  )
}
