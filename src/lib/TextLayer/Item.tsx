import { css, cx } from '@emotion/css'
import type {
  TextItem as PDFTextItem,
  TextStyle,
} from 'pdfjs-dist/types/src/display/api'
import type { PageViewport } from 'pdfjs-dist/types/src/display/display_utils'
import { Util } from 'pdfjs-dist'
import { useMemo } from 'react'
import { getRotateFromMatrix, getAscent, getTextWidth } from './utils'
import type { Matrix } from './utils'

interface Props {
  textStyle: TextStyle
  item: PDFTextItem
  viewport: PageViewport
  className?: string
  scale?: number
}

export default function TextItem({
  textStyle,
  item,
  viewport,
  className,
  scale = 1,
}: Props) {
  const style = useMemo(() => {
    const transform = Util.transform(
      viewport.transform,
      item.transform,
    ) as Matrix

    const angle = getRotateFromMatrix(transform)
    const fontSize = Math.hypot(transform[2], transform[3])
    const ascent = getAscent(textStyle.fontFamily)
    const fontAscent = fontSize * ascent

    const isHorizontal = angle === 0

    const left = isHorizontal
      ? transform[4]
      : transform[4] + fontAscent * Math.sin(angle)

    const top = isHorizontal
      ? transform[5] - fontAscent
      : transform[5] - fontAscent * Math.cos(angle)

    const desiredWidth = item.width * scale
    const textWidth = getTextWidth(fontSize, textStyle.fontFamily, item.str)
    const scaleX = textWidth > 0 ? `scaleX(${desiredWidth / textWidth})` : ''
    const rotate = angle !== 0 ? `rotate(${angle}deg)` : ''

    return {
      fontFamily: textStyle.fontFamily,
      fontSize,
      left,
      top,
      transform: [rotate, scaleX].filter(Boolean).join(' '),
    } as React.CSSProperties
  }, [
    item.str,
    item.transform,
    item.width,
    scale,
    textStyle.fontFamily,
    viewport.transform,
  ])

  return (
    <span
      className={cx(
        'PDFPage__textItem',
        css`
          position: absolute;
          transform-origin: left bottom;
          white-space: pre;
          pointer-events: all;
          line-height: 1;
        `,
        className,
      )}
      style={style}
    >
      {item.str}
    </span>
  )
}

TextItem.defaultProps = { className: '', scale: 1 }
