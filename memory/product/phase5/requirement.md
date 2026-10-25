# Phase 5: Chat Widget settings + Shopify Theme Editor mock

- Version: phase-5
- Goal: replace the /settings/widget placeholder with the full Chat Widget admin. Settings sit in collapsible sections on the left, with a sticky live preview on the right that renders the phase-4 SupportWidget in `contained` mode with forced states. It also includes the Shopify Install section and the Shopify-styled Theme Editor mock at /widget-demo/theme-editor. All of it is MOCKED.
- Product context: [overview.md](../overview.md). Feature ids: F-36 to F-39. Supersedes JRN-52 (the Chat Widget placeholder part only).

## Functional requirements

### Layout, preview, save
- REQ-271 [always] The system shall render /settings/widget (admin only) as two columns: collapsible sections Branding, Launcher, Messaging, Display rules, CSAT in chat and Install on the left, and a sticky live preview on the right.
- REQ-272 [always] The system shall render the preview with the real SupportWidget in contained mode over a mock Goorin storefront.
- REQ-273 [always] The system shall provide preview toggles for page (Product, Collection, Cart), device (Desktop, Tablet, Mobile in an iPhone frame) and state (Launcher closed, Greeting bubble, Pre-chat form, Active chat, AI → human handoff, Offline, CSAT, Transcript sent).
- REQ-274 [event] When any setting changes, the system shall update the preview instantly with no save.
- REQ-275 [state] While there are unsaved changes, the system shall show a bar "You have unsaved changes" with Save and Discard.
- REQ-276 [event] When the admin clicks Save, the system shall store the settings and show "Widget settings saved".
- REQ-277 [unwanted] If any field is invalid, then the system shall disable Save and scroll to the first error on click (interpreted).
- REQ-278 [event] When the admin clicks Discard, the system shall revert to the last saved settings.
- REQ-279 [unwanted] If the admin navigates away with unsaved changes, then the system shall ask "Discard unsaved changes?".
- REQ-280 [event] When the admin clicks "Preview on my store", the system shall open /widget-demo?desk_preview=1 in a new tab showing the current unsaved settings.
- REQ-281 [state] While /widget-demo has ?desk_preview=1, the system shall show the banner "Previewing unsaved settings from Goorin Support Desk" (interpreted).
- REQ-282 [state] While the preview page type or device is excluded by display rules, the system shall show an overlay in the preview explaining why the widget is hidden (e.g. "Hidden on mobile") (interpreted).

### 1. Branding
- REQ-283 [always] The system shall provide primary, accent, header background, header text, customer bubble, AI/agent bubble and link colors, each with a hex input, a color picker and Goorin palette presets.
- REQ-284 [unwanted] If a hex value is invalid, then the system shall show "Enter a 6-digit hex color like #6B4F3A.".
- REQ-285 [unwanted] If a color pair fails WCAG AA (header text on header background, white on primary, customer bubble text, AI bubble text, link on white), then the system shall show a warning with the ratio (e.g. "Contrast 2.8:1, below WCAG AA 4.5:1") (interpreted).
- REQ-286 [always] The system shall provide uploads for header logo, AI avatar and human agent avatar with a thumbnail preview.
- REQ-287 [unwanted] If an upload isn't PNG, JPG or SVG under 1 MB, then the system shall show "Use a PNG, JPG or SVG under 1 MB.".
- REQ-288 [always] The system shall provide font choice "Inherit from store theme" (default) or Inter.
- REQ-289 [always] The system shall provide a corner radius slider 0–20px.
- REQ-290 [always] The system shall provide a shadow choice: none, soft or strong.

