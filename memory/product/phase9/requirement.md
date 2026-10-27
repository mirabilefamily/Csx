# Phase 9: Align the app structure with the production desk, "but make better"

- Version: phase-9
- Goal: restructure the prototype to match the user's production Support Desk screenshots (Dashboard, Inbox, AI & Workflows, Guidance, Channels, Settings), improving each screen. Everything stays MOCKED. Production-only caveats ("No mock previews here", "provider sync isn't active yet") are NOT copied; the prototype shows the finished experience.
- Source: 5 user screenshots (Dashboard, Inbox ticket, AI & Workflows → Brand Voice, Guidance, Channels → Chat & form). This answers the open AI & Workflows / Channels question.
- Feature id: F-44. Phone rules from phase 7 and full-width rules (REQ-497..502) still apply.

## Functional requirements

### Shell + navigation
- REQ-513 [always] The system shall show sidebar nav, in order: Dashboard, Inbox (needs-human badge), a divider, AI & Workflows, Guidance, Channels, with Settings pinned at the bottom beside the collapse toggle. The expanded header shows the GOORIN wordmark with letter-spaced "SUPPORT DESK" centered beneath it.
- REQ-514 [state] While the role is Agent, the system shall hide AI & Workflows, Channels and Settings, and those routes shall show the no-access screen (interpreted: they hold admin configuration).
- REQ-515 [always] The system shall show in the top bar: search with placeholder "Search tickets, guidance, settings..." and a "Ctrl K" (⌘K on Mac) hint, the bell, and the avatar with the user's name + role (e.g. "Ava Martinez · Admin") and a chevron.
- REQ-516 [event] When the user searches, the system shall also return a "Settings" group of matching pages/sections (e.g. "Brand voice", "Launcher position", "Users"), each deep-linking to that place.
- REQ-517 [state] While on a phone, the system shall show the bottom tab bar as Dashboard, Inbox, Guidance, More. More opens a sheet with AI & Workflows, Channels and Settings (admin only).

### Dashboard
- REQ-518 [always] The system shall show the subtitle "How the desk is doing, <range dates>." with the dates in semibold.
- REQ-519 [always] The system shall offer range options Last 24 hours, 7d, 30d, 90d and Custom (calendar icon). "Last 24 hours" replaces "Today".
- REQ-520 [always] The system shall show a caption under each KPI (e.g. "vs prior 30 days" or "Current snapshot" for Open tickets) and, where there's no prior period, "No prior data" instead of a delta.
- REQ-521 [always] The system shall label the Ticket volume chart "New tickets by channel" with an Email / Chat legend showing range totals.
- REQ-522 [always] The system shall show on the Refunds and Fraud alerts panels a meta subtitle (e.g. "Recorded in range", "Unreviewed flags across all dates") and a count badge (e.g. "4 open (all time)").
- REQ-523 [always] The system shall show on the Fraud panel the helper "Risk flags are signals, not proof of fraud."
- REQ-524 [event] When the user clicks an alert action, the system shall ask for an optional review note before recording it (interpreted improvement).
- REQ-525 [always] The system shall show a "Chat reply timing" panel: last 30 complete minutes vs the preceding 30 minutes (median first reply, median reply time, chats waiting now, longest wait), labeled "Independent of the dashboard date filter".

