# Phase 7: Phone-optimized agent app

- Version: phase-7
- Goal: every signed-in screen (shell, Dashboard, Inbox, Guidance, Settings incl. Chat Widget) works well on phones at 360–430px wide, with phone-native patterns: bottom tab bar, bottom sheets, full-screen editors and a sticky composer. Desktop (≥1024) and tablet (640–1023) layouts stay as they are.
- Product context: [overview.md](../overview.md). User request: "Login + the whole agent app on phones". Login was finished in the phase-6 polish. Feature id: F-41. Everything is still MOCKED.

## Functional requirements

### Phone shell (<640px)
- REQ-383 [state] While the viewport is below 640px, the system shall hide the sidebar and show a bottom tab bar with Dashboard, Inbox (needs-human badge), Guidance and Settings (admin only), padded by the bottom safe-area inset.
- REQ-384 [always] The system shall mark the active bottom tab with the tobacco icon/label and a brass indicator, with tap targets ≥44px and visible labels.
- REQ-385 [state] While on a phone, the system shall show a compact top bar: castle mark, page title, search icon, bell and avatar.
- REQ-386 [event] When the user taps the search icon on a phone, the system shall open a full-screen search with the same grouped results and "No results for "<query>"" copy.
- REQ-387 [event] When the user taps the bell or avatar on a phone, the system shall open a bottom sheet with the needs-human list or the user menu (role toggle, Sign out).
- REQ-388 [state] While on a phone, the system shall render drawers and modals (CSAT settings, invite user, discard confirms, shortcut help, CSV import) as full-screen sheets or bottom sheets with a sticky action footer.
- REQ-389 [state] While on a phone, the system shall show toasts, the unsaved-changes bars and the demo state switcher above the bottom tab bar, never covering it or the composer.
- REQ-390 [state] While the device has no hover (touch), the system shall hide keyboard-shortcut hints and the "?" help entry point (interpreted).
- REQ-391 [always] The system shall give every hover-only detail (escalation step reasons, nav tooltips, chart tooltips) a tap equivalent on phones.

### Dashboard on phones
- REQ-392 [state] While on a phone, the system shall show the range control as a horizontally scrollable segmented control, and Custom shall open a full-screen date sheet.
- REQ-393 [state] While on a phone, the system shall show the 7 KPIs as a 2-column grid of compact tiles with value, delta chip and sparkline.
- REQ-394 [state] While on a phone, the system shall show charts full width with simplified axes and tap-to-show tooltips.
- REQ-395 [state] While on a phone, the system shall stack the CSAT section and keep the "Latest comments" / "Needs follow-up (n)" tabs.
- REQ-396 [state] While on a phone, the system shall open CSAT Settings full screen with touch drag handles plus up/down buttons for reordering and a sticky Save footer.

### Inbox on phones
- REQ-397 [state] While on a phone, the system shall show views as a horizontally scrollable chip row with counts, and filters in a bottom sheet with Apply and Clear.
- REQ-398 [state] While on a phone, the system shall show compact ticket rows (customer, subject, one-line preview, channel icon, status pill, time) with ≥56px height.
- REQ-399 [event] When the user taps "Select" in the list header, the system shall enter selection mode with checkboxes and a bulk bar (Assign / Tag / Close) docked above the tab bar.
- REQ-400 [event] When the user opens a ticket on a phone, the system shall show a full-screen conversation with Back, customer name, status pill, and a "⋯" button opening a sheet with status, priority and assignee controls.
- REQ-401 [event] When the user taps "Details" in the conversation, the system shall open a full-screen sheet with the customer card, Shopify orders, past tickets and the AI attempt log.
- REQ-402 [state] While a conversation is open on a phone, the system shall hide the bottom tab bar and dock the composer to the bottom, safe-area and keyboard aware (interpreted).
- REQ-403 [state] While on a phone, the system shall stack the AI draft card actions (Approve / Edit / Discard) as full-width buttons.
- REQ-404 [event] When the user taps an escalation chip step on a phone, the system shall show that step's reason.

### Guidance on phones
- REQ-405 [state] While on a phone, the system shall show the Articles and Macros tables as card lists, keeping search, the active toggle and last updated, with filters in a bottom sheet.
- REQ-406 [state] While on a phone, the system shall open the article and macro editors full screen with Write/Preview tabs and a sticky Save footer.
- REQ-407 [state] While on a phone, the system shall stack the Test Sandbox inputs and results, and show CSV column mapping as stacked rows.

