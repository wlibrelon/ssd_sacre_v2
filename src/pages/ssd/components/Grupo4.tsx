import { CrudTable } from './CrudTable'

export function Grupo4() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold border-b pb-2">Configuração de Demandas e Perdas</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <CrudTable
          table="cenario_demanda"
          title="Cenário Demanda"
          pk="id_cd"
          cols={[
            { key: 'nome_cenario_demanda', label: 'Nome' },
            { key: 'descricao', label: 'Descrição' },
          ]}
        />
        <CrudTable
          table="cenario_consumo"
          title="Cenário Consumo"
          pk="id_cc"
          cols={[
            { key: 'nome_cenario_consumo', label: 'Nome' },
            { key: 'descricao', label: 'Descrição' },
          ]}
        />
        <CrudTable
          table="cenario_perdas"
          title="Cenário Perdas"
          pk="id_cp"
          cols={[
            { key: 'nome_cenario_perdas', label: 'Nome' },
            { key: 'descricao', label: 'Descrição' },
          ]}
        />
      </div>
    </div>
  )
}
