import { Link, useSearchParams } from 'react-router-dom'
import { ArrowUpRight, FilePlus2 } from 'lucide-react'
import { PageHeader } from '@/components/PageHeader'
import { useUnsavedGuard } from '@/components/UnsavedGuard'
import { useAuth } from '@/components/auth/AuthContext'
import { Button } from '@/components/ui/button'
import { SubTabs } from '@/components/PageTabs'
import { ArticlesTab } from '@/components/guidance/ArticlesTab'
import { MacrosTab } from '@/components/guidance/MacrosTab'
import { CsvImportDialog } from '@/components/guidance/CsvImportDialog'

type Tab = 'articles' | 'macros' | 'import'
const TABS: { id: Tab; label: string }[] = [
  { id: 'articles', label: 'Articles' },
  { id: 'macros', label: 'Macros' },
  { id: 'import', label: 'Import CSV' },
]

export default function GuidancePage() {
  const [params, setParams] = useSearchParams()
  const { confirmLeave } = useUnsavedGuard()
  const { user } = useAuth()
  const article = params.get('article')
  const tab: Tab = article ? 'articles' : TABS.find((t) => t.id === params.get('tab'))?.id ?? 'articles'
  const go = (next: Record<string, string>) => setParams(next)

  return (
    <div className="space-y-6" data-testid="guidance-page">
      <PageHeader
        title="Guidance"
        description="What Claude knows, and how your team replies."
        actions={
          <>
            {user?.role === 'admin' && (
              <Link to="/ai" className="inline-flex min-h-11 items-center gap-1 rounded px-2 text-sm font-medium text-tobacco-700 hover:underline focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid="guidance-ai-link">
                Brand voice, workflows and testing <ArrowUpRight className="h-4 w-4" aria-hidden />
              </Link>
            )}
            <Button onClick={() => confirmLeave(() => go({ tab: 'articles', article: 'new' }))} data-testid="new-article"><FilePlus2 aria-hidden /> New article</Button>
          </>
        }
      />
      <div className="space-y-3">
        <SubTabs tabs={TABS} value={tab} onChange={(t) => tab !== t && confirmLeave(() => go({ tab: t }))} label="Guidance sections" testIdPrefix="guidance-tab" />
        <p className="text-sm text-ink-muted" data-testid="guidance-helper">Active articles guide Claude's chat replies and agent drafts. Publish customer-safe policy only.</p>
      </div>
      <div role="tabpanel" aria-label={TABS.find((t) => t.id === tab)?.label}>
        {tab === 'articles' && <ArticlesTab articleId={article} openArticle={(id) => go(id ? { tab: 'articles', article: id } : { tab: 'articles' })} />}
        {tab === 'macros' && <MacrosTab />}
        {tab === 'import' && <CsvImportDialog inline open onOpenChange={() => go({ tab: 'articles' })} onImported={() => go({ tab: 'articles' })} />}
      </div>
    </div>
  )
}
