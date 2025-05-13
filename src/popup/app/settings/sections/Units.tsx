import { FC, Fragment } from 'react'
import {
  REST_FIELDS_TEMPLATES,
  REST_FIELD_NAMES,
  UNITS_TYPES_PROPS,
  UNIT_TYPES_SELECTIONS_TEMPLATES,
  UNIT_TYPE_FIELD_NAMES,
  UNIT_TYPE_SELECTION_TEMPLATE,
} from '_shared/constants/settings'
import { combineClassNames } from '_shared/functions/commons'
import { SettingsCommonProps } from '../Settings'
import styles from '../settings.module.css'

export const Units: FC<SettingsCommonProps> = ({
  handleInputChange,
  handleUnitTypeChange,
  handleInputBlur,
  settings,
}) => {
  return (
    <>
      {UNIT_TYPES_SELECTIONS_TEMPLATES.map((unitTypeTemplate) => {
        const { fieldName, label } = unitTypeTemplate.unitType
        const isSecondaryField = fieldName === UNIT_TYPE_FIELD_NAMES.secondaryUnit

        return (
          <Fragment key={fieldName}>
            {isSecondaryField && (
              <div className={combineClassNames(styles.flex, styles.spaceSM)}>
                <label htmlFor={REST_FIELD_NAMES.showSecondaryUnit}>
                  {REST_FIELDS_TEMPLATES.showSecondaryUnit.label}
                </label>
                <div className={styles.switch}>
                  <input
                    type="checkbox"
                    id={REST_FIELD_NAMES.showSecondaryUnit}
                    name={REST_FIELD_NAMES.showSecondaryUnit}
                    onChange={handleInputChange}
                    checked={settings.showSecondaryUnit}
                  />
                  <span className={styles.slider}></span>
                </div>
              </div>
            )}

            {isSecondaryField && !settings.showSecondaryUnit ? null : (
              <>
                <div className={combineClassNames(styles.flex, styles.column, styles.spaceSM)}>
                  <label htmlFor={fieldName}>{label}</label>
                  <select id={fieldName} name={fieldName} onChange={handleUnitTypeChange} value={settings[fieldName]}>
                    {UNIT_TYPE_SELECTION_TEMPLATE.map((unit) => {
                      return (
                        <option
                          key={`${fieldName}-${unit.value}`}
                          value={unit.value}
                          disabled={
                            isSecondaryField
                              ? settings.primaryUnit === unit.value
                              : settings.showSecondaryUnit && settings.secondaryUnit === unit.value
                          }
                        >
                          {unit.label}
                        </option>
                      )
                    })}
                  </select>
                </div>
                <div className={combineClassNames(styles.flex, styles.column, styles.spaceSM)}>
                  <label htmlFor={unitTypeTemplate.unitStep.fieldName}>{unitTypeTemplate.unitStep.label}</label>
                  <div className={combineClassNames(styles.flex, styles.spaceSM)}>
                    <input
                      type="range"
                      name={unitTypeTemplate.unitStep.fieldName}
                      value={settings[unitTypeTemplate.unitStep.fieldName]}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      min={UNITS_TYPES_PROPS.byType[settings[fieldName]].minStep}
                      max={UNITS_TYPES_PROPS.byType[settings[fieldName]].maxStep}
                    />
                    <input
                      type="number"
                      id={unitTypeTemplate.unitStep.fieldName}
                      name={unitTypeTemplate.unitStep.fieldName}
                      value={settings[unitTypeTemplate.unitStep.fieldName]}
                      onChange={handleInputChange}
                      onBlur={handleInputBlur}
                      min={UNITS_TYPES_PROPS.byType[settings[fieldName]].minStep}
                      max={UNITS_TYPES_PROPS.byType[settings[fieldName]].maxStep}
                    />
                  </div>
                </div>
              </>
            )}
          </Fragment>
        )
      })}
    </>
  )
}
