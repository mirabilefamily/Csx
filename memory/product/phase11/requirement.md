# Phase 11: AI-first Inbox, simplified (requirement)

- Phase version: phase-11
- Goal: make the Inbox AI-first. The AI handles everything and people only step in when it hands a ticket over. Simplify the Phase 10 Inbox and give it a modern, enterprise, neutral look. Everything stays MOCKED behind /src/api (see overview.md).
- Confirmed user choices:
  - The Inbox opens to a "Needs you" list.
  - Tickets the AI handles on its own live in a separate "AI handling" view, with a "<n> handled by AI today" line.
  - The reply box leads with the AI draft (Approve & send / Edit), with "Write my own" as the fallback.
  - The right panel is one short summary (customer, latest order, returns, risk) that expands.
  - Enterprise neutral style: white and light grey, with Goorin brown only on primary buttons.
- Scope: the Inbox only (/inbox, at every breakpoint). Other pages keep their current style.
- Removed for simplicity, superseding Phase 10:
  - the right-panel icon strip and Customize
  - the hide-list control
  - suggested macro chips
  - the rotating keyboard tip
  - the Translate, Image and Underline toolbar buttons
  - Team and Snooze as separate header controls (they move into ⋯)
  - the views flyout at 1024–1599
- Kept, restyled:
  - saved views
  - Spam/Trash with Restore and Delete forever
  - new ticket, short ids, pagination
  - the delivery timeline, internal notes and macro search
  - order dialogs
  - Ask Goorin AI
  - fraud signals and Loop returns
  - phone flow and shortcuts
- Phase 10 test failures (/app/e1_test_reports/iteration_13.json) are fixed where the feature still exists. See "Carry-over fixes".

## Functional requirements

