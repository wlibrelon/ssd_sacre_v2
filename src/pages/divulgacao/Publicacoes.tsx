import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { ExternalLink, BookOpen } from 'lucide-react'

export default function Publicacoes() {
  const [papers, setPapers] = useState<any[]>([])

  useEffect(() => {
    const fetchPapers = async () => {
      const { data } = await supabase
        .from('artigos')
        .select(`
        *,
        artigos_autores (
          colaboradores (nome)
        )
      `)
        .order('id_artigo', { ascending: false })

      if (data) setPapers(data)
    }
    fetchPapers()
  }, [])

  return (
    <div className="max-w-4xl space-y-6 animate-fade-in">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-primary flex items-center gap-3">
          <BookOpen className="h-8 w-8 text-secondary" />
          Publicações Científicas
        </h1>
        <p className="text-muted-foreground mt-2">
          Artigos publicados pela equipe do projeto em revistas e periódicos especializados.
        </p>
      </div>

      <div className="space-y-4">
        {papers.map((paper) => {
          const authors =
            paper.artigos_autores && paper.artigos_autores.length > 0
              ? paper.artigos_autores
                  .map((a: any) => a.colaboradores?.nome)
                  .filter(Boolean)
                  .join(', ')
              : 'Autores não informados'

          return (
            <Card key={paper.id_artigo} className="overflow-hidden border-l-4 border-l-secondary">
              <CardHeader className="pb-2">
                <div className="flex justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-xl leading-tight">{paper.titulo}</CardTitle>
                    <p className="text-sm text-primary/80 mt-1 font-medium">{authors}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      {paper.revista || 'Periódico Científico'}
                    </p>
                  </div>
                  {paper.doi && (
                    <Button size="sm" variant="outline" className="shrink-0 gap-2" asChild>
                      <a
                        href={`https://doi.org/${paper.doi}`}
                        target="_blank"
                        rel="noopener noreferrer"
                      >
                        <ExternalLink className="h-4 w-4" /> DOI
                      </a>
                    </Button>
                  )}
                </div>
              </CardHeader>
              <CardContent>
                {(paper.resumo || paper.abstract) && (
                  <Accordion type="single" collapsible>
                    <AccordionItem value="abstract" className="border-none">
                      <AccordionTrigger className="text-sm py-2 text-secondary hover:no-underline hover:text-primary">
                        Ler Resumo / Abstract
                      </AccordionTrigger>
                      <AccordionContent className="text-muted-foreground text-sm leading-relaxed space-y-4">
                        {paper.resumo && <p>{paper.resumo}</p>}
                        {paper.abstract && <p className="italic">{paper.abstract}</p>}
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
                )}
              </CardContent>
            </Card>
          )
        })}
        {papers.length === 0 && (
          <p className="text-muted-foreground text-center py-8">
            Nenhuma publicação cadastrada no momento.
          </p>
        )}
      </div>
    </div>
  )
}
