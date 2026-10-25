import { forwardRef, useEffect, useImperativeHandle, useRef, useState } from 'react'
import { EditorContent, useEditor, type Editor } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import Link from '@tiptap/extension-link'
import Placeholder from '@tiptap/extension-placeholder'
import { Bold, Italic, Link2, List, MessageSquareText, Send, StickyNote } from 'lucide-react'
import type { Macro } from '@/types'
import { Button, focusRing } from '@/components/ui/button'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/overlay'
import { Input } from '@/components/ui/input'
import { demoToolsEnabled } from '@/components/DemoStateSwitcher'
import { MacroPicker, macroToHtml } from './MacroPicker'
import { richText } from './MessageItem'
import { cn } from '@/lib/utils'

export type ComposerMode = 'reply' | 'note'
export interface ComposerHandle {
  focus: (mode: ComposerMode) => void
  loadDraft: (body: string, draftId: string) => void
}

interface Props {
  macros: Macro[]
  fill: (text: string) => string
  onSend: (html: string, isInternal: boolean, draftId?: string) => Promise<boolean>
  onDraftChange: (draftId: string | null) => void
}

function ToolButton({ label, active, onClick, children }: { label: string; active?: boolean; onClick: () => void; children: React.ReactNode }) {
  return (
    <button type="button" aria-label={label} aria-pressed={active} title={label} onClick={onClick} data-testid={`composer-${label.toLowerCase().replace(/\s+/g, '-')}`}
      className={cn('inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-muted hover:bg-surface-muted hover:text-ink', active && 'bg-surface-muted text-ink', focusRing)}>
      {children}
    </button>
  )
}

