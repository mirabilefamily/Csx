import { useEffect, useRef, useState } from 'react'
import { useLocation } from 'react-router-dom'
import { AlertTriangle, CheckCircle2, Package, RotateCcw, SearchX, Send, Sparkles } from 'lucide-react'
import type { BrandVoice, TestTurn } from '@/types'
import { aiApi } from '@/api'
import { useDemoState } from '@/hooks/useApi'
import { Button } from '@/components/ui/button'
import { FieldError, Input, Label, Textarea } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState } from '@/components/States'
import { AuthorBadge } from '@/components/AuthorBadge'
import { Num } from '@/components/Num'
import { cn } from '@/lib/utils'

const EXAMPLES: [string, string][] = [
  ['Sizing', "My head measures 22.5 inches. Which size fedora should I order if I'm between sizes?"],
  ['Tracking', 'Where is my order? The tracking number has not updated in three days.'],
  ['Returns', 'How do I return a hat I bought last week? It does not fit.'],
  ['Damaged', 'My fedora arrived crushed with a dent in the brim. Can you send a replacement?'],
  ['Wholesale', 'We run a boutique and want to stock your hats. What are your wholesale terms?'],
]

function Gauge({ value, threshold }: { value: number; threshold: number }) {
  return (
    <div data-testid="confidence-gauge">
      <div className="flex items-baseline justify-between"><span className="text-xs font-medium text-ink-muted">Confidence</span><span className="text-xl text-ink" data-testid="confidence-value"><Num value={`${value}%`} /></span></div>
      <div className="relative mt-1.5 h-2 rounded-full bg-surface-muted" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label="Confidence">
        <div className={cn('h-full rounded-full', value >= threshold ? 'bg-green-600' : 'bg-brass-500')} style={{ width: `${value}%` }} />
        <span className="absolute -top-1 h-4 w-0.5 bg-ink" style={{ left: `${threshold}%` }} aria-hidden />
      </div>
      <p className="mt-1 text-xs text-ink-muted">Threshold {threshold}% (AI replies)</p>
    </div>
  )
}

// Per-turn analysis: verdict, gauge, order context and retrieved articles.
function TurnInsight({ turn, index }: { turn: TestTurn; index: number }) {
  const r = turn.result!
  return (
    <div className="mt-2 space-y-3 rounded-xl bg-surface-sunken p-3" data-testid={`test-turn-insight-${index}`}>
      <p className={cn('flex items-center gap-2 rounded-lg px-2.5 py-1.5 text-xs font-semibold', r.wouldEscalate ? 'bg-amber-50 text-amber-900' : 'bg-green-50 text-green-700')} data-testid="sandbox-verdict">
        {r.wouldEscalate ? <AlertTriangle className="h-3.5 w-3.5" aria-hidden /> : <CheckCircle2 className="h-3.5 w-3.5" aria-hidden />}
        {r.wouldEscalate ? 'Would escalate to Grokbot' : 'Claude would handle this'}
      </p>
      <Gauge value={r.confidence} threshold={r.threshold} />
      {r.order && <p className="flex items-center gap-2 text-xs text-ink" data-testid="sandbox-order-context"><Package className="h-3.5 w-3.5 text-tobacco-500" aria-hidden /> Order {r.order.number} · {r.order.status.replace('_', ' ')}</p>}
      {r.orderNotFound && <p className="text-xs text-amber-900" data-testid="sandbox-order-not-found">Order {r.orderNotFound} not found. Testing without order context.</p>}
      {r.articles.length === 0 ? (
        <p className="flex items-center gap-1.5 text-xs text-ink-muted" data-testid="sandbox-no-articles"><SearchX className="h-3.5 w-3.5" aria-hidden /> No relevant articles found</p>
      ) : (
        <ol className="space-y-1" data-testid="sandbox-articles">
          {r.articles.map((a, i) => (
            <li key={a.id} className="flex items-center gap-2 text-xs" data-testid={`sandbox-article-${i}`}>
              <span className="w-4 font-semibold text-ink-muted">{i + 1}</span>
              <span className="min-w-0 flex-1 truncate text-ink">{a.title}</span>
              <span className="font-semibold tabular-nums text-ink">{a.score}%</span>
            </li>
          ))}
        </ol>
      )}
    </div>
  )
}

