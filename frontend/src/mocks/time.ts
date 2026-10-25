// All mock timestamps are generated relative to page load.
export const NOW = new Date()
const HOUR = 3_600_000

export const hoursAgo = (h: number) => new Date(NOW.getTime() - h * HOUR).toISOString()
export const daysAgo = (d: number) => hoursAgo(d * 24)
export const minutesAfter = (iso: string, m: number) => new Date(new Date(iso).getTime() + m * 60_000).toISOString()

export function mulberry32(seed: number) {
  let s = seed
  return () => {
    let t = (s += 0x6d2b79f5)
    t = Math.imul(t ^ (t >>> 15), t | 1)
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61)
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}
