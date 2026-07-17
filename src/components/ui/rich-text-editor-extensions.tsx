/* Extensões customizadas do RichTextEditor (Tiptap):
   - ResizableImage: imagem com alça de redimensionar (arrastar) e alinhamento esquerda/centro/direita
   - Columns / Column: colunas livres lado a lado, número e largura arbitrários */
import { useRef, useState, type CSSProperties, type MouseEvent as ReactMouseEvent } from 'react'
import {
  Node,
  mergeAttributes,
  ReactNodeViewRenderer,
  NodeViewWrapper,
  NodeViewContent,
  type NodeViewProps,
} from '@tiptap/react'
import {
  AlignLeft,
  AlignCenter,
  AlignRight,
  Trash2,
  Plus,
  Minus,
  Columns as ColumnsIcon,
} from 'lucide-react'

import { cn } from '@/lib/utils'

// ─────────────────────────────────────────────────────────────────────────
// ResizableImage
// ─────────────────────────────────────────────────────────────────────────

type ImageAlign = 'left' | 'center' | 'right'

function imageStyle(width: string, align: ImageAlign): CSSProperties {
  if (align === 'left') return { float: 'left', margin: '0 1rem 1rem 0', width, maxWidth: '100%' }
  if (align === 'right') return { float: 'right', margin: '0 0 1rem 1rem', width, maxWidth: '100%' }
  return { display: 'block', margin: '0 auto 1rem', width, maxWidth: '100%' }
}

function imageStyleString(width: string, align: ImageAlign): string {
  const style = imageStyle(width, align)
  return Object.entries(style)
    .map(([key, val]) => `${key.replace(/[A-Z]/g, (m) => `-${m.toLowerCase()}`)}:${val}`)
    .join('; ')
}

function ResizableImageView({ node, updateAttributes, selected, deleteNode }: NodeViewProps) {
  const { src, alt, width, align } = node.attrs as {
    src: string
    alt: string | null
    width: string
    align: ImageAlign
  }
  const boxRef = useRef<HTMLDivElement>(null)
  const [isDragging, setIsDragging] = useState(false)

  const startResize = (e: ReactMouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    const container = boxRef.current?.parentElement
    if (!container) return
    const containerWidth = container.getBoundingClientRect().width
    const startX = e.clientX
    const startWidthPx = (parseFloat(width) / 100) * containerWidth

    setIsDragging(true)

    const onMouseMove = (moveEvent: MouseEvent) => {
      const delta = moveEvent.clientX - startX
      const newWidthPx = Math.max(startWidthPx + delta, containerWidth * 0.1)
      const pct = Math.min(100, Math.round((newWidthPx / containerWidth) * 100))
      updateAttributes({ width: `${pct}%` })
    }

    const onMouseUp = () => {
      setIsDragging(false)
      document.removeEventListener('mousemove', onMouseMove)
      document.removeEventListener('mouseup', onMouseUp)
    }

    document.addEventListener('mousemove', onMouseMove)
    document.addEventListener('mouseup', onMouseUp)
  }

  const setAlign = (next: ImageAlign) => updateAttributes({ align: next })

  return (
    <NodeViewWrapper
      as="div"
      data-drag-handle
      style={{ display: align === 'center' ? 'block' : 'inline-block' }}
    >
      <div
        ref={boxRef}
        className={cn('group relative', selected && 'rounded-md ring-2 ring-primary')}
        style={imageStyle(width, align)}
      >
        <img src={src} alt={alt || ''} draggable={false} className="block h-auto w-full rounded-md" />

        {selected && (
          <div className="absolute -top-9 left-0 z-10 flex items-center gap-1 rounded-md border border-input bg-background p-1 shadow-sm">
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setAlign('left')}
              className={cn('rounded p-1 hover:bg-accent', align === 'left' && 'bg-accent')}
              aria-label="Alinhar à esquerda"
            >
              <AlignLeft className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setAlign('center')}
              className={cn('rounded p-1 hover:bg-accent', align === 'center' && 'bg-accent')}
              aria-label="Centralizar"
            >
              <AlignCenter className="h-3.5 w-3.5" />
            </button>
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={() => setAlign('right')}
              className={cn('rounded p-1 hover:bg-accent', align === 'right' && 'bg-accent')}
              aria-label="Alinhar à direita"
            >
              <AlignRight className="h-3.5 w-3.5" />
            </button>
            <div className="mx-0.5 h-4 w-px bg-border" />
            <button
              type="button"
              onMouseDown={(e) => e.preventDefault()}
              onClick={deleteNode}
              className="rounded p-1 text-destructive hover:bg-destructive/10"
              aria-label="Remover imagem"
            >
              <Trash2 className="h-3.5 w-3.5" />
            </button>
          </div>
        )}

        <div
          onMouseDown={startResize}
          className={cn(
            'absolute bottom-0 right-0 h-4 w-4 translate-x-1/2 translate-y-1/2 cursor-se-resize rounded-full border-2 border-background bg-primary opacity-0 group-hover:opacity-100',
            (selected || isDragging) && 'opacity-100',
          )}
        />
      </div>
    </NodeViewWrapper>
  )
}

