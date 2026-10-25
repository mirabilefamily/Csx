# Phase 5 Journeys

Sign in as ava@goorin.com / goorin123 (Admin) at 1440x900 unless stated.

### JRN-74 Layout, preview toggles, instant update
- superseded: [JRN-52] (the Chat Widget placeholder part only)
- steps: Open Settings → Chat Widget. Switch the preview page Product/Collection/Cart, device Desktop/Tablet/Mobile, and step through all 8 states. Change the header title.
- expected: Left column has collapsible Branding, Launcher, Messaging, Display rules, CSAT in chat, Install. The right preview stays sticky while scrolling. Each toggle changes the preview, and Mobile shows an iPhone frame. All 8 states render. The new title appears in the preview immediately.

### JRN-75 Unsaved bar, save, discard, guard
- steps: Change a color. Click Discard. Change it again, Save. Change something and click the Inbox nav.
- expected: "You have unsaved changes" with Save/Discard appears. Discard reverts the field and the preview. Save shows "Widget settings saved". Navigating while dirty asks "Discard unsaved changes?".

### JRN-76 Preview on my store
- steps: Change the primary color without saving, click "Preview on my store".
- expected: A new tab opens /widget-demo?desk_preview=1 with the banner "Previewing unsaved settings from Goorin Support Desk" and the widget in the new color.

### JRN-77 Branding colors and contrast
- steps: Type "#12" in Primary. Pick a Goorin preset. Set header background #FFFFFF with header text #F5F5F5. Set link color #DDDDDD.
- expected: "#12" shows "Enter a 6-digit hex color like #6B4F3A." and Save is disabled. Presets apply. The failing pairs show warnings with ratios (e.g. "Contrast 1.1:1, below WCAG AA 4.5:1"). Preview colors update.

### JRN-78 Branding assets and style
- steps: Upload a PNG logo, AI avatar and agent avatar. Upload a .gif. Change font to Inter, radius to 0 then 20, shadow none/strong.
- expected: Thumbnails appear and the preview header/avatars use them. The .gif shows "Use a PNG, JPG or SVG under 1 MB.". Font, radius and shadow visibly change the preview.

### JRN-79 Launcher settings
- steps: Pick the hat icon. Switch to pill with an empty label, then "Need help?". Change size S/L, position bottom-left, offsets, mobile offsets (in Mobile preview), badge color, animation "bounce after 5 seconds".
- expected: The preview launcher updates for each. An empty pill label shows "Add a label for the pill launcher.". Mobile offsets apply only in the Mobile device preview.

### JRN-80 Messaging settings
- steps: Edit subtitle, greeting, AI disclosure, handoff and offline messages, checking the matching preview states. Toggle the greeting bubble off and on, change its delay. Set pre-chat email Optional, name off, order number on. Add a quick reply "Custom orders", drag it first, move another with the keyboard, clear one, add up to 7.
- expected: Each text shows in its preview state. Pre-chat shows the configured fields with the note "Skipped automatically when the customer is logged into Shopify". Quick-reply chips reorder in the preview. Errors read "Quick replies can't be empty." and "Up to 6 quick replies.". The "Email us instead" toggle shows/hides the offline form.

### JRN-81 Display rules
- steps: Choose selected page types without Cart, preview Cart. Add include "/products/*" and exclude "/pages/wholesale". Turn on Hide on mobile, preview Mobile. Set outside hours to "Hide widget". Toggle the customer-context switches.
- expected: Cart preview shows an overlay explaining the widget is hidden on this page type. Pattern chips appear. Mobile preview shows "Hidden on mobile". Outside-hours options are keep AI on / show offline form / hide widget. Context toggles for logged-in customer, current product and cart contents exist.

### JRN-82 CSAT in chat
- steps: Switch style stars → emoji → numeric with the CSAT preview state. Click "Edit questions".
- expected: The preview CSAT style changes each time. The questions listed match the CSAT Settings questions. Edit questions opens the Dashboard CSAT Settings drawer (interpreted).

