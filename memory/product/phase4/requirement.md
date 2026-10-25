# Phase 4: Customer-facing chat widget + hosted CSAT survey

- Version: phase-4
- Goal: the customer chat widget as one reusable, settings-driven component rendered in Shadow DOM, shown working in every state on a full mock Goorin storefront at /widget-demo, plus the mobile-first hosted CSAT survey at /survey/:token. Phase 5 will build the admin controls and live preview on top of this same component.
- Product context: [overview.md](../overview.md). Feature ids: F-33 to F-35. All behavior is MOCKED (scripted AI replies, no real chat backend).

## Functional requirements

### Widget component and settings model
- REQ-224 [always] The system shall define a WidgetSettings type covering every field in overview F-36/F-37: branding colors, logo, AI and agent avatars, font, radius, shadow, launcher icon/style/size/position/offsets (desktop and mobile)/badge color/animation, messaging copy, greeting bubble config, pre-chat fields, AI disclosure, handoff, offline, quick replies, display rules, customer context toggles and CSAT style.
- REQ-225 [always] The system shall define a ShopifyInstallStatus type {shopDomain, embedEnabled, themeName, lastSeenAt, method: 'app_embed'|'script_tag'|'none'}, with mocks served through /src/api.
- REQ-226 [always] The system shall render the widget entirely from a WidgetSettings object, so changing a setting changes the widget with no code change.
- REQ-227 [always] The system shall support a "contained" render mode that positions the widget inside a given container instead of the viewport (for the phase-5 device-frame preview) (interpreted).
- REQ-228 [always] The system shall support a forced-state prop for each of the 8 states: launcher closed, greeting bubble, pre-chat form, active chat, AI → human handoff, offline, CSAT, transcript sent.
- REQ-229 [always] The system shall mount the widget inside a Shadow DOM root with its styles injected into that root.
- REQ-230 [event] When the "Hostile store CSS" demo toggle is on, the system shall apply aggressive global storefront CSS while the widget's appearance stays unchanged (interpreted).

### /widget-demo storefront
- REQ-231 [always] The system shall render /widget-demo publicly as a full-page mock Goorin Bros. storefront (header, nav, footer) using AI-generated hat product photos stored in the repo.
- REQ-232 [always] The system shall offer page variants Product, Collection and Cart.
- REQ-233 [always] The system shall show a demo controls panel, outside the widget, that jumps to any of the 8 states and toggles "Logged-in customer", "Outside business hours" and "Hostile store CSS".
- REQ-234 [always] The system shall keep the demo controls from overlapping the widget launcher and panel (interpreted).

### Launcher and greeting
- REQ-235 [always] The system shall show the launcher with an unread badge.
- REQ-236 [event] When the greeting delay elapses, the system shall show the proactive greeting bubble next to the launcher.
- REQ-237 [event] When the customer dismisses the greeting bubble, the system shall hide it without opening the panel.
- REQ-238 [event] When the customer clicks the launcher or the greeting bubble, the system shall open the chat panel.

### Panel and pre-chat
- REQ-239 [always] The system shall show a panel header with logo, title, subtitle, the AI disclosure "You're chatting with Goorin's AI assistant" and a minimize control.
- REQ-240 [event] When a guest opens the panel for the first time, the system shall show the pre-chat form with email (required), name and order number fields.
- REQ-241 [unwanted] If the pre-chat email is missing or invalid, then the system shall show "Enter a valid email address." and stay on the form.
- REQ-242 [state] While "Logged-in customer" demo mode is on, the system shall skip the pre-chat form and greet the customer by first name.

### Conversation
- REQ-243 [always] The system shall show customer and AI/agent bubbles with avatars and timestamps.
- REQ-244 [always] The system shall show quick-reply chips Track my order, Returns, Sizing help and Wholesale under the greeting.
- REQ-245 [event] When the customer sends a message or taps a chip, the system shall show a typing indicator before the scripted AI reply.
- REQ-246 [event] When the AI references an order, the system shall show an inline order card with product image, order number, status and a tracking link.
- REQ-247 [unwanted] If the customer sends an empty message, then the system shall keep the send button disabled.
- REQ-248 [always] The system shall announce each new message through an ARIA live region (polite).

