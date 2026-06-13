import React from 'react'
import { Grupo1 } from './components/Grupo1'
import { Grupo2 } from './components/Grupo2'
import { Grupo4 } from './components/Grupo4'
import { GrupoUpload } from './components/GrupoUpload'
import { Importacao } from './components/Importacao'
import {
  Accordion,
  AccordionItem,
  AccordionTrigger,
  AccordionContent,
} from '@/components/ui/accordion'

class ErrorBoundary extends React.Component<
  { children: React.ReactNode },
  { hasError: boolean; error: any }
> {
  constructor(props: { children: React.ReactNode }) {
    super(props)
    this.state = { hasError: false, error: null }
  }
  static getDerivedStateFromError(error: any) {
    return { hasError: true, error }
  }
  render() {
    if (this.state.hasError) {
      return (
        <div className="p-4 bg-red-50 border border-red-200 rounded-md text-red-800 my-4">
          <h3 className="font-bold">Erro ao carregar componente</h3>
          <p className="text-sm mt-1">{this.state.error?.message || 'Erro desconhecido'}</p>
        </div>
      )
    }
    return this.props.children
  }
}

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
            <ErrorBoundary>
              <Grupo1 />
            </ErrorBoundary>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="g2" className="border rounded-lg px-4 bg-white shadow-sm">
          <AccordionTrigger className="text-xl font-bold hover:no-underline text-left">
            Associações de Referência
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <ErrorBoundary>
              <Grupo2 />
            </ErrorBoundary>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="g4" className="border rounded-lg px-4 bg-white shadow-sm">
          <AccordionTrigger className="text-xl font-bold hover:no-underline text-left">
            Configuração de Demandas e Perdas
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <ErrorBoundary>
              <Grupo4 />
            </ErrorBoundary>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="upload" className="border rounded-lg px-4 bg-white shadow-sm">
          <AccordionTrigger className="text-xl font-bold hover:no-underline text-left">
            Upload de arquivos de dados
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <ErrorBoundary>
              <GrupoUpload />
            </ErrorBoundary>
          </AccordionContent>
        </AccordionItem>

        <AccordionItem value="importacao" className="border rounded-lg px-4 bg-white shadow-sm">
          <AccordionTrigger className="text-xl font-bold hover:no-underline text-left">
            Importação de dados
          </AccordionTrigger>
          <AccordionContent className="pt-2 pb-6">
            <ErrorBoundary>
              <Importacao />
            </ErrorBoundary>
          </AccordionContent>
        </AccordionItem>
      </Accordion>
    </div>
  )
}
