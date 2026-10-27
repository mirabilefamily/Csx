import { BRAND_VOICE_LIMITS, type BrandVoice, type ConversationTestInput, type TestTurn } from '@/types'
import { ApiError, request } from './client'
import { db } from './db'
import { runSandbox } from './guidance'

// GET /api/ai/brand-voice
export function getBrandVoice(): Promise<BrandVoice> {
  return request(() => db.brandVoice)
}

// PUT /api/ai/brand-voice
export function saveBrandVoice(v: BrandVoice): Promise<BrandVoice> {
  return request(() => {
    for (const [k, max] of Object.entries(BRAND_VOICE_LIMITS)) {
      if (v[k as keyof typeof BRAND_VOICE_LIMITS].length > max) throw new ApiError(`Keep this under ${max.toLocaleString()} characters.`, 422)
    }
    db.brandVoice = { ...structuredClone(v), updatedAt: new Date().toISOString() }
    return db.brandVoice
  })
}

const lines = (s: string) => s.split('\n').map((l) => l.trim()).filter(Boolean)

// Applies the brand voice to a draft: opener phrase, banned phrases removed, chat kept short, email signed.
export function styleWithVoice(draft: string, voice: BrandVoice, channel: 'email' | 'chat'): string {
  if (!voice.enabled) return draft
  let out = draft
  for (const p of lines(voice.phrasesToAvoid)) out = out.replace(new RegExp(`${p.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')},?\\s*`, 'gi'), '')
  const opener = lines(voice.phrasesToUse)[0]
  if (opener && !out.toLowerCase().startsWith(opener.toLowerCase())) out = `${opener}! ${out.charAt(0).toUpperCase()}${out.slice(1)}`
  if (channel === 'chat') out = (out.match(/[^.!?]+[.!?]+/g) ?? [out]).slice(0, 3).join('').trim()
  else out = `${out}\n\nWarmly,\nThe ${voice.brandName || 'support'} team`
  return out
}

// POST /api/ai/test-conversation  { history, message, channel, orderNumber?, voice? }
// Retrieval looks at the last two customer turns so follow-ups keep their topic.
export async function testConversation(input: ConversationTestInput): Promise<TestTurn> {
  const prior = input.history.filter((t) => t.role === 'customer').slice(-1).map((t) => t.text)
  const r = await runSandbox([...prior, input.message].join(' '), input.orderNumber || undefined)
  const voice = input.voice ?? db.brandVoice
  return { role: 'ai', text: styleWithVoice(r.draft, voice, input.channel), result: { ...r, draft: styleWithVoice(r.draft, voice, input.channel) } }
}
