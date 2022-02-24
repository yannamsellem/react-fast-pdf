export type Transform = [number, number, number, number, number, number]

export function getRotateFromTransform(
  transform: [number, number, number, number, number, number],
): number {
  return Math.atan2(transform[1], transform[0]) * (180 / Math.PI)
}

const CANVAS_ELEMENT = document.createElement('canvas')
const DEFAULT_FONT_SIZE = 30
const METRIC_CACHE = new Map<string, TextMetrics>()
let ctx: CanvasRenderingContext2D | null = null
function getLazyContext() {
  if (ctx) return ctx
  ctx = CANVAS_ELEMENT.getContext('2d', { alpha: false })
  return ctx
}

function measureTextForFont(fontName: string) {
  // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
  if (METRIC_CACHE.has(fontName)) return METRIC_CACHE.get(fontName)!
  const layoutContext = getLazyContext()
  if (!layoutContext) return null
  layoutContext.save()
  layoutContext.font = `${DEFAULT_FONT_SIZE}px ${fontName}`
  const metrics = layoutContext.measureText('')
  layoutContext.restore()
  METRIC_CACHE.set(fontName, metrics)
  return metrics
}

export function getAscent(fontName: string) {
  const metrics = measureTextForFont(fontName)
  if (!metrics) return 1
  const { fontBoundingBoxAscent: ascent, fontBoundingBoxDescent: descent } =
    metrics
  return ascent / (ascent + Math.abs(descent))
}

export function getTextWidth(
  fontSize: number,
  fontFamily: string,
  text: string,
) {
  const layoutContext = getLazyContext()
  if (!layoutContext) return 0
  layoutContext.font = `${fontSize}px ${fontFamily}`
  const metrics = layoutContext.measureText(text)
  return metrics?.width ?? 0
}