### 2. Launcher
- REQ-291 [always] The system shall provide a launcher icon preset grid (chat bubble, hat, question mark, envelope, headset) plus a custom SVG/PNG upload.
- REQ-292 [always] The system shall provide icon color and background color.
- REQ-293 [always] The system shall provide style icon-only circle or pill with a text label (default "Need help?").
- REQ-294 [unwanted] If pill style has an empty label, then the system shall show "Add a label for the pill launcher.".
- REQ-295 [always] The system shall provide size S, M or L.
- REQ-296 [always] The system shall provide position bottom-right or bottom-left with X and Y offset sliders.
- REQ-297 [always] The system shall provide separate mobile X and Y offsets.
- REQ-298 [always] The system shall provide an unread badge color.
- REQ-299 [always] The system shall provide attention animation: none, pulse once, or bounce after N seconds (N 1–60).

### 3. Messaging
- REQ-300 [always] The system shall provide header title and subtitle inputs.
- REQ-301 [always] The system shall provide a greeting message.
- REQ-302 [always] The system shall provide a proactive greeting bubble on/off, delay in seconds and pages it shows on.
- REQ-303 [always] The system shall provide pre-chat fields: email (required / optional / off), name (on/off), order number (on/off), with the note "Skipped automatically when the customer is logged into Shopify".
- REQ-304 [always] The system shall provide the AI disclosure line, handoff message and offline message inputs.
- REQ-305 [always] The system shall provide an "Email us instead" fallback toggle for the offline state.
- REQ-306 [always] The system shall provide quick-reply buttons that can be added, edited, removed and reordered by drag and by keyboard.
- REQ-307 [unwanted] If a quick reply is empty or there are more than 6, then the system shall show "Quick replies can't be empty." or "Up to 6 quick replies." (interpreted).

### 4. Display rules
- REQ-308 [always] The system shall provide Show on: All pages, or selected page types (home, product, collection, cart, account, pages).
- REQ-309 [always] The system shall provide URL include and exclude patterns as chips supporting * wildcards.
- REQ-310 [always] The system shall provide a Hide on mobile toggle.
- REQ-311 [always] The system shall provide outside-business-hours behavior: keep AI on, show offline form, or hide widget.
- REQ-312 [always] The system shall provide customer-context toggles for what the AI receives: logged-in customer, current product, cart contents.

### 5. CSAT in chat
- REQ-313 [always] The system shall provide inline survey style stars, emoji or numeric, reflected in the CSAT preview state.
- REQ-314 [always] The system shall list the CSAT Settings questions read-only with an "Edit questions" link that opens the Dashboard CSAT Settings drawer (interpreted).

### 6. Install (Shopify), anchor #install
- REQ-315 [always] The system shall show a status card with connected store domain, App embed Enabled/Disabled, active theme name, last widget load seen and install method.
- REQ-316 [always] The system shall show the App Embed step card "Online Store → Themes → Customize → App embeds → toggle Goorin Support Desk → Save" with an illustration of the toggle.
- REQ-317 [event] When the admin clicks "Open Theme Editor", the system shall open /widget-demo/theme-editor (interpreted: mock in place of the real Shopify deep link).
- REQ-318 [always] The system shall show the fallback snippet `<script src="{APP_BASE_URL}/widget.js" data-shop="goorin.myshopify.com" async></script>` with APP_BASE_URL from config, and instructions to paste it before </body> in theme.liquid.
- REQ-319 [event] When the admin clicks Copy on the snippet, the system shall copy it and show "Copied".
- REQ-320 [always] The system shall show the active settings source per shared field (primary, accent, launcher position, hide on mobile) as "Goorin Support Desk" or "Theme editor", with the note "Settings saved here override the theme editor defaults." (interpreted).
- REQ-321 [event] When the admin clicks "Verify installation", the system shall show a spinner then a result.
- REQ-322 [state] While the app embed is enabled, the system shall show "Widget detected on goorin.myshopify.com" as the verify result.
- REQ-323 [unwanted] If the app embed is disabled, then the system shall show "Widget not detected. Enable the App embed and save your theme." as the verify result.

