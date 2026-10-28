import { Navigate, useParams, useSearchParams } from 'react-router-dom'
import { FileText, Mail, MessageCircle, MonitorDown } from 'lucide-react'
import { useAuth } from '@/components/auth/AuthContext'
import { PageHeader } from '@/components/PageHeader'
import { PageTabs } from '@/components/PageTabs'
import { NoAccess } from '@/components/NoAccess'
import { WidgetSettingsTab } from '@/components/widgetSettings/WidgetSettingsTab'
import { ContactFormEditor } from '@/components/channels/ContactFormEditor'
import { EmailTab } from '@/components/channels/EmailTab'
import { ShopifyMark } from '@/components/brand/ShopifyMark'

const TABS = [
  { id: 'chat', label: 'Chat', to: '/channels/chat', Icon: MessageCircle },
  { id: 'form', label: 'Contact form', to: '/channels/form', Icon: FileText },
  { id: 'email', label: 'Email', to: '/channels/email', Icon: Mail },
  { id: 'install', label: 'Installation', to: '/channels/install', Icon: MonitorDown },
]

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
            <li>Save. The block uses the fields from Channels → Contact form.</li>
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
  const [params] = useSearchParams()
  const legacyForm = params.get('kind') === 'form'
  if (user?.role !== 'admin') return <NoAccess title="Channels" testId="channels-no-access" />
  if (tab === 'chat' && legacyForm) return <Navigate to="/channels/form" replace />
  if (!TABS.some((t) => t.id === tab)) return <Navigate to="/channels/chat" replace />
  return (
    <div className="space-y-6" data-testid="channels-page">
      <PageHeader title="Channels" description="How customers reach you: the chat widget, contact form and email." />
      <PageTabs tabs={TABS} current={tab!} label="Channels sections" testIdPrefix="channels-tab" />
      <div className="[&_input:not([type=checkbox]):not([type=radio]):not([type=range]):not([type=color])]:max-w-[480px]">
        {tab === 'chat' && <div data-testid="channels-chat"><WidgetSettingsTab /></div>}
        {tab === 'form' && <div data-testid="channels-form"><ContactFormEditor /></div>}
        {tab === 'email' && <EmailTab />}
        {tab === 'install' && <Install />}
      </div>
    </div>
  )
}
