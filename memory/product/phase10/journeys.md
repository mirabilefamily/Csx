# Phase 10 Journeys (Modern Inbox)

Sign in as ava@goorin.com (Admin) at 1440 unless stated. Use the role toggle for Agent. All data is MOCKED and resets on reload. The builder reports the exact seed ticket ids used below.

superseded: [JRN-115, JRN-116, JRN-117]. Their list headings ("VIEWS" / "SET ASIDE"), "+ New" label, header layout, Reply/Internal note tabs, "Send to customer" and "CUSTOMER & SHOPIFY" title are replaced by JRN-122 to JRN-133. The behaviours they checked (Spam/Trash, Restore, Delete forever, new ticket, short id, pagination, AI replied banner, Email timing, delivery timeline, Assign me, Draft saved, customer stats, order tools, Loop filters) must still pass under the new layout.

### JRN-122 Inbox layout and main sidebar
- steps: From Dashboard (sidebar expanded) open Inbox at 1440. Open the views panel from the collapse-panel icon. Go to 1920. Leave the Inbox for Guidance.
- expected:
  - On Inbox the main sidebar is icon-only.
  - At 1440 the views panel opens as an overlay and the conversation width doesn't shrink. At 1920 it is docked open.
  - The views panel shows "Inbox", the bell with count, search, "New ticket N", Default views (Assigned to me, Unassigned, All, with counts), More, Shared views, Private views, "Ask Goorin AI ⌘G" and "?".
  - The conversation column is ≥ 480px at 1024, 1280, 1440, 1920 and 2560.
  - On Guidance the main sidebar is expanded again.

### JRN-123 Views, More and set-aside
- steps: Click Assigned to me, Unassigned, All. Click More, then open Spam and Trash. Restore a ticket from Trash. Delete forever another one.
- expected:
  - Counts match the list totals.
  - More reveals Needs human, AI handling, Resolved, Closed, Spam and Trash.
  - Restore moves the ticket back. Delete forever asks for confirmation, then removes it.

### JRN-124 Saved views
- steps: Open All, filter channel = Email and tag = sizing, click Save view. Try an empty name, then an existing shared name. Save "Email sizing" as Private. Then use its ⋯ to Rename, Make shared and Delete. As Agent, open the ⋯ on a shared view created by Ava.
- expected:
  - "Give this view a name." and "A view with this name already exists." block saving.
  - After saving, "Email sizing" appears under Private views, selected, with a count and the toast "View saved", and the list shows only matching tickets.
  - Rename updates the label. Make shared moves it to Shared views. Delete asks for confirmation and removes it.
  - As Agent, Edit and Delete on Ava's shared view are disabled with "Only the creator or an admin can change this view."
  - After a reload only the seeded views remain.

### JRN-125 Ticket list cards
- steps: Look at the list header and cards. Hover a card. Sort by Waiting longest. Select all, then bulk Assign. Hide the list, then bring it back from the breadcrumb icon. Page to page 2.
- expected:
  - The header shows the view name ▾, filter, sort and hide icons.
  - Cards show the channel icon, name, relative time, bold subject and grey preview. Needs-human tickets show the amber pill and fraud tickets the fraud chip. The short id appears on hover.
  - Sorting reorders the list. Bulk assign applies to the selected tickets.
  - Hiding the list widens the conversation, and the breadcrumb icon restores it.
  - Pagination still works.

### JRN-126 Conversation header and navigation
- steps: Open a ticket. Read the breadcrumb. Change status, priority, assignee to Sam, team to Returns. Snooze for 1 hour, then Unsnooze. Press →, then ←. Click Resolve.
- expected:
  - The breadcrumb reads "<view> › <customer> › <subject>".
  - Each control updates and adds an event line (e.g. "Assigned to Sam Okafor").
  - Snooze shows "Snoozed until <time>" with Unsnooze.
  - → opens the next ticket in the list and ← the previous one.
  - Resolve sets Resolved with an event line. The ⋯ menu still has spam/trash, with merge disabled.

### JRN-127 Messages, reasoning and handover
- steps: Open a seeded AI-handover ticket with ≥3 messages, then one with fewer than 3. Click Show reasoning on an AI reply. Hover a message and click copy. Hover a source icon in Handover reason. On the ≥3 ticket send a reply.
- expected:
  - Customer cards are white and on the left. AI and agent cards are tinted and offset right, with avatar, name, <email> for agents, channel icon, delivery tick (opens the Queued → Sent → Delivered timeline) and time.
  - AI replies show "This response was created by Goorin AI Assistant".
  - Show reasoning reveals intent, articles, data checked, confidence and the decision.
  - Copy shows "Copied".
  - The Handover summary card shows bullets. Handover reason shows "Intent detected by AI Agent: …", a bold line and bullets with source icons whose tooltips name the source.
  - The "Handed over by ◇ Claude" event line shows.
  - The <3 ticket shows "Unable to generate a ticket summary with fewer than 3 messages." with Try again.
  - After the reply, the summary shows "New messages have been added since this summary was generated. You can refresh it below." Refresh updates its timestamp.
  - The AI replied banner and Email timing still work on the earlier seed ticket.

