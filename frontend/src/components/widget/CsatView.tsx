import { useState } from 'react'
import { Check, Mail, Star } from 'lucide-react'
import { widgetApi } from '@/api'
import type { CsatAnswers, CsatQuestion, CsatStyle } from '@/types'
import { isValidEmail } from '@/lib/format'

const EMOJI = ['😞', '🙁', '😐', '🙂', '😄']

function Rating({ q, style, value, onChange }: { q: CsatQuestion; style: CsatStyle; value?: number; onChange: (v: number) => void }) {
  return (
    <div className="gw-rating" role="radiogroup" aria-label={q.label}>
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          role="radio"
          aria-checked={value === n}
          aria-label={`${n} out of 5`}
          className={`gw-rate${style === 'stars' ? ' is-star' : ''}${style === 'emoji' ? ' is-emoji' : ''}${style === 'stars' && value && n <= value ? ' is-on' : ''}`}
          onClick={() => onChange(n)}
          data-testid={`widget-csat-${q.id}-${n}`}
        >
          {style === 'stars' ? <Star size={28} fill={value && n <= value ? 'currentColor' : 'none'} aria-hidden /> : style === 'emoji' ? <span aria-hidden>{EMOJI[n - 1]}</span> : n}
        </button>
      ))}
    </div>
  )
}

interface CsatProps {
  questions: CsatQuestion[] | null
  style: CsatStyle
  skip: boolean
  knownEmail: string | null
  onTranscriptSent: (email: string) => void
}

export function CsatView({ questions, style, skip, knownEmail, onTranscriptSent }: CsatProps) {
  const [answers, setAnswers] = useState<CsatAnswers>({})
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [done, setDone] = useState(skip)
  const [busy, setBusy] = useState(false)
  const [askEmail, setAskEmail] = useState(false)
  const [email, setEmail] = useState('')
  const [emailError, setEmailError] = useState<string>()
  const [failed, setFailed] = useState(false)

  const set = (id: string, v: string | number) => {
    setAnswers((a) => ({ ...a, [id]: v }))
    setErrors((e) => ({ ...e, [id]: '' }))
  }
  const submit = async (e: React.FormEvent) => {
    e.preventDefault()
    const next: Record<string, string> = {}
    questions?.forEach((q) => {
      if (q.type === 'rating' && q.required && !answers[q.id]) next[q.id] = 'Please choose a rating.'
    })
    setErrors(next)
    if (Object.values(next).some(Boolean)) return
    setBusy(true)
    setFailed(false)
    await widgetApi.submitWidgetCsat(answers).then(() => setDone(true), () => setFailed(true))
    setBusy(false)
  }
  const transcript = async (to: string) => {
    setBusy(true)
    setFailed(false)
    await widgetApi.sendTranscript(to).then((r) => onTranscriptSent(r.email), () => setFailed(true))
    setBusy(false)
  }
  const requestTranscript = () => (knownEmail ? transcript(knownEmail) : setAskEmail(true))
  const submitEmail = (e: React.FormEvent) => {
    e.preventDefault()
    if (!isValidEmail(email)) return setEmailError('Enter a valid email address.')
    transcript(email)
  }

  if (done)
    return (
      <div className="gw-card" data-testid="widget-csat-done">
        <div className="gw-success" style={{ padding: '8px 0 0' }}>
          <span className="gw-success-icon"><Check size={22} aria-hidden /></span>
          <p className="gw-card-title">{skip ? 'Chat ended' : 'Thank you, that helps our hatters.'}</p>
          <p className="gw-intro">Would you like a copy of this conversation?</p>
        </div>
        {askEmail ? (
          <form className="gw-form" onSubmit={submitEmail} noValidate data-testid="widget-transcript-email-form">
            <div className="gw-field">
              <label className="gw-label" htmlFor="gw-transcript-email">Where should we send it?</label>
              <input id="gw-transcript-email" className="gw-input" type="email" value={email} aria-invalid={!!emailError} onChange={(e) => { setEmail(e.target.value); setEmailError(undefined) }} data-autofocus="" data-testid="widget-transcript-email" />
              {emailError && <p className="gw-error" role="alert" data-testid="widget-transcript-email-error">{emailError}</p>}
            </div>
            <button type="submit" className="gw-primary" disabled={busy} data-testid="widget-transcript-send">Send transcript</button>
          </form>
        ) : (
          <button type="button" className="gw-secondary" disabled={busy} onClick={requestTranscript} data-testid="widget-transcript-request">
            <Mail size={16} aria-hidden /> Email me this transcript
          </button>
        )}
        {failed && <p className="gw-error" role="alert">Couldn't send the transcript. Try again.</p>}
      </div>
    )

  if (!questions) return <p className="gw-intro" data-testid="widget-csat-loading">Loading a few quick questions…</p>

  return (
    <form className="gw-card" onSubmit={submit} noValidate data-testid="widget-csat" data-style={style}>
      <h3 className="gw-card-title">How did we do?</h3>
      {questions.map((q) => (
        <div key={q.id} className="gw-field">
          <span className="gw-label" id={`gw-q-${q.id}`}>{q.label} {!q.required && <span>(optional)</span>}</span>
          {q.type === 'rating' && <Rating q={q} style={style} value={answers[q.id] as number | undefined} onChange={(v) => set(q.id, v)} />}
          {q.type === 'text' && <textarea className="gw-input" aria-labelledby={`gw-q-${q.id}`} value={(answers[q.id] as string) ?? ''} onChange={(e) => set(q.id, e.target.value)} data-testid={`widget-csat-${q.id}-text`} />}
          {q.type === 'choice' && (
            <div className="gw-rating" role="radiogroup" aria-labelledby={`gw-q-${q.id}`}>
              {q.options?.map((o) => (
                <button key={o} type="button" role="radio" aria-checked={answers[q.id] === o} className="gw-choice" onClick={() => set(q.id, o)}>{o}</button>
              ))}
            </div>
          )}
          {errors[q.id] && <p className="gw-error" role="alert" data-testid={`widget-csat-${q.id}-error`}>{errors[q.id]}</p>}
        </div>
      ))}
      {failed && <p className="gw-error" role="alert">Couldn't send your rating. Try again.</p>}
      <button type="submit" className="gw-primary" disabled={busy} data-testid="widget-csat-submit">Submit</button>
    </form>
  )
}

export function TranscriptSent({ email, onNewChat }: { email: string; onNewChat: () => void }) {
  return (
    <div className="gw-card gw-success" data-testid="widget-transcript-sent">
      <span className="gw-success-icon"><Mail size={22} aria-hidden /></span>
      <p className="gw-card-title">Transcript sent to {email}</p>
      <p className="gw-intro">Thank you for stopping by the shop.</p>
      <button type="button" className="gw-secondary" onClick={onNewChat} data-testid="widget-new-chat">Start a new chat</button>
    </div>
  )
}
