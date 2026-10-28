import { useState } from 'react'
import type { DateRange } from '@/types'
import { useDemoState } from '@/hooks/useApi'
import { Panel, PillTabs } from './Panel'
import { RefundsPanel } from './RefundsPanel'
import { FraudPanel } from './FraudPanel'

// "Refunds & fraud" (REQ-763): one card, two tabs; both stay mounted so counts and sheets keep working.
export function RefundsFraudCard({ range, refreshKey, onReviewed }: { range: DateRange; refreshKey: number; onReviewed: () => void }) {
  const [tab, setTab] = useState<'refunds' | 'fraud'>(() => (window.location.hash === '#fraud' ? 'fraud' : 'refunds'))
  const [open, setOpen] = useState<number | null>(null)
  const demo = useDemoState()
  return (
    <Panel
      title="Refunds & fraud"
      description={tab === 'refunds' ? 'Refunds recorded in range' : 'Open fraud flags, all dates'}
      testId="refunds-fraud-card"
      action={<PillTabs tabs={[{ id: 'refunds', label: 'Refunds' }, { id: 'fraud', label: `Fraud alerts${open !== null && demo !== 'loading' ? ` (${open} open)` : ''}` }]} value={tab} onChange={setTab} label="Refunds and fraud" testId="rf-tab" />}
    >
      <div role="tabpanel" aria-labelledby="rf-tab-refunds" className={tab === 'refunds' ? 'flex flex-1 flex-col' : 'hidden'}><RefundsPanel range={range} refreshKey={refreshKey} bare /></div>
      <div role="tabpanel" aria-labelledby="rf-tab-fraud" className={tab === 'fraud' ? 'flex flex-1 flex-col' : 'hidden'}><FraudPanel onReviewed={onReviewed} bare onCount={setOpen} /></div>
    </Panel>
  )
}