### Settings on phones
- REQ-408 [state] While on a phone, the system shall show the Settings tab bar as a horizontally scrollable segmented control.
- REQ-409 [state] While on a phone, the system shall stack integration cards, AI form sections and business-hours rows (day + toggle, then times).
- REQ-410 [state] While on a phone, the system shall show Users as a card list with a row actions sheet.
- REQ-411 [state] While on a phone, the system shall show Chat Widget settings in one column with a floating "Preview" button that opens the live preview full screen (device defaults to Mobile), and the unsaved bar above the tab bar.
- REQ-412 [state] While on a phone, the system shall stack the theme editor mock (/widget-demo/theme-editor) sidebar above its preview without overflow.

### Global phone quality
- REQ-413 [always] The system shall have zero horizontal page overflow at 360, 390 and 430px on every signed-in route and /styleguide.
- REQ-414 [always] The system shall use ≥16px font size on phone inputs (no iOS zoom) and tap targets ≥44px.
- REQ-415 [always] The system shall keep desktop (≥1024) and tablet (640–1023) layouts and all earlier journeys unchanged.
- REQ-416 [always] The system shall keep 0 serious/critical axe violations on phone layouts.

## Quality requirements
```
Q-37 Tag: Responsive.Phone
     Scale: px horizontal overflow summed across signed-in routes at 360/390/430
     Meter: Playwright sweep
     Must: 0   Plan: 0
Q-38 Tag: Usability.TapTargets
     Scale: interactive elements smaller than 44x44 on phone layouts (inline text links excluded)
     Meter: Playwright bounding-box sweep
     Must: 0   Plan: 0
Q-39 Tag: Usability.Reach
     Scale: primary actions (Send, Save, Approve, Apply) hidden under the keyboard, tab bar or a toast
     Meter: manual at 390x844 with the virtual keyboard simulated
     Must: 0   Plan: 0
Q-40 Tag: Regression.Desktop
     Scale: earlier journeys failing at 1440/768 after phone work
     Meter: re-run the prior checks
     Must: 0   Plan: 0
Q-41 Tag: Accessibility.Axe
     Scale: axe serious+critical on phone layouts
     Meter: axe at 390x844 per route
     Must: 0   Plan: 0
```

## Integrations as tiles + detail pages (user request mid-phase 7)
Replaces the expandable integration cards (REQ-198, REQ-345 chevron). All status, test, details, credential and copy rules from REQ-196..REQ-206 and REQ-343..REQ-347 still apply, now on the detail page.
- REQ-417 [always] The system shall show /settings/integrations as the health summary line plus a responsive grid of tiles (3 columns desktop, 2 tablet, 1 phone), one per integration: logo tile, name, one-line purpose, status pill (Connected / Error / Not configured) and last sync.
- REQ-418 [state] While an integration is in Error or Not configured, the system shall tint its tile edge (red / slate) and show the short reason on the tile (e.g. "401 Unauthorized").
- REQ-419 [event] When the admin clicks or presses Enter on a tile, the system shall open /settings/integrations/<id> (outlook, shopify, claude, grokbot, resend).
- REQ-420 [always] The system shall show on the detail page a "← Integrations" back link, a header (logo, name, purpose, status pill, last sync, Test connection with its inline result), the error callout when in Error, then sections: Connection details, Configuration, Credentials (masked, lock icon, env var note).
- REQ-421 [always] The system shall put the per-integration content on the detail page:
  - Outlook: mailbox support@goorin.com, subscription status, last poll, processed folder.
  - Shopify: shop domain, app embed status, link to Chat Widget → Install.
  - Claude / Grokbot: model selector and test prompt.
  - Resend: from address, SPF/DKIM checklist, webhook status, Send test email.
- REQ-422 [event] When the admin changes an editable field (model selector), the system shall show the unsaved bar with Save / Discard.
- REQ-423 [event] When the admin saves the change, the system shall show "<Name> settings saved" and the tile shall reflect it (e.g. the model under the name) (interpreted).
- REQ-424 [unwanted] If the admin leaves a detail page with unsaved changes, then the system shall ask "Discard unsaved changes?".
- REQ-425 [unwanted] If /settings/integrations/<id> is unknown, then the system shall show "Integration not found" with a link back to Integrations.
- REQ-426 [state] While on a phone, the system shall show the detail page full width with a sticky header (back + name + status) and the unsaved bar above the tab bar.
