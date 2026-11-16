import { useState } from 'react'
import { Check, Copy, Quote } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'

/**
 * Citação que o usuário final deve usar ao reutilizar um resultado.
 * Prioridade: citação do próprio resultado → citação padrão do projeto →
 * citação gerada automaticamente a partir dos dados cadastrados.
 */
export function montarCitacao(opts: {
  citacaoItem?: string | null
  citacaoProjeto?: string | null
  tituloResultado?: string | null
  tituloProjeto?: string | null
  data?: string | null
}) {
  const item = opts.citacaoItem?.trim()
  if (item) return item
  const projeto = opts.citacaoProjeto?.trim()
  if (projeto) return projeto

  const ano = opts.data ? new Date(opts.data).getFullYear() : new Date().getFullYear()
  const partes = [
    'PROJETO SACRE.',
    opts.tituloResultado?.trim() ? `${opts.tituloResultado.trim()}.` : null,
    opts.tituloProjeto?.trim() ? `In: ${opts.tituloProjeto.trim()}.` : null,
    `${ano}.`,
    `Disponível em: ${window.location.origin}/projetos/resultados.`,
  ]
  return partes.filter(Boolean).join(' ')
}

async function copiarTexto(texto: string) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(texto)
    return
  }
  // Fallback para contextos sem Clipboard API (ex.: http)
  const ta = document.createElement('textarea')
  ta.value = texto
  ta.style.position = 'fixed'
  ta.style.opacity = '0'
  document.body.appendChild(ta)
  ta.select()
  document.execCommand('copy')
  document.body.removeChild(ta)
}

export function CitacaoResultado({ citacao, className }: { citacao: string; className?: string }) {
  const { toast } = useToast()
  const [copiado, setCopiado] = useState(false)

  const handleCopiar = async () => {
    try {
      await copiarTexto(citacao)
      setCopiado(true)
      toast({ title: 'Citação copiada' })
      setTimeout(() => setCopiado(false), 2000)
    } catch {
      toast({ title: 'Não foi possível copiar a citação', variant: 'destructive' })
    }
  }

  return (
    <div className={cn('rounded-md border bg-muted/30 p-3 text-left', className)}>
      <div className="flex items-center justify-between gap-2 mb-1">
        <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground flex items-center gap-1">
          <Quote className="w-3 h-3" /> Como citar
        </p>
        <Button
          type="button"
          variant="ghost"
          size="sm"
          className="h-7 px-2 text-xs"
          onClick={handleCopiar}
        >
          {copiado ? (
            <Check className="w-3.5 h-3.5 mr-1" />
          ) : (
            <Copy className="w-3.5 h-3.5 mr-1" />
          )}
          {copiado ? 'Copiado' : 'Copiar'}
        </Button>
      </div>
      <p className="text-xs text-foreground whitespace-pre-line break-words">{citacao}</p>
    </div>
  )
}
