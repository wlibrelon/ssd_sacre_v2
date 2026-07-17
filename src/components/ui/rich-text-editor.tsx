/* RichTextEditor - editor WYSIWYG (Tiptap) que produz HTML, para uso em campos de conteúdo administrável */
import { useEffect, useRef, useState, type ChangeEvent } from 'react'
import { useEditor, EditorContent } from '@tiptap/react'
import StarterKit from '@tiptap/starter-kit'
import { Placeholder } from '@tiptap/extensions'
import TextAlign from '@tiptap/extension-text-align'
import { TextStyle, FontFamily, FontSize } from '@tiptap/extension-text-style'
import {
  Bold,
  Italic,
  Underline as UnderlineIcon,
  Heading2,
  Heading3,
  List,
  ListOrdered,
  Link as LinkIcon,
  Unlink,
  Image as ImageIcon,
  Columns as ColumnsIcon,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Loader2,
  Undo2,
  Redo2,
} from 'lucide-react'

import { cn } from '@/lib/utils'
import { Toggle } from '@/components/ui/toggle'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { sanitizeHtml } from '@/lib/sanitize-html'
import { ResizableImage, Columns, Column } from '@/components/ui/rich-text-editor-extensions'

function ToolbarDivider() {
  return <div className="mx-1 h-6 w-px bg-border" />
}

interface RichTextEditorProps {
  value: string
  onChange: (html: string) => void
  placeholder?: string
  className?: string
}

