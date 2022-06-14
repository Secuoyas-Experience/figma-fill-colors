// CONSTS
const FONT = {
  name: "Roboto",
  weight: "Regular",
}

const LAYERS = {
  hex: "hex-layer",
  hsl: "hsl-layer",
  color: "swatch",
}

// FUNCTIONS
function rgbToHex(r, g, b) {
  return "#" + ((1 << 24) + (r << 16) + (g << 8) + b).toString(16).slice(1)
}

function rgbToHsl(r, g, b) {
  // Make r, g, and b fractions of 1
  r /= 255
  g /= 255
  b /= 255

  // Find greatest and smallest channel values
  let cmin = Math.min(r, g, b),
    cmax = Math.max(r, g, b),
    delta = cmax - cmin,
    h = 0,
    s = 0,
    l = 0

  // Calculate hue
  // No difference
  if (delta == 0) h = 0
  // Red is max
  else if (cmax == r) h = ((g - b) / delta) % 6
  // Green is max
  else if (cmax == g) h = (b - r) / delta + 2
  // Blue is max
  else h = (r - g) / delta + 4

  h = Math.round(h * 60)

  // Make negative hues positive behind 360°
  if (h < 0) h += 360

  // Calculate lightness
  l = (cmax + cmin) / 2

  // Calculate saturation
  s = delta == 0 ? 0 : delta / (1 - Math.abs(2 * l - 1))

  // Multiply l and s by 100
  s = +(s * 100).toFixed(1)
  l = +(l * 100).toFixed(1)

  return [h, s, l]
}

function isValidSwatchColorNode(node) {
  if (node.type !== "INSTANCE") {
    figma.notify("Is not a Swatch Color instance")
    return false
  }

  if (node.children.length) {
    figma.notify("Is not a Swatch Color instance")
    return false
  }
  return true
  /*
  const validChildren = node.children.filter(function(node) {
   return node.name==="HEX" || node.name === "HSL"
  })

  return validChildren.length ? true : false*/
}

async function main() {
  const selection = figma.currentPage.selection
  await figma.loadFontAsync({ family: "Roboto", style: "Regular" })
  await figma.loadFontAsync({ family: "Roboto", style: "Bold" })

  selection.map(async node => {
    const layers = node.findAll(n => n)

    const HEX = layers.find(l => l.name === LAYERS.hex)
    const HSL = layers.find(l => l.name === LAYERS.hsl)
    const SWATCH = layers.find(l => l.name === LAYERS.color)

    const { r, g, b } = SWATCH.fills[0].color
    const hexcolor = rgbToHex(
      Math.round(r * 255),
      Math.round(g * 255),
      Math.round(b * 255)
    )
    const hslcolor = rgbToHsl(r * 255, g * 255, b * 255)

    HEX.fontName = { family: "Roboto", style: "Bold" }
    HSL.fontName = { family: "Roboto", style: "Regular" }

    HEX.characters = hexcolor.toUpperCase()
    HSL.characters = `${Math.round(hslcolor[0])} H\n ${Math.round(
      hslcolor[1]
    )} S\n ${Math.round(hslcolor[2])} L\n`
  })
}

main()
  .then(() => {
    figma.closePlugin()
  })
  .catch(err => {
    console.log(err)
    figma.closePlugin()
  })
