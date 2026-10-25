import type {
  ChatContext,
  ChatReply,
  CsatAnswers,
  CsatQuestion,
  OfflineMessageInput,
  ShopifyInstallStatus,
  ThemeEmbedSettings,
  VerifyResult,
  ShopifyOrder,
  StoreProduct,
  WidgetCustomer,
  WidgetOrderCard,
  WidgetSettings,
} from '@/types'
import { isValidEmail } from '@/lib/format'
import { mergeEffective } from '@/lib/widgetRules'
import { ApiError, request } from './client'
import { db } from './db'

const LOGGED_IN_CUSTOMER_ID = 'c06'
const FALLBACK_ORDER = '#GB20411'

const IMAGE_BY_KEYWORD: [RegExp, string][] = [
  [/trucker/i, 'trucker-hat'],
  [/flat cap|newsboy/i, 'flat-cap'],
  [/panama|straw/i, 'straw-panama'],
  [/cowboy/i, 'cowboy-hat'],
  [/cloche|wide brim/i, 'cloche'],
  [/beanie/i, 'beanie'],
  [/bucket/i, 'bucket-hat'],
]
const imageFor = (title: string) => `/images/products/${IMAGE_BY_KEYWORD.find(([re]) => re.test(title))?.[1] ?? 'wool-fedora'}.jpg`

function toCard(o: ShopifyOrder): WidgetOrderCard {
  const item = o.lineItems[0]
  const eta = o.status === 'in_transit' ? new Date(Date.now() + 2 * 86_400_000).toISOString() : null
  return { number: o.number, status: o.status, productTitle: item.title, variant: item.variant, image: imageFor(item.title), carrier: o.carrier, trackingUrl: o.trackingUrl, eta }
}

