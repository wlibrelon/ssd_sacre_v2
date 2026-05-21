import { Grupo1 } from './components/Grupo1'
import { Grupo2 } from './components/Grupo2'
import { Grupo3 } from './components/Grupo3'
import { Grupo4 } from './components/Grupo4'
import { Grupo5 } from './components/Grupo5'
import { GrupoCapexOpex } from './components/GrupoCapexOpex'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

export default function Configuracoes() {
  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">
          Configurações do Sistema de Suporte a Decisão
        </h1>
        <p className="text-muted-foreground">
          Gerencie as tabelas de referência, associações e importe os dados de simulação.
        </p>
      </div>

      <Accordion type="multiple" className="w-full space-y-4">
        <AccordionItem value="g1" className="border rounded-lg px-4 bg-white shadow-sm">
          <AccordionTrigger className="text-xl font-bold hover:no-underline text-left">
            Configuração de fontes de água, cenários e ações
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <Grupo1 />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="g2" className="border rounded-lg px-4 bg-white shadow-sm">
          <AccordionTrigger className="text-xl font-bold hover:no-underline text-left">
            Associações de Referência
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <Grupo2 />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="g3" className="border rounded-lg px-4 bg-white shadow-sm">
          <AccordionTrigger className="text-xl font-bold hover:no-underline text-left">
            Simulações para SSD
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <Grupo3 />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="g4" className="border rounded-lg px-4 bg-white shadow-sm">
          <AccordionTrigger className="text-xl font-bold hover:no-underline text-left">
            Configuração de Demandas e Perdas
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <Grupo4 />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="gcapex" className="border rounded-lg px-4 bg-white shadow-sm">
          <AccordionTrigger className="text-xl font-bold hover:no-underline text-left">
            Dados para CAPEX e OPEX
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <GrupoCapexOpex />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="g5" className="border rounded-lg px-4 bg-white shadow-sm">
          <AccordionTrigger className="text-xl font-bold hover:no-underline text-left">
            Importação de dados para simulação
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <Grupo5 />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
