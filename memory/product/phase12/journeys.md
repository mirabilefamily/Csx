# Phase 12 Journeys (Simpler Dashboard)

Sign in as ava@goorin.com / goorin123 (Admin) at 1440, range 30d, unless stated.

superseded: [JRN-15, JRN-17, JRN-18, JRN-88, JRN-97, JRN-114]. They asserted 7 KPIs with delta pills, separate Escalation reasons and Top tags charts, the full multi-part CSAT section, and the old block order. JRN-148 to JRN-154 replace them. JRN-105 to JRN-109 still apply, with lists trimmed to the top 3 plus "View all".

Revision 2: JRN-167 supersedes the block order in JRN-148 and the separate-panel parts of JRN-150, JRN-151 and JRN-152. The tabs move inside the merged cards.

### JRN-167 Fewer modules, matching grid
- steps: At 1440 open Dashboard (30d). Count the modules and compare the card edges in each row. Use the tabs in AI performance and Refunds & fraud. On a fraud row open ⋯ → Mark safe with a note, then Undo. Click View all in each card. View at 1280, 1024 and 390.
- expected:
  - There are 5 modules: the KPI row, then 2 rows of 2 equal-width cards (Ticket volume | AI performance, Refunds & fraud | Customer satisfaction). Paired cards share their top and bottom edges.
  - AI performance tabs: Overview shows 78% resolved by AI, the split and the 4 chat timing metrics (14s / 38s / 2 / 3m 12s). Handover reasons and Top topics show the top 6 each.
  - Refunds & fraud tabs: Refunds shows $826 / 14 / 30% / 4 · $925, the pipeline, "Auto-refund limit: $75" and 3 awaiting rows. Fraud alerts (4 open) shows 3 compact rows with fa-101 (91) first. The ⋯ actions, note and undo work.
  - CSAT shows 4.38, 32.9%, the trend, the distribution, the channel and resolver row, and tabs with 3 items each.
  - View all opens the side sheets.
  - Below 1280 the cards stack in one column. At 390 there's no overflow.

### JRN-148 Layout and KPIs
- steps: Open Dashboard. Count the blocks. Read the KPIs. Switch through Last 24 hours, 7d and 90d.
- expected:
  - The order is: header, KPI row, Ticket volume beside Resolved by, the Chat reply timing slim row, Refunds beside Fraud alerts, then Why tickets reach a person and Customer satisfaction. That's ≤ 8 blocks.
  - There are exactly 5 KPIs: Open tickets 22 ("Current snapshot", no delta), AI resolution rate 78.0%, First response time, Resolution time and CSAT average 4.38.
  - Deltas are plain coloured text with an arrow and "vs prior 30 days", with no pill backgrounds. Time KPIs going down show green.
  - Values change with the range.

### JRN-149 Volume and Resolved by
- steps: Read Ticket volume and Resolved by. Hover the chart.
- expected:
  - Volume's header shows "Tickets created 1,117" with its delta, and the legend reads Email 673 · Chat 444. The chart is shorter (about 240px) and the tooltip shows daily values.
  - Resolved by shows "<x>% resolved by AI" with Claude, Grokbot and Human counts and percentages.

### JRN-150 Chat reply timing
- steps: Read the slim row and hover its info icon.
- expected: One row with 4 metrics: 14s / 38s / 2 / 3m 12s now vs 21s / 44s / 3 / 2m 45s before. The tooltip reads "Independent of the dashboard date filter".

### JRN-151 Refunds and fraud, top 3 and View all
- steps: Read both panels. Click View all on Fraud alerts, Mark safe on fa-101 with a note, Undo, open Reviewed, close. Click View all on Refunds and open an awaiting item. Switch to 7d.
- expected:
  - Refunds keeps the headline numbers ($826 refunded, 14 refunds, 30% auto-refunded, pending 4 / $925), "Auto-refund limit: $75" and the pipeline, and shows at most 3 awaiting items.
  - Fraud shows at most 3 open alerts, highest score first (fa-101 score 91 at the top), with their actions.
  - View all opens a side sheet with the full list. Fraud actions, the note and undo work there and the panel updates.
  - Clicking an awaiting refund opens /inbox/<ticket>.
  - View all is hidden when there are 3 or fewer items.

### JRN-152 Why tickets reach a person
- steps: Switch between the tabs. Use the demo Empty state.
- expected: "Escalation reasons" shows horizontal bars and "Top topics" shows the former top tags. Empty shows "No data for this period".

### JRN-153 Customer satisfaction
- steps: Read the card. Switch the tabs. Click a comment. Click CSAT settings. Pick a range with no low scores, if one exists.
- expected:
  - The card shows the CSAT average 4.38, the response rate 32.9%, the trend line, the 1–5 distribution and one inline row of channel and resolver averages.
  - Latest comments and Needs follow-up (≤2) each list up to 5 items, and each links to its ticket.
  - CSAT settings opens /settings/csat.
  - No low scores shows "No low scores in this period."

### JRN-154 States, tablet and phone
- steps: Use the demo Loading, Empty and Error states. View at 1024, 768, 390, 360 and 430.
- expected:
  - Skeletons, empty copy and error with "Try again" appear for every block.
  - At 768–1279 the paired blocks stack.
  - On phones the KPIs are a 2-column grid with the 5th spanning full width, the blocks stack, and View all opens full screen.
  - There's no overflow and tap targets are ≥ 44px. axe finds 0 serious or critical issues.
