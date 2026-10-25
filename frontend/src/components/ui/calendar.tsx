import * as React from 'react'
import { DayPicker } from 'react-day-picker'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'

const navBtn = 'inline-flex h-8 w-8 items-center justify-center rounded-md border border-border text-ink hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:opacity-30'

export function Calendar({ className, classNames, ...props }: React.ComponentProps<typeof DayPicker>) {
  return (
    <DayPicker
      className={cn('p-3', className)}
      classNames={{
        root: 'relative',
        months: 'relative flex flex-col gap-6 sm:flex-row',
        month: 'space-y-3',
        month_caption: 'flex h-8 items-center justify-center',
        caption_label: 'text-sm font-medium text-ink',
        nav: 'absolute inset-x-0 top-0 z-10 flex h-8 items-center justify-between',
        button_previous: navBtn,
        button_next: navBtn,
        month_grid: 'w-full border-collapse',
        weekdays: 'flex',
        weekday: 'w-9 text-center text-xs font-medium text-ink-muted',
        week: 'mt-1 flex w-full',
        day: 'relative h-9 w-9 p-0 text-center text-sm',
        day_button:
          'h-9 w-9 rounded-md text-ink transition-colors hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring disabled:cursor-not-allowed disabled:hover:bg-transparent',
        selected: '[&>button]:bg-tobacco-600 [&>button]:text-white [&>button:hover]:bg-tobacco-700',
        range_start: '[&>button]:bg-tobacco-600 [&>button]:text-white',
        range_end: '[&>button]:bg-tobacco-600 [&>button]:text-white',
        range_middle: '[&>button]:!bg-brass-100 [&>button]:!text-ink',
        today: '[&>button]:font-semibold [&>button]:underline [&>button]:underline-offset-4',
        outside: 'opacity-50',
        disabled: '[&>button]:text-ink-subtle [&>button]:opacity-40 [&>button]:line-through',
        hidden: 'invisible',
        ...classNames,
      }}
      components={{
        Chevron: ({ orientation }) => (orientation === 'left' ? <ChevronLeft className="h-4 w-4" /> : <ChevronRight className="h-4 w-4" />),
      }}
      {...props}
    />
  )
}
