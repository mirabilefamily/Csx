# Phase 1: Foundation + Dashboard

- Version: phase-1
- Goal: a portable React + TS + Vite prototype with Goorin design tokens, gated mock login, app shell with role preview, global search and bell, a typed mock API layer, a fully working Dashboard with the CSAT section and CSAT Settings drawer, and /styleguide foundations.
- Product context: see [overview.md](../overview.md) (personas, UI/UX rules, mocked integrations, seed data, edge cases).
- Feature ids: F-1 to F-18.

## Functional requirements

### Project, tokens, API layer
- REQ-1 [always] The system shall be a React + TypeScript + Vite app using Tailwind, shadcn/ui, lucide-react and Recharts, with no Emergent-specific library imported anywhere.
- REQ-2 [always] The system shall keep reusable components in /src/components and one page per route in /src/pages.
- REQ-3 [always] The system shall define design tokens in /src/theme and expose them through the Tailwind config (background #FAF8F5, surface white, text #1F1D1A, primary #6B4F3A, accent #B08D57, status green/amber/red/slate, 10px radius, 8px spacing base).
- REQ-4 [always] The system shall render page titles and KPI numbers in Fraunces.
- REQ-5 [always] The system shall render all other text in Inter.
- REQ-6 [always] The system shall render in light mode only.
- REQ-7 [always] The system shall store all data as typed mock JSON/TS in /src/mocks, with types for Ticket {id, channel, status, priority, tags, assignee, resolvedBy, customer, createdAt, updatedAt}, Message {id, ticketId, authorType, body, createdAt, isInternal}, AIAttempt {tier, model, confidence, outcome, reason, guidanceIds, latencyMs}, GuidanceArticle, Macro, CsatSurvey, CsatQuestion, User.
- REQ-8 [always] The system shall route every data read and write through a single async /src/api layer that returns mock data after a simulated latency.
- REQ-9 [always] The system shall never import /src/mocks from any component or page.
- REQ-10 [always] The system shall reset all mock data to its original values on page reload.
- REQ-11 [always] The system shall generate all mock timestamps relative to the current date (interpreted).

### Seed data
- REQ-12 [always] The system shall seed about 40 tickets covering all six statuses (open, ai_handling, grok_handling, needs_human, resolved, closed) and both channels (email, chat).
- REQ-13 [always] The system shall seed ticket scenarios covering sizing, order status, returns, damaged items, custom orders and wholesale inquiries.
- REQ-14 [always] The system shall seed resolved tickets with a mix of resolvedBy values claude, grokbot and human.
- REQ-15 [always] The system shall seed 15 guidance articles, 8 macros and 3 users (Ava Martinez Admin active ava@goorin.com, Sam Okafor Agent active, Priya Shah Agent invited).
- REQ-16 [always] The system shall seed 90 days of daily dashboard metrics.
- REQ-17 [always] The system shall seed CSAT responses with comments, including responses scored 2 or lower.

### Shared components
- REQ-18 [always] The system shall provide one AuthorBadge component with variants Customer (neutral), Claude (brass), Grokbot (slate), Agent (brown) and System (gray).
- REQ-19 [always] The system shall provide one StatusPill component with variants open, ai_handling, grok_handling, needs_human, resolved and closed.
- REQ-20 [always] The system shall render needs_human in a high-visibility amber pill.
- REQ-21 [always] The system shall provide reusable skeleton, empty-state and error-state components.

### Demo state switcher
- REQ-22 [always] The system shall show a floating "Demo state" switcher with options Live, Loading, Empty and Error on every page.
- REQ-23 [event] When the reviewer picks Loading, the system shall show the current page's skeleton state.
- REQ-24 [event] When the reviewer picks Empty, the system shall show the current page's designed empty state.
- REQ-25 [event] When the reviewer picks Error, the system shall show the current page's error state with a "Try again" button.
- REQ-26 [event] When the reviewer picks Live after another state, the system shall show the page with mock data again. No failure mode.
- REQ-27 [state] While the app runs as a production build without VITE_DEMO_TOOLS=true, the system shall hide the demo state switcher (interpreted).

### Login (/login)
- REQ-28 [event] When an unauthenticated user opens any app route, the system shall redirect to /login.
- REQ-29 [event] When the user submits a valid email and a non-empty password, the system shall sign them in as Ava Martinez.
- REQ-30 [event] When sign-in succeeds, the system shall navigate to /dashboard.
- REQ-31 [unwanted] If the email is error@goorin.com, then the system shall show "Incorrect email or password." (interpreted).
- REQ-32 [unwanted] If the email is not a valid address, then the system shall show "Enter a valid email address." under the email field.
- REQ-33 [unwanted] If the password is empty, then the system shall show "Enter your password." under the password field.
- REQ-34 [event] When the user clicks "Forgot password?" and submits an email, the system shall show "If an account exists for <email>, we've sent a reset link."
- REQ-35 [unwanted] If the forgot-password email is invalid, then the system shall show "Enter a valid email address.".
- REQ-36 [event] When the user opens /login?invite=<token>, the system shall show the accept-invite variant with name, password and confirm-password fields.
- REQ-37 [event] When the invitee submits matching passwords of 8+ characters, the system shall sign them in and navigate to /dashboard.
- REQ-38 [unwanted] If the invite passwords differ, then the system shall show "Passwords don't match.".
- REQ-39 [unwanted] If the invite password is shorter than 8 characters, then the system shall show "Use at least 8 characters." (interpreted).
- REQ-40 [unwanted] If the invite token is "expired", then the system shall show "This invite has expired" with a "Back to sign in" link (interpreted).
- REQ-41 [state] While signed in, the system shall keep the session and selected role across page reloads (interpreted).
- REQ-42 [event] When the user clicks "Sign out" in the user menu, the system shall return to /login. No failure mode.

### App shell
- REQ-43 [always] The system shall show a left sidebar with the text wordmark "Goorin Bros." and nav items Dashboard, Inbox, Guidance and Settings.
- REQ-44 [always] The system shall show on the Inbox nav item a badge equal to the count of needs_human tickets.
- REQ-45 [event] When the user clicks the sidebar collapse control, the system shall collapse the sidebar to icons only with tooltips. No failure mode.
- REQ-46 [state] While the viewport is below 1024px, the system shall start with the sidebar collapsed (interpreted).
- REQ-47 [always] The system shall show a top bar with global search, a notification bell and a user menu.
- REQ-48 [event] When the user opens the user menu, the system shall show the user's name, a role toggle (Admin / Agent) and "Sign out".
- REQ-49 [state] While the role is Agent, the system shall hide Settings from the sidebar.
- REQ-50 [unwanted] If an Agent opens /settings by URL, then the system shall show "You don't have access to Settings" with a link back to Dashboard.
- REQ-51 [event] When the user opens the bell, the system shall list every needs_human ticket with customer name, subject and relative time.
- REQ-52 [event] When the user clicks a bell item, the system shall navigate to /inbox/<ticketId>.
- REQ-53 [state] While there are no needs_human tickets, the system shall show "You're all caught up" in the bell panel.
- REQ-54 [event] When the user types in global search, the system shall show matching results grouped as Tickets, Customers and Articles.
- REQ-55 [event] When the user presses ⌘K or Ctrl+K, the system shall focus global search.
- REQ-56 [unwanted] If no result matches, then the system shall show "No results for "<query>"".
- REQ-57 [event] When the user picks a search result, the system shall navigate to that ticket (/inbox/<id>), customer's latest ticket, or article (/guidance?article=<id>) (interpreted).
- REQ-58 [always] The system shall render /inbox, /inbox/:ticketId, /guidance and /settings as designed "Coming in a later phase" placeholder pages within the shell for this phase (interpreted).
- REQ-59 [unwanted] If the user opens an unknown route, then the system shall show a designed 404 page with a link to Dashboard.

### Dashboard (/dashboard)
- REQ-60 [always] The system shall show a date-range picker with options Today, 7d, 30d, 90d and Custom, defaulting to 30d (interpreted).
- REQ-61 [event] When the user changes the date range, the system shall recompute every KPI, chart and CSAT widget for that range.
- REQ-62 [unwanted] If the user picks custom dates outside the last 90 days, then the system shall disable those dates in the calendar.
- REQ-63 [always] The system shall show seven KPI cards: Open tickets, Tickets created, AI resolution rate, First response time, Resolution time, CSAT average and CSAT response rate.
- REQ-64 [always] The system shall show on each KPI card a delta vs the prior period of equal length (e.g. "▲ 12% vs prior 30 days").
- REQ-65 [always] The system shall color a delta green when it is an improvement and red when it is a regression, treating lower first response and resolution times as improvements.
- REQ-66 [always] The system shall show a "Volume by channel" chart comparing email and chat.
- REQ-67 [always] The system shall show a "Resolved by" split chart for Claude, Grokbot and Human.
- REQ-68 [always] The system shall show an "Escalation reasons" horizontal bar chart.
- REQ-69 [always] The system shall show a "Top tags" chart.
- REQ-70 [always] The system shall show a CSAT score trend line chart.
- REQ-71 [always] The system shall show a CSAT 1–5 score distribution.
- REQ-72 [always] The system shall show CSAT split by channel.
- REQ-73 [always] The system shall show CSAT split by resolver (Claude, Grokbot, Human).
- REQ-74 [always] The system shall show a latest CSAT comments feed where each comment links to /inbox/<ticketId>.
- REQ-75 [always] The system shall show a low-score list of responses scored 2 or lower, each with a "Needs follow-up" flag.
- REQ-76 [state] While a chart has no data for the selected range, the system shall show that chart's empty state "No data for this period".

### CSAT Settings drawer
- REQ-77 [event] When the user clicks "CSAT settings" in the CSAT section, the system shall open a right-side drawer.
- REQ-78 [always] The system shall list survey questions in the drawer, each with type rating, text or choice.
- REQ-79 [event] When the user drags a question to a new position, the system shall reorder the list.
- REQ-80 [event] When the user moves a question with the keyboard reorder controls, the system shall reorder the list.
- REQ-81 [event] When the user adds a question and picks a type, the system shall append a question of that type.
- REQ-82 [unwanted] If a question's label is empty on save, then the system shall show "Question text is required." on that question.
- REQ-83 [unwanted] If a choice question has fewer than 2 options on save, then the system shall show "Add at least 2 options." (interpreted).
- REQ-84 [event] When the user deletes a question, the system shall remove it from the list.
- REQ-85 [unwanted] If the user tries to delete the last remaining question, then the system shall disable the delete control (interpreted).
- REQ-86 [always] The system shall provide a send-delay input in minutes or hours.
- REQ-87 [always] The system shall provide channel toggles for Email and Inline chat.
- REQ-88 [unwanted] If both channel toggles are off, then the system shall show "Surveys are paused on all channels." in the drawer.
- REQ-89 [event] When the user adds a low-score alert recipient email, the system shall show it as a removable chip.
- REQ-90 [unwanted] If the recipient email is invalid, then the system shall show "Enter a valid email address.".
- REQ-91 [always] The system shall show a live survey preview that updates instantly on every change.
- REQ-92 [event] When the user clicks Save, the system shall persist the settings in the API layer for this session and show the toast "CSAT settings saved".
- REQ-93 [unwanted] If the user closes the drawer with unsaved changes, then the system shall ask "Discard unsaved changes?" with Discard and Keep editing (interpreted).

### Styleguide (/styleguide)
- REQ-94 [always] The system shall show on /styleguide, without sign-in, colors, type scale, buttons, inputs, author badges, status pills, cards, tables and empty states.

## Quality requirements
```
Q-1  Tag: Performance.PageLoad
     Scale: ms from route change to skeleton visible
     Meter: browser timing, 5 trials on /dashboard
     Must: 300   Plan: 100
Q-2  Tag: Performance.RangeSwitch
     Scale: ms from picking a date range to KPIs and charts updated (incl. simulated latency)
     Meter: browser timing, 5 trials
     Must: 1500   Plan: 800
Q-3  Tag: Accessibility.Contrast
     Scale: text/background contrast ratio for all text, pills and badges
     Meter: axe / contrast checker on /dashboard, /login, /styleguide
     Must: 4.5:1 normal text (3:1 large)   Plan: 0 axe serious/critical violations
Q-4  Tag: Accessibility.Keyboard
     Scale: % of interactive controls on shell, login, dashboard, drawer reachable and operable by keyboard with visible focus ring
     Meter: manual tab-through
     Must: 100%   Plan: 100%
Q-5  Tag: Responsive.Tablet
     Scale: px of horizontal overflow at 768px width on /dashboard and /login
     Meter: browser at 768x1024
     Must: 0   Plan: 0
Q-6  Tag: Visual.Charts
     Scale: count of charts with clipped labels, overlapping legends, or colors outside the token palette
     Meter: screenshot review at 1440 and 768
     Must: 0   Plan: 0
Q-7  Tag: Trust.DataConsistency
     Scale: mismatches between the Inbox nav badge, bell count, and number of needs_human tickets in mocks
     Meter: count compare
     Must: 0   Plan: 0
Q-8  Tag: Portability.Code
     Scale: count of component/page files importing /src/mocks or any Emergent package
     Meter: grep
     Must: 0   Plan: 0
Q-9  Tag: Visual.Brand
     Scale: reviewer judgement "warm heritage, not corporate blue" + Fraunces used only for titles/KPI numbers
     Meter: human
     Must: pass   Plan: pass
```