### Visual system (Inbox)
- REQ-632 [always] The system shall render the Inbox in a neutral enterprise style:
  - white surfaces on a light grey canvas (about #F6F6F7), with 1px cool-grey borders (about #E4E4E7)
  - charcoal text and 13–14px body text
  - no cream or tinted backgrounds, except a light amber marking "needs you" context and red only for risk.
- REQ-633 [always] The system shall use Goorin brown (#6B4F3A) only for primary buttons, the selected-row indicator and focus rings in the Inbox.
- REQ-634 [always] The system shall keep icons monochrome grey, except brand logos (Shopify, Loop) and status meaning.

### Layout
- REQ-635 [state] While on /inbox at ≥1024px, the system shall show the main sidebar icon-only and three zones: the ticket list (about 340px), the conversation, and the summary panel (about 320px).
- REQ-636 [state] While the viewport is ≥1600px, the system shall also show a docked views column on the left (about 220px).
- REQ-637 [state] While the viewport is below 1600px, the system shall offer the views from a switcher in the list header instead of a flyout.
- REQ-638 [event] When the user leaves /inbox, the system shall restore the main sidebar to its previous state.

### Views and AI status
- REQ-639 [always] The system shall show the views in this order with counts:
  - "Needs you": tickets the AI handed to a person that aren't resolved
  - "Assigned to me"
  - "AI handling"
  - "Resolved"
  - "All"
  - then "Saved views" (Shared and Private, collapsible)
  - then "More" (Closed, Spam, Trash).
- REQ-640 [always] The system shall open /inbox on "Needs you" by default.
- REQ-641 [always] The system shall show a slim AI status line at the top of the list: "<n> handled by AI today · <n> need you · <n> in progress".
- REQ-642 [state] While the "Needs you" queue is empty, the system shall show "You're all caught up. The AI is handling everything else." with a link "Watch AI handling".
- REQ-643 [always] The system shall show each "Needs you" card with:
  - customer name and how long they've been waiting ("Waiting 2h"), in amber or red when the SLA is close or breached
  - the subject, then a one-line handover reason (e.g. "Return request outside policy window")
  - a "Draft ready" chip when the AI has a draft, a risk chip when fraud signals exist, and the assignee avatar if assigned.
- REQ-644 [always] The system shall sort "Needs you" by urgency (SLA breached, then waiting longest), with a sort menu: Urgency, Waiting longest, Newest.
- REQ-645 [always] The system shall show each "AI handling" card with the AI state ("Replying", "Waiting on customer", "Resolved by AI today"), the resolver (Claude / Grokbot), a confidence value and a "Take over" button.
- REQ-646 [event] When the user clicks "Take over", the system shall assign the ticket to them, move it to "Needs you" and add the event line "<user> took over from <AI>".
- REQ-647 [unwanted] If the take-over fails (demo error state), then the system shall show "Couldn't take over this ticket. Try again." and leave the ticket unchanged.

### Conversation
- REQ-648 [always] The system shall show a one-line header:
  - the subject, then customer name, channel and short id
  - the status pill, the assignee (or "Assign me"), a primary "Resolve" button and ‹ › ticket arrows
  - a "⋯" menu with Priority, Team, Snooze, Move to spam, Move to trash and Merge (disabled).
- REQ-649 [state] While the ticket needs a person, the system shall show a "Why you're here" brief at the top of the conversation:
  - the handover reason in one bold line
  - "What the AI did" as up to 3 bullets with source icons (guidance, Shopify, Loop) that name their source on hover
  - a "Suggested next step" line
  - "How the AI got here" (intent, articles, data checked, confidence) collapsed by default.
- REQ-650 [unwanted] If the ticket has fewer than 3 messages, then the brief shall read "Not enough conversation yet to summarize." with "Try again" (interpreted).
- REQ-651 [state] While new messages arrived after the brief was generated, the system shall show "New messages since this summary." with "Refresh", which regenerates it (mock) with a new time.
- REQ-652 [always] The system shall show the thread compactly:
  - AI messages older than the last two are collapsed into "Show <n> earlier messages"
  - customer messages sit left and AI or agent replies right, in white cards with a 1px border
  - the AI reply label reads "Claude" or "Grokbot" with a sparkle
  - the delivery tick opens the existing timeline
  - a copy button appears on hover.
- REQ-653 [state] While the AI is handling the ticket, the system shall show a banner "Claude is handling this conversation." with "Take over", and hide the composer behind it.
- REQ-654 [always] The system shall show ticket events (handover, take over, assignment, status, refund, hand back) as small grey centred event lines.

### Reply (AI draft first)
- REQ-655 [state] While a ticket that needs a person has an AI draft, the system shall show the composer as the draft card:
  - the label "Draft by Claude" with its confidence
  - the draft text
  - a primary "Approve & send" split button with "Send & resolve" and "Send & hand back to AI"
  - "Edit"
  - a text link "Write my own".
- REQ-656 [event] When the user clicks "Approve & send", the system shall post the draft as a reply, show the toast "Reply sent", and keep the ticket in "Needs you" assigned to the user.
- REQ-657 [event] When the user picks "Send & hand back to AI", the system shall post the reply, set the ticket to AI handling and add the event line "Handed back to Claude by <user>".
- REQ-658 [event] When the user clicks "Edit", the system shall turn the draft into editable text in the editor and keep the same send options.
- REQ-659 [event] When the user clicks "Write my own", the system shall show an empty editor with "Use AI draft" to restore the draft.
- REQ-660 [state] While a ticket that needs a person has no AI draft, the system shall show the editor with an "Ask AI to draft" button, which produces a mock draft card after a short loading state.
- REQ-661 [always] The system shall show the editor with:
  - a "Reply" / "Note" switch and "To: <email>"
  - the placeholder "Write a reply, or press r."
  - macro search
  - a minimal toolbar (Bold, Italic, Link, Macro, Attach)
  - Send disabled while empty
  - "Draft saved".
- REQ-662 [unwanted] If the user clicks Attach, then the system shall show "Attachments aren't available in this demo."

### Summary panel
- REQ-663 [always] The system shall show a compact summary panel with four rows:
  - Customer: name, email, Lifetime spend, Orders, Customer since and up to 2 tags.
  - Latest order: number, total, payment and fulfillment pills, item thumbnails, tracking.
  - Returns: Loop count, dollars and rate, with the high-return chip above 30%.
  - Risk: a fraud score chip and its top signal, or "No risk signals".
- REQ-664 [event] When the user clicks "View full details", the system shall expand the panel to the full sections:
  - ticket tags
  - customer details and note
  - past tickets with Show all
  - Shopify orders with Edit / Duplicate / Refund / Create order and the order tools
  - Loop returns with filters
  - Customer feedback
  - AI attempt log.
- REQ-665 [event] When the user clicks "Show summary", the system shall collapse the panel back. The choice persists for the session.
- REQ-666 [state] While the customer has no orders or no returns, the system shall show "No orders yet" or "No returns with Loop" in that row.
- REQ-683 [event] When the user clicks the collapse control in the summary panel header (or presses "]" outside a field), the system shall collapse the panel to a slim rail with an expand button and four row indicators (risk red, returns amber when flagged). The choice persists across tickets for the session.
- REQ-684 [always] The system shall format every money amount with thousands separators via one shared formatter (e.g. "$1,296.00").
- REQ-685 [always] The system shall show no Shopify store selector, because Goorin has one store (goorin-bros.myshopify.com). "View customer in Shopify ↗" stays as a quiet link. This supersedes REQ-610's store selector and the second mock store.

### Blend with the rest of the app (user request, supersedes REQ-632 to REQ-634)
- REQ-686 [always] The system shall style the Inbox with the same design tokens as every other page: the #FAF8F5 canvas, white cards, the app's warm-grey borders, radius, shadows, Inter / Inter Display type scale, buttons, inputs, tabs, chips and status pills from the shared components. The Inbox has no separate neutral palette.
- REQ-687 [always] The system shall keep the Inbox's restraint inside the shared tokens: tobacco brown only on primary buttons, the selected state and focus; amber only for needs-you context; red only for risk.
- REQ-688 [always] The system shall render the Inbox's selected rows, hover states, section headers, empty states, skeletons and toolbars the same way as the matching patterns on Dashboard, Guidance and Settings.

### Cleanup pass (user: "clean up, modern and organized", from review of the 1440 build)
- REQ-709 [always] The system shall align the list header, conversation header and summary header to the same height (about 56px), so their bottom borders form one continuous line.
- REQ-710 [always] The system shall show the conversation header in two rows:
  - row 1: the full subject (one line, ellipsis only when truly long, with a full-text tooltip), then Resolve, ⋯ and ‹ ›
  - row 2: customer name · channel · #short id · the status pill · the assignee control (Assign me when unassigned) · the SLA chip (its popover holds the Email timing details).
- REQ-711 [state] While a ticket needs a person, the system shall not show the "AI replied…" banner. The "Why you're here" brief replaces it and is the first thing in the thread.
- REQ-712 [always] The system shall show the list header as two rows:
  - row 1: the view switcher and "+ New"
  - row 2: the muted AI status line on the left, with icon-only Sort and Filter buttons on the right.
  There is no separate keyboard icon (shortcuts stay on "?") and nothing is clipped.
- REQ-713 [always] The system shall hide row checkboxes until the user hovers or focuses a card, or a selection exists. The channel icon swaps to the checkbox, and Select all appears in a bulk bar once anything is selected.
- REQ-714 [always] The system shall show the AI draft as a 4-line preview that fades out, with "Show full draft". The action bar sits below it on one row: Approve & send (primary split), Edit, Discard, and the "Write my own" link on the right.
- REQ-715 [event] When the user opens "View full details", the system shall replace the four summary rows with the full sections (no duplicated customer info), and "Show summary" returns to the four rows.
- REQ-716 [always] The system shall use correct singular and plural copy ("Show 1 earlier message", "1 past ticket").
- REQ-767 [always] The system shall render the conversation header about 72px tall: a 16px semibold subject, a 13px meta row with 12px gaps between groups and 28px-high controls, and actions vertically centred. Header and thread content are constrained to one centred column (about 920px max) at wide widths (interpreted).
- REQ-768 [always] The system shall use no coloured side accent bars. The brief is a white bordered card with a sparkle icon tile and a sentence-case "Why you're here" label, wrapped in a subtle warm amber glow (a soft all-round shadow halo, token `shadow-glow-ai`, used only on the brief). The internal note has an all-round light-amber border.
- REQ-769 [state] While the viewport is 1024–1279px, the system shall start the summary panel collapsed to its rail and open it as an overlay drawer, so the conversation stays ≥480px.
- REQ-770 [always] The system shall derive the brief, Ask Goorin AI and summary facts from the same data, so confidence, totals and return figures always match.
- REQ-771 [always] The system shall place the composer and draft card in the same content column as the header and thread, as a sticky bottom dock. The draft card's actions sit inside its footer and are never clipped. The column is fluid: the pane minus 24/32/48px gutters, max-width clamp(720px, 88%, 1280px), and ≥85% of the pane at every desktop width. Message cards are up to 78% of the column with text capped at about 90ch. At ≥1600 the body is 15px (supersedes the ~920px cap in REQ-767).
- REQ-772 [always] The system shall show the draft header as a sparkle tile, "Draft by Claude", a confidence chip coloured by meaning (≥80 green, 50–79 amber, <50 red), up to 2 source chips plus "+n", and a ⋯ menu (Discard, Copy).
- REQ-773 [always] The system shall never let the demo-state switcher overlap an app control at any width.
- REQ-774 [always] The system shall NOT auto-collapse the main sidebar on /inbox. The sidebar keeps the user's own expanded or collapsed choice on every page. This supersedes REQ-562, REQ-563, REQ-635 (icon-only part) and REQ-638. With the sidebar expanded, the conversation must stay ≥480px; the summary panel uses the rail or overlay drawer at widths where it would be narrower.
- REQ-775 [always] The system shall organize the right panel as:
  - a header with "Customer" and a [Summary | Details] segmented control plus the collapse button
  - an always-visible identity block (avatar, name, email with copy, tags, View in Shopify, Copy, ⋯)
  - a 2×2 stats grid without filled tiles
  - one accordion pattern for Orders, Returns, Ticket, Contact, Note, Past tickets, Feedback and AI activity.
  Email and phone each appear once, and the "Shopify customer" pill and the "Matched by the ticket email" line are removed (that text moves to a tooltip).
- REQ-776 [always] The system shall show "Claude" only on configuration surfaces (the Integrations Claude tile and detail, the AI replies model setting). Everywhere else the actor is called "AI".

### Carry-over fixes (from iteration_13)
- REQ-667 [always] The system shall seed order #GB19790 with line items that sum to $160, of which $78 is already refunded, so $82 is refundable.
- REQ-668 [event] When the user confirms Edit order, the system shall apply the quantity, removal and address changes to the card. The dialog must have quantity steppers, a remove button and address fields.
- REQ-669 [unwanted] If an edit would leave no items, then the system shall block it with "An order needs at least one item."
- REQ-670 [event] When the user confirms Duplicate, the system shall add a "#D<n>" card with a "Draft" pill to the orders list.
- REQ-671 [always] The system shall give Create order a product search with size and quantity, shipping, a discount and a live total, with the button disabled until an item is added. Confirming adds the order card at the top.
- REQ-672 [unwanted] If the refund total is $0 or more than the refundable amount, then the system shall show "Enter an amount up to $<refundable>." and disable the refund button.
- REQ-673 [state] While the refund is above the auto-refund limit, the system shall show "Above your $<limit> auto-refund limit. This refund will be logged as approved by you."
- REQ-674 [event] When a refund is confirmed, the system shall add the event line "Refund of $<x> issued by <user>" and update the payment pill.
- REQ-675 [event] When the user presses → or ← outside a text field, the system shall open the next or previous ticket in the current list.
- REQ-676 [event] When the user deletes a saved view, the system shall ask "Delete <name>?" before removing it.
- REQ-677 [state] While the role toggle is Agent, the system shall act as Sam Okafor for ownership, so Ava's shared views show Edit and Delete disabled with "Only the creator or an admin can change this view." (interpreted).
- REQ-678 [always] The system shall show a context chip in Ask Goorin AI ("#<short id> · <customer>" or "Whole inbox"), source chips on every answer, Loop facts in the refund answer, and the fallback "I can't answer that in this demo yet. Try one of the suggestions."
- REQ-679 [always] The system shall list in the shortcuts modal: j/k, → / ←, r, n (note), Shift+N (new ticket), a (approve & send draft), e (resolve), ⌘G / Ctrl+G and ?.
- REQ-680 [state] While the viewport is 768–1023px, the system shall show the list beside the conversation, with the summary as a sheet from a "Details" button.
- REQ-681 [state] While on a phone (<640px), the system shall:
  - show the views (including saved views) as chips plus a "Views" sheet, opening on "Needs you"
  - show the draft card docked at the bottom
  - put "Ask Goorin AI" in the ticket ⋯ menu
  - open order dialogs as full-screen sheets from Details.

### Keyboard
- REQ-682 [event] When the user presses "a" outside a text field on a ticket with a draft, the system shall Approve & send the draft.

## Quality requirements
```
Q-56 Tag: Flow.TimeToHandle
     Scale: clicks from opening /inbox to sending an approved AI draft on the top "Needs you" ticket
     Meter: tester, 3 trials
     Must: ≤ 3   Plan: 2
Q-57 Tag: Visual.Simplicity
     Scale: distinct visible controls in the conversation header + composer on a needs-you ticket with a draft (excluding the draft text)
     Meter: tester count at 1440
     Must: ≤ 12   Plan: ≤ 9
Q-58 Tag: Visual.Consistency
     Scale: Inbox elements whose colour, border, radius, type or component differ from the same pattern on Dashboard / Guidance / Settings
     Meter: tester side-by-side at 1440 + screenshot review
     Must: 0   Plan: 0
Q-59 Tag: Layout.ConversationWidth
     Scale: px width of the conversation with default panels
     Meter: script at 1024 / 1280 / 1440 / 1920 / 2560
     Must: ≥ 480   Plan: ≥ 560
Q-60 Tag: Money.OrderMath
     Scale: order/refund dialogs whose total ≠ items + shipping − discount, or allowing more than refundable
     Meter: tester, 3 orders
     Must: 0   Plan: 0
Q-61 Tag: AI.AnswerTrust
     Scale: Ask Goorin AI or "Why you're here" text with a wrong customer, order, total or return fact for that ticket
     Meter: tester on 2 tickets
     Must: 0   Plan: 0
Q-62 Tag: Access + Device
     Scale: axe serious/critical issues on /inbox; overflow or tap targets < 44px at 360/390/430
     Meter: audit.mjs + phone-sweep
     Must: 0   Plan: 0
Q-63 Tag: Visual.EnterpriseModern
     Scale: reviewer judgement that the Inbox feels simpler, modern and enterprise-grade vs Phase 10
     Meter: human
     Must: pass   Plan: pass
```
