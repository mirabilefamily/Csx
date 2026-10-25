import type { LoopReturn } from '@/types'
import { request } from './client'
import { db } from './db'

// GET /api/customers/:id/loop-returns (MOCKED Loop Returns app data), newest first
export function getCustomerReturns(customerId: string): Promise<LoopReturn[]> {
  return request(
    () => db.loopReturns.filter((r) => r.customerId === customerId).sort((a, b) => b.createdAt.localeCompare(a.createdAt)),
    { empty: () => [] },
  )
}
