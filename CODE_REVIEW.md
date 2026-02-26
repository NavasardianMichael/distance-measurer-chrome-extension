# Code Review: Distance Measurer Chrome Extension

Senior-engineer review: functionality, performance, and code quality. Items are ordered by impact (bugs/correctness first, then performance, then quality).

---

## 1. Bugs / Correctness

### 1.1 Manifest: wrong action title (copy-paste)

**File:** `src/manifest.ts`  
**Issue:** `action.default_title` is `'Ruler Extension'` but the extension name is `'Distance Measurer'`.

**Fix:**
```ts
default_title: 'Distance Measurer',
```

### 1.2 Content entry: misleading name and no cleanup

**File:** `src/content/content.ts`  
**Issues:**
- Function is named `initReactApp()` but the app is vanilla DOM/TS, not React.
- Root is appended to `document.body` but there is no teardown; if the script were ever re-run or the root removed, global listeners in `index.ts` would remain (see 2.1).

**Fix:** Rename to `initDistanceMeasurerApp()` (or similar). Optionally expose a `destroy()` that removes the root and all listeners added in `initDistanceMeasurer`.

### 1.3 Modal HTML: possible leading text node

**File:** `src/content/helpers/modal-html.ts`  
**Issue:** The template literal has a leading newline/whitespace before the first `<div>`. Assigning to `innerHTML` can create a leading text node, which may affect layout or queries.

**Fix:** Return trimmed HTML:
```ts
return `
    <div class="${styles.moreInfoModalHeader}" ...>
...
`.trim()
```

---

## 2. Performance

### 2.1 Global listeners never removed

**File:** `src/content/index.ts`  
**Issue:** `initDistanceMeasurer(app)` adds 5 document/window listeners (mousemove, keydown, keyup, mouseover, mouseout, two clicks) and never removes them. For a content script that runs once per page this is usually acceptable, but:
- If the root is ever removed (e.g. in tests or future SPA navigation), listeners keep running and may reference detached nodes or stale state.
- Listener count grows if init is ever called more than once.

**Recommendation:** Keep a single delegated handler where possible and/or return a cleanup function that removes all listeners and clears state, and call it when the root is removed (if you ever support that).

### 2.2 Passive mousemove

**File:** `src/content/index.ts`  
**Issue:** The `mousemove` listener only updates `lastMouseX` / `lastMouseY` and does not call `preventDefault()`. Marking it passive helps the browser optimize scrolling.

**Fix:**
```ts
document.addEventListener('mousemove', (e) => {
  lastMouseX = e.clientX
  lastMouseY = e.clientY
}, { passive: true })
```

### 2.3 Redundant getBoundingClientRect in computeArrangedRects

**File:** `src/content/helpers/metrics.ts`  
**Issue:** `computeArrangedRects` calls `getBoundingClientRect()` twice per element (once for ordering, then again in the `Object.fromEntries` map). That’s four extra layout reads.

**Fix:** Use the already-read rects when building `arrangedRects`:
```ts
const firstRect = firstElement.getBoundingClientRect()
const secondRect = secondElement.getBoundingClientRect()
const arrangedElements = {
  top: firstRect.top <= secondRect.top ? firstElement : secondElement,
  bottom: firstRect.top <= secondRect.top ? secondElement : firstElement,
  left: firstRect.left <= secondRect.left ? firstElement : secondElement,
  right: firstRect.left <= secondRect.left ? secondElement : firstElement,
}
const arrangedRects = Object.fromEntries(
  (['top', 'bottom', 'left', 'right'] as const).map((key) => [
    key,
    arrangedElements[key].getBoundingClientRect(),
  ])
) as ArrangedRects
```
You still need one read per element for the final rects (layout can change), but you avoid the first redundant read by using a single map over keys and reading rect once per element.

Actually: we need rects for the chosen elements. So we have top/bottom/left/right elements. We need 4 rects. Currently we call getBoundingClientRect 4 times in the map (one per entry). Before that we called it 2 times (firstRect, secondRect). So we have 2 + 4 = 6 calls. The first two (firstRect, secondRect) are only used for ordering; the four in the map are for the actual arranged rects. So we could: (1) use firstRect and secondRect when the element is first or second (e.g. top is firstElement -> use firstRect). So we only need 2 getBoundingClientRect calls total when the two elements are in different positions. When top and bottom are the same element we'd use the same rect. So we can build arrangedRects from firstRect and secondRect based on which element is top/bottom/left/right. That gives 2 getBoundingClientRect calls instead of 6.

