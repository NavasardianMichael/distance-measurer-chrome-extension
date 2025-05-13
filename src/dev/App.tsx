import { SettingsState } from '_shared/types/settings'
import { UIState } from '_shared/types/ui'
import { DistanceMeasurer } from 'content/distance-measurer.component'

export type Setters = {
  setSettings: (newSettings: Partial<SettingsState>) => void
  setUI: (newUI: Partial<UIState>) => void
}

export const App = () => {
  return <DistanceMeasurer />
}
