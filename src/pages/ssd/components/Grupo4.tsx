import { CrudTable } from './CrudTable'

export function Grupo4() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 gap-4 w-full">
        <CrudTable
          table="cenario_demanda"
          title="Cenário Demanda"
          pk="id_cd"
          cols={[
            { key: 'nome_cenario_demanda', label: 'Nome' },
            { key: 'descricao', label: 'Descrição' },
            { key: 'percentual', label: 'Percentual (%)' },
          ]}
        />
        <CrudTable
          table="cenario_consumo"
          title="Cenário Consumo"
          pk="id_cc"
          cols={[
            { key: 'nome_cenario_consumo', label: 'Nome' },
            { key: 'descricao', label: 'Descrição' },
            { key: 'vol_hab', label: 'Vol/Hab (m³)' },
          ]}
        />
        <CrudTable
          table="cenario_perdas"
          title="Cenário Perdas"
          pk="id_cp"
          cols={[
            { key: 'nome_cenario_perdas', label: 'Nome' },
            { key: 'percentual', label: 'Percentual (%)' },
          ]}
        />
      </div>
    </div>
  )
}
