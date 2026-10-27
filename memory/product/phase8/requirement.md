# Phase 8: Refund tracker + Fraud alerts (Dashboard)

- Version: phase-8
- Goal: add two Dashboard panels on mock data, "Refunds" (automated refund tracker) and "Fraud alerts" (risk-scored alerts with review actions). Also a fraud flag on affected tickets in the Inbox, and an auto-refund limit in Settings → AI. UI/UX only: all actions are MOCKED in the API layer, with no real Shopify refunds or fraud engine.
- Product context: [overview.md](../overview.md). The user said "just UI/UX" and skipped the details, so defaults were chosen (all interpreted). Feature ids: F-42, F-43. Phone layouts follow the phase-7 rules.

## Functional requirements

### Data model (mock, via /src/api)
- REQ-427 [always] The system shall define RefundRecord {id, ticketId, orderNumber, customer, amount, currency, reason, stage: requested|approved|refunded|declined|on_hold, decidedBy: claude|grokbot|human|null, auto, createdAt, refundedAt}.
- REQ-428 [always] The system shall define FraudAlert {id, ticketId, orderNumber, customer, riskScore 0–100, level high|medium|low, signals[{code,label}], amountAtRisk, status open|safe|held|escalated, createdAt, reviewedBy, reviewedAt}.
- REQ-429 [always] The system shall seed ~30 refunds across 90 days, linked to existing tickets/orders, covering every stage and both auto (AI) and human decisions.
- REQ-430 [always] The system shall seed ~8 fraud alerts (at least 3 open, mixed high/medium/low, several reviewed) using the standard signals: repeat refund requests, "not received" but tracking shows delivered, high-value order, new account with a large order, billing/shipping mismatch.

