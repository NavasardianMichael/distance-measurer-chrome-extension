import { generateArrow } from '_shared/functions/metrics'
import styles from './styles.module.css'

// console.log({ container })

// const frame = {
//   topBorder: document.createElement('div'),
//   bottomBorder: document.createElement('div'),
//   leftBorder: document.createElement('div'),
//   rightBorder: document.createElement('div'),
// }
// const frameBorderNames = ['topBorder', 'bottomBorder', 'leftBorder', 'rightBorder']

// frameBorderNames.forEach((frameBorderName) => {
//   frame[frameBorderName].classList.add(styles.frameBorder)
// })

const constructMetrics = (elementsSet: Set<HTMLElement>) => {
  const elements = Array.from(elementsSet)

  const firstElement = elements[0]
  const firstElementRect = firstElement.getBoundingClientRect()
  const secondElement = elements[1]
  const secondElementRect = secondElement.getBoundingClientRect()

  const frameTop = Math.max(firstElementRect.bottom, secondElementRect.bottom)
  const frameBottom = Math.min(firstElementRect.top, secondElementRect.top)
  const frameLeft = Math.min(firstElementRect.right, secondElementRect.right)
  const frameRight = Math.max(firstElementRect.left, secondElementRect.left)

  const metricsFragment = document.createDocumentFragment()

  const frameTopBorder = document.createElement('div')
  frameTopBorder.classList.add(styles.frameBorder)
  frameTopBorder.classList.add(styles.frameHorizontalBorder)
  frameTopBorder.style.top = `${frameTop}px`
  metricsFragment.appendChild(frameTopBorder)

  const frameBottomBorder = document.createElement('div')
  frameBottomBorder.classList.add(styles.frameBorder)
  frameBottomBorder.classList.add(styles.frameHorizontalBorder)
  frameBottomBorder.style.top = `${frameBottom}px`
  metricsFragment.appendChild(frameBottomBorder)

  const frameLeftBorder = document.createElement('div')
  frameLeftBorder.classList.add(styles.frameBorder)
  frameLeftBorder.classList.add(styles.frameVerticalBorder)
  frameLeftBorder.style.left = `${frameLeft}px`
  metricsFragment.appendChild(frameLeftBorder)

  const frameRightBorder = document.createElement('div')
  frameRightBorder.classList.add(styles.frameBorder)
  frameRightBorder.classList.add(styles.frameVerticalBorder)
  frameRightBorder.style.left = `${frameRight}px`
  metricsFragment.appendChild(frameRightBorder)

  const horizontalArrowMetric = generateArrow(
    frameLeft,
    frameTop,
    Math.abs(frameLeft - frameRight),
    Math.abs(frameTop - frameBottom),
    20,
    20
  )
  metricsFragment.appendChild(horizontalArrowMetric)

  return metricsFragment
}

const initMetrics = (app: HTMLDivElement) => {
  return {
    paintMetrics: (elements: Set<HTMLElement>) => {
      app.innerHTML = ''
      app.appendChild(constructMetrics(elements))
    },
    removeMetrics: () => {
      app.innerHTML = ''
    },
  }
}

export const initDistanceMeasurer = (app: HTMLDivElement) => {
  const { paintMetrics, removeMetrics } = initMetrics(app)

  const hoveredClassName = styles.hovered
  const selectedClassName = styles.selected

  let isCtrlPressed = false
  let hoveredElement: HTMLElement | null = null
  const selectedElements: Set<HTMLElement> = new Set([])

  window.addEventListener('keydown', (e) => {
    if (e.ctrlKey) isCtrlPressed = true
  })

  window.addEventListener('keyup', (e) => {
    if (!e.ctrlKey) {
      isCtrlPressed = false
      // removeMetrics()

      if (hoveredElement) {
        hoveredElement.classList.remove(hoveredClassName)
        hoveredElement = null
      }

      selectedElements.forEach((el) => {
        el.classList.remove(selectedClassName)
      })
      selectedElements.clear()
    }
  })

  document.addEventListener('mouseover', (e) => {
    if (!isCtrlPressed) return

    const target = e.target
    if (target === hoveredElement || !(target instanceof HTMLElement)) return

    if (hoveredElement) {
      hoveredElement.classList.remove(hoveredClassName)
    }

    hoveredElement = target
    hoveredElement.classList.add(hoveredClassName)
  })

  document.addEventListener('mouseout', () => {
    if (hoveredElement) {
      hoveredElement.classList.remove(hoveredClassName)
      hoveredElement = null
    }
  })

  document.addEventListener('click', (e) => {
    const clickedElement = e.target as HTMLElement
    if (!isCtrlPressed || selectedElements.has(clickedElement)) return

    if (selectedElements.size === 2) {
      const iterator = selectedElements.values()
      const firstElement = iterator.next().value as HTMLElement
      firstElement.classList.remove(selectedClassName)
      selectedElements.delete(firstElement)
    }
    clickedElement.classList.add(selectedClassName)
    selectedElements.add(clickedElement)
    if (selectedElements.size === 2) {
      paintMetrics(selectedElements)
    }
  })
}
