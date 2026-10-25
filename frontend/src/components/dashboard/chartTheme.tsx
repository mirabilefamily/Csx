import type { ReactElement, ReactNode } from 'react'
import { ResponsiveContainer } from 'recharts'
import { chartColors, palette } from '@/theme/tokens'

// Seeds a non-zero size so Recharts doesn't warn before the container is measured.
export function Responsive({ children }: { children: ReactElement }) {
  return (
    <ResponsiveContainer width="100%" height="100%" minWidth={0} initialDimension={{ width: 480, height: 240 }}>
      {children}
    </ResponsiveContainer>
  )
}

export const axisProps = {
  tick: { fill: chartColors.axis, fontSize: 12, fontFamily: "'Inter Variable', Inter, sans-serif" },
  tickLine: false,
  axisLine: { stroke: chartColors.grid },
} as const

export const gridProps = { stroke: chartColors.grid, strokeDasharray: '3 3', vertical: false } as const

export const tooltipProps = {
  cursor: { fill: palette.surface.muted, opacity: 0.6 },
  contentStyle: {
    background: palette.surface.DEFAULT,
    border: `1px solid ${palette.border.DEFAULT}`,
    borderRadius: 10,
    boxShadow: '0 8px 24px -8px rgba(31,29,26,0.18)',
    fontSize: 12,
    fontFamily: 'Inter, sans-serif',
    color: palette.ink.DEFAULT,
  },
  labelStyle: { color: palette.ink.DEFAULT, fontWeight: 600, marginBottom: 4 },
  itemStyle: { color: palette.ink.muted, padding: 0 },
} as const

// Wraps a chart in an accessible figure with a text summary for screen readers.
export function ChartFigure({ summary, children, height = 260 }: { summary: string; children: ReactNode; height?: number }) {
  return (
    <figure className="m-0 w-full min-w-0" style={{ height }} aria-label={summary}>
      {children}
      <figcaption className="sr-only">{summary}</figcaption>
    </figure>
  )
}
