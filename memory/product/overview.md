# Requirements: Goorin Support Desk (UI/UX prototype)

## Core Value
A fully clickable, front-end-only prototype of an AI-first customer service desk for Goorin Bros. (heritage hat brand, est. 1895). Claude answers first, Grokbot is the second AI tier, humans take over when needed. Everything runs on typed mock data behind a single API layer, so the backend team can later swap the mocks for real endpoints without touching any component.

## Personas & Roles
- **Admin** (support lead): sees everything, including Settings (Integrations, AI, Chat Widget, Users).
- **Agent** (support rep): sees Dashboard, Inbox and Guidance, with full edit rights in Guidance. Cannot see Settings. Opening /settings by URL shows a "No access" screen.
- **Customer** (Goorin shopper): uses the storefront chat widget and the hosted CSAT survey. No login.
- **Backend developer** (handoff reader): uses /styleguide, the README and the mock-to-API contract.
- The role toggle sits in the user menu (Admin / Agent). It switches permissions for the same signed-in user (Ava Martinez).

## Features
| id | feature | persona | phase |
|---|---|---|---|
| F-1 | React + TypeScript + Vite + Tailwind + shadcn/ui + lucide-react + Recharts project. No backend, DB, auth provider or Emergent libs; portable to any React env | Dev | 1 |
| F-2 | Typed mock JSON in /src/mocks; every read/write goes through one async /src/api layer (simulated latency) that returns mocks; components never import mocks directly | Dev | 1 |
| F-3 | /src/theme design tokens + Tailwind config: palette, Fraunces (titles + KPI numbers only) + Inter, 8px grid, 10px radius, 1px borders, minimal shadows; light mode only | All | 1 |
| F-4 | Shared author badges (Customer neutral, Claude brass, Grokbot slate, Agent brown, System gray) and status pills (open, ai_handling, grok_handling, needs_human high-vis amber, resolved, closed), used consistently everywhere | All | 1 |
| F-5 | Designed empty, loading (skeleton) and error states on every data page, plus a floating "demo state" switcher (Live / Loading / Empty / Error) on every page, hidden in production builds | All | 1 (extended each phase) |
| F-6 | Accessibility: WCAG AA contrast, full keyboard navigation, visible focus rings | All | every phase |
| F-7 | App shell: collapsible left sidebar with text "Goorin Bros." wordmark; nav Dashboard, Inbox (needs-human count badge), Guidance, Settings (admin only); top bar with global search, notification bell (needs_human alerts), user menu | Admin, Agent | 1 |
| F-8 | Role toggle in user menu (Admin / Agent); agents cannot see Settings | Admin, Agent | 1 |
| F-9 | Desktop-first, usable down to tablet (768px) | Admin, Agent | every phase |
| F-10 | Login (/login): email + password, forgot-password flow, accept-invite variant; gates the app (mock) | Admin, Agent | 1 |
| F-11 | Dashboard: date-range picker (today, 7d, 30d, 90d, custom); 7 KPI cards with delta vs prior period (open tickets, tickets created, AI resolution rate, first response time, resolution time, CSAT average, CSAT response rate) | Admin, Agent | 1 |
| F-12 | Dashboard charts: volume by channel (email vs chat), resolved-by split (Claude / Grokbot / human), escalation reasons (horizontal bar), top tags | Admin, Agent | 1 |
| F-13 | CSAT section: score trend line, 1–5 distribution, split by channel and by resolver, latest comments feed linking to tickets, low-score list (≤2) with "needs follow-up" flag | Admin, Agent | 1 |
| F-14 | CSAT Settings drawer: drag-to-reorder question builder (rating / text / choice), send delay, channel toggles (email, inline chat), low-score alert recipients, live survey preview | Admin, Agent | 1 |
| F-15 | Global search (tickets, customers, guidance articles), opens with ⌘K / Ctrl+K | Admin, Agent | 1 |
| F-16 | Notification bell listing needs_human tickets, each linking to the ticket | Admin, Agent | 1 |
| F-17 | /styleguide: colors, type scale, buttons, inputs, badges, status pills, cards, tables, empty states (foundations); AI draft card and widget components added later | Dev | 1 + 6 |
| F-18 | Mock data: ~40 tickets (every status, both channels, hat-brand scenarios), Claude/Grokbot/human resolvers, 15 guidance articles, 8 macros, 3 users, 90 days of metrics, CSAT responses with comments | All | 1 |
| F-19 | Inbox 3-pane layout; views All open, Needs human, AI handling, Mine, Unassigned, Resolved, Closed | Admin, Agent | 2 |
| F-20 | Ticket list rows (customer, subject/preview, channel icon, status pill, resolved-by badge, relative time); filters (status, channel, resolved-by, tag, assignee); bulk multi-select assign / tag / close | Admin, Agent | 2 |
| F-21 | Conversation pane: threaded messages with author badges, yellow-tinted internal notes, AI draft cards (confidence meter, guidance used, Approve / Edit / Discard), escalation timeline chip (Claude → Grokbot → Human, reason on hover), header controls for status, priority, assignee | Admin, Agent | 2 |
| F-22 | Composer: rich text, macros picker (/ shortcut), internal-note toggle, send | Admin, Agent | 2 |
| F-23 | Right sidebar: customer card, Shopify orders (status, tracking link, line items), past tickets, collapsible AI attempt log (tier, model, confidence, latency, guidance articles) | Admin, Agent | 2 |
| F-24 | Inbox shortcuts j/k navigate, r reply, n note, e close, shortcut help modal | Admin, Agent | 2 |
| F-25 | Inbox collapses to a single pane on narrow screens | Admin, Agent | 2 |
| F-26 | Guidance Articles: searchable table, category/tag filters, active toggle, last updated; split-view markdown editor with live preview, title, category, tags | Admin, Agent | 3 |
| F-27 | Guidance Macros: list and editor | Admin, Agent | 3 |
| F-28 | Guidance Test Sandbox: sample question + optional order number; retrieved articles with relevance scores, Claude draft reply, confidence gauge, "would escalate to Grokbot" indicator | Admin, Agent | 3 |
| F-29 | Guidance CSV import (dropzone + column-mapping preview) and export | Admin, Agent | 3 |
| F-30 | Settings → Integrations: cards for Outlook, Shopify, Claude, Grokbot, Resend with logo placeholder, status, last sync, Test connection, expandable details; secrets masked + read-only ("from env vars") | Admin | 3 |
| F-31 | Settings → AI: confidence threshold slider, auto-send matrix (channel × tier), business hours editor, escalation rules, read-only system prompt viewer | Admin | 3 |
| F-32 | Settings → Users: table (name, email, role, status, last login), invite modal (email, role), change role / deactivate / reset password | Admin | 3 |
| F-33 | Customer chat widget component rendered in Shadow DOM, with all states: launcher + unread badge, proactive greeting, panel header (logo, title, AI disclosure, minimize), pre-chat form (auto-skipped for logged-in customer), conversation (bubbles + avatars, typing indicator, quick-reply chips, inline order card), handoff, offline email form, inline CSAT, transcript confirmation | Customer | 4 |
| F-34 | /widget-demo: full-page mock Goorin storefront with the live widget and every state clickable; mobile full-screen sheet with safe-area composer; focus trap, Esc to close, ARIA live region | Customer | 4 |
| F-35 | Hosted CSAT survey /survey/:token: branded header, one question per step, progress bar, mobile-first, thank-you state | Customer | 4 |
| F-36 | Settings → Chat Widget (/settings/widget): two-column layout, sticky live preview (storefront variant product/collection/cart, device desktop/tablet/mobile iPhone frame, 8 states), instant updates, unsaved-changes bar, "Preview on my store" | Admin | 5 |
| F-37 | Widget Branding, Launcher, Messaging, Display rules, CSAT-in-chat sections (every field in the brief) | Admin | 5 |
| F-38 | Widget Install (Shopify): status card, App Embed step card + "Open Theme Editor" + toggle illustration, script-tag fallback snippet, source indicator, "Verify installation" | Admin | 5 |
| F-39 | Shopify Theme Editor mock (/widget-demo/theme-editor) styled like Shopify admin | Admin | 5 |
| F-40 | README: every component listed + mock-to-API contract; Shadow DOM approach documented; styleguide completed (AI draft card, widget components); final accessibility + tablet audit | Dev | 6 |

