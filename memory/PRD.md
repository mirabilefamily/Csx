# PRD: Goorin Support Desk (UI/UX prototype)

## Original problem statement
Phase 1 build brief: front-end-only clickable prototype of an AI-first support desk for Goorin Bros. (heritage hat brand). React 19 + TS + Vite + Tailwind + shadcn/ui + lucide-react + Recharts. No backend, DB, auth provider or Emergent packages. All data typed mocks behind a single async /src/api layer. Full scope in /app/memory/product/overview.md, phase1/requirement.md (REQ-1..94, Q-1..Q-9 hard quality bars), phase1/journeys.md (JRN-1..26).

## Personas
Admin (support lead), Agent (support rep), Customer (later phases), Backend developer (handoff via README + /styleguide).

## Architecture
- /app/frontend only. Vite dev server on 0.0.0.0:3000 (`yarn start`), `allowedHosts: true`.
- src/api (only importer of src/mocks) → request() wrapper with 300–700ms latency + global demo state (live/loading/empty/error).
- src/mocks: 40 tickets, messages, AI attempts, 3 AI drafts, 20 customers + Shopify orders, 15 articles, 8 macros, 3 users, 180 days metrics, CSAT survey + responses. Timestamps relative to now; resets on reload.
- src/theme/tokens.ts → tailwind.config.ts (colors fully overridden, no default blue), charts, styleguide.
- Session + role in sessionStorage.

## Implemented (Phase 1, Oct 2026)
- Login (sign in, validation, error@goorin.com, forgot password, invite + expired invite)
- App shell: collapsible sidebar w/ needs-human badge, ⌘K/Ctrl+K grouped search, notification bell, user menu w/ role toggle + sign out, no-access screen, placeholders, 404
- Dashboard: date range (Today/7d/30d/90d/Custom ≤90d), 7 KPI cards with prior-period deltas, 4 charts, CSAT section (trend, distribution, by channel, by resolver, comments, low scores)
- CSAT settings drawer: dnd-kit + keyboard reorder, rating/text/choice, validation, send delay, channel toggles + paused warning, recipient chips, live preview, save toast, discard guard
- Demo state switcher on every page; /styleguide foundations; README with API contract
- Testing agent iteration 1: 25/26 journeys pass, only a Recharts console warning (fixed)

## Implemented (Phase 2 Inbox, Oct 2026)
- /inbox/:ticketId? 3-pane + details sidebar, 7 views with live counts + ?view= URL; one ticket store feeds views, list, nav badge and bell
- Rows, filters popover (status/channel/resolved-by/tag/assignee), bulk Assign/Tag/Close with exact toasts and an error toast
- Conversation: author-styled thread, yellow internal notes, Claude/Grokbot draft cards (Approve/Edit/Discard+Undo), escalation chip with hover/focus reasons, header status/priority/assignee that add System messages
- Tiptap composer (bold, italic, link, bullets), "/" + button macro picker with placeholder fill, reply/internal-note modes
- Right sidebar: customer card, Shopify orders, past tickets, collapsible AI attempt log
- Shortcuts j/k/r/n/e/? with help modal; responsive (≥1440 side by side, 1024–1439 Details toggle, <1024 single pane + Back + views dropdown)
- Fixed REQ-154: ⌘K after a bell click no longer loses focus
- Testing agent iteration 2: 17/18 journeys passed. JRN-31 couldn't be reached from the UI and was fixed afterwards: the list now stays visible with an error banner when a refresh fails

## Backlog
- P0 Phase 3: Guidance (articles, macros, sandbox, CSV) + Settings (Integrations, AI, Users)
- P1 Phase 4: chat widget (Shadow DOM) + /widget-demo + /survey/:token
- P2 Phase 5: Chat Widget settings + Theme Editor mock; Phase 6: README/styleguide finalization, a11y audit


## Phase 3 — Guidance + Settings (Oct 2026) — DONE
- Guidance: Articles (search/filters/active toggle, markdown editor + live preview, validation, unsaved guard, ?article= deep link), Macros (editor, placeholders, sample preview, shared with Inbox / picker), Test Sandbox (deterministic retrieval, confidence vs saved threshold, order lookup), CSV import/export.
- Settings: /settings -> /settings/integrations; Integrations (5 mock cards, masked secrets + env var names), AI (threshold, auto-send matrix, hours, rules, prompts, unsaved bar), Widget placeholder, Users (invite/role/deactivate/reset, self-protection).
- REQ-223: GB-1076 conversation 552px at 1440.
- Testing: iteration_3 13/14 pass; JRN-56 flags re-verified manually (duplicate invite error + toasts shown).



## Phase 4 — Customer widget + hosted survey (Oct 2026) — DONE
- SupportWidget (Shadow DOM, settings-driven, live/contained modes, 8 forced states), full WidgetSettings + ShopifyInstallStatus types/mocks via /src/api.
- /widget-demo storefront (Product/Collection/Cart, 8 AI hat photos + hero + lifestyle in /public/images), demo controls (state jumps, logged-in, outside hours, hostile CSS, docked demo switcher).
- /survey/:token hosted CSAT (tok_GB1066 valid, done, invalid), follows CSAT Settings via sessionStorage.
- Testing: iteration_4 14/15 auto + JRN-73 manually verified (Step 1 of 4 after adding question).

## Backlog
- P1 Phase 6: styleguide completion, README contract, a11y/tablet audit


## Phase 5 — Chat Widget settings + Shopify theme editor + design refresh (Oct 2026) — DONE
- /settings/widget: 6 collapsible sections, live preview (real SupportWidget, contained, 8 states, Desktop/Tablet/iPhone frames, hidden-by-rules overlays), WCAG contrast warnings, uploads via object URLs, dnd quick replies, unsaved bar + guard, Preview on my store (one-shot localStorage hand-off).
- Install: status card, App embed step, script snippet (VITE_APP_BASE_URL), per-field source (Desk vs Theme), Verify driven by embed status. /widget-demo/theme-editor Shopify-style mock.
- Design refresh: centered login card with GOORIN wordmark; modern dashboard (KPI strip w/ sparklines, volume area chart, stacked resolved-by bar, ranked lists, condensed CSAT w/ tabs); light sidebar restyle (castle tile collapsed, wordmark expanded, brass active bar on tile, edge toggle tab); favicon castle on brass.
- Testing: iteration_5 15/15, iteration_6 sidebar/brand regression all pass; later header/indicator/favicon tweaks verified via screenshots.

## Implemented (Phases 5–6, Oct 2026)
- Phase 5: Chat Widget settings (/settings/widget), Shopify Theme Editor mock, login/dashboard refresh, light sidebar (toggle in bottom section, white castle tile, centered 160px wordmark), Settings redesign (tab bar, integration health, AI form sections, users search, widget section summaries), preview font inherit fix.
- Phase 6 handoff: /styleguide updated with sticky index + real-component specimens (drafts, chip, note, composer, 15 SupportWidget Shadow DOM instances, dashboard, nav, segmented, integration card, form section); README full backend contract (verified by scripts/check-readme.mjs, 0 missing); a11y audit scripts/audit.mjs: axe serious/critical 20 → 0 on 14 routes, 0 overflow at 768/1024, 0 console errors.

## Backlog
- P2: real widget.js bundle (Vite IIFE entry), real backend swap per README section 7.
