/* Helper central de sanitização de HTML gerado pelo RichTextEditor.
   Usa DOMPurify e garante explicitamente que os atributos usados pelas
   extensões customizadas (imagem redimensionável, colunas) não sejam removidos. */
import DOMPurify from 'dompurify'

export function sanitizeHtml(html: string): string {
  return DOMPurify.sanitize(html, {
    ADD_ATTR: ['style', 'target', 'data-width', 'data-align', 'data-type'],
  })
}
