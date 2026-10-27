import type { ContactFormSettings, EmailChannelSettings } from '@/types'
import { isValidEmail } from '@/lib/format'
import { ApiError, request } from './client'
import { db } from './db'

// GET /api/channels/contact-form
export function getContactForm(): Promise<ContactFormSettings> {
  return request(() => db.contactForm)
}

// PUT /api/channels/contact-form
export function saveContactForm(s: ContactFormSettings): Promise<ContactFormSettings> {
  return request(() => {
    if (!s.buttonLabel.trim()) throw new ApiError('Add a button label.', 422)
    const topic = s.fields.find((f) => f.id === 'topic')
    if (topic?.enabled && !topic.options?.filter(Boolean).length) throw new ApiError('Add at least one topic.', 422)
    db.contactForm = structuredClone(s)
    return db.contactForm
  })
}

// GET /api/channels/email
export function getEmailChannel(): Promise<EmailChannelSettings> {
  return request(() => db.emailChannel)
}

// PUT /api/channels/email
export function saveEmailChannel(s: EmailChannelSettings): Promise<EmailChannelSettings> {
  return request(() => {
    if (!s.fromName.trim()) throw new ApiError('Add a from name.', 422)
    if (!isValidEmail(s.replyTo)) throw new ApiError('Enter a valid email address.', 422)
    db.emailChannel = structuredClone(s)
    return db.emailChannel
  })
}
