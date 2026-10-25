import type { ReactNode } from 'react'
import { Link } from 'react-router-dom'
import { Mail, Plus, Search } from 'lucide-react'
import type { AuthorType, TicketStatus } from '@/types'
import { directoryApi } from '@/api'
import { useApi } from '@/hooks/useApi'
import { palette, fonts } from '@/theme/tokens'
import { AuthorBadge } from '@/components/AuthorBadge'
import { StatusPill } from '@/components/StatusPill'
import { KpiCard } from '@/components/KpiCard'
import { ScoreChip } from '@/components/ScoreChip'
import { EmptyState, ErrorState } from '@/components/States'
import { Wordmark } from '@/components/Wordmark'
import { Button, buttonVariants } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { FieldError, Input, Label, Textarea } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/overlay'
import { Skeleton, Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/skeleton'
import { timeAgo } from '@/lib/format'
import { SgIndex, SgSection as Section } from '@/components/styleguide/SgSection'
import { InboxSamples } from '@/components/styleguide/InboxSamples'
import { WidgetSamples } from '@/components/styleguide/WidgetSamples'
import { DashboardSamples, NavSamples, SegmentedSample, SettingsSamples } from '@/components/styleguide/AppPatterns'

const AUTHORS: AuthorType[] = ['customer', 'claude', 'grokbot', 'agent', 'system']
const STATUSES: TicketStatus[] = ['open', 'ai_handling', 'grok_handling', 'needs_human', 'resolved', 'closed']

const SWATCHES: { name: string; hex: string; token: string; dark?: boolean }[] = [
  { name: 'Background', hex: palette.background, token: 'background' },
  { name: 'Surface', hex: palette.surface.DEFAULT, token: 'surface' },
  { name: 'Ink', hex: palette.ink.DEFAULT, token: 'ink', dark: true },
  { name: 'Ink muted', hex: palette.ink.muted, token: 'ink-muted', dark: true },
  { name: 'Tobacco (primary)', hex: palette.tobacco[600], token: 'tobacco-600', dark: true },
  { name: 'Brass (accent)', hex: palette.brass[500], token: 'brass-500' },
  { name: 'Border', hex: palette.border.DEFAULT, token: 'border' },
  { name: 'Focus ring', hex: palette.ring, token: 'ring', dark: true },
  { name: 'Green', hex: palette.green[600], token: 'green-600', dark: true },
  { name: 'Amber', hex: palette.amber[400], token: 'amber-400' },
  { name: 'Red', hex: palette.red[600], token: 'red-600', dark: true },
  { name: 'Slate', hex: palette.slate[500], token: 'slate-500', dark: true },
]

function UsersTable() {
  const { data, loading, error, reload } = useApi(() => directoryApi.listUsers(), [])
  if (loading) return <div className="space-y-2 p-4">{[0, 1, 2].map((i) => <Skeleton key={i} className="h-10 w-full" />)}</div>
  if (error) return <ErrorState compact onRetry={reload} testId="styleguide-table-error" />
  if (!data?.length) return <EmptyState compact title="No teammates yet" description="Invite someone to get started." testId="styleguide-table-empty" />
  return (
    <Table>
      <TableHeader><TableRow><TableHead>Name</TableHead><TableHead>Email</TableHead><TableHead>Role</TableHead><TableHead>Status</TableHead><TableHead>Last login</TableHead></TableRow></TableHeader>
      <TableBody>
        {data.map((u) => (
          <TableRow key={u.id}>
            <TableCell className="font-medium">{u.name}</TableCell>
            <TableCell className="text-ink-muted">{u.email}</TableCell>
            <TableCell className="capitalize">{u.role}</TableCell>
            <TableCell className="capitalize">{u.status}</TableCell>
            <TableCell className="text-ink-muted">{u.lastLoginAt ? timeAgo(u.lastLoginAt) : 'Never'}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}

export default function StyleguidePage() {
  return (
    <div className="min-h-screen bg-background" data-testid="styleguide-page">
      <header className="sticky top-0 z-30 border-b border-border bg-background/85 backdrop-blur-md">
        <div className="mx-auto flex h-16 max-w-6xl items-center gap-4 px-4 md:px-8">
          <Wordmark />
          <span className="hidden text-sm text-ink-muted sm:inline">Styleguide · current design</span>
          <Link to="/login" className={buttonVariants({ variant: 'outline', size: 'sm', className: 'ml-auto' })}>Open the desk</Link>
        </div>
      </header>
      <main className="mx-auto grid max-w-6xl gap-10 px-4 pb-24 pt-10 md:px-8 lg:grid-cols-[160px_minmax(0,1fr)]">
        <SgIndex />
        <div className="min-w-0 space-y-14">
          <div>
            <h1 className="font-display text-4xl font-medium tracking-tight text-ink md:text-5xl" data-testid="page-title">Styleguide</h1>
            <p className="mt-3 max-w-2xl text-sm text-ink-muted md:text-base">The shared foundations of the Goorin support desk. Every token here lives in <code className="rounded bg-surface-muted px-1.5 py-0.5 text-xs">src/theme/tokens.ts</code> and feeds the Tailwind config. Product pieces below are the real components rendered with sample data, so this page always matches the app.</p>
          </div>

          <Section id="colors" title="Colors">
            <ul className="grid grid-cols-2 gap-4 sm:grid-cols-3 xl:grid-cols-4">
              {SWATCHES.map((s) => (
                <li key={s.token} className="overflow-hidden rounded-lg border border-border bg-surface" data-testid={`swatch-${s.token}`}>
                  <div className="h-20 border-b border-border" style={{ background: s.hex }} />
                  <div className="p-3">
                    <p className="text-sm font-medium text-ink">{s.name}</p>
                    <p className="font-mono text-xs text-ink-muted">{s.hex.toUpperCase()} · {s.token}</p>
                  </div>
                </li>
              ))}
            </ul>
          </Section>

          <Section id="type" title="Type scale">
            <Card className="divide-y divide-border">
              {[
                ['Page title · Fraunces 500 · 36–48px', <p key="a" className="font-display text-4xl font-medium tracking-tight md:text-5xl">Dashboard</p>],
                ['KPI number · Fraunces 500 · 30px', <p key="b" className="font-display text-3xl font-medium">4.62</p>],
                ['Section heading · Inter 600 · 16–18px', <p key="c" className="text-base font-semibold md:text-lg">Customer satisfaction</p>],
                ['Card title · Inter 600 · 14px', <p key="d" className="text-sm font-semibold">Volume by channel</p>],
                ['Body · Inter 400 · 14–16px', <p key="e" className="text-sm md:text-base">My Hampton fedora arrived with the crown crushed.</p>],
                ['Small · Inter 500 · 12px', <p key="f" className="text-xs font-medium text-ink-muted">Updated 5 minutes ago</p>],
              ].map(([label, node]) => (
                <div key={label as string} className="grid gap-2 p-5 md:grid-cols-[240px_1fr] md:items-center">
                  <p className="text-xs text-ink-muted">{label}</p>
                  {node}
                </div>
              ))}
            </Card>
            <p className="text-xs text-ink-muted">Families: display {fonts.display[0]}, body {fonts.sans[0]}. Fraunces is reserved for page titles and KPI numbers.</p>
          </Section>

          <Section id="buttons" title="Buttons">
            <div className="flex flex-wrap items-center gap-3">
              <Button>Primary</Button>
              <Button variant="secondary">Secondary</Button>
              <Button variant="outline">Outline</Button>
              <Button variant="ghost">Ghost</Button>
              <Button variant="destructive">Destructive</Button>
              <Button variant="link">Link</Button>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <Button size="sm"><Plus aria-hidden /> Small</Button>
              <Button size="lg">Large</Button>
              <Button size="icon" variant="outline" aria-label="Search"><Search aria-hidden /></Button>
              <Button loading>Saving</Button>
              <Button disabled>Disabled</Button>
            </div>
          </Section>

          <Section id="inputs" title="Inputs">
            <Card className="grid gap-6 p-6 md:grid-cols-2">
              <div><Label htmlFor="sg-email">Email</Label><Input id="sg-email" className="mt-1.5" placeholder="you@goorin.com" /></div>
              <div><Label htmlFor="sg-err">With error</Label><Input id="sg-err" className="mt-1.5" defaultValue="ava@" aria-invalid /><FieldError>Enter a valid email address.</FieldError></div>
              <div>
                <Label htmlFor="sg-select">Select</Label>
                <Select defaultValue="hours"><SelectTrigger id="sg-select" className="mt-1.5"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="minutes">Minutes</SelectItem><SelectItem value="hours">Hours</SelectItem></SelectContent></Select>
              </div>
              <label className="flex items-center gap-3 self-end text-sm text-ink"><Switch defaultChecked aria-label="Email surveys" /> Email surveys</label>
              <div className="md:col-span-2"><Label htmlFor="sg-text">Textarea</Label><Textarea id="sg-text" className="mt-1.5" placeholder="Write a reply…" /></div>
            </Card>
          </Section>

          <Section id="badges" title="Author badges">
            <div className="flex flex-wrap gap-3">{AUTHORS.map((a) => <AuthorBadge key={a} type={a} />)}</div>
          </Section>

          <Section id="pills" title="Status pills">
            <div className="flex flex-wrap gap-3">{STATUSES.map((s) => <StatusPill key={s} status={s} />)}</div>
            <p className="text-xs text-ink-muted">needs_human is always the highest-visibility pill.</p>
          </Section>

          <Section id="cards" title="Cards">
            <div className="grid gap-4 md:grid-cols-3">
              <KpiCard comparisonLabel="vs prior 30 days" metric={{ key: 'sg-frt', label: 'First response time', value: 4.6, previous: 5.4, format: 'duration', betterWhen: 'lower', hint: 'Lower is better, shown in green' }} />
              <KpiCard comparisonLabel="vs prior 30 days" metric={{ key: 'sg-csat', label: 'CSAT average', value: 4.41, previous: 4.52, format: 'score', betterWhen: 'higher', hint: 'A drop is shown in red' }} />
              <Card>
                <CardHeader><div><CardTitle>Content card</CardTitle><CardDescription>Title, description, body</CardDescription></div><Mail className="h-4 w-4 text-ink-muted" aria-hidden /></CardHeader>
                <CardContent className="flex items-center gap-3"><ScoreChip score={5} /><ScoreChip score={3} /><ScoreChip score={1} /></CardContent>
              </Card>
            </div>
          </Section>

          <Section id="tables" title="Tables">
            <Card className="overflow-hidden"><UsersTable /></Card>
            <p className="text-xs text-ink-muted">This table is fetched through the API layer, so the demo state switcher changes it.</p>
          </Section>

          <Section id="states" title="Empty, loading and error states">
            <div className="grid gap-4 md:grid-cols-3">
              <Card><EmptyState compact title="No data for this period" description="Try a wider date range." testId="sg-empty" /></Card>
              <Card className="space-y-3 p-6"><Skeleton className="h-4 w-24" /><Skeleton className="h-8 w-32" /><Skeleton className="h-3 w-40" /><Skeleton className="h-24 w-full" /></Card>
              <Card><ErrorState compact onRetry={() => undefined} testId="sg-error" /></Card>
            </div>
          </Section>

          <Section id="inbox" title="Inbox pieces" description="AI drafts, the escalation chip, internal notes and the composer."><InboxSamples /></Section>
          <Section id="widget" title="Chat widget" description="Rendered through the real SupportWidget inside its Shadow DOM (contained mode, forced states), using the current widget settings."><WidgetSamples /></Section>
          <Section id="dashboard" title="Dashboard pieces"><DashboardSamples /></Section>
          <Section id="navigation" title="Sidebar nav item states"><NavSamples /></Section>
          <Section id="controls" title="Segmented control"><SegmentedSample /></Section>
          <Section id="settings" title="Settings patterns"><SettingsSamples /></Section>
        </div>
      </main>
    </div>
  )
}
