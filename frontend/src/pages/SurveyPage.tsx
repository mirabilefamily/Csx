import { useEffect, useMemo, useState } from 'react'
import { useParams, useSearchParams } from 'react-router-dom'
import { Check, Link2Off, MessageSquareHeart, Star } from 'lucide-react'
import { surveyApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import type { CsatAnswers, CsatQuestion } from '@/types'
import { ErrorState } from '@/components/States'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import { GoorinWordmark } from '@/components/brand/GoorinBrand'

const CAPTIONS = ['Poor', 'Fair', 'Good', 'Very good', 'Excellent']

function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-[100dvh] bg-background font-sans text-ink" data-testid="survey-page">
      <header className="bg-tobacco-900 px-5 pb-6 pt-[max(20px,env(safe-area-inset-top))] text-center text-brass-100">
        <GoorinWordmark width={150} tone="cream" className="mx-auto" alt="Goorin Bros." />
        <p className="mt-2.5 text-[10px] uppercase tracking-[0.28em] text-brass-300">Hat makers since 1895</p>
      </header>
      <main className="mx-auto w-full max-w-[520px] px-5 pb-28 pt-6">{children}</main>
    </div>
  )
}

function Message({ icon, title, body, testId }: { icon: React.ReactNode; title: string; body: string; testId: string }) {
  return (
    <div className="rounded-[14px] border border-border bg-surface px-6 py-10 text-center" data-testid={testId}>
      <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-brass-50 text-brass-700">{icon}</span>
      <h1 className="mt-5 font-display text-[26px] font-semibold leading-tight">{title}</h1>
      <p className="mt-2 text-[15px] text-ink-muted">{body}</p>
    </div>
  )
}

function RatingStep({ q, value, onChange }: { q: CsatQuestion; value?: number; onChange: (n: number) => void }) {
  return (
    <div role="radiogroup" aria-labelledby="survey-q" className="grid grid-cols-5 gap-2">
      {[1, 2, 3, 4, 5].map((n) => (
        <button key={n} type="button" role="radio" aria-checked={value === n} aria-label={`${n}, ${CAPTIONS[n - 1]}`} onClick={() => onChange(n)} className={cn('flex min-h-[72px] flex-col items-center justify-center gap-1 rounded-[12px] border text-[18px] font-semibold transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', value === n ? 'border-tobacco-600 bg-tobacco-600 text-white' : 'border-border-strong bg-surface text-ink hover:bg-surface-muted')} data-testid={`survey-rate-${q.id}-${n}`}>
          <Star className={cn('h-5 w-5', value !== undefined && n <= value ? 'fill-current' : '')} aria-hidden />
          {n}
        </button>
      ))}
      <span className="col-span-5 flex justify-between px-1 text-[12px] text-ink-muted" aria-hidden><span>Poor</span><span>Excellent</span></span>
    </div>
  )
}

