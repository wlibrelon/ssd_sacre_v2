import { Grupo1 } from './components/Grupo1'
import { Grupo2 } from './components/Grupo2'
import { Grupo4 } from './components/Grupo4'
import { GrupoUpload } from './components/GrupoUpload'
import { Importacao } from './parametros/Importacao'
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

      <Accordion type="multiple" defaultValue={[]} className="w-full space-y-4">
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

        <AccordionItem value="g4" className="border rounded-lg px-4 bg-white shadow-sm">
          <AccordionTrigger className="text-xl font-bold hover:no-underline text-left">
            Configuração de Demandas e Perdas
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <Grupo4 />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="upload" className="border rounded-lg px-4 bg-white shadow-sm">
          <AccordionTrigger className="text-xl font-bold hover:no-underline text-left">
            Upload de arquivos de dados
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <GrupoUpload />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="importacao" className="border rounded-lg px-4 bg-white shadow-sm">
          <AccordionTrigger className="text-xl font-bold hover:no-underline text-left">
            Importação de dados
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <Importacao />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
