# Phase 13 Journeys (AI & Workflows refresh + Workflows automation)

Sign in as ava@goorin.com / goorin123 (Admin) at 1440 unless stated. All data is MOCKED and resets on reload.

superseded: the Workflows part of JRN-118, where Workflows held rules, business hours and assignment. That content now lives on Routing (JRN-157).

### JRN-156 Page design and tabs
- steps: Open AI & Workflows. Read the header and tabs. Visit each tab. Search "business hours" with Ctrl+K.
- expected:
  - The new subtitle shows, with tabs Brand voice · AI replies · Workflows · Routing · Conversation testing.
  - Every tab uses the shared two-column settings pattern and the same sticky save bar.
  - No select wraps its text.
  - The search result lands on /ai/routing.

### JRN-157 Routing
- steps: Open Routing. Add a rule "If Message contains keyword 'wholesale' → hand to Team Wholesale". Drag it to the top. Delete another rule. Change Friday hours. Switch assignment to Manual. Save. Reload.
- expected:
  - The rules show as aligned sentence rows, and reordering and delete work.
  - Hours and assignment save with the toast.
  - After the reload the seed is restored, like all mock data.

### JRN-158 Workflows list and templates
- steps: Open Workflows. Read the stats and the Order tracking row. Open ⋯ on it. Use the "Wholesale inquiry" template. Go back. Duplicate Order tracking, rename the copy, then delete it.
- expected:
  - The stats strip shows Active, Runs (7 days), Completed % and Handed to a person %.
  - The Order tracking row shows its trigger summary, chat/form/email icons, Active, runs, completed % and "Edited … by …".
  - The template cards show 4 templates with descriptions and step counts.
  - Use template opens the editor of a new Draft "Wholesale inquiry", which then appears in the list as Draft.
  - Duplicate, rename and delete (with confirm) work.

### JRN-159 List view editing
- steps: Open Order tracking in List view. Click step 2 and change the question text. Insert a "Send message" between steps 1 and 2 using {{email}}. Note the variable picker. Drag a step to reorder. Open the Condition and add a step in the "Otherwise" branch.
- expected:
  - The trigger card shows the intent, phrases, channels and the quick reply.
  - Steps are numbered cards with connectors. Branches show side by side.
  - The settings panel updates the card instantly.
  - The variable picker offers only variables set earlier: {{email}} isn't available before step 2, and the inserted message gets flagged as an issue.
  - "Unsaved changes" shows.

### JRN-160 Canvas view and sync
- steps: Toggle to Canvas. Pan, zoom, fit view. Drag a new "Add tag" step onto the board and connect it. Delete an arrow. Click Tidy up. Toggle back to List, then to Canvas 4 more times.
- expected:
  - The board shows step boxes with arrows, a minimap and zoom controls.
  - A new step drops in unconnected with a warning outline and is listed in Issues. Connecting it clears the warning. Deleting an arrow creates an issue.
  - Tidy up lays the board out cleanly.
  - After every toggle, List and Canvas show identical steps, branches and settings.

### JRN-161 Validation and turning on
- steps: Create a workflow from blank with an Ask step that saves no variable and a branch with no end. Click Turn on. Also try the list toggle on it. Fix the issues. Turn on. Make a second Active workflow with intent "Order status" on Chat. Leave the editor with unsaved changes.
- expected:
  - Issues shows a count with jump links. Turn on is blocked with "Fix <n> issues before turning this on."
  - After the fixes it turns on.
  - The duplicate trigger shows "Two active workflows use this trigger. The first one in the list runs."
  - Leaving with unsaved changes asks "Discard unsaved changes?".

### JRN-162 Test Order tracking: happy path
- steps: On Order tracking click Test workflow (Chat). Type "where is my order". Enter "margaret.okonkwo@example.com". Read the mock inbox. Enter the code.
- expected:
  - The bot says "Happy to help you track your order." and asks for the email.
  - The mock inbox shows "Your Goorin verification code" from Goorin Bros. <support@goorin.com> with a 6-digit code.
  - No order details appear before the code.
  - After the correct code: order cards for Margaret's real orders (including #GB20398 $148.00, plus status, carrier and a "Track package" link), then "Anything else I can help with?" with buttons. "That's all" ends with the CSAT question.
  - The run log lists each step, and the current step is highlighted in the editor.

### JRN-163 Test Order tracking: unhappy paths
- steps: Test with an invalid email "margaret@". Then use a valid email and enter a wrong code 3 times. Reset. Use "new.customer@example.com" with the correct code. Click Resend code once. Switch the channel to Email and run it.
- expected:
  - "That doesn't look like an email address."
  - Wrong codes show "That code didn't match. You have 2 tries left." and then 1. The third ends with "Test run ended: handed to Support (no real ticket created)."
  - The no-orders email shows "I couldn't find any orders for new.customer@example.com." with "Try another email" / "Talk to a person".
  - Resend sends a new code to the mock inbox, and the old one no longer works.
  - The Email channel skips the code steps and shows the order-details reply addressed to the sender.

### JRN-164 Templates work when tested
- steps: Create from each template and Test it once: Start a return (Loop), Change shipping address (with an unfulfilled order and a fulfilled one), Wholesale inquiry, Hat size finder (58 cm, then "I don't know").
- expected:
  - Return ends with a mock "#LR-<n>" and a label link.
  - Address change updates the mock unfulfilled order, and a fulfilled order hands over.
  - Wholesale collects 4 answers, tags "wholesale" and hands to Wholesale.
  - The size finder recommends the right size for 58 cm (M or L per the seeded table) and shows the measuring tip for "I don't know".

### JRN-165 Runtime in the widget
- steps: Open /widget-demo. In the chat type "has my order shipped". Complete the flow using the Mock inbox drawer. Then turn Order tracking Off in Workflows and ask again.
- expected:
  - While Active, the widget runs the workflow with code verification and the Mock inbox drawer shows the code, then the orders.
  - While Off, the normal AI reply answers instead.

### JRN-166 Phone and access
- steps: At 390 open Workflows, open Order tracking, edit a step, run Test. At 1440 tab through the editor.
- expected:
  - On the phone the list shows as cards, the editor is List-only with the note "Canvas editing works on larger screens.", step settings open as a bottom sheet, and Test is full screen with Chat / Inbox tabs.
  - There's no overflow and tap targets are ≥ 44px. axe finds 0 serious or critical issues.
  - Every editor action is reachable by keyboard in List view.