**Fix (corrected):**
```ts
const firstRect = firstElement.getBoundingClientRect()
const secondRect = secondElement.getBoundingClientRect()
const topEl = firstRect.top <= secondRect.top ? firstElement : secondElement
const bottomEl = firstRect.top <= secondRect.top ? secondElement : firstElement
const leftEl = firstRect.left <= secondRect.left ? firstElement : secondElement
const rightEl = firstRect.left <= secondRect.left ? secondElement : firstElement
const topRect = topEl === firstElement ? firstRect : secondRect
const bottomRect = bottomEl === firstElement ? firstRect : secondRect
const leftRect = leftEl === firstElement ? firstRect : secondRect
const rightRect = rightEl === firstElement ? firstRect : secondRect
const arrangedRects: ArrangedRects = { top: topRect, bottom: bottomRect, left: leftRect, right: rightRect }
```
Then frameCoords and the rest unchanged. That’s 2 getBoundingClientRect calls instead of 6.

### 2.4 Drag/resize: throttle position/size updates (optional)

**File:** `src/content/helpers/modal-drag-resize.ts`  
**Issue:** On every `mousemove` during drag/resize we write to `dialog.style`. For very fast moves this can queue many style updates.

**Recommendation:** For a single modal this is usually fine. If you ever see jank, wrap the position/size update in `requestAnimationFrame` and skip intermediate frames (e.g. only schedule one RAF per frame).

---

## 3. Code quality and maintainability

### 3.1 Single event delegation for “extension” clicks

**File:** `src/content/index.ts`  
**Issue:** Two separate `document` click listeners (one capture, one bubble) make behavior harder to follow and easy to break when adding new rules.

**Recommendation:** Use one delegated click handler that handles both “ctrl+click on page” and “click outside to close” and branches on `e.ctrlKey`, `app.contains(target)`, overlay class, modal state, etc. Same behavior, clearer control flow.

### 3.2 Duplicate initial modal position

**Files:** `src/content/helpers/modal-ui.ts`, `src/content/helpers/modal-drag-resize.ts`  
**Issue:** `openMoreInfoModal` sets `dialog.style.left/top/width/height` when `initialBounds` is set, and then `makeModalDraggableAndResizable` also calls `applyPosition`/`applySize` with `initialBounds`. Redundant.

**Recommendation:** Set initial position/size in one place only (e.g. only inside `makeModalDraggableAndResizable`, and have `openMoreInfoModal` pass `initialBounds` and not touch `dialog.style` for bounds).

### 3.3 Storage and errors

**Files:** `src/content/helpers/modal-storage.ts`, `src/content/helpers/metric-colors.ts`  
**Issue:** `getStoredModalBounds` and `loadStoredMetricColors` catch errors and return null/defaults; `saveModalBounds` and color save log to `console.error` or swallow. Consistent and safe, but in production you may want to avoid logging on expected failures (e.g. storage unavailable) or use a small logger that can be turned off.

**Recommendation:** Keep current behavior for resilience; optionally gate `console.error` behind a dev flag or replace with a no-op logger in production.

### 3.4 Modal HTML as string

**File:** `src/content/helpers/modal-html.ts`  
**Issue:** Large HTML string with interpolated `styles.*` and `formatPx()` is valid but brittle (e.g. missing escape if you ever interpolate user content). Currently all inputs are numbers or trusted strings.

**Recommendation:** No change required for security now. If the modal content grows or becomes dynamic, consider DOM builders or a tiny template helper that escapes interpolated values.

### 3.5 Constants and types

**General:** Constants (`measurement`, `modal`, `theme`) and types (`ModalBounds`, `ArrangedRects`, `FrameCoords`) are clear and colocated. Good.

**Minor:** `modal-drag-resize`’s `onBoundsChange` is optional and never passed from `modal-ui.ts`. Either use it (e.g. to sync state) or remove it from the option type to keep the API honest.

---

## 4. Summary table

| Priority | Item                          | File(s)                    | Effort |
|----------|-------------------------------|----------------------------|--------|
| P0       | Manifest action title          | `manifest.ts`              | 1 min  |
| P0       | Modal HTML leading whitespace | `modal-html.ts`           | 1 min  |
| P1       | Passive mousemove             | `index.ts`                 | 1 min  |
| P1       | Fewer getBoundingClientRect   | `metrics.ts`               | 5 min  |
| P1       | Rename initReactApp           | `content.ts`               | 2 min  |
| P2       | Single delegated click       | `index.ts`                 | 15 min |
| P2       | Initial bounds in one place   | `modal-ui.ts`, drag-resize | 5 min  |
| P2       | Teardown / cleanup            | `index.ts`, `content.ts`   | 20 min |
| P3       | RAF throttle for drag         | `modal-drag-resize.ts`     | 10 min |
| P3       | Optional onBoundsChange       | `modal-drag-resize.ts`, ui | 2 min  |

Implementing P0 and P1 gives you the highest impact for minimal time; P2/P3 improve structure and scalability.
