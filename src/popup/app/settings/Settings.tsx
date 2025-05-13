import {
  ChangeEventHandler,
  FocusEventHandler,
  MouseEventHandler,
  useCallback,
  useEffect,
  useMemo,
  useState,
} from 'react'
import {
  BINARY_FIELD_NAMES,
  REST_FIELD_NAMES,
  SETTINGS_FORM_INITIAL_VALUES,
  UNITS_TYPES_PROPS,
  UNIT_TYPE_FIELD_NAMES,
  UNIT_TYPE_SELECTION_TEMPLATE,
} from '_shared/constants/settings'
import { UI_INITIAL_VALUES } from '_shared/constants/ui'
import { setChromeLocalStorageValue } from '_shared/functions/chromeStorage'
import { BinaryFieldName, SettingsState, UnitStepFieldName, UnitType, UnitTypeFieldName } from '_shared/types/settings'
import { State } from '_shared/types/state'
import { Colors } from './sections/Colors'
import { Precision } from './sections/Precision'
import { Rotation } from './sections/Rotation'
import { Toggle } from './sections/Toggle'
import { Units } from './sections/Units'
import styles from './settings.module.css'

export type SettingsCommonProps = {
  handleInputChange: ChangeEventHandler<HTMLInputElement>
  handleUnitTypeChange: ChangeEventHandler<HTMLSelectElement>
  handleInputBlur: FocusEventHandler<HTMLInputElement>
  settings: SettingsState
}

export const Settings = () => {
  const [settings, setSettings] = useState(SETTINGS_FORM_INITIAL_VALUES)
  const [isSyncedWithChromeStorage, setIsSyncedWithChromeStorage] = useState(false)

  useEffect(() => {
    const initialSyncWithStorage = async () => {
      const state: State = await chrome.storage.local.get()
      const { settings: settingsFromStorage, ui: uiFromStorage } = state
      if (
        !settingsFromStorage ||
        !uiFromStorage ||
        Object.keys(settingsFromStorage)?.length === 0 ||
        Object.keys(uiFromStorage)?.length === 0
      ) {
        await setChromeLocalStorageValue({ settings: SETTINGS_FORM_INITIAL_VALUES, ui: UI_INITIAL_VALUES })
      } else {
        setSettings({ ...SETTINGS_FORM_INITIAL_VALUES, ...settingsFromStorage })
      }
      setIsSyncedWithChromeStorage(true)
    }

    initialSyncWithStorage()
  }, [])

  const handleUnitTypeChange: ChangeEventHandler<HTMLSelectElement> = useCallback((event) => {
    const name = event.target.name as UnitTypeFieldName
    const isSecondary = name === UNIT_TYPE_FIELD_NAMES.secondaryUnit
    const value = event.target.value as UnitType
    setSettings((prev) => {
      const result = {
        ...prev,
        [name]: value,
      }
      if (isSecondary) {
        result.secondaryUnitStep = UNITS_TYPES_PROPS.byType[value].minStep
      } else {
        result.primaryUnitStep = UNITS_TYPES_PROPS.byType[value].primaryMinStep
      }
      setChromeLocalStorageValue({ settings: result })
      return result
    })
  }, [])

  const handleInputChange: ChangeEventHandler<HTMLInputElement> = useCallback(
    (event) => {
      const { name, value } = event.target

      setSettings((prev) => {
        const newState = {
          ...prev,
          [name]: BINARY_FIELD_NAMES.includes(name as BinaryFieldName) ? !prev[name as BinaryFieldName] : value,
        }
        if (
          name === REST_FIELD_NAMES.showSecondaryUnit &&
          !prev.showSecondaryUnit &&
          settings.primaryUnit === settings.secondaryUnit
        ) {
          const randomUnit = UNIT_TYPE_SELECTION_TEMPLATE.find((unit) => unit.value !== settings.primaryUnit)
          if (randomUnit) newState.secondaryUnit = randomUnit.value
        }

        setChromeLocalStorageValue({ settings: newState })
        return newState
      })
    },
    [settings.primaryUnit, settings.secondaryUnit]
  )

  const handleInputBlur: FocusEventHandler<HTMLInputElement> = useCallback((event) => {
    const { value, min, max } = event.target
    const name = event.target.name as UnitStepFieldName

    setSettings((prev) => {
      let newState = prev
      if (value === '') {
        newState = {
          ...newState,
          [name]: SETTINGS_FORM_INITIAL_VALUES[name],
        }
      } else if (!isNaN(+min) && !isNaN(+max) && +value < +min) {
        newState = {
          ...newState,
          [name]: +min,
        }
      } else if (!isNaN(+min) && !isNaN(+max) && +value > +max) {
        newState = {
          ...newState,
          [name]: +max,
        }
      }

      setChromeLocalStorageValue({ settings: newState })
      return newState
    })
  }, [])

  const commonsProps = useMemo(() => {
    return {
      handleInputChange,
      handleUnitTypeChange,
      handleInputBlur,
      settings,
    }
  }, [handleInputBlur, handleInputChange, handleUnitTypeChange, settings])

  const handleResetSettingsClick: MouseEventHandler<HTMLButtonElement> = () => {
    setSettings(SETTINGS_FORM_INITIAL_VALUES)
    setChromeLocalStorageValue({
      settings: SETTINGS_FORM_INITIAL_VALUES,
      ui: UI_INITIAL_VALUES,
    })
  }

  if (!isSyncedWithChromeStorage) return null

  return (
    <main className={styles.settings}>
      <Toggle {...commonsProps} />
      <hr />
      <Precision {...commonsProps} />
      <hr />
      <Units {...commonsProps} />
      <hr />
      <Rotation {...commonsProps} />
      <hr />
      <Colors {...commonsProps} />
      <hr />
      <button className={styles.resetBtn} onClick={handleResetSettingsClick}>
        Reset Settings
      </button>
    </main>
  )
}
