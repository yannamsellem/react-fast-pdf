import { cx, css } from '@emotion/css'
import { useContext, useEffect, useMemo, useState } from 'react'
import type { PDFPageProxy } from 'pdfjs-dist'

import PDFContext, { RenderMode } from './PDFContext'
import CanvasLayer from './CanvasLayer/Layer'
import SVGLayer from './SVGLayer/Layer'
import TextLayer from './TextLayer/Layer'

interface Props {
  page: number
  scale?: number
  onLoad?: (page: PDFPageProxy) => unknown
  className?: string
}

export default function PDFPage({
  page: index,
  scale = devicePixelRatio ?? 1,
  onLoad,
  className,
}: Props) {
  const { pdf, mode } = useContext(PDFContext)
  const [page, setPage] = useState<PDFPageProxy>()
  const viewport = useMemo(() => page?.getViewport({ scale }), [page, scale])

  useEffect(() => {
    let mounted = true

    pdf
      ?.getPage(index)
      .then(p => {
        if (mounted) {
          setPage(p)
          onLoad?.(p)
        }
      })
      .catch(() => console.error(`Unable to load page ${index}`))

    return () => {
      mounted = false
    }
  }, [pdf, index, onLoad])

  useEffect(
    () => () => {
      page?.cleanup()
    },
    [page],
  )

  return (
    <div
      data-page-index={index}
      className={cx(
        'PDFPage__container',
        css`
          position: relative;
        `,
        className,
      )}
      style={{ height: viewport?.height ?? 0, width: viewport?.width ?? 0 }}
    >
      {page && mode === RenderMode.Canvas ? (
        <CanvasLayer page={page} scale={scale} />
      ) : null}
      {page && mode === RenderMode.SVG ? (
        <SVGLayer page={page} scale={scale} />
      ) : null}
      {page ? <TextLayer page={page} scale={scale} /> : null}
    </div>
  )
}

PDFPage.defaultProps = {
  onLoad: null,
  scale: 1,
  className: '',
}
