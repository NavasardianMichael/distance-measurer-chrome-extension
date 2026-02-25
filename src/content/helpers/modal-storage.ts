import { MODAL_STORAGE_KEYS, MODAL_VIEWPORT_THRESHOLD } from '@/content/constants/modal'

export type ModalBounds = { left: number; top: number; width: number; height: number }

export function clampModalToViewport(
  bounds: ModalBounds,
  vw: number,
  vh: number,
  threshold: number = MODAL_VIEWPORT_THRESHOLD
): ModalBounds {
  const { left, top, width, height } = bounds
  const minLeft = threshold - width
  const maxLeft = vw - threshold
  const minTop = threshold - height
  const maxTop = vh - threshold
  return {
    left: Math.round(Math.max(minLeft, Math.min(left, maxLeft))),
    top: Math.round(Math.max(minTop, Math.min(top, maxTop))),
    width,
    height,
  }
}

export async function getStoredModalBounds(): Promise<ModalBounds | null> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local?.get) {
      const out = await chrome.storage.local.get([
        MODAL_STORAGE_KEYS.LEFT,
        MODAL_STORAGE_KEYS.TOP,
        MODAL_STORAGE_KEYS.WIDTH,
        MODAL_STORAGE_KEYS.HEIGHT,
      ])
      const left = out[MODAL_STORAGE_KEYS.LEFT]
      const top = out[MODAL_STORAGE_KEYS.TOP]
      const width = out[MODAL_STORAGE_KEYS.WIDTH]
      const height = out[MODAL_STORAGE_KEYS.HEIGHT]
      if (
        typeof left === 'number' &&
        typeof top === 'number' &&
        typeof width === 'number' &&
        typeof height === 'number'
      ) {
        return { left, top, width, height }
      }
    }
  } catch (error) {
    console.error(error)
  }
  return null
}

export function saveModalBounds(bounds: ModalBounds): void {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local?.set) {
      chrome.storage.local.set({
        [MODAL_STORAGE_KEYS.LEFT]: bounds.left,
        [MODAL_STORAGE_KEYS.TOP]: bounds.top,
        [MODAL_STORAGE_KEYS.WIDTH]: bounds.width,
        [MODAL_STORAGE_KEYS.HEIGHT]: bounds.height,
      })
    }
  } catch (error) {
    console.error(error)
  }
}