### Theme Editor mock (/widget-demo/theme-editor)
- REQ-324 [always] The system shall render a Shopify-admin-styled theme editor with a left sidebar App embeds panel and a storefront preview with the widget.
- REQ-325 [always] The system shall show the Goorin Support Desk embed block with the toggle "Enable Goorin Support Desk", primary and accent color pickers, a launcher position select, a "Hide on mobile" checkbox and the helper text "Advanced settings are managed in Goorin Support Desk" linking to /settings/widget.
- REQ-326 [event] When a theme editor value changes, the system shall update its storefront preview for fields whose source is Theme editor.
- REQ-327 [event] When the embed toggle is turned off and saved, the system shall show App embed Disabled on the Install status card.
- REQ-328 [always] The system shall share theme editor and Desk widget state in the app store, so navigation between them keeps values (interpreted).

### States
- REQ-329 [always] The system shall show skeleton and error states for /settings/widget and the theme editor via the demo state switcher.

## Quality requirements
```
Q-28 Tag: Performance.PreviewUpdate
     Scale: ms from a setting change (color, radius, copy) to the preview updating
     Meter: browser, 5 trials
     Must: 200   Plan: 50
Q-29 Tag: Trust.PreviewFidelity
     Scale: settings that change nothing visible in the relevant preview state
     Meter: change each field, inspect preview
     Must: 0   Plan: 0
Q-30 Tag: Trust.DataLoss
     Scale: unsaved widget edits lost without a warning
     Meter: navigate away / switch tab while dirty
     Must: 0   Plan: 0
Q-31 Tag: Accessibility.Contrast
     Scale: failing pairs not flagged by the contrast warnings
     Meter: set 5 known-failing pairs
     Must: 0   Plan: 0
Q-32 Tag: Responsive.Tablet
     Scale: px horizontal overflow at 1024 and 768 (preview may stack under settings below 1024)
     Meter: browser
     Must: 0   Plan: 0
Q-33 Tag: Visual.ShopifyLikeness
     Scale: reviewer judgement that the theme editor reads as Shopify admin (not Goorin styling)
     Meter: human
     Must: pass   Plan: pass
```

## Design refresh (user request mid-phase 5): Login + Dashboard

Brand assets were pulled from goorin.com and saved in /app/memory/assets/brand/:
- goorin-halfstack-black.png (1897x1070, transparent): castle crest + "GOORIN BROS." Primary logo for login.
- goorin-castle-mark.png (400x400): castle mark only.
- goorin-wordmark-small.png (159x26, low-res): don't use at large sizes.

### Login
- REQ-330 [always] The system shall render /login (and its forgot-password, invite and expired variants) as a single centered card on the warm off-white background, with no photo or side image.
- REQ-331 [always] The system shall show the official GOORIN wordmark (goorin-wordmark-black.svg, user-chosen; replaces the halfstack/castle) above the form, crisp at any size, with alt "Goorin Bros.".
- REQ-331a [always] The system shall use the GOORIN wordmark (black) on login, the storefront header, the survey header and the default widget header logo (user request).
- REQ-331c [always] The system shall render the sidebar as a LIGHT (white surface) rail styled after the user's reference (user corrected: light, not dark): a brass logo tile with the castle mark (goorin-castle-mark.svg), a raised active tile with a brass icon and a left brass bar, hairline group dividers, Settings pinned at the bottom, and a collapse toggle in the bottom section. Expanded, it shows ONLY the black GOORIN wordmark (~160px wide, centered, no castle tile) + a small centered "Support Desk" label. Collapsed shows the brass tile with a WHITE castle. The collapse toggle lives in the bottom Settings section (same row as Settings when expanded, below Settings when collapsed); there is no edge tab (user request).
- REQ-331d [always] The system shall use as the favicon a white castle mark on a brass #B08D57 rounded tile (user request).
- REQ-331b [state] While the sidebar is collapsed, the system shall center nav icons, place the active indicator beside the active item, and anchor the needs-human badge at the icon's top-right without covering the glyph (user-reported bug).
- REQ-332 [always] The system shall keep the login form minimal: heading "Sign in to Support Desk", email, password, "Forgot password?", full-width "Sign in" button, and nothing else (interpreted).
- REQ-333 [always] The system shall keep all phase-1 login copy, validation and flows unchanged (REQ-28..REQ-42).

