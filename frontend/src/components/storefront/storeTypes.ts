export type StorePage = 'product' | 'collection' | 'cart'
export const STORE_PAGES: { id: StorePage; label: string; path: string }[] = [
  { id: 'product', label: 'Product', path: '/products/hampton-wool-fedora' },
  { id: 'collection', label: 'Collection', path: '/collections/fall-felt' },
  { id: 'cart', label: 'Cart', path: '/cart' },
]
