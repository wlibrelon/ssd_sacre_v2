/* Página genérica da Área de Estudo — renderiza qualquer opção de menu criada
   dinamicamente em Painel Administrativo > Gestão de Conteúdo (tabela conteudo_estudo).
   Substitui as antigas páginas fixas Contexto.tsx e Objetivos.tsx. */
import { useEffect, useState } from 'react'
import { useParams } from 'react-router-dom'
import { sanitizeHtml } from '@/lib/sanitize-html'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'

export default function ConteudoDinamico() {
  const { id } = useParams<{ id: string }>()
  const [titulo, setTitulo] = useState('')
  const [html, setHtml] = useState('<p>Carregando...</p>')
  const [notFound, setNotFound] = useState(false)

  useEffect(() => {
    setNotFound(false)
    setHtml('<p>Carregando...</p>')

    supabase
      .from('conteudo_estudo')
      .select('titulo, conteudo_html')
      .eq('id', id)
      .maybeSingle()
      .then(({ data }) => {
        if (data) {
          setTitulo(data.titulo || '')
          setHtml(data.conteudo_html ? sanitizeHtml(data.conteudo_html) : '<p>Nenhum conteúdo disponível.</p>')
        } else {
          setNotFound(true)
        }
      })
  }, [id])

  if (notFound) {
    return (
      <div className="space-y-4 animate-fade-in max-w-5xl mx-auto p-4">
        <h1 className="text-3xl font-bold text-primary">Página não encontrada</h1>
        <p className="text-muted-foreground">Este item do menu não existe mais.</p>
      </div>
    )
  }

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto p-4">
      <div>
        <h1 className="text-3xl font-bold text-primary">{titulo}</h1>
        <div className="w-16 h-1.5 bg-secondary mt-4 rounded-full" />
      </div>

      <Card className="border-0 shadow-md">
        <CardContent
          className="p-8 space-y-6 text-gray-700 leading-relaxed text-lg prose max-w-none"
          dangerouslySetInnerHTML={{ __html: html }}
        />
      </Card>
    </div>
  )
}
