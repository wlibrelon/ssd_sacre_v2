import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { FileBrowser } from './FileBrowser'
import { ModelosHidro } from './ModelosHidro'
import { Indicadores } from './Indicadores'
import { SimulacoesConfig } from './SimulacoesConfig'
import { Importacao } from './Importacao'

export default function ParametrosPage() {
  return (
    <div className="p-6 max-w-[1200px] mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Parâmetros do Sistema</h1>
        <p className="text-muted-foreground">
          Gerencie arquivos brutos, modelos, indicadores e importe dados para as simulações.
        </p>
      </div>

      <Accordion
        type="single"
        collapsible
        className="w-full bg-white px-6 rounded-xl shadow-sm border"
      >
        <AccordionItem value="item-1">
          <AccordionTrigger className="font-semibold text-lg">
            Upload de arquivos de dados
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <FileBrowser />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-2">
          <AccordionTrigger className="font-semibold text-lg">
            Modelos Hidrogeológicos
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <ModelosHidro />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-3">
          <AccordionTrigger className="font-semibold text-lg">Indicadores</AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <Indicadores />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-4">
          <AccordionTrigger className="font-semibold text-lg">
            Configuração das Simulações
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <SimulacoesConfig />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="item-5">
          <AccordionTrigger className="font-semibold text-lg">
            Importação de dados para simulação
          </AccordionTrigger>
          <AccordionContent className="pt-4 pb-6">
            <Importacao />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
