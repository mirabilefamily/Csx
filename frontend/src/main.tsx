import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import '@fontsource/inter/400.css'
import '@fontsource/inter/500.css'
import '@fontsource/inter/600.css'
import '@fontsource-variable/inter/opsz.css'
import './index.css'
import App from './App'
import { demoToolsEnabled } from './components/DemoStateSwitcher'
import { initTitleFont } from './lib/titleFont'

if (demoToolsEnabled) initTitleFont()

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
  </StrictMode>,
)