## Phases
- **Phase 1: Foundation + Dashboard.** Gets the Vite/TS project, tokens, shell, login, mock data + API layer, Dashboard and CSAT drawer, and styleguide foundations working. Delivers F-1 to F-18. [requirement](phase1/requirement.md) · [journeys](phase1/journeys.md)
- **Phase 2: Inbox.** The full agent workspace. Delivers F-19 to F-25.
- **Phase 3: Guidance + Settings (Integrations, AI, Users).** Delivers F-26 to F-32.
- **Phase 4: Customer-facing widget + survey.** The widget component in every state, /widget-demo, hosted survey. Delivers F-33 to F-35.
- **Phase 5: Chat Widget settings + Theme Editor mock.** Delivers F-36 to F-39.
- **Phase 6: Handoff.** Finished styleguide, README contract, accessibility/tablet audit. Delivers F-40.

## UI/UX Rules
- Light mode only. Heritage-craft warmth with modern SaaS usability, not corporate blue.
- Tokens: background #FAF8F5, surfaces white, text charcoal #1F1D1A, primary tobacco #6B4F3A, accent muted brass #B08D57; status muted green / amber / red / slate.
- Fraunces for page titles and KPI numbers ONLY; Inter everywhere else.
- 8px spacing grid, 10px radius, subtle 1px borders, minimal shadows, generous whitespace.
- Author badges and status pills always come from the shared components and are never restyled locally.
- needs_human is always the highest-visibility (amber) status.
- Every data page has designed skeleton, empty and error states, all reachable via the demo state switcher.
- WCAG AA contrast, every control keyboard-reachable, visible focus rings, drawers and modals trap focus and close on Esc.
- Desktop-first; nothing breaks or scrolls horizontally at 768px.
- Copy speaks the Goorin voice: warm, a little old-world, never cutesy.

