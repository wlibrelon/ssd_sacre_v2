import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { Button } from '@/components/ui/button'
import { ExternalLink, BookOpen } from 'lucide-react'

const papers = [
  {
    title: 'Urban Water Resilience in the Face of Climate Change: The Bauru Case Study',
    authors: 'Alves, R., Santos, C., et al.',
    journal: 'Journal of Hydrology',
    year: 2024,
    abstract:
      'This paper presents the preliminary findings of the SACRE project, detailing the methodological approach to combining technical modeling with public policy frameworks...',
  },
  {
    title: 'Nature-Based Solutions for Urban Drainage Systems',
    authors: 'Maria Fernanda, João Pedro',
    journal: 'Water Resources Management',
    year: 2025,
    abstract:
      'Evaluating the cost-effectiveness of implementing rain gardens and permeable pavements in densely populated areas using WEAP simulations...',
  },
]

export default function Publicacoes() {
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
        {papers.map((paper, idx) => (
          <Card key={idx} className="overflow-hidden border-l-4 border-l-secondary">
            <CardHeader className="pb-2">
              <div className="flex justify-between items-start gap-4">
                <div>
                  <CardTitle className="text-xl leading-tight">{paper.title}</CardTitle>
                  <p className="text-sm text-primary/80 mt-1 font-medium">{paper.authors}</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    {paper.journal} • {paper.year}
                  </p>
                </div>
                <Button size="sm" variant="outline" className="shrink-0 gap-2">
                  <ExternalLink className="h-4 w-4" /> DOI
                </Button>
              </div>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible>
                <AccordionItem value="abstract" className="border-none">
                  <AccordionTrigger className="text-sm py-2 text-secondary hover:no-underline hover:text-primary">
                    Ler Abstract
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground text-sm leading-relaxed">
                    {paper.abstract}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
