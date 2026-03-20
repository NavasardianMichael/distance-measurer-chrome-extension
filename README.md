## Distance Measurer (Chrome Extension)

Instantly measure pixel-perfect spacing between elements on any webpage.

### Tutorial video

[Watch the “How it works?” tutorial on YouTube](https://www.youtube.com/watch?v=PEqnIg_tQ6M&embeds_referring_euri=https%3A%2F%2Fchromewebstore.google.com%2F&source_ve_path=MjM4NTE)

### How to use

1. On the page you want to measure, **double-tap `D`** to activate measurement mode and **keep it pressed**.
2. Hover elements to highlight them with a dashed outline.
3. **Click any two elements** you want to compare distance between (while still holding `D` so measurement mode stays active).
4. You’ll instantly see:
   - Solid frames on selected elements
   - Connecting guidelines
   - Exact pixel values for vertical and horizontal distances between selected elements
5. Click the **information icon** to open the details modal with all relevant spacing variations (top-to-top, bottom-to-bottom, etc.).
6. Move your cursor over the **eye icon** in the modal to temporarily make it transparent and see what’s behind it.

**Important!** When you are **not pressing `D`**, measurement mode will go down.

### Help popup

Click the extension from Chrome’s top-right extensions UI (the `Distance Measurer` item). It opens a popup with the same “How it works?” instructions and links.

### Published to Chrome Web Store

[Distance Measurer on the Chrome Web Store](https://chromewebstore.google.com/detail/distance-measurer/nnlpnhpjpjgbajcdpngnhhcikmmafdji)

### Build & develop

Run:

- `pnpm i`
- `pnpm run build`

Load the `dist` folder in Chrome as an unpacked extension (`chrome://extensions` → Developer mode → Load unpacked).

#### Developing without cache surprises

Chrome does **not** update content scripts in tabs that are already open when you click “Reload” on the extension. So after every build:

1. Click **Reload** on the extension in `chrome://extensions`.
2. **Refresh the page** you’re testing (F5 or Ctrl+R). That’s when the new content script is injected.

For a smoother loop, run `pnpm run dev:ext` so the extension rebuilds on file changes; then Reload + refresh the test tab.

If something still looks cached, remove the extension and load unpacked from `dist` again.
