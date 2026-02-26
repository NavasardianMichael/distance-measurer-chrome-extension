import { initDistanceMeasurer } from '@/content/index'

function initDistanceMeasurerApp() {
  const container = document.createElement('div')
  container.id = 'distance-measurer-extension-root'
  document.body.appendChild(container)

  initDistanceMeasurer(container)
}

initDistanceMeasurerApp()
