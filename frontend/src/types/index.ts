export type Channel = 'email' | 'chat'
export type TicketStatus = 'open' | 'ai_handling' | 'grok_handling' | 'needs_human' | 'resolved' | 'closed'
export type Priority = 'low' | 'normal' | 'high' | 'urgent'
export type Resolver = 'claude' | 'grokbot' | 'human'
export type AuthorType = 'customer' | 'claude' | 'grokbot' | 'agent' | 'system'
export type Role = 'admin' | 'agent'
export type UserStatus = 'active' | 'invited' | 'deactivated'
export type AITier = 'claude' | 'grokbot'
export type EscalationReason =
  | 'low_confidence'
  | 'asked_for_human'
  | 'refund_over_limit'
  | 'damaged_item'
  | 'custom_order'
  | 'wholesale'
  | 'negative_sentiment'

export interface User {
  id: string
  name: string
  email: string
  role: Role
  status: UserStatus
  lastLoginAt: string | null
}

export interface LineItem {
  sku: string
  title: string
  variant: string
  quantity: number
  price: number
}

export type OrderStatus = 'unfulfilled' | 'in_transit' | 'delivered' | 'returned' | 'cancelled'

export interface ShopifyOrder {
  id: string
  number: string
  status: OrderStatus
  total: number
  currency: 'USD'
  createdAt: string
  carrier: string | null
  trackingNumber: string | null
  trackingUrl: string | null
  lineItems: LineItem[]
}

export interface Customer {
  id: string
  name: string
  email: string
  location: string
  shopifyCustomerId: string
  customerSince: string
  note: string | null
  orders: ShopifyOrder[]
}

export interface CustomerRef {
  id: string
  name: string
  email: string
}

export interface Ticket {
  id: string
  subject: string
  preview: string
  channel: Channel
  status: TicketStatus
  priority: Priority
  tags: string[]
  assignee: string | null
  resolvedBy: Resolver | null
  customer: CustomerRef
  createdAt: string
  updatedAt: string
  escalationReason: EscalationReason | null
  orderNumber: string | null
}

export interface Message {
  id: string
  ticketId: string
  authorType: AuthorType
  authorName: string
  body: string
  createdAt: string
  isInternal: boolean
  format?: 'text' | 'html'
  approvedBy?: string
}

export interface AIAttempt {
  id: string
  ticketId: string
  tier: AITier
  model: string
  confidence: number
  outcome: 'answered' | 'escalated' | 'in_progress'
  reason: string | null
  guidanceIds: string[]
  latencyMs: number
  createdAt: string
}

export interface AIDraft {
  id: string
  ticketId: string
  tier: AITier
  body: string
  confidence: number
  guidanceIds: string[]
  createdAt: string
}

export interface GuidanceArticle {
  id: string
  title: string
  category: string
  tags: string[]
  body: string
  active: boolean
  updatedAt: string
  updatedBy: string
}

export interface Macro {
  id: string
  name: string
  shortcut: string
  body: string
  tags: string[]
  usageCount: number
  updatedAt: string
}

export type CsatQuestionType = 'rating' | 'text' | 'choice'

export interface CsatQuestion {
  id: string
  type: CsatQuestionType
  label: string
  required: boolean
  options?: string[]
}

export type DelayUnit = 'minutes' | 'hours'

export interface CsatSurvey {
  id: string
  questions: CsatQuestion[]
  sendDelay: { value: number; unit: DelayUnit }
  channels: { email: boolean; inlineChat: boolean }
  lowScoreRecipients: string[]
  lowScoreThreshold: number
  updatedAt: string
}

export interface CsatResponse {
  id: string
  ticketId: string
  customerName: string
  channel: Channel
  resolvedBy: Resolver
  score: number
  comment: string | null
  createdAt: string
  needsFollowUp: boolean
}

export interface DailyMetric {
  date: string
  ticketsCreated: number
  email: number
  chat: number
  openAtEnd: number
  resolved: number
  resolvedClaude: number
  resolvedGrokbot: number
  resolvedHuman: number
  firstResponseMinutes: number
  resolutionMinutes: number
  surveysSent: number
  escalations: Record<EscalationReason, number>
  tags: Record<string, number>
}

