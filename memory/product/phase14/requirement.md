# Phase 14: Chat widget redesign + Channels chat settings refresh (requirement)

- Phase version: phase-14
- Goal: make the customer chat widget feel like the user's reference screenshots (Goorin's current production-style widget). That means a tall frosted panel with floating top controls, stacked conversation starters, a pill "Ask anything" input, bubble-less AI replies with thumbs feedback, and a soft round launcher. Then clean up the Channels → Chat settings page around it. Everything stays MOCKED (see overview.md).
- Reference (user's 4 widget screenshots):
  - **Home:** the panel uses a light warm translucent background (primary #e8e3d8) over the storefront, with a large radius (about 28px) and no title bar. Top-right floating controls: a cart icon button, a "Track orders" pill and a close X (40px, white translucent). Bottom-left stacked starter chips: "Returns Info", "Friday Drops Info", "Where is my order?", "Can I cancel / edit my order?", "Wholesale Inquiry", "See last conversation". A large pill input "Ask anything" with an image-attach icon. Footer "AI notice • Privacy".
  - **Conversation:** a back arrow at top-left, and the content scrolls under a soft top fade behind the floating controls. AI replies are plain text on the panel (no bubble) with thumbs up/down under each; the selected thumb is a filled dark circle. Customer messages are light pill bubbles on the right. The input placeholder is "Reply".
  - **Launcher:** about 64px round white button, soft shadow, dark chat-bubble-with-dots icon.
- Channels page problems seen in the user's crop:
  - 3 stacked tab levels (Chat & form | Email | Installation → Chat | Contact form → Appearance | Preferences)
  - inputs stretched across about 1,900px
  - giant position buttons
  - a small preview
  - preview copy that mentions "Claude"
  - a sidebar item showing a thick focus outline on mouse click.

## Functional requirements

### Widget: launcher and panel
- REQ-777 [always] The system shall render the launcher as a 60–64px round button in the panel surface colour, with a soft layered shadow and a dark chat-bubble-dots icon (or the custom icon), keeping the unread badge and the greeting bubble behaviour.
- REQ-778 [always] The system shall render the open panel:
  - about 400×680px on desktop, 28px radius, full-height sheet on phones
  - a frosted translucent background from the primary colour (backdrop blur, about 88–92% opacity, falling back to solid where blur isn't supported), a 1px inner highlight and a soft shadow
  - no solid header bar.
- REQ-779 [always] The system shall show floating top controls on the right: an optional Cart icon button, an optional "Track orders" pill and Close. In the conversation view a Back arrow sits on the left. All are 40px, white translucent, with a focus ring.
- REQ-780 [event] When the customer taps "Track orders", the system shall start the Active Order tracking workflow (Phase 13) in the widget. If it's Off, the AI answers normally.
- REQ-781 [event] When the customer taps the Cart button, the system shall open the storefront cart (in the demo: the mock store's cart drawer, or the toast "Cart opens here on your store").

### Widget: home view
- REQ-782 [always] The system shall show the home view with the greeting (optional, from Messaging) at the top-left in muted text, the conversation starter chips stacked and left-aligned above the input, the pill input "Ask anything" with an image-attach icon and a send arrow once text is typed, and the footer links "AI notice • Privacy".
- REQ-783 [always] The system shall seed the starters, each with an action:
  - "Returns Info" → ask the AI
  - "Friday Drops Info" → ask the AI
  - "Where is my order?" → start the Order tracking workflow
  - "Can I cancel / edit my order?" → ask the AI
  - "Wholesale Inquiry" → start the Wholesale inquiry workflow if Active, otherwise ask the AI
  - "See last conversation" → reopen the previous conversation.
- REQ-784 [state] While the customer has no previous conversation in this session, the system shall hide "See last conversation".
- REQ-785 [event] When the customer taps a starter or sends a message, the system shall switch to the conversation view.

### Widget: conversation view
- REQ-786 [always] The system shall render AI replies as plain text on the panel (15px, line-height 1.55, no bubble, no avatar), with a thumbs up / down row underneath.
- REQ-787 [event] When the customer taps a thumb, the system shall fill it (a dark filled circle with a white icon), unfill the other, and record the feedback (mock). Tapping again clears it.
- REQ-788 [always] The system shall render customer messages as right-aligned light pill bubbles (white at about 70% opacity, 20px radius, max 80% width).
- REQ-789 [always] The system shall scroll content under a soft top fade behind the floating controls, auto-scroll to new messages, and show a 3-dot typing indicator as plain text style.
- REQ-790 [always] The system shall restyle the existing conversation features in this language: order cards (Phase 13 runtime), workflow buttons, handoff ("Connecting you with our team…"), offline and CSAT. The input placeholder is "Reply" in the conversation.
- REQ-791 [always] The system shall keep the AI disclosure: the AI notice link opens a short sheet: "You're chatting with Goorin's AI assistant. A person can take over anytime." plus Privacy.
- REQ-792 [state] While "Ask for email before chat" is Off (the new default, interpreted), the system shall skip the pre-chat form. Workflows and handoff ask for the email when needed. When it's On, a compact pre-chat step appears in the same style.

### Widget: preview and isolation
- REQ-793 [always] The system shall keep the Shadow DOM isolation, the forced demo states, the device, page and viewport rules, and the store-font inheritance, all applied to the new design.

### Channels → Chat settings page
- REQ-794 [always] The system shall reduce the Channels tabs to ONE level: Chat · Contact form · Email · Installation (this supersedes the "Chat & form" grouping and the Appearance / Preferences sub-tabs).
- REQ-795 [always] The system shall lay out the Chat tab as a settings column (about 640px max) plus a sticky live preview column:
  - the preview shows ONLY the widget (panel open, with the launcher below it) on a plain quiet surface, with no storefront backdrop and no "On my store" button (user change)
  - a Desktop / Phone toggle (Phone shows a simple phone outline)
  - a view switch: Home / Conversation / Order tracking (plus Offline), each rendering the panel open.
- REQ-796 [always] The system shall order the settings as section cards:
  1. Look: primary and accent colours as a compact swatch + hex field (140px each), panel style Frosted / Solid, logo upload, the "Image requirements" disclosure.
  2. Launcher: icon choice as small icon tiles; position as a compact visual 2×2 corner picker (a mini screen diagram, about 160px wide); edge spacing as two small number inputs with a "px" suffix side by side.
  3. Home screen: greeting text (optional), top buttons (toggles for Cart and "Track orders", with the label editable), conversation starters.
  4. Conversation: chatbot name, AI reply feedback (thumbs) on/off, "Ask for email before chat" on/off, offline message.
  5. Display rules: the existing ones.
  6. CSAT in chat: the existing ones.
- REQ-797 [always] The system shall let admins manage conversation starters as a list: drag to reorder; each row has a label (max 40), an action (Ask the AI / Start a workflow [pick an Active workflow] / Open a link [URL]) and delete; plus "+ Add starter" (max 8).
- REQ-798 [unwanted] If a starter has an empty label, a workflow that's Off, or an invalid URL, then the system shall show "Add a label.", "This workflow is off. It will ask the AI instead." (a warning, not blocking) or "Enter a valid URL." respectively.
- REQ-799 [always] The system shall cap control widths for readability: text inputs 480px max, number inputs 120px, selects 280px. Helper text is 13px muted under the field.
- REQ-800 [always] The system shall keep the sticky save bar ("All changes saved" / "Unsaved changes" + Save / Discard) and the leave guard. The preview always shows the draft.
- REQ-801 [always] The system shall rewrite the preview caption: "Uses the same code shoppers get. Shows your draft; nothing is sent from the preview." (no "Claude").
- REQ-802 [always] The system shall show the main sidebar's selected item with the calm selected style and a focus ring only for keyboard focus (:focus-visible), never on mouse click, app-wide.

### Contact form tab
- REQ-803 [always] The system shall give Contact form the same settings + sticky preview layout and the same input caps, with its field builder unchanged.

### Phone
- REQ-804 [state] While on a phone, the system shall open the widget as a full-height sheet with the same floating controls and safe-area padding. On the Channels page the preview sits behind a "Preview" button that opens a full-screen sheet.

## Quality requirements
```
Q-76 Tag: Visual.ReferenceMatch
     Scale: reviewer judgement that the widget matches the reference screenshots' look (frosted panel, floating controls, stacked starters, pill input, bubble-less AI with thumbs, round launcher)
     Meter: human, side by side at 1440 and 390
     Must: pass   Plan: pass
Q-77 Tag: Access.Widget
     Scale: axe serious/critical issues in the widget (inside Shadow DOM) and contrast failures of text on the frosted background over the storefront image
     Meter: audit + manual contrast check on the 3 preview views
     Must: 0   Plan: 0
Q-78 Tag: Flow.StarterActions
     Scale: starters or top buttons that don't do their configured action (ask AI / start workflow / open link / last conversation)
     Meter: tester, every seeded starter + Track orders + Cart
     Must: 0   Plan: 0
Q-79 Tag: Layout.Readability
     Scale: inputs wider than their cap, or settings column wider than about 640px, at 1440–2560
     Meter: script measure
     Must: 0   Plan: 0
Q-80 Tag: Regression.Widget
     Scale: earlier widget behaviours broken (isolation, forced states, display rules, handoff, offline, CSAT, store-font inherit, Order tracking runtime)
     Meter: phase4/5/13 checks updated
     Must: 0   Plan: 0
```
