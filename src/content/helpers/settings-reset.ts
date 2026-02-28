import {
  DEFAULT_METRIC_PRIMARY,
  DEFAULT_METRIC_SECONDARY,
  METRIC_COLOR_STORAGE_KEYS,
} from '@/content/constants/theme'
import { MODAL_STORAGE_KEYS } from '@/content/constants/modal'
import { applyMetricColors } from '@/content/helpers/metric-colors'
import styles from '@/content/styles.module.css'

const ALL_STORAGE_KEYS = [
  METRIC_COLOR_STORAGE_KEYS.PRIMARY,
  METRIC_COLOR_STORAGE_KEYS.SECONDARY,
  MODAL_STORAGE_KEYS.LEFT,
  MODAL_STORAGE_KEYS.TOP,
  MODAL_STORAGE_KEYS.WIDTH,
  MODAL_STORAGE_KEYS.HEIGHT,
] as const

/** Clear all extension settings from chrome storage. */
export async function clearAllStoredSettings(): Promise<void> {
  try {
    if (typeof chrome !== 'undefined' && chrome.storage?.local?.remove) {
      await chrome.storage.local.remove([...ALL_STORAGE_KEYS])
    }
  } catch {
    // ignore
  }
}

/** Apply default metric colors to root and document. */
export function applyDefaultMetricColors(root: HTMLElement): void {
  applyMetricColors(root, DEFAULT_METRIC_PRIMARY, DEFAULT_METRIC_SECONDARY)
}

/** Reset modal position/size to CSS defaults if modal is open. */
export function resetModalToDefaults(appRoot: HTMLElement): void {
  const dialog = appRoot.querySelector<HTMLElement>(`.${styles.moreInfoModalContent}`)
  if (!dialog) return
  dialog.style.left = '50%'
  dialog.style.top = '50%'
  dialog.style.transform = 'translate(-50%, -50%)'
  dialog.style.width = ''
  dialog.style.height = ''
}

/** Reset all settings: clear storage, apply defaults, reset modal if open. */
export async function resetAllSettings(appRoot: HTMLElement): Promise<void> {
  await clearAllStoredSettings()
  applyDefaultMetricColors(appRoot)
  resetModalToDefaults(appRoot)
}
