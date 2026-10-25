import { ChevronDown, Sparkles } from 'lucide-react'
import type { WidgetSettings } from '@/types'

export function PanelHeader({ settings, titleId, onMinimize }: { settings: WidgetSettings; titleId: string; onMinimize: () => void }) {
  const { messaging, branding } = settings
  return (
    <div className="gw-header" data-testid="widget-header">
      {branding.logoUrl ? <img className="gw-header-logo" src={branding.logoUrl} alt="Goorin Bros. logo" data-testid="widget-logo" /> : null}
      <div className="gw-header-text">
        <h2 className="gw-title" id={titleId} data-testid="widget-title">{messaging.headerTitle}</h2>
        <p className="gw-subtitle" data-testid="widget-subtitle">{messaging.headerSubtitle}</p>
        <p className="gw-disclosure" data-testid="widget-ai-disclosure">
          <Sparkles size={12} aria-hidden />
          {messaging.aiDisclosure}
        </p>
      </div>
      <div className="gw-header-actions">
        <button type="button" className="gw-icon-btn" onClick={onMinimize} aria-label="Minimize chat" data-testid="widget-minimize">
          <ChevronDown size={20} aria-hidden />
        </button>
      </div>
    </div>
  )
}
