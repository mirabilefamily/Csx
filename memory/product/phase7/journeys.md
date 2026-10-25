# Phase 7 Journeys (phones)

Viewport 390x844 unless stated. Also sweep at 360x640 and 430x932. Sign in as ava@goorin.com / goorin123.

### JRN-96 Phone shell: bottom tabs, top bar, sheets
- steps: Sign in. Look at the bottom and top bars. Tap each tab. Tap search, type "Margaret", close. Tap the bell. Tap the avatar, switch to Agent, then back to Admin.
- expected: No sidebar. A bottom tab bar with Dashboard, Inbox (badge 7), Guidance, Settings, clear of the home-bar safe area. The active tab is highlighted with a brass indicator. Compact top bar: castle mark, title, search, bell, avatar. Full-screen search shows grouped results for Margaret. The bell opens a bottom sheet listing the 7 tickets. The avatar sheet has the role toggle and Sign out. As Agent the Settings tab disappears.

### JRN-97 Dashboard on a phone
- steps: Open Dashboard. Scroll the range control and pick 7d, then Custom. Scroll the page. Tap a chart point. Switch the CSAT tabs. Open CSAT settings, reorder with the up/down buttons, Save.
- expected: KPIs show as a 2-column grid of 7 tiles with value, delta chip and sparkline. Values change with the range. Custom opens a full-screen date sheet. Charts are full width with readable labels and tap tooltips. CSAT is stacked with working tabs. CSAT settings opens full screen with a sticky Save, reorder works, and the toast "CSAT settings saved" shows above the tab bar. No horizontal overflow.

### JRN-98 Inbox list on a phone
- steps: Open Inbox. Scroll the view chips and tap Needs human. Open Filters, choose chat, Apply, then Clear. Tap Select, pick 2 rows, Assign to Sam Okafor.
- expected: The chip row shows counts (Needs human 7). Rows are compact and ≥56px tall. Filters open in a bottom sheet with Apply/Clear. Selection mode shows checkboxes and a bulk bar above the tab bar. The toast reads "2 tickets assigned to Sam Okafor".

### JRN-99 Conversation on a phone
- steps: Open GB-1076. Tap ⋯ and change priority to Urgent. Tap Details, scroll, close. Tap an escalation step. Approve the Claude draft. Type a reply with the keyboard open and Send. Toggle note mode, add a note. Tap Back.
- expected: A full-screen conversation with Back, customer name and status pill, and the tab bar hidden. The ⋯ sheet holds status/priority/assignee, and the change adds a System message. The Details sheet has the customer card, orders with tracking link, past tickets and the AI log. The escalation step shows its reason on tap. The draft actions are full-width buttons, and Approve gives "Approved by Ava Martinez". The composer stays docked above the keyboard/safe area and Send is reachable. The note is yellow. Back returns to the list with the tab bar visible again.

### JRN-100 Guidance on a phone
- steps: Open Guidance. Search "sizing" in Articles, toggle one inactive, open an article, edit in Write, check Preview, Save. Open Macros, open one. Open Sandbox, run the sizing example. Open Import CSV.
- expected: Articles and macros appear as cards with the active toggle and updated date. The editor is full screen with Write/Preview tabs and a sticky Save ("Article saved"). The sandbox is stacked with scores, draft, gauge and verdict. The import dialog is full screen with stacked mapping rows.

### JRN-101 Settings on a phone
- steps: Open Settings. Scroll the tab bar. In Integrations, expand Grokbot and Test connection. In AI, move the slider, set Saturday closed, Save. In Users, open Sam's actions sheet and change his role. In Chat Widget, change the header title, tap Preview, switch state to Active chat, close, Save.
- expected: The tab bar scrolls horizontally. Integration cards are stacked and the Grokbot callout is visible. AI sections and hour rows are stacked, and "AI settings saved" shows. Users is a card list with an actions sheet and "Role updated". Chat Widget is one column; the Preview button opens a full-screen live preview showing the new title. The unsaved bar sits above the tab bar, and Save shows "Widget settings saved".

### JRN-102 Phone-wide quality sweep
- steps: At 360, 390 and 430, visit every signed-in route plus /styleguide and /widget-demo/theme-editor. Run axe at 390. Measure tap targets.
- expected: Zero horizontal overflow. No interactive element under 44x44 (inline text links excluded). Inputs use ≥16px font. Toasts and bars never cover the tab bar or composer. 0 serious/critical axe issues. No keyboard-shortcut hints on touch.

### JRN-103 Desktop and tablet unchanged
- steps: At 1440 and 768, spot-check the sidebar collapse/expand, the Inbox 3-pane / single-pane, the dashboard, Settings → Chat Widget two-column, and the CSAT drawer.
- expected: Same layouts and behaviour as before phase 7, and the earlier journeys still pass.

### JRN-104 Integrations tiles → detail pages (user request)
- superseded: [JRN-53] (cards are no longer expandable; details move to detail pages) and the Integrations part of [JRN-90]
- steps: At 1440 open Settings → Integrations. Click the Grokbot tile. Test connection. Change the model, click Integrations (back) and choose Keep editing, then Save. Back to tiles. Open Claude and run a test prompt. Open Resend and send a test email to "bad" then ava@goorin.com. Open Shopify and click the Chat Widget → Install link. Open /settings/integrations/nope. Tab to a tile and press Enter. Repeat the tiles + Grokbot detail at 390.
- expected: Summary "3 connected · 1 error · 1 not configured" above a 3-column tile grid. Each tile has a logo, name, purpose, status pill, last sync. Grokbot is red-edged with "401 Unauthorized" and Resend slate-edged. A click or Enter opens /settings/integrations/grokbot with back link, header, Test connection result "Connection failed: …", error callout, Connection details, Configuration (model selector, test prompt), and masked Credentials with the env var note. A model change shows the unsaved bar. Leaving asks "Discard unsaved changes?". Save shows "Grokbot settings saved" and the tile shows the new model. Claude's test prompt returns a canned reply with latency. Resend shows the SPF/DKIM checklist, rejects "bad" with "Enter a valid email address." and confirms the valid send. The Shopify link lands on /settings/widget#install. An unknown id shows "Integration not found". At 390 tiles are 1 column and the detail page has a sticky header with no overflow.
