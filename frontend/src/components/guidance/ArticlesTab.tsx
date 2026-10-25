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
  const { data, loading, error, reload } = useApi(() => directoryApi.listArticles(), [rev])
  const [articles, setArticles] = useState<GuidanceArticle[]>([])
  const [q, setQ] = useState('')
  const [category, setCategory] = useState('all')
  const [tag, setTag] = useState('all')
  const [importing, setImporting] = useState(false)
  useEffect(() => {
    setArticles(data ?? [])
  }, [data])

  const categories = useMemo(() => [...new Set(articles.map((a) => a.category))].sort(), [articles])
  const tags = useMemo(() => [...new Set(articles.flatMap((a) => a.tags))].sort(), [articles])
  const rows = articles.filter((a) => {
    const s = q.trim().toLowerCase()
    return (!s || a.title.toLowerCase().includes(s) || a.body.toLowerCase().includes(s)) && (category === 'all' || a.category === category) && (tag === 'all' || a.tags.includes(tag))
  })
  const clear = () => { setQ(''); setCategory('all'); setTag('all') }

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
        <Input type="search" placeholder="Search articles" aria-label="Search articles" value={q} onChange={(e) => setQ(e.target.value)} className="w-full sm:w-64" data-testid="article-search" />
        <FilterSelect label="Categories" value={category} options={categories} onChange={setCategory} testId="article-category-filter" />
        <FilterSelect label="Tags" value={tag} options={tags} onChange={setTag} testId="article-tag-filter" />
        <div className="ml-auto flex flex-wrap gap-2">
          <Button variant="outline" onClick={() => setImporting(true)} data-testid="import-csv"><Upload aria-hidden /> Import CSV</Button>
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
          <Table data-testid="articles-table">
            <TableHeader><TableRow><TableHead>Title</TableHead><TableHead>Category</TableHead><TableHead>Tags</TableHead><TableHead>Active</TableHead><TableHead>Last updated</TableHead></TableRow></TableHeader>
            <TableBody>
              {rows.map((a) => (
                <TableRow key={a.id} data-testid={`article-row-${a.id}`}>
                  <TableCell className="min-w-[220px]"><button type="button" onClick={() => openArticle(a.id)} className="rounded text-left font-medium text-ink hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid={`article-open-${a.id}`}>{a.title}</button></TableCell>
                  <TableCell className="whitespace-nowrap text-ink-muted">{a.category}</TableCell>
                  <TableCell><span className="flex flex-wrap gap-1">{a.tags.map((t) => <span key={t} className="rounded-full bg-surface-muted px-2 py-0.5 text-xs text-ink">{t}</span>)}</span></TableCell>
                  <TableCell><Switch checked={a.active} onCheckedChange={(v) => toggle(a, v)} aria-label={`${a.title} active`} data-testid={`article-active-${a.id}`} /></TableCell>
                  <TableCell className="whitespace-nowrap text-ink-muted">{timeAgo(a.updatedAt)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        )}
      </Card>
      <CsvImportDialog open={importing} onOpenChange={setImporting} onImported={() => setRev((r) => r + 1)} />
    </div>
  )
}
