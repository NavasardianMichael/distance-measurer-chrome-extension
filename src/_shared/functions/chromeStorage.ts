export const getChromeLocalStorageValue = <T>(key: string): Promise<T> => {
  return new Promise((resolve) => {
    chrome.storage.local.get([key], (result) => {
      resolve(result[key])
    })
  })
}

export const setChromeLocalStorageValue = async <T>(newValue: T) => {
  if (!chrome.storage?.local) {
    console.warn(`chrome.storage.local is not found to set Value in storage`)
    return
  }

  const prev = await chrome.storage.local.get()
  const newState = {
    ...prev,
    ...newValue,
  }
  if (JSON.stringify(prev) === JSON.stringify(newState)) return
  await chrome.storage.local.set(newState)
}
