# Phase 4 Journeys

/widget-demo and /survey/:token are public (no sign-in). Desktop 1440x900 unless stated.

### JRN-59 Storefront and variants
- steps: Open /widget-demo. Switch page variants Product, Collection, Cart.
- expected: A Goorin Bros. storefront with header, nav, footer and AI-generated hat photos (not stretched, consistent style). Each variant renders a distinct page (product detail / grid / cart line items). A demo controls panel is visible and doesn't overlap the launcher.

### JRN-60 Launcher, unread badge, greeting bubble
- steps: Wait for the greeting delay. Dismiss the bubble. Reload, wait, click the bubble.
- expected: The launcher shows an unread badge. After the delay a greeting bubble appears. Dismiss hides it and the panel stays closed. Clicking the bubble opens the panel.

### JRN-61 Panel header and pre-chat
- steps: As a guest, open the panel. Submit the pre-chat form with an empty email, then "bad", then a valid email with a name and order number.
- expected: Header shows logo, title, subtitle, "You're chatting with Goorin's AI assistant" and a minimize control. The form has email (required), name, order number. Invalid emails show "Enter a valid email address.". A valid submit opens the conversation.

### JRN-62 Logged-in customer skips pre-chat
- steps: Turn on "Logged-in customer" in demo controls, open the panel.
- expected: No pre-chat form. The greeting addresses the customer by first name.

### JRN-63 Conversation, typing, quick replies, order card
- steps: Tap "Sizing help". Then tap "Track my order". Type a free message, send. Try sending empty.
- expected: Chips Track my order, Returns, Sizing help, Wholesale are shown. Each send shows a typing indicator, then a scripted AI reply in an AI bubble with avatar. Track my order shows an inline order card with product image, order number, status and a tracking link. Empty send is disabled.

### JRN-64 Handoff
- steps: Type "I want to talk to a person" (or tap Wholesale).
- expected: Handoff state shows "Connecting you with our team" and an expected response time (e.g. "Typical reply: about 2 hours").

### JRN-65 Offline
- steps: Turn on "Outside business hours", open the panel. Submit the email form empty, then valid.
- expected: The offline message plus "Email us instead" form (name, email, message). Empty/invalid shows field errors. Valid shows "Thanks, we'll reply by email within 1 business day".

### JRN-66 CSAT and transcript
- steps: In an active chat, end the chat. Answer the CSAT, submit. Click "Email me this transcript". Repeat via the state jump with no email known.
- expected: The inline CSAT appears in the configured style with the CSAT Settings questions. Submit shows a thank-you and "Email me this transcript". Transcript shows "Transcript sent to <email>". With no email known, it asks for an email first.

### JRN-67 State jumps
- steps: Use demo controls to jump to each state: Launcher closed, Greeting bubble, Pre-chat form, Active chat, AI → human handoff, Offline, CSAT, Transcript sent.
- expected: Each jump renders that exact state immediately.

### JRN-68 Shadow DOM isolation
- steps: Open the panel, note its look. Turn on "Hostile store CSS". Inspect the DOM.
- expected: The storefront visibly changes (e.g. fonts/buttons) but the widget looks identical. The widget's DOM sits inside a shadow root. (interpreted)

### JRN-69 Widget keyboard accessibility
- steps: Tab to the launcher, Enter. Tab repeatedly. Press Esc.
- expected: The panel opens with focus inside. Tab cycles within the panel and never reaches the page behind. Esc minimizes and focus returns to the launcher. The panel is a labeled dialog, and new messages are announced via a live region.

### JRN-70 Mobile sheet
- steps: At 390x844 open /widget-demo, open the panel, scroll the page behind.
- expected: The panel is a full-screen sheet with the composer visible above the bottom safe area. The page behind doesn't scroll. No horizontal overflow.

### JRN-71 Hosted survey happy path
- steps: At 390x844 open /survey/<valid demo token>. Try Next without a rating. Pick 4, Next through all steps, Submit.
- expected: Branded Goorin Bros. header and ticket subject. One question per step with "Step <n> of <total>" progress. Unanswered rating shows "Please choose a rating.". Submit shows "Thank you for your feedback". Tap targets are ≥44px.

### JRN-72 Survey edge tokens and preselect
- steps: Open /survey/<valid token>?score=5. Open /survey/nope. Open /survey/done.
- expected: The score 5 is preselected (interpreted). "This survey link isn't valid". "You've already shared your feedback" (interpreted).

### JRN-73 Survey follows CSAT Settings
- steps: Sign in, add a text question in the Dashboard CSAT Settings drawer, Save. In the same tab open /survey/<valid token>.
- expected: The survey includes the new question, and the step total increased by one.
