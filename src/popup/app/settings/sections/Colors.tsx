import { FC } from 'react'
import { COLORS_SELECTIONS_TEMPLATES } from '_shared/constants/settings'
import { combineClassNames } from '_shared/functions/commons'
import { SettingsCommonProps } from '../Settings'
import styles from '../settings.module.css'

export const Colors: FC<SettingsCommonProps> = ({ handleInputChange, settings }) => {
  return (
    <>
      {COLORS_SELECTIONS_TEMPLATES.map((colorTemplate) => {
        return (
          <div className={combineClassNames(styles.flex, styles.spaceSM)}>
            <label htmlFor={colorTemplate.name}>{colorTemplate.label}</label>
            <input
              type="color"
              id={colorTemplate.name}
              name={colorTemplate.name}
              value={settings[colorTemplate.name]}
              onChange={handleInputChange}
            />
          </div>
        )
      })}
    </>
  )
}
