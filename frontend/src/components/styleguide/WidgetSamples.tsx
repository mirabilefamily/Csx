import type { ReactNode } from 'react'
import type { CsatStyle, WidgetSettings, WidgetState } from '@/types'
import { widgetApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import { SupportWidget } from '@/components/widget/SupportWidget'
import { Skeleton } from '@/components/ui/skeleton'
import { ErrorState } from '@/components/States'
import { Specimen } from './SgSection'

type Launcher = WidgetSettings['launcher']
const LAUNCHERS: [string, Partial<Launcher>][] = [
  ['Circle · S', { style: 'circle', size: 's' }],
  ['Circle · M', { style: 'circle', size: 'm' }],
  ['Circle · L', { style: 'circle', size: 'l' }],
  ['Pill · S', { style: 'pill', size: 's', label: 'Chat with us' }],
  ['Pill · M', { style: 'pill', size: 'm', label: 'Chat with us' }],
  ['Pill · L', { style: 'pill', size: 'l', label: 'Chat with us' }],
]
const PANELS: [string, WidgetState, { csat?: CsatStyle; typing?: boolean }?][] = [
  ['Greeting bubble', 'greeting_bubble'],
  ['Header, customer + AI bubbles, quick replies, order card', 'active_chat'],
  ['Typing indicator', 'active_chat', { typing: true }],
  ['Handoff + agent bubble', 'handoff'],
  ['Offline form', 'offline'],
  ['Inline CSAT · stars', 'csat', { csat: 'stars' }],
  ['Inline CSAT · emoji', 'csat', { csat: 'emoji' }],
  ['Inline CSAT · numeric', 'csat', { csat: 'numeric' }],
  ['Transcript confirmation', 'transcript_sent'],
]

function Stage({ label, height, children }: { label: string; height: number; children: ReactNode }) {
  return (
    <Specimen label={label}>
      <div className="relative overflow-hidden rounded-xl bg-[#FBF8F3] ring-1 ring-border" style={{ height, fontFamily: 'Georgia, serif' }}>{children}</div>
    </Specimen>
  )
}

// Every widget component, rendered through the real SupportWidget (Shadow DOM, contained mode).
export function WidgetSamples() {
  const { data, error, reload } = useApi(() => widgetApi.getWidgetSettings(), [])
  if (error) return <ErrorState compact title="Widget settings didn't load" onRetry={reload} testId="sg-widget-error" />
  if (!data) return <Skeleton className="h-[420px] w-full rounded-xl" />
  const s = data
  return (
    <div className="space-y-8" data-testid="sg-widget-samples">
      <div className="grid gap-4 sm:grid-cols-3">
        {LAUNCHERS.map(([label, l]) => (
          <Stage key={label} label={`Launcher · ${label}`} height={112}>
            <SupportWidget settings={{ ...s, launcher: { ...s.launcher, ...l } }} mode="contained" viewport="desktop" forcedState="launcher_closed" pageType="product" pagePath="/products/hampton-wool-fedora" />
          </Stage>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        {PANELS.map(([label, state, o]) => (
          <Stage key={label} label={label} height={state === 'greeting_bubble' ? 260 : 620}>
            <SupportWidget settings={{ ...s, csat: { ...s.csat, style: o?.csat ?? s.csat.style } }} mode="contained" viewport="desktop" forcedState={state} typing={o?.typing} pageType="product" pagePath="/products/hampton-wool-fedora" />
          </Stage>
        ))}
      </div>
    </div>
  )
}
