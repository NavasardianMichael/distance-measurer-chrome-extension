import '@/content/styles.module.css'
import { applyStoredMetricColors } from '@/content/helpers/metric-colors'
import { initDistanceMeasurer } from '@/content/index'

function initDistanceMeasurerApp() {
  const container = document.createElement('div')
  container.id = 'distance-measurer-extension-root'
  document.body.appendChild(container)

  void applyStoredMetricColors(container)

  const { destroy } = initDistanceMeasurer(container)

  // Ref object so we can null out after teardown and allow GC of observer, destroy, and container.
  const ref: {
    observer: MutationObserver | null
    destroy: (() => void) | null
    container: HTMLElement | null
  } = { observer: null, destroy, container }

  const teardown = () => {
    ref.observer?.disconnect()
    ref.observer = null
    ref.destroy?.()
    ref.destroy = null
    ref.container = null
  }

  ref.observer = new MutationObserver((mutations) => {
    for (const mutation of mutations) {
      if (mutation.type === 'childList' && ref.container && Array.from(mutation.removedNodes).includes(ref.container)) {
        teardown()
        return
      }
    }
  })
  ref.observer.observe(document.body, { childList: true, subtree: false })

  window.addEventListener('pagehide', teardown)
}

initDistanceMeasurerApp()
