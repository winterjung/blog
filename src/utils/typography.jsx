import Typography from "typography"

// Use github font-family
const fontFamilies = [
    "-apple-system",
    "BlinkMacSystemFont",
    "Segoe UI",
    "Noto Sans",
    "Helvetica",
    "Arial",
    "sans-serif",
    "Apple Color Emoji",
    "Segoe UI Emoji",
]

const typography = new Typography({
    bodyFontFamily: fontFamilies,
    headerFontFamily: fontFamilies,
})

typography.injectStyles()
export const { scale, rhythm, options } = typography
export default typography
