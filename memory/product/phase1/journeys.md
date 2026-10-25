# Phase 1 Journeys

Sign-in for all gated journeys: any valid email + any non-empty password (e.g. ava@goorin.com / goorin123). Signed-in user is Ava Martinez (Admin by default).

### JRN-1 Gate redirects to login
- steps: In a fresh session, open /dashboard.
- expected: URL becomes /login. Email field, password field, "Sign in" button and "Forgot password?" link are visible.

### JRN-2 Successful sign-in
- steps: On /login enter ava@goorin.com and goorin123, click Sign in.
- expected: URL becomes /dashboard. The page title "Dashboard" renders in Fraunces. User menu shows "Ava Martinez".

### JRN-3 Wrong credentials error
- steps: On /login enter error@goorin.com and any password, click Sign in.
- expected: "Incorrect email or password." is shown, URL stays /login. (interpreted)

### JRN-4 Login field validation
- steps: (a) Enter "ava@" with a password and submit. (b) Enter a valid email with an empty password and submit.
- expected: (a) "Enter a valid email address." under email. (b) "Enter your password." under password. No navigation.

### JRN-5 Forgot password
- steps: Click "Forgot password?", enter ava@goorin.com, submit. Then go back. Then retry with "nope".
- expected: "If an account exists for ava@goorin.com, we've sent a reset link." is shown with a way back to sign in. The invalid email shows "Enter a valid email address.".

### JRN-6 Accept invite
- steps: Open /login?invite=demo-invite. Enter a name and mismatched passwords, submit. Then enter "short" twice, submit. Then enter matching 8+ char passwords, submit.
- expected: Invite variant shows name, password and confirm-password fields. Mismatch shows "Passwords don't match.". Short shows "Use at least 8 characters." (interpreted). Valid submit lands on /dashboard signed in.

### JRN-7 Expired invite
- steps: Open /login?invite=expired.
- expected: "This invite has expired" state with a "Back to sign in" link that returns to the normal sign-in form. (interpreted)

### JRN-8 Session survives reload, data resets
- steps: Sign in, open CSAT settings, change send delay, Save. Reload the page.
- expected: Still signed in on /dashboard (interpreted). The CSAT send delay is back to its original mock value.

### JRN-9 Sign out
- steps: Open user menu, click "Sign out", then open /dashboard.
- expected: Lands on /login, and /dashboard redirects to /login again.

### JRN-10 Sidebar and needs-human badge
- steps: Sign in and look at the sidebar. Click the collapse control, hover an icon, click it again.
- expected: "Goorin Bros." wordmark, Dashboard, Inbox, Guidance, Settings are shown. Inbox badge shows the count of needs_human tickets (same number as the bell). Collapsed state shows icons only with tooltips. Expand restores labels.

### JRN-11 Role toggle hides Settings
- steps: Open user menu, switch role to Agent. Look at the sidebar. Open /settings by URL. Switch back to Admin.
- expected: As Agent, Settings is gone from the sidebar and /settings shows "You don't have access to Settings" with a link to Dashboard. As Admin, Settings reappears and /settings shows the placeholder page.

### JRN-12 Notification bell
- steps: Click the bell, click the first item.
- expected: The panel lists each needs_human ticket with customer name, subject and relative time. The count matches the Inbox badge. Clicking navigates to /inbox/<ticketId> (placeholder page in this phase).

### JRN-13 Global search
- steps: Press Ctrl+K (or ⌘K), type a customer first name from the mocks, then type "sizing", then type "zzqx". Press Esc.
- expected: Ctrl+K focuses search. Results are grouped under Tickets, Customers, Articles. "sizing" returns at least one ticket and one article. "zzqx" shows "No results for "zzqx"". Esc closes the results. Picking a ticket result navigates to /inbox/<id>.

### JRN-14 Placeholders and 404
- steps: Click Inbox, Guidance, Settings in the sidebar. Open /does-not-exist.
- expected: Each nav route shows a designed "Coming in a later phase" page inside the shell (interpreted). Unknown route shows a designed 404 with a link back to Dashboard.

