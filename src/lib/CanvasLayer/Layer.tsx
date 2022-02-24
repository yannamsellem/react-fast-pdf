import { css, cx } from '@emotion/css'
import { AnnotationMode, PDFPageProxy, RenderTask } from 'pdfjs-dist'
import { useEffect, useMemo, useRef } from 'react'

interface Props {
  page: PDFPageProxy
  className?: string
  rotation?: number
  scale?: number
  onLoad?: () => unknown
}
const PIXEL_RATIO =
  (typeof window !== 'undefined' && window.devicePixelRatio) || 1

export default function CanvasLayer({
  page,
  className,
  rotation,
  scale = 1,
  onLoad,
}: Props) {
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const viewport = useMemo(
    () => page.getViewport({ scale, rotation }),
    [page, rotation, scale],
  )
  const canvasViewport = useMemo(
    () => page.getViewport({ scale: scale * PIXEL_RATIO, rotation }),
    [page, rotation, scale],
  )

  useEffect(() => {
    let isMounted = true
    const { current: canvas } = canvasRef
    let renderer: RenderTask
    if (isMounted && canvas) {
      renderer = page.render({
        // eslint-disable-next-line @typescript-eslint/no-non-null-assertion
        canvasContext: canvas.getContext('2d')!,
        viewport: canvasViewport,
        annotationMode: AnnotationMode.ENABLE,
      })
      renderer.promise
        .then(onLoad)
        .catch(() => console.error('Unable to load canvas'))
    }

    return () => {
      isMounted = false
      page.cleanup()
      renderer?.cancel?.()
    }
  }, [canvasViewport, page, onLoad])

  return (
    <canvas
      width={canvasViewport.width}
      height={canvasViewport.height}
      ref={canvasRef}
      className={cx(
        'PDFPage__canvasLayer',
        css`
          display: block;
          user-select: none;
        `,
        className,
      )}
      style={{ width: viewport.width, height: viewport.height }}
    />
  )
}

CanvasLayer.defaultProps = {
  className: '',
  rotation: 0,
  scale: 1,
  onLoad: null,
}
