import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { WPsTab } from './WPsTab'
import { ProjetosTab } from './ProjetosTab'
import { ColaboradoresTab } from './ColaboradoresTab'
import { ArtigosTab } from './ArtigosTab'

export function GestaoProjetos() {
  return (
    <div className="space-y-6">
      <Accordion
        type="single"
        collapsible
        className="w-full bg-card rounded-lg shadow-sm border"
        defaultValue="wps"
      >
        <AccordionItem value="wps" className="px-6 border-b">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline py-6">
            Gestão de Work Packages (WPs)
          </AccordionTrigger>
          <AccordionContent className="pb-6 pt-2">
            <WPsTab />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="projetos" className="px-6 border-b">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline py-6">
            Gestão de Projetos e Resultados
          </AccordionTrigger>
          <AccordionContent className="pb-6 pt-2">
            <ProjetosTab />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="colaboradores" className="px-6 border-b">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline py-6">
            Diretório de Colaboradores
          </AccordionTrigger>
          <AccordionContent className="pb-6 pt-2">
            <ColaboradoresTab />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="artigos" className="px-6 border-b-0">
          <AccordionTrigger className="text-lg font-semibold hover:no-underline py-6">
            Gestão de Artigos e Publicações
          </AccordionTrigger>
          <AccordionContent className="pb-6 pt-2">
            <ArtigosTab />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
