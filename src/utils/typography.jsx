import Typography from "typography"

const typography = new Typography({
    headerFontFamily: ["Pretendard", "Avenir Next", "Helvetica Neue"],
    bodyFontFamily: ["Pretendard", "Avenir Next", "Helvetica Neue"],
})

typography.injectStyles()
export const { scale, rhythm, options } = typography
export default typography
