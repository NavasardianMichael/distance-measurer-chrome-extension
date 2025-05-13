import { createRoot } from 'react-dom/client'
import { App } from './App'

function initReactApp() {
  const container = document.createElement('div')
  container.id = 'ruler-extension-root'

  document.body.appendChild(container)

  const root = createRoot(container)
  root.render(<App />)
}

initReactApp()
