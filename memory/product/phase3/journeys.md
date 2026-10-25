# Phase 3 Journeys

Sign in as ava@goorin.com / goorin123 (Admin). Data resets on reload.

### JRN-45 Articles table, search, filters, active toggle
- superseded: [JRN-14] (Guidance and Settings placeholders are replaced. The 404 part still holds)
- steps: Open Guidance. Search "sizing". Pick a category filter, then a tag filter. Search "zzqx", then Clear filters. Flip an article's active toggle.
- expected: Table shows title, category, tags, active toggle, last updated for 15 articles. Search and filters narrow rows. "zzqx" shows "No articles match your search". The toggle shows "Article deactivated"/"Article activated". Tabs Articles, Macros, Test Sandbox are present, and the URL reflects the tab.

### JRN-46 Article editor
- steps: Open an article. Type "## Care" and a bullet list in the markdown pane. Change the category and add a tag. Save. Then create a New article with an empty title and body, Save.
- expected: Markdown is on the left, live preview on the right, and the preview renders the heading and bullets instantly. Save shows "Article saved" and the table shows the new category/tag and updated date. The empty new article shows "Title is required." and "Article body is required.".

### JRN-47 Editor unsaved guard + search deep link
- steps: Edit an article without saving and click the Macros tab. Then, from global search, pick an article result.
- expected: "Discard unsaved changes?" appears. Search opens /guidance?article=<id> with that article in the editor.

### JRN-48 Macros list and editor
- steps: Open Macros. Open "Share tracking", insert {{order.tracking_url}} from the menu, Save. Create a macro with an empty name, then with the name "Warm greeting". Create "Sizing follow-up" and save. Go to Inbox, type "/" in a composer. Delete "Sizing follow-up".
- expected: The list shows 8 macros with name, preview, usage, last updated. The preview shows sample values filled. Errors read "Name is required." and "A macro with this name already exists.". "Macro saved" toast. "Sizing follow-up" appears in the Inbox picker. Delete asks "Delete Sizing follow-up?".

### JRN-49 Test Sandbox
- steps: Open Test Sandbox. Run empty. Click a sizing example chip, Run. Run a wholesale question. Run "zzqx gibberish". Run with order number "99999".
- expected: Empty shows "Enter a customer question.". Results show loading, then ranked articles with relevance scores (sizing article first), Claude draft reply, confidence gauge, and "Claude would handle this" or "Would escalate to Grokbot" based on the 75% threshold. Gibberish shows "No relevant articles found" with low confidence and the escalate indicator. A bad order shows "Order 99999 not found. Testing without order context." A valid seeded order number shows its order summary. (interpreted)

### JRN-50 Sandbox respects threshold and inactive articles
- steps: In Settings → AI set the threshold to 95%, Save. Rerun a high-confidence sandbox question. Deactivate the top-ranked article, rerun.
- expected: With 95% the same question now shows "Would escalate to Grokbot". The deactivated article no longer appears in retrieved articles.

### JRN-51 CSV import and export
- steps: Click Import CSV, drop a .txt file. Download the sample template, drop a CSV with 3 rows (one missing title). Unmap Title, then map it back. Import. Click Export CSV.
- expected: .txt shows "Only .csv files are supported.". Mapping shows CSV headers to Title/Body/Category/Tags/Active with a 5-row preview. Unmapped title disables Import with "Map a column to Title.". Import shows "Imported 2 articles" and "1 rows skipped (missing title)", and the table grows by 2. Export downloads guidance-articles.csv.

### JRN-52 Settings tabs and routes
- superseded: [JRN-11] (the Settings placeholder part only. The agent no-access behaviour is unchanged)
- steps: As Admin open Settings. Click each tab. Switch role to Agent and open /settings/users.
- expected: /settings goes to /settings/integrations. The Integrations, AI, Chat Widget, Users tabs change the URL. Chat Widget shows a designed "Coming in a later phase" placeholder. As Agent: "You don't have access to Settings".

### JRN-53 Integration cards
- steps: View all 5 cards. Click Test connection on a Connected card and on the Error card. Expand each card.
- expected: Outlook, Shopify, Claude, Grokbot, Resend each show a logo placeholder, status, last sync. At least one Connected, one Error, one Not configured. Tests show a spinner then "Connection OK · <n>ms" or "Connection failed: <reason>". Outlook details: support@goorin.com, subscription status, last poll, processed folder. Shopify: shop domain, app embed status, link to Chat Widget → Install.

### JRN-54 AI provider + Resend details, masked secrets
- steps: In Claude pick a different model, enter a test prompt, run. Same for Grokbot. In Resend read the checklist, send a test email to "bad", then to ava@goorin.com. Try to edit or reveal a secret.
- expected: Model selectors list mock models (e.g. claude-sonnet-5-5 / grok-4.7). Test prompts return a canned reply with latency, or an error for the Error integration. Resend shows the from address, SPF and DKIM checklist items with status, and webhook status. "bad" shows "Enter a valid email address.", and the valid address shows a sent confirmation. Secrets are masked, read-only, with "Set via environment variable <NAME>…". The full value isn't present in the DOM.

### JRN-55 AI settings
- steps: Move the threshold slider. Toggle Chat × Claude auto-send. Set Saturday closed, set Monday closing before opening. Add an escalation rule, remove one. Copy the system prompt. Click Discard, then redo a change and Save.
- expected: The line "Replies below <n>% escalate to Grokbot" tracks the slider. The matrix has Email/Chat × Claude/Grokbot toggles. A bad hours entry shows "Closing time must be after opening time.". Rules add and remove with condition, value, target. Prompts are read-only with "Managed in code. Read only." and Copy. The unsaved bar appears on change. Discard reverts, and Save shows "AI settings saved".

### JRN-56 Users management
- steps: View Users. Invite "bad", then "sam@goorin.com" (existing), then "lee@goorin.com" as Agent. Change Sam's role to Admin. Deactivate Sam (confirm), then Reactivate. Reset Priya's password. Open the actions for Ava (self).
- expected: Table shows Ava, Sam, Priya with name, email, role, status, last login (Priya "Never"). Errors read "Enter a valid email address." and "A user with this email already exists.". "Invite sent to lee@goorin.com" and a new Invited row appear. "Role updated". The deactivate confirm leads to Deactivated with Reactivate. "Password reset email sent to <Priya's email>". Ava's own role and deactivate actions are disabled with "You can't change your own account" (interpreted).

### JRN-57 States + keyboard + tablet for Guidance & Settings
- steps: On each Guidance and Settings tab use the demo switcher (Loading, Empty, Error → Try again). Tab through the AI tab controls. View every tab at 768px.
- expected: Each tab has skeleton, designed empty, and error-with-retry states. Slider, matrix toggles, time inputs and menus are keyboard operable with a visible focus ring. At 768px there's no page-level horizontal scroll, and the article editor switches to Write/Preview tabs.

### JRN-58 Inbox conversation width (carry-over)
- steps: Open /inbox/GB-1076 at 1440x900.
- expected: The conversation column is at least 520px wide, and the status/priority/assignee header controls sit on one line. (interpreted)