### Refunds panel (Dashboard)
- REQ-431 [always] The system shall show a "Refunds" panel with: total refunded ($) in range with delta, refund count, % auto-refunded by AI, and pending approval (count + $).
- REQ-432 [always] The system shall show a stage pipeline bar Requested → Approved → Refunded (plus Declined / On hold counts).
- REQ-433 [always] The system shall show a refunds trend sparkline for the selected range.
- REQ-434 [always] The system shall show an "Awaiting approval" list (customer, order #, amount, reason, age, AI recommendation), each linking to /inbox/<ticketId>.
- REQ-435 [event] When the date range changes, the system shall recompute the Refunds panel.
- REQ-436 [state] While there are no refunds in range, the system shall show "No refunds in this period".

### Fraud alerts panel (Dashboard)
- REQ-437 [always] The system shall show a "Fraud alerts" panel with an open count and tabs "Open" / "Reviewed".
- REQ-438 [always] The system shall show each alert with: risk score + level badge (High red, Medium amber, Low slate, with text and not color alone), customer, order #, amount at risk, signal chips, time and a ticket link.
- REQ-439 [event] When the user clicks "Mark safe", "Hold refund" or "Escalate", the system shall update the alert status, move it to Reviewed with "<action> by Ava Martinez", and show a toast ("Marked safe", "Refund held", "Escalated to admin").
- REQ-440 [event] When the user clicks "Hold refund" on an alert with a linked pending refund, the system shall set that refund's stage to On hold in the Refunds panel.
- REQ-441 [event] When the user clicks Undo in the action toast, the system shall restore the alert to Open.
- REQ-442 [state] While there are no open alerts, the system shall show "No open fraud alerts. All clear."
- REQ-443 [unwanted] If an action fails (demo state Error), then the system shall show "Couldn't update the alert. Try again." and leave it unchanged.

### Inbox fraud flag
- REQ-444 [state] While a ticket has an open fraud alert, the system shall show a red shield icon on its list row (aria-label "Fraud risk: <level>").
- REQ-445 [state] While a ticket has an open fraud alert, the system shall show a red banner in its conversation, "Fraud risk <score> · <level>", with signal chips and a "View alert" link to /dashboard#fraud.
- REQ-446 [always] The system shall keep the bell and nav badge counting needs_human only (fraud alerts don't change them).

### Settings → AI: auto-refund limit
- REQ-447 [always] The system shall add an "Auto-refunds" section: a toggle "Let AI issue refunds automatically" and a max amount input (default $75), with the note "Refunds above this amount, or with an open fraud alert, wait for human approval."
- REQ-448 [unwanted] If the amount is outside $0–$500, then the system shall show "Enter an amount between $0 and $500." and block Save.
- REQ-449 [event] When the admin saves, the system shall show "AI settings saved" and show the limit in the Refunds panel ("Auto-refund limit: $75").

### Layout and states
- REQ-450 [always] The system shall place both panels side by side below the volume chart on desktop and stack them on tablet/phone, with a #fraud anchor.
- REQ-451 [always] The system shall give both panels skeleton, empty and error states via the demo switcher.
- REQ-452 [always] The system shall keep phone rules: no overflow at 360/390/430, tap targets ≥44px, alert actions as full-width buttons or an actions sheet.

## Quality requirements
```
Q-42 Tag: Trust.Clarity
     Scale: alerts where the reviewer can't tell why it fired (no signal chip) or what's at stake (no amount)
     Meter: review all seeded alerts
     Must: 0   Plan: 0
Q-43 Tag: Accessibility.Color
     Scale: risk levels or stages conveyed by color only
     Meter: inspection
     Must: 0   Plan: 0
Q-44 Tag: Regression
     Scale: earlier dashboard/inbox/settings journeys failing
     Meter: re-run prior checks
     Must: 0   Plan: 0
```

## Dashboard typography + design refinement (user request: "Refine design, improve font on dashboard, does not look great")
Overrides the original rule "serif for KPI numbers" (user feedback). Fraunces is now used for page titles only.
- REQ-453 [always] The system shall render all numbers (KPI values, CSAT average, Resolved-by %, refund $ amounts, risk scores, chart labels) in Inter with tabular, lining figures (font-variant-numeric: tabular-nums), semibold, tracking about -0.02em.
- REQ-454 [always] The system shall render units and suffixes ("min", "h", "m", "%", "pts", "/ 5") smaller (~60–65%) and muted next to the number, e.g. "5.7 min", "6h 4m".
- REQ-455 [always] The system shall use the Fraunces variable font with optical sizing and SOFT 0 / WONK 0 (no quirky glyphs), weight ~500, only for page titles (h1).
- REQ-456 [always] The system shall apply one dashboard type scale: page title 28–32px Fraunces; section/panel titles Inter 15–16px semibold; labels Inter 13px medium muted; KPI values Inter 26–28px semibold; delta chips 12px medium; captions ("vs prior 30 days", axis text) 12px subtle. Body text uses antialiased rendering.
- REQ-457 [state] While on a phone, the system shall show the large page title in the content only, with the top bar title appearing after scrolling past it (large-title pattern), so the title isn't shown twice (interpreted).
- REQ-458 [state] While on a phone, the system shall span the 7th KPI tile across both columns so the grid has no orphan gap.
- REQ-459 [always] The system shall align KPI tiles (label, value, delta and caption baselines line up across a row) and give the sparklines consistent height and stroke.

## Title font + cleaner login (user requests: "Serif titles should also be updated to better font", "Make login page cleaner and modern")
- REQ-460 [always] The system shall render page titles (h1) app-wide in a modern sans: Inter Display (or Inter Tight), weight 600, tracking about -0.025em, about 28px desktop / 24px phone. No serif fonts anywhere in the agent app (user: "page title doesn't look good, needs to be modern"; replaces Fraunces and Instrument Serif).
- REQ-461 [state] While demo tools are on, the system shall offer a "Title font" picker in the demo controls with Inter Display (default), Geist, Manrope and Plus Jakarta Sans, applied app-wide instantly (interpreted; hidden in production).
- REQ-462 [always] The system shall render /login as a clean, modern form: plain off-white background (no radial glow), a minimal card (1px border, no brass top line, no heavy shadow; no card on phones), the GOORIN wordmark (~120px), the heading "Sign in to Support Desk" in Inter semibold ~24px, a muted subline, inputs without leading icons (the eye toggle stays), "Forgot password?" aligned on the Password label row, and a full-width 44–48px Sign in button.
- REQ-463 [always] The system shall remove the "EST. 1895" rule and the castle footer from /login, keeping only a small muted footer "© Goorin Bros.".
- REQ-463a [always] The system shall show the GOORIN wordmark larger on /login (~180px desktop, ~160px phone), with no subline under the heading and no Styleguide link (user request; /styleguide stays reachable by URL).

## Login matches the Goorin SYNC reference, branded "Support Desk": REVERTED (user: "go back to previous login")
REQ-503..REQ-512 below are CANCELLED. The active login spec is REQ-330..REQ-333, REQ-462, REQ-463 and REQ-463a (minimal card, 180px wordmark, "Sign in to Support Desk", no subline, footer "© Goorin Bros.").
Supersedes REQ-330/332/462/463/463a visuals and the "Sign in" copy. Flows, validation copy, testids and mobile rules are unchanged.
- REQ-503 [always] The system shall render /login as one centered white card (~440px wide, radius ~24px, large soft shadow) on a plain very light neutral background (#F8F8F8), with no gradient.
- REQ-504 [always] The system shall show a solid black (#111) header band (~200px tall) on the card with a centered lockup: the WHITE GOORIN wordmark, a coral (#E2574C) rounded bar under it, and "SUPPORT DESK" in coral bold geometric caps right-aligned beneath the flag (the bar ends before the text).
- REQ-505 [always] The system shall show in the card body: heading "Welcome back" (bold, ~26px, centered), subline "Sign in to your Support Desk dashboard" (gray, centered), labels "Email" / "Password" (semibold), "Forgot password?" right-aligned on the Password row, and inputs with a light gray fill, 1px light border, radius ~12px, ~48px tall, placeholders "you@company.com" / "Enter password", plus the eye toggle.
- REQ-506 [state] While either field is empty, the system shall show the full-width "Log in" button (radius ~12px, ~48px) in an inactive gray (#7F807F), still submittable so validation messages show (interpreted).
- REQ-507 [state] While both fields are filled, the system shall show the button near-black (#111) with a darker hover. Loading shows "Logging in…".
- REQ-508 [always] The system shall show below the button "Need access? Contact your administrator.", a divider, a green status line "● ALL SYSTEMS OPERATIONAL" (letter-spaced caps, dot with soft halo) and "© <year> Goorin Bros., Inc.".
- REQ-509 [always] The system shall use DM Sans on the login screen to match the reference (interpreted; the app stays Inter).
- REQ-510 [always] The system shall give the forgot / invite / expired variants the same card and header with their own heading + subline (e.g. "Reset your password", "Set up your account", "This invite has expired").
- REQ-511 [always] The system shall title the browser tab "Goorin | Support Desk" (interpreted).
- REQ-512 [state] While on a phone, the system shall keep the card with 16px side margins, the black header scaled down (~160px), 16px input text and ≥44px targets.
- REQ-464 [always] The system shall keep all login flows, copy, validation, testids, mobile rules (16px inputs, 44px targets, safe areas) and the loading state.
- REQ-465 [always] The system shall show KPI labels in full at 1440 (wrap to 2 lines or shorten to "CSAT response" with a full title tooltip). No ellipsis (bug from iteration 9).
- REQ-466 [state] While a full-screen editor (article/macro editor, CSV import) is open on a phone, the system shall hide the bottom tab bar like the conversation view does.

## Chat Widget moves into the Shopify integration (user request: "Chat widget should be in Shopify connection")
Supersedes the Settings tab list in REQ-194/REQ-342 and the /settings/widget route in REQ-271. All widget settings behaviour (REQ-271..REQ-329, REQ-355..REQ-356, REQ-411) is unchanged, only relocated.
- REQ-467 [always] The system shall show Settings tabs Integrations, AI and Users only (no top-level Chat Widget tab).
- REQ-468 [always] The system shall render the Shopify integration detail page with sub-tabs Overview, Chat widget and Install at /settings/integrations/shopify (Overview), /settings/integrations/shopify/widget and /settings/integrations/shopify/install.
- REQ-469 [always] The system shall show on Overview the existing Shopify connection header, Test connection, connection details (shop domain, app embed status) and masked Credentials, plus a "Chat widget" summary card (embed status, last widget load, "Customize widget" → Chat widget sub-tab).
- REQ-470 [always] The system shall show on the Chat widget sub-tab the full widget editor (Branding, Launcher, Messaging, Display rules, CSAT in chat) with the sticky live preview, unsaved bar and "Preview on my store".
- REQ-471 [always] The system shall show on the Install sub-tab the status card, App Embed steps + "Open Theme Editor", the script-tag fallback, the settings-source indicator and "Verify installation".
- REQ-472 [unwanted] If the admin switches sub-tab or leaves with unsaved widget changes, then the system shall ask "Discard unsaved changes?".
- REQ-473 [event] When anyone opens /settings/widget or /settings/widget#install, the system shall redirect to /settings/integrations/shopify/widget or /settings/integrations/shopify/install.
- REQ-474 [always] The system shall show on the Shopify tile a widget sub-status (e.g. "Chat widget · Live on store" or "Chat widget · Embed off").
- REQ-475 [always] The system shall point the theme editor helper link and "Back to Goorin Support Desk" at /settings/integrations/shopify/widget.
- REQ-476 [state] While on a phone, the system shall make the sub-tabs horizontally scrollable and keep the floating Preview button on the Chat widget sub-tab.

## Inbox customer + Shopify panel (user request: always-visible right panel, collapsible; richer Shopify data)
Extends REQ-138..REQ-143 and supersedes REQ-151 (the hidden "Details" toggle at 1024–1439).
- REQ-477 [state] While the viewport is ≥1024px, the system shall show the customer panel on the right of the conversation, open by default.
- REQ-478 [event] When the agent clicks the panel's collapse control, the system shall collapse it to a slim rail (initials + icons with order count), and expand it again on click (aria-expanded). The choice is kept for the session.
- REQ-479 [state] While the panel is open at 1024–1279px, the system shall keep the conversation ≥480px wide (e.g. views pane collapses to a dropdown above the list).
- REQ-480 [always] The system shall show a customer header: initials avatar, name, email, phone, location, "Customer since <Mon YYYY>", Shopify customer tags as chips (e.g. VIP, Wholesale, Repeat buyer, Hat Club, Newsletter) and "View in Shopify".
- REQ-481 [always] The system shall show a stats row: Orders (count), Lifetime spend, Avg order value, Last order (relative), using tabular Inter numbers.
- REQ-482 [always] The system shall list orders newest first, with the latest expanded and others collapsible, each showing: order # + date, payment status pill (Paid / Pending / Partially refunded / Refunded), fulfillment pill (Unfulfilled / Fulfilled / In transit / Delivered), order total, line items (thumbnail, title, size/variant, qty, price), shipping address, tracking (carrier + number link, new tab) and "View in Shopify".
- REQ-483 [event] When the agent clicks "View in Shopify", the system shall open a mock Shopify admin URL in a new tab (e.g. https://admin.shopify.com/store/goorin/orders/<id>) (MOCKED).
- REQ-484 [always] The system shall keep Past tickets and the collapsible AI attempt log below the orders.
- REQ-485 [state] While the customer has no Shopify record (guest), the system shall show "Guest: no Shopify customer record" and "No Shopify orders".
- REQ-486 [state] While the customer has an open fraud alert, the system shall show a red "Fraud risk <level>" chip in the customer header.
- REQ-487 [state] While below 1024px or on a phone, the system shall show the same content in the Details sheet.
- REQ-488 [always] The system shall extend the mock Customer (tags, phone, customerSince, shopifyCustomerId) and Order (financialStatus, fulfillmentStatus, total, shippingAddress, lineItems with image/price, tracking, adminUrl) types via /src/api, reusing the product photos.

## Shopify logo + Loop Returns widget (user requests: "On Shopify info show Shopify logo", "add inbox widget for Loop returns, number of returns, return dollars, return %", "Show Loop Returns logo for that section")
- REQ-489 [always] The system shall show the official Shopify bag mark wherever Shopify data appears (integration tile + detail header, the customer panel "Shopify orders" heading, "View in Shopify" links, the install status card).
- REQ-490 [always] The system shall show in the Inbox customer panel, below Shopify orders, a "Loop Returns" section headed by the Loop Returns logo (MOCKED data; Loop is a Shopify returns app).
- REQ-491 [always] The system shall show Loop stats: Returns (count), Returned $ (sum of return totals) and Return rate % (returned $ ÷ lifetime spend, caption "of lifetime spend") (interpreted).
- REQ-492 [state] While the return rate is above 30%, the system shall show an amber "High return rate" chip (interpreted).
- REQ-493 [always] The system shall list Loop returns newest first, each with return # + date, state pill (Open / In review / Closed / Cancelled / Expired), outcome pill (Refund / Exchange / Store credit / Gift card), returned items (thumbnail, title, size, reason, qty), return total, refund/exchange/credit amount, label status (Label created / In transit / Delivered to warehouse), and "View in Loop" (mock admin URL, new tab).
- REQ-494 [state] While the customer has no Loop returns, the system shall show "No returns with Loop".
- REQ-495 [always] The system shall show the Loop section in the phone/tablet Details sheet, and show the Loop mark with the return count in the collapsed rail.
- REQ-496 [always] The system shall add the mock LoopReturn type {id, customerId, orderNumber, state, outcome, returnTotal, refund, exchangeTotal, storeCredit, items[], labelStatus, createdAt, adminUrl} via /src/api (getCustomerReturns), seeded for several customers and consistent with orders (e.g. Margaret's partially refunded #GB19790).

## Full-width, fluid layouts (user request: "make sure all pages are full width and auto adjust")
- REQ-497 [always] The system shall render every signed-in page (Dashboard, Inbox, Guidance, Settings incl. Integrations detail/Shopify sub-tabs, 404/placeholders) at the full available width beside the sidebar, with no centered max-width cap (the AppShell max-w-[1440px] is removed). Gutters stay fluid (16px phone → 32px desktop → up to ~48px on very wide screens).
- REQ-498 [always] The system shall let grids auto-adjust to width: the KPI strip, dashboard panel rows, chart widths (ResponsiveContainer), the integration tile grid (auto-fill, min ~280px), guidance/user lists, and styleguide sections gain columns or stretch on wide screens and collapse on narrow ones.
- REQ-499 [always] The system shall keep text-heavy controls readable on wide screens: form inputs, the article/markdown body and the message bubbles keep sensible max widths inside full-width sections (e.g. inputs ≤480px, prose ≤75ch).
- REQ-500 [always] The system shall render /styleguide and the /widget-demo storefront (header, hero, grids, footer) full width and fluid (product grid auto-fill). /widget-demo/theme-editor fills the viewport.
- REQ-501 [always] The system shall keep the login card, survey card, modals/sheets and the 404 message centered at a narrow width on a full-width background (by design).
- REQ-502 [always] The system shall have no horizontal overflow and no awkward stretching at 390, 768, 1024, 1280, 1440, 1920 and 2560px widths.
