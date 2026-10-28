# Phase 11 Journeys (AI-first Inbox, simplified)

Sign in as ava@goorin.com / goorin123 (Admin) at 1440 unless stated. The Agent role comes from the user-menu toggle and acts as Sam Okafor. All data is MOCKED and resets on reload. The builder reports the exact seed ids.

superseded: [JRN-122, JRN-123, JRN-124, JRN-125, JRN-126, JRN-127, JRN-128, JRN-129, JRN-130, JRN-131, JRN-132, JRN-133]. Phase 10's layout, flyout, icon strip, header controls and composer are replaced by JRN-134 to JRN-146.

### JRN-134 Opens on "Needs you" with AI status
- steps: Open /inbox at 1440, 1920 and 1024. Read the views and the status line.
- expected:
  - The main sidebar is icon-only. Leaving to Dashboard restores it.
  - The list shows "Needs you" selected, and the status line reads "<n> handled by AI today · <n> need you · <n> in progress".
  - At 1920 a docked views column shows Needs you, Assigned to me, AI handling, Resolved and All with counts, then Saved views and More (Closed, Spam, Trash). Below 1600 the same views are in the list-header switcher, with no flyout.
  - The conversation is ≥ 480px at 1024, 1280, 1440, 1920 and 2560.

### JRN-135 Needs-you cards and sorting
- steps: Read the cards in "Needs you". Open the sort menu and switch to Waiting longest, then Newest, then back to Urgency.
- expected:
  - Each card shows customer, "Waiting <time>" (amber or red near or past SLA), subject, a one-line handover reason, a "Draft ready" chip where there's a draft, a risk chip on the fraud ticket, and the assignee avatar if assigned.
  - The default order is breached SLA first, then waiting longest. Each sort reorders the list.

### JRN-136 AI handling view and take over
- steps: Open "AI handling". Read a card. Open the ticket. Click "Take over". Then use the demo error state and try Take over again.
- expected:
  - Cards show the AI state (Replying / Waiting on customer / Resolved by AI today), Claude or Grokbot, a confidence value and "Take over".
  - The open ticket shows "Claude is handling this conversation." with Take over, and no composer.
  - Take over assigns Ava, moves the ticket to Needs you (counts update) and adds "Ava Martinez took over from Claude".
  - In the error state: "Couldn't take over this ticket. Try again." and the ticket is unchanged.

### JRN-137 Empty "Needs you"
- steps: Resolve or hand back every needs-you ticket (or use the demo Empty state) on "Needs you".
- expected: "You're all caught up. The AI is handling everything else." with "Watch AI handling", which opens the AI handling view.

### JRN-138 "Why you're here" brief and thread
- steps: Open the top needs-you ticket with ≥3 messages. Read the brief. Hover a source icon. Expand "How the AI got here". Click "Show <n> earlier messages". Hover a message, click copy, open a delivery tick. Then open the seeded ticket with <3 messages.
- expected:
  - The brief shows a bold reason, up to 3 "What the AI did" bullets with source icons whose tooltips name the source, and a "Suggested next step". "How the AI got here" is collapsed by default and expands to intent, articles, data checked and confidence.
  - Older AI messages are collapsed and expand on click. Customer cards are left, replies right, all white with a border, and AI labels have a sparkle.
  - Copy shows "Copied". The delivery timeline shows Queued → Sent → Delivered.
  - The <3 ticket reads "Not enough conversation yet to summarize." with Try again.
  - Every fact in the brief matches that ticket's seed (customer, order number, totals, return facts).

### JRN-139 AI draft first: approve, edit, write my own, hand back
- steps: On a needs-you ticket with a draft, click Approve & send. On a second, click Edit, change a word and send. On a third, click Write my own, type, then Use AI draft. Open the split button, pick "Send & hand back to AI". On a needs-you ticket with no draft, click "Ask AI to draft". Press "a" on another draft ticket.
- expected:
  - The draft card shows "Draft by Claude", confidence, the text, Approve & send (split: Send & resolve, Send & hand back to AI), Edit and "Write my own".
  - Approve & send posts the reply with "Reply sent" and keeps the ticket with Ava. The edited text is sent as edited.
  - Write my own shows an empty editor, and Use AI draft restores the draft.
  - Hand back sets AI handling, the ticket leaves Needs you and the event line "Handed back to Claude by Ava Martinez" appears.
  - Ask AI to draft shows loading, then a draft card. "a" approves and sends.
  - Getting from /inbox to a sent approved draft on the top ticket takes ≤ 3 clicks.

### JRN-140 Editor, note, attach
- steps: Click Write my own. Check "To: <email>", the toolbar and the placeholder. Try Send while empty. Search macros for "size" and insert one. Switch to Note and add a note. Click Attach.
- expected:
  - The placeholder reads "Write a reply, or press r.". The toolbar is Bold, Italic, Link, Macro and Attach only.
  - Send is disabled while empty. The macro inserts with variables filled.
  - The note posts in the note style. "Draft saved" shows while typing.
  - Attach shows "Attachments aren't available in this demo."

### JRN-141 Header and ⋯ menu
- steps: On a ticket check the header. Click Assign me, then use ⋯ → Priority High, Team Returns, Snooze 1 hour. Click ›, then press ← outside a field. Click Resolve.
- expected:
  - The header is one line: subject, customer · channel · short id, status pill, assignee/Assign me, Resolve and ‹ ›. ⋯ holds Priority, Team, Snooze, Move to spam, Move to trash and Merge (disabled).
  - Each change adds a grey centred event line. Snooze shows "Snoozed until <time>".
  - › and → open the next ticket, and ← the previous one. Resolve sets Resolved and the ticket leaves Needs you.

