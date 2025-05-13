import { FC } from 'react'
import { REST_FIELDS_TEMPLATES, REST_FIELD_NAMES } from '_shared/constants/settings'
import { combineClassNames } from '_shared/functions/commons'
import { SettingsCommonProps } from '../Settings'
import styles from '../settings.module.css'

export const Toggle: FC<SettingsCommonProps> = ({ handleInputChange, settings }) => {
  return (
    <div className={combineClassNames(styles.flex, styles.spaceSM)}>
      <label htmlFor={REST_FIELDS_TEMPLATES.showRuler.name}>{REST_FIELDS_TEMPLATES.showRuler.label} (ctrl + Q)</label>
      <div className={styles.switch}>
        <input
          type="checkbox"
          id={REST_FIELD_NAMES.showRuler}
          name={REST_FIELD_NAMES.showRuler}
          onChange={handleInputChange}
          checked={settings.showRuler}
        />
        <span className={styles.slider}></span>
      </div>
    </div>
  )
}
