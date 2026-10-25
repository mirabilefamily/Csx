import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

export function ScoreChip({ score, className }: { score: number; className?: string }) {
  const tone = score >= 4 ? 'bg-green-50 text-green-700 border-green-100' : score === 3 ? 'bg-brass-50 text-brass-700 border-brass-200' : 'bg-red-50 text-red-700 border-red-100'
  return (
    <span className={cn('inline-flex shrink-0 items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-semibold', tone, className)} aria-label={`Score ${score} out of 5`}>
      <Star className="h-3 w-3 fill-current" aria-hidden />
      {score}/5
    </span>
  )
}
