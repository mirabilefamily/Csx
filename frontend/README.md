# Goorin Bros. Support Desk: front-end prototype (handoff pack)

This is a clickable, front-end-only prototype of an AI-first support desk for Goorin Bros.:
- Claude answers first, and Grokbot is the second AI tier.
- Humans take over when needed.
- It includes a customer-facing chat widget for the Shopify store and a hosted CSAT survey.

There is **no backend**. Every read and write goes through the async, typed `src/api` layer, which returns mock data after a simulated 300–700 ms latency. To go live, replace the function bodies in `src/api` with HTTP calls. No component or page has to change.

## Contents
1. [Setup, scripts, env vars](#1-setup-scripts-env-vars)
2. [Folder structure](#2-folder-structure)
3. [Routes and access](#3-routes-and-access)
4. [Components](#4-components)
5. [API contract (mock → HTTP)](#5-api-contract-mock--http)
6. [Types](#6-types)
7. [Swapping mocks for real endpoints](#7-swapping-mocks-for-real-endpoints)
8. [Chat widget: Shadow DOM and the future widget.js](#8-chat-widget-shadow-dom-and-the-future-widgetjs)
9. [Demo tools, mock auth, persistence](#9-demo-tools-mock-auth-persistence)
10. [Quality checks (axe, tablet, console, README coverage)](#10-quality-checks)
11. [Brand assets](#11-brand-assets)
12. [Seed facts](#12-seed-facts)

## 1. Setup, scripts, env vars

**Stack:**
- React 19, TypeScript 5.9, Vite 6 and Tailwind CSS 3.
- shadcn/ui-style primitives on Radix (`src/components/ui`).
- lucide-react, Recharts, react-router-dom 7, Tiptap, @dnd-kit, react-day-picker, date-fns, papaparse, react-markdown and sonner.
- Self-hosted Fraunces and Inter via @fontsource.
- **No Emergent or other platform-specific packages.**

```bash
yarn install
yarn start       # Vite dev server on 0.0.0.0:3000 (alias: yarn dev)
yarn build       # tsc --noEmit + production build to dist/
yarn preview     # serve dist/ on 0.0.0.0:3000
yarn typecheck   # tsc --noEmit
node scripts/check-readme.mjs          # README coverage check (section 10)
node scripts/audit.mjs [baseUrl]       # axe + focus + overflow + console audit (section 10)
```

| env var | purpose |
|---|---|
| `VITE_APP_BASE_URL` | Base URL of the desk, used in the Install script snippet (`$APP_BASE_URL/widget.js`). Example: `https://desk.goorin.com` |
| `VITE_DEMO_TOOLS=true` | Shows the floating "Demo state" switcher in production builds. It always shows in dev. |
| `HMR_CLIENT_PORT` | Optional. The HMR websocket client port when the dev server sits behind a TLS proxy (e.g. `443`). |

## 2. Folder structure

```
frontend/
  index.html, vite.config.ts, tailwind.config.ts, postcss.config.js, tsconfig.json
  public/
    favicon.svg
    images/brand/      official wordmarks, castle mark, AI avatar
    images/products/   generated hat product shots (storefront + order cards)
    images/store/      generated storefront hero/lifestyle imagery
  scripts/
    audit.mjs          axe / focus ring / overflow / console audit (playwright-core + @axe-core/playwright)
    check-readme.mjs   fails if any api function, component file or type is missing from this README
  src/
    main.tsx           React root, fonts, global CSS
    App.tsx            router + providers (auth, tooltips, unsaved guard, demo switcher, toaster)
    index.css          Tailwind layers, global focus-visible fallback
    api/               THE ONLY place that imports mocks. Async, typed, latency + demo-state aware
    mocks/             typed seed data (never imported by components or pages)
    types/index.ts     domain models + API DTOs
    theme/tokens.ts    design tokens consumed by tailwind.config.ts, charts and /styleguide
    components/        reusable components grouped by feature (ui/ = primitives)
    pages/             one component per route
    hooks/useApi.ts    useApi (fetch, reload, refetch on demo-state change), useDemoState
    lib/               pure helpers: format, labels, date ranges, inbox views, widget rules, cn()
```

`src/lib`:
- `format.ts` (`timeAgo`, `formatDuration`, `formatKpiValue`, `isValidEmail`, `initials`)
- `labels.ts` (status, author, resolver, channel and escalation labels)
- `dateRange.ts` (presets, prior period, labels)
- `inboxViews.ts` (`INBOX_VIEWS`, `viewById`, `viewCounts`)
- `widgetRules.ts` (`mergeEffective`, `hiddenReason`, `matchesPattern`, `contrastRatio`, `contrastWarning`, `isHex`, `PAGE_TYPE_LABELS`, `SHARED_FIELDS`)
- `utils.ts` (`cn`)

## 3. Routes and access

| route | access | what it is |
|---|---|---|
| `/login` (`?invite=<token>`) | public | sign in, forgot password, accept invite, expired invite |
| `/` | signed-in | redirects to `/dashboard` |
| `/dashboard` (`?csat=settings` opens the CSAT drawer) | signed-in | KPIs, volume, resolved by, escalation reasons, tags, CSAT section + CSAT Settings drawer |
| `/inbox`, `/inbox/:ticketId` (`?view=`) | signed-in | views, ticket list, conversation, AI drafts, composer, details sidebar |
| `/guidance` (`?tab=articles\|macros\|sandbox`, `?article=<id>`) | signed-in | Articles, Macros, Test Sandbox |
| `/settings` → `/settings/integrations` | admin | Agents see "You don't have access to Settings" |
| `/settings/integrations`, `/settings/ai`, `/settings/widget` (`#install`), `/settings/users` | admin | the four Settings tabs |
| `/styleguide` | public | living styleguide with a sticky index |
| `/widget-demo` (`?page=product\|collection\|cart`, `?desk_preview=1`) | public | mock Goorin storefront + live widget + demo controls |
| `/widget-demo/theme-editor` | public | mock Shopify theme editor "App embeds" block |
| `/survey/:token` (`?score=1-5`) | public | hosted CSAT survey. `tok_GB1066` and `tok_GB1070` are valid, `done` is already completed, anything else is invalid |
| `*` | any | designed 404 (inside the shell when signed in) |

Signed-in routes are wrapped in `RequireAuth` (it redirects to `/login`). Admin-only routes check `user.role === 'admin'` in the page.

## 4. Components

Each row lists a file in `src/components` (and `src/pages`), its exports and a one-line purpose.

### Shared (`components/`)
| file | exports | purpose |
|---|---|---|
| `components/AuthorBadge.tsx` | `AuthorBadge` | Customer / Claude / Grokbot / Agent / System badge with icon and color |
| `components/ChartCard.tsx` | `ChartCard`, `Legend` | Titled card for a chart, plus a color legend |
| `components/DemoStateSwitcher.tsx` | `DemoStateSwitcher`, `demoToolsEnabled` | Floating Live / Loading / Empty / Error switcher for the mock API |
| `components/KpiCard.tsx` | `KpiCard`, `KpiCardSkeleton` | Single KPI card with delta (styleguide / legacy) |
| `components/PageHeader.tsx` | `PageHeader` | Fraunces page title + description + actions row |
| `components/PlaceholderPage.tsx` | `PlaceholderPage` | Designed "coming later" placeholder |
| `components/ScoreChip.tsx` | `ScoreChip` | Colored 1–5 CSAT score chip |
| `components/States.tsx` | `EmptyState`, `ErrorState` | Shared empty and error (with Try again) states |
| `components/StatusPill.tsx` | `StatusPill` | Ticket status pill (6 statuses, needs_human amber) |
| `components/UnsavedGuard.tsx` | `UnsavedGuardProvider`, `useUnsavedGuard` | "Discard unsaved changes?" guard for dirty editors across navigation |
| `components/Wordmark.tsx` | `Wordmark` | Sidebar brand: castle tile (collapsed) or wordmark + "Support Desk" (expanded) |

### Auth, brand (`components/auth`, `components/brand`)
| file | exports | purpose |
|---|---|---|
| `components/auth/AuthContext.tsx` | `AuthProvider`, `useAuth`, `RequireAuth` | Mock session (sessionStorage), role toggle, route guard |
| `components/brand/GoorinBrand.tsx` | `GoorinWordmark`, `GoorinCastle`, `GoorinMonogram` | Official wordmark img (6.2:1, never stretched), castle mark SVG, G monogram |

### Shell (`components/shell`)
| file | exports | purpose |
|---|---|---|
| `components/shell/AppShell.tsx` | `AppShell` | Sidebar + top bar + content layout for signed-in routes |
| `components/shell/Sidebar.tsx` | `Sidebar`, `navItemClass`, `NAV_BADGE_COLLAPSED` | Light collapsible sidebar, needs-human badge, bottom Settings + collapse toggle |
| `components/shell/GlobalSearch.tsx` | `GlobalSearch` | ⌘K / Ctrl+K combobox over tickets, customers, articles |
| `components/shell/NotificationBell.tsx` | `NotificationBell` | Needs-human notifications popover |
| `components/shell/UserMenu.tsx` | `UserMenu` | Account menu: "View as" Admin/Agent, sign out |
| `components/shell/ShellData.tsx` | `ShellDataProvider`, `useShellData` | Single ticket store for the shell (views, badges and bell stay consistent) |

### Dashboard (`components/dashboard`)
| file | exports | purpose |
|---|---|---|
| `components/dashboard/DateRangePicker.tsx` | `DateRangePicker` | Today / 7d / 30d / 90d segmented control + custom calendar range |
| `components/dashboard/KpiStrip.tsx` | `KpiStrip` | 7-item KPI stat strip with delta chips and sparklines |
| `components/dashboard/OverviewCharts.tsx` | `VolumeChart`, `ResolvedByChart`, `EscalationChart`, `TopTagsChart` | Volume area chart, stacked "Resolved by" bar, ranked reason and tag lists |
| `components/dashboard/Panel.tsx` | `Panel`, `RankedList` | Borderless dashboard surface with loading/empty, and a ranked inline-bar list |
| `components/dashboard/CsatSection.tsx` | `CsatSection` | Condensed CSAT block (headline, distribution, splits, feedback) |
| `components/dashboard/CsatCharts.tsx` | `CsatTrend`, `CsatDistribution`, `CsatSplits`, `CsatFeedback` | CSAT trend, 1–5 distribution, channel/resolver splits, Latest comments / Needs follow-up tabs |
| `components/dashboard/chartTheme.tsx` | `Responsive`, `ChartFigure`, `axisProps`, `gridProps`, `tooltipProps` | Shared Recharts wrappers and styling |

### CSAT settings (`components/csat`)
| file | exports | purpose |
|---|---|---|
| `components/csat/CsatSettingsDrawer.tsx` | `CsatSettingsDrawer` | Sheet for survey questions, send delay, channels, recipients |
| `components/csat/QuestionList.tsx` | `QuestionList` | Sortable list of survey questions |
| `components/csat/QuestionItem.tsx` | `QuestionItem`, `QuestionErrors`, `TYPE_LABELS` | One editable question (type, text, required, options) |
| `components/csat/RecipientsInput.tsx` | `RecipientsInput` | Email chip input for low-score alert recipients |
| `components/csat/SurveyPreview.tsx` | `SurveyPreview` | Live preview of the email/hosted survey |

### Inbox (`components/inbox`)
| file | exports | purpose |
|---|---|---|
| `components/inbox/ViewsNav.tsx` | `ViewsNav`, `ViewsDropdown` | Inbox views with counts (sidebar list, dropdown on tablet) |
| `components/inbox/TicketFilters.tsx` | `TicketFilters`, `Filters`, `matchFilters`, `activeFilterCount` | Channel / priority / assignee / tag filters |
| `components/inbox/TicketList.tsx` | `TicketList` | Ticket list with selection, keyboard nav, loading/empty/error |
| `components/inbox/TicketRow.tsx` | `TicketRow` | One ticket row (customer, subject, status, time) |
| `components/inbox/BulkBar.tsx` | `BulkBar` | Bulk status / assign / tag bar for selected tickets |
| `components/inbox/ConversationPane.tsx` | `ConversationPane`, `ConversationHandle` | Ticket header controls, message thread, drafts, composer |
| `components/inbox/MessageItem.tsx` | `MessageItem`, `richText` | One message: customer/AI/agent bubble, internal note, system line |
| `components/inbox/DraftCard.tsx` | `DraftCard` | AI draft awaiting approval (tier, confidence, guidance used, Approve/Edit/Discard) |
| `components/inbox/EscalationChip.tsx` | `EscalationChip`, `escalationPath` | Claude → Grokbot → Human timeline chip with reasons |
| `components/inbox/Composer.tsx` | `Composer`, `ComposerHandle`, `ComposerMode` | Tiptap reply / internal-note composer with formatting and macros |
| `components/inbox/MacroPicker.tsx` | `MacroPicker`, `macroToHtml` | Searchable macro insert popover |
| `components/inbox/DetailsSidebar.tsx` | `DetailsSidebar` | Customer, Shopify orders, past tickets, AI attempt log |
| `components/inbox/ShortcutHelp.tsx` | `ShortcutHelp` | Keyboard shortcut help dialog |

### Guidance (`components/guidance`)
| file | exports | purpose |
|---|---|---|
| `components/guidance/ArticlesTab.tsx` | `ArticlesTab` | Article list, search, active toggle, import/export |
| `components/guidance/ArticleEditor.tsx` | `ArticleEditor`, `markdownStyles` | Markdown article editor with preview (Write/Preview tabs below 1024px) |
| `components/guidance/CsvImportDialog.tsx` | `CsvImportDialog`, `downloadCsv` | CSV import with column mapping (papaparse), CSV export helper |
| `components/guidance/MacrosTab.tsx` | `MacrosTab` | Macro list + editor (duplicate-name validation) |
| `components/guidance/SandboxTab.tsx` | `SandboxTab` | Test a question against guidance: ranked articles, draft, confidence, escalation |

### Settings (`components/settings`)
| file | exports | purpose |
|---|---|---|
| `components/settings/IntegrationsTab.tsx` | `IntegrationsTab`, `IntegrationCard` | Health summary + integration cards (status, purpose, test, error callout, credentials, testers) |
| `components/settings/AiTab.tsx` | `AiTab` | Threshold band slider, auto-send matrix, business hours, sentence rules, prompt viewer |
| `components/settings/UsersTab.tsx` | `UsersTab` | Team header + search, user rows, invite dialog, row actions, deactivate confirm |
| `components/settings/SaveBar.tsx` | `SaveBar`, `FormSection` | Shared sticky unsaved-changes bar, and the label-left/control-right form section |

### Chat widget settings (`components/widgetSettings`)
| file | exports | purpose |
|---|---|---|
| `components/widgetSettings/WidgetSettingsTab.tsx` | `WidgetSettingsTab` | Draft state, validation, save bar, route guard, "Preview on my store" |
| `components/widgetSettings/BrandingSection.tsx` | `BrandingSection` | 7 colors, logo/avatars, font, radius, shadow |
| `components/widgetSettings/LauncherSection.tsx` | `LauncherSection` | Icon, style, label, size, position, offsets, badge, animation |
| `components/widgetSettings/MessagingSection.tsx` | `MessagingSection`, `PageTypePicker`, `ToggleRow`, `PAGE_TYPES` | Header, greeting, proactive bubble, pre-chat, handoff, offline |
| `components/widgetSettings/QuickReplies.tsx` | `QuickReplies` | Quick replies with drag, keyboard and up/down reorder (max 7) |
| `components/widgetSettings/DisplaySection.tsx` | `DisplaySection`, `CsatInChatSection` | Display rules (page types, URL include/exclude, mobile, outside hours, context) and CSAT style |
| `components/widgetSettings/InstallSection.tsx` | `InstallSection`, `APP_BASE_URL` | Shopify install status, App embed steps, script snippet, verify |
| `components/widgetSettings/WidgetPreview.tsx` | `WidgetPreview`, `DeviceStage`, `PreviewOptions`, `PreviewPage`, `Device` | Preview toolbar (page, device, state select) and device frames around the real widget |
| `components/widgetSettings/MiniStore.tsx` | `MiniStore`, `PREVIEW_PATHS`, `STORE_FONT` | Compact serif storefront behind the preview |
| `components/widgetSettings/fields.tsx` | `Section`, `FieldLabel`, `FieldError`, `ColorField`, `UploadField`, `Segmented`, `RangeField`, `TextField`, `SourceBadge`, `PRESETS` | Form building blocks (collapsible section with summary, color + contrast warning, uploads) |
| `components/widgetSettings/summaries.ts` | `sectionSummary` | One-line value summary for each collapsed section header |
| `components/widgetSettings/validate.ts` | `validateWidget`, `sanitizeForPreview`, `WidgetErrors`, `Update`, `COLOR_KEYS` | Widget settings validation and preview sanitizing |

### Customer chat widget (`components/widget`)
| file | exports | purpose |
|---|---|---|
| `components/widget/SupportWidget.tsx` | `SupportWidget`, `SupportWidgetProps` | The single settings-driven widget (live or contained, forced states) |
| `components/widget/ShadowRoot.tsx` | `ShadowRoot` | Attaches an open shadow root and injects `widget.css` |
| `components/widget/WidgetErrorBoundary.tsx` | (default class) `WidgetErrorBoundary` | Keeps a widget crash from blanking the host page |
| `components/widget/Launcher.tsx` | `Launcher`, `GreetingBubble`, `launcherSize` | Circle/pill launcher with unread badge, proactive greeting bubble |
| `components/widget/PanelHeader.tsx` | `PanelHeader` | Panel header: logo, title, subtitle, AI disclosure, minimize |
| `components/widget/ChatView.tsx` | `MessageList`, `OrderCard`, `Composer`, `ChatMsg` | Bubbles, quick replies, typing indicator, handoff, order card, chat composer |
| `components/widget/Forms.tsx` | `PreChatForm`, `OfflineView`, `Identity` | Pre-chat form and offline message form |
| `components/widget/CsatView.tsx` | `CsatView`, `TranscriptSent` | Inline CSAT (stars/emoji/numeric) and transcript confirmation |
| `components/widget/icons.tsx` | `HatIcon`, `LauncherGlyph` | Launcher icon set |
| `components/widget/widget.css` | — | Plain px-based CSS injected inside the shadow root |

### Storefront demo (`components/storefront`)
| file | exports | purpose |
|---|---|---|
| `components/storefront/StoreChrome.tsx` | `StoreHeader`, `StoreFooter` | Mock Goorin store header/footer |
| `components/storefront/StorePages.tsx` | `ProductPage`, `CollectionPage`, `CartPage` | Mock product, collection and cart pages |
| `components/storefront/DemoControls.tsx` | `DemoControls`, `WIDGET_STATES` | Demo panel: page, login, outside hours, hostile CSS, jump to widget state |
| `components/storefront/hostileCss.ts` | `HOSTILE_CSS` | Deliberately aggressive store CSS that proves widget isolation |
| `components/storefront/storeTypes.ts` | `StorePage`, `STORE_PAGES` | Storefront page ids and paths |

### Styleguide (`components/styleguide`)
| file | exports | purpose |
|---|---|---|
| `components/styleguide/SgSection.tsx` | `SgSection`, `Specimen`, `SgIndex`, `SG_INDEX` | Styleguide section wrapper, specimen caption, sticky in-page index |
| `components/styleguide/InboxSamples.tsx` | `InboxSamples` | Draft card variants, escalation chip, internal note, composer |
| `components/styleguide/WidgetSamples.tsx` | `WidgetSamples` | All widget components through the real SupportWidget (Shadow DOM, contained) |
| `components/styleguide/AppPatterns.tsx` | `DashboardSamples`, `NavSamples`, `SegmentedSample`, `SettingsSamples` | KPI strip, stacked + ranked bars, nav item states, segmented control, integration card, form section |

### UI primitives (`components/ui`)
| file | exports | purpose |
|---|---|---|
| `components/ui/button.tsx` | `Button`, `buttonVariants`, `ButtonProps`, `focusRing` | Button variants/sizes with loading state; shared focus ring class |
| `components/ui/input.tsx` | `Input`, `Textarea`, `Label`, `FieldError` | Form fields with focus ring and invalid styling |
| `components/ui/select.tsx` | `Select`, `SelectTrigger`, `SelectValue`, `SelectContent`, `SelectItem` | Radix select |
| `components/ui/card.tsx` | `Card`, `CardHeader`, `CardTitle`, `CardDescription`, `CardContent` | Card surface |
| `components/ui/dialog.tsx` | `Dialog`, `DialogContent`, `DialogTitle`, `DialogDescription` | Modal dialog |
| `components/ui/alert-dialog.tsx` | `AlertDialog`, `AlertDialogContent`, `AlertDialogTitle`, `AlertDialogDescription`, `AlertDialogFooter`, `AlertDialogCancel`, `AlertDialogAction` | Confirm dialog |
| `components/ui/sheet.tsx` | `Sheet`, `SheetTrigger`, `SheetClose`, `SheetContent`, `SheetTitle`, `SheetDescription`, `SheetCloseButton` | Side drawer |
| `components/ui/dropdown-menu.tsx` | `DropdownMenu`, `DropdownMenuTrigger`, `DropdownMenuContent`, `DropdownMenuItem`, `DropdownMenuLabel`, `DropdownMenuSeparator`, `DropdownMenuRadioGroup`, `DropdownMenuRadioItem` | Menus |
| `components/ui/overlay.tsx` | `Popover`, `PopoverTrigger`, `PopoverContent`, `PopoverClose`, `Tooltip`, `TooltipTrigger`, `TooltipContent`, `TooltipProvider`, `Switch` | Popover, tooltip, switch |
| `components/ui/skeleton.tsx` | `Skeleton`, `Table`, `TableHeader`, `TableBody`, `TableRow`, `TableHead`, `TableCell` | Skeleton block and table primitives |
| `components/ui/calendar.tsx` | `Calendar` | react-day-picker range calendar |
| `components/ui/sonner.tsx` | `Toaster` | Toasts |

### Pages (`src/pages`)
| file | route | purpose |
|---|---|---|
| `pages/LoginPage.tsx` | `/login` | Sign in, forgot password, invite accept/expired |
| `pages/DashboardPage.tsx` | `/dashboard` | Range control, KPI strip, overview, CSAT |
| `pages/InboxPage.tsx` | `/inbox/:ticketId?` | Three-pane inbox |
| `pages/GuidancePage.tsx` | `/guidance` | Articles / Macros / Test Sandbox tabs |
| `pages/SettingsPage.tsx` | `/settings/:tab` | Segmented tab bar + four tabs, no-access state |
| `pages/StyleguidePage.tsx` | `/styleguide` | Living styleguide |
| `pages/WidgetDemoPage.tsx` | `/widget-demo` | Storefront + live widget + demo controls |
| `pages/ThemeEditorPage.tsx` | `/widget-demo/theme-editor` | Shopify theme editor mock |
| `pages/SurveyPage.tsx` | `/survey/:token` | Hosted CSAT survey |
| `pages/NotFoundPage.tsx` | `*` | 404 |

## 5. API contract (mock → HTTP)

Import from `@/api` (`src/api/index.ts`), which exports one namespace per domain. Every function returns `Promise<T>`, except the two client-only preview helpers.

**Error shape (all functions):** a rejected promise carries an `ApiError { name: 'ApiError', message: string, status: number }`. The message is user-facing copy that the UI shows verbatim.
- Every call can fail with `500 "We couldn't reach the Goorin desk just now."` (the Error demo state, or the network).
- The column "errors" lists the additional, function-specific failures.
- A real backend should return `{ "message": string }` with the HTTP status, so the client can rebuild `ApiError`.

`actor` / `actorId` is the signed-in user, passed explicitly by the prototype. A real backend should take it from the auth token instead.

### auth (`authApi`, `api/auth.ts`)
| function | method + path | request | response | errors |
|---|---|---|---|---|
| `authApi.signIn(email, password)` | `POST /api/auth/login` | `{ email, password }` | `SessionUser` | 401 "Incorrect email or password." |
| `authApi.requestPasswordReset(email)` | `POST /api/auth/password-reset` | `{ email }` | `{ email }` | — |
| `authApi.getInvite(token)` | `GET /api/invites/:token` | — | `Invite \| null` (`expired: true` for expired) | — |
| `authApi.acceptInvite(token, name, password)` | `POST /api/invites/:token/accept` | `{ name, password }` | `SessionUser` | 410 "This invite has expired", 422 "Use at least 8 characters." |

### tickets (`ticketsApi`, `api/tickets.ts`)
| function | method + path | request | response | errors |
|---|---|---|---|---|
| `ticketsApi.listTickets({ status? })` | `GET /api/tickets?status=` | query `{ status?: TicketStatus }` | `Ticket[]` (newest update first) | — |
| `ticketsApi.listNeedsHuman()` | `GET /api/tickets?status=needs_human` | — | `Ticket[]` (bell + Inbox badge) | — |
| `ticketsApi.getTicket(id)` | `GET /api/tickets/:id` | — | `Ticket \| null` | — |
| `ticketsApi.listMessages(id)` | `GET /api/tickets/:id/messages` | — | `Message[]` | — |
| `ticketsApi.listAiAttempts(id)` | `GET /api/tickets/:id/ai-attempts` | — | `AIAttempt[]` | — |
| `ticketsApi.getAiDraft(id)` | `GET /api/tickets/:id/ai-draft` | — | `AIDraft \| null` | — |
| `ticketsApi.getCustomer(id)` | `GET /api/customers/:id` | — | `Customer \| null` (with Shopify orders) | — |

### messages / drafts (`inboxApi`, `api/inbox.ts`)
| function | method + path | request | response | errors |
|---|---|---|---|---|
| `inboxApi.getTicketDetail(id)` | `GET /api/tickets/:id/detail` | — | `TicketDetail \| null` `{ ticket, messages, drafts, attempts, customer, pastTickets, guidanceTitles }` | — |
| `inboxApi.updateTicket(id, patch, actor)` | `PATCH /api/tickets/:id` | `TicketPatch { status?, priority?, assignee? }` | `TicketDetail` (adds System messages) | 404 |
| `inboxApi.bulkUpdate(ids, patch, actor)` | `POST /api/tickets/bulk` | `{ ids: string[], patch: BulkPatch }` | `Ticket[]` | — |
| `inboxApi.sendMessage(id, msg, actor)` | `POST /api/tickets/:id/messages` | `NewMessage { html, isInternal, draftId? }` | `TicketDetail` (removes the draft when `draftId` is sent) | 404 |
| `inboxApi.approveDraft(id, draftId, actor)` | `POST /api/tickets/:id/drafts/:draftId/approve` | — | `TicketDetail` (AI message with `approvedBy`) | 404 |
| `inboxApi.discardDraft(id, draftId)` | `DELETE /api/tickets/:id/drafts/:draftId` | — | `TicketDetail` | 404 |
| `inboxApi.restoreDraft(draft)` | `POST /api/tickets/:id/drafts` | `AIDraft` | `TicketDetail` (Undo after discard) | 404 |

### dashboard (`dashboardApi`, `api/dashboard.ts`)
| function | method + path | request | response | errors |
|---|---|---|---|---|
| `dashboardApi.getDashboardSummary(range)` | `GET /api/dashboard/summary?from=YYYY-MM-DD&to=YYYY-MM-DD` | query `DateRange` | `DashboardSummary` (KPIs with prior-period values + series, charts, `CsatSummary`) | — |

### csat (`csatApi`, `api/csat.ts`)
| function | method + path | request | response | errors |
|---|---|---|---|---|
| `csatApi.getCsatSurvey()` | `GET /api/csat/survey` | — | `CsatSurvey` | — |
| `csatApi.updateCsatSurvey(survey)` | `PUT /api/csat/survey` | `CsatSurvey` | `CsatSurvey` | 422 (validation) |

### search + guidance reads + users list (`directoryApi`, `api/directory.ts`)
| function | method + path | request | response | errors |
|---|---|---|---|---|
| `directoryApi.search(q)` | `GET /api/search?q=` | query | `SearchResults { tickets, customers, articles }` (max 5 each) | — |
| `directoryApi.listArticles()` | `GET /api/guidance/articles` | — | `GuidanceArticle[]` | — |
| `directoryApi.listMacros()` | `GET /api/guidance/macros` | — | `Macro[]` | — |
| `directoryApi.listUsers()` | `GET /api/users` | — | `User[]` | — |

### guidance + macros + sandbox (`guidanceApi`, `api/guidance.ts`)
| function | method + path | request | response | errors |
|---|---|---|---|---|
| `guidanceApi.saveArticle(input, actor)` | `POST /api/guidance/articles` (new) · `PUT /api/guidance/articles/:id` | `ArticleInput` | `GuidanceArticle` | 422 "Title is required." / "Article body is required." |
| `guidanceApi.setArticleActive(id, active)` | `PATCH /api/guidance/articles/:id` | `{ active }` | `GuidanceArticle` | 404 "Article not found" |
| `guidanceApi.importArticles(rows, actor)` | `POST /api/guidance/articles/import` | `ImportRow[]` | `{ imported, skipped }` | — |
| (client) Export CSV | `GET /api/guidance/articles/export.csv` | — | CSV file (built client-side by `downloadCsv` for now) | — |
| `guidanceApi.saveMacro(input)` | `POST /api/guidance/macros` · `PUT /api/guidance/macros/:id` | `MacroInput { name, body }` | `Macro` | 422 "Name is required.", 409 "A macro with this name already exists." |
| `guidanceApi.deleteMacro(id)` | `DELETE /api/guidance/macros/:id` | — | `{ id }` | — |
| `guidanceApi.runSandbox(question, orderNumber?)` | `POST /api/guidance/sandbox` | `{ question, orderNumber? }` | `SandboxResult` | — |

### integrations, AI settings, users (`settingsApi`, `api/settings.ts`)
| function | method + path | request | response | errors |
|---|---|---|---|---|
| `settingsApi.listIntegrations()` | `GET /api/integrations` | — | `IntegrationStatus[]` (secrets masked only) | — |
| `settingsApi.testIntegration(id)` | `POST /api/integrations/:id/test` | — | `TestResult { ok, ms, message }` | — |
| `settingsApi.testPrompt(id, model, prompt)` | `POST /api/integrations/:id/prompt` | `{ model, prompt }` | `TestResult` | — |
| `settingsApi.sendTestEmail(to)` | `POST /api/integrations/resend/test-email` | `{ to }` | `TestResult` | 422 "Enter a valid email address." |
| `settingsApi.getAiSettings()` | `GET /api/settings/ai` | — | `AiSettings` | — |
| `settingsApi.saveAiSettings(s)` | `PUT /api/settings/ai` | `AiSettings` | `AiSettings` (threshold feeds the sandbox) | 422 "Closing time must be after opening time." |
| `settingsApi.inviteUser(email, role)` | `POST /api/users/invite` | `{ email, role }` | `User` (status invited) | 422 "Enter a valid email address.", 409 "A user with this email already exists." |
| `settingsApi.updateUser(id, patch, actorId)` | `PATCH /api/users/:id` | `{ role?, status? }` | `User` | 403 "You can't change your own account" |
| `settingsApi.resetPassword(id)` | `POST /api/users/:id/reset-password` | — | `{ email }` | — |

### widget settings + install / theme editor + widget runtime (`widgetApi`, `api/widget.ts`)
| function | method + path | request | response | errors |
|---|---|---|---|---|
| `widgetApi.getWidgetSettings()` | `GET /api/widget/settings` | — | `WidgetSettings` | — |
| `widgetApi.saveWidgetSettings(settings)` | `PUT /api/widget/settings` | `WidgetSettings` | `WidgetSettings` | 422 (validation) |
| `widgetApi.getInstallStatus()` | `GET /api/widget/install-status` | — | `ShopifyInstallStatus` | — |
| `widgetApi.verifyInstall()` | `POST /api/widget/verify-install` | — | `VerifyResult { detected, message }` (follows embed status) | — |
| `widgetApi.getThemeEmbed()` | `GET /api/shopify/theme-embed` | — | `ThemeEmbedSettings` | — |
| `widgetApi.saveThemeEmbed(theme)` | `PUT /api/shopify/theme-embed` | `ThemeEmbedSettings` | `ThemeEmbedSettings` (also updates `embedEnabled`) | — |
| `widgetApi.getEffectiveWidgetSettings()` | `GET /api/widget/effective-settings` | — | `{ settings: WidgetSettings, embedEnabled }` (what `widget.js` renders) | — |
| `widgetApi.stashDeskPreview(settings)` | client only | `WidgetSettings` | `void` (one-shot `localStorage` hand-off) | — |
| `widgetApi.takeDeskPreview()` | client only | — | `WidgetSettings \| null` (read once, then cleared) | — |
| `widgetApi.listStoreProducts()` | demo storefront only (Shopify Storefront API in production) | — | `StoreProduct[]` | — |
| `widgetApi.getLoggedInCustomer()` | `GET /api/widget/customer` (Shopify customer token) | — | `WidgetCustomer` | — |
| `widgetApi.getWidgetCsatQuestions()` | `GET /api/widget/csat-questions` | — | `CsatQuestion[]` (same store as CSAT Settings) | — |
| `widgetApi.sendChatMessage(text, ctx)` | `POST /api/widget/messages` | `{ text, ...ChatContext }` | `ChatReply { text, order?, handoff? }`. **Scripted** replies, not real AI | — |
| `widgetApi.submitOfflineMessage(input)` | `POST /api/widget/offline-messages` | `OfflineMessageInput` | `{ ok: true }` | 422 "Enter a valid email address." |
| `widgetApi.submitWidgetCsat(answers)` | `POST /api/widget/csat` | `CsatAnswers` | `{ ok: true }` | — |
| `widgetApi.sendTranscript(email)` | `POST /api/widget/transcript` | `{ email }` | `{ email }` | 422 "Enter a valid email address." |

### survey (`surveyApi`, `api/survey.ts`)
| function | method + path | request | response | errors |
|---|---|---|---|---|
| `surveyApi.getSurvey(token)` | `GET /api/surveys/:token` | — | `SurveyLookup` (`valid` / `invalid` / `completed`) | — |
| `surveyApi.submitSurvey(token, answers)` | `POST /api/surveys/:token/responses` | `CsatAnswers` | `{ ok: true }` (the token becomes completed) | 410 "This survey link isn't valid" |

### Infrastructure (not endpoints)
| export | file | purpose |
|---|---|---|
| `client.request(resolve, { empty })` | `api/client.ts` | The single mock transport: latency, demo state, `structuredClone` of the result |
| `client.ApiError` | `api/client.ts` | Error class `{ message, status }` (re-exported from `@/api`) |
| `db.db`, `db.CSAT_QUESTIONS_KEY` | `api/db.ts` | In-memory copy of the seed (resets on reload), and the sessionStorage key for CSAT questions |
| `demoState.getDemoState()`, `demoState.setDemoState(s)`, `demoState.subscribeDemoState(fn)` | `api/demoState.ts` | Global demo-state store (re-exported from `@/api`) |

## 6. Types

All of these live in `src/types/index.ts`.

**Enums / unions:**
- `Channel` (`email` | `chat`)
- `TicketStatus` (`open`, `ai_handling`, `grok_handling`, `needs_human`, `resolved`, `closed`)
- `Priority`
- `Resolver` (`claude` | `grokbot` | `human`)
- `AuthorType` (`customer`, `claude`, `grokbot`, `agent`, `system`)
- `Role` (`admin` | `agent`)
- `UserStatus` (`active`, `invited`, `deactivated`)
- `AITier`
- `EscalationReason`
- `OrderStatus`
- `CsatQuestionType`
- `DelayUnit`
- `RangePreset`
- `KpiFormat`
- `InboxViewId`
- `IntegrationId` (`outlook`, `shopify`, `claude`, `grokbot`, `resend`)
- `IntegrationState` (`connected`, `error`, `not_configured`)
- `RuleCondition`
- `StorePageType`
- `SharedWidgetField`
- `SettingSource` (`desk` | `theme`)
- `LauncherIcon`
- `WidgetState` (8 widget states)
- `CsatStyle` (`stars`, `emoji`, `numeric`)
- `FieldMode` (`required`, `optional`, `off`)

| type | fields (summary) |
|---|---|
| `User` | id, name, email, role, status, lastLoginAt |
| `SessionUser` | the signed-in `User` plus the active (viewed-as) role |
| `Invite` | token, email, role, invitedBy, expired |
| `LineItem` | title, variant, quantity, price, image |
| `ShopifyOrder` | number, createdAt, status `OrderStatus`, total, lineItems, tracking |
| `Customer` | id, name, email, location, totalSpent, orders `ShopifyOrder[]`, tags |
| `CustomerRef` | id, name, email (embedded in tickets) |
| `Ticket` | id `GB-####`, subject, channel, status, priority, customer, assignee, tags, resolvedBy, escalationReason, csatScore, createdAt, updatedAt |
| `Message` | id, ticketId, authorType, authorName, body, createdAt, isInternal, format, approvedBy |
| `AIAttempt` | id, ticketId, tier, model, confidence, outcome, reason, latencyMs, createdAt |
| `AIDraft` | id, ticketId, tier, body, confidence, guidanceIds, createdAt |
| `GuidanceArticle` | id, title, category, tags, body (markdown), active, updatedAt, updatedBy |
| `Macro` | id, name, shortcut, body, tags, usageCount, updatedAt |
| `CsatQuestion` | id, type, text, required, options |
| `CsatSurvey` | questions, sendDelay `{ value, unit }`, channels, lowScoreRecipients |
| `CsatResponse` | id, ticketId, score, comment, channel, resolver, createdAt |
| `DailyMetric` | date, per-channel volume, resolutions, response/resolution times, CSAT |
| `DateRange` | from, to (ISO dates) |
| `KpiMetric` | key, label, value, previous, format, betterWhen, hint, series |
| `ScoreSplit<K>` | key, label, average, count |
| `CsatSummary` | average, previous, responseRate, distribution, trend, byChannel, byResolver, comments, lowScores |
| `DashboardSummary` | range, comparisonLabel, kpis, volume, resolvedBy, escalationReasons, topTags, csat |
| `SearchCustomerResult` / `SearchResults` | grouped search results (tickets, customers, articles) |
| `TicketDetail` | ticket, messages, drafts, attempts, customer, pastTickets, guidanceTitles |
| `TicketPatch` / `BulkPatch` / `NewMessage` | ticket mutation DTOs (see section 5) |
| `IntegrationStatus` | id, name, description, status, lastSyncAt, error, envVar, secretPreview (masked), details, models, model, checklist |
| `TestResult` | ok, ms, message |
| `EscalationRule` | id, condition `RuleCondition`, value, target (`grokbot` \| `human`) |
| `BusinessDay` | day, open, from, to |
| `AiSettings` | threshold, autoSend `{ email, chat } × { claude, grokbot }`, timezone, hours, rules, prompts |
| `SandboxResult` | articles (ranked, scored), draft, confidence, threshold, wouldEscalate, order, orderNotFound |
| `ArticleInput` / `MacroInput` / `ImportRow` | guidance write DTOs |
| `Offset` | x, y (px) |
| `WidgetSettings` | branding (7 colors, logo, avatars, font, radius, shadow), launcher, messaging, display, csat, sources |
| `ThemeEmbedSettings` | enabled, primary, accent, launcherPosition, hideOnMobile |
| `VerifyResult` | detected, message |
| `ShopifyInstallStatus` | shopDomain, embedEnabled, themeName, lastSeenAt, method (`app_embed` \| `script_tag` \| `none`) |
| `StoreProduct` | id, name, price, image, colors, tag |
| `WidgetCustomer` | firstName, name, email, orders |
| `WidgetOrderCard` | number, status, productTitle, variant, image, carrier, trackingUrl, eta |
| `ChatContext` | identity, pageType, pagePath, cart/product context |
| `ChatReply` | text, order?, handoff? |
| `OfflineMessageInput` | name, email, message |
| `CsatAnswers` | answers keyed by question id |
| `SurveyLookup` | `{ status: 'valid', ticket, questions }` \| `{ status: 'invalid' }` \| `{ status: 'completed' }` |

**Effective widget settings:** take the Desk `WidgetSettings`, then pull every field where `sources[field] === 'theme'` from `ThemeEmbedSettings` (`lib/widgetRules.mergeEffective`). In the seed, primary and accent come from Desk, and launcher position and hide-on-mobile come from the theme editor.

## 7. Swapping mocks for real endpoints

1. **One transport module.** Every mock goes through `request()` in `src/api/client.ts`. This is where latency and the demo state are injected. Replace it with a `fetch` wrapper, for example `http<T>(method, path, body)`. That wrapper should:
   - add the auth header;
   - on a non-2xx response, throw `new ApiError(body.message, res.status)`.
2. **Then each domain file** (`auth.ts`, `tickets.ts`, `inbox.ts`, `dashboard.ts`, `csat.ts`, `directory.ts`, `guidance.ts`, `settings.ts`, `widget.ts`, `survey.ts`) swaps its `request(() => …db…)` body for `http(...)`, using the method and path in section 5. Signatures and return types stay the same.
3. **Delete `src/api/db.ts` and `src/mocks/`.** Nothing outside `src/api` imports them; `grep -r "@/mocks" src/components src/pages` returns nothing.
4. **Demo states.** Keep `demoState.ts` if you still want Loading/Empty/Error for demos (check it in the wrapper), or remove `DemoStateSwitcher` from `App.tsx`.
5. **Auth.** `components/auth/AuthContext.tsx` keeps the `SessionUser` in `sessionStorage`. Replace that with your real session or token.
6. **Actors.** Drop the `actor` / `actorId` arguments server-side and derive them from the token instead.

## 8. Chat widget: Shadow DOM and the future widget.js

`SupportWidget` (`components/widget/SupportWidget.tsx`) is the only widget implementation. It renders entirely from a `WidgetSettings` object.

**Props:**
| prop | type | purpose |
|---|---|---|
| `settings` | `WidgetSettings` | Everything the widget shows |
| `mode` | `'live' \| 'contained'` | `live` is portaled to `body` and fixed to the viewport. `contained` sits inside the nearest positioned parent (admin preview, theme editor, styleguide). |
| `forcedState` | `WidgetState` | Initial state. Remount it (`key`) to jump again. |
| `pageType` / `pagePath` | `StorePageType` / `string` | Page-type rules, URL include/exclude, proactive pages |
| `loggedIn` | `boolean` | Skips pre-chat and greets the Shopify customer by first name |
| `outsideHours` | `boolean` | Applies `display.outsideHours` |
| `viewport` | `'auto' \| 'desktop' \| 'mobile'` | Below 640px the panel becomes a full-screen sheet |
| `typing` | `boolean` | Styleguide only: starts with the typing indicator showing |

**Isolation:**
- `ShadowRoot.tsx` calls `attachShadow({ mode: 'open' })` on `<div data-goorin-widget>` and portals the widget inside.
- `widget.css` is imported with `?inline` and injected as a `<style>` element inside the shadow root. It is plain px-based CSS, not Tailwind and not rem.
- Document selectors cannot reach the shadow tree. `:host { all: initial !important }` stops inherited styles, and theme values are inline `--gw-*` custom properties.
- "Inherit from store theme" reads the computed `font-family` of the element the host is mounted in.
- `WidgetErrorBoundary` contains any crash.
- Proof: the "Hostile store CSS" toggle on `/widget-demo`.

**Accessibility:**
- The panel is a labelled `role="dialog"` with a focus trap, using `shadowRoot.activeElement`.
- Esc minimizes the panel and returns focus to the launcher.
- New messages are announced through a polite live region.
- On mobile the sheet locks page scroll and respects the safe area.

**Path to `widget.js`:**
1. Add a Vite library entry (IIFE format) that exports a `mount()`. It should:
   - create the host element;
   - render `SupportWidget` in `live` mode inside `ShadowRoot`;
   - bundle `widget.css?inline` and React (or Preact/compat, to keep it under about 60 kB gzip).
2. On load, the script reads `data-shop` from its `<script>` tag, then:
   - calls `GET /api/widget/effective-settings?shop=`;
   - exits if `embedEnabled` is false;
   - evaluates the display rules (`lib/widgetRules`) for `location.pathname`, then mounts.
3. The Shopify App Embed block (or the script-tag fallback shown in Install) only includes `<script src="$APP_BASE_URL/widget.js" data-shop="goorin.myshopify.com" async></script>`.

**Scripted chat triggers (mock):**
- "Track my order" (or any mention of order / tracking / shipping) returns an order card.
- "talk to a person" / human / agent, or "Wholesale", starts the handoff.
- "Sizing help" and "Returns" get canned answers.
- The logged-in demo customer is Dev Patel, and the greeting bubble appears after 5 s.

## 9. Demo tools, mock auth, persistence

**Demo state switcher.** The floating pill at the bottom right appears in dev or when `VITE_DEMO_TOOLS=true`. It sets a global mode that `request()` reads:
- **Live:** mock data after latency.
- **Loading:** promises never resolve, so skeletons show.
- **Empty:** list/summary endpoints return empty values.
- **Error:** every request throws `ApiError` 500, and pages show `ErrorState` with "Try again".

On `/widget-demo` the switcher moves so it doesn't cover the launcher.

**Mock auth rules:**
- Any valid email plus any non-empty password signs in as **Ava Martinez (Admin)**.
- `error@goorin.com` returns "Incorrect email or password."
- The user menu has "View as" Admin/Agent. Agent hides Settings.
- `/login?invite=<any>` accepts an invite as Priya (Agent). `/login?invite=expired` shows the expired state.

**Reset on reload.** All mock data lives in memory (`api/db.ts`) and resets on every page load. There are two persistence exceptions, plus a one-shot hand-off:

| what | where | why |
|---|---|---|
| Session + selected role | `sessionStorage['goorin.session']` | You stay signed in across reloads in the same tab |
| CSAT **questions only** | `sessionStorage['goorin.csatQuestions']` | The hosted survey reflects drawer edits. Send delay, channels and recipients reset to defaults. |
| One-shot preview hand-off | `localStorage['goorin.deskPreview']` | "Preview on my store" passes the unsaved draft to a new tab. It is read once and then cleared. |

## 10. Quality checks

| check | command | result at handoff |
|---|---|---|
| TypeScript | `yarn typecheck` | 0 errors |
| No mock imports in UI | `grep -rn "@/mocks" src/components src/pages` | none |
| No Emergent packages | `grep -i emergent package.json` | none |
| README coverage (Q-34) | `node scripts/check-readme.mjs` | 0 missing api functions / component files / types |
| axe WCAG 2.1 A/AA serious+critical (Q-35) | `node scripts/audit.mjs http://localhost:4173` against `yarn build && npx vite preview --port 4173` | 0 on every route |
| Focus ring | the same audit tabs through each route and flags focused elements without an outline or ring | none flagged. The native time inputs' clock button has its ring on `::-webkit-calendar-picker-indicator`, which getComputedStyle can't read, so it was checked by screenshot instead |
| Horizontal overflow at 768 / 1024 | the same audit, signed-in routes | 0 px everywhere |
| Console errors | the same audit (preview build; the dev server's HMR websocket is excluded by running against `vite preview`) | 0 |

## 11. Brand assets

**Files** (in `public/images/brand/`):
- `goorin-wordmark-black.svg` and `goorin-wordmark-cream.svg`: the official GOORIN wordmark, aspect 6.2:1, never stretched.
- `goorin-castle-mark.svg`: the castle mark.

**Components:** `GoorinWordmark`, `GoorinCastle` and `GoorinMonogram`.

**Where the wordmark is used:**
- Black: login, the storefront header and the mini stores.
- Cream: the survey header and the widget's default header logo.

**Sidebar:**
- The surface is white.
- Collapsed: a white castle on a brass `#B08D57` tile.
- Expanded: the 160px black wordmark centered over a "Support Desk" label.
- The active item is a raised `#F3EEE7` tile with a 3px brass bar on its own left edge.
- The collapse toggle sits in the bottom section, on the Settings row.

**Favicon:** a white castle on a brass rounded tile (`public/favicon.svg`).

## 12. Seed facts

- **Tickets:** 40, `GB-1041`…`GB-1080`.
  - 5 open, 5 ai_handling, 4 grok_handling, **7 needs_human**, 12 resolved, 7 closed.
  - Email and chat.
- **Other records:** 20 customers with Shopify orders, 15 guidance articles (14 active), 8 macros, 3 users (Ava Admin, Sam Agent, Priya invited).
- **Metrics:** 180 days of daily metrics (90 selectable, plus 90 days of history so the 90d range has a prior period).
- **CSAT:**
  - 14 hand-written commented responses, 4 of them scored ≤2.
  - The default send delay is 2 hours.
  - Survey tokens `tok_GB1066` and `tok_GB1070` are valid.
- **Integrations:**
  - Outlook, Shopify and Claude are connected.
  - Grokbot is in error (401).
  - Resend is not configured.
  - Masked secrets show the env var names `OUTLOOK_CLIENT_SECRET`, `SHOPIFY_ADMIN_API_TOKEN`, `ANTHROPIC_API_KEY`, `XAI_API_KEY` and `RESEND_API_KEY`.
- **Shopify:** goorin.myshopify.com, theme "Dawn – Goorin 2026", App embed enabled.
