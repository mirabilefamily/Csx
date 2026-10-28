import { tidy } from '@/lib/workflowGraph'
import type { Edge, Step, StepConfig, StepType, Trigger, Workflow, WorkflowTemplate } from '@/types'

let n = 0
const s = (id: string, type: StepType, config: StepConfig = {}): Step => ({ id, type, config, position: { x: 0, y: 0 } })
const e = (source: string, target: string, sourceHandle = 'next'): Edge => ({ id: `e-${source}-${sourceHandle}-${target}-${n++}`, source, sourceHandle, target })
const chain = (ids: string[]) => ids.slice(1).map((t, i) => e(ids[i], t))
const ALL: Trigger['channels'] = ['chat', 'form', 'email']

// Order tracking (REQ-746/747): code steps only on chat.
export function orderTracking(): Pick<Workflow, 'name' | 'description' | 'trigger' | 'steps' | 'edges'> {
  return {
    name: 'Order tracking',
    description: 'Verifies the customer by email code, then shows their latest orders and tracking.',
    trigger: { intent: 'Order status', phrases: ['where is my order', 'tracking number', 'has my order shipped'], channels: ALL, quickReply: 'Track my order' },
    steps: [
      s('ot-1', 'message', { text: 'Happy to help you track your order.' }),
      s('ot-2', 'ask', { text: 'What email did you use for your order?', kind: 'email', variable: 'email', validation: "That doesn't look like an email address." }),
      s('ot-3', 'condition', { condVar: 'channel', op: 'is', condValue: 'chat', yesLabel: 'Channel is Chat', noLabel: 'Email or Contact form' }),
      s('ot-4', 'send_code', { text: "We've sent a 6-digit code to {{email}}. It expires in 10 minutes." }),
      s('ot-5', 'check_code', { attempts: 3, wrongText: "That code didn't match. {{tries_left_text}}" }),
      s('ot-6', 'handover', { team: 'Support', tag: 'verification-failed', note: 'Customer failed email verification 3 times.' }),
      s('ot-7', 'find_orders', { variable: 'email' }),
      s('ot-8', 'condition', { condVar: 'orders.count', op: 'gt', condValue: '0', yesLabel: 'Orders found', noLabel: 'Otherwise' }),
      s('ot-9', 'show_orders', { limit: 3 }),
      s('ot-10', 'ask', { text: 'Anything else I can help with?', kind: 'buttons', variable: 'anything_else', options: [{ id: 'done', label: "That's all" }, { id: 'person', label: 'Talk to a person' }] }),
      s('ot-11', 'end', { csat: true }),
      s('ot-12', 'handover', { team: 'Support', note: 'Customer asked for a person during order tracking.' }),
      s('ot-13', 'ask', { text: "I couldn't find any orders for {{email}}.", kind: 'buttons', variable: 'no_orders_choice', options: [{ id: 'retry', label: 'Try another email' }, { id: 'person', label: 'Talk to a person' }] }),
    ],
    edges: [
      ...chain(['ot-1', 'ot-2', 'ot-3']),
      e('trigger', 'ot-1'),
      e('ot-3', 'ot-4', 'yes'), e('ot-3', 'ot-7', 'no'),
      e('ot-4', 'ot-5'),
      e('ot-5', 'ot-7', 'ok'), e('ot-5', 'ot-6', 'fail'),
      e('ot-7', 'ot-8'),
      e('ot-8', 'ot-9', 'yes'), e('ot-8', 'ot-13', 'no'),
      e('ot-9', 'ot-10'),
      e('ot-10', 'ot-11', 'done'), e('ot-10', 'ot-12', 'person'),
      e('ot-13', 'ot-2', 'retry'), e('ot-13', 'ot-12', 'person'),
    ],
  }
}

const verify = (p: string): Step[] => [
  s(`${p}-v1`, 'ask', { text: 'What email did you use for your order?', kind: 'email', variable: 'email', validation: "That doesn't look like an email address." }),
  s(`${p}-v2`, 'send_code', { text: "We've sent a 6-digit code to {{email}}. It expires in 10 minutes." }),
  s(`${p}-v3`, 'check_code', { attempts: 3, wrongText: "That code didn't match. {{tries_left_text}}" }),
  s(`${p}-vh`, 'handover', { team: 'Support', tag: 'verification-failed' }),
]

