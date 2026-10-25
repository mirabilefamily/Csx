# Phase 6 Journeys

### JRN-91 Styleguide is complete and current
- steps: Signed out, open /styleguide and use the in-page index to visit each section.
- expected: Colors, type scale, buttons, inputs, 5 author badges, 6 status pills (needs_human amber), cards, tables, empty/loading/error states. The AI draft card (Claude + Grokbot, low + high confidence), escalation chip, internal note, composer. Widget components: launcher circle/pill S/M/L, greeting bubble, header, bubbles, typing indicator, quick replies, order card, handoff, offline form, CSAT stars/emoji/numeric, transcript confirmation. Dashboard pieces (KPI strip item, sparkline, ranked bars, stacked bar), sidebar nav states, segmented control, integration card, settings form section. All match the live app's current design.

### JRN-92 README handoff
- steps: Open /app/frontend/README.md and compare it with /src/api, /src/components, /src/types and the router.
- expected: Setup/scripts/env vars and the folder structure are present. Every component is listed with a purpose. Every api function is listed with method, path, request/response types and error shape. Types are documented. The mock-swap guide, Shadow DOM + widget.js section, demo tools/mock auth/persistence notes, and the route table with access levels are all there. Nothing in the source is missing from the lists.

### JRN-93 Accessibility audit
- steps: Run axe on every route listed in REQ-371 (signed in as Admin where needed, widget panel open on /widget-demo). Tab through each route.
- expected: 0 serious/critical violations. A visible focus ring on every interactive element.

### JRN-94 Tablet + console sweep
- steps: Visit every signed-in route at 768 and 1024, and watch the console.
- expected: No horizontal page overflow and no console errors.

### JRN-95 Full-app smoke regression
- steps: Sign in → dashboard range change → open GB-1076, approve a draft → Guidance sandbox sizing run → Settings → Chat Widget, change a color, Save → /widget-demo open chat, Track my order → /survey/tok_GB1066 submit.
- expected: Each step works with the copy asserted in earlier journeys.
