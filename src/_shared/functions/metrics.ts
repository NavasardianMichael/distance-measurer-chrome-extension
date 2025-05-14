export const generateArrow = (
  x: number,
  y: number,
  shaftLength: number,
  shaftWidth: number,
  headLength: number,
  headWidth: number
) => {
  const arrowheadPoints = `
    ${x + shaftLength},${y - headWidth / 2} 
    ${x + shaftLength + headLength},${y} 
    ${x + shaftLength},${y + headWidth / 2}
  `

  const svg = document.createElementNS('http://www.w3.org/2000/svg', 'svg')

  svg.innerHTML = `
    <svg width="${shaftLength + headLength + 20}" height="${y * 2}">
      <rect x="${x}" y="${y - shaftWidth / 2}" width="${shaftLength}" height="${shaftWidth}" fill="black" />
      <polygon points="${arrowheadPoints}" fill="black" />
    </svg>
  `

  return svg
}
