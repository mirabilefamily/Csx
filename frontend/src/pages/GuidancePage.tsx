import { useSearchParams } from 'react-router-dom'
import { PageHeader } from '@/components/PageHeader'
import { useUnsavedGuard } from '@/components/UnsavedGuard'
import { ArticlesTab } from '@/components/guidance/ArticlesTab'
import { MacrosTab } from '@/components/guidance/MacrosTab'
import { SandboxTab } from '@/components/guidance/SandboxTab'
import { cn } from '@/lib/utils'

const TABS = [
  { id: 'articles', label: 'Articles' },
  { id: 'macros', label: 'Macros' },
  { id: 'sandbox', label: 'Test Sandbox' },
] as const

export default function GuidancePage() {
  const [params, setParams] = useSearchParams()
  const { confirmLeave } = useUnsavedGuard()
  const article = params.get('article')
  const tab = article ? 'articles' : TABS.find((t) => t.id === params.get('tab'))?.id ?? 'articles'
  const go = (next: Record<string, string>) => setParams(next)

  return (
    <div className="space-y-6" data-testid="guidance-page">
      <PageHeader title="Guidance" description="What Claude and Grokbot know, and how your team replies." />
      <div role="tablist" aria-label="Guidance sections" className="flex gap-1 overflow-x-auto border-b border-border">
        {TABS.map((t) => (
          <button
            key={t.id}
            role="tab"
            aria-selected={tab === t.id}
            data-testid={`guidance-tab-${t.id}`}
            onClick={() => tab !== t.id && confirmLeave(() => go({ tab: t.id }))}
            className={cn('-mb-px whitespace-nowrap border-b-2 px-4 py-2.5 text-sm font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring', tab === t.id ? 'border-brass-500 text-ink' : 'border-transparent text-ink-muted hover:text-ink')}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div role="tabpanel" aria-label={TABS.find((t) => t.id === tab)?.label}>
        {tab === 'articles' && <ArticlesTab articleId={article} openArticle={(id) => go(id ? { tab: 'articles', article: id } : { tab: 'articles' })} />}
        {tab === 'macros' && <MacrosTab />}
        {tab === 'sandbox' && <SandboxTab />}
      </div>
    </div>
  )
}
