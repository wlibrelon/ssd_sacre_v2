import { CrudTable } from './CrudTable'
import { Indicadores } from '../parametros/Indicadores'

export function Grupo1() {
  return (
    <div className="space-y-6">
      <div className="space-y-4">
        <h3 className="text-lg font-semibold text-primary">Tabelas de Referência</h3>
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <CrudTable
            table="fonte_agua"
            title="Fontes de Água"
            pk="id_fonte"
            cols={[{ key: 'nome_fonte', label: 'Nome da Fonte' }]}
          />
          <CrudTable
            table="tipos_cenarios"
            title="Tipos de Cenários"
            pk="id_tc"
            cols={[
              { key: 'descricao', label: 'Descrição' },
              { key: 'obs_tipo_cenario', label: 'Observação' },
            ]}
          />
          <CrudTable
            table="cenarios"
            title="Cenários"
            pk="id_cenarios"
            cols={[
              { key: 'cenarios', label: 'Cenário' },
              { key: 'obs_cenario', label: 'Observação' },
            ]}
          />
          <CrudTable
            table="acoes"
            title="Ações"
            pk="id_acao"
            cols={[
              { key: 'descricao', label: 'Descrição' },
              { key: 'obs', label: 'Observação' },
            ]}
          />
        </div>
      </div>

      <div className="border p-4 rounded-lg bg-slate-50 shadow-sm space-y-4">
        <h3 className="text-lg font-semibold text-primary">Gestão de Indicadores</h3>
        <Indicadores />
      </div>
    </div>
  )
}
