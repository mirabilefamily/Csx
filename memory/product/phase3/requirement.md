# Phase 3: Guidance + Settings (Integrations, AI, Users)

- Version: phase-3
- Goal: replace the Guidance and Settings placeholders with working mock UIs. Guidance gets Articles (table + split markdown editor), Macros (list + editor), Test Sandbox and CSV import/export. Settings gets the Integrations, AI and Users tabs. The Chat Widget tab stays a placeholder until phase 5.
- Product context: [overview.md](../overview.md). Builds on phases 1–2. Feature ids: F-26 to F-32. All integrations are MOCKED (UI only).
- Supersedes JRN-14 (Guidance and Settings parts) and the Settings placeholder part of JRN-11.

## Functional requirements

### Guidance shell
- REQ-155 [always] The system shall render /guidance with tabs Articles, Macros and Test Sandbox, reflected in the URL (e.g. ?tab=macros) (interpreted).

### Articles
- REQ-156 [always] The system shall show an articles table with columns title, category, tags, active toggle and last updated.
- REQ-157 [event] When the user types in the article search, the system shall filter rows by title and body text.
- REQ-158 [event] When the user picks a category or tag filter, the system shall show only matching articles.
- REQ-159 [unwanted] If no article matches, then the system shall show "No articles match your search" with "Clear filters".
- REQ-160 [event] When the user flips an article's active toggle, the system shall update it and show "Article activated" or "Article deactivated".
- REQ-161 [event] When the user clicks an article or "New article", the system shall open a split-view editor with title, category, tags, markdown input on the left and live rendered preview on the right.
- REQ-162 [event] When the user opens /guidance?article=<id> (from global search), the system shall open that article in the editor.
- REQ-163 [event] When the user types markdown, the system shall update the preview instantly (headings, bold, lists, links).
- REQ-164 [event] When the user saves a valid article, the system shall store it and show "Article saved".
- REQ-165 [unwanted] If the title is empty on save, then the system shall show "Title is required.".
- REQ-166 [unwanted] If the body is empty on save, then the system shall show "Article body is required.".
- REQ-167 [unwanted] If the user leaves the editor with unsaved changes, then the system shall ask "Discard unsaved changes?".
- REQ-168 [state] While the editor is narrower than 1024px, the system shall switch between Write and Preview tabs instead of side-by-side panes (interpreted).

### Macros
- REQ-169 [always] The system shall list macros with name, body preview, usage count and last updated.
- REQ-170 [event] When the user opens or creates a macro, the system shall show an editor with name, body and an "Insert placeholder" menu ({{customer.first_name}}, {{order.number}}, {{order.tracking_url}}, {{order.carrier}}).
- REQ-171 [always] The system shall show a macro preview with placeholders filled with sample values.
- REQ-172 [event] When the user saves a macro, the system shall show "Macro saved" and make it available in the Inbox macros picker.
- REQ-173 [unwanted] If the macro name is empty or duplicates another macro, then the system shall show "Name is required." or "A macro with this name already exists.".
- REQ-174 [event] When the user deletes a macro, the system shall confirm "Delete <name>?" before removing it.

### Test Sandbox
- REQ-175 [always] The system shall provide a "Customer question" input and an optional "Order number" input, plus example question chips.
- REQ-176 [event] When the user clicks "Run test", the system shall show a loading state followed by results.
- REQ-177 [unwanted] If the question is empty, then the system shall show "Enter a customer question.".
- REQ-178 [always] The system shall show retrieved active articles ranked by relevance score.
- REQ-179 [always] The system shall show Claude's draft reply.
- REQ-180 [always] The system shall show a confidence gauge.
- REQ-181 [state] While the confidence is below the AI confidence threshold, the system shall show "Would escalate to Grokbot".
- REQ-182 [state] While the confidence is at or above the threshold, the system shall show "Claude would handle this".
- REQ-183 [unwanted] If no active article is relevant, then the system shall show "No relevant articles found" with low confidence.
- REQ-184 [unwanted] If the order number isn't in the mocks, then the system shall show "Order <n> not found. Testing without order context." (interpreted).
- REQ-185 [state] While an order number matches, the system shall show the order summary used as context.

### CSV import / export (articles)
- REQ-186 [event] When the user clicks "Import CSV", the system shall open a dropzone that accepts drag-and-drop or browse.
- REQ-187 [unwanted] If the file isn't .csv, then the system shall show "Only .csv files are supported.".
- REQ-188 [event] When a CSV is dropped, the system shall show a column-mapping step mapping CSV headers to title, body, category, tags and active, with a 5-row preview.
- REQ-189 [unwanted] If no column is mapped to title, then the system shall disable Import with "Map a column to Title.".
- REQ-190 [event] When the user confirms import, the system shall add the articles and show "Imported <N> articles".
- REQ-191 [unwanted] If rows lack a title, then the system shall skip them and show "<N> rows skipped (missing title)".
- REQ-192 [event] When the user clicks "Export CSV", the system shall download guidance-articles.csv with all articles. No failure mode.
- REQ-193 [always] The system shall provide a downloadable sample CSV template from the import dialog (interpreted).

