import { Grupo1 } from './components/Grupo1'
import { Grupo2 } from './components/Grupo2'
import { Grupo3 } from './components/Grupo3'
import { Grupo4 } from './components/Grupo4'
import { Grupo5 } from './components/Grupo5'

export default function Configuracoes() {
  return (
    <div className="p-6 space-y-12 max-w-7xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">
          Configurações do Sistema de Suporte a Decisão
        </h1>
        <p className="text-muted-foreground">
          Gerencie as tabelas de referência, associações e importe os dados de simulação.
        </p>
      </div>

      <Grupo1 />
      <Grupo2 />
      <Grupo3 />
      <Grupo4 />
      <Grupo5 />
    </div>
  )
}