function findOrder(ctx: ChatContext): ShopifyOrder {
  const orders = db.customers.flatMap((c) => c.orders)
  const wanted = ctx.orderNumber?.replace(/^#?/, '#').toUpperCase()
  const byNumber = wanted && orders.find((o) => o.number === wanted)
  const email = ctx.email?.toLowerCase()
  const byEmail = email && db.customers.find((c) => c.email === email)?.orders[0]
  return byNumber || byEmail || orders.find((o) => o.number === FALLBACK_ORDER)!
}

const sleep = (ms: number) => new Promise((r) => setTimeout(r, ms))

// GET /api/widget/settings
export function getWidgetSettings(): Promise<WidgetSettings> {
  return request(() => db.widgetSettings)
}

// PUT /api/widget/settings
export function saveWidgetSettings(settings: WidgetSettings): Promise<WidgetSettings> {
  return request(() => {
    db.widgetSettings = structuredClone(settings)
    return db.widgetSettings
  })
}

// GET /api/widget/install-status
export function getInstallStatus(): Promise<ShopifyInstallStatus> {
  return request(() => db.shopifyInstall)
}

// POST /api/widget/verify-install (checks for a recent widget.js load on the storefront)
export async function verifyInstall(): Promise<VerifyResult> {
  await sleep(900)
  return request<VerifyResult>(() => {
    const { embedEnabled, shopDomain } = db.shopifyInstall
    if (!embedEnabled) return { detected: false, message: 'Widget not detected. Enable the App embed and save your theme.' }
    db.shopifyInstall.lastSeenAt = new Date().toISOString()
    return { detected: true, message: `Widget detected on ${shopDomain}` }
  })
}

// GET /api/shopify/theme-embed (values from the theme editor's app embed block)
export function getThemeEmbed(): Promise<ThemeEmbedSettings> {
  return request(() => db.themeEmbed)
}

// PUT /api/shopify/theme-embed (what saving the Shopify theme editor does)
export function saveThemeEmbed(theme: ThemeEmbedSettings): Promise<ThemeEmbedSettings> {
  return request(() => {
    db.themeEmbed = structuredClone(theme)
    db.shopifyInstall.embedEnabled = theme.enabled
    db.shopifyInstall.method = 'app_embed'
    return db.themeEmbed
  })
}

// GET /api/widget/effective-settings: what widget.js renders on the store (Desk settings merged with theme defaults).
export function getEffectiveWidgetSettings(): Promise<{ settings: WidgetSettings; embedEnabled: boolean }> {
  return request(() => ({ settings: mergeEffective(db.widgetSettings, db.themeEmbed), embedEnabled: db.themeEmbed.enabled }))
}

// One-shot hand-off of unsaved settings to a new /widget-demo?desk_preview=1 tab.
const PREVIEW_KEY = 'goorin.deskPreview'
export function stashDeskPreview(settings: WidgetSettings) {
  localStorage.setItem(PREVIEW_KEY, JSON.stringify(settings))
}
export function takeDeskPreview(): WidgetSettings | null {
  const raw = localStorage.getItem(PREVIEW_KEY)
  localStorage.removeItem(PREVIEW_KEY)
  try {
    return raw ? (JSON.parse(raw) as WidgetSettings) : null
  } catch {
    return null
  }
}

// GET /api/storefront/products (demo storefront only)
export function listStoreProducts(): Promise<StoreProduct[]> {
  return request(() => db.storeProducts, { empty: () => [] })
}

// GET /api/widget/customer (Shopify customer when the shopper is logged in)
export function getLoggedInCustomer(): Promise<WidgetCustomer> {
  return request(() => {
    const c = db.customers.find((x) => x.id === LOGGED_IN_CUSTOMER_ID)!
    return { firstName: c.name.split(' ')[0], name: c.name, email: c.email }
  })
}

// GET /api/widget/csat-questions (same source as CSAT Settings)
export function getWidgetCsatQuestions(): Promise<CsatQuestion[]> {
  return request(() => db.csatSurvey.questions)
}

// POST /api/widget/messages -> scripted AI reply (mocked, not real AI)
export async function sendChatMessage(text: string, ctx: ChatContext): Promise<ChatReply> {
  await sleep(700)
  return request<ChatReply>(() => {
    const t = text.toLowerCase()
    if (/\b(person|human|agent|someone|representative|real people|talk to)\b/.test(t) || /wholesale/.test(t)) {
      return {
        text: /wholesale/.test(t)
          ? "Wonderful, our wholesale desk looks after boutique accounts personally. I'm passing this to them now."
          : "Of course. I'm bringing in one of our hatters, and they'll have this whole conversation in front of them.",
        handoff: true,
      }
    }
    if (/track|order|where is|shipping|package|delivery|#?gb\d+/.test(t)) {
      const order = toCard(findOrder(ctx))
      const line = order.status === 'in_transit' ? `It's on its way with ${order.carrier}.` : order.status === 'delivered' ? 'Our records show it was delivered.' : "It's being prepared in our workshop."
      return { text: `I found order ${order.number}. ${line}`, order }
    }
    if (/size|sizing|fit|inch|cm|measure/.test(t)) {
      return { text: "Measure around your head about a finger's width above the eyebrows. 22¼–22⅝ in is a Medium, 22⅞–23¼ in a Large. If you're between sizes, size up; a felt hat with our sizing tape fits snug, not tight." }
    }
    if (/return|exchange|refund/.test(t)) {
      return { text: 'Unworn hats can be returned or exchanged within 30 days. Start from your order confirmation email and we\'ll send a prepaid label. Refunds land 5–7 business days after the hat reaches our workshop.' }
    }
    return { text: "Thank you. I can help with sizing, tracking an order, returns and exchanges, or care for your hat. If you'd rather speak with a person, just say so." }
  })
}

// POST /api/widget/offline-messages
export function submitOfflineMessage(input: OfflineMessageInput): Promise<{ ok: true }> {
  return request(() => {
    if (!isValidEmail(input.email) || !input.message.trim()) throw new ApiError('Enter a valid email address.', 422)
    return { ok: true as const }
  })
}

// POST /api/widget/csat
export function submitWidgetCsat(answers: CsatAnswers): Promise<{ ok: true }> {
  return request(() => {
    void answers
    return { ok: true as const }
  })
}

// POST /api/widget/transcript  { email }
export function sendTranscript(email: string): Promise<{ email: string }> {
  return request(() => {
    if (!isValidEmail(email)) throw new ApiError('Enter a valid email address.', 422)
    return { email: email.trim().toLowerCase() }
  })
}