export const workflowTemplates: WorkflowTemplate[] = [
  {
    id: 'tpl-return', name: 'Start a return (Loop)', description: 'Verify the customer, pick an order and item, then start a Loop return with a label.',
    build: () => ({
      name: 'Start a return', description: 'Starts a Loop return after email verification.',
      trigger: { intent: 'Start a return', phrases: ['return my hat', 'start a return', 'exchange'], channels: ['chat'], quickReply: 'Start a return' },
      steps: [...verify('rt'), s('rt-4', 'find_orders', { variable: 'email' }), s('rt-5', 'ask', { text: 'Which order and item would you like to return?', kind: 'text', variable: 'return_item' }), s('rt-6', 'ask', { text: "What's the reason for the return?", kind: 'buttons', variable: 'reason', options: [{ id: 'size', label: "Doesn't fit" }, { id: 'damaged', label: 'Damaged' }, { id: 'other', label: 'Something else' }] }), s('rt-7', 'start_return', {}), s('rt-8', 'message', { text: 'Your return {{rma}} is started. We emailed your prepaid label too.', linkLabel: 'Download return label', linkUrl: 'https://returns.goorin.com/label/{{rma}}' }), s('rt-9', 'end', { csat: true })],
      edges: [e('trigger', 'rt-v1'), e('rt-v1', 'rt-v2'), e('rt-v2', 'rt-v3'), e('rt-v3', 'rt-4', 'ok'), e('rt-v3', 'rt-vh', 'fail'), e('rt-4', 'rt-5'), e('rt-5', 'rt-6'), e('rt-6', 'rt-7', 'size'), e('rt-6', 'rt-7', 'damaged'), e('rt-6', 'rt-7', 'other'), e('rt-7', 'rt-8'), e('rt-8', 'rt-9')],
    }),
  },
  {
    id: 'tpl-address', name: 'Change shipping address', description: 'Verify, find unfulfilled orders and update the address, or hand over if it already shipped.',
    build: () => ({
      name: 'Change shipping address', description: 'Updates the address on unfulfilled orders.',
      trigger: { intent: 'Change address', phrases: ['change my address', 'wrong address', 'update shipping address'], channels: ['chat', 'email'], quickReply: null },
      steps: [...verify('ad'), s('ad-4', 'find_orders', { variable: 'email' }), s('ad-5', 'condition', { condVar: 'orders.unfulfilled', op: 'gt', condValue: '0', yesLabel: 'Not fulfilled yet', noLabel: 'Already fulfilled' }), s('ad-6', 'ask', { text: "What's the new shipping address?", kind: 'text', variable: 'new_address' }), s('ad-7', 'update_address', {}), s('ad-8', 'message', { text: 'Done. Your order will ship to {{new_address}}.' }), s('ad-9', 'end', {}), s('ad-10', 'handover', { team: 'Support', note: 'Order already fulfilled; customer wants a new address.' })],
      edges: [e('trigger', 'ad-v1'), e('ad-v1', 'ad-v2'), e('ad-v2', 'ad-v3'), e('ad-v3', 'ad-4', 'ok'), e('ad-v3', 'ad-vh', 'fail'), e('ad-4', 'ad-5'), e('ad-5', 'ad-6', 'yes'), e('ad-5', 'ad-10', 'no'), e('ad-6', 'ad-7'), e('ad-7', 'ad-8'), e('ad-8', 'ad-9')],
    }),
  },
  {
    id: 'tpl-wholesale', name: 'Wholesale inquiry', description: 'Collect business details, tag the ticket and hand it to the Wholesale team.',
    build: () => ({
      name: 'Wholesale inquiry', description: 'Qualifies wholesale leads for the Wholesale team.',
      trigger: { intent: 'Wholesale', phrases: ['wholesale', 'stock your hats', 'bulk order'], channels: ALL, quickReply: null },
      steps: [s('ws-1', 'ask', { text: "What's your business name?", kind: 'text', variable: 'business' }), s('ws-2', 'ask', { text: "What's your store URL?", kind: 'text', variable: 'store_url' }), s('ws-3', 'ask', { text: 'Where are you located?', kind: 'text', variable: 'location' }), s('ws-4', 'ask', { text: 'Roughly how many units per order?', kind: 'number', variable: 'volume' }), s('ws-5', 'add_tag', { tag: 'wholesale' }), s('ws-6', 'handover', { team: 'Wholesale', note: '{{business}} · {{store_url}} · {{location}} · {{volume}} units' })],
      edges: [e('trigger', 'ws-1'), ...chain(['ws-1', 'ws-2', 'ws-3', 'ws-4', 'ws-5', 'ws-6'])],
    }),
  },
  {
    id: 'tpl-size', name: 'Hat size finder', description: 'Ask for head circumference and recommend S, M, L or XL with a shop link.',
    build: () => ({
      name: 'Hat size finder', description: 'Recommends a hat size from head circumference.',
      trigger: { intent: 'Sizing help', phrases: ['what size', 'hat size', 'will it fit'], channels: ['chat'], quickReply: 'Find my size' },
      steps: [s('hs-1', 'ask', { text: "What's your head circumference? Reply in cm or inches, e.g. 57 cm or 22.5 in.", kind: 'number', variable: 'head_cm', helpLabel: "I don't know", helpText: 'Wrap a soft tape around your head just above your ears and eyebrows, where a hat sits. Note the number, then send it here.' }), s('hs-2', 'condition', { condVar: 'head_cm', op: 'lt', condValue: '56', yesLabel: 'Under 56 cm', noLabel: '56 cm or more' }), s('hs-3', 'message', { text: 'Size S fits you best.', linkLabel: 'Shop hats', linkUrl: 'https://goorin.com/hats' }), s('hs-4', 'condition', { condVar: 'head_cm', op: 'lt', condValue: '59', yesLabel: '56–58 cm', noLabel: '59 cm or more' }), s('hs-5', 'message', { text: 'Size M or L fits you best.', linkLabel: 'Shop hats', linkUrl: 'https://goorin.com/hats' }), s('hs-6', 'message', { text: 'Size XL fits you best.', linkLabel: 'Shop hats', linkUrl: 'https://goorin.com/hats' }), s('hs-7', 'end', {})],
      edges: [e('trigger', 'hs-1'), e('hs-1', 'hs-2'), e('hs-2', 'hs-3', 'yes'), e('hs-2', 'hs-4', 'no'), e('hs-4', 'hs-5', 'yes'), e('hs-4', 'hs-6', 'no'), e('hs-3', 'hs-7'), e('hs-5', 'hs-7'), e('hs-6', 'hs-7')],
    }),
  },
]

const ago = (h: number) => new Date(Date.now() - h * 36e5).toISOString()

export const workflows: Workflow[] = [
  { id: 'wf-order-tracking', status: 'active', runs7d: 214, completedPct: 86, handedPct: 9, editedAt: ago(26), editedBy: 'Ava Martinez', ...orderTracking() },
].map((w) => tidy<Workflow>(w as Workflow))