// ---- API DTOs ----
export type RangePreset = 'today' | '7d' | '30d' | '90d' | 'custom'

export interface DateRange {
  from: string
  to: string
}

export type KpiFormat = 'count' | 'percent' | 'duration' | 'score'

export interface KpiMetric {
  key: string
  label: string
  value: number | null
  previous: number | null
  format: KpiFormat
  betterWhen: 'higher' | 'lower' | 'neutral'
  hint: string
  series?: number[]
}

export interface ScoreSplit<K extends string> {
  key: K
  label: string
  average: number | null
  responses: number
}

export interface CsatSummary {
  totalResponses: number
  average: number | null
  trend: { label: string; average: number | null; responses: number }[]
  distribution: { score: number; count: number }[]
  byChannel: ScoreSplit<Channel>[]
  byResolver: ScoreSplit<Resolver>[]
  latestComments: CsatResponse[]
  lowScores: CsatResponse[]
}

export interface DashboardSummary {
  range: DateRange
  priorRange: DateRange
  comparisonLabel: string
  kpis: KpiMetric[]
  volumeByChannel: { label: string; email: number; chat: number }[]
  resolvedBy: { key: Resolver; label: string; count: number }[]
  escalationReasons: { key: EscalationReason; label: string; count: number }[]
  topTags: { tag: string; count: number }[]
  csat: CsatSummary
}

export interface SearchCustomerResult extends CustomerRef {
  latestTicketId: string | null
  ticketCount: number
}

export interface SearchResults {
  query: string
  tickets: Ticket[]
  customers: SearchCustomerResult[]
  articles: Pick<GuidanceArticle, 'id' | 'title' | 'category'>[]
}

export type InboxViewId = 'all_open' | 'needs_human' | 'ai_handling' | 'mine' | 'unassigned' | 'resolved' | 'closed'

export interface TicketDetail {
  ticket: Ticket
  messages: Message[]
  drafts: AIDraft[]
  attempts: AIAttempt[]
  customer: Customer | null
  pastTickets: Ticket[]
  guidanceTitles: Record<string, string>
}

export interface TicketPatch {
  status?: TicketStatus
  priority?: Priority
  assignee?: string | null
}

export interface BulkPatch {
  status?: TicketStatus
  assignee?: string | null
  addTag?: string
}

export interface NewMessage {
  html: string
  isInternal: boolean
  draftId?: string
}

export interface SessionUser {
  id: string
  name: string
  email: string
  role: Role
}

export interface Invite {
  token: string
  email: string
  suggestedName: string
  role: Role
  invitedBy: string
  expired: boolean
}

// ---- Phase 3: guidance + settings ----
export type IntegrationId = 'outlook' | 'shopify' | 'claude' | 'grokbot' | 'resend'
export type IntegrationState = 'connected' | 'error' | 'not_configured'

export interface IntegrationStatus {
  id: IntegrationId
  name: string
  description: string
  status: IntegrationState
  lastSyncAt: string | null
  error: string | null
  envVar: string
  secretPreview: string | null
  details: Record<string, string>
  models?: string[]
  model?: string
  checklist?: { label: string; ok: boolean }[]
}

export interface TestResult { ok: boolean; ms: number; message: string }

export type RuleCondition = 'keyword' | 'refund_over' | 'sentiment' | 'order_total_over'

export interface EscalationRule { id: string; condition: RuleCondition; value: string; target: 'grokbot' | 'human' }

export interface BusinessDay { day: string; open: boolean; from: string; to: string }

export interface AiSettings {
  threshold: number
  autoSend: { email: { claude: boolean; grokbot: boolean }; chat: { claude: boolean; grokbot: boolean } }
  timezone: string
  hours: BusinessDay[]
  rules: EscalationRule[]
  prompts: { claude: string; grokbot: string }
}

export interface SandboxResult {
  articles: { id: string; title: string; category: string; score: number }[]
  draft: string
  confidence: number
  threshold: number
  wouldEscalate: boolean
  order: ShopifyOrder | null
  orderNotFound: string | null
}

export type ArticleInput = Omit<GuidanceArticle, 'id' | 'updatedAt' | 'updatedBy'> & { id?: string }
export type MacroInput = Pick<Macro, 'name' | 'body'> & { id?: string }
export interface ImportRow { title?: string; body?: string; category?: string; tags?: string; active?: string }