### JRN-128 Composer
- steps: Press r. Check the channel selector and To line, toggle Cc. Type "size" in the macro search, then pick a macro. Click a suggested macro chip. Use Bold and Emoji. Click Translate, then Undo. Switch to Internal note and add a note. On a ticket with a pending AI draft, Approve & send. Try Send with an empty draft. Send & Resolve a reply.
- expected:
  - r focuses the editor (placeholder "Click here to reply, or press r.").
  - "To: <email>" and Cc are shown.
  - Macro search filters by name, tags and body, and inserts the macro with variables filled. Suggested chips (≤3) insert too.
  - Formatting applies. Translate shows the customer's language and replaces the draft, and Undo restores it.
  - The internal note posts in the note style.
  - "AI draft ready" Approve & send posts the draft.
  - Send and Send & Resolve are disabled while empty. Send & Resolve posts the reply and resolves the ticket.
  - "Draft saved" appears while typing. The keyboard tip rotates, and × hides it.

### JRN-129 Right panel and rail
- steps: Click each rail icon. Use Customize to hide Ticket fields. In Ticket details add the tag "vip" and remove one. Edit Contact reason. Add a customer Note. Open Customer fields, then Show all past tickets. In Shopify switch the store to goorin-bros-wholesale and back, add a customer tag, open an order card, run Check inventory by SKU.
- expected:
  - Rail icons scroll to and highlight their section. The sparkle opens Ask Goorin AI. Customize hides and shows sections.
  - Tag chips have coloured dots and ×, with "+N" overflow when long. Ticket fields save.
  - The Note saves inline. Customer fields show Location, Customer since, Language and VIP.
  - "<n> tickets" Show all lists the past tickets.
  - (Superseded by REQ-685: there is no second store or store selector.)
  - Shopify shows Metafields (empty copy), Purchase summary (orders and amount) and "Orders <n>" with + Create order.
  - The order card shows number, date • items • total, thumbnails, payment and fulfillment pills, Edit / Duplicate / Refund, tags, Created at, tracking, address and Metafields ("Order has no metafields populated.").
  - The inventory result shows. The Loop returns section shows as in Phase 9, and the fraud chip and banner show on the fraud seed ticket.

### JRN-130 Order dialogs
- steps: On an order click Edit: remove every line, then put one back, change a quantity, confirm. Click Duplicate and confirm. Click Refund: set $0, then more than the refundable amount, then one item plus shipping above the auto-refund limit, then confirm. Click + Create order: try with no items, then add a hat in size M qty 2 with a discount, then confirm.
- expected:
  - Edit blocks "An order needs at least one item.", then "Order #<n> updated" and the card shows the new quantity.
  - Duplicate adds a "#D<n>" card with a "Draft" pill and the toast "Draft order created".
  - Refund: $0 and over-refundable disable the button with "Enter an amount up to $<refundable>." Above the limit shows the note "Above your $<limit> auto-refund limit…". The total always equals items + shipping. Confirming changes the pill to "Partially refunded", adds "Refund of $<x> issued by Ava Martinez" and shows "Refund issued".
  - Create order is disabled with no items. Its total equals price × qty − discount + shipping, and confirming adds the new card at the top with "Order #<n> created".

### JRN-131 Ask Goorin AI
- steps: With a ticket open press Ctrl+G. Ask each of the 4 suggested prompts. Click Insert into reply on "Draft a reply". Ask "what's the weather". Close the panel, deselect the ticket and open it from the pill.
- expected:
  - The panel opens with the chip "<short id> · <customer>".
  - Each answer appears after a typing indicator, uses that ticket's real seed facts (name, order number, totals, return facts) and shows source chips.
  - Insert into reply puts the draft in the composer.
  - The weather question returns "I can't answer that in this demo yet. Try one of the suggestions."
  - With no ticket open the chip reads "Whole inbox" with the inbox-level prompts, and "How many tickets need a human?" returns the current needs-human count.

### JRN-132 Keyboard and access
- steps: Open the shortcuts modal from "?". Press N, Esc, j, k, →, ←, e, r and Ctrl+G with focus on the page. Then type "e" in the composer. Tab through the header, composer and panel.
- expected:
  - The modal lists N, r, → / ←, j / k, e and ⌘G / Ctrl+G.
  - Each key does its action. Typing "e" in a field doesn't resolve the ticket.
  - Focus rings are visible everywhere, and the axe audit finds 0 serious or critical issues.

### JRN-133 Tablet and phone
- steps: At 768 open Inbox, switch views from the list header, open a ticket, open Details. At 390: switch views with the chips and the Views sheet (including a saved view), open a ticket, read the cards, use macro search from the composer, open Ask Goorin AI from ⋯, open Details and run a Refund dialog. Repeat at 360 and 430.
- expected:
  - At 768 the list and conversation show. The views switcher lists default and saved views, and Details opens as a sheet.
  - On phones the chips and Views sheet work, the composer stays docked, macro search and suggested macros open in a sheet, Ask Goorin AI is full screen, and the order dialogs are full-screen sheets.
  - There is no horizontal overflow and every tap target is ≥ 44px at 360, 390 and 430.
