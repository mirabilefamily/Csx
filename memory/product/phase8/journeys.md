# Phase 8 Journeys

Sign in as ava@goorin.com / goorin123 (Admin), 1440x900 unless stated.

### JRN-105 Refunds panel
- steps: Open Dashboard (30d). Read the Refunds panel. Switch to 7d and 90d. Click an "Awaiting approval" item.
- expected: Total refunded $ with delta, count, % auto-refunded by AI, pending approval count + $. A pipeline Requested → Approved → Refunded with Declined/On hold counts. Trend sparkline. "Auto-refund limit: $75". Values change with the range. Clicking an item opens /inbox/<ticketId>.

### JRN-106 Fraud alerts review
- steps: In Fraud alerts (Open tab) read an alert. Click "Hold refund" on one that has a pending refund, "Mark safe" on another, "Escalate" on a third, then Undo the last. Open the Reviewed tab.
- expected: Each alert shows a score + level badge with text (High/Medium/Low), customer, order #, amount at risk, signal chips (e.g. "Not received · tracking delivered", "3rd refund in 30 days"), time, ticket link. Toasts read "Refund held", "Marked safe", "Escalated to admin". Undo restores to Open. Reviewed lists the actioned alerts with "<action> by Ava Martinez". The held refund shows On hold in the Refunds panel. With all alerts reviewed: "No open fraud alerts. All clear."

### JRN-107 Fraud flag in Inbox
- steps: Open Inbox All open. Find a row with the shield icon and open it. Click "View alert".
- expected: A red shield icon on the flagged rows (aria-label "Fraud risk: High" etc.). The conversation shows a red banner "Fraud risk <score> · <level>" with signal chips. View alert lands on /dashboard#fraud. The bell and Inbox badge still equal the needs_human count (7).

### JRN-108 Auto-refund limit
- steps: Settings → AI → Auto-refunds. Enter 900, try Save. Enter 120, Save. Back to Dashboard.
- expected: The toggle and amount default to $75 with the note text. 900 shows "Enter an amount between $0 and $500." and Save is blocked. 120 saves with "AI settings saved", and the Refunds panel shows "Auto-refund limit: $120".

### JRN-109 States, error, phone
- steps: Use the demo switcher Loading/Empty/Error on the Dashboard. In Error, try Mark safe. View the Dashboard at 390.
- expected: Both panels have skeletons, empty copy ("No refunds in this period" / "No open fraud alerts. All clear.") and error with Try again. The failing action shows "Couldn't update the alert. Try again.". At 390 the panels stack, alert actions are full-width or in a sheet, and there's no overflow.

### JRN-111 Modern titles + clean login + Chat widget under Shopify
- steps: Check page titles on each route. Open the demo controls → Title font. Sign out and view /login at 1440 and 390. As Admin open Settings, then Integrations → Shopify → each sub-tab. Make a widget change and switch sub-tab. Open /settings/widget and /settings/widget#install.
- expected: No serif on any agent-app title; h1 uses Inter Display (or the picked sans). The picker offers Inter Display, Geist, Manrope, Plus Jakarta Sans. Login is a minimal card (no icons, no EST. 1895, "Forgot password?" on the Password label row, footer "© Goorin Bros. · Styleguide"). Settings tabs are only Integrations, AI, Users. Shopify has Overview (Chat widget summary card + Customize widget) / Chat widget (full editor + preview) / Install. The sub-tab switch while dirty asks "Discard unsaved changes?". The old URLs redirect. The Shopify tile shows "Chat widget · Live on store".

### JRN-112 Shopify logo + Loop Returns section
- steps: View the Integrations tiles and the Shopify header. Open /inbox/GB-1076, /inbox/GB-1068, /inbox/GB-1078. Collapse the panel. At 390 open GB-1076 Details.
- expected: The Shopify bag logo is on the tile, the detail header, the "Shopify orders" heading and the "View in Shopify" links. GB-1076 Loop section: Loop logo, Returns 2, Returned $58.00, Return rate 12.3% of lifetime spend, cards #LR-48690 (Cancelled, Refund) and #LR-48213 (Closed, Refund) with items, amounts, label status and "View in Loop" (new tab). GB-1068 shows "High return rate" (67.2%). GB-1078 shows "No returns with Loop". The collapsed rail shows the Loop mark + count. The phone Details sheet includes the Loop section.

### JRN-110 Inbox customer + Shopify panel
- steps: At 1440 open /inbox/GB-1076. Read the right panel, expand an older order, click a tracking link and "View in Shopify". Collapse the panel, open another ticket, expand again. Repeat at 1280 and 1024. Open a guest customer's ticket (Oliver Grant, GB-1078). Open GB-1064. At 390 open GB-1076 → Details.
- expected: The panel is open by default on the right with initials, name, email, phone, location, "Customer since …", Shopify tag chips, View in Shopify. Stats: Orders, Lifetime spend, Avg order value, Last order. The latest order is expanded with order # + date, payment + fulfillment pills, total, line items with thumbnails/size/qty/price, shipping address, tracking link (new tab), View in Shopify (new tab). Past tickets + AI log are below. Collapse gives a slim rail that stays collapsed when switching tickets, and expands again. At 1280/1024 the panel is open and the conversation is ≥480px. Oliver Grant shows "Guest: no Shopify customer record" / "No Shopify orders". GB-1064 shows a red "Fraud risk High" chip. At 390 the Details sheet shows the same content.
