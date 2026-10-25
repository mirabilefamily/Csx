import { Menu, Search, ShoppingBag, User } from 'lucide-react'
import { GoorinWordmark } from '@/components/brand/GoorinBrand'
import type { StorePage } from './storeTypes'

const NAV = ['New Arrivals', 'Fedoras', 'Caps', 'Straw', 'Western', 'Women', 'Our Story']

export function StoreHeader({ page, cartCount, onNavigate }: { page: StorePage; cartCount: number; onNavigate: (p: StorePage) => void }) {
  return (
    <header className="sticky top-0 z-20 border-b border-[#E6DED2] bg-[#FBF8F3]/95 backdrop-blur" data-testid="store-header">
      <p className="bg-[#2E2219] px-4 py-2 text-center text-[12px] tracking-[0.12em] text-[#F1E6CF] uppercase">Free shipping over $100 · Hand-finished in San Francisco since 1895</p>
      <div className="mx-auto flex h-[72px] max-w-[1280px] items-center gap-4 px-4 sm:px-8">
        <button type="button" className="rounded-md p-2 text-[#2E2219] lg:hidden" aria-label="Open menu"><Menu className="h-5 w-5" /></button>
        <button type="button" onClick={() => onNavigate('collection')} className="flex flex-col leading-none" data-testid="store-logo">
          <GoorinWordmark width={150} alt="Goorin Bros." />
          <span className="mt-1.5 text-[10px] uppercase tracking-[0.28em] text-[#8C6A35]">Hat Shop · Est. 1895</span>
        </button>
        <nav aria-label="Store" className="ml-8 hidden flex-1 items-center gap-6 lg:flex">
          {NAV.map((n) => (
            <button key={n} type="button" onClick={() => onNavigate('collection')} className="text-[14px] text-[#3E2D21] underline-offset-4 hover:underline">{n}</button>
          ))}
        </nav>
        <div className="ml-auto flex items-center gap-1">
          <button type="button" className="rounded-full p-2.5 text-[#2E2219] hover:bg-[#F1E9DD]" aria-label="Search the store"><Search className="h-5 w-5" /></button>
          <button type="button" className="hidden rounded-full p-2.5 text-[#2E2219] hover:bg-[#F1E9DD] sm:inline-flex" aria-label="Account"><User className="h-5 w-5" /></button>
          <button type="button" onClick={() => onNavigate('cart')} className="relative rounded-full p-2.5 text-[#2E2219] hover:bg-[#F1E9DD]" aria-label={`Cart, ${cartCount} items`} data-testid="store-cart-link">
            <ShoppingBag className="h-5 w-5" />
            <span className="absolute right-0.5 top-0.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[#6B4F3A] px-1 text-[10px] font-semibold text-white">{cartCount}</span>
          </button>
        </div>
      </div>
      <p className="sr-only" aria-live="polite">Viewing {page} page</p>
    </header>
  )
}

export function StoreFooter() {
  const cols = [
    ['Shop', ['Fedoras', 'Flat caps', 'Truckers', 'Straw', 'Gift cards']],
    ['Help', ['Size guide', 'Shipping', 'Returns & exchanges', 'Hat care', 'Contact']],
    ['Goorin', ['Our story', 'Hat shops', 'Wholesale', 'Careers']],
  ] as const
  return (
    <footer className="mt-24 bg-[#2E2219] text-[#E9DFD1]" data-testid="store-footer">
      <div className="mx-auto grid max-w-[1280px] gap-10 px-4 py-16 sm:px-8 md:grid-cols-[1.4fr_repeat(3,1fr)]">
        <div>
          <p className="font-display text-[24px] font-semibold text-white">Goorin Bros.</p>
          <p className="mt-3 max-w-xs text-[14px] leading-relaxed text-[#CBBBA6]">Four generations of hat makers. Every piece is blocked, trimmed and finished by hand.</p>
          <form className="mt-6 flex max-w-sm gap-2" onSubmit={(e) => e.preventDefault()}>
            <label htmlFor="store-news" className="sr-only">Email for newsletter</label>
            <input id="store-news" placeholder="Your email" className="h-11 flex-1 rounded-md border border-[#5A4636] bg-transparent px-3 text-[14px] text-white placeholder:text-[#A8977F]" />
            <button type="submit" className="h-11 rounded-md bg-[#B08D57] px-4 text-[14px] font-semibold text-[#2E2219]">Join</button>
          </form>
        </div>
        {cols.map(([title, links]) => (
          <div key={title}>
            <p className="text-[12px] uppercase tracking-[0.2em] text-[#B08D57]">{title}</p>
            <ul className="mt-4 space-y-2.5 text-[14px]">
              {links.map((l) => <li key={l}><a href="#top" className="hover:underline">{l}</a></li>)}
            </ul>
          </div>
        ))}
      </div>
      <p className="border-t border-[#43342A] px-4 py-5 text-center text-[12px] text-[#A8977F]">© 2026 Goorin Bros. Demo storefront for the support widget. Not a real store.</p>
    </footer>
  )
}
