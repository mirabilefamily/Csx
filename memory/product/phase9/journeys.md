# Phase 9 Journeys

Sign in as ava@goorin.com / goorin123 (Admin) at 1440 unless stated.

### JRN-113 Shell, nav, search, roles
- steps: Look at the sidebar and top bar. Ctrl+K, type "launcher", then "brand voice". Switch to Agent. At 390 tap More.
- expected: Nav order Dashboard, Inbox (badge), divider, AI & Workflows, Guidance, Channels, with Settings at the bottom next to the collapse toggle. The header has the GOORIN wordmark + "SUPPORT DESK". The top bar search shows "Search tickets, guidance, settings..." with a Ctrl K hint, and the avatar shows "Ava Martinez" + "Admin". Search shows a Settings group ("Launcher position" → /channels/chat, "Brand voice" → /ai/voice). As Agent, AI & Workflows, Channels and Settings are hidden and their URLs show no access. At 390 the tabs are Dashboard / Inbox / Guidance / More, and More lists AI & Workflows, Channels, Settings.

### JRN-114 Dashboard additions
- steps: Read the header, switch to Last 24 hours, read the KPI captions, the chart legend, the Refunds/Fraud panel headers, and Chat reply timing. Mark a fraud alert safe with a note.
- expected: Subtitle "How the desk is doing, <dates>." Range options Last 24 hours / 7d / 30d / 90d / Custom. KPI captions show "vs prior …" or "No prior data" / "Current snapshot". Chart "New tickets by channel" with Email/Chat totals. Panel meta subtitles + count badges, and the fraud helper "Risk flags are signals, not proof of fraud." The review note dialog appears, then "Marked safe". Chat reply timing shows 4 metrics with "Independent of the dashboard date filter".

### JRN-115 Inbox list: views, set-aside, new ticket, pagination
- steps: Check VIEWS and SET ASIDE. Open All, then Trash, restore a ticket. Click + New, create a ticket. Page through the list.
- expected: VIEWS has All open…All with counts and SET ASIDE has Spam, Trash. Restore moves the ticket back and Delete forever confirms. + New creates a ticket at the top and opens it. Rows show a short id (#XXXXXX). The pagination footer shows "1–25 of N" with prev/next.

### JRN-116 Inbox conversation
- steps: Open a ticket where Claude replied last. Read the header, expand Email timing, open a reply's delivery status. Click Assign me, then Resolve. In the composer switch Reply/Internal note, type, and watch "Draft saved". Send.
- expected: Header shows subject, name <email> · channel · Opened … · #id, status pill, priority, assignee, Assign me, ⋯, Resolve. The AI replied banner shows. Customer messages are left, Claude replies right with a warm tint and a delivery line + timeline popover. Assign me sets Ava. Resolve resolves with a system message. The composer has the tabs, "Goes to <email>", "Draft saved", and "Send to customer" / "Add note".

### JRN-117 Customer & Shopify panel tools
- steps: In the right panel expand Customer feedback, then Shopify orders → Refresh, Find another order (#GB20398), Check inventory by SKU, Lookup details. In Loop returns change the state filter and Refresh.
- expected: The header reads "CUSTOMER & SHOPIFY" with collapse. Customer feedback lists this customer's CSAT. Customer shows the 2x2 stats and View in Shopify, with "Matched by the ticket email". Each order tool shows an inline result (order found / stock by size / details). Loop shows "Looking up Loop returns…" then the filtered returns.

### JRN-118 AI & Workflows
- steps: Open AI & Workflows → Brand voice. Edit Tone, push it past 2,000 characters, fix it, Save brand voice. Click "Test this voice". Open AI replies, Workflows, Conversation testing, and run a 3-turn conversation with order #GB20398. Open /settings/ai and /guidance?tab=sandbox.
- expected: Tabs Brand voice / AI replies / Workflows / Conversation testing. Brand voice has the Voice on toggle, brand name (/100), the five style fields with counters, the right rail cards, and the sticky Save enabled only when dirty. Over-limit shows the red counter + "Keep this under 2,000 characters." and blocks save. Save shows a toast. Test this voice opens testing with the voice applied. AI replies holds the threshold/matrix/auto-refunds/prompts (same copy as before). Workflows holds rules, business hours, assignment. Testing shows per-turn replies with articles, scores, gauge and verdict. The old URLs redirect.

### JRN-119 Guidance
- steps: Open Guidance. Check tabs, helper, filters, rows. Open an article, see its version + history. Open Import CSV tab.
- expected: Tabs Articles / Macros / Import CSV, "+ New article", the link to AI & Workflows, the helper text, filters (search, Category, Tag, Active select). Rows show title, category + tag chips, "v<n> · date", active toggle. The editor shows the version + history. Import works as a tab (dropzone, mapping, import).

### JRN-120 Channels
- steps: Open Channels → Chat & form → Chat → Appearance. Change the primary colour, launcher icon to Help, position Top Left, spacing 24/24. Switch to Preferences. Switch to Contact form, add a topic option, toggle order # required. Open Email, edit the signature, Send test email. Open Installation, Verify installation. Open the old /settings/integrations/shopify/widget.
- expected: Tabs Chat & form / Email / Installation. Sub-tabs Chat / Contact form, inner Appearance / Preferences, and the save indicator flips to "Unsaved changes" then "All changes saved" after Save. The live preview (desktop/mobile) reflects colour, icon and position instantly. Contact form shows a live form preview with the new topic and the required marker. Email shows the mailbox, From name, Reply-to, signature preview, auto-ack, domain status, test send. Installation has the Shopify status, App embed steps, script, Verify "Widget detected…", and the Contact form block. The old URL redirects to /channels/chat.

### JRN-121 Settings + phone + regression
- steps: Open Settings. Check the subtitle and the tabs Account / Users / Integrations / CSAT. On Integrations read each tile, open Office 365 and Loop Returns detail. On Account change password with a mismatch, then validly. On CSAT reorder a question and Save. From the Dashboard click "CSAT settings". At 390 visit each new page. Re-run earlier journeys with updated routes.
- expected: The subtitle mentions Channels and AI & Workflows. The tiles show real logos (Shopify, Claude, Office 365, Resend, Loop; Grokbot monogram), purpose, Configured pill, Connected/Not connected/Error status, Manage. Office 365 has an amber edge with "Needs attention: Mailbox syncing is turned off." Detail pages open, and Loop's has store/portal/window/webhook/key/Test connection. A password mismatch shows "Passwords don't match.", then a success toast. The CSAT tab saves with "CSAT settings saved", and the dashboard button lands on /settings/csat. The Shopify detail links to Channels. Phone layouts follow the phase-7 rules with no overflow. Earlier behaviour holds.
