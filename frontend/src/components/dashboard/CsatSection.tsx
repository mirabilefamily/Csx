import { Link, Navigate, useSearchParams } from 'react-router-dom'
import { Settings2 } from 'lucide-react'
import type { CsatSummary } from '@/types'
import { buttonVariants } from '@/components/ui/button'
import { useAuth } from '@/components/auth/AuthContext'
import { CsatDistribution, CsatFeedback, CsatSplits, CsatTrend } from './CsatCharts'

export function CsatSection({ csat, loading }: { csat?: CsatSummary; loading: boolean }) {
  const [params] = useSearchParams()
  const { user } = useAuth()
  if (params.get('csat') === 'settings') return <Navigate to="/settings/csat" replace />
  return (
    <section aria-labelledby="csat-heading" className="space-y-4" data-testid="csat-section">
      <div className="flex flex-wrap items-end justify-between gap-4 pt-4">
        <div>
          <h2 id="csat-heading" className="text-base font-semibold text-ink md:text-lg">Customer satisfaction</h2>
          <p className="mt-1 text-sm text-ink-muted" data-testid="csat-summary">
            {loading ? 'Loading responses…' : csat?.totalResponses ? `${csat.totalResponses.toLocaleString()} responses · ${csat.average?.toFixed(2)} average` : 'No responses in this period'}
          </p>
        </div>
        {user?.role === 'admin' && (
          <Link to="/settings/csat" className={buttonVariants({ variant: 'outline' })} data-testid="csat-settings-button">
            <Settings2 aria-hidden /> CSAT settings
          </Link>
        )}
      </div>
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <CsatTrend csat={csat} loading={loading} />
        <CsatDistribution csat={csat} loading={loading} />
        <CsatSplits csat={csat} loading={loading} />
        <div className="min-w-0 lg:col-span-2">
          <CsatFeedback csat={csat} loading={loading} />
        </div>
      </div>
    </section>
  )
}
