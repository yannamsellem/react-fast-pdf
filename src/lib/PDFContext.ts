import { createContext } from 'react'
import type { PDFDocumentProxy } from 'pdfjs-dist'

// eslint-disable-next-line no-shadow
export enum RenderMode {
  None = 'none',
  Canvas = 'canvas',
  SVG = 'svg',
}

interface PDFContextType {
  pdf?: PDFDocumentProxy
  mode?: RenderMode
}

const PDFContext = createContext<PDFContextType>({})
PDFContext.displayName = 'PDFContext'

export default PDFContext
