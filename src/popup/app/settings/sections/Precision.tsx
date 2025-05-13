import { FC } from 'react'
import { PRECISION_FIELDS_TEMPLATES, PRECISION_FIELD_NAMES, PRECISION_PROPS } from '_shared/constants/settings'
import { combineClassNames } from '_shared/functions/commons'
import { SettingsCommonProps } from '../Settings'
import styles from '../settings.module.css'

export const Precision: FC<SettingsCommonProps> = ({ handleInputChange, handleInputBlur, settings }) => {
  return (
    <>
      <div className={combineClassNames(styles.flex, styles.column, styles.spaceXS)}>
        <div className={combineClassNames(styles.flex, styles.spaceSM)}>
          <label htmlFor={PRECISION_FIELD_NAMES.isPreciseMode}>{PRECISION_FIELDS_TEMPLATES.isPreciseMode.label} </label>
          <div className={styles.switch}>
            <input
              type="checkbox"
              id={PRECISION_FIELD_NAMES.isPreciseMode}
              name={PRECISION_FIELD_NAMES.isPreciseMode}
              onChange={handleInputChange}
              checked={settings.isPreciseMode}
            />
            <span className={styles.slider}></span>
          </div>
        </div>
        <p className={styles.hint}>
          * Browser may misinterpret correct physical measurements,
          <br />
          turn "Precise Mode" on to guarantee precise measurements
        </p>
      </div>
      {settings.isPreciseMode && (
        <div className={combineClassNames(styles.flex, styles.column, styles.spaceSM)}>
          <label htmlFor={PRECISION_FIELD_NAMES.deviceDiagonal}>
            {PRECISION_FIELDS_TEMPLATES.deviceDiagonal.label}
          </label>
          <div className={combineClassNames(styles.flex, styles.spaceSM)}>
            <input
              type="range"
              name={PRECISION_FIELD_NAMES.deviceDiagonal}
              value={settings[PRECISION_FIELD_NAMES.deviceDiagonal]}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              min={PRECISION_PROPS.minStep}
              max={PRECISION_PROPS.maxStep}
            />
            <input
              type="number"
              id={PRECISION_FIELD_NAMES.deviceDiagonal}
              name={PRECISION_FIELD_NAMES.deviceDiagonal}
              value={settings[PRECISION_FIELD_NAMES.deviceDiagonal]}
              onChange={handleInputChange}
              onBlur={handleInputBlur}
              min={PRECISION_PROPS.minStep}
              max={PRECISION_PROPS.maxStep}
            />
          </div>
        </div>
      )}
    </>
  )
}
