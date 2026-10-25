import { useHideBottomTabBar } from '@/components/shell/BottomTabBar'
import { useState } from 'react'
import Papa from 'papaparse'
import { Download, Upload } from 'lucide-react'
import { toast } from 'sonner'
import type { ImportRow } from '@/types'
import { guidanceApi } from '@/api'
import { useAuth } from '@/components/auth/AuthContext'
import { Dialog, DialogContent, DialogDescription, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { FieldError, Label } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'

const FIELDS = ['title', 'body', 'category', 'tags', 'active'] as const
type Field = (typeof FIELDS)[number]
const NONE = '__none'

export function downloadCsv(name: string, csv: string) {
  const url = URL.createObjectURL(new Blob([csv], { type: 'text/csv;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: name })
  a.click()
  URL.revokeObjectURL(url)
}

const TEMPLATE = 'title,body,category,tags,active\n"Sizing guide: kids","Little Goorin hats fit 19–21 in.",Sizing & Fit,sizing;kids,true\n'

export function CsvImportDialog({ open, onOpenChange, onImported }: { open: boolean; onOpenChange: (o: boolean) => void; onImported: () => void }) {
  const { user } = useAuth()
  const [error, setError] = useState<string | null>(null)
  const [drag, setDrag] = useState(false)
  const [csv, setCsv] = useState<{ headers: string[]; rows: Record<string, string>[] } | null>(null)
  const [map, setMap] = useState<Record<Field, string>>({ title: NONE, body: NONE, category: NONE, tags: NONE, active: NONE })
  const [busy, setBusy] = useState(false)
  useHideBottomTabBar(open)

  const reset = () => { setCsv(null); setError(null) }
  const accept = (file?: File) => {
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) return setError('Only .csv files are supported.')
    setError(null)
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      complete: (res) => {
        const headers = res.meta.fields ?? []
        setCsv({ headers, rows: res.data })
        setMap(Object.fromEntries(FIELDS.map((f) => [f, headers.find((h) => h.trim().toLowerCase() === f) ?? NONE])) as Record<Field, string>)
      },
    })
  }
  const rows: ImportRow[] = (csv?.rows ?? []).map((r) => Object.fromEntries(FIELDS.map((f) => [f, map[f] === NONE ? undefined : r[map[f]]])))
  const doImport = async () => {
    if (!user) return
    setBusy(true)
    try {
      const { imported, skipped } = await guidanceApi.importArticles(rows, user)
      toast.success(`Imported ${imported} articles`)
      if (skipped) toast(`${skipped} rows skipped (missing title)`)
      onImported()
      onOpenChange(false)
      reset()
    } catch {
      toast.error("Couldn't import articles. Try again.")
    } finally {
      setBusy(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={(o) => { onOpenChange(o); if (!o) reset() }}>
      <DialogContent className="max-w-3xl" data-testid="csv-import-dialog">
        <DialogTitle className="text-base font-semibold text-ink">Import articles from CSV</DialogTitle>
        <DialogDescription className="mt-1 text-sm text-ink-muted">Map your columns to article fields. Rows without a title are skipped.</DialogDescription>
        {!csv ? (
          <div className="mt-5 space-y-3">
            <div
              onDragOver={(e) => { e.preventDefault(); setDrag(true) }}
              onDragLeave={() => setDrag(false)}
              onDrop={(e) => { e.preventDefault(); setDrag(false); accept(e.dataTransfer.files[0]) }}
              className={cn('flex flex-col items-center gap-3 rounded-xl border-2 border-dashed p-10 text-center', drag ? 'border-brass-500 bg-brass-50' : 'border-border-strong')}
              data-testid="csv-dropzone"
            >
              <Upload className="h-6 w-6 text-tobacco-500" aria-hidden />
              <p className="text-sm text-ink">Drag a .csv file here, or</p>
              <label className={cn('inline-flex h-9 cursor-pointer items-center rounded-lg border border-border-strong bg-surface px-3 text-sm font-medium focus-within:ring-2 focus-within:ring-ring')}>
                Browse files
                <input type="file" accept=".csv,text/csv" className="sr-only" onChange={(e) => accept(e.target.files?.[0])} data-testid="csv-file-input" />
              </label>
            </div>
            <FieldError>{error}</FieldError>
            <Button variant="link" size="sm" onClick={() => downloadCsv('guidance-template.csv', TEMPLATE)} data-testid="csv-template"><Download aria-hidden /> Download sample template</Button>
          </div>
        ) : (
          <div className="mt-5 space-y-4" data-testid="csv-mapping">
            <div className="grid gap-3 sm:grid-cols-5">
              {FIELDS.map((f) => (
                <div key={f}>
                  <Label htmlFor={`map-${f}`} className="text-xs capitalize text-ink-muted">{f}</Label>
                  <Select value={map[f]} onValueChange={(v) => setMap({ ...map, [f]: v })}>
                    <SelectTrigger id={`map-${f}`} className="mt-1 h-9 text-xs" data-testid={`map-${f}`}><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value={NONE}>Not mapped</SelectItem>
                      {csv.headers.map((h) => <SelectItem key={h} value={h}>{h}</SelectItem>)}
                    </SelectContent>
                  </Select>
                </div>
              ))}
            </div>
            <div className="max-h-56 overflow-auto rounded-lg border border-border">
              <Table>
                <TableHeader><TableRow>{FIELDS.map((f) => <TableHead key={f} className="capitalize">{f}</TableHead>)}</TableRow></TableHeader>
                <TableBody>
                  {rows.slice(0, 5).map((r, i) => <TableRow key={i}>{FIELDS.map((f) => <TableCell key={f} className="max-w-[160px] truncate text-xs">{r[f] ?? '—'}</TableCell>)}</TableRow>)}
                </TableBody>
              </Table>
            </div>
            <p className="text-xs text-ink-muted">{csv.rows.length} rows found · showing the first 5</p>
            <div className="flex flex-wrap items-center justify-end gap-2">
              {map.title === NONE && <p className="mr-auto text-sm font-medium text-red-700" role="alert" data-testid="csv-map-title-error">Map a column to Title.</p>}
              <Button variant="ghost" onClick={reset}>Choose another file</Button>
              <Button onClick={doImport} disabled={map.title === NONE} loading={busy} data-testid="csv-import-confirm">Import</Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