### JRN-15 Date range and KPI cards
- steps: On /dashboard note KPI values (default 30d). Switch to 7d, then 90d, then Today. Open Custom.
- expected: Seven KPI cards: Open tickets, Tickets created, AI resolution rate, First response time, Resolution time, CSAT average, CSAT response rate. Each shows a value in Fraunces and a delta like "vs prior 30 days". Values and delta labels change with each range. In Custom, dates older than 90 days are disabled.

### JRN-16 Delta coloring logic
- steps: Look across KPI deltas for First response time / Resolution time vs CSAT average.
- expected: A decrease in a time metric shows green (improvement). A decrease in CSAT average or AI resolution rate shows red. Each delta carries an arrow and is not distinguished by color alone.

### JRN-17 Dashboard charts
- steps: Scroll the dashboard at 30d.
- expected: "Volume by channel" shows email vs chat. "Resolved by" shows Claude, Grokbot, Human. "Escalation reasons" is a horizontal bar chart. "Top tags" chart is present. Chart colors come from the Goorin palette with no blue default, and no labels are clipped.

### JRN-18 CSAT section
- steps: Scroll to the CSAT section. Click a comment in the latest comments feed.
- expected: Score trend line, 1–5 distribution, split by channel, split by resolver (Claude / Grokbot / Human) are shown. The comments feed shows score, comment, customer, time. The low-score list shows only scores ≤2, each flagged "Needs follow-up". Clicking a comment navigates to /inbox/<ticketId>.

### JRN-19 CSAT drawer: question builder
- steps: Click "CSAT settings". Drag the second question above the first. Use keyboard reorder controls to move a question down. Add a Text question, add a Choice question with one option, clear a question's text, click Save.
- expected: The drawer opens from the right. Order changes after the drag and after the keyboard move, and the live preview reflects the new order instantly. Save is blocked with "Question text is required." and "Add at least 2 options." (interpreted). The delete control is disabled when only one question remains (interpreted).

### JRN-20 CSAT drawer: delivery settings and save
- steps: Change send delay. Turn both Email and Inline chat off. Add recipient "bad-email", then "lead@goorin.com". Fix validation and Save.
- expected: With both channels off, "Surveys are paused on all channels." is shown. "bad-email" shows "Enter a valid email address.". "lead@goorin.com" appears as a removable chip. Save shows toast "CSAT settings saved". Reopening the drawer shows the saved values.

### JRN-21 CSAT drawer: discard guard
- steps: Open the drawer, change any field, press Esc (or click close).
- expected: "Discard unsaved changes?" dialog with Discard and Keep editing. Keep editing keeps the drawer open with changes. Discard closes it and reverts. (interpreted)

### JRN-22 Demo state switcher
- steps: On /dashboard open the floating "Demo state" switcher, pick Loading, then Empty, then Error, click "Try again", then Live.
- expected: Loading shows skeletons for KPIs and charts. Empty shows designed empty states ("No data for this period"). Error shows an error state with "Try again". Live restores data. The switcher is also present on /login, placeholders and /styleguide.

### JRN-23 Keyboard and focus
- steps: Using only Tab/Shift+Tab/Enter/Esc: sign in, open user menu, toggle role, open bell, change date range, open and close CSAT drawer.
- expected: Every control is reachable with a visible focus ring. Menus and the drawer trap focus while open and close on Esc, with focus returning to the trigger.

### JRN-24 Tablet layout
- steps: Set viewport to 768x1024, view /login and /dashboard.
- expected: No horizontal scroll. Sidebar starts collapsed (interpreted). KPI cards and charts reflow to fewer columns with readable labels.

### JRN-25 Styleguide foundations
- steps: Open /styleguide in a signed-out session.
- expected: The page loads without sign-in (interpreted) and shows color tokens with hex values, type scale (Fraunces titles, Inter body), buttons, inputs, all 5 author badges (Customer, Claude, Grokbot, Agent, System), all 6 status pills (open, ai_handling, grok_handling, needs_human amber, resolved, closed), cards, a table and empty states.

### JRN-26 Portable code and API layer
- steps: Inspect the frontend source.
- expected: Vite + TypeScript project. Tokens in /src/theme are wired into the Tailwind config. Mocks live in /src/mocks with the listed types. No file in /src/components or /src/pages imports /src/mocks. No Emergent package in package.json. ~40 tickets spanning all 6 statuses and both channels, 15 articles, 8 macros, 3 users, 90 days of metrics.
