import { useState } from 'react'
import { AlertTriangle, CheckCircle2, FlaskConical, Package, SearchX } from 'lucide-react'
import type { SandboxResult } from '@/types'
import { guidanceApi } from '@/api'
import { useDemoState } from '@/hooks/useApi'
import { Button } from '@/components/ui/button'
import { FieldError, Input, Label, Textarea } from '@/components/ui/input'
import { Card } from '@/components/ui/card'
import { Skeleton } from '@/components/ui/skeleton'
import { EmptyState, ErrorState } from '@/components/States'
import { AuthorBadge } from '@/components/AuthorBadge'
import { cn } from '@/lib/utils'
import { Num } from '@/components/Num'

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
      <div className="flex items-baseline justify-between"><span className="text-sm font-medium text-ink">Confidence</span><span className="text-3xl leading-9 text-ink" data-testid="confidence-value"><Num value={`${value}%`} /></span></div>
      <div className="relative mt-2 h-3 rounded-full bg-surface-muted" role="meter" aria-valuenow={value} aria-valuemin={0} aria-valuemax={100} aria-label="Confidence">
        <div className={cn('h-full rounded-full', value >= threshold ? 'bg-green-600' : 'bg-brass-500')} style={{ width: `${value}%` }} />
        <span className="absolute -top-1 h-5 w-0.5 bg-ink" style={{ left: `${threshold}%` }} aria-hidden />
      </div>
      <p className="mt-1 text-xs text-ink-muted">Threshold {threshold}% (Settings → AI)</p>
    </div>
  )
}

export function SandboxTab() {
  const demo = useDemoState()
  const [question, setQuestion] = useState('')
  const [order, setOrder] = useState('')
  const [error, setError] = useState<string | null>(null)
  const [state, setState] = useState<{ status: 'idle' | 'loading' | 'error' | 'done'; result?: SandboxResult }>({ status: 'idle' })

  const run = async () => {
    if (!question.trim()) return setError('Enter a customer question.')
    setError(null)
    setState({ status: 'loading' })
    try {
      setState({ status: 'done', result: await guidanceApi.runSandbox(question, order) })
    } catch {
      setState({ status: 'error' })
    }
  }
  const r = state.result
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,2fr)_minmax(0,3fr)]" data-testid="sandbox-tab">
      <Card className="space-y-4 p-5">
        <div>
          <Label htmlFor="sandbox-question">Customer question</Label>
          <Textarea id="sandbox-question" className="mt-1.5" value={question} onChange={(e) => setQuestion(e.target.value)} aria-invalid={!!error} data-testid="sandbox-question" />
          <FieldError>{error}</FieldError>
        </div>
        <div className="flex flex-wrap gap-1.5" aria-label="Example questions">
          {EXAMPLES.map(([label, q]) => <button key={label} type="button" onClick={() => setQuestion(q)} className="rounded-full border border-border-strong px-3 py-1 text-xs font-medium text-ink hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid={`sandbox-example-${label.toLowerCase()}`}>{label}</button>)}
        </div>
        <div>
          <Label htmlFor="sandbox-order">Order number (optional)</Label>
          <Input id="sandbox-order" className="mt-1.5" placeholder="#GB20398" value={order} onChange={(e) => setOrder(e.target.value)} data-testid="sandbox-order" />
        </div>
        <Button onClick={run} loading={state.status === 'loading'} data-testid="sandbox-run"><FlaskConical aria-hidden /> Run test</Button>
        {demo !== 'live' && <p className="text-xs text-ink-muted">Demo state: {demo}. Run a test to see that state.</p>}
      </Card>
      <div className="space-y-4" data-testid="sandbox-results" aria-live="polite">
        {state.status === 'idle' && <Card><EmptyState compact title="Run a test to see what the AI would do" description="Pick an example or write your own question." /></Card>}
        {state.status === 'loading' && <Card className="space-y-3 p-5" data-testid="sandbox-loading"><Skeleton className="h-6 w-40" /><Skeleton className="h-16 w-full" /><Skeleton className="h-24 w-full" /></Card>}
        {state.status === 'error' && <Card><ErrorState compact title="The sandbox didn't respond" onRetry={run} testId="sandbox-error" /></Card>}
        {state.status === 'done' && r && (
          <>
            <Card className="space-y-4 p-5">
              <Gauge value={r.confidence} threshold={r.threshold} />
              <p className={cn('flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-semibold', r.wouldEscalate ? 'bg-amber-50 text-amber-900' : 'bg-green-50 text-green-700')} data-testid="sandbox-verdict">
                {r.wouldEscalate ? <AlertTriangle className="h-4 w-4" aria-hidden /> : <CheckCircle2 className="h-4 w-4" aria-hidden />}
                {r.wouldEscalate ? 'Would escalate to Grokbot' : 'AI would handle this'}
              </p>
              {r.order && <p className="flex items-center gap-2 text-sm text-ink" data-testid="sandbox-order-context"><Package className="h-4 w-4 text-tobacco-500" aria-hidden /> Order {r.order.number} · {r.order.status.replace('_', ' ')} · {r.order.lineItems.map((l) => `${l.title} (${l.variant})`).join(', ')}</p>}
              {r.orderNotFound && <p className="text-sm text-amber-900" data-testid="sandbox-order-not-found">Order {r.orderNotFound} not found. Testing without order context.</p>}
            </Card>
            <Card className="p-5">
              <p className="text-sm font-semibold text-ink">Retrieved articles</p>
              {r.articles.length === 0 ? (
                <EmptyState compact title="No relevant articles found" icon={<SearchX className="h-5 w-5" aria-hidden />} testId="sandbox-no-articles" />
              ) : (
                <ol className="mt-3 space-y-2" data-testid="sandbox-articles">
                  {r.articles.map((a, i) => (
                    <li key={a.id} className="flex items-center gap-3" data-testid={`sandbox-article-${i}`}>
                      <span className="w-5 text-xs font-semibold text-ink-muted">{i + 1}</span>
                      <span className="min-w-0 flex-1"><span className="block truncate text-sm text-ink">{a.title}</span><span className="text-xs text-ink-muted">{a.category}</span></span>
                      <span className="text-xs font-semibold tabular-nums text-ink">{a.score}%</span>
                    </li>
                  ))}
                </ol>
              )}
            </Card>
            <Card className="space-y-2 p-5">
              <AuthorBadge type="claude" label="AI draft" />
              <p className="whitespace-pre-wrap text-sm text-ink" data-testid="sandbox-draft">{r.draft}</p>
            </Card>
          </>
        )}
      </div>
    </div>
  )
}
