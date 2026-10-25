import { useState } from 'react'
import { Minus, Plus, Star, Truck, X } from 'lucide-react'
import type { StoreProduct } from '@/types'
import { cn } from '@/lib/utils'

const money = (n: number) => `$${n.toFixed(2)}`

function ProductTile({ p }: { p: StoreProduct }) {
  return (
    <a href="#top" className="group block" data-testid={`store-product-${p.id}`}>
      <div className="aspect-square overflow-hidden rounded-[10px] bg-[#EFE7DB]">
        <img src={p.image} alt={p.name} loading="lazy" className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-[1.04]" />
      </div>
      <p className="mt-3 text-[14px] font-medium text-[#2E2219]">{p.name}</p>
      <p className="text-[13px] text-[#6B5E50]">{p.category} · {money(p.price)}</p>
    </a>
  )
}

export function ProductPage({ products }: { products: StoreProduct[] }) {
  const p = products[0]
  const [color, setColor] = useState(p.colors[0])
  const [size, setSize] = useState('M')
  return (
    <div className="mx-auto max-w-[1280px] px-4 pt-8 sm:px-8" data-testid="store-page-product">
      <p className="text-[13px] text-[#6B5E50]">Home / Fedoras / <span className="text-[#2E2219]">{p.name}</span></p>
      <div className="mt-6 grid gap-10 lg:grid-cols-[1.2fr_1fr]">
        <div className="grid gap-3 sm:grid-cols-[1fr_96px]">
          <div className="aspect-square overflow-hidden rounded-[10px] bg-[#EFE7DB]">
            <img src={p.image} alt={p.name} className="h-full w-full object-cover" />
          </div>
          <div className="hidden flex-col gap-3 sm:flex">
            <img src={p.image} alt="" className="aspect-square rounded-[8px] object-cover ring-2 ring-[#6B4F3A]" />
            <img src="/images/store/lifestyle.jpg" alt="" className="aspect-square rounded-[8px] object-cover" />
          </div>
        </div>
        <div>
          <h1 className="font-display text-[36px] font-semibold leading-tight text-[#2E2219]">{p.name}</h1>
          <div className="mt-2 flex items-center gap-2 text-[13px] text-[#6B5E50]">
            <span className="flex text-[#B08D57]" aria-hidden>{[0, 1, 2, 3, 4].map((i) => <Star key={i} className="h-4 w-4 fill-current" />)}</span>
            4.8 · 212 reviews
          </div>
          <p className="mt-4 text-[22px] text-[#2E2219]">{money(p.price)}</p>
          <p className="mt-5 max-w-md text-[15px] leading-relaxed text-[#4A3F35]">{p.description}</p>
          <fieldset className="mt-7">
            <legend className="text-[13px] font-medium text-[#2E2219]">Color: {color}</legend>
            <div className="mt-2 flex gap-2">
              {p.colors.map((c) => (
                <button key={c} type="button" onClick={() => setColor(c)} aria-pressed={c === color} className={cn('h-11 rounded-full border px-4 text-[13px]', c === color ? 'border-[#2E2219] bg-[#2E2219] text-white' : 'border-[#D9CEBF] text-[#2E2219]')}>{c}</button>
              ))}
            </div>
          </fieldset>
          <fieldset className="mt-5">
            <legend className="text-[13px] font-medium text-[#2E2219]">Size: {size} <a href="#top" className="ml-2 text-[#8C6A35] underline">Size guide</a></legend>
            <div className="mt-2 flex gap-2">
              {['S', 'M', 'L', 'XL'].map((s) => (
                <button key={s} type="button" onClick={() => setSize(s)} aria-pressed={s === size} className={cn('h-11 w-12 rounded-md border text-[14px]', s === size ? 'border-[#2E2219] bg-[#2E2219] text-white' : 'border-[#D9CEBF] text-[#2E2219]')}>{s}</button>
              ))}
            </div>
          </fieldset>
          <button type="button" className="mt-8 h-12 w-full max-w-md rounded-md bg-[#6B4F3A] text-[15px] font-semibold text-white hover:bg-[#58412F]" data-testid="store-add-to-cart">Add to cart · {money(p.price)}</button>
          <p className="mt-4 flex items-center gap-2 text-[13px] text-[#6B5E50]"><Truck className="h-4 w-4" /> Ships in 1–2 business days. Free returns within 30 days.</p>
        </div>
      </div>
      <h2 className="mt-20 font-display text-[24px] font-semibold text-[#2E2219]">Complete the look</h2>
      <div className="mt-6 grid grid-cols-2 gap-5 md:grid-cols-4">{products.slice(1, 5).map((x) => <ProductTile key={x.id} p={x} />)}</div>
    </div>
  )
}

