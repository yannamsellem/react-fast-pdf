import { cx } from '@emotion/css'
import { memo, useEffect, useMemo, useState } from 'react'
import { GlobalWorkerOptions, getDocument } from 'pdfjs-dist'
import type { PDFDocumentProxy } from 'pdfjs-dist'
// eslint-disable-next-line import/no-unresolved
import worker from 'pdfjs-dist/build/pdf.worker?url'

import PDFContext, { RenderMode } from './PDFContext'

GlobalWorkerOptions.workerSrc = worker

async function loadPDF(file: string) {
  const task = getDocument({
    url: file,
    cMapUrl: 'cmaps/',
    cMapPacked: true,
  })

  return task.promise
}

interface Props {
  file?: string
  children?: React.ReactNode
  onLoad?: (pdf: PDFDocumentProxy) => unknown
  className?: string
  renderMode?: RenderMode
}

function Document({ file, children, onLoad, className, renderMode }: Props) {
  const [pdfDocument, setPDFDocument] = useState<PDFDocumentProxy>()
  const contextValue = useMemo(
    () => ({ pdf: pdfDocument, mode: renderMode }),
    [pdfDocument, renderMode],
  )

  useEffect(() => {
    let mounted = true

    if (file) {
      loadPDF(file)
        .then(doc => {
          if (mounted) {
            setPDFDocument(doc)
            onLoad?.(doc)
          }
        })
        .catch(() => console.error('Unable to load document'))
    }
    return () => {
      mounted = false
    }
  }, [file, onLoad])

  useEffect(
    () => () => {
      pdfDocument?.cleanup()
      pdfDocument?.destroy()
    },
    [pdfDocument],
  )

  return (
    <div className={cx('PDFDocument__container', className)}>
      <PDFContext.Provider value={contextValue}>{children}</PDFContext.Provider>
    </div>
  )
}

export default memo(Document)

Document.defaultProps = {
  file: '',
  children: null,
  onLoad: null,
  className: '',
  renderMode: RenderMode.Canvas,
}
