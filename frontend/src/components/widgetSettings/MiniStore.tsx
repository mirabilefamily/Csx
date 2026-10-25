import { widgetApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import type { StorePageType } from '@/types'
import { ShoppingBag } from 'lucide-react'
import { GoorinWordmark } from '@/components/brand/GoorinBrand'

export const PREVIEW_PATHS: Record<'product' | 'collection' | 'cart', string> = {
  product: '/products/hampton-wool-fedora',
  collection: '/collections/fall-felt',
  cart: '/cart',
}

export const STORE_FONT = 'Georgia, "Times New Roman", serif'

// Compact storefront used behind the widget in previews. Uses a serif "store theme" font so font inheritance is visible.
export function MiniStore({ page, compact }: { page: Extract<StorePageType, 'product' | 'collection' | 'cart'>; compact?: boolean }) {
  const { data } = useApi(() => widgetApi.listStoreProducts(), [])
  const products = data ?? []
  const p = products[0]
  return (
    <div className="h-full overflow-hidden bg-[#FBF8F3] text-[#2E2219]" style={{ fontFamily: STORE_FONT }} data-testid={`mini-store-${page}`}>
      <div className="bg-[#2E2219] py-1 text-center text-[9px] uppercase tracking-[0.18em] text-[#F1E6CF]">Free shipping over $100</div>
      <div className="flex items-center justify-between border-b border-[#E6DED2] px-4 py-2.5">
        <GoorinWordmark width={92} alt="Goorin Bros." />
        {!compact && <span className="flex gap-3 text-[10px] text-[#6B5E50]"><span>Fedoras</span><span>Caps</span><span>Straw</span></span>}
        <ShoppingBag className="h-4 w-4" aria-hidden />
      </div>
      {page === 'product' && p && (
        <div className={compact ? 'p-3' : 'grid grid-cols-2 gap-4 p-4'}>
          <img src={p.image} alt="" className="aspect-square w-full rounded-md object-cover" />
          <div className={compact ? 'mt-3' : ''}>
            <p className="text-[18px] font-semibold leading-tight">{p.name}</p>
            <p className="mt-1 text-[13px]">${p.price}.00</p>
            <p className="mt-2 text-[11px] leading-relaxed text-[#4A3F35]">{p.description}</p>
            <div className="mt-3 h-8 rounded bg-[#6B4F3A]" />
          </div>
        </div>
      )}
      {page === 'collection' && (
        <div className="p-4">
          <p className="text-[18px] font-semibold">All hats</p>
          <div className={`mt-3 grid gap-3 ${compact ? 'grid-cols-2' : 'grid-cols-3'}`}>
            {products.slice(0, compact ? 4 : 6).map((x) => (
              <div key={x.id}>
                <img src={x.image} alt="" className="aspect-square w-full rounded-md object-cover" />
                <p className="mt-1 truncate text-[10px]">{x.name}</p>
              </div>
            ))}
          </div>
        </div>
      )}
      {page === 'cart' && (
        <div className="p-4">
          <p className="text-[18px] font-semibold">Your cart</p>
          {products.slice(0, 2).map((x) => (
            <div key={x.id} className="mt-3 flex items-center gap-3 border-b border-[#E6DED2] pb-3">
              <img src={x.image} alt="" className="h-14 w-14 rounded object-cover" />
              <span className="flex-1 text-[12px]">{x.name}</span>
              <span className="text-[12px]">${x.price}.00</span>
            </div>
          ))}
          <div className="mt-4 h-8 rounded bg-[#6B4F3A]" />
        </div>
      )}
    </div>
  )
}
