import { useHideBottomTabBar } from '@/components/shell/BottomTabBar'
import { useState } from 'react'
import ReactMarkdown from 'react-markdown'
import { ArrowLeft } from 'lucide-react'
import { toast } from 'sonner'
import type { GuidanceArticle } from '@/types'
import { guidanceApi } from '@/api'
import { useAuth } from '@/components/auth/AuthContext'
import { useUnsavedGuard } from '@/components/UnsavedGuard'
import { Button } from '@/components/ui/button'
import { FieldError, Input, Label, Textarea } from '@/components/ui/input'
import { Switch } from '@/components/ui/overlay'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

export const markdownStyles = '[&_a]:text-tobacco-700 [&_a]:underline [&_h1]:text-xl [&_h1]:font-semibold [&_h2]:mt-4 [&_h2]:text-lg [&_h2]:font-semibold [&_h3]:mt-3 [&_h3]:font-semibold [&_li]:my-0.5 [&_ol]:list-decimal [&_ol]:pl-5 [&_p]:my-2 [&_strong]:font-semibold [&_table]:my-2 [&_td]:border [&_td]:border-border [&_td]:px-2 [&_th]:border [&_th]:border-border [&_th]:px-2 [&_ul]:list-disc [&_ul]:pl-5'

interface Props {
  article: GuidanceArticle | null
  categories: string[]
  onClose: () => void
  onSaved: (a: GuidanceArticle) => void
}

export function ArticleEditor({ article, categories, onClose, onSaved }: Props) {
  const { user } = useAuth()
  const initial = { title: article?.title ?? '', category: article?.category ?? categories[0] ?? 'General', tags: article?.tags.join(', ') ?? '', body: article?.body ?? '', active: article?.active ?? true }
  const [form, setForm] = useState(initial)
  const [errors, setErrors] = useState<{ title?: string; body?: string }>({})
  const [pane, setPane] = useState<'write' | 'preview'>('write')
  const [saving, setSaving] = useState(false)
  const dirty = JSON.stringify(form) !== JSON.stringify(initial)
  const { confirmLeave } = useUnsavedGuard('article-editor', dirty)
  useHideBottomTabBar(true)
  const set = (patch: Partial<typeof form>) => setForm((f) => ({ ...f, ...patch }))

  const save = async () => {
    const errs = { title: form.title.trim() ? undefined : 'Title is required.', body: form.body.trim() ? undefined : 'Article body is required.' }
    setErrors(errs)
    if (errs.title || errs.body || !user) return
    setSaving(true)
    try {
      const saved = await guidanceApi.saveArticle({ id: article?.id, title: form.title, category: form.category, tags: form.tags.split(',').map((t) => t.trim()).filter(Boolean), body: form.body, active: form.active }, user)
      toast.success('Article saved')
      onSaved(saved)
    } catch (e) {
      toast.error((e as Error).message)
      setSaving(false)
    }
  }

  return (
    <div className="space-y-5" data-testid="article-editor">
      <div className="flex flex-wrap items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => confirmLeave(onClose)} data-testid="article-back"><ArrowLeft aria-hidden /> All articles</Button>
        <p className="text-sm text-ink-muted">{article ? 'Editing article' : 'New article'}{dirty && ' · Unsaved changes'}</p>
        <div className="ml-auto flex gap-2">
          <Button variant="outline" onClick={() => confirmLeave(onClose)}>Cancel</Button>
          <Button onClick={save} loading={saving} data-testid="article-save">Save</Button>
        </div>
      </div>
      <Card className="grid gap-4 p-5 md:grid-cols-[2fr_1fr_1fr_auto] md:items-start">
        <div>
          <Label htmlFor="article-title">Title</Label>
          <Input id="article-title" className="mt-1.5" value={form.title} onChange={(e) => set({ title: e.target.value })} aria-invalid={!!errors.title} data-testid="article-title" />
          <FieldError>{errors.title}</FieldError>
        </div>
        <div>
          <Label htmlFor="article-category">Category</Label>
          <Input id="article-category" className="mt-1.5" list="article-categories" value={form.category} onChange={(e) => set({ category: e.target.value })} data-testid="article-category" />
          <datalist id="article-categories">{categories.map((c) => <option key={c} value={c} />)}</datalist>
        </div>
        <div>
          <Label htmlFor="article-tags">Tags (comma separated)</Label>
          <Input id="article-tags" className="mt-1.5" value={form.tags} onChange={(e) => set({ tags: e.target.value })} data-testid="article-tags" />
        </div>
        <label className="flex items-center gap-2 text-sm text-ink md:mt-8"><Switch checked={form.active} onCheckedChange={(v) => set({ active: v })} aria-label="Active" /> Active</label>
      </Card>
      <div role="tablist" aria-label="Editor panes" className="inline-flex rounded-lg border border-border bg-surface p-1 lg:hidden">
        {(['write', 'preview'] as const).map((p) => (
          <button key={p} role="tab" aria-selected={pane === p} onClick={() => setPane(p)} data-testid={`editor-tab-${p}`} className={cn('h-8 rounded-md px-3 text-sm font-medium capitalize focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', pane === p ? 'bg-tobacco-600 text-white' : 'text-ink-muted')}>{p}</button>
        ))}
      </div>
      <div className="grid gap-4 lg:grid-cols-2">
        <div className={cn(pane === 'preview' && 'hidden lg:block')}>
          <Label htmlFor="article-body">Markdown</Label>
          <Textarea id="article-body" className="mt-1.5 min-h-[420px] font-mono text-[13px]" value={form.body} onChange={(e) => set({ body: e.target.value })} aria-invalid={!!errors.body} data-testid="article-body" />
          <FieldError>{errors.body}</FieldError>
        </div>
        <div className={cn(pane === 'write' && 'hidden lg:block')}>
          <p className="text-sm font-medium text-ink">Preview</p>
          <Card className={cn('mt-1.5 min-h-[420px] p-5 text-sm text-ink', markdownStyles)} data-testid="article-preview">
            {form.body.trim() ? <ReactMarkdown>{form.body}</ReactMarkdown> : <p className="text-ink-subtle">Start writing to see the preview.</p>}
          </Card>
        </div>
      </div>
    </div>
  )
}
