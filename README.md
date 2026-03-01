`pnpm i`, then `pnpm run build`. Load the `dist` folder in Chrome as an unpacked extension (`chrome://extensions` → Developer mode → Load unpacked).

### Developing without cache surprises

Chrome does **not** update content scripts in tabs that are already open when you click “Reload” on the extension. So after every build:

1. Click **Reload** on the extension in `chrome://extensions`.
2. **Refresh the page** you’re testing (F5 or Ctrl+R). That’s when the new content script is injected.

For a smoother loop, run `pnpm run dev:ext` so the extension rebuilds on file changes; then Reload + refresh the test tab.

If something still looks cached, remove the extension and load unpacked from `dist` again.

---

demo screenshot demo possible pages
figma
amazon

<!-- gihub -->

<!-- google -->

privacy page