export function ConversationTesting() {
  const demo = useDemoState()
  const { state } = useLocation() as { state: { voice?: BrandVoice } | null }
  const draftVoice = state?.voice
  const [channel, setChannel] = useState<'email' | 'chat'>('chat')
  const [order, setOrder] = useState('')
  const [message, setMessage] = useState('')
  const [turns, setTurns] = useState<TestTurn[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'error'>('idle')
  const [error, setError] = useState<string | null>(null)
  const end = useRef<HTMLDivElement>(null)
  useEffect(() => { end.current?.scrollIntoView?.({ block: 'nearest' }) }, [turns, status])

  const send = async (text = message) => {
    if (!text.trim()) return setError('Type a customer message.')
    setError(null)
    const history = turns
    setTurns([...history, { role: 'customer', text }])
    setMessage('')
    setStatus('loading')
    try {
      const reply = await aiApi.testConversation({ history, message: text, channel, orderNumber: order, voice: draftVoice })
      setTurns((t) => [...t, reply])
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }
  const reset = () => { setTurns([]); setStatus('idle'); setError(null) }

  return (
    <div className="grid gap-4 lg:grid-cols-[320px_minmax(0,1fr)] 2xl:grid-cols-[360px_minmax(0,1fr)]" data-testid="sandbox-tab">
      <Card className="space-y-5 self-start p-5">
        <div>
          <p className="text-sm font-medium text-ink" id="test-channel-label">Channel</p>
          <div role="radiogroup" aria-labelledby="test-channel-label" className="mt-1.5 inline-flex gap-1 rounded-lg bg-surface-muted p-1">
            {(['chat', 'email'] as const).map((c) => (
              <button key={c} type="button" role="radio" aria-checked={channel === c} onClick={() => setChannel(c)} className={cn('h-9 rounded-md px-3 text-sm capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-sm:h-11', channel === c ? 'bg-surface font-medium text-ink shadow-card' : 'text-ink-muted hover:text-ink')} data-testid={`test-channel-${c}`}>{c}</button>
            ))}
          </div>
        </div>
        <div>
          <Label htmlFor="sandbox-order">Order number (optional)</Label>
          <Input id="sandbox-order" className="mt-1.5" placeholder="#GB20398" value={order} onChange={(e) => setOrder(e.target.value)} data-testid="sandbox-order" />
        </div>
        <div>
          <p className="text-sm font-medium text-ink">Start from an example</p>
          <div className="mt-1.5 flex flex-wrap gap-1.5" aria-label="Example questions">
            {EXAMPLES.map(([label, q]) => <button key={label} type="button" onClick={() => setMessage(q)} className="min-h-9 rounded-full border border-border-strong px-3 text-xs font-medium text-ink hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring max-sm:min-h-11" data-testid={`sandbox-example-${label.toLowerCase()}`}>{label}</button>)}
          </div>
        </div>
        <p className="rounded-lg bg-tobacco-50 px-3 py-2 text-xs text-tobacco-800" data-testid="test-voice-source">
          <Sparkles className="mr-1 inline h-3.5 w-3.5" aria-hidden />
          {draftVoice ? 'Using your unsaved brand voice draft.' : 'Using the saved brand voice.'}
        </p>
        <Button variant="outline" className="w-full" onClick={reset} disabled={!turns.length} data-testid="test-reset"><RotateCcw aria-hidden /> Reset conversation</Button>
        {demo !== 'live' && <p className="text-xs text-ink-muted">Demo state: {demo}. Send a message to see that state.</p>}
      </Card>
      <Card className="flex min-h-[560px] flex-col overflow-hidden" data-testid="sandbox-results">
        <div className="flex-1 space-y-4 overflow-y-auto p-5" aria-live="polite" data-testid="test-thread">
          {turns.length === 0 && status === 'idle' && <EmptyState compact title="Chat with Claude as a customer" description="Each reply shows the articles it used, how confident it was and whether it would escalate." testId="test-empty" />}
          {turns.map((t, i) =>
            t.role === 'customer' ? (
              <div key={i} className="flex justify-start" data-testid={`test-turn-${i}`}>
                <div className="max-w-[min(560px,85%)] rounded-2xl rounded-tl-md bg-surface-muted px-4 py-2.5 text-sm text-ink">{t.text}</div>
              </div>
            ) : (
              <div key={i} className="flex justify-end" data-testid={`test-turn-${i}`}>
                <div className="w-full max-w-[min(560px,85%)]">
                  <div className="rounded-2xl rounded-tr-md bg-[#F6EFE6] px-4 py-3 ring-1 ring-tobacco-100">
                    <AuthorBadge type="claude" label="Claude" />
                    <p className="mt-1.5 whitespace-pre-wrap text-sm text-ink" data-testid="sandbox-draft">{t.text}</p>
                  </div>
                  <TurnInsight turn={t} index={i} />
                </div>
              </div>
            ),
          )}
          {status === 'loading' && <div className="ml-auto w-full max-w-[min(560px,85%)] space-y-2" data-testid="sandbox-loading"><Skeleton className="h-16 w-full rounded-2xl" /><Skeleton className="h-24 w-full rounded-xl" /></div>}
          {status === 'error' && <ErrorState compact title="Claude didn't respond" onRetry={() => { const last = turns[turns.length - 1]; setTurns(turns.slice(0, -1)); send(last.text) }} testId="sandbox-error" />}
          <div ref={end} />
        </div>
        <form onSubmit={(e) => { e.preventDefault(); send() }} className="border-t border-border p-3">
          <Label htmlFor="sandbox-question" className="sr-only">Customer message</Label>
          <div className="flex items-end gap-2">
            <Textarea id="sandbox-question" rows={2} className="min-h-[48px] flex-1 resize-none" placeholder={turns.length ? 'Reply as the customer…' : 'Type what the customer says…'} value={message} onChange={(e) => setMessage(e.target.value)} onKeyDown={(e) => { if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() } }} aria-invalid={!!error} data-testid="sandbox-question" />
            <Button type="submit" loading={status === 'loading'} data-testid="sandbox-run"><Send aria-hidden /> Send</Button>
          </div>
          <FieldError>{error}</FieldError>
        </form>
      </Card>
    </div>
  )
}
