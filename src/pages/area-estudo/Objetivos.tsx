import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'

export default function Objetivos() {
  const [html, setHtml] = useState('<p>Carregando...</p>')

  useEffect(() => {
    supabase
      .from('conteudo_estudo')
      .select('conteudo_html')
      .eq('secao', 'objetivos')
      .maybeSingle()
      .then(({ data }) => {
        if (data?.conteudo_html) setHtml(data.conteudo_html)
        else setHtml('<p>Nenhum conteúdo disponível.</p>')
      })
  }, [])

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto p-4">
      <div>
        <h1 className="text-3xl font-bold text-primary">Objetivos da Área de Estudo</h1>
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
