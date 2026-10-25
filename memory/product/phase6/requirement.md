# Phase 6: Handoff pack (styleguide, README contract, accessibility + tablet audit)

- Version: phase-6
- Goal: make the prototype ready for the backend team. A complete /styleguide, a README that lists every component plus the full mock-to-API contract, and a final accessibility + tablet pass across every route. No new product features.
- Product context: [overview.md](../overview.md). Feature id: F-40 (plus the F-17 styleguide completion).

## Functional requirements

### Styleguide (/styleguide, public)
- REQ-358 [always] The system shall show on /styleguide: color tokens, the type scale, buttons, inputs, author badges (5), status pills (6), cards, tables, empty/loading/error states. All of these exist from phase 1 and must reflect the current refreshed design.
- REQ-359 [always] The system shall show on /styleguide the AI draft card (Claude and Grokbot variants, low and high confidence), the escalation timeline chip, an internal note and the composer.
- REQ-360 [always] The system shall show on /styleguide the widget components: launcher (circle and pill, S/M/L), greeting bubble, panel header, customer/AI/agent bubbles, typing indicator, quick-reply chips, inline order card, handoff, offline form, inline CSAT (stars, emoji, numeric) and transcript confirmation, rendered through the real SupportWidget/Shadow DOM.
- REQ-361 [always] The system shall show on /styleguide the refreshed dashboard pieces (KPI stat strip item, sparkline, ranked bar list, stacked proportion bar), the sidebar nav item states (default, hover, active, collapsed with badge), the segmented control, the integration card and the settings form-section pattern.
- REQ-362 [always] The system shall provide a sticky in-page index on /styleguide linking to each section (interpreted).

### README (/app/frontend/README.md)
- REQ-363 [always] The system shall document setup and scripts (yarn, dev on port 3000, build, preview), env vars (VITE_APP_BASE_URL, VITE_DEMO_TOOLS) and the folder structure.
- REQ-364 [always] The system shall list every component in /src/components with a one-line purpose, grouped by folder.
- REQ-365 [always] The system shall list every /src/api function with its future HTTP method, path, request type, response type and error shape, grouped by domain (auth, tickets, messages/drafts, dashboard, csat, guidance, macros, sandbox, integrations, ai settings, users, widget settings, install/theme editor, survey).
- REQ-366 [always] The system shall document every type in /src/types (Ticket, Message, AIAttempt, GuidanceArticle, Macro, CsatSurvey, CsatQuestion, User, IntegrationStatus, WidgetSettings, ShopifyInstallStatus, and the others) or link to them with a field summary.
- REQ-367 [always] The system shall explain how to swap mocks for real endpoints (where latency/demo state are injected, and which single module to change).
- REQ-368 [always] The system shall document the Shadow DOM widget approach and the path to a standalone widget.js bundle.
- REQ-369 [always] The system shall document the demo state switcher, the mock auth rules, the reset-on-reload behaviour and the two persistence exceptions (session + CSAT questions, plus the one-shot preview handoff).
- REQ-370 [always] The system shall list every route with its access level (public / signed-in / admin).

### Accessibility + responsive audit
- REQ-371 [always] The system shall have zero axe serious/critical violations on every route: /login, /dashboard, /inbox/:id, /guidance (3 tabs), /settings (4 tabs), /styleguide, /widget-demo (widget open), /widget-demo/theme-editor, /survey/:token.
- REQ-372 [always] The system shall have no horizontal page overflow at 768px and 1024px on every signed-in route.
- REQ-373 [always] The system shall show a visible focus ring on every interactive element on every route.
- REQ-374 [always] The system shall have no console errors on any route under normal use.

## Quality requirements
```
Q-34 Tag: Handoff.Completeness
     Scale: /src/api functions or /src/components files missing from the README
     Meter: diff README lists vs source tree
     Must: 0   Plan: 0
Q-35 Tag: Accessibility.Axe
     Scale: axe serious+critical violations summed across all routes
     Meter: @axe-core/playwright on each route
     Must: 0   Plan: 0
Q-36 Tag: Portability.Build
     Scale: TypeScript errors / Emergent packages / component imports of /src/mocks
     Meter: tsc, grep
     Must: 0   Plan: 0
```