export const ResizableImage = Node.create({
  name: 'resizableImage',
  group: 'block',
  atom: true,
  draggable: true,

  addAttributes() {
    return {
      src: { default: null },
      alt: { default: '' },
      title: { default: '' },
      width: { default: '50%' },
      align: { default: 'center' },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'img[src]',
        getAttrs: (el) => {
          if (typeof el === 'string') return false
          const element = el as HTMLElement
          return {
            src: element.getAttribute('src'),
            alt: element.getAttribute('alt') || '',
            title: element.getAttribute('title') || '',
            width: element.getAttribute('data-width') || '50%',
            align: (element.getAttribute('data-align') as ImageAlign) || 'center',
          }
        },
      },
    ]
  },

  renderHTML({ node }) {
    const { src, alt, title, width, align } = node.attrs as {
      src: string
      alt: string
      title: string
      width: string
      align: ImageAlign
    }
    return [
      'img',
      mergeAttributes({
        src,
        alt: alt || '',
        title: title || '',
        style: imageStyleString(width, align),
        class: 'rounded-md',
        'data-width': width,
        'data-align': align,
      }),
    ]
  },

  addNodeView() {
    // Força o React a re-renderizar com os atributos novos a cada update (largura/alinhamento),
    // em vez de depender da heurística padrão de "pular update" do NodeView.
    return ReactNodeViewRenderer(ResizableImageView, {
      update: ({ updateProps }) => {
        updateProps()
        return true
      },
    })
  },
})

// ─────────────────────────────────────────────────────────────────────────
// Columns / Column
// ─────────────────────────────────────────────────────────────────────────

function ColumnView({ node, updateAttributes, editor, getPos, deleteNode }: NodeViewProps) {
  const weight = typeof node.attrs.weight === 'number' ? node.attrs.weight : 1

  const changeWeight = (delta: number) => {
    const next = Math.max(0.25, Math.round((weight + delta) * 100) / 100)
    updateAttributes({ weight: next })
  }

  const addColumnAfter = () => {
    const pos = getPos()
    if (typeof pos !== 'number') return
    editor
      .chain()
      .focus()
      .insertContentAt(pos + node.nodeSize, {
        type: 'column',
        attrs: { weight: 1 },
        content: [{ type: 'paragraph' }],
      })
      .run()
  }

  const removeColumn = () => {
    const pos = getPos()
    if (typeof pos !== 'number') return
    const $pos = editor.state.doc.resolve(pos)
    const parent = $pos.parent
    if (parent.type.name === 'columns' && parent.childCount <= 1) {
      const parentStart = $pos.before($pos.depth)
      editor
        .chain()
        .focus()
        .deleteRange({ from: parentStart, to: parentStart + parent.nodeSize })
        .run()
    } else {
      deleteNode()
    }
  }

  return (
    <NodeViewWrapper
      as="div"
      style={{ flex: `${weight} 1 0%`, minWidth: 0 }}
      className="group/column relative rounded-md border border-dashed border-transparent p-1 hover:border-border"
    >
      <div className="mb-1 flex items-center gap-0.5 opacity-0 transition-opacity group-hover/column:opacity-100">
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => changeWeight(-0.25)}
          className="rounded p-0.5 hover:bg-accent"
          aria-label="Diminuir largura da coluna"
        >
          <Minus className="h-3 w-3" />
        </button>
        <span className="w-8 px-1 text-center text-[10px] text-muted-foreground">{weight}x</span>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={() => changeWeight(0.25)}
          className="rounded p-0.5 hover:bg-accent"
          aria-label="Aumentar largura da coluna"
        >
          <Plus className="h-3 w-3" />
        </button>
        <div className="mx-0.5 h-3 w-px bg-border" />
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={addColumnAfter}
          className="rounded p-0.5 hover:bg-accent"
          aria-label="Adicionar coluna ao lado"
        >
          <ColumnsIcon className="h-3 w-3" />
        </button>
        <button
          type="button"
          onMouseDown={(e) => e.preventDefault()}
          onClick={removeColumn}
          className="rounded p-0.5 text-destructive hover:bg-destructive/10"
          aria-label="Remover coluna"
        >
          <Trash2 className="h-3 w-3" />
        </button>
      </div>
      <NodeViewContent className="min-h-[3rem]" />
    </NodeViewWrapper>
  )
}

export const Column = Node.create({
  name: 'column',
  content: 'block+',
  isolating: true,

  addAttributes() {
    return {
      weight: { default: 1 },
    }
  },

  parseHTML() {
    return [
      {
        tag: 'div[data-type="column"]',
        getAttrs: (el) => {
          if (typeof el === 'string') return false
          const element = el as HTMLElement
          const flexGrow = parseFloat(element.style.flexGrow)
          return { weight: Number.isFinite(flexGrow) ? flexGrow : 1 }
        },
      },
    ]
  },

  renderHTML({ node, HTMLAttributes }) {
    const weight = typeof node.attrs.weight === 'number' ? node.attrs.weight : 1
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'column',
        class: 'sacre-column',
        style: `flex: ${weight} 1 0%; min-width: 0;`,
      }),
      0,
    ]
  },

  addNodeView() {
    // Mesmo motivo do ResizableImage: garante que o peso (largura) da coluna atualize
    // visualmente na hora, e não só depois de salvar/recarregar.
    return ReactNodeViewRenderer(ColumnView, {
      update: ({ updateProps }) => {
        updateProps()
        return true
      },
    })
  },
})

export const Columns = Node.create({
  name: 'columns',
  group: 'block',
  content: 'column+',
  isolating: true,

  parseHTML() {
    return [{ tag: 'div[data-type="columns"]' }]
  },

  renderHTML({ HTMLAttributes }) {
    return [
      'div',
      mergeAttributes(HTMLAttributes, {
        'data-type': 'columns',
        class: 'sacre-columns',
        style: 'display:flex; gap:1.5rem; align-items:flex-start; margin:1rem 0;',
      }),
      0,
    ]
  },
})
