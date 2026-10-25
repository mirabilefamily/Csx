import type { CsatAnswers, SurveyLookup } from '@/types'
import { ApiError, request } from './client'
import { db } from './db'

const subjectOf = (ticketId: string) => db.tickets.find((t) => t.id === ticketId)?.subject ?? 'Your recent request'

// GET /api/surveys/:token
export function getSurvey(token: string): Promise<SurveyLookup> {
  return request<SurveyLookup>(() => {
    const entry = db.surveyTokens[token]
    if (!entry) return { status: 'invalid' }
    if (entry.completed) return { status: 'completed', ticketSubject: subjectOf(entry.ticketId) }
    const ticket = db.tickets.find((t) => t.id === entry.ticketId)!
    const customer = db.customers.find((c) => c.id === ticket.customer.id)
    return {
      status: 'valid',
      token,
      ticketId: ticket.id,
      ticketSubject: ticket.subject,
      firstName: (customer?.name ?? ticket.customer.name).split(' ')[0],
      questions: db.csatSurvey.questions,
    }
  })
}

// POST /api/surveys/:token/responses
export function submitSurvey(token: string, answers: CsatAnswers): Promise<{ ok: true }> {
  return request(() => {
    const entry = db.surveyTokens[token]
    if (!entry || entry.completed) throw new ApiError("This survey link isn't valid", 410)
    void answers
    entry.completed = true
    return { ok: true as const }
  })
}
