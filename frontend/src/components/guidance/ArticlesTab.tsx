import { useEffect, useMemo, useState } from 'react'
import Papa from 'papaparse'
import { Download, FilePlus2, SearchX, Upload } from 'lucide-react'
import { toast } from 'sonner'
import type { GuidanceArticle } from '@/types'
import { directoryApi, guidanceApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Switch } from '@/components/ui/overlay'
import { Card } from '@/components/ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/skeleton'
import { EmptyState, ErrorState } from '@/components/States'
import { timeAgo } from '@/lib/format'
import { useIsPhone } from '@/hooks/useIsPhone'
import { ArticleEditor } from './ArticleEditor'
import { CsvImportDialog, downloadCsv } from './CsvImportDialog'

function FilterSelect({ label, value, options, onChange, testId }: { label: string; value: string; options: string[]; onChange: (v: string) => void; testId: string }) {
  return (
    <Select value={value} onValueChange={onChange}>
      <SelectTrigger className="h-10 w-full sm:w-44" aria-label={label} data-testid={testId}><SelectValue /></SelectTrigger>
      <SelectContent>
        <SelectItem value="all">All {label.toLowerCase()}</SelectItem>
        {options.map((o) => <SelectItem key={o} value={o}>{o}</SelectItem>)}
      </SelectContent>
    </Select>
  )
}

export function ArticlesTab({ articleId, openArticle }: { articleId: string | null; openArticle: (id: string | null) => void }) {
  const [rev, setRev] = useState(0)
  const isPhone = useIsPhone()
  const { data, loading, error, reload } = useApi(() => directoryApi.listArticles(), [rev])
  const [articles, setArticles] = useState<GuidanceArticle[]>([])
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('all')
  const [tag, setTag] = useState('all')
  const [active, setActive] = useState('all')
  useEffect(() => {
    setArticles(data ?? [])
  }, [data])

  const categories = useMemo(() => [...new Set(articles.map((a) => a.category))].sort(), [articles])
  const tags = useMemo(() => [...new Set(articles.flatMap((a) => a.tags))].sort(), [articles])
  const rows = articles.filter((a) => {
    const s = q.trim().toLowerCase()
    return (!s || a.title.toLowerCase().includes(s) || a.body.toLowerCase().includes(s)) && (category === 'all' || a.category === category) && (tag === 'all' || a.tags.includes(tag)) && (active === 'all' || a.active === (active === 'active'))
  })
  const clear = () => { setQ(''); setCategory('all'); setTag('all'); setActive('all') }

  const toggle = async (a: GuidanceArticle, active: boolean) => {
    try {
      const u = await guidanceApi.setArticleActive(a.id, active)
      setArticles((list) => list.map((x) => (x.id === u.id ? u : x)))
      toast.success(active ? 'Article activated' : 'Article deactivated')
    } catch {
      toast.error("Couldn't update the article. Try again.")
    }
  }

  if (articleId && data) {
    const article = articles.find((a) => a.id === articleId) ?? null
    return <ArticleEditor key={articleId} article={articleId === 'new' ? null : article} categories={categories} onClose={() => openArticle(null)} onSaved={() => { setRev((r) => r + 1); openArticle(null) }} />
  }

  return (
    <div className="space-y-4" data-testid="articles-tab">
      <div className="flex flex-wrap items-center gap-2">
        <Input type="search" placeholder="Search titles and text" aria-label="Search articles" value={q} onChange={(e) => setQ(e.target.value)} className="w-full sm:w-64" data-testid="article-search" />
        <FilterSelect label="Categories" value={category} options={categories} onChange={setCategory} testId="article-category-filter" />
        <FilterSelect label="Tags" value={tag} options={tags} onChange={setTag} testId="article-tag-filter" />
        <Select value={active} onValueChange={setActive}>
          <SelectTrigger className="h-10 w-full sm:w-36" aria-label="Active status" data-testid="article-active-filter"><SelectValue /></SelectTrigger>
          <SelectContent>
            <SelectItem value="all">Active & inactive</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="outline" data-testid="export-csv" onClick={() => downloadCsv('guidance-articles.csv', Papa.unparse(articles.map((a) => ({ title: a.title, body: a.body, category: a.category, tags: a.tags.join(';'), active: a.active, updatedAt: a.updatedAt }))))}><Download aria-hidden /> Export CSV</Button>
          <Button onClick={() => openArticle('new')} data-testid="new-article"><FilePlus2 aria-hidden /> New article</Button>
        </div>
      </div>
      <Card className="overflow-hidden">
        {loading ? (
          <div className="space-y-2 p-4">{Array.from({ length: 6 }, (_, i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
        ) : error ? (
          <ErrorState compact title="Articles didn't load" onRetry={reload} testId="articles-error" />
        ) : !articles.length ? (
          <EmptyState compact title="No articles yet" description="Write your first article or import a CSV." testId="articles-empty" />
        ) : !rows.length ? (
          <EmptyState compact title="No articles match your search" icon={<SearchX className="h-5 w-5" aria-hidden />} action={<Button size="sm" variant="outline" onClick={clear} data-testid="articles-clear-filters">Clear filters</Button>} testId="articles-no-match" />
        ) : (
          <ul className="divide-y divide-border" data-testid="articles-table">
            {rows.map((a) => (
              <li key={a.id} className="flex items-center gap-4 px-5 py-3.5 transition-colors hover:bg-surface-sunken max-sm:items-start max-sm:px-4" data-testid={`article-row-${a.id}`}>
                <button type="button" onClick={() => openArticle(a.id)} className="min-h-11 min-w-0 flex-1 rounded text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid={`article-open-${a.id}`}>
                  <span className="block font-medium text-ink">{a.title}</span>
                  <span className="mt-1.5 flex flex-wrap gap-1">
                    <span className="rounded-full bg-tobacco-50 px-2 py-0.5 text-xs font-medium text-tobacco-800">{a.category}</span>
                    {a.tags.map((t) => <span key={t} className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-ink">{t}</span>)}
                  </span>
                  {isPhone && <span className="mt-1 block text-xs text-ink-muted">v{a.version} · {stamp(a.updatedAt)}</span>}
                </button>
                {!isPhone && <span className="whitespace-nowrap text-xs tabular-nums text-ink-muted" data-testid={`article-version-${a.id}`}>v{a.version} · {stamp(a.updatedAt)}</span>}
                <label className="flex min-h-11 items-center"><Switch checked={a.active} onCheckedChange={(v) => toggle(a, v)} aria-label={`${a.title} active`} data-testid={`article-active-${a.id}`} /></label>
              </li>
            ))}
          </ul>
        )}
      </Card>
    </div>
  )
}

const stamp = (iso: string) => new Date(iso).toLocaleString(undefined, { month: 'short', day: 'numeric', hour: 'numeric', minute: '2-digit' })
