import { INCHES_BY_UNIT, PX_BY_UNITS } from '_shared/constants/settings'
import { UnitType } from '_shared/types/settings'

const getPPIByDeviceDiagonalInInches = (deviceDiagonalInInches: number, scale: number) => {
  const widthInPx = screen.width / scale
  const heightInPx = screen.height / scale
  const diagonalInPx = Math.sqrt(widthInPx ** 2 + heightInPx ** 2)
  const ppi = diagonalInPx / deviceDiagonalInInches
  return ppi
}

export const checkUnitTypeRatioToPx = (unitType: UnitType, scale: number, deviceDiagonalInInches?: number): number => {
  if (deviceDiagonalInInches) {
    return getPPIByDeviceDiagonalInInches(deviceDiagonalInInches, scale) * INCHES_BY_UNIT[unitType]
  }

  return PX_BY_UNITS[unitType] / scale
}

export const checkAreOnSameLine = (...args: number[]) => {
  return new Set(args).size !== args.length
}