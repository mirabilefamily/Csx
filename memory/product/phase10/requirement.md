# Phase 10: Modern Inbox (requirement)

- Phase version: phase-10
- Goal: rebuild the Inbox into a modern four-zone workspace based on the user's two Gorgias-style screenshots: an Inbox views panel, a ticket card list, a conversation with AI handover context and a power composer, and a stacked customer/Shopify panel with an app icon rail. Add saved views, an "Ask Goorin AI" assistant and mock Shopify order dialogs. Everything stays MOCKED and UI-only, behind /src/api (see overview.md).
- Confirmed user choices:
  - Inbox views panel, with the main sidebar shrunk to icons.
  - Shared and Private saved views.
  - The assistant is named "Ask Goorin AI".
  - Shopify order buttons open mock dialogs that end in a confirmation.
  - Everything else from the screenshots uses the defaults below.
- Keep every existing Inbox behaviour that still applies, restyled:
  - fraud chips and banners
  - Loop returns stats, filters and cards
  - Shopify order data, inventory by SKU, find order, lookup details
  - AI drafts (Approve / Edit / Discard)
  - internal notes, macros, rich text
  - filters, bulk actions, Spam/Trash with Restore / Delete forever, new ticket, pagination, short ids
  - AI replied banner, Email timing, delivery status and timeline
  - shortcuts, phone flow, collapsible right panel

## Functional requirements

### Layout and views panel
- REQ-562 [state] While the user is on /inbox at ≥1024px, the system shall shrink the main app sidebar to its icon-only state.
- REQ-563 [event] When the user leaves /inbox, the system shall restore the main sidebar to the state the user had before (interpreted).
- REQ-564 [always] The system shall show an Inbox views panel with a header "Inbox", a bell with the needs-human count, a search icon (opens global search) and a collapse-panel icon.
- REQ-565 [always] The system shall show a "New ticket" button with an "N" key hint at the top of the views panel. It opens the existing new-ticket composer.
- REQ-566 [always] The system shall show a "Default views" group: Assigned to me, Unassigned and All, each with a count.
- REQ-567 [event] When the user clicks "More" under Default views, the system shall reveal Needs human, AI handling, Resolved, Closed, Spam and Trash with counts (interpreted: keeps every existing view).
- REQ-568 [always] The system shall show collapsible "Shared views" and "Private views" groups listing saved views with counts.
- REQ-569 [always] The system shall show an "Ask Goorin AI" pill with a "⌘G" hint ("Ctrl G" on Windows) near the bottom of the views panel, plus a "?" icon that opens the keyboard shortcuts modal.
- REQ-570 [state] While the viewport is ≥1600px, the system shall dock the views panel open by default.
- REQ-571 [state] While the viewport is 1024–1599px, the system shall start with the views panel closed and open it as an overlay flyout from the collapse-panel icon, so the conversation keeps its width (interpreted).

### Saved views
- REQ-572 [event] When the user applies filters, sort or a search and clicks "Save view", the system shall open a dialog with Name (required, max 40) and Visibility "Private" or "Shared with team".
- REQ-573 [unwanted] If the name is empty or already used in the same group, then the system shall show "Give this view a name." or "A view with this name already exists." and keep the dialog open.
- REQ-574 [event] When the user saves the dialog, the system shall add the view to the chosen group, select it and show the toast "View saved".
- REQ-575 [always] The system shall give each saved view a "⋯" menu with Rename, Edit filters, Duplicate, Make shared / Make private and Delete (Delete asks for confirmation).
- REQ-576 [unwanted] If an agent tries to delete or edit a shared view created by someone else, then the system shall disable those items with the hint "Only the creator or an admin can change this view." (interpreted).
- REQ-577 [always] The system shall reset saved views to the seed on reload, like all mock data.

