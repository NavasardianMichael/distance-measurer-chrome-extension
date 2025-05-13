import { SETTINGS_FORM_INITIAL_VALUES } from '_shared/constants/settings'
import { UI_INITIAL_VALUES } from '_shared/constants/ui'
import { setChromeLocalStorageValue } from '_shared/functions/chromeStorage'

chrome.runtime.onInstalled.addListener(() => {
  setChromeLocalStorageValue({
    settings: SETTINGS_FORM_INITIAL_VALUES,
    ui: UI_INITIAL_VALUES,
  })
})
