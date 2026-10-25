import { Component, type ReactNode } from 'react'

// Keeps a widget crash contained: the storefront keeps rendering, the widget just disappears.
export class WidgetErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false }

  static getDerivedStateFromError() {
    return { failed: true }
  }

  componentDidCatch(error: unknown) {
    console.error('Goorin widget crashed', error)
  }

  render() {
    return this.state.failed ? null : this.props.children
  }
}
