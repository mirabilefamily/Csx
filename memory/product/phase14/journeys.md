# Phase 14 Journeys (Chat widget redesign + Channels chat settings)

Sign in as ava@goorin.com / goorin123 (Admin) at 1440 unless stated. The widget runs at /widget-demo and in the Channels preview. All data is MOCKED.

superseded: [JRN-61, JRN-63, JRN-74, JRN-79, JRN-80, JRN-120]. These are the old header/pre-chat, bubble and chip styling, the 3-level Channels tabs, launcher settings and messaging layout. JRN-168 to JRN-176 replace them. JRN-60, 62, 64–70, 75–78 and 81–86 still apply in the new design.

### JRN-168 Launcher and home view
- steps: Open /widget-demo. Look at the launcher. Open the panel.
- expected:
  - The launcher is a round white button with a soft shadow and the dark chat-dots icon, with the unread badge and greeting bubble as before.
  - The panel is tall with a large radius and a frosted warm background over the store image, and no title bar.
  - At the top right: the Cart icon, a "Track orders" pill and the close X.
  - The starters are stacked and left-aligned: Returns Info, Friday Drops Info, Where is my order?, Can I cancel / edit my order?, Wholesale Inquiry. "See last conversation" is hidden on a fresh session.
  - The input is a pill reading "Ask anything" with an image icon. The footer shows "AI notice • Privacy".

### JRN-169 Conversation look and feedback
- steps: Tap "Returns Info". Read the reply. Tap thumbs up, then thumbs down, then down again. Type "can you help me cancel my order" and send. Scroll up.
- expected:
  - It switches to the conversation view with a Back arrow at the top left, and the input reads "Reply".
  - The AI reply is plain text with no bubble or avatar, with thumbs underneath. Thumbs up fills to a dark circle; down switches the fill; down again clears it.
  - The customer message is a right-aligned light pill. The typing indicator shows before the reply.
  - Scrolled content fades under the floating controls.

### JRN-170 Starters and top buttons do their actions
- steps: Tap "Where is my order?" and complete it with the Mock inbox code. Go Back. Tap "Track orders". Tap Cart. Tap "Wholesale Inquiry" (template Off). Close and reopen, then tap "See last conversation".
- expected:
  - "Where is my order?" and "Track orders" both start the Order tracking workflow (email, code, then order cards in the new style).
  - Cart shows the cart drawer or the toast "Cart opens here on your store".
  - Wholesale Inquiry asks the AI because the workflow is Off.
  - "See last conversation" now appears and reopens the previous thread.

### JRN-171 AI notice, handoff, offline, CSAT
- steps: Tap AI notice. Ask "talk to a person". Use the demo Offline state. End a chat to reach CSAT.
- expected:
  - The AI notice sheet reads "You're chatting with Goorin's AI assistant. A person can take over anytime." with Privacy.
  - Handoff shows "Connecting you with our team…".
  - Offline and CSAT render in the new style.
  - With "Ask for email before chat" On, a compact pre-chat step appears first. With it Off (the default), there's none.

### JRN-172 Channels page: one tab level and layout
- steps: Open Channels. Read the tabs. Open Chat. Measure the settings and preview columns. Scroll the settings.
- expected:
  - One tab row: Chat · Contact form · Email · Installation, with no Appearance / Preferences sub-tabs.
  - The settings column is ≤ about 640px with section cards in order: Look, Launcher, Home screen, Conversation, Display rules, CSAT in chat.
  - The preview column is sticky, shows the store-image backdrop, and has Desktop / Phone and Home / Conversation / Order tracking switches.
  - The caption reads "Uses the same code shoppers get. Shows your draft; nothing is sent from the preview."

### JRN-173 Look and launcher settings update the preview
- steps: Change the primary colour, switch Panel style to Solid and back, upload a logo, pick the Help icon, pick the top-left corner in the 2×2 picker, set spacing 24 / 24.
- expected:
  - The colour inputs are compact swatch + hex fields, and the corner picker is a small diagram.
  - The spacing inputs are small with a "px" suffix.
  - Each change shows instantly in the preview and "Unsaved changes" appears.
  - Save gives "All changes saved". Leaving unsaved asks "Discard unsaved changes?".

### JRN-174 Home screen and starters editor
- steps: Turn off Cart. Rename "Track orders" to "Track my order". Add a starter "Size help" → Start a workflow → Hat size finder (Off). Add one with an empty label. Add "Shipping info" → Open a link with "notaurl". Fix the issues. Reorder by drag. Delete one. Try adding a 9th.
- expected:
  - Cart disappears from the preview and the pill reads "Track my order".
  - The warnings read "This workflow is off. It will ask the AI instead.", "Add a label." and "Enter a valid URL.".
  - Reordering and deleting update the preview. A 9th starter is blocked at the max of 8.

### JRN-175 Conversation settings
- steps: Change the chatbot name to "Goorin Bros.", turn thumbs feedback Off, turn "Ask for email before chat" On, then preview Conversation.
- expected: The name is used in the AI notice and labels, the thumbs are hidden, and the pre-chat step shows in the preview.

### JRN-176 Focus ring, phone and access
- steps: Click Channels in the sidebar with the mouse, then Tab to it with the keyboard. At 390 open /widget-demo and the Channels page.
- expected:
  - A mouse click shows no thick outline; the keyboard shows a focus ring.
  - On the phone the widget is a full-height sheet with the floating controls and safe area, and the Channels preview opens from a "Preview" button as a full-screen sheet.
  - There's no overflow and tap targets are ≥ 44px. axe finds 0 serious or critical issues, including inside the widget, and the text contrast on the frosted panel passes AA.
