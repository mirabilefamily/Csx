# Phase 2: Inbox

- Version: phase-2
- Goal: a full agent workspace at /inbox. Includes views, a filterable/bulk-selectable ticket list, a conversation pane with AI draft approval, escalation timeline, rich composer with macros, a customer/orders/AI-log sidebar, keyboard shortcuts, and a single-pane layout on narrow screens. All of it runs on the phase-1 mock data through /src/api.
- Product context: [overview.md](../overview.md). Builds on phase 1 (shell, badges, pills, demo state switcher, mock data). Feature ids: F-19 to F-25.
- Phase-1 journeys JRN-12 and JRN-14 are partly superseded (Inbox is no longer a placeholder). See journeys.md.

## Functional requirements

### Layout and views
- REQ-95 [always] The system shall render /inbox and /inbox/:ticketId as a 3-pane layout: views, ticket list, conversation, plus a right details sidebar.
- REQ-96 [always] The system shall list the views All open, Needs human, AI handling, Mine, Unassigned, Resolved and Closed, each with a ticket count.
- REQ-97 [always] The system shall define All open as status open, ai_handling, grok_handling or needs_human (interpreted).
- REQ-98 [always] The system shall define AI handling as status ai_handling or grok_handling (interpreted).
- REQ-99 [always] The system shall define Mine as tickets assigned to the signed-in user that are not closed (interpreted).
- REQ-100 [always] The system shall define Unassigned as tickets with no assignee that are not resolved or closed (interpreted).
- REQ-101 [always] The system shall reflect the selected view in the URL (e.g. ?view=needs_human) so it survives navigation (interpreted).
- REQ-102 [always] The system shall keep the sidebar Inbox badge, the bell, and the Needs human view count equal to the live number of needs_human tickets.
- REQ-103 [state] While no ticket is selected, the system shall show "Select a ticket to view the conversation" in the conversation pane.
- REQ-104 [unwanted] If /inbox/:ticketId does not match a ticket, then the system shall show "Ticket not found" with a link back to the inbox.

### Ticket list
- REQ-105 [always] The system shall show on each row the customer name, subject, a one-line preview, a channel icon (email or chat), a status pill, a resolved-by badge (when resolved/closed) and a relative time.
- REQ-106 [always] The system shall sort the list by most recently updated first (interpreted).
- REQ-107 [always] The system shall provide filters for status, channel, resolved-by, tag and assignee.
- REQ-108 [event] When filters are applied, the system shall show only matching tickets and the count of active filters.
- REQ-109 [unwanted] If no ticket matches the view and filters, then the system shall show "No tickets match these filters" with a "Clear filters" action.
- REQ-110 [state] While a view is empty with no filters applied, the system shall show a designed empty state for that view (e.g. "Nothing needs a human right now").
- REQ-111 [event] When the user checks one or more rows, the system shall show a bulk bar with "<N> selected", Assign, Tag and Close.
- REQ-112 [always] The system shall provide a select-all checkbox for the visible rows.
- REQ-113 [event] When the user bulk-assigns, the system shall set the chosen assignee on every selected ticket and show "<N> tickets assigned to <name>".
- REQ-114 [event] When the user bulk-tags, the system shall add the chosen tag to every selected ticket and show "Tag added to <N> tickets".
- REQ-115 [event] When the user bulk-closes, the system shall set every selected ticket to closed and show "<N> tickets closed".
- REQ-116 [unwanted] If a bulk action fails in the API layer (demo state Error), then the system shall show "Couldn't update tickets. Try again." and leave tickets unchanged.

### Conversation pane
- REQ-117 [always] The system shall show the ticket's messages in chronological order, each with its AuthorBadge (Customer, Claude, Grokbot, Agent, System), author name and timestamp.
- REQ-118 [always] The system shall render internal notes in a yellow-tinted note style labeled "Internal note".
- REQ-119 [always] The system shall show each pending AI draft as a card labeled "<Claude|Grokbot> draft · Awaiting approval".
- REQ-120 [always] The system shall show on each draft card a confidence meter with a percentage.
- REQ-121 [always] The system shall show on each draft card the guidance articles used, as titled chips.
- REQ-122 [event] When the user clicks Approve on a draft, the system shall add it to the thread as an AI message marked "Approved by <user name>".
- REQ-123 [event] When the user clicks Edit on a draft, the system shall load the draft text into the composer in reply mode.
- REQ-124 [event] When the user clicks Discard on a draft, the system shall remove the draft and show "Draft discarded" with Undo (interpreted).
- REQ-125 [always] The system shall show an escalation timeline chip (e.g. Claude → Grokbot → Human) on tickets that escalated.
- REQ-126 [event] When the user hovers or keyboard-focuses a step of the escalation chip, the system shall show that step's reason.
- REQ-127 [always] The system shall show header controls for status (six statuses), priority (Low, Normal, High, Urgent) and assignee (users plus Unassigned).
- REQ-128 [event] When the user changes status, priority or assignee, the system shall update the ticket in the header, the list row and the view counts.
- REQ-129 [event] When the user changes status, priority or assignee, the system shall add a System message describing the change (e.g. "Ava Martinez changed status to Resolved") (interpreted).

