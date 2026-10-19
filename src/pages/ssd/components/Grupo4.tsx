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
            { key: 'percentual', label: 'Crescimento populacional (% a.a.)' },
          ]}
        />
        <CrudTable
          table="cenario_consumo"
          title="Cenário Consumo"
          pk="id_cc"
          cols={[
            { key: 'nome_cenario_consumo', label: 'Nome' },
            { key: 'descricao', label: 'Descrição' },
            { key: 'vol_hab', label: 'Consumo per capita (L/hab./dia)' },
          ]}
        />
        <CrudTable
          table="cenario_perdas"
          title="Cenário Perdas"
          pk="id_cp"
          cols={[
            { key: 'nome_cenario_perdas', label: 'Nome' },
            { key: 'descricao', label: 'Descrição' },
            { key: 'percentual', label: 'Meta de perdas (%)' },
          ]}
        />
      </div>
    </div>
  )
}
