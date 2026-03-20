function closePopup(): void {
  // In Chrome extension popups, `window.close()` should dismiss the popup.
  window.close()
}

document.addEventListener('DOMContentLoaded', () => {
  const closeBtn = document.getElementById('close') as HTMLButtonElement | null

  closeBtn?.addEventListener('click', (e) => {
    e.preventDefault()
    closePopup()
  })

  // Accessibility: allow users to close with `Escape`.
  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closePopup()
  })

  // Make keyboard users start at a sensible focus target.
  closeBtn?.focus()
})

