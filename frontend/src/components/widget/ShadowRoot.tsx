import { useLayoutEffect, useRef, useState, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import widgetCss from './widget.css?inline'

// Renders children inside an open shadow root with the widget stylesheet injected into it.
// Store CSS can't select into the shadow tree, and :host { all: initial } blocks inherited styles.
export function ShadowRoot({ children, onHost }: { children: ReactNode; onHost?: (host: HTMLElement) => void }) {
  const hostRef = useRef<HTMLDivElement>(null)
  const [mount, setMount] = useState<HTMLElement | null>(null)

  useLayoutEffect(() => {
    const host = hostRef.current!
    const root = host.shadowRoot ?? host.attachShadow({ mode: 'open' })
    const style = document.createElement('style')
    style.setAttribute('data-goorin-widget-styles', '')
    style.textContent = widgetCss
    const el = document.createElement('div')
    root.replaceChildren(style, el)
    setMount(el)
    onHost?.(host)
    return () => {
      root.replaceChildren()
      setMount(null)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  return (
    <div ref={hostRef} data-testid="widget-host" data-goorin-widget="">
      {mount && createPortal(children, mount)}
    </div>
  )
}