## Integrations
No real integrations. Everything is MOCKED on purpose (UI/UX-only scope).
| service shown in UI | how it behaves in prototype |
|---|---|
| Outlook (support@goorin.com), Shopify, Claude, Grokbot, Resend | Mock status cards/details from /src/api; "Test connection", "Send test email", "Verify installation" return mock success/fail results |
| Claude / Grokbot models | Mock model lists (e.g. claude-sonnet-5-5, claude-opus-5-5, claude-haiku-4-5, grok-4.7); test prompts return canned replies |
| Auth | Mock login. Any valid email + non-empty password signs in as Ava Martinez; error@goorin.com triggers the error state |
| Product imagery | AI-generated hat product photos saved as static assets inside the repo (portable) |

## Edge Cases
- Mock data resets to the originals on every page reload. The sign-in session and the selected role survive a reload (sessionStorage) so reviewers aren't logged out (interpreted).
- All mock dates are relative to "now", so data always looks current.
- An agent opening /settings by URL gets a "No access" screen, not a blank page or redirect loop.
- Time-based KPIs (first response, resolution time) show a decrease as good (green).
- A custom date range is limited to the 90 days of available data.
- /styleguide, /widget-demo, /widget-demo/theme-editor and /survey/:token are public. Everything else requires sign-in (interpreted).
- An unknown route shows a designed 404 linking back to Dashboard.
- The demo state switcher is visible in dev/preview and hidden in production builds unless VITE_DEMO_TOOLS=true (interpreted).
- "Preview on my store" opens /widget-demo?desk_preview=1 in a new tab with the current unsaved settings (no real store).
- Theme Editor mock and Chat Widget settings share mock state. Desk settings override theme defaults, and the source indicator shows which one is active.

## Seed Data
Seeding is explicit scope. All of it lives in /src/mocks:
- ~40 tickets (IDs like GB-1042) covering all 6 statuses and both channels (email, chat). Scenarios: sizing, order status, returns, damaged items, custom orders, wholesale inquiries. Resolvers mix Claude, Grokbot and human.
- Messages per ticket (customer / claude / grokbot / agent / system, some internal notes), AI attempts per ticket, AI drafts awaiting approval on some needs_human tickets.
- Customers with Shopify orders (status, tracking, line items).
- 15 guidance articles, 8 macros.
- 3 users: Ava Martinez (Admin, active, ava@goorin.com), Sam Okafor (Agent, active), Priya Shah (Agent, invited).
- 90 days of daily dashboard metrics, CSAT survey config + responses with comments (including scores ≤2).
- Phase 3+: integration statuses, AI settings. Phase 4/5: widget settings, Shopify install status.
