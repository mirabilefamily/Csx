export type WorkflowStatus = 'active' | 'off' | 'draft'
export type WorkflowChannel = 'chat' | 'form' | 'email'
export type StepType = 'message' | 'ask' | 'send_code' | 'check_code' | 'find_orders' | 'show_orders' | 'update_address' | 'find_returns' | 'start_return' | 'condition' | 'add_tag' | 'set_field' | 'handover' | 'end'
export type AskKind = 'text' | 'email' | 'number' | 'buttons'
export type ConditionOp = 'gt' | 'lt' | 'eq' | 'is'

export interface StepOption { id: string; label: string }

export interface StepConfig {
  text?: string
  kind?: AskKind
  variable?: string
  options?: StepOption[]
  validation?: string
  attempts?: number
  wrongText?: string
  limit?: number
  condVar?: string
  op?: ConditionOp
  condValue?: string
  yesLabel?: string
  noLabel?: string
  tag?: string
  field?: string
  fieldValue?: string
  team?: string
  note?: string
  csat?: boolean
  linkLabel?: string
  linkUrl?: string
  helpLabel?: string
  helpText?: string
}

export interface Step {
  id: string
  type: StepType
  config: StepConfig
  position: { x: number; y: number }
}

export interface Edge {
  id: string
  source: string
  sourceHandle: string
  target: string
}

export interface Trigger {
  intent: string
  phrases: string[]
  channels: WorkflowChannel[]
  quickReply: string | null
}

export interface Variable { key: string; label: string; setBy: string }

export interface Workflow {
  id: string
  name: string
  description: string
  status: WorkflowStatus
  trigger: Trigger
  steps: Step[]
  edges: Edge[]
  runs7d: number
  completedPct: number | null
  handedPct: number | null
  editedAt: string
  editedBy: string
  templateId?: string
}

export interface WorkflowTemplate { id: string; name: string; description: string; build: () => Pick<Workflow, 'name' | 'description' | 'trigger' | 'steps' | 'edges'> }

export interface WorkflowIssue { stepId: string | null; text: string }

export interface RunOrder { number: string; date: string; items: string; status: string; total: number; carrier: string | null; trackingUrl: string | null }
export interface RunChatMessage { id: string; from: 'bot' | 'customer'; text: string; buttons?: string[]; orders?: RunOrder[]; link?: { label: string; url: string } }
export interface MockEmail { id: string; from: string; to: string; subject: string; body: string; at: string }
export interface RunLogEntry { stepId: string; text: string; ok: boolean }

export interface TestRun {
  workflowId: string
  channel: WorkflowChannel
  vars: Record<string, unknown>
  current: string | null
  waitingFor: string | null
  attempts: number
  chat: RunChatMessage[]
  inbox: MockEmail[]
  log: RunLogEntry[]
  ended: string | null
}