### Ticket list
- REQ-578 [always] The system shall head the list column with the current view name and a ▾ view switcher, plus a filter icon, a sort icon (Newest, Oldest, Waiting longest, Priority) and a hide-list icon.
- REQ-579 [always] The system shall show a "Select all" checkbox row with bulk icons for Resolve, Assign and "⋯" (Tag, Move to spam, Move to trash).
- REQ-580 [always] The system shall render each ticket as a card:
  - channel icon, customer name and relative time
  - bold one-line subject and a grey one-line preview
  - unread tickets in bolder text
  - the needs-human amber pill and the fraud chip where they apply
  - the short id on hover or focus
  - the selected card raised.
- REQ-581 [event] When the user clicks the hide-list icon, the system shall collapse the list column. A panel icon in the conversation breadcrumb brings it back.

### Conversation header
- REQ-582 [always] The system shall show a breadcrumb "<view> › <customer name> › <subject>" at the top of the conversation.
- REQ-583 [always] The system shall show compact header controls on the right: status, priority, assignee (avatar + name, or "Unassigned"), team ("No team", Support, Returns, Wholesale), snooze, a primary "Resolve" button, "⋯", and previous/next ticket arrows.
- REQ-584 [event] When the user picks a snooze option (1 hour, Tomorrow 9am, Next week, Custom), the system shall show "Snoozed until <time>" in the header with an "Unsnooze" action (interpreted).
- REQ-585 [event] When the user clicks the next arrow or presses → outside a text field, the system shall open the next ticket in the list. ← or the previous arrow opens the previous one.

### Messages and AI context
- REQ-586 [always] The system shall render messages as cards:
  - customer messages as white cards aligned left
  - AI and agent replies as tinted cards offset right
  - each card header shows the avatar, name, "<email>" for agents, the channel icon, a delivery tick (opens the existing delivery timeline) and the timestamp.
- REQ-587 [event] When the user hovers or focuses a message, the system shall show a copy button in the gutter. Clicking it copies the text and shows "Copied".
- REQ-588 [always] The system shall show "This response was created by Goorin AI Assistant" under AI-written replies.
- REQ-589 [event] When the user clicks "Show reasoning" on an AI reply, the system shall expand: detected intent, guidance articles used, Shopify or Loop data checked, confidence and the reply/escalate decision.
- REQ-590 [state] While a ticket was handed from AI to a human, the system shall show a warm-tinted "Handover summary" card with a timestamp, a collapse control and summary bullets.
- REQ-591 [unwanted] If the ticket has fewer than 3 messages, then the Handover summary card shall read "Unable to generate a ticket summary with fewer than 3 messages." with a "Try again" button.
- REQ-592 [state] While messages were added after the summary was generated, the system shall show "New messages have been added since this summary was generated. You can refresh it below." with Refresh. Refresh regenerates it (mock) with a new timestamp.
- REQ-593 [always] The system shall show "Handover reason" with:
  - "Intent detected by AI Agent: <category> / <sub-category>"
  - a bold one-line conclusion
  - bullets, each ending in source icons (guidance article, Shopify, Loop) whose tooltip names the source.
- REQ-594 [always] The system shall show ticket events (handed over, assigned, status changed, snoozed, refunded) as small right-aligned event lines, e.g. "Handed over by ◇ Claude".

### Composer
- REQ-595 [always] The system shall show a composer top row with a channel selector (Email or Chat matching the ticket, plus Internal note) and "To: <email>" with Cc/Bcc toggles for email.
- REQ-596 [always] The system shall show a macro search bar "Search macros by name, tags or body..." that filters macros as the user types. Picking one inserts it with variables filled.
- REQ-597 [always] The system shall show the editor placeholder "Click here to reply, or press r."
- REQ-598 [always] The system shall show up to 3 "Suggested macros" chips based on the ticket's tags and intent. Clicking one inserts it.
- REQ-599 [always] The system shall show a formatting toolbar: Translate, Bold, Italic, Underline, Link, Image, Emoji, Insert Shopify order or product, and Attach file.
- REQ-600 [event] When the user clicks Translate, the system shall offer the customer's detected language and replace the draft with a mock translation, with an Undo.
- REQ-601 [always] The system shall show "Send" and "Send & Resolve" buttons, both disabled while the draft is empty.
- REQ-602 [always] The system shall show a dismissible keyboard tip at the bottom right that rotates through: "Press → to go to the next ticket", "Press r to reply", "Press N for a new ticket".
- REQ-603 [state] While a pending AI draft exists, the system shall show it inside the composer as "AI draft ready" with Approve & send, Edit and Discard (existing behaviour, restyled).
- REQ-604 [always] The system shall keep "Draft saved" autosave feedback.

