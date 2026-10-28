import { BadgeCheck, Ban, CircleStop, GitBranch, KeyRound, ListChecks, MailCheck, MapPin, MessageSquare, MessageCircleQuestion, PackageSearch, RotateCcw, Tag, UserRound, Undo2, type LucideIcon } from 'lucide-react'
import type { Step, StepType } from '@/types'

export const STEP_ICON: Record<StepType, LucideIcon> = {
  message: MessageSquare, ask: MessageCircleQuestion, send_code: MailCheck, check_code: KeyRound, find_orders: PackageSearch, show_orders: ListChecks, update_address: MapPin,
  find_returns: RotateCcw, start_return: Undo2, condition: GitBranch, add_tag: Tag, set_field: BadgeCheck, handover: UserRound, end: CircleStop,
}
export const UnknownIcon = Ban

export function stepSummary(st: Step): string {
  const c = st.config
  switch (st.type) {
    case 'message': return c.text || 'Empty message'
    case 'ask': return `${c.text || 'No question yet'}${c.variable ? ` → {{${c.variable}}}` : ''}`
    case 'send_code': return '6-digit code to {{email}}, expires in 10 min'
    case 'check_code': return `${c.attempts ?? 3} attempts, then hand over`
    case 'find_orders': return `Shopify orders for {{${c.variable ?? 'email'}}}`
    case 'show_orders': return `Latest ${c.limit ?? 3}: number, date, items, status, tracking`
    case 'condition': return c.condVar ? `${c.condVar} ${c.op === 'gt' ? '>' : c.op === 'lt' ? '<' : 'is'} ${c.condValue}` : 'No rule yet'
    case 'add_tag': return c.tag ? `Tag "${c.tag}"` : 'No tag yet'
    case 'set_field': return c.field ? `${c.field} = ${c.fieldValue}` : 'No field yet'
    case 'handover': return `To ${c.team ?? 'Support'}${c.tag ? ` · tag ${c.tag}` : ''}`
    case 'end': return c.csat ? 'Ask the CSAT question' : 'End the conversation'
    default: return 'MOCKED action'
  }
}

// Renders {{var}} as small chips (REQ-734).
export function VarText({ text }: { text: string }) {
  return <>{text.split(/(\{\{\s*[\w.]+\s*\}\})/g).map((p, i) => (/^\{\{/.test(p) ? <span key={i} className="mx-0.5 rounded bg-tobacco-50 px-1 font-mono text-[11px] text-tobacco-800">{p.replace(/[{}\s]/g, '')}</span> : p))}</>
}
