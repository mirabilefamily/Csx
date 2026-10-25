// Deliberately aggressive "store theme" CSS. It restyles everything on the page except the demo controls.
// The widget lives in a shadow root, so none of these selectors can reach it.
export const HOSTILE_CSS = `
html { font-size: 21px !important; }
body *:not([data-demo-controls]):not([data-demo-controls] *) {
  font-family: "Comic Sans MS", "Chalkboard SE", "Papyrus", cursive !important;
  letter-spacing: 0.05em !important;
  line-height: 2 !important;
  box-sizing: content-box !important;
}
body button:not([data-demo-controls] *), body a:not([data-demo-controls] *) {
  background: #ff2d95 !important; color: #00e000 !important; border: 3px dashed #1d4ed8 !important;
  border-radius: 0 !important; text-transform: uppercase !important; padding: 12px !important;
}
body img { filter: hue-rotate(150deg) saturate(2.5) !important; border: 5px solid #39ff14 !important; border-radius: 0 !important; }
body h1, body h2, body h3, body p:not([data-demo-controls] *) { color: #d40000 !important; text-decoration: underline wavy #1d4ed8 !important; }
body input, body textarea { background: #fff200 !important; border: 3px solid #000 !important; }
:is(div, section, header, footer):not([data-demo-controls]):not([data-demo-controls] *) { outline: 1px dotted rgba(255, 0, 0, 0.4) !important; }
svg { stroke-width: 4px !important; }
* { --gw-primary: #00ff00; --gw-radius: 0px; }
`
