import type { CsatResponse, ShopifyOrder } from '@/types'
import { ApiError, request } from './client'
import { db } from './db'

export interface InventoryRow { size: string; available: number; incoming: number }
export interface InventoryResult { sku: string; title: string; rows: InventoryRow[] }

const allOrders = () => db.customers.flatMap((c) => c.orders.map((o) => ({ o, c })))

// GET /api/shopify/orders/search?q=  (order # or customer email)
export function findOrder(query: string): Promise<{ order: ShopifyOrder; customerName: string; email: string } | null> {
  return request(() => {
    const q = query.trim().toLowerCase().replace(/^#?/, '#')
    const email = query.trim().toLowerCase()
    const hit = allOrders().find(({ o, c }) => o.number.toLowerCase() === q || c.email.toLowerCase() === email)
    return hit ? { order: hit.o, customerName: hit.c.name, email: hit.c.email } : null
  })
}

// GET /api/shopify/inventory?sku=  — mock stock by size, deterministic per SKU
export function checkInventory(sku: string): Promise<InventoryResult> {
  return request(() => {
    const s = sku.trim().toUpperCase()
    if (!s) throw new ApiError('Enter a SKU.', 422)
    const item = allOrders().flatMap(({ o }) => o.lineItems).find((l) => l.sku.toUpperCase() === s)
    if (!item) throw new ApiError(`No product with SKU ${s}.`, 404)
    let seed = [...s].reduce((a, ch) => a + ch.charCodeAt(0), 0)
    const rows = ['S', 'M', 'L', 'XL'].map((size) => { seed = (seed * 9301 + 49297) % 233280; return { size, available: seed % 14, incoming: seed % 3 === 0 ? 12 : 0 } })
    return { sku: s, title: item.title, rows }
  })
}

// GET /api/shopify/orders/:number  — full details for the lookup sheet
export function lookupOrderDetails(number: string): Promise<ShopifyOrder> {
  return request(() => {
    const hit = allOrders().find(({ o }) => o.number === number)
    if (!hit) throw new ApiError('Order not found.', 404)
    return hit.o
  })
}

// GET /api/customers/:id/csat
export function getCustomerCsat(customerId: string): Promise<CsatResponse[]> {
  return request(() => {
    const ids = new Set(db.tickets.filter((t) => t.customer.id === customerId).map((t) => t.id))
    return db.csatResponses.filter((r) => ids.has(r.ticketId)).sort((a, b) => b.createdAt.localeCompare(a.createdAt))
  }, { empty: () => [] })
}
