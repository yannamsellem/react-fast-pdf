import type { PDFPageProxy } from 'pdfjs-dist'
import type {
  TextContent,
  TextItem as PDFTextItem,
} from 'pdfjs-dist/types/src/display/api'
import { css, cx } from '@emotion/css'
import { useEffect, useMemo, useState } from 'react'

import TextItem from './ItemWithMatrix'

interface Props {
  page: PDFPageProxy
  scale?: number
  className?: string
}

const TEXT_ITEM_KEYS = [
  'str',
  'dir',
  'transform',
  'width',
  'height',
  'fontName',
  'hasEOL',
]

function isTextItem(item: unknown): item is PDFTextItem {
  return Object.keys(item as PDFTextItem).every(key =>
    TEXT_ITEM_KEYS.includes(key),
  )
}

export default function TextLayer({ page, scale = 1, className }: Props) {
  const [textContent, setTextContent] = useState<TextContent>()
  const viewport = useMemo(() => page.getViewport({ scale }), [page, scale])

  useEffect(() => {
    let mounted = true
    page
      .getTextContent()
      .then(text => {
        if (mounted) setTextContent(text)
      })
      .catch(() =>
        console.error(
          // eslint-disable-next-line no-underscore-dangle
          `Unable to load Text content from page ${page._pageIndex}`,
        ),
      )

    return () => {
      mounted = false
    }
  }, [page])

  return (
    <div
      className={cx(
        'PDFPage__textLayer',
        css`
          position: absolute;
          inset: 0;
          color: transparent;
          transform: rotate(${page.rotate}deg);
          pointer-events: none;
          display: flex;
        `,
        className,
      )}
      style={{ height: viewport.height, width: viewport.width }}
    >
      {textContent?.items?.map((item, index) => {
        if (isTextItem(item)) {
          const style = textContent.styles[item.fontName]

          return (
            <TextItem
              key={index.toString()}
              item={item}
              textStyle={style}
              viewport={viewport}
            />
          )
        }

        return null
      })}
    </div>
  )
}

TextLayer.defaultProps = { className: '', scale: 1 }
