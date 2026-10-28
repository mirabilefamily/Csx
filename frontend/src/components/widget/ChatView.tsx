import { useEffect, useRef, useState } from 'react'
import { ArrowUp, RotateCw } from 'lucide-react'
import type { RunOrder, WidgetOrderCard, WidgetSettings } from '@/types'
import { usd } from '@/lib/format'

import { Thumbs } from './Home'
export interface ChatMsg {
  id: string
  author: 'customer' | 'ai' | 'agent' | 'system'
  text: string
  at: number
  order?: WidgetOrderCard
  runOrders?: RunOrder[]
  link?: { label: string; url: string }
  kind?: 'greeting' | 'handoff'
  failed?: boolean
}

const time = (at: number) => new Date(at).toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
const STATUS: Record<WidgetOrderCard['status'], string> = { unfulfilled: 'Preparing', in_transit: 'In transit', delivered: 'Delivered', returned: 'Returned', cancelled: 'Cancelled' }

export function OrderCard({ order }: { order: WidgetOrderCard }) {
  const eta = order.eta && new Date(order.eta).toLocaleDateString('en-US', { weekday: 'long', month: 'short', day: 'numeric' })
  return (
    <div className="gw-order" data-testid="widget-order-card">
      <img src={order.image} alt={order.productTitle} width={72} height={72} />
      <div className="gw-order-info">
        <span className="gw-order-num" data-testid="widget-order-number">Order {order.number}</span>
        <span className={`gw-status${order.status === 'in_transit' ? ' is-transit' : ''}`} data-testid="widget-order-status">{STATUS[order.status]}</span>
        <span className="gw-order-title">{order.productTitle} · {order.variant}</span>
        {eta && <span className="gw-meta" style={{ padding: 0 }}>Arrives by {eta}</span>}
        {order.trackingUrl ? (
          <a className="gw-link" href={order.trackingUrl} target="_blank" rel="noreferrer" data-testid="widget-order-tracking">
            Track with {order.carrier}
          </a>
        ) : (
          <span className="gw-meta" style={{ padding: 0 }}>Tracking appears once it ships</span>
        )}
      </div>
    </div>
  )
}

function Avatar({ author, settings }: { author: ChatMsg['author']; settings: WidgetSettings }) {
  const url = author === 'agent' ? settings.branding.agentAvatarUrl : settings.branding.aiAvatarUrl
  if (url) return <img className="gw-avatar" src={url} alt="" />
  return <span className="gw-avatar" aria-hidden>{author === 'agent' ? 'S' : 'G'}</span>
}

interface ListProps {
  messages: ChatMsg[]
  settings: WidgetSettings
  typing: boolean
  onChip: (text: string) => void
  onRetry: (msg: ChatMsg) => void
}

export function MessageList({ messages, settings, typing, onChip, onRetry }: ListProps) {
  const endRef = useRef<HTMLDivElement>(null)
  useEffect(() => {
    const scroller = endRef.current?.parentElement
    if (scroller) scroller.scrollTop = scroller.scrollHeight
  }, [messages.length, typing])
  return (
    <>
      {messages.map((m) => {
        if (m.author === 'system') return <p key={m.id} className="gw-system">{m.text}</p>
        if (m.kind === 'handoff')
          return (
            <div key={m.id} className="gw-handoff" data-testid="widget-handoff">
              <span className="gw-handoff-dot" aria-hidden />
              <div>
                <strong>{settings.messaging.handoffMessage}</strong>
                <span data-testid="widget-handoff-time">{settings.messaging.handoffResponseTime}</span>
              </div>
            </div>
          )
        const who = m.author === 'customer' ? 'You' : m.author === 'agent' ? 'Goorin team' : settings.conversation.botName
        return (
          <div key={m.id}>
            <div className={`gw-msg is-${m.author}`} data-testid={`widget-msg-${m.author}`}>
              <div className="gw-msg-col">
                <p className={m.author === 'customer' ? 'gw-bubble-text' : 'gw-ai-text'}>{m.text}</p>
                {m.link && <a href={m.link.url} target="_blank" rel="noreferrer" style={{ fontSize: 13, fontWeight: 600, textDecoration: 'underline', minHeight: 24, display: 'inline-block' }} data-testid="widget-run-link">{m.link.label}</a>}
                {m.runOrders?.map((o) => (
                  <div key={o.number} className="gw-order-card" data-testid={`widget-run-order-${o.number.replace('#', '')}`}>
                    <strong>{o.number} · {usd(o.total)}</strong>
                    <span>{o.date} · {o.items}</span>
                    <span>{o.status}</span>
                    {o.trackingUrl && <a className="gw-link" href={o.trackingUrl} target="_blank" rel="noreferrer">Track package</a>}
                  </div>
                ))}
                {m.order && <OrderCard order={m.order} />}
                {m.author === 'customer' ? <span className="gw-sr">{who} · {time(m.at)}</span> : <span className="gw-sr">{who}</span>}
                {m.author === 'ai' && m.kind !== 'greeting' && settings.conversation.thumbs && <Thumbs label={settings.conversation.botName} />}
                {m.failed && (
                  <button type="button" className="gw-text-btn" onClick={() => onRetry(m)} data-testid="widget-retry">
                    <RotateCw size={12} aria-hidden style={{ display: 'inline', marginRight: 4 }} />
                    Couldn't send. Retry
                  </button>
                )}
              </div>
            </div>
            {false && m.kind === 'greeting' && settings.messaging.quickReplies.length > 0 && (
              <div className="gw-chips" role="group" aria-label="Quick replies" style={{ marginTop: 10 }} data-testid="widget-quick-replies">
                {settings.messaging.quickReplies.map((q) => (
                  <button key={q} type="button" className="gw-chip" disabled={typing} onClick={() => onChip(q)} data-testid={`widget-chip-${q.toLowerCase().replace(/\s+/g, '-')}`}>
                    {q}
                  </button>
                ))}
              </div>
            )}
          </div>
        )
      })}
      {typing && (
        <div className="gw-msg is-ai" data-testid="widget-typing">
          <span className="gw-typing" role="img" aria-label="Goorin assistant is typing">
            <i />
            <i />
            <i />
          </span>
        </div>
      )}
      <div ref={endRef} />
    </>
  )
}

export function Composer({ disabled, onSend }: { disabled: boolean; onSend: (text: string) => void }) {
  const [text, setText] = useState('')
  const send = () => {
    if (!text.trim() || disabled) return
    onSend(text.trim())
    setText('')
  }
  return (
    <div className="gw-composer">
      <label className="gw-sr" htmlFor="gw-composer-input">Message</label>
      <textarea
        id="gw-composer-input"
        rows={1}
        value={text}
        placeholder="Write a message…"
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => {
          if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            send()
          }
        }}
        data-autofocus=""
        data-testid="widget-composer-input"
      />
      <button type="button" className="gw-send" disabled={!text.trim() || disabled} onClick={send} aria-label="Send message" data-testid="widget-send">
        <ArrowUp size={18} aria-hidden />
      </button>
    </div>
  )
}
