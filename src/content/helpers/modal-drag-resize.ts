import { MODAL_DIMENSIONS } from '@/content/constants/modal'
import type { ModalBounds } from '@/content/helpers/modal-storage'
import { saveModalBounds } from '@/content/helpers/modal-storage'
import styles from '@/content/styles.module.css'

export function makeModalDraggableAndResizable(
  dialog: HTMLDivElement,
  options: {
    resizeHandle: HTMLElement
    minWidth?: number
    minHeight?: number
    initialBounds?: ModalBounds | null
  }
): void {
  const {
    resizeHandle,
    minWidth = MODAL_DIMENSIONS.MIN_WIDTH,
    minHeight = MODAL_DIMENSIONS.MIN_HEIGHT,
    initialBounds,
  } = options

  const applyPosition = (left: number, top: number) => {
    dialog.style.left = `${left}px`
    dialog.style.top = `${top}px`
    dialog.style.transform = 'none'
  }

  const applySize = (width: number, height: number) => {
    dialog.style.width = `${Math.max(minWidth, width)}px`
    dialog.style.height = `${Math.max(minHeight, height)}px`
  }

  if (initialBounds) {
    applyPosition(initialBounds.left, initialBounds.top)
    applySize(initialBounds.width, initialBounds.height)
  }

  /** Persist modal position and size to storage (same pattern as metric colors). Called on mouseup after drag or resize. */
  const saveBoundsToStorage = () => {
    const rect = dialog.getBoundingClientRect()
    saveModalBounds({
      left: Math.round(rect.left),
      top: Math.round(rect.top),
      width: Math.round(rect.width),
      height: Math.round(rect.height),
    })
  }

  const isExcludedTarget = (el: HTMLElement) =>
    el.closest(`.${styles.closeMoreInfoModalBtn}`) ||
    el.closest(`.${styles.dimModalBtn}`) ||
    el.closest(`.${styles.moreInfoModalResizeHandle}`)

  const onDialogMouseDown = (e: MouseEvent) => {
    if (isExcludedTarget(e.target as HTMLElement)) return
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const rect = dialog.getBoundingClientRect()
    const startLeft = rect.left
    const startTop = rect.top
    dialog.classList.add(styles.moreInfoModalContentDragging)

    let rafId = 0
    let lastLeft = startLeft
    let lastTop = startTop
    const flushPosition = () => {
      rafId = 0
      applyPosition(lastLeft, lastTop)
    }
    const onMove = (e: MouseEvent) => {
      lastLeft = startLeft + (e.clientX - startX)
      lastTop = startTop + (e.clientY - startY)
      if (rafId === 0) rafId = requestAnimationFrame(flushPosition)
    }
    const onUp = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = 0
      dialog.classList.remove(styles.moreInfoModalContentDragging)
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      saveBoundsToStorage()
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  }

  dialog.addEventListener('mousedown', onDialogMouseDown, true)

  resizeHandle.addEventListener('mousedown', (e) => {
    e.preventDefault()
    e.stopPropagation()
    const startX = e.clientX
    const startY = e.clientY
    const rect = dialog.getBoundingClientRect()
    const startW = rect.width
    const startH = rect.height

    let rafId = 0
    let lastW = startW
    let lastH = startH
    const flushSize = () => {
      rafId = 0
      applySize(lastW, lastH)
    }
    const onMove = (e: MouseEvent) => {
      lastW = startW + (e.clientX - startX)
      lastH = startH + (e.clientY - startY)
      if (rafId === 0) rafId = requestAnimationFrame(flushSize)
    }
    const onUp = () => {
      if (rafId) cancelAnimationFrame(rafId)
      rafId = 0
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      saveBoundsToStorage()
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  })
}
