import { css, cx } from '@emotion/css'
import type {
  TextItem as PDFTextItem,
  TextStyle,
} from 'pdfjs-dist/types/src/display/api'
import type { PageViewport } from 'pdfjs-dist/types/src/display/display_utils'
import { Util } from 'pdfjs-dist'
import { useLayoutEffect, useMemo, useRef, useState } from 'react'
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
  const containerRef = useRef<HTMLSpanElement>(null)
  const [transformScale, setScaleX] = useState('')

  const matrix = useMemo(() => {
    const transform = Util.transform(
      Util.transform(viewport.transform, item.transform),
      [1, 0, 0, -1, 0, 0],
    ) as Matrix

    return `matrix(${transform.join(', ')})`
  }, [item.transform, viewport.transform])

  useLayoutEffect(() => {
    if (matrix && containerRef.current && !transformScale) {
      const isVertical = Number.isNaN(textStyle.ascent)
      const { width: actualWidth, height: actualHeight } =
        containerRef.current.getBoundingClientRect()
      const desiredWidth = item.width * scale

      if (isVertical) {
        const value = desiredWidth / actualHeight
        setScaleX(`scaleX(${value})`)
      } else {
        const value = desiredWidth / actualWidth
        setScaleX(`scaleX(${value})`)
      }
    }
  }, [item.height, item.width, matrix, scale, textStyle, transformScale])

  return (
    <span
      ref={containerRef}
      className={cx(
        'PDFPage__textItem',
        css`
          position: absolute;
          transform-origin: left bottom;
          white-space: pre;
          pointer-events: all;
          font-size: 1px;
          line-height: 1;
        `,
        className,
      )}
      style={{
        fontFamily: textStyle.fontFamily,
        transform: [matrix, transformScale].join(' '),
      }}
    >
      {item.str}
    </span>
  )
}

TextItem.defaultProps = { className: '', scale: 1 }