function SurveyFlow({ token, subject, ticketId, firstName, questions, preselect }: { token: string; subject: string; ticketId: string; firstName: string; questions: CsatQuestion[]; preselect: number | null }) {
  const firstRating = questions.find((q) => q.type === 'rating')
  const [answers, setAnswers] = useState<CsatAnswers>(() => (firstRating && preselect ? { [firstRating.id]: preselect } : {}))
  const [step, setStep] = useState(0)
  const [error, setError] = useState<string>()
  const [busy, setBusy] = useState(false)
  const [done, setDone] = useState(false)
  const [failed, setFailed] = useState(false)
  const q = questions[step]
  const last = step === questions.length - 1
  const value = q ? answers[q.id] : undefined
  const missing = q && ((q.type === 'rating' && !value) || (q.required && q.type !== 'rating' && !String(value ?? '').trim()))

  const next = async () => {
    if (missing) return setError(q.type === 'rating' ? 'Please choose a rating.' : q.type === 'choice' ? 'Please choose an option.' : 'Please add an answer.')
    if (!last) return setStep((s) => s + 1)
    setBusy(true)
    setFailed(false)
    await surveyApi.submitSurvey(token, answers).then(() => setDone(true), () => setFailed(true))
    setBusy(false)
  }
  const set = (v: string | number) => {
    setAnswers((a) => ({ ...a, [q.id]: v }))
    setError(undefined)
  }

  if (done) return <Message icon={<Check className="h-7 w-7" />} title="Thank you for your feedback" body={`It goes straight to the team who helped you, ${firstName}. We read every word.`} testId="survey-thanks" />

  return (
    <div>
      <p className="text-[15px] text-ink-muted">Hi {firstName}, how did we do?</p>
      <p className="mt-1 text-[13px] text-ink-subtle" data-testid="survey-ticket">About your request: <span className="font-medium text-ink">{subject}</span> · <span className="whitespace-nowrap">{ticketId}</span></p>
      <div className="mt-6">
        <div className="flex items-center justify-between text-[12px] font-medium text-ink-muted"><span data-testid="survey-progress-label">Step {step + 1} of {questions.length}</span></div>
        <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-surface-muted" role="progressbar" aria-valuemin={1} aria-valuemax={questions.length} aria-valuenow={step + 1} aria-label="Survey progress">
          <div className="h-full rounded-full bg-brass-500 transition-[width] duration-300" style={{ width: `${((step + 1) / questions.length) * 100}%` }} />
        </div>
      </div>
      <section key={q.id} className="mt-6 animate-in fade-in slide-in-from-right-2 rounded-[14px] border border-border bg-surface p-5" data-testid={`survey-step-${step + 1}`}>
        <h1 id="survey-q" className="text-[18px] font-semibold leading-snug">{q.label}{!q.required && q.type !== 'rating' && <span className="ml-1 text-[13px] font-normal text-ink-muted">(optional)</span>}</h1>
        <div className="mt-5">
          {q.type === 'rating' && <RatingStep q={q} value={value as number | undefined} onChange={set} />}
          {q.type === 'text' && (
            <textarea aria-labelledby="survey-q" value={(value as string) ?? ''} onChange={(e) => set(e.target.value)} rows={5} className="w-full rounded-[10px] border border-border-strong bg-background p-3 text-[16px] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" placeholder="Tell us in your own words" data-testid="survey-text" />
          )}
          {q.type === 'choice' && (
            <div role="radiogroup" aria-labelledby="survey-q" className="space-y-2">
              {q.options?.map((o) => (
                <button key={o} type="button" role="radio" aria-checked={value === o} onClick={() => set(o)} className={cn('flex min-h-[48px] w-full items-center rounded-[10px] border px-4 text-left text-[15px]', value === o ? 'border-tobacco-600 bg-tobacco-50 font-medium' : 'border-border-strong bg-surface')}>{o}</button>
              ))}
            </div>
          )}
        </div>
        {error && <p className="mt-3 text-[14px] text-red-600" role="alert" data-testid="survey-error">{error}</p>}
        {failed && <p className="mt-3 text-[14px] text-red-600" role="alert">We couldn't save your answers. Try again.</p>}
      </section>
      <div className="mt-6 flex gap-3">
        {step > 0 && <button type="button" onClick={() => { setStep((s) => s - 1); setError(undefined) }} className="h-12 min-w-[96px] rounded-[10px] border border-border-strong bg-surface px-5 text-[15px] font-medium" data-testid="survey-back">Back</button>}
        <button type="button" onClick={next} aria-disabled={!!missing} disabled={busy} className={cn('h-12 flex-1 rounded-[10px] bg-tobacco-600 px-5 text-[15px] font-semibold text-white transition-opacity focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2', missing && 'opacity-50')} data-testid="survey-next">
          {busy ? 'Sending…' : last ? 'Submit' : 'Next'}
        </button>
      </div>
    </div>
  )
}

export default function SurveyPage() {
  const { token = '' } = useParams()
  const [params] = useSearchParams()
  const { data, loading, error, reload } = useApi(() => surveyApi.getSurvey(token), [token])
  const preselect = useMemo(() => {
    const n = Number(params.get('score'))
    return Number.isInteger(n) && n >= 1 && n <= 5 ? n : null
  }, [params])
  useEffect(() => {
    document.title = 'Share your feedback · Goorin Bros.'
  }, [])

  return (
    <Shell>
      {loading && (
        <div className="space-y-4" data-testid="survey-loading"><Skeleton className="h-5 w-2/3" /><Skeleton className="h-2 w-full" /><Skeleton className="h-48 w-full" /></div>
      )}
      {error && <ErrorState title="The survey didn't load" description="Check your connection and try again." onRetry={reload} />}
      {data?.status === 'invalid' && <Message icon={<Link2Off className="h-6 w-6" />} title="This survey link isn't valid" body="It may have been mistyped. If you'd like to share feedback, simply reply to any email from us." testId="survey-invalid" />}
      {data?.status === 'completed' && <Message icon={<MessageSquareHeart className="h-6 w-6" />} title="You've already shared your feedback" body={`Thank you. We've got your answers for "${data.ticketSubject}".`} testId="survey-completed" />}
      {data?.status === 'valid' && data.questions.length > 0 && (
        <SurveyFlow token={data.token} subject={data.ticketSubject} ticketId={data.ticketId} firstName={data.firstName} questions={data.questions} preselect={preselect} />
      )}
    </Shell>
  )
}
