# Phase 2 Journeys

Sign in as ava@goorin.com / goorin123 (Ava Martinez, Admin). Mock data resets on reload.

### JRN-27 Inbox 3-pane layout and views
- superseded: [JRN-14] (Inbox part only. Guidance and Settings are still placeholders)
- steps: At 1440px, click Inbox in the sidebar. Click each view: All open, Needs human, AI handling, Mine, Unassigned, Resolved, Closed.
- expected: Views, ticket list, conversation and right sidebar are visible side by side. Each view shows a count, and the list changes to match. Needs human shows 7 tickets with amber pills. AI handling shows only ai_handling/grok_handling. Resolved/Closed show only those statuses. The URL carries ?view=. Before selecting a ticket, the conversation shows "Select a ticket to view the conversation".

### JRN-28 Ticket row content
- steps: In All open and Resolved, read several rows.
- expected: Each row shows customer name, subject, preview line, email or chat icon, status pill, relative time. Resolved rows also show a resolved-by badge (Claude brass / Grokbot slate / Agent brown).

### JRN-29 Filters
- steps: Filter by channel = chat, then add status = needs_human, then a tag, then an assignee that yields nothing. Click "Clear filters".
- expected: The list narrows each time and an active-filter count shows. The impossible combo shows "No tickets match these filters". Clear filters restores the view's full list. Resolved-by filter exists and works in the Resolved view.

### JRN-30 Bulk actions
- steps: In All open, check 3 rows. Assign to Sam Okafor. Tag with a tag. Close them. Also try select-all.
- expected: Bulk bar shows "3 selected". Toasts read "3 tickets assigned to Sam Okafor", "Tag added to 3 tickets", "3 tickets closed". The closed tickets leave All open and appear in Closed. View counts update. Select-all checks all visible rows.

### JRN-31 Bulk failure
- steps: Set demo state to Error, select a row, bulk-close.
- expected: "Couldn't update tickets. Try again." shows and the ticket is unchanged after switching back to Live.

### JRN-32 Threaded conversation and notes
- steps: Open GB-1076.
- expected: Messages are chronological with AuthorBadge, name and time. Customer, Claude, Grokbot, Agent and System messages are visually distinct. Internal notes have a yellow tint and an "Internal note" label.

### JRN-33 AI draft card approve
- steps: Open a needs_human ticket with a pending draft. Read the draft card, click Approve.
- expected: The card shows "<Claude|Grokbot> draft · Awaiting approval", a confidence meter with %, and guidance article chips with titles. After Approve the card is gone and the thread shows the AI message with "Approved by Ava Martinez".

### JRN-34 AI draft edit and discard
- steps: On a ticket with a draft, click Edit, then send. On another draft, click Discard, then Undo.
- expected: Edit puts the draft text in the composer (reply mode), and sending adds an Agent message. Discard removes the card and shows "Draft discarded" with Undo, which restores it. (interpreted)

### JRN-35 Escalation timeline chip
- steps: Open an escalated needs_human ticket. Hover and then Tab-focus each step of the chip.
- expected: The chip reads Claude → Grokbot → Human (or the ticket's actual path). Each step shows its reason (e.g. low confidence, policy exception) on hover and on keyboard focus.

### JRN-36 Header controls
- steps: On GB-1076 change status to Resolved, priority to Urgent, assignee to Sam Okafor.
- expected: Header, list row pill and view counts update immediately. The Inbox badge and bell drop to 6. System messages appear, e.g. "Ava Martinez changed status to Resolved". (interpreted)

### JRN-37 Composer: rich text, reply, note
- steps: Type a reply using bold and a bulleted list, Send. Toggle internal note, type, Add note. Try sending empty.
- expected: The Agent message appears with formatting preserved and the composer clears. In note mode the composer is yellow-tinted with an "Add note" button, and the note appears in yellow. Send/Add note is disabled when empty.

### JRN-38 Macros picker
- steps: In an empty composer type "/", then type "ret", pick a returns macro. Type "/zzqx".
- expected: The picker opens on "/", filters to matching macros, and inserts the macro body with the customer's first name filled in. "/zzqx" shows "No macros found". The macros button opens the same picker.

### JRN-39 Right sidebar
- steps: Open GB-1076, then a ticket whose customer has no orders. Expand/collapse the AI attempt log.
- expected: Customer card shows name, email, location, order count, lifetime spend. Orders show number, status, tracking link (opens a new tab), line items with size and qty. Past tickets link to /inbox/<id> (Margaret: GB-1056). The AI attempt log lists tier, model, confidence, latency ms, outcome, reason, guidance articles. A customer without orders shows "No Shopify orders". A ticket without attempts shows "No AI attempts on this ticket".

### JRN-40 Keyboard shortcuts
- steps: With focus on the list press j, j, k. Press r, type, Esc out. Press n. Click outside, press e. Press ?.
- expected: j/k move to the next/previous ticket and the conversation updates. r focuses the composer in reply mode, n in note mode. e closes the ticket with toast "<id> closed". ? opens a help modal listing j, k, r, n, e, ?. Typing "j" inside the composer types a letter and doesn't navigate.

### JRN-41 Ticket not found
- steps: Open /inbox/GB-9999.
- expected: "Ticket not found" with a link back to the inbox.

### JRN-42 Inbox states
- steps: On /inbox use the demo state switcher: Loading, Empty, Error → Try again, Live.
- expected: Skeletons for views, list and conversation. Designed empty states (e.g. "Nothing needs a human right now"). Error with "Try again". Live restores.

### JRN-43 Responsive inbox
- steps: View /inbox/GB-1076 at 1280px, then 768px. At 768 go back to the list.
- expected: At 1280 the right sidebar becomes a toggleable "Details" panel (interpreted). At 768 a single pane shows the conversation with a Back button. Back shows the list, and views are a dropdown (interpreted). No horizontal scroll.

### JRN-44 Search reopens after bell (phase-1 fix)
- steps: Click a bell item, then press Ctrl+K and type "Margaret".
- expected: Results stay open and show Margaret Okonkwo. Picking a ticket opens it in the real inbox.
