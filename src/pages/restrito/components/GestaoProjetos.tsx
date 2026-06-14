import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { ColaboradoresTab } from './ColaboradoresTab'
import { WPsTab } from './WPsTab'
import { ProjetosTab } from './ProjetosTab'
import { ArtigosTab } from './ArtigosTab'

export function GestaoProjetos() {
  return (
    <Accordion type="single" collapsible className="w-full bg-card border rounded-md">
      <AccordionItem value="wps">
        <AccordionTrigger className="px-4 text-lg font-semibold hover:bg-muted/50 transition-colors">
          Work Packages
        </AccordionTrigger>
        <AccordionContent className="p-4 border-t bg-background">
          <WPsTab />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="projetos">
        <AccordionTrigger className="px-4 text-lg font-semibold hover:bg-muted/50 transition-colors">
          Projetos
        </AccordionTrigger>
        <AccordionContent className="p-4 border-t bg-background">
          <ProjetosTab />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="colaboradores">
        <AccordionTrigger className="px-4 text-lg font-semibold hover:bg-muted/50 transition-colors">
          Colaboradores
        </AccordionTrigger>
        <AccordionContent className="p-4 border-t bg-background">
          <ColaboradoresTab />
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="artigos">
        <AccordionTrigger className="px-4 text-lg font-semibold hover:bg-muted/50 transition-colors">
          Artigos
        </AccordionTrigger>
        <AccordionContent className="p-4 border-t bg-background">
          <ArtigosTab />
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  )
}
