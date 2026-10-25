import { DndContext, KeyboardSensor, MouseSensor, TouchSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { Plus } from 'lucide-react'
import type { CsatQuestion, CsatQuestionType } from '@/types'
import { Button } from '@/components/ui/button'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { QuestionItem, TYPE_LABELS, type QuestionErrors } from './QuestionItem'

interface Props {
  questions: CsatQuestion[]
  errors: Record<string, QuestionErrors>
  onChange: (qs: CsatQuestion[]) => void
}

let seq = 100

export function QuestionList({ questions, errors, onChange }: Props) {
  const sensors = useSensors(
    useSensor(MouseSensor, { activationConstraint: { distance: 4 } }),
    useSensor(TouchSensor, { activationConstraint: { delay: 250, tolerance: 6 } }),
    useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }),
  )
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    const from = questions.findIndex((q) => q.id === active.id)
    const to = questions.findIndex((q) => q.id === over.id)
    onChange(arrayMove(questions, from, to))
  }
  const add = (type: CsatQuestionType) =>
    onChange([...questions, { id: `q-new-${++seq}`, type, label: '', required: false, options: type === 'choice' ? [''] : undefined }])

  return (
    <section aria-labelledby="csat-questions-heading" className="space-y-3">
      <div className="flex items-center justify-between">
        <h3 id="csat-questions-heading" className="text-sm font-semibold text-ink">Questions</h3>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" size="sm" data-testid="add-question-button">
              <Plus aria-hidden /> Add question
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="min-w-[180px]">
            {(Object.keys(TYPE_LABELS) as CsatQuestionType[]).map((t) => (
              <DropdownMenuItem key={t} onSelect={() => add(t)} data-testid={`add-question-${t}`}>
                {TYPE_LABELS[t]}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      <p className="text-xs text-ink-muted">Drag the handle, or focus it and press Space then the arrow keys. The arrow buttons also move questions.</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={questions.map((q) => q.id)} strategy={verticalListSortingStrategy}>
          <ol className="space-y-3" data-testid="question-list">
            {questions.map((q, i) => (
              <QuestionItem
                key={q.id}
                q={q}
                index={i}
                total={questions.length}
                errors={errors[q.id]}
                onChange={(next) => onChange(questions.map((x) => (x.id === q.id ? next : x)))}
                onMove={(dir) => onChange(arrayMove(questions, i, i + dir))}
                onDelete={() => onChange(questions.filter((x) => x.id !== q.id))}
              />
            ))}
          </ol>
        </SortableContext>
      </DndContext>
    </section>
  )
}
