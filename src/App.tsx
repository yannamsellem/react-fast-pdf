import type { PDFDocumentProxy } from 'pdfjs-dist'
import { lazy, Suspense, useCallback, useState } from 'react'

import './App.css'
import { RenderMode } from './lib/PDFContext'

const PDFDocument = lazy(() => import('./lib/PDFDocument'))
const PDFPage = lazy(() => import('./lib/PDFPage'))

export default function App() {
  const [pages, setPages] = useState(0)

  const handleLoad = useCallback((pdf: PDFDocumentProxy) => {
    setPages(pdf.numPages)
  }, [])

  return (
    <Suspense fallback="Loading...">
      <h1>React fast pdf</h1>
      <PDFDocument
        file="https://arxiv.org/pdf/1708.08021.pdf"
        onLoad={handleLoad}
        renderMode={RenderMode.Canvas}
      >
        {pages ? <PDFPage page={1} scale={1} /> : null}
      </PDFDocument>
    </Suspense>
  )
}
