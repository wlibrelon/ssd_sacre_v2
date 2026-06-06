import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'
import { GrupoUpload } from '../components/GrupoUpload'
import { GrupoModelos } from '../components/GrupoModelos'
import { Indicadores } from './Indicadores'
import { SimulacoesConfig } from './SimulacoesConfig'
import { Importacao } from './Importacao'

export default function ParametrosPage() {
  return (
    <div className="p-6 space-y-8 max-w-7xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Parâmetros e Modelos</h1>
        <p className="text-muted-foreground">
          Gerencie uploads para o banco de dados e associe arquivos aos modelos hidrogeológicos.
        </p>
      </div>

      <Accordion type="multiple" defaultValue={[]} className="w-full space-y-4">
        <AccordionItem value="upload" className="border rounded-lg px-4 bg-white shadow-sm">
          <AccordionTrigger className="text-xl font-bold hover:no-underline text-left">
            Upload de arquivos de dados
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <GrupoUpload />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="modelos" className="border rounded-lg px-4 bg-white shadow-sm">
          <AccordionTrigger className="text-xl font-bold hover:no-underline text-left">
            Modelos Hidrogeológicos
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <GrupoModelos />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="indicadores" className="border rounded-lg px-4 bg-white shadow-sm">
          <AccordionTrigger className="text-xl font-bold hover:no-underline text-left">
            Gestão de Indicadores
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <Indicadores />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="simulacoes" className="border rounded-lg px-4 bg-white shadow-sm">
          <AccordionTrigger className="text-xl font-bold hover:no-underline text-left">
            Configuração de Simulações
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <SimulacoesConfig />
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="importacao" className="border rounded-lg px-4 bg-white shadow-sm">
          <AccordionTrigger className="text-xl font-bold hover:no-underline text-left">
            Importação de Dados
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <Importacao />
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
