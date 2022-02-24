import { css, cx } from '@emotion/css'
import type {
  PDFOperatorList,
  PDFPageProxy,
} from 'pdfjs-dist/types/src/display/api'
import type { PageViewport } from 'pdfjs-dist/types/web/pdf_page_view'
import { SVGGraphics } from 'pdfjs-dist'
import { useEffect, useMemo, useRef, useState } from 'react'

function useOperatorList(page: PDFPageProxy) {
  const [operators, setOperators] = useState<PDFOperatorList>()
  useEffect(() => {
    let mounted = true

    page.getOperatorList().then(o => {
      if (mounted && o) setOperators(o)
    })

    return () => {
      mounted = false
    }
  }, [page])

  return operators
}

async function getSVG(
  page: PDFPageProxy,
  operatorsList: PDFOperatorList,
  viewport: PageViewport,
): Promise<SVGElement> {
  const renderer = new SVGGraphics(page.commonObjs, page.objs)
  return renderer.getSVG(operatorsList, viewport)
}

interface Props {
  page: PDFPageProxy
  scale?: number
  rotation?: number
}

export default function SVGLayer({ page, scale, rotation }: Props) {
  const containerRef = useRef<HTMLDivElement>(null)
  const viewport = useMemo(
    () => page.getViewport({ scale: scale ?? 1, rotation: rotation ?? 0 }),
    [page, scale, rotation],
  )

  const operatorList = useOperatorList(page)
  useEffect(() => {
    if (operatorList) {
      getSVG(page, operatorList, viewport).then(svg => {
        if (containerRef.current) {
          const hasElement = Boolean(containerRef.current.querySelector('svg'))
          if (hasElement) containerRef.current.innerHTML = ''
          containerRef.current.appendChild(svg)
        }
      })
    }
  }, [operatorList, viewport, page])

  return (
    <div
      ref={containerRef}
      className={cx(
        'PDFPage__svg_container',
        css`
          display: block;
          background-color: white;
          overflow: hidden;
          user-select: none;
        `,
      )}
      style={{ height: viewport?.height, width: viewport?.width }}
    />
  )
}

SVGLayer.defaultProps = {
  scale: 1,
  rotation: 0,
}