### Inbox
- REQ-526 [always] The system shall show the views column headed "VIEWS" (All open, Needs human, AI handling, Mine, Unassigned, Resolved, Closed, All) and "SET ASIDE" (Spam, Trash), each with counts.
- REQ-527 [event] When the user opens Spam or Trash, the system shall list those tickets with Restore and Delete forever (confirm).
- REQ-528 [always] The system shall show a "+ New" button above the list that opens a new-ticket composer (customer email, subject, channel, message, as reply or internal note), creating a ticket at the top of the list (MOCKED).
- REQ-529 [always] The system shall show on each list row a short ticket id (e.g. #317FED) and the status pill.
- REQ-530 [always] The system shall show pagination under the list ("1–25 of 41", prev/next, page n/N).
- REQ-531 [always] The system shall show in the conversation header: subject, customer name <email> · channel · "Opened <relative>" · short id, plus the status pill, then priority select, assignee select, an "Assign me" shortcut, "⋯" (Move to spam, Move to trash, Merge… disabled hint) and a primary "Resolve" button.
- REQ-532 [state] While the latest reply was sent by AI and the ticket isn't resolved, the system shall show the banner "AI replied: Claude answered the latest customer message. No staff handoff yet. This ticket isn't resolved." (wording adapted).
- REQ-533 [always] The system shall show customer messages left (avatar, "Customer" pill, name, channel, timestamp) and AI/agent replies right in a warm tint ("Claude" / "Agent" pill, name, channel, timestamp, avatar on the right), with a delivery status line (Queued / Sent / Delivered / Bounced) that opens a delivery timeline popover (improvement over the production "Accepted by provider" log).
- REQ-534 [always] The system shall show a collapsible "Email timing" row under the header (received, first AI reply, first human reply, SLA).
- REQ-535 [always] The system shall show the composer with "Reply" / "Internal note" tabs, a "Goes to <email>" line, "Draft saved" autosave feedback, the rich text + "/" macros, and a primary "Send to customer" (or "Add note") button.
- REQ-536 [always] The system shall title the right panel "CUSTOMER & SHOPIFY" with a collapse control, and show collapsible sections: Customer feedback (this customer's CSAT history), Customer (avatar, name, email, location, Customer since, tags, 2x2 stats Orders / Lifetime spend / Avg order value / Last order, View in Shopify), Shopify orders, Loop returns.
- REQ-537 [always] The system shall give the Shopify orders section Refresh, plus "Find another order" (search by order # or email), "Check inventory by SKU" (mock stock by size) and "Lookup details" actions, each opening a small inline/sheet result.
- REQ-538 [always] The system shall give the Loop returns section a date range, a state filter select ("Open, closed and expired" etc.), Refresh, and a loading line "Looking up Loop returns…" before results.
- REQ-539 [always] The system shall show the small helper "Matched by the ticket email" under customer/orders.

### AI & Workflows (/ai)
- REQ-540 [always] The system shall render /ai with title "AI & Workflows", subtitle "How Claude sounds, decides and escalates when it replies to customers.", and tabs Brand voice (/ai/voice), AI replies (/ai/replies), Workflows (/ai/workflows), Conversation testing (/ai/testing).
- REQ-541 [always] The system shall show on Brand voice: a "Brand voice" card with a "Voice on" toggle and a Brand name input (counter /100); a "Response style" card with Tone, How to respond, Phrases to use, Phrases to avoid (each counter /2,000) and Example replies (/4,000); a sticky "Save brand voice" button enabled only when there are changes.
- REQ-542 [always] The system shall show a right rail with "Where it applies" (Test sandbox answers, Agent ticket drafts, Automatic email replies, Widget chat), "Style, never policy" bullets, and a "Hear it" card with "Test this voice" → Conversation testing using the unsaved voice (improvement).
- REQ-543 [unwanted] If a field exceeds its limit, then the system shall show the counter in red with "Keep this under <n> characters." and block save.
- REQ-544 [always] The system shall show on AI replies: confidence threshold (with zones), auto-send matrix (Email/Chat × Claude/Grokbot), auto-refunds limit, Grokbot fallback model, and the read-only system prompts. Moved from Settings → AI with the same behaviour and copy.
- REQ-545 [always] The system shall show on Workflows: escalation rules (sentence rows), business hours, and an assignment rule (round-robin / manual) (interpreted).
- REQ-546 [always] The system shall show on Conversation testing the former Guidance Test Sandbox upgraded to a multi-turn chat: pick channel (email/chat) and optional order #, type as the customer, and see Claude's reply per turn with retrieved articles + scores, a confidence gauge and the escalate verdict. Reset conversation. Respects the saved or "Test this voice" draft voice.

### Guidance
- REQ-547 [always] The system shall render Guidance with tabs Articles, Macros, Import CSV (import becomes a tab, not a modal), a "+ New article" primary button, and a link "Brand voice, workflows and testing" → /ai (admins only).
- REQ-548 [always] The system shall show the helper "Active articles guide Claude's chat replies and agent drafts. Publish customer-safe policy only."
- REQ-549 [always] The system shall show filters search titles and text, Category, Tag and an Active/Inactive/All select.
- REQ-550 [always] The system shall show articles as list rows: title, category chip + tag chips, and right-aligned "v<n> · <date time>" with the active toggle.
- REQ-551 [always] The system shall show the version in the editor header with a small version history list (version, editor, date) (interpreted).

### Channels (/channels)
- REQ-552 [always] The system shall render /channels with title "Channels", subtitle "How customers reach you: the chat widget, contact form and email.", and tabs Chat & form (/channels/chat), Email (/channels/email), Installation (/channels/install).
- REQ-553 [always] The system shall show Chat & form with sub-tabs Chat and Contact form, and each with Appearance / Preferences tabs plus a save-state indicator ("All changes saved" / "Unsaved changes").
- REQ-554 [always] The system shall show on Chat → Appearance: Branding, Launcher (icon segmented Message / Help / Hat / Custom + upload; position as a 2x2 grid Top Left / Top Right / Bottom Left / Bottom Right; horizontal/vertical edge spacing), Messaging. Chat → Preferences: Display rules, pre-chat, quick replies, CSAT in chat, customer context. The existing widget editor content is reorganized here, with the sticky live preview (desktop/mobile toggle, states).
- REQ-555 [always] The system shall show on Contact form (new, MOCKED): fields builder (name, email, order #, topic select with editable options, message, attachments on/off; required toggles; reorder), success message and button label, with a live form preview in the same preview card.
- REQ-556 [always] The system shall show on Email: connected mailbox (support@goorin.com via Outlook, status, "Manage in Integrations"), From name, Reply-to, signature editor with preview, auto-acknowledgement toggle + message, and the sending domain status (Resend SPF/DKIM summary) with "Send test email".
- REQ-557 [always] The system shall show on Installation the Shopify install content (status card, App embed steps + Open Theme Editor, script fallback, source indicator, Verify installation), plus a "Contact form" block (Shopify app block on /pages/contact).
- REQ-558 [event] When anyone opens an old route, the system shall redirect: /settings/integrations/shopify/widget → /channels/chat, …/install → /channels/install, /settings/ai → /ai/replies, /guidance?tab=sandbox → /ai/testing.
- REQ-559 [always] The system shall point the Shopify integration detail at Channels ("Customize chat widget →") instead of the sub-tabs.

### Settings
- REQ-560 [always] The system shall render Settings with title "Settings", subtitle "Technical credentials for your mailbox, store, AI providers and email. Day-to-day controls live in Channels and AI & Workflows.", and tabs Account (/settings/account), Users (/settings/users), Integrations (/settings/integrations), CSAT (/settings/csat). AI moved to AI & Workflows and the widget moved to Channels.
- REQ-560a [always] The system shall show on Account the signed-in user's profile (name, email, avatar initials), "Change password" (current/new/confirm with the same validation copy as invite), notification preferences (email me for needs-human / low CSAT / fraud alerts) and "Sign out of all devices" (MOCKED).
- REQ-560b [always] The system shall show on Integrations a "Integrations" heading + helper ("Services the desk connects to. Configured means setup is saved; Connected is the live check."), then tiles for Shopify, Claude, Grokbot, Office 365 (renamed from Outlook; mailbox support@goorin.com), Resend and Loop Returns (new), each with its real logo (Grokbot keeps a slate bot monogram), name, chevron, one-line purpose, a "Configured / Not configured" pill, "● Connected / ● Not connected / ● Error" status, and "Manage" → detail page.
- REQ-560c [state] While an integration needs attention, the system shall give its tile an amber left edge and the line "⚠ Needs attention: <reason>" (seed Office 365: "Mailbox syncing is turned off."; Grokbot: "401 Unauthorized").
- REQ-560d [always] The system shall add a Loop Returns detail page (store domain, portal URL, return policy window, webhook status, masked API key, Test connection) and rename Outlook to Office 365 across the app (Channels → Email, search, README).
- REQ-560e [always] The system shall show on Settings → CSAT the full CSAT settings (question builder with drag/keyboard reorder, send delay, channels, low-score recipients, live survey preview, save), the same behaviour as the dashboard drawer. The dashboard "CSAT settings" button now goes to /settings/csat (the drawer route ?csat=settings redirects).
- REQ-560f [always] The system shall seed the integration states so the summary reads e.g. "4 connected · 1 needs attention · 1 error" and the amber dot on Settings shows while anything needs attention.

### Quality
- REQ-561 [always] The system shall keep every moved feature's behaviour, validation copy and testids (adding new ones), keep the demo states (skeleton/empty/error) on every new tab, keep 0 overflow from 390 to 2560, 0 serious axe issues, and update the README routes/contract + styleguide.

## Quality requirements
```
Q-45 Tag: Parity.Production
     Scale: screen sections in the 5 user screenshots with no counterpart in the prototype
     Meter: side-by-side review
     Must: 0   Plan: 0
Q-46 Tag: Regression
     Scale: earlier journeys failing after the restructure (after updating routes)
     Meter: re-run prior checks
     Must: 0   Plan: 0
Q-47 Tag: Visual.Better
     Scale: reviewer judgement that each screen is cleaner/clearer than its production screenshot
     Meter: human
     Must: pass   Plan: pass
```
