import { useState } from 'react'
import { DndContext, KeyboardSensor, PointerSensor, closestCenter, useSensor, useSensors, type DragEndEvent } from '@dnd-kit/core'
import { SortableContext, arrayMove, sortableKeyboardCoordinates, useSortable, verticalListSortingStrategy } from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { ArrowDown, ArrowUp, GripVertical, Plus, Trash2 } from 'lucide-react'
import { FieldError } from './fields'

interface Item { id: string; text: string }
let seq = 0

function Row({ item, index, count, onText, onMove, onRemove }: { item: Item; index: number; count: number; onText: (v: string) => void; onMove: (d: -1 | 1) => void; onRemove: () => void }) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id: item.id })
  return (
    <li ref={setNodeRef} style={{ transform: CSS.Transform.toString(transform), transition }} className={`flex items-center gap-2 rounded-lg border border-border bg-surface p-1.5 ${isDragging ? 'shadow-popover' : ''}`} data-testid={`ws-qr-item-${index}`}>
      <button type="button" {...attributes} {...listeners} aria-label={`Reorder quick reply ${index + 1}. Press space, then arrow keys.`} className="flex h-8 w-7 cursor-grab items-center justify-center rounded text-ink-subtle hover:bg-surface-muted focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring" data-testid={`ws-qr-handle-${index}`}>
        <GripVertical className="h-4 w-4" aria-hidden />
      </button>
      <input value={item.text} onChange={(e) => onText(e.target.value)} aria-label={`Quick reply ${index + 1}`} aria-invalid={!item.text.trim()} className={`h-8 flex-1 rounded-md border bg-surface px-2 text-sm ${item.text.trim() ? 'border-transparent hover:border-border' : 'border-red-500'}`} data-testid={`ws-qr-input-${index}`} />
      <button type="button" disabled={index === 0} onClick={() => onMove(-1)} aria-label={`Move quick reply ${index + 1} up`} className="flex h-8 w-8 items-center justify-center rounded text-ink-muted hover:bg-surface-muted disabled:opacity-30" data-testid={`ws-qr-up-${index}`}><ArrowUp className="h-4 w-4" aria-hidden /></button>
      <button type="button" disabled={index === count - 1} onClick={() => onMove(1)} aria-label={`Move quick reply ${index + 1} down`} className="flex h-8 w-8 items-center justify-center rounded text-ink-muted hover:bg-surface-muted disabled:opacity-30" data-testid={`ws-qr-down-${index}`}><ArrowDown className="h-4 w-4" aria-hidden /></button>
      <button type="button" onClick={onRemove} aria-label={`Remove quick reply ${index + 1}`} className="flex h-8 w-8 items-center justify-center rounded text-ink-muted hover:bg-red-50 hover:text-red-600" data-testid={`ws-qr-remove-${index}`}><Trash2 className="h-4 w-4" aria-hidden /></button>
    </li>
  )
}

export function QuickReplies({ value, onChange, error }: { value: string[]; onChange: (v: string[]) => void; error?: string }) {
  const [ids, setIds] = useState<string[]>(() => value.map(() => `qr-${++seq}`))
  const items: Item[] = value.map((text, i) => ({ id: ids[i] ?? `qr-x-${i}`, text }))
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }), useSensor(KeyboardSensor, { coordinateGetter: sortableKeyboardCoordinates }))
  const move = (from: number, to: number) => {
    onChange(arrayMove(value, from, to))
    setIds((x) => arrayMove(x, from, to))
  }
  const onDragEnd = ({ active, over }: DragEndEvent) => {
    if (!over || active.id === over.id) return
    move(ids.indexOf(String(active.id)), ids.indexOf(String(over.id)))
  }
  return (
    <div data-testid="ws-quick-replies">
      <p className="mb-1.5 text-sm font-medium text-ink">Quick replies</p>
      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={onDragEnd}>
        <SortableContext items={items.map((i) => i.id)} strategy={verticalListSortingStrategy}>
          <ul className="space-y-1.5">
            {items.map((it, i) => (
              <Row
                key={it.id}
                item={it}
                index={i}
                count={items.length}
                onText={(t) => onChange(value.map((v, j) => (j === i ? t : v)))}
                onMove={(d) => move(i, i + d)}
                onRemove={() => {
                  onChange(value.filter((_, j) => j !== i))
                  setIds((x) => x.filter((_, j) => j !== i))
                }}
              />
            ))}
          </ul>
        </SortableContext>
      </DndContext>
      <button type="button" onClick={() => { onChange([...value, '']); setIds((x) => [...x, `qr-${++seq}`]) }} className="mt-2 inline-flex h-9 items-center gap-1.5 rounded-md px-2 text-sm font-medium text-tobacco-700 hover:bg-tobacco-50" data-testid="ws-qr-add">
        <Plus className="h-4 w-4" aria-hidden /> Add quick reply
      </button>
      <FieldError id="ws-quick-replies-error">{error}</FieldError>
    </div>
  )
}
