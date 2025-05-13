import {
  BINARY_FIELD_NAMES,
  COLOR_FIELD_NAMES,
  PRECISION_FIELD_NAMES,
  UNIT_STEP_FIELD_NAMES,
  UNIT_TYPES,
  UNIT_TYPE_FIELD_NAMES,
} from '_shared/constants/settings'

export type UnitType = (typeof UNIT_TYPES)[keyof typeof UNIT_TYPES]

export type UnitTypeFieldName = (typeof UNIT_TYPE_FIELD_NAMES)[keyof typeof UNIT_TYPE_FIELD_NAMES]

export type UnitStepFieldName = (typeof UNIT_STEP_FIELD_NAMES)[keyof typeof UNIT_STEP_FIELD_NAMES]

export type ColorFieldName = (typeof COLOR_FIELD_NAMES)[keyof typeof COLOR_FIELD_NAMES]

export type PrevisionFieldName = (typeof PRECISION_FIELD_NAMES)[keyof typeof PRECISION_FIELD_NAMES]

export type BinaryFieldName = (typeof BINARY_FIELD_NAMES)[number]

export type SettingsState = Record<UnitTypeFieldName, UnitType> &
  Record<UnitStepFieldName, number> &
  Record<ColorFieldName, string> & {
    showRuler: boolean
    showSecondaryUnit: boolean
    rotationDegree: number
    isPreciseMode: boolean
    deviceDiagonal: number
  }