### Settings shell
- REQ-194 [always] The system shall render Settings tabs Integrations, AI, Chat Widget and Users as routes /settings/integrations, /settings/ai, /settings/widget, /settings/users, with /settings redirecting to /settings/integrations.
- REQ-195 [always] The system shall keep /settings/widget as a designed "Coming in a later phase" placeholder this phase.

### Integrations
- REQ-196 [always] The system shall show one card each for Outlook, Shopify, Claude, Grokbot and Resend with a logo placeholder, status (Connected / Error / Not configured), last sync and "Test connection".
- REQ-197 [event] When the user clicks "Test connection", the system shall show a spinner then an inline result ("Connection OK · <ms>ms" or "Connection failed: <reason>").
- REQ-198 [event] When the user expands a card, the system shall show its details panel.
- REQ-199 [always] The system shall show in Outlook details the mailbox support@goorin.com, subscription status, last poll and processed folder.
- REQ-200 [always] The system shall show in Shopify details the shop domain, app embed status and a link to Chat Widget → Install (/settings/widget#install).
- REQ-201 [always] The system shall show in Claude details a model selector and a test prompt that returns a canned reply with latency.
- REQ-202 [always] The system shall show in Grokbot details a model selector and a test prompt.
- REQ-203 [always] The system shall show in Resend details the from address, an SPF/DKIM domain-verification checklist, webhook status and "Send test email".
- REQ-204 [unwanted] If the test email address is invalid, then the system shall show "Enter a valid email address.".
- REQ-205 [always] The system shall show secrets masked (e.g. "sk-ant-••••3f9a") and read-only, with the note "Set via environment variable <NAME>. Change it in your deployment environment."
- REQ-206 [always] The system shall seed at least one integration in each status: Connected, Error and Not configured (interpreted).

### AI
- REQ-207 [always] The system shall provide a confidence threshold slider (0–100%, default 75%) with the line "Replies below <n>% escalate to Grokbot".
- REQ-208 [always] The system shall provide an auto-send toggle matrix with rows Email and Chat and columns Claude and Grokbot.
- REQ-209 [always] The system shall provide a business hours editor with timezone and per-day open toggle, opening and closing times.
- REQ-210 [unwanted] If a closing time is not after its opening time, then the system shall show "Closing time must be after opening time.".
- REQ-211 [always] The system shall provide an escalation rules list where each rule has a condition, value and target (Grokbot or Human), with add and remove.
- REQ-212 [always] The system shall show the Claude and Grokbot system prompts read-only with a Copy button and "Managed in code. Read only."
- REQ-213 [state] While the AI tab has unsaved changes, the system shall show an unsaved-changes bar with Save and Discard.
- REQ-214 [event] When the user saves, the system shall show "AI settings saved" and apply the threshold to the Test Sandbox.

### Users
- REQ-215 [always] The system shall show a users table with name, email, role, status (Active / Invited / Deactivated) and last login ("Never" for invited).
- REQ-216 [event] When the user submits the invite modal with an email and role, the system shall add an Invited row and show "Invite sent to <email>".
- REQ-217 [unwanted] If the invite email is invalid or already exists, then the system shall show "Enter a valid email address." or "A user with this email already exists.".
- REQ-218 [event] When the admin changes a user's role, the system shall update the row and show "Role updated".
- REQ-219 [event] When the admin deactivates a user, the system shall confirm first, then set status Deactivated with a Reactivate action.
- REQ-220 [event] When the admin clicks "Reset password", the system shall show "Password reset email sent to <email>".
- REQ-221 [unwanted] If the admin targets their own account, then the system shall disable change role and deactivate with "You can't change your own account" (interpreted).
- REQ-222 [always] The system shall show skeleton, empty and error states for every Guidance and Settings tab via the demo state switcher.

### Inbox carry-over
- REQ-223 [state] While the viewport is 1440px, the system shall give the conversation column at least 520px so header controls fit on one line (interpreted).

## Quality requirements
```
Q-16 Tag: Performance.EditorPreview
     Scale: ms from keystroke to preview update
     Meter: browser, 5 trials on a 15-paragraph article
     Must: 200   Plan: 50
Q-17 Tag: Trust.SandboxPlausibility
     Scale: of 5 example questions (sizing, tracking, returns, damaged, wholesale), how many retrieve the obviously relevant article first
     Meter: run each
     Must: 4/5   Plan: 5/5
Q-18 Tag: Security.SecretExposure
     Scale: full secret values present anywhere in DOM or mocks
     Meter: grep + DOM inspect
     Must: 0   Plan: 0
Q-19 Tag: Trust.DataLoss
     Scale: edits lost without a warning when leaving an editor or settings tab
     Meter: try leaving each editor/tab dirty
     Must: 0   Plan: 0
Q-20 Tag: Accessibility.Keyboard
     Scale: % of guidance/settings controls (tabs, toggles, matrix, slider, dropzone browse, menus) operable by keyboard with visible focus
     Meter: manual tab-through
     Must: 100%   Plan: 100%
Q-21 Tag: Responsive.Tablet
     Scale: px horizontal overflow at 768px on each tab (tables may scroll inside their card)
     Meter: browser
     Must: 0   Plan: 0
```