### JRN-142 Summary panel and full details
- steps: On GB-1076 read the summary panel. Click "View full details", then "Show summary". Switch tickets. Open a customer with no orders.
- expected:
  - The summary shows Customer (name, email, lifetime spend, orders, since, ≤2 tags), Latest order (number, total, pills, thumbnails, tracking), Returns (Loop 2 · $58.00 · 12.3%) and Risk ("No risk signals"). On GB-1064 Risk shows score 91 and its top signal. GB-1068 shows the high-return chip.
  - Full details shows tags, customer + note, past tickets with Show all, Shopify orders with tools and Edit/Duplicate/Refund/Create, Loop with filters, Customer feedback and AI attempts. The expanded or collapsed choice persists across tickets.
  - The no-order customer shows "No orders yet".

### JRN-147 Collapse the summary panel
- steps: At 1440 click the collapse control in the summary header. Hover the rail indicators. Switch tickets. Click an indicator. Press "]" twice outside a field. Open GB-1064 with the panel collapsed. Find a customer with lifetime spend ≥ $1,000.
- expected:
  - The panel collapses to a slim rail (about 44px) and the conversation widens.
  - The indicators show tooltips. On GB-1064 the risk indicator is red.
  - The collapsed state persists across tickets. Clicking an indicator expands the panel, and "]" toggles it.
  - Money always has thousands separators (e.g. "$1,296.00").

### JRN-155 Cleanup pass
- steps: At 1440 open the top needs-you ticket (GB-1076). Compare the three zone headers. Read the conversation header. Hover a list card, select it, then clear the selection. Read the draft and click Show full draft. Open View full details, then Show summary. Look for "earlier message" copy.
- expected:
  - The three headers share one bottom line.
  - The header row 1 shows the subject with no truncation at 1440, plus Resolve, ⋯ and ‹ ›. Row 2 shows customer · channel · #E3B75B · status pill · assignee · SLA chip, and the SLA popover shows the Email timing.
  - There's no "AI replied" banner on a needs-you ticket, and the brief comes first.
  - The list header is two rows with nothing clipped. Checkboxes appear only on hover, focus or selection, and the bulk bar shows when something is selected.
  - The draft shows a 4-line preview with fade and Show full draft, and the actions sit on one row.
  - Full details replaces the summary rows with no duplicated customer info.
  - The copy reads "Show 1 earlier message" and "1 past ticket".

### JRN-143 Order dialogs
- steps: In full details on GB-1076, open #GB19790 → Refund: set $0, then $90, then one item plus shipping above $75, confirm. Edit #GB20398: remove all items, then restore, change the quantity and address, confirm. Duplicate and confirm. Create order: try with no items, add a hat size M qty 2 with a discount, confirm.
- expected:
  - #GB19790 shows a $160 total with $82 refundable.
  - $0 and $90 show "Enter an amount up to $82.00." with refund disabled. Over $75 shows "Above your $75 auto-refund limit. This refund will be logged as approved by you."
  - The refund total equals items + shipping. Confirming updates the pill and adds "Refund of $<x> issued by Ava Martinez".
  - Edit blocks with "An order needs at least one item.", then applies the quantity and address changes to the card.
  - Duplicate adds a "#D<n>" card with a Draft pill.
  - Create order is disabled with no items. Its total = price × 2 − discount + shipping, and confirming adds the card at the top.

### JRN-144 Saved views
- steps: In All, filter to channel Email and tag sizing, then Save view: try an empty name, then "Sizing help", then save "Email sizing" as Private. Rename it, make it shared, delete it. Switch to Agent and open the ⋯ on "VIP & wholesale".
- expected:
  - Errors read "Give this view a name." and "A view with this name already exists.".
  - Saving shows "View saved" and selects the view with its filter.
  - Rename and share work. Delete asks "Delete Email sizing?" before removing it.
  - As Agent (Sam), Edit and Delete are disabled with "Only the creator or an admin can change this view."

### JRN-145 Ask Goorin AI and shortcuts
- steps: On GB-1076 press Ctrl+G and ask the 4 prompts. Insert the draft into the reply. Ask "what's the weather". Close it, go to an empty selection and open it again. Open "?".
- expected:
  - The chip reads "#E3B75B · Margaret Okonkwo".
  - Every answer has source chips and correct GB-1076 facts. The refund answer includes the Loop facts.
  - Insert fills the editor. The weather question returns "I can't answer that in this demo yet. Try one of the suggestions."
  - With no ticket open the chip reads "Whole inbox", and the needs-human answer matches the Needs you count.
  - The shortcuts modal lists j/k, → / ←, r, n, Shift+N, a, e, ⌘G / Ctrl+G and ?.

### JRN-146 Visual, tablet and phone
- steps: At 1440 review the Inbox. At 768 open a ticket and Details. At 360, 390 and 430 open Inbox, switch chips and a saved view via the Views sheet, open a ticket, Approve & send the draft, open ⋯ → Ask Goorin AI, open Details → full details → Refund.
- expected:
  - At 1440 there are white and light-grey neutral surfaces, brown only on primary buttons, the selected indicator and focus, and no cream or tinted cards (except the light amber needs-you context and red risk).
  - At 768 the list and conversation show, with the summary as a sheet.
  - On phones: it opens on Needs you, saved views are in the Views sheet, the draft card is docked, Ask Goorin AI is in ⋯ (full screen), and the refund dialog opens as a full-screen sheet.
  - There's no overflow and tap targets are ≥ 44px. axe finds 0 serious or critical issues.