export function RichTextEditor({ value, onChange, placeholder, className }: RichTextEditorProps) {
  const { toast } = useToast()
  const [uploadingImage, setUploadingImage] = useState(false)
  const imageInputRef = useRef<HTMLInputElement>(null)
  // Evita que o próprio onChange do editor dispare um setContent (que resetaria o cursor
  // a cada tecla digitada, já que o HTML sanitizado nem sempre é string-idêntico ao HTML
  // original do editor — reordenação de atributos, etc.)
  const isInternalUpdate = useRef(false)

  const editor = useEditor({
    extensions: [
      StarterKit.configure({
        link: {
          openOnClick: false,
          autolink: true,
          HTMLAttributes: { rel: 'noopener noreferrer', target: '_blank' },
        },
      }),
      ResizableImage,
      Columns,
      Column,
      TextAlign.configure({ types: ['paragraph', 'heading'] }),
      TextStyle,
      FontFamily,
      FontSize,
      Placeholder.configure({ placeholder: placeholder || '' }),
    ],
    content: value || '',
    editorProps: {
      attributes: {
        class: cn(
          'prose prose-sm max-w-none focus:outline-none min-h-[200px] px-3 py-2',
          '[&_p]:my-2 [&_ul]:my-2 [&_ol]:my-2 [&_h2]:mt-4 [&_h3]:mt-3',
        ),
      },
    },
    onUpdate: ({ editor }) => {
      isInternalUpdate.current = true
      onChange(sanitizeHtml(editor.getHTML()))
    },
  })

  // Mantém o editor sincronizado se `value` mudar externamente (ex: ao carregar dados do servidor).
  // Ignora quando a mudança veio do próprio editor (ver onUpdate acima).
  useEffect(() => {
    if (!editor) return
    if (isInternalUpdate.current) {
      isInternalUpdate.current = false
      return
    }
    const current = editor.getHTML()
    if (value !== current) {
      editor.commands.setContent(value || '', { emitUpdate: false })
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, editor])

  if (!editor) return null

  const setLink = () => {
    const previousUrl = editor.getAttributes('link').href as string | undefined
    const url = window.prompt('URL do link:', previousUrl || 'https://')
    if (url === null) return
    if (url === '') {
      editor.chain().focus().extendMarkRange('link').unsetLink().run()
      return
    }
    editor.chain().focus().extendMarkRange('link').setLink({ href: url }).run()
  }

  const handleImageButtonClick = () => {
    imageInputRef.current?.click()
  }

  const handleImageSelected = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    e.target.value = '' // permite selecionar o mesmo arquivo de novo depois
    if (!file) return

    if (!file.type.startsWith('image/')) {
      toast({ title: 'Arquivo inválido', description: 'Selecione uma imagem.', variant: 'destructive' })
      return
    }

    setUploadingImage(true)
    try {
      const filename = `conteudo-estudo/${Date.now()}_${file.name}`
      const { error } = await supabase.storage.from('imagens').upload(filename, file)
      if (error) {
        toast({ title: 'Erro ao enviar imagem', description: error.message, variant: 'destructive' })
        return
      }
      const { data: urlData } = supabase.storage.from('imagens').getPublicUrl(filename)
      editor
        .chain()
        .focus()
        .insertContent({
          type: 'resizableImage',
          attrs: { src: urlData.publicUrl, alt: file.name, width: '50%', align: 'center' },
        })
        .run()
    } finally {
      setUploadingImage(false)
    }
  }

  const insertColumns = () => {
    const pos = editor.state.selection.from
    editor
      .chain()
      .focus()
      .insertContentAt(pos, {
        type: 'columns',
        content: [
          { type: 'column', attrs: { weight: 1 }, content: [{ type: 'paragraph' }] },
          { type: 'column', attrs: { weight: 1 }, content: [{ type: 'paragraph' }] },
        ],
      })
      // pos + 1 entra em "columns", +1 entra na 1ª "column", +1 entra no "paragraph" vazio
      .setTextSelection(pos + 3)
      .run()
  }

  const currentFontFamily = editor.getAttributes('textStyle').fontFamily || ''
  const currentFontSize = editor.getAttributes('textStyle').fontSize || ''

  return (
    <div className={cn('rounded-md border border-input bg-background', className)}>
      <div className="max-h-[65vh] overflow-y-auto">
        <div className="sticky top-0 z-10 flex flex-wrap items-center gap-1 border-b border-input bg-background p-1.5">
          <select
            value={currentFontFamily}
            onChange={(e) => {
              const val = e.target.value
              if (!val) editor.chain().focus().unsetFontFamily().run()
              else editor.chain().focus().setFontFamily(val).run()
            }}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            title="Fonte"
            aria-label="Fonte"
          >
            <option value="">Fonte padrão</option>
            <option value="Arial, sans-serif">Arial</option>
            <option value="Georgia, serif">Georgia</option>
            <option value="'Times New Roman', serif">Times New Roman</option>
            <option value="'Courier New', monospace">Courier New</option>
            <option value="Verdana, sans-serif">Verdana</option>
            <option value="'Trebuchet MS', sans-serif">Trebuchet MS</option>
            <option value="Inter, sans-serif">Inter</option>
          </select>

          <select
            value={currentFontSize}
            onChange={(e) => {
              const val = e.target.value
              if (!val) editor.chain().focus().unsetFontSize().run()
              else editor.chain().focus().setFontSize(val).run()
            }}
            className="h-9 rounded-md border border-input bg-background px-2 text-sm"
            title="Tamanho da fonte"
            aria-label="Tamanho da fonte"
          >
            <option value="">Tamanho padrão</option>
            <option value="12px">12</option>
            <option value="14px">14</option>
            <option value="16px">16</option>
            <option value="18px">18</option>
            <option value="20px">20</option>
            <option value="24px">24</option>
            <option value="28px">28</option>
            <option value="32px">32</option>
            <option value="40px">40</option>
          </select>

          <ToolbarDivider />

          <Toggle
            size="sm"
            pressed={editor.isActive('bold')}
            onPressedChange={() => editor.chain().focus().toggleBold().run()}
            aria-label="Negrito"
            title="Negrito"
          >
            <Bold />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('italic')}
            onPressedChange={() => editor.chain().focus().toggleItalic().run()}
            aria-label="Itálico"
            title="Itálico"
          >
            <Italic />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('underline')}
            onPressedChange={() => editor.chain().focus().toggleUnderline().run()}
            aria-label="Sublinhado"
            title="Sublinhado"
          >
            <UnderlineIcon />
          </Toggle>

          <ToolbarDivider />

          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'left' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('left').run()}
            aria-label="Alinhar à esquerda"
            title="Alinhar à esquerda"
          >
            <AlignLeft />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'center' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('center').run()}
            aria-label="Centralizar texto"
            title="Centralizar texto"
          >
            <AlignCenter />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'right' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('right').run()}
            aria-label="Alinhar à direita"
            title="Alinhar à direita"
          >
            <AlignRight />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive({ textAlign: 'justify' })}
            onPressedChange={() => editor.chain().focus().setTextAlign('justify').run()}
            aria-label="Justificar texto"
            title="Justificar texto"
          >
            <AlignJustify />
          </Toggle>

          <ToolbarDivider />

          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 2 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 2 }).run()}
            aria-label="Título 2"
            title="Título grande (H2)"
          >
            <Heading2 />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('heading', { level: 3 })}
            onPressedChange={() => editor.chain().focus().toggleHeading({ level: 3 }).run()}
            aria-label="Título 3"
            title="Título pequeno (H3)"
          >
            <Heading3 />
          </Toggle>

          <ToolbarDivider />

          <Toggle
            size="sm"
            pressed={editor.isActive('bulletList')}
            onPressedChange={() => editor.chain().focus().toggleBulletList().run()}
            aria-label="Lista com marcadores"
            title="Lista com marcadores"
          >
            <List />
          </Toggle>
          <Toggle
            size="sm"
            pressed={editor.isActive('orderedList')}
            onPressedChange={() => editor.chain().focus().toggleOrderedList().run()}
            aria-label="Lista numerada"
            title="Lista numerada"
          >
            <ListOrdered />
          </Toggle>

          <ToolbarDivider />

          <Toggle
            size="sm"
            pressed={editor.isActive('link')}
            onPressedChange={setLink}
            aria-label="Inserir link"
            title="Inserir link"
          >
            <LinkIcon />
          </Toggle>
          <Toggle
            size="sm"
            disabled={!editor.isActive('link')}
            pressed={false}
            onPressedChange={() => editor.chain().focus().unsetLink().run()}
            aria-label="Remover link"
            title="Remover link"
          >
            <Unlink />
          </Toggle>

          <ToolbarDivider />

          <Toggle
            size="sm"
            pressed={false}
            disabled={uploadingImage}
            onPressedChange={handleImageButtonClick}
            aria-label="Inserir imagem"
            title="Inserir imagem (envia um arquivo do seu computador)"
          >
            {uploadingImage ? <Loader2 className="animate-spin" /> : <ImageIcon />}
          </Toggle>
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleImageSelected}
          />
          <Toggle
            size="sm"
            pressed={false}
            onPressedChange={insertColumns}
            aria-label="Inserir colunas"
            title="Inserir colunas (cria 2 colunas lado a lado, editáveis)"
          >
            <ColumnsIcon />
          </Toggle>

          <ToolbarDivider />

          <Toggle
            size="sm"
            pressed={false}
            disabled={!editor.can().undo()}
            onPressedChange={() => editor.chain().focus().undo().run()}
            aria-label="Desfazer"
            title="Desfazer"
          >
            <Undo2 />
          </Toggle>
          <Toggle
            size="sm"
            pressed={false}
            disabled={!editor.can().redo()}
            onPressedChange={() => editor.chain().focus().redo().run()}
            aria-label="Refazer"
            title="Refazer"
          >
            <Redo2 />
          </Toggle>
        </div>

        <EditorContent editor={editor} />
      </div>
    </div>
  )
}
