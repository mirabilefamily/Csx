import { useState } from 'react'
import { X } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { FieldError, Input, Label } from '@/components/ui/input'
import { isValidEmail } from '@/lib/format'

export function RecipientsInput({ value, onChange }: { value: string[]; onChange: (v: string[]) => void }) {
  const [draft, setDraft] = useState('')
  const [error, setError] = useState<string | null>(null)
  const add = () => {
    const email = draft.trim().toLowerCase()
    if (!isValidEmail(email)) return setError('Enter a valid email address.')
    if (value.includes(email)) return setError('That recipient is already on the list.')
    onChange([...value, email])
    setDraft('')
    setError(null)
  }
  return (
    <div className="space-y-2">
      <Label htmlFor="recipient-input">Low-score alert recipients</Label>
      <p className="text-xs text-ink-muted">We email these people whenever a response scores 2 or lower.</p>
      <ul className="flex flex-wrap gap-2" aria-label="Recipients" data-testid="recipient-chips">
        {value.map((email) => (
          <li key={email} className="inline-flex items-center gap-1 rounded-full border border-tobacco-200 bg-tobacco-50 py-1 pl-3 pr-1 text-xs font-medium text-tobacco-800" data-testid={`recipient-chip-${email}`}>
            {email}
            <button
              type="button"
              aria-label={`Remove ${email}`}
              onClick={() => onChange(value.filter((v) => v !== email))}
              className="inline-flex h-5 w-5 items-center justify-center rounded-full hover:bg-tobacco-100 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
              data-testid={`recipient-remove-${email}`}
            >
              <X className="h-3 w-3" aria-hidden />
            </button>
          </li>
        ))}
        {value.length === 0 && <li className="text-xs text-ink-subtle">No recipients yet.</li>}
      </ul>
      <div className="flex gap-2">
        <Input
          id="recipient-input"
          type="email"
          value={draft}
          placeholder="name@goorin.com"
          aria-invalid={!!error}
          aria-describedby={error ? 'recipient-error' : undefined}
          onChange={(e) => {
            setDraft(e.target.value)
            setError(null)
          }}
          onKeyDown={(e) => {
            if (e.key === 'Enter') {
              e.preventDefault()
              add()
            }
          }}
          data-testid="recipient-input"
        />
        <Button type="button" variant="outline" onClick={add} data-testid="recipient-add">Add</Button>
      </div>
      <FieldError id="recipient-error">{error}</FieldError>
    </div>
  )
}
