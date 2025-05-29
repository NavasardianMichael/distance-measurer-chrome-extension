import { initDistanceMeasurer } from 'content/distance-measurer'

function initReactApp() {
  const container = document.createElement('div')
  container.id = 'distance-measurer-extension-root-dev'
  document.body.appendChild(container)

  initDistanceMeasurer(container)
}

initReactApp()
