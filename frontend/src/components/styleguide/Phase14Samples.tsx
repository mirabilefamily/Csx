import { ShadowRoot } from '@/components/widget/ShadowRoot'
import { HomeView, PillInput, Thumbs } from '@/components/widget/Home'
import { widgetSettings } from '@/mocks/widget'

// Phase 14 widget pieces rendered inside the real Shadow DOM so the widget CSS applies.
export function Phase14Samples() {
  const s = widgetSettings
  return (
    <div className="max-w-[420px]" data-testid="sg-phase14">
      <ShadowRoot>
        <div className="gw-root" style={{ ['--gw-panel' as string]: s.branding.panelColor, ['--gw-accent' as string]: s.branding.colors.accent }}>
          <div className="gw-panel" style={{ position: 'relative', height: 'auto', padding: '16px 0 8px' }}>
            <div className="gw-body is-home" style={{ paddingTop: 8 }}><HomeView s={s} greeting="Good day! What brings you in?" hasLast onStarter={() => {}} onLast={() => {}} /></div>
            <div style={{ padding: '0 20px 8px' }}><p className="gw-ai-text">AI replies are plain 15px text on the panel.</p><Thumbs label="Goorin AI" /></div>
            <PillInput placeholder="Ask anything" onSend={() => {}} />
          </div>
        </div>
      </ShadowRoot>
      <p className="mt-2 text-xs text-ink-muted">Frosted panel (panel colour at 88% + 24px blur, solid fallback), 40px floating controls, starter chips, pill input, thumbs.</p>
    </div>
  )
}
