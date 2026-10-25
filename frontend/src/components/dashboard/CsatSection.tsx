import { useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { Settings2 } from 'lucide-react'
import type { CsatSummary } from '@/types'
import { Button } from '@/components/ui/button'
import { CsatSettingsDrawer } from '@/components/csat/CsatSettingsDrawer'
import { CsatDistribution, CsatFeedback, CsatSplits, CsatTrend } from './CsatCharts'

export function CsatSection({ csat, loading }: { csat?: CsatSummary; loading: boolean }) {
  const [params, setParams] = useSearchParams()
  const navigate = useNavigate()
  const [open, setOpenState] = useState(() => params.get('csat') === 'settings')
  const setOpen = (o: boolean) => {
    setOpenState(o)
    const back = params.get('return')
    if (!o && back?.startsWith('/settings/')) navigate(back)
    else if (!o && params.has('csat')) setParams((p) => { p.delete('csat'); return p }, { replace: true })
  }
  return (
    <section aria-labelledby="csat-heading" className="space-y-4" data-testid="csat-section">
      <div className="flex flex-wrap items-end justify-between gap-4 pt-4">
        <div>
          <h2 id="csat-heading" className="text-base font-semibold text-ink md:text-lg">Customer satisfaction</h2>
          <p className="mt-1 text-sm text-ink-muted" data-testid="csat-summary">
            {loading ? 'Loading responses…' : csat?.totalResponses ? `${csat.totalResponses.toLocaleString()} responses · ${csat.average?.toFixed(2)} average` : 'No responses in this period'}
          </p>
        </div>
        <Button variant="outline" onClick={() => setOpen(true)} data-testid="csat-settings-button">
          <Settings2 aria-hidden /> CSAT settings
        </Button>
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CsatTrend csat={csat} loading={loading} />
        <CsatDistribution csat={csat} loading={loading} />
        <CsatSplits csat={csat} loading={loading} />
        <div className="min-w-0 lg:col-span-2">
          <CsatFeedback csat={csat} loading={loading} />
        </div>
      </div>
      <CsatSettingsDrawer open={open} onOpenChange={setOpen} />
    </section>
  )
}