### JRN-83 Install section
- steps: Open Install (or go to /settings/widget#install from the Shopify integration card link). Copy the snippet. Click Verify installation.
- expected: The status card shows goorin.myshopify.com, App embed Enabled, theme name, last widget load, method App embed. The step card reads "Online Store → Themes → Customize → App embeds → toggle Goorin Support Desk → Save" with a toggle illustration. The snippet matches the brief with APP_BASE_URL filled in, plus the paste-before-</body> in theme.liquid instruction. Copy shows "Copied". Verify shows a spinner then "Widget detected on goorin.myshopify.com". Source per field is shown with "Settings saved here override the theme editor defaults."

### JRN-84 Theme editor mock
- steps: Click "Open Theme Editor". Inspect the App embeds block. Change launcher position (theme-sourced field) and primary color. Click the helper link.
- expected: A Shopify-admin-styled editor (not Goorin styling) with the toggle "Enable Goorin Support Desk", primary and accent pickers, launcher position select, Hide on mobile checkbox, and helper text "Advanced settings are managed in Goorin Support Desk". A theme-sourced change updates its preview. A Desk-overridden field doesn't change the widget (source = Goorin Support Desk). The link goes to /settings/widget.

### JRN-85 Embed disabled → verify fails
- steps: In the theme editor turn the embed off, Save. Return to Install, click Verify installation.
- expected: The status card shows App embed Disabled. Verify shows "Widget not detected. Enable the App embed and save your theme."

### JRN-86 Access, states, tablet
- steps: As Agent open /settings/widget. As Admin use the demo switcher Loading/Error on /settings/widget and the theme editor. View /settings/widget at 1024 and 768.
- expected: The Agent sees "You don't have access to Settings". Skeleton and error-with-retry states render. At 1024/768 there's no horizontal overflow, and the preview stacks or stays usable.

## Design refresh journeys

### JRN-87 Simple login with the Goorin logo
- steps: Sign out, open /login at 1440 and at 390. Open "Forgot password?" and /login?invite=demo-invite.
- expected: A centered card on the off-white background with the GOORIN wordmark logo on top, crisp and not stretched (no castle crest). "Sign in to Support Desk", email, password, Forgot password?, full-width Sign in. No hat/workshop photo anywhere. The variants use the same card. JRN-1..JRN-7 still pass.

### JRN-88 Modern, simple dashboard
- steps: Sign in, view /dashboard at 1440 and 768. Switch ranges via the segmented control. Open the CSAT tabs. Open CSAT settings.
- expected: Range segmented control (Today, 7d, 30d, 90d, Custom) in the header. 7 KPIs in one stat strip with values, delta chips, sparklines. A wide volume chart without gridlines. Resolved by as one stacked bar with % for Claude/Grokbot/Human. Escalation reasons and Top tags as ranked lists with thin bars. CSAT: average + trend, distribution, splits, tabs "Latest comments" / "Needs follow-up (3)" at 30d. The CSAT settings drawer still opens. No horizontal overflow at 768. JRN-15..JRN-22 still pass (interpreted visuals).

### JRN-89 Collapsed sidebar (user-reported bug) + logo placement
- steps: Collapse the sidebar on /dashboard, /inbox and /settings/integrations at 1440. Hover and keyboard-focus each icon. Switch to Agent. Expand again. Visit /widget-demo and /survey/tok_GB1066.
- expected: Collapsed: icons are centered in the rail; the active item has a visible background and a brass indicator on its own left edge (not at the top of the sidebar); the "7" badge sits at the icon's top-right without covering it; the sidebar has a light (white) background with a brass logo tile showing the castle mark; the active item has a raised tile, a brass icon and a brass left bar; hairline dividers separate groups; Settings sits at the bottom; the collapse toggle sits in the bottom section below Settings (no edge tab); the castle is white; tooltips show on hover and focus; focus rings are visible. Expanded: no castle tile, only a larger (~160px), horizontally centered black GOORIN wordmark + centered "Support Desk", and the collapse button on the Settings row, with readable labels (AA). The storefront header and survey header use the GOORIN wordmark.

### JRN-90 Settings design refresh (interpreted)
- steps: As Admin at 1440 open each Settings tab, then view each at 768. On Users, search "sam". Expand the Grokbot integration.
- expected: A segmented tab bar with icons, and an amber dot on Integrations (Grokbot is in Error). Integrations shows the summary "3 connected · 1 error · 1 not configured", clean cards with a purpose line, and the Grokbot error callout with its reason. Credentials are in a lock-icon key-value block. AI uses label-left/control-right sections, the slider shows Grokbot/Claude zones, a clean matrix table, sentence-style rules, and the prompt viewer with line numbers. Users has a header with count + search + Invite user, and "sam" filters to Sam Okafor. Chat Widget section headers show value summaries, and the preview controls sit in one toolbar. All JRN-52..JRN-56 and JRN-74..JRN-86 still pass. No horizontal overflow at 768.
