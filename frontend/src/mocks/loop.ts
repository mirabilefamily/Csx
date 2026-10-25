import type { LoopLabelStatus, LoopOutcome, LoopReturn, LoopState } from '@/types'
import { customers } from './customers'
import { daysAgo } from './time'

type ItemSeed = [title: string, variant: string, reason: string, price: number, qty?: number, exchangeFor?: string]

// Returns are built from the customer's real seeded order lines so titles, sizes and thumbnails match Shopify.
function ret(id: number, customerId: string, orderNum: number, state: LoopState, outcome: LoopOutcome, label: LoopLabelStatus, ageDays: number, items: ItemSeed[]): LoopReturn {
  const order = customers.find((c) => c.id === customerId)!.orders.find((o) => o.number === `#GB${orderNum}`)!
  const lines = items.map(([title, variant, reason, price, quantity = 1, exchangeFor], i) => ({
    sku: `LR-${id}-${i + 1}`, title, variant, reason, quantity, price, exchangeFor: exchangeFor ?? null,
    image: order.lineItems.find((li) => li.title === title)?.image ?? '/images/products/wool-fedora.jpg',
  }))
  const total = lines.reduce((s, l) => s + l.price * l.quantity, 0)
  return {
    id: String(id), customerId, orderNumber: order.number, state, outcome, returnTotal: total,
    refund: outcome === 'refund' ? total : 0,
    exchangeTotal: outcome === 'exchange' ? total : 0,
    storeCredit: outcome === 'store_credit' || outcome === 'gift_card' ? total : 0,
    items: lines, labelStatus: label, createdAt: daysAgo(ageDays), adminUrl: `https://admin.loopreturns.com/returns/${id}`,
  }
}

export const loopReturns: LoopReturn[] = [
  ret(48213, 'c01', 19790, 'closed', 'refund', 'delivered_to_warehouse', 150, [['Sage Bucket Hat', 'Olive / M', 'Too small', 58]]),
  ret(48690, 'c01', 20211, 'cancelled', 'refund', 'label_created', 26, [['Watkins Straw Panama', 'Natural / M', 'Changed mind', 128]]),
  ret(49102, 'c13', 20360, 'closed', 'refund', 'delivered_to_warehouse', 12, [['Ridgeway Felt Fedora', 'Black / M', "Didn't like the fit", 175], ['Watkins Straw Panama', 'Natural / M', 'Too big', 128]]),
  ret(49311, 'c05', 20366, 'open', 'store_credit', 'label_created', 2, [['Dulles Newsboy', 'Grey Tweed / L', 'Too big', 78]]),
  ret(48855, 'c12', 20355, 'closed', 'refund', 'delivered_to_warehouse', 16, [['Cuba Cowboy', 'Chocolate / L', 'Not as pictured', 165]]),
  ret(49401, 'c04', 20302, 'expired', 'gift_card', 'label_created', 9, [['Bushwick Flat Cap', 'Olive / M', 'Wrong color', 68]]),
  ret(49218, 'c11', 20015, 'in_review', 'exchange', 'in_transit', 30, [['Dulles Newsboy', 'Herringbone / S', 'Too small', 78, 1, 'Herringbone / M']]),
]
