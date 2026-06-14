import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { WorkPackages } from './WorkPackages'
import { Projetos } from './Projetos'
import { Colaboradores } from './Colaboradores'
import { Artigos } from './Artigos'

export function GestaoProjetos() {
  return (
    <Accordion type="single" collapsible className="w-full" defaultValue="wps">
      <AccordionItem value="wps" className="bg-card/50 rounded-lg mb-4 border px-4 shadow-sm">
        <AccordionTrigger className="text-lg font-semibold hover:no-underline">
          Gestão de Work Packages (WPs)
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-6">
          <WorkPackages />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="projetos" className="bg-card/50 rounded-lg mb-4 border px-4 shadow-sm">
        <AccordionTrigger className="text-lg font-semibold hover:no-underline">
          Gestão de Projetos
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-6">
          <Projetos />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem
        value="colaboradores"
        className="bg-card/50 rounded-lg mb-4 border px-4 shadow-sm"
      >
        <AccordionTrigger className="text-lg font-semibold hover:no-underline">
          Registro de Colaboradores e Equipe
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-6">
          <Colaboradores />
        </AccordionContent>
      </AccordionItem>

      <AccordionItem value="artigos" className="bg-card/50 rounded-lg mb-4 border px-4 shadow-sm">
        <AccordionTrigger className="text-lg font-semibold hover:no-underline">
          Artigos e Publicações
        </AccordionTrigger>
        <AccordionContent className="pt-4 pb-6">
          <Artigos />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
