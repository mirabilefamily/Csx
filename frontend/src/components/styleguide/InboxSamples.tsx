import type { AIDraft, Message } from '@/types'
import { DraftCard } from '@/components/inbox/DraftCard'
import { EscalationChip } from '@/components/inbox/EscalationChip'
import { MessageItem } from '@/components/inbox/MessageItem'
import { Composer } from '@/components/inbox/Composer'
import { Card } from '@/components/ui/card'
import { Specimen } from './SgSection'

const now = new Date().toISOString()
const TITLES = { 'g-1': 'Hat sizing guide', 'g-2': 'Returns & exchanges' }
const draft = (id: string, tier: AIDraft['tier'], confidence: number, body: string): AIDraft => ({ id, ticketId: 'GB-1076', tier, confidence, body, guidanceIds: ['g-1', 'g-2'], createdAt: now })
const DRAFTS = [
  draft('sg-claude-high', 'claude', 0.92, 'Hi Maya, a 22.5" head is a Medium in our fedoras. If you are between sizes, go up and use the sizing tape we include.'),
  draft('sg-claude-low', 'claude', 0.58, 'Hi Maya, I think a Medium should fit, but I am not fully sure about this style.'),
  draft('sg-grok-high', 'grokbot', 0.88, 'Hi Maya, I checked your order. We can swap it for a Large at no cost. A prepaid label is on its way.'),
  draft('sg-grok-low', 'grokbot', 0.41, 'Hi Maya, I could not confirm the exchange window for this order.'),
]
const NOTE: Message = { id: 'sg-note', ticketId: 'GB-1076', authorType: 'agent', authorName: 'Ava Martinez', body: 'Customer is a repeat buyer. OK to waive the exchange shipping.', createdAt: now, isInternal: true }
const noop = () => undefined

// Inbox building blocks rendered with the real components and sample data.
export function InboxSamples() {
  return (
    <div className="space-y-8">
      <Specimen label="AI draft card · Claude and Grokbot · high and low confidence">
        <ul className="grid gap-4 lg:grid-cols-2">
          {DRAFTS.map((d) => <DraftCard key={d.id} draft={d} titles={TITLES} editing={false} busy={false} onApprove={noop} onEdit={noop} onDiscard={noop} />)}
        </ul>
      </Specimen>
      <div className="grid gap-8 lg:grid-cols-2">
        <Specimen label="Escalation timeline chip (hover a step for the reason)">
          <EscalationChip steps={[{ key: 'claude', label: 'Claude', reason: 'Confidence 58%, below the 75% threshold' }, { key: 'grokbot', label: 'Grokbot', reason: 'Refund over $150' }, { key: 'human', label: 'Human', reason: 'Assigned to Sam Okafor' }]} />
        </Specimen>
        <Specimen label="Internal note">
          <ul><MessageItem m={NOTE} /></ul>
        </Specimen>
      </div>
      <Specimen label="Composer · reply / internal note, formatting, macros">
        <Card className="overflow-hidden p-4">
          <Composer macros={[]} fill={(t) => t} onSend={async () => true} onDraftChange={noop} />
        </Card>
      </Specimen>
    </div>
  )
}