### Right panel and icon rail
- REQ-605 [always] The system shall show a slim icon rail on the far right with: panel toggle, Customer, Shopify, Loop Returns, Ask Goorin AI and Customize. Clicking an app icon scrolls the panel to that section and highlights the icon.
- REQ-606 [event] When the user clicks Customize, the system shall show a popover to show or hide each panel section (session only) (interpreted).
- REQ-607 [always] The system shall show "Ticket details" first:
  - tag chips with coloured dots and remove ×
  - "+" to add an existing or new tag, and a "+N" overflow
  - a collapsible "Ticket fields" group: Contact reason, Product, Resolution, Order # (editable).
- REQ-608 [always] The system shall show the customer block:
  - initials avatar and name, a search icon (link a different customer) and "⋯" (Copy email, View in Shopify)
  - Email and Phone as links, and Note with "+ Add" inline editing
  - a collapsible "Customer fields" group: Location, Customer since, Language, VIP.
- REQ-609 [always] The system shall show past tickets as "<n> tickets" with "Show all >" and a card for the latest other ticket: channel, subject, time ago, product, status, resolver and message count.
- REQ-610 [always] The system shall show the Shopify section:
  - Shopify logo and collapse (no store selector: superseded by REQ-685, one store)
  - customer link with external icon, Created at, "+ Add tags"
  - Metafields (empty: "Customer has no metafields populated.")
  - Purchase summary (Number of orders, Amount)
  - "Orders <n>" with "+ Create order"
  - the existing tools (Refresh, Find another order, Check inventory by SKU, Lookup details) in the section header.
- REQ-611 [always] The system shall render each order as a collapsible card:
  - order number with Shopify icon and external link
  - "date • n items • total", product thumbnails, payment and fulfillment pills
  - Edit, Duplicate and Refund buttons
  - order tags with + and ×, Created at, tracking, shipping address
  - order Metafields (empty: "Order has no metafields populated.").
- REQ-612 [always] The system shall keep the Loop returns section, restyled to the same card language, with its stats, high-return chip, filters and cards.
- REQ-613 (superseded by REQ-685: one store, so no per-store empty state; customers with no orders show "No orders yet").

### Order dialogs (MOCKED)
- REQ-614 [event] When the user clicks Edit, the system shall open "Edit order #<n>": change quantities, remove a line, edit the shipping address and add a note. Confirming shows "Order #<n> updated" and the card updates.
- REQ-615 [unwanted] If an edit would leave the order with no items, then the system shall block it with "An order needs at least one item."
- REQ-616 [event] When the user clicks Duplicate, the system shall open "Duplicate order #<n>" with the same items. Confirming creates a draft order card "#D<n>" (pill "Draft") and shows "Draft order created".
- REQ-617 [event] When the user clicks Refund, the system shall open "Refund order #<n>": item quantities, shipping refund, restock toggle, reason, "Notify customer" and a live refund total.
- REQ-618 [unwanted] If the refund total is $0 or more than the refundable amount, then the system shall disable "Refund $<x>" and show "Enter an amount up to $<refundable>."
- REQ-619 [state] While the refund total is above the auto-refund limit from AI replies, the system shall show the note "Above your $<limit> auto-refund limit. This refund will be logged as approved by you."
- REQ-620 [event] When the user confirms a refund, the system shall update the payment pill ("Partially refunded" or "Refunded"), add the event line "Refund of $<x> issued by <user>" and show the toast "Refund issued".
- REQ-621 [event] When the user clicks "+ Create order", the system shall open "Create order": product search with size variant and quantity, shipping method, discount and a live total. Confirming adds a new order card at the top and shows "Order #<n> created".
- REQ-622 [unwanted] If the new order has no items, then the system shall disable "Create order".

