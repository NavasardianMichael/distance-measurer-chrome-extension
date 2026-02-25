import {
  DEFAULT_METRIC_PRIMARY,
  DEFAULT_METRIC_SECONDARY,
  METRIC_COLOR_STORAGE_KEYS,
  METRIC_CSS_VARS,
} from '@/content/constants/theme'

const COLOR_SAVE_DEBOUNCE_MS = 300

/** Normalize CSS color to #rrggbb for input[type=color] (e.g. "white", "#fff", "rgb(255,255,255)" to "#ffffff"). */
function toHex(color: string): string {
  const s = color.trim()
  if (!s) return DEFAULT_METRIC_PRIMARY
  if (/^#[0-9a-fA-F]{6}$/.test(s)) return s
  if (/^#[0-9a-fA-F]{3}$/.test(s)) {
    const r = s[1] + s[1], g = s[2] + s[2], b = s[3] + s[3]
    return `#${r}${g}${b}`
  }
  const rgb = s.match(/^rgb\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*\)$/)
  if (rgb) {
    const r = Math.max(0, Math.min(255, parseInt(rgb[1], 10))).toString(16).padStart(2, '0')
    const g = Math.max(0, Math.min(255, parseInt(rgb[2], 10))).toString(16).padStart(2, '0')
    const b = Math.max(0, Math.min(255, parseInt(rgb[3], 10))).toString(16).padStart(2, '0')
    return `#${r}${g}${b}`
  }
  const rgba = s.match(/^rgba\s*\(\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*,\s*[\d.]+\s*\)$/)
  if (rgba) {
    const r = Math.max(0, Math.min(255, parseInt(rgba[1], 10))).toString(16).padStart(2, '0')
    const g = Math.max(0, Math.min(255, parseInt(rgba[2], 10))).toString(16).padStart(2, '0')
    const b = Math.max(0, Math.min(255, parseInt(rgba[3], 10))).toString(16).padStart(2, '0')
    return `#${r}${g}${b}`
  }
  const named: Record<string, string> = {
    white: '#ffffff', black: '#000000', red: '#ff0000', green: '#008000', blue: '#0000ff',
  }
  return named[s.toLowerCase()] ?? DEFAULT_METRIC_PRIMARY
}

export async function loadStoredMetricColors(): Promise<{ primary: string; secondary: string }> {
  try {
    if (typeof chrome === 'undefined' || !chrome.storage?.local?.get) {
      return { primary: DEFAULT_METRIC_PRIMARY, secondary: DEFAULT_METRIC_SECONDARY }
    }
    const out = await chrome.storage.local.get([
      METRIC_COLOR_STORAGE_KEYS.PRIMARY,
      METRIC_COLOR_STORAGE_KEYS.SECONDARY,
    ])
    return {
      primary: (out[METRIC_COLOR_STORAGE_KEYS.PRIMARY] as string) ?? DEFAULT_METRIC_PRIMARY,
      secondary: (out[METRIC_COLOR_STORAGE_KEYS.SECONDARY] as string) ?? DEFAULT_METRIC_SECONDARY,
    }
  } catch {
    return { primary: DEFAULT_METRIC_PRIMARY, secondary: DEFAULT_METRIC_SECONDARY }
  }
}

export function applyMetricColors(root: HTMLElement, primary: string, secondary: string): void {
  root.style.setProperty(METRIC_CSS_VARS.PRIMARY, primary)
  root.style.setProperty(METRIC_CSS_VARS.SECONDARY, secondary)
}

export async function applyStoredMetricColors(root: HTMLElement): Promise<void> {
  const { primary, secondary } = await loadStoredMetricColors()
  applyMetricColors(root, primary, secondary)
}

/** Persist current metric colors from root to storage (same pattern as modal position/size). Debounced. */
function createDebouncedSaveMetricColors(root: HTMLElement): () => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null
  return () => {
    if (timeoutId != null) clearTimeout(timeoutId)
    timeoutId = setTimeout(() => {
      timeoutId = null
      try {
        if (typeof chrome === 'undefined' || !chrome.storage?.local?.set) return
        const computed = getComputedStyle(root)
        const primary = computed.getPropertyValue(METRIC_CSS_VARS.PRIMARY).trim() || DEFAULT_METRIC_PRIMARY
        const secondary = computed.getPropertyValue(METRIC_CSS_VARS.SECONDARY).trim() || DEFAULT_METRIC_SECONDARY
        chrome.storage.local.set({
          [METRIC_COLOR_STORAGE_KEYS.PRIMARY]: primary,
          [METRIC_COLOR_STORAGE_KEYS.SECONDARY]: secondary,
        }).catch(() => {})
      } catch {
        // ignore
      }
    }, COLOR_SAVE_DEBOUNCE_MS)
  }
}

export function createMetricColorPicker(
  kind: 'primary' | 'secondary',
  currentValue: string,
  root: HTMLElement,
  cssClass: string,
  debouncedSave: () => void
): HTMLInputElement {
  const input = document.createElement('input')
  input.type = 'color'
  input.value = currentValue
  input.classList.add(cssClass)
  input.title = kind === 'primary' ? 'Metric primary color (arrows, labels background)' : 'Metric secondary color (label text, info icon)'
  input.setAttribute('aria-label', input.title)

  input.addEventListener('input', () => {
    const value = input.value
    if (kind === 'primary') {
      root.style.setProperty(METRIC_CSS_VARS.PRIMARY, value)
    } else {
      root.style.setProperty(METRIC_CSS_VARS.SECONDARY, value)
    }
    debouncedSave()
  })

  return input
}

/** Create both pickers and a shared debounced save. Call once per metric UI; pass the same debouncedSave to both pickers. */
export function createMetricColorPickers(
  root: HTMLElement,
  cssClass: string
): { primaryPicker: HTMLInputElement; secondaryPicker: HTMLInputElement } {
  const debouncedSave = createDebouncedSaveMetricColors(root)
  const computed = getComputedStyle(root)
  const primaryRaw = computed.getPropertyValue(METRIC_CSS_VARS.PRIMARY).trim() || DEFAULT_METRIC_PRIMARY
  const secondaryRaw = computed.getPropertyValue(METRIC_CSS_VARS.SECONDARY).trim() || DEFAULT_METRIC_SECONDARY
  const primary = toHex(primaryRaw)
  const secondary = toHex(secondaryRaw)
  return {
    primaryPicker: createMetricColorPicker('primary', primary, root, cssClass, debouncedSave),
    secondaryPicker: createMetricColorPicker('secondary', secondary, root, cssClass, debouncedSave),
  }
}
