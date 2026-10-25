import { useEffect, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { widgetApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import type { WidgetState } from '@/types'
import { SupportWidget } from '@/components/widget/SupportWidget'
import { StoreFooter, StoreHeader } from '@/components/storefront/StoreChrome'
import { CartPage, CollectionPage, ProductPage } from '@/components/storefront/StorePages'
import { DemoControls } from '@/components/storefront/DemoControls'
import { HOSTILE_CSS } from '@/components/storefront/hostileCss'
import { STORE_PAGES, type StorePage } from '@/components/storefront/storeTypes'
import { ErrorState } from '@/components/States'
import { Skeleton } from '@/components/ui/skeleton'

function useHostileCss(on: boolean) {
  useEffect(() => {
    if (!on) return
    const style = document.createElement('style')
    style.id = 'hostile-store-css'
    style.textContent = HOSTILE_CSS
    document.head.appendChild(style)
    return () => style.remove()
  }, [on])
}

export default function WidgetDemoPage() {
  const [params, setParams] = useSearchParams()
  const page = (STORE_PAGES.find((p) => p.id === params.get('page'))?.id ?? 'product') as StorePage
  const isDeskPreview = params.get('desk_preview') === '1'
  const [deskDraft] = useState(() => (isDeskPreview ? widgetApi.takeDeskPreview() : null))
  const live = useApi(() => widgetApi.getEffectiveWidgetSettings(), [])
  const settings = { data: deskDraft ?? (live.data?.embedEnabled ? live.data.settings : undefined) }
  const embedOff = !deskDraft && live.data && !live.data.embedEnabled
  const products = useApi(() => widgetApi.listStoreProducts(), [])
  const [toggles, setToggles] = useState({ loggedIn: false, outsideHours: false, hostile: false })
  const [jump, setJump] = useState<{ state?: WidgetState; n: number }>({ n: 0 })
  useHostileCss(toggles.hostile)
  useEffect(() => {
    document.title = 'Goorin Bros. Hat Shop (widget demo)'
  }, [])

  const goto = (p: StorePage) => {
    setParams({ page: p })
    window.scrollTo({ top: 0 })
  }
  const onToggle = (k: keyof typeof toggles, v: boolean) => {
    setToggles((t) => ({ ...t, [k]: v }))
    if (k !== 'hostile') setJump((j) => ({ n: j.n + 1 }))
  }
  const list = products.data ?? []
  const side = settings.data?.launcher.position === 'bottom-left' ? 'right' : 'left'

  return (
    <div id="top" className="min-h-screen bg-[#FBF8F3] font-sans text-[#2E2219]" data-testid="widget-demo-page">
      {isDeskPreview && (
        <p className="bg-brass-100 px-4 py-2 text-center text-[13px] font-medium text-tobacco-800" role="status" data-testid="desk-preview-banner">
          {deskDraft ? 'Previewing unsaved settings from Goorin Support Desk' : 'This preview has ended. Showing your saved widget settings.'}
        </p>
      )}
      {embedOff && (
        <p className="bg-surface-muted px-4 py-2 text-center text-[13px] text-ink-muted" data-testid="embed-off-banner">
          The Goorin Support Desk app embed is off in the theme editor, so the widget isn't loaded.
        </p>
      )}
      <StoreHeader page={page} cartCount={2} onNavigate={goto} />
      <main>
        {products.loading && (
          <div className="mx-auto grid max-w-[1280px] gap-10 px-8 pt-10 lg:grid-cols-2">
            <Skeleton className="aspect-square w-full" />
            <div className="space-y-4"><Skeleton className="h-10 w-2/3" /><Skeleton className="h-6 w-1/4" /><Skeleton className="h-24 w-full" /></div>
          </div>
        )}
        {products.error && <div className="mx-auto max-w-xl px-4 pt-16"><ErrorState title="The shop didn't load" onRetry={products.reload} /></div>}
        {products.data && list.length === 0 && <p className="px-8 pt-16 text-center text-[15px] text-[#6B5E50]" data-testid="store-empty">No hats in this collection yet.</p>}
        {list.length > 0 && page === 'product' && <ProductPage products={list} />}
        {list.length > 0 && page === 'collection' && <CollectionPage products={list} />}
        {list.length > 0 && page === 'cart' && <CartPage products={list} />}
      </main>
      <StoreFooter />
      <DemoControls side={side} page={page} onPage={goto} current={jump.state} onJump={(s) => setJump((j) => ({ state: s, n: j.n + 1 }))} toggles={toggles} onToggle={onToggle} />
      {settings.data && (
        <SupportWidget
          key={jump.n}
          settings={settings.data}
          forcedState={jump.state}
          pageType={page}
          pagePath={STORE_PAGES.find((p) => p.id === page)!.path}
          loggedIn={toggles.loggedIn}
          outsideHours={toggles.outsideHours}
        />
      )}
    </div>
  )
}