### Handoff, offline, CSAT, transcript
- REQ-249 [event] When the customer asks for a person or taps Wholesale, the system shall show the handoff state "Connecting you with our team" with the expected response time (e.g. "Typical reply: about 2 hours").
- REQ-250 [state] While "Outside business hours" is on, the system shall show the offline message with an "Email us instead" form (name, email, message).
- REQ-251 [event] When the customer submits the offline form, the system shall show "Thanks, we'll reply by email within 1 business day".
- REQ-252 [unwanted] If the offline form email or message is empty or invalid, then the system shall show a field error and not submit.
- REQ-253 [event] When the customer ends the chat, the system shall show the inline CSAT survey in the configured style (stars, emoji or numeric) using the questions from CSAT Settings.
- REQ-254 [event] When the customer submits CSAT, the system shall show a thank-you line and an "Email me this transcript" action.
- REQ-255 [event] When the customer requests the transcript, the system shall show "Transcript sent to <email>".
- REQ-256 [unwanted] If no email is known when the transcript is requested, then the system shall ask for an email first.

### Accessibility and mobile
- REQ-257 [state] While the panel is open, the system shall trap keyboard focus inside it.
- REQ-258 [event] When the customer presses Esc, the system shall minimize the panel and return focus to the launcher.
- REQ-259 [always] The system shall expose the panel as a labeled dialog and every control with an accessible name.
- REQ-260 [state] While the viewport is narrower than 640px, the system shall open the panel as a full-screen sheet.
- REQ-261 [state] While the panel is a full-screen sheet, the system shall pad the composer by the bottom safe-area inset.
- REQ-262 [state] While the panel is a full-screen sheet, the system shall lock background page scroll (interpreted).

### Hosted CSAT survey (/survey/:token)
- REQ-263 [always] The system shall render /survey/:token publicly with a Goorin Bros. branded header and a reference to the ticket subject.
- REQ-264 [always] The system shall show one question per step from the CSAT Settings questions with a progress bar "Step <n> of <total>".
- REQ-265 [unwanted] If a rating question is unanswered, then the system shall disable Next and show "Please choose a rating." on attempt.
- REQ-266 [event] When the customer submits the final step, the system shall show the thank-you state "Thank you for your feedback".
- REQ-267 [event] When the URL has ?score=<1-5>, the system shall preselect that rating on the first rating question (interpreted).
- REQ-268 [unwanted] If the token is unknown, then the system shall show "This survey link isn't valid".
- REQ-269 [unwanted] If the token is already completed ("done"), then the system shall show "You've already shared your feedback" (interpreted).
- REQ-270 [always] The system shall lay the survey out mobile-first with tap targets of at least 44px.

## Quality requirements
```
Q-22 Tag: Isolation.ShadowDOM
     Scale: visible style changes to the widget when Hostile store CSS is on
     Meter: screenshot compare, widget open + closed
     Must: 0   Plan: 0
Q-23 Tag: Performance.Open
     Scale: ms from launcher click to panel interactive
     Meter: browser, 5 trials
     Must: 300   Plan: 150
Q-24 Tag: Accessibility.Widget
     Scale: axe serious/critical violations inside the open widget; focus escapes from open panel
     Meter: axe + manual Tab cycling
     Must: 0   Plan: 0
Q-25 Tag: Responsive.Mobile
     Scale: px horizontal overflow and composer hidden behind keyboard/safe area at 390x844
     Meter: browser at iPhone 14 size
     Must: 0   Plan: 0
Q-26 Tag: Visual.Imagery
     Scale: product photos stretched, pixelated, mismatched in style, or not hats
     Meter: human review of storefront + order card
     Must: 0   Plan: 0
Q-27 Tag: Visual.Brand
     Scale: reviewer judgement that the widget and survey feel like Goorin (warm, heritage), not generic chat
     Meter: human
     Must: pass   Plan: pass
```