function LinkButton({ editor }: { editor: Editor }) {
  const [open, setOpen] = useState(false)
  const [url, setUrl] = useState('')
  const apply = () => {
    if (url.trim()) editor.chain().focus().extendMarkRange('link').setLink({ href: /^https?:\/\//.test(url) ? url : `https://${url}` }).run()
    else editor.chain().focus().unsetLink().run()
    setOpen(false)
  }
  return (
    <Popover open={open} onOpenChange={(o) => { setOpen(o); if (o) setUrl(editor.getAttributes('link').href ?? '') }}>
      <PopoverTrigger aria-label="Link" title="Link" data-testid="composer-link" className={cn('inline-flex h-8 w-8 items-center justify-center rounded-md text-ink-muted hover:bg-surface-muted', editor.isActive('link') && 'bg-surface-muted text-ink', focusRing)}>
        <Link2 className="h-4 w-4" aria-hidden />
      </PopoverTrigger>
      <PopoverContent align="start" side="top" className="flex w-72 gap-2 p-3">
        <Input autoFocus value={url} onChange={(e) => setUrl(e.target.value)} placeholder="https://goorin.com" aria-label="Link URL" className="h-9" onKeyDown={(e) => e.key === 'Enter' && (e.preventDefault(), apply())} data-testid="composer-link-input" />
        <Button size="sm" onClick={apply}>Apply</Button>
      </PopoverContent>
    </Popover>
  )
}

export const Composer = forwardRef<ComposerHandle, Props>(({ macros, fill, onSend, onDraftChange }, ref) => {
  const [mode, setMode] = useState<ComposerMode>('reply')
  const [picker, setPicker] = useState<{ source: 'slash' | 'button'; query: string } | null>(null)
  const [sending, setSending] = useState(false)
  const draftId = useRef<string | null>(null)
  const modeRef = useRef(mode)
  const pickerRef = useRef(picker)
  const pickerKeys = useRef<(e: KeyboardEvent) => boolean>(() => false)
  modeRef.current = mode
  pickerRef.current = picker

  const editor = useEditor({
    extensions: [
      StarterKit.configure({ heading: false, codeBlock: false, blockquote: false, horizontalRule: false, code: false }),
      Link.configure({ openOnClick: false, autolink: true, HTMLAttributes: { target: '_blank', rel: 'noopener noreferrer' } }),
      Placeholder.configure({ placeholder: () => (modeRef.current === 'note' ? 'Add an internal note for the team…' : 'Write a reply… Type / for macros') }),
    ],
    editorProps: {
      attributes: { class: cn('min-h-[88px] max-h-56 overflow-y-auto px-3 py-2 text-sm text-ink focus:outline-none', richText), role: 'textbox', 'aria-multiline': 'true', 'aria-label': 'Message composer', 'data-testid': 'composer-editor' },
      handleKeyDown: (_view, e) => {
        if (pickerRef.current?.source === 'slash' && pickerKeys.current(e)) return true
        if (e.key === 'Escape') {
          ;(e.target as HTMLElement).blur()
          return true
        }
        if (e.key === 'Enter' && (e.metaKey || e.ctrlKey)) {
          document.querySelector<HTMLButtonElement>('[data-testid="composer-send"]')?.click()
          return true
        }
        return false
      },
    },
    onUpdate: ({ editor: ed }) => {
      const m = /^\/(\S*)$/.exec(ed.getText())
      if (m) setPicker({ source: 'slash', query: m[1] })
      else if (pickerRef.current?.source === 'slash') setPicker(null)
    },
  })

  useImperativeHandle(ref, () => ({
    focus: (m) => {
      setMode(m)
      setTimeout(() => editor?.commands.focus('end'), 0)
    },
    loadDraft: (body, id) => {
      setMode('reply')
      draftId.current = id
      onDraftChange(id)
      editor?.commands.setContent(macroToHtml(body))
      setTimeout(() => editor?.commands.focus('end'), 0)
    },
  }), [editor, onDraftChange])

  useEffect(() => {
    editor?.view.dispatch(editor.state.tr)
  }, [mode, editor])

  if (!editor) return null
  const insert = (macro: Macro) => {
    const html = macroToHtml(fill(macro.body))
    if (picker?.source === 'slash') editor.commands.setContent(html)
    else editor.chain().focus().insertContent(html).run()
    setPicker(null)
    setTimeout(() => editor.commands.focus('end'), 0)
  }
  const send = async () => {
    if (editor.isEmpty || !editor.getText().trim()) return
    setSending(true)
    const ok = await onSend(editor.getHTML(), mode === 'note', draftId.current ?? undefined)
    setSending(false)
    if (ok) {
      editor.commands.clearContent()
      draftId.current = null
      onDraftChange(null)
    }
  }
  const empty = editor.isEmpty || !editor.getText().trim()
  const note = mode === 'note'

  return (
    <div className={cn('border-t border-border bg-surface px-4 pt-3', demoToolsEnabled ? 'pb-16' : 'pb-4')}>
      <div className={cn('relative rounded-xl border transition-colors', note ? 'border-amber-300 bg-amber-50' : 'border-border-strong bg-surface')} data-testid="composer" data-mode={mode}>
        {picker && <MacroPicker macros={macros} source={picker.source} query={picker.query} onQuery={(q) => setPicker({ ...picker, query: q })} onPick={insert} onClose={() => setPicker(null)} keyHandler={pickerKeys} />}
        <div className="flex flex-wrap items-center gap-0.5 border-b border-border/70 px-2 py-1">
          <ToolButton label="Bold" active={editor.isActive('bold')} onClick={() => editor.chain().focus().toggleBold().run()}><Bold className="h-4 w-4" aria-hidden /></ToolButton>
          <ToolButton label="Italic" active={editor.isActive('italic')} onClick={() => editor.chain().focus().toggleItalic().run()}><Italic className="h-4 w-4" aria-hidden /></ToolButton>
          <LinkButton editor={editor} />
          <ToolButton label="Bulleted list" active={editor.isActive('bulletList')} onClick={() => editor.chain().focus().toggleBulletList().run()}><List className="h-4 w-4" aria-hidden /></ToolButton>
          <span className="mx-1 h-5 w-px bg-border" aria-hidden />
          <ToolButton label="Macros" active={picker?.source === 'button'} onClick={() => setPicker(picker ? null : { source: 'button', query: '' })}><MessageSquareText className="h-4 w-4" aria-hidden /></ToolButton>
          {note && <span className="ml-auto pr-1 text-xs font-semibold text-amber-900">Internal note · only your team sees this</span>}
        </div>
        <EditorContent editor={editor} />
      </div>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <div role="group" aria-label="Composer mode" className="inline-flex rounded-lg border border-border p-0.5">
          {(['reply', 'note'] as const).map((m) => (
            <button key={m} type="button" aria-pressed={mode === m} onClick={() => setMode(m)} data-testid={`composer-mode-${m}`}
              className={cn('inline-flex h-8 items-center gap-1.5 rounded-md px-3 text-sm font-medium', mode === m ? (m === 'note' ? 'bg-amber-100 text-amber-900' : 'bg-tobacco-50 text-tobacco-800') : 'text-ink-muted hover:text-ink', focusRing)}>
              {m === 'reply' ? <Send className="h-3.5 w-3.5" aria-hidden /> : <StickyNote className="h-3.5 w-3.5" aria-hidden />}
              {m === 'reply' ? 'Reply' : 'Internal note'}
            </button>
          ))}
        </div>
        <span className="hover-only hidden text-xs text-ink-subtle md:inline">Ctrl/⌘ + Enter to send</span>
        <Button className={cn('ml-auto', note && 'bg-amber-700 hover:bg-amber-900')} disabled={empty} loading={sending} onClick={send} data-testid="composer-send">
          {note ? 'Add note' : 'Send'}
        </Button>
      </div>
    </div>
  )
})
Composer.displayName = 'Composer'