// ---- Customer chat widget (phase 4) ----
export type StorePageType = 'home' | 'product' | 'collection' | 'cart' | 'account' | 'pages' | 'other'
export type SharedWidgetField = 'primary' | 'accent' | 'launcherPosition' | 'hideOnMobile'
export type SettingSource = 'desk' | 'theme'
export type LauncherIcon = 'chat' | 'hat' | 'question' | 'envelope' | 'headset' | 'custom'
export type WidgetState =
  | 'launcher_closed'
  | 'greeting_bubble'
  | 'prechat'
  | 'active_chat'
  | 'handoff'
  | 'offline'
  | 'csat'
  | 'transcript_sent'
export type CsatStyle = 'stars' | 'emoji' | 'numeric'
export type FieldMode = 'required' | 'optional' | 'off'
export interface Offset { x: number; y: number }

export interface WidgetSettings {
  branding: {
    colors: {
      primary: string
      accent: string
      headerBackground: string
      headerText: string
      customerBubble: string
      aiBubble: string
      link: string
    }
    logoUrl: string | null
    aiAvatarUrl: string | null
    agentAvatarUrl: string | null
    font: 'inherit' | 'inter'
    radius: number
    shadow: 'none' | 'soft' | 'strong'
  }
  launcher: {
    icon: LauncherIcon
    customIconUrl: string | null
    iconColor: string
    backgroundColor: string
    style: 'circle' | 'pill'
    label: string
    size: 's' | 'm' | 'l'
    position: 'bottom-right' | 'bottom-left'
    offset: Offset
    mobileOffset: Offset
    badgeColor: string
    animation: 'none' | 'pulse_once' | 'bounce'
    bounceAfterSec: number
  }
  messaging: {
    headerTitle: string
    headerSubtitle: string
    greeting: string
    proactive: { enabled: boolean; delaySec: number; pages: StorePageType[] }
    preChat: { email: FieldMode; name: FieldMode; orderNumber: FieldMode }
    aiDisclosure: string
    handoffMessage: string
    handoffResponseTime: string
    offlineMessage: string
    offlineEmailFallback: boolean
    quickReplies: string[]
  }
  display: {
    mode: 'all' | 'page_types'
    pageTypes: StorePageType[]
    urlInclude: string[]
    urlExclude: string[]
    hideOnMobile: boolean
    outsideHours: 'keep_ai' | 'offline_form' | 'hide'
    customerContext: { loggedInCustomer: boolean; currentProduct: boolean; cartContents: boolean }
  }
  csat: { enabled: boolean; style: CsatStyle }
  // Which side owns the fields shared with the Shopify theme editor block.
  sources: Record<SharedWidgetField, SettingSource>
}

export interface ThemeEmbedSettings {
  enabled: boolean
  primary: string
  accent: string
  launcherPosition: 'bottom-right' | 'bottom-left'
  hideOnMobile: boolean
}

export interface VerifyResult { detected: boolean; message: string }

export interface ShopifyInstallStatus {
  shopDomain: string
  embedEnabled: boolean
  themeName: string
  lastSeenAt: string | null
  method: 'app_embed' | 'script_tag' | 'none'
}

export interface StoreProduct {
  id: string
  name: string
  price: number
  image: string
  category: string
  colors: string[]
  description: string
}

export interface WidgetCustomer { firstName: string; name: string; email: string }

export interface WidgetOrderCard {
  number: string
  status: OrderStatus
  productTitle: string
  variant: string
  image: string
  carrier: string | null
  trackingUrl: string | null
  eta: string | null
}

export interface ChatContext { email: string | null; orderNumber: string | null; pageType: StorePageType }
export interface ChatReply { text: string; order?: WidgetOrderCard; handoff?: boolean }
export interface OfflineMessageInput { name: string; email: string; message: string }
export type CsatAnswers = Record<string, string | number>

export type SurveyLookup =
  | { status: 'valid'; token: string; ticketId: string; ticketSubject: string; firstName: string; questions: CsatQuestion[] }
  | { status: 'invalid' }
  | { status: 'completed'; ticketSubject: string }