export function CollectionPage({ products }: { products: StoreProduct[] }) {
  return (
    <div data-testid="store-page-collection">
      <section className="relative h-[420px] overflow-hidden">
        <img src="/images/store/hero.jpg" alt="Inside the Goorin Bros. hat shop" className="absolute inset-0 h-full w-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-r from-[#2E2219]/80 via-[#2E2219]/40 to-transparent" />
        <div className="relative mx-auto flex h-full max-w-[1280px] flex-col justify-center px-4 sm:px-8">
          <p className="text-[12px] uppercase tracking-[0.28em] text-[#E3CDA2]">The fall collection</p>
          <h1 className="mt-3 max-w-lg font-display text-[44px] font-semibold leading-[1.05] text-white">Felt, tweed and straw, made to be worn in.</h1>
          <a href="#grid" className="mt-6 inline-flex h-12 w-fit items-center rounded-md bg-[#FBF8F3] px-6 text-[14px] font-semibold text-[#2E2219]">Shop the collection</a>
        </div>
      </section>
      <div id="grid" className="mx-auto max-w-[1280px] px-4 pt-12 sm:px-8">
        <div className="flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-[28px] font-semibold text-[#2E2219]">All hats <span className="font-sans text-[15px] font-normal text-[#6B5E50]">({products.length})</span></h2>
          <div className="flex flex-wrap gap-2">
            {['All', 'Felt', 'Straw', 'Caps', 'Knits'].map((f, i) => (
              <button key={f} type="button" className={cn('h-10 rounded-full border px-4 text-[13px]', i === 0 ? 'border-[#2E2219] bg-[#2E2219] text-white' : 'border-[#D9CEBF] text-[#2E2219]')}>{f}</button>
            ))}
          </div>
        </div>
        <div className="mt-8 grid grid-cols-2 gap-x-5 gap-y-10 md:grid-cols-3 lg:grid-cols-4">{products.map((p) => <ProductTile key={p.id} p={p} />)}</div>
        <section className="mt-20 grid items-center gap-8 overflow-hidden rounded-[10px] bg-[#EFE7DB] md:grid-cols-2">
          <img src="/images/store/lifestyle.jpg" alt="A customer wearing a Hampton fedora on an autumn street" className="h-full max-h-[380px] w-full object-cover" />
          <div className="p-8">
            <p className="text-[12px] uppercase tracking-[0.28em] text-[#8C6A35]">Since 1895</p>
            <p className="mt-3 font-display text-[28px] font-semibold leading-tight text-[#2E2219]">A hat for the long walk home.</p>
            <p className="mt-3 text-[15px] text-[#4A3F35]">Not sure about your size? Ask us in the chat; our hatters answer in minutes.</p>
          </div>
        </section>
      </div>
    </div>
  )
}

export function CartPage({ products }: { products: StoreProduct[] }) {
  const [lines, setLines] = useState(() => [{ p: products[0], qty: 1, variant: 'Tobacco / M' }, { p: products[1], qty: 1, variant: 'Charcoal / L' }])
  const subtotal = lines.reduce((s, l) => s + l.p.price * l.qty, 0)
  const qty = (id: string, d: number) => setLines((ls) => ls.map((l) => (l.p.id === id ? { ...l, qty: Math.max(1, l.qty + d) } : l)))
  return (
    <div className="mx-auto max-w-[1100px] px-4 pt-10 sm:px-8" data-testid="store-page-cart">
      <h1 className="font-display text-[36px] font-semibold text-[#2E2219]">Your cart</h1>
      <div className="mt-8 grid gap-10 lg:grid-cols-[1fr_340px]">
        <ul className="divide-y divide-[#E6DED2] border-y border-[#E6DED2]">
          {lines.map((l) => (
            <li key={l.p.id} className="flex gap-4 py-6" data-testid={`store-cart-line-${l.p.id}`}>
              <img src={l.p.image} alt={l.p.name} className="h-28 w-28 shrink-0 rounded-[8px] object-cover" />
              <div className="flex min-w-0 flex-1 flex-col">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-[15px] font-medium text-[#2E2219]">{l.p.name}</p>
                    <p className="text-[13px] text-[#6B5E50]">{l.variant}</p>
                  </div>
                  <p className="text-[15px] text-[#2E2219]">{money(l.p.price * l.qty)}</p>
                </div>
                <div className="mt-auto flex items-center gap-3 pt-3">
                  <div className="flex items-center rounded-md border border-[#D9CEBF]">
                    <button type="button" className="flex h-10 w-10 items-center justify-center" onClick={() => qty(l.p.id, -1)} aria-label={`Decrease ${l.p.name}`}><Minus className="h-4 w-4" /></button>
                    <span className="w-6 text-center text-[14px]">{l.qty}</span>
                    <button type="button" className="flex h-10 w-10 items-center justify-center" onClick={() => qty(l.p.id, 1)} aria-label={`Increase ${l.p.name}`}><Plus className="h-4 w-4" /></button>
                  </div>
                  <button type="button" onClick={() => setLines((ls) => ls.filter((x) => x.p.id !== l.p.id))} className="inline-flex items-center gap-1 text-[13px] text-[#6B5E50] hover:underline"><X className="h-3.5 w-3.5" /> Remove</button>
                </div>
              </div>
            </li>
          ))}
          {lines.length === 0 && <li className="py-10 text-[15px] text-[#6B5E50]">Your cart is empty.</li>}
        </ul>
        <aside className="h-fit rounded-[10px] border border-[#E6DED2] bg-white p-6">
          <div className="flex justify-between text-[15px]"><span>Subtotal</span><span data-testid="store-cart-subtotal">{money(subtotal)}</span></div>
          <p className="mt-2 text-[13px] text-[#6B5E50]">{subtotal >= 100 ? 'You qualify for free shipping.' : `Add ${money(100 - subtotal)} for free shipping.`}</p>
          <button type="button" className="mt-6 h-12 w-full rounded-md bg-[#6B4F3A] text-[15px] font-semibold text-white hover:bg-[#58412F]">Check out</button>
          <p className="mt-4 text-center text-[12px] text-[#6B5E50]">Taxes and shipping calculated at checkout</p>
        </aside>
      </div>
    </div>
  )
}
