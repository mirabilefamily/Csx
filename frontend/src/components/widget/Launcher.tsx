import { X } from 'lucide-react'
import type { WidgetSettings } from '@/types'
import { LauncherGlyph } from './icons'
import type { Ref } from 'react'

const SIZES = { s: [48, 22], m: [56, 24], l: [64, 28] } as const

interface LauncherProps {
  settings: WidgetSettings['launcher']
  open: boolean
  unread: number
  animation: string
  buttonRef: Ref<HTMLButtonElement>
  onToggle: () => void
}

export const launcherSize = (s: WidgetSettings['launcher']) => SIZES[s.size][0]

export function Launcher({ settings, open, unread, animation, buttonRef, onToggle }: LauncherProps) {
  const [box, icon] = SIZES[settings.size]
  const pill = settings.style === 'pill' && !open
  return (
    <button
      ref={buttonRef}
      type="button"
      className={`gw-launcher${pill ? ' is-pill' : ''} ${animation}`}
      style={{ height: box, minWidth: box }}
      aria-label={pill && settings.label ? undefined : open ? 'Minimize chat' : `Open chat with Goorin Bros.${unread ? `, ${unread} unread message` : ''}`}
      aria-expanded={open}
      aria-haspopup="dialog"
      onClick={onToggle}
      data-testid="widget-launcher"
    >
      {open ? <X size={icon} aria-hidden /> : <LauncherGlyph icon={settings.icon} customUrl={settings.customIconUrl} size={icon} />}
      {pill && <span>{settings.label}</span>}
      {pill && settings.label && <span className="gw-sr">: open chat with Goorin Bros.{unread ? `, ${unread} unread message` : ''}</span>}
      {!open && unread > 0 && (
        <span className="gw-badge" aria-hidden data-testid="widget-unread-badge">
          {unread}
        </span>
      )}
    </button>
  )
}

export function GreetingBubble({ text, avatar, onOpen, onDismiss }: { text: string; avatar: string | null; onOpen: () => void; onDismiss: () => void }) {
  return (
    <div className="gw-bubble" data-testid="widget-greeting-bubble">
      <button type="button" className="gw-bubble-open" onClick={onOpen} aria-label={`Goorin Bros.: ${text} (open chat)`} data-testid="widget-greeting-open">
        {avatar ? <img className="gw-avatar" src={avatar} alt="" /> : <span className="gw-avatar">G</span>}
        <span>
          <strong>Goorin Bros.</strong>
          {text}
        </span>
      </button>
      <button type="button" className="gw-bubble-close" onClick={onDismiss} aria-label="Dismiss greeting" data-testid="widget-greeting-dismiss">
        <X size={16} aria-hidden />
      </button>
    </div>
  )
}