### Composer
- REQ-130 [always] The system shall provide a rich-text composer with bold, italic, link and bulleted list.
- REQ-131 [event] When the user types "/" at the start of the composer or clicks the macros button, the system shall open a macros picker filtered as they type.
- REQ-132 [event] When the user picks a macro, the system shall insert its body with customer placeholders filled (e.g. first name).
- REQ-133 [unwanted] If no macro matches the typed text, then the system shall show "No macros found".
- REQ-134 [event] When the user switches the internal-note toggle on, the system shall tint the composer yellow and label the button "Add note".
- REQ-135 [event] When the user sends a reply, the system shall append an Agent message to the thread and clear the composer.
- REQ-136 [event] When the user adds a note, the system shall append a yellow internal note to the thread and clear the composer.
- REQ-137 [unwanted] If the composer is empty, then the system shall disable Send / Add note.

### Right sidebar
- REQ-138 [always] The system shall show a customer card with name, email, location, order count, lifetime spend and a "Shopify customer" tag where applicable.
- REQ-139 [always] The system shall show Shopify orders with order number, status, a tracking link that opens in a new tab, and line items (name, variant/size, qty).
- REQ-140 [state] While a customer has no orders, the system shall show "No Shopify orders".
- REQ-141 [always] The system shall show past tickets for the customer, each linking to /inbox/<id>.
- REQ-142 [always] The system shall show a collapsible AI attempt log listing each attempt's tier, model, confidence, latency (ms), outcome, reason and guidance articles.
- REQ-143 [state] While a ticket has no AI attempts, the system shall show "No AI attempts on this ticket".

### Keyboard shortcuts
- REQ-144 [event] When the user presses j or k, the system shall open the next or previous ticket in the list.
- REQ-145 [event] When the user presses r, the system shall focus the composer in reply mode.
- REQ-146 [event] When the user presses n, the system shall focus the composer in internal-note mode.
- REQ-147 [event] When the user presses e, the system shall close the open ticket and show "<id> closed".
- REQ-148 [event] When the user presses ?, the system shall open a shortcut help modal listing every shortcut.
- REQ-149 [unwanted] If focus is inside a text input or the composer, then the system shall ignore single-key shortcuts.

### Responsive and states
- REQ-150 [state] While the viewport is 1440px or wider, the system shall show views, list, conversation and right sidebar side by side (interpreted).
- REQ-151 [state] While the viewport is 1024–1439px, the system shall open the right sidebar as a toggleable "Details" panel (interpreted).
- REQ-152 [state] While the viewport is below 1024px, the system shall show a single pane: list first, conversation with a Back button after selecting, views as a dropdown (interpreted).
- REQ-153 [always] The system shall show skeleton, empty and error states for the views, list and conversation via the demo state switcher.

### Phase-1 fix
- REQ-154 [event] When the user presses Ctrl/⌘+K right after navigating from a bell notification, the system shall keep search results open while typing.

## Quality requirements
```
Q-10 Tag: Performance.TicketSwitch
     Scale: ms from clicking a row (or j/k) to conversation rendered, incl. simulated latency
     Meter: browser timing, 5 trials
     Must: 1000   Plan: 500
Q-11 Tag: Trust.CountConsistency
     Scale: mismatches between view counts, nav badge, bell and list rows after status/bulk changes
     Meter: change 3 tickets, compare counts
     Must: 0   Plan: 0
Q-12 Tag: Trust.AIDraftClarity
     Scale: drafts where an agent can't tell author tier, confidence and guidance used without clicking
     Meter: human review of 3 drafts
     Must: 0   Plan: 0
Q-13 Tag: Accessibility.Keyboard
     Scale: % of inbox actions (select, filter, bulk, approve, compose, change status) doable by keyboard with visible focus
     Meter: manual tab-through
     Must: 100%   Plan: 100%
Q-14 Tag: Responsive.Tablet
     Scale: px horizontal overflow at 768px and 1024px on /inbox/<id>
     Meter: browser
     Must: 0   Plan: 0
Q-15 Tag: Visual.Thread
     Scale: author types that share an identical bubble/badge style
     Meter: screenshot review
     Must: 0   Plan: 0
```