### Dashboard: more modern and simple (interpreted)
- REQ-334 [always] The system shall present the date range as a compact segmented control (Today · 7d · 30d · 90d · Custom) in the page header.
- REQ-335 [always] The system shall show the 7 KPIs as one clean stat strip (a single surface split by thin dividers, wrapping on smaller screens), each with label, Fraunces value, delta chip and a tiny sparkline.
- REQ-336 [always] The system shall show ticket volume (email vs chat) as one wide, gridline-free chart as the visual anchor.
- REQ-337 [always] The system shall show "Resolved by" as a single stacked proportion bar with Claude / Grokbot / Human counts and percentages.
- REQ-338 [always] The system shall show "Escalation reasons" and "Top tags" as ranked lists with thin inline horizontal bars and counts, without chart axes or gridlines.
- REQ-339 [always] The system shall condense CSAT into one section: headline average + trend, the 1–5 distribution, channel/resolver splits as compact rows, and one card with tabs "Latest comments" and "Needs follow-up (<n>)".
- REQ-340 [always] The system shall keep every phase-1 dashboard capability (all 7 KPIs with deltas, the 4 overview visuals, every CSAT item, the CSAT Settings drawer, range recompute, demo states).
- REQ-341 [always] The system shall reduce visual noise: fewer borders, no chart gridlines, muted axis text, consistent 24–32px section spacing, at most 3 accent colors per visual.

## Settings design refresh (user request: "continue to improve settings page"), interpreted
Visual/layout pass only. Every existing capability, copy string, validation, route and testid from REQ-194..REQ-222 and REQ-271..REQ-329 stays.
- REQ-342 [always] The system shall show the Settings tabs as a modern segmented tab bar with an icon per tab (Integrations, AI, Chat Widget, Users) and the tab's own one-line description under the page title.
- REQ-343 [state] While any integration is in Error, the system shall show a small amber dot on the Integrations tab (interpreted).
- REQ-344 [always] The system shall open Integrations with a health summary line (e.g. "3 connected · 1 error · 1 not configured").
- REQ-345 [always] The system shall render each integration as a clean row/card: logo tile, name, one-line purpose, status pill, last sync, Test connection, and an expand chevron for details.
- REQ-346 [state] While an integration is in Error, the system shall show an inline callout with the reason at the top of its card.
- REQ-347 [always] The system shall show masked secrets in a compact "Credentials" key-value block with a lock icon.
- REQ-348 [always] The system shall lay out AI settings as form sections with the label + help text on the left (~1/3) and controls on the right (~2/3), collapsing to stacked below 1024px.
- REQ-349 [always] The system shall show the confidence slider with a visual band marking the "Escalate to Grokbot" zone below the threshold and the "Claude handles" zone above it.
- REQ-350 [always] The system shall render the auto-send matrix as a clean table with tier badges as column headers and switches in the cells.
- REQ-351 [always] The system shall render escalation rules as sentence-style rows ("If <condition> <value> → escalate to <target>").
- REQ-352 [always] The system shall show system prompts in a collapsible monospace viewer with line numbers and Copy.
- REQ-353 [always] The system shall render Users with a header (count, search, "Invite user"), rows with initials avatar, name + email stacked, role pill, status pill, last login, and a row actions menu.
- REQ-354 [event] When the admin types in the Users search, the system shall filter rows by name or email (interpreted).
- REQ-355 [always] The system shall show on each Chat Widget section header an icon and a one-line summary of its current values when collapsed (e.g. "Tobacco & brass · 12px radius").
- REQ-356 [always] The system shall put the preview's page, device and state controls in one tidy toolbar above the preview (state as a select).
- REQ-357 [always] The system shall keep Settings calm: fewer borders, 24–32px section spacing, Fraunces only for the page title, and consistent sticky save bars across the AI and Chat Widget tabs.
