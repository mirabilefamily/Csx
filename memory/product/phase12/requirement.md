# Phase 12: Simpler Dashboard (requirement)

- Phase version: phase-12
- Goal: simplify the Dashboard a little while keeping every working capability and the current look. It goes from about 10 blocks to about 6, with more white space and an AI-first story up front. Everything stays MOCKED behind /src/api (see overview.md).
- User approved this plan: 7 KPIs down to 5, delta badges become plain coloured text, a shorter volume chart with Resolved by beside it, chat timing as one slim row, escalation reasons and top topics in one tabbed card, refunds and fraud showing the top 3 plus "View all", and CSAT in one card with two tabs.
- Unchanged: the date range control and presets, the header, demo states (loading, empty, error), refund and fraud actions and their effects (hold, mark safe with note, escalate, undo), the auto-refund limit link, CSAT settings at /settings/csat, and the phone layout patterns.

## Functional requirements

### Block order
- REQ-689 [always] The system shall render the Dashboard in this order:
  1. header with range
  2. KPI row
  3. "Ticket volume" (about 2/3 width) beside "Resolved by" (about 1/3)
  4. "Chat reply timing" slim row
  5. "Refunds" beside "Fraud alerts"
  6. "Why tickets reach a person" beside "Customer satisfaction" (or stacked below 1280) (interpreted).
- REQ-690 [always] The system shall space blocks 24px apart with 24px card padding, using the existing card, panel and type tokens.

### KPIs
- REQ-691 [always] The system shall show 5 KPIs: Open tickets, AI resolution rate, First response time, Resolution time and CSAT average.
- REQ-692 [always] The system shall show each KPI delta as plain coloured text with an arrow (green good, red bad; time KPIs are good when down), followed by muted "vs prior <period>". There are no pill backgrounds.
- REQ-693 [always] The system shall keep Open tickets as "Current snapshot" with no delta.
- REQ-694 [always] The system shall keep a light sparkline under each KPI except Open tickets (interpreted).

### Volume and resolver
- REQ-695 [always] The system shall show "Ticket volume" with the total "Tickets created <n>" and the delta in its header, an Email and Chat legend with totals, and a chart about 240px tall.
- REQ-696 [always] The system shall show "Resolved by" with a headline "<x>% resolved by AI" and the split Claude / Grokbot / Human, as counts and percentages.

### Chat reply timing
- REQ-697 [always] The system shall show Chat reply timing as one slim row of 4 metrics (now vs the previous 30 minutes), with an info tooltip "Independent of the dashboard date filter".

### Why tickets reach a person
- REQ-698 [always] The system shall show one card "Why tickets reach a person" with tabs "Escalation reasons" (horizontal bars) and "Top topics" (the former top tags).
- REQ-699 [state] While a tab has no data in the range, the system shall show "No data for this period".

### Refunds and fraud
- REQ-700 [always] The system shall keep the Refunds headline numbers (total refunded, count, auto-refunded %, pending), the "Auto-refund limit: $<n>" link and the pipeline. It lists only the top 3 "Awaiting approval" items.
- REQ-701 [always] The system shall show only the top 3 open fraud alerts, highest score first, each keeping its actions.
- REQ-702 [event] When the user clicks "View all" on Refunds or Fraud alerts, the system shall open a side sheet (full screen on phones) with the full list. For fraud this includes the Open and Reviewed tabs, actions, notes and undo.
- REQ-703 [state] While there are 3 or fewer items, the system shall hide "View all".

### Customer satisfaction
- REQ-704 [always] The system shall show one "Customer satisfaction" card with:
  - the CSAT average, the response rate and the trend line
  - the 1–5 distribution
  - one inline row of channel and resolver averages
  - a "CSAT settings" link to /settings/csat.
- REQ-705 [always] The system shall show tabs "Latest comments" and "Needs follow-up" (scores ≤2), each listing up to 5 items that link to their tickets.
- REQ-706 [state] While "Needs follow-up" has no items, the system shall show "No low scores in this period."

### Phone and tablet
- REQ-707 [state] While on a phone (<640px), the system shall show the 5 KPIs as a 2-column grid with the 5th spanning full width, and stack every block in the order above.
- REQ-708 [state] While the viewport is 768–1279px, the system shall stack the paired blocks vertically with no horizontal scroll.

## Revision 2 (user: "dashboard does not look as good, make less modules matching grid"). Supersedes REQ-689, REQ-697, REQ-698 and REQ-700 to REQ-705 where they conflict
- REQ-760 [always] The system shall lay out the Dashboard as the header, the KPI row, then a strict 2×2 grid of equal-width cards (2 equal columns ≥1280, 1 column below), with both cards in a row stretched to the same height. That's 5 modules in total (interpreted).
- REQ-761 [always] The system shall show row 1 as "Ticket volume" (chart + Email / Chat legend + "Tickets created" in the header) and "AI performance".
- REQ-762 [always] The system shall show "AI performance" with tabs:
  - "Overview": "<x>% resolved by AI", the Claude / Grokbot / Human split, and the 4 chat reply timing metrics with the "Independent of the dashboard date filter" tooltip
  - "Handover reasons": the top 6 bars
  - "Top topics": the top 6.
- REQ-763 [always] The system shall show row 2 as "Refunds & fraud" and "Customer satisfaction".
- REQ-764 [always] The system shall show "Refunds & fraud" with tabs:
  - "Refunds": the 4 headline numbers, the pipeline bar, "Auto-refund limit: $75" and the top 3 awaiting rows
  - "Fraud alerts (<n> open)": the top 3 alerts as compact one-line rows (score chip, customer, order, amount, top signal), with actions in a ⋯ menu.
  Each tab has "View all", which opens the side sheet.
- REQ-765 [always] The system shall show "Customer satisfaction" with the average, response rate, trend, 1–5 distribution, the channel and resolver row, "CSAT settings", and the tabs Latest comments / Needs follow-up with 3 items each and "View all".
- REQ-766 [always] The system shall keep card internals on one grid: 24px padding, the same header height, the same title, subtitle and tab styles, and fixed list lengths so paired cards end on the same line.

## Quality requirements
```
Q-64 Tag: Visual.Simplicity
     Scale: top-level blocks on the Dashboard (cards/sections excluding the header)
     Meter: tester count at 1440
     Must: ≤ 8   Plan: 7 (KPI row + 6 cards counted as blocks: volume, resolved, timing, refunds, fraud, why, csat → aim ≤ 8)
Q-65 Tag: Data.Consistency
     Scale: numbers that changed vs the Phase 9 dashboard for the same range (except those intentionally moved)
     Meter: tester compares 30d values (AI resolution rate 78.0%, tickets created 1,117, open 22, Email 673 / Chat 444)
     Must: 0   Plan: 0
Q-66 Tag: Regression
     Scale: refund or fraud actions (hold, mark safe + note, escalate, undo, ticket links) that no longer work
     Meter: re-run phase8-check and phase9 dashboard steps
     Must: 0   Plan: 0
Q-67 Tag: Device
     Scale: overflow or tap targets < 44px at 360/390/430; axe serious/critical
     Meter: phone-sweep + audit
     Must: 0   Plan: 0
Q-68 Tag: Visual.Approval
     Scale: user says it looks good and simpler
     Meter: human
     Must: pass   Plan: pass
```
