import { initDistanceMeasurer } from '@/content/index'

function initReactApp() {
  const container = document.createElement('div')
  container.id = 'distance-measurer-extension-root-dev'
  document.body.appendChild(container)

  initDistanceMeasurer(container)
}

initReactApp()
