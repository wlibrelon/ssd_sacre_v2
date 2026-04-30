import { CrudTable } from './CrudTable'

export function Grupo1() {
  return (
    <div className="space-y-4">
      <h2 className="text-xl font-bold border-b pb-2">
        Configuração de fontes de água, cenários e estratégias
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {' '}
        // className=
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
          table="estrategias"
          title="Estratégias"
          pk="id_estrategia"
          cols={[
            { key: 'descricao', label: 'Descrição' },
            { key: 'obs_estrategia', label: 'Observação' },
          ]}
        />
      </div>
    </div>
  )
}