### Ask Goorin AI (MOCKED)
- REQ-623 [event] When the user clicks the pill, the rail sparkle or presses ⌘G / Ctrl+G, the system shall open the "Ask Goorin AI" panel with a context chip "<short id> · <customer name>", or "Whole inbox" when no ticket is open.
- REQ-624 [always] The system shall show suggested prompts. With a ticket open: "Summarize this ticket", "What has this customer ordered?", "Is this order eligible for a return?", "Draft a reply". With no ticket: "How many tickets need a human?", "What are customers asking about most this week?".
- REQ-625 [event] When the user sends a question, the system shall show a typing indicator, then a mock answer built from the current ticket's seed data, with source chips (guidance article, Shopify order, Loop return).
- REQ-626 [event] When an answer is a reply draft, the system shall show "Insert into reply", which places it in the composer.
- REQ-627 [unwanted] If the question doesn't match a mock answer, then the system shall reply "I can't answer that in this demo yet. Try one of the suggestions." with the prompts shown again.

### Keyboard
- REQ-628 [always] The system shall support N (new ticket), r (reply), → / ← (next / previous ticket), j / k, e (resolve) and ⌘G / Ctrl+G (Ask Goorin AI), all ignored while typing in a field except ⌘G. The shortcuts modal lists them.

### Responsive
- REQ-629 [state] While the viewport is 1024–1599px, the system shall start with the right panel open beside the conversation. The rail stays visible when the panel is collapsed.
- REQ-630 [state] While the viewport is 768–1023px, the system shall show the list plus conversation, with views from the list-header switcher and the right panel as a sheet from the rail or a "Details" button.
- REQ-631 [state] While on a phone (<640px), the system shall keep the existing phone flow, restyled:
  - default views and saved views in the chip row plus a "Views" sheet
  - ticket cards as above
  - the composer docked, with the macro search and suggested chips in a sheet
  - Ask Goorin AI from the ticket "⋯" as a full-screen sheet.

## Quality requirements
```
Q-48 Tag: Layout.ConversationWidth
     Scale: px width of the conversation column with default panels open
     Meter: script measure at 1024 / 1280 / 1440 / 1920 / 2560
     Must: ≥ 480   Plan: ≥ 560
Q-49 Tag: Perf.TicketSwitch
     Scale: ms from clicking a ticket card to its messages visible (mock latency included)
     Meter: script, 5 trials at 1440
     Must: ≤ 800   Plan: ≤ 400
Q-50 Tag: Regression.Inbox
     Scale: earlier Inbox behaviours listed in "Keep" above that no longer work
     Meter: re-run phase 2/8/9 inbox checks with updated selectors
     Must: 0   Plan: 0
Q-51 Tag: Money.RefundMath
     Scale: refund or create-order dialogs whose total differs from items + shipping − discount, or that allow more than the refundable amount
     Meter: tester, 3 orders
     Must: 0   Plan: 0
Q-52 Tag: AI.AnswerTrust
     Scale: Ask Goorin AI answers that state a wrong customer name, order number, total or return fact for the open ticket
     Meter: tester asks the 4 ticket prompts on 2 tickets
     Must: 0 of 8   Plan: 0 of 8
Q-53 Tag: Access.Keyboard
     Scale: axe serious/critical issues on /inbox; core actions not reachable by keyboard
     Meter: audit.mjs + phone-sweep at 390–2560
     Must: 0   Plan: 0
Q-54 Tag: Device.Phone
     Scale: horizontal overflow or tap targets < 44px at 360 / 390 / 430
     Meter: phone-sweep.mjs
     Must: 0   Plan: 0
Q-55 Tag: Visual.Modern
     Scale: reviewer judgement that the Inbox reads as clean and modern as the screenshots, in Goorin's palette
     Meter: human
     Must: pass   Plan: pass
```
