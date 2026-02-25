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
    onBoundsChange?: () => void
  }
): void {
  const {
    resizeHandle,
    minWidth = MODAL_DIMENSIONS.MIN_WIDTH,
    minHeight = MODAL_DIMENSIONS.MIN_HEIGHT,
    initialBounds,
    onBoundsChange,
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
    onBoundsChange?.()
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

    const onMove = (e: MouseEvent) => {
      const dx = e.clientX - startX
      const dy = e.clientY - startY
      applyPosition(startLeft + dx, startTop + dy)
    }
    const onUp = () => {
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

    const onMove = (e: MouseEvent) => {
      const dw = e.clientX - startX
      const dh = e.clientY - startY
      applySize(startW + dw, startH + dh)
    }
    const onUp = () => {
      document.removeEventListener('mousemove', onMove)
      document.removeEventListener('mouseup', onUp)
      saveBoundsToStorage()
    }
    document.addEventListener('mousemove', onMove)
    document.addEventListener('mouseup', onUp)
  })
}
