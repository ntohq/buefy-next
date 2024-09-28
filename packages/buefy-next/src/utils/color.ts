import { Color } from './_color'
import type { Hsla, Rgba } from './_color'
export type { Hsl, Hsla, Rgb, Rgba } from './_color'

declare module './_color' {
    interface Color extends Rgba, Hsla {}
}

export default Color
