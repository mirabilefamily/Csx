import type { AIAttempt, AIDraft, Customer, GuidanceArticle, Macro, Message, Ticket, User } from '@/types'
import * as seed from '@/mocks'

export const CSAT_QUESTIONS_KEY = 'goorin.csatQuestions'

// Only the CSAT questions survive a reload (same tab) so the hosted survey follows CSAT Settings.
function storedCsatQuestions(): typeof seed.csatSurvey.questions | null {
  try {
    const raw = sessionStorage.getItem(CSAT_QUESTIONS_KEY)
    return raw ? JSON.parse(raw) : null
  } catch {
    return null
  }
}

// In-memory database. Rebuilt from the seed on every page load, so edits reset on reload.
export const db = {
  users: structuredClone(seed.users) as User[],
  customers: structuredClone(seed.customers) as Customer[],
  tickets: structuredClone(seed.tickets) as Ticket[],
  messages: structuredClone(seed.messages) as Message[],
  aiAttempts: structuredClone(seed.aiAttempts) as AIAttempt[],
  aiDrafts: structuredClone(seed.aiDrafts) as AIDraft[],
  guidanceArticles: structuredClone(seed.guidanceArticles) as GuidanceArticle[],
  macros: structuredClone(seed.macros) as Macro[],
  dailyMetrics: seed.dailyMetrics,
  csatSurvey: { ...structuredClone(seed.csatSurvey), questions: storedCsatQuestions() ?? structuredClone(seed.csatSurvey.questions) },
  csatResponses: seed.csatResponses,
  invites: seed.invites,
  integrations: structuredClone(seed.integrations),
  aiSettings: structuredClone(seed.aiSettings),
  widgetSettings: structuredClone(seed.widgetSettings),
  shopifyInstall: structuredClone(seed.shopifyInstall),
  themeEmbed: structuredClone(seed.themeEmbed),
  storeProducts: seed.storeProducts,
  surveyTokens: structuredClone(seed.surveyTokens),
}
