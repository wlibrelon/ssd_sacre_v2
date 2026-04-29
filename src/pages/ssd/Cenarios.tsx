import { useState } from 'react'
import { useSsdData } from '@/hooks/use-ssd-data'
import { NativeSelect } from './components/NativeSelect'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { CenariosDashboard } from './components/CenariosDashboard'

export default function Cenarios() {
  const {
    fonte_agua,
    tipos_cenarios,
    cenarios,
    estrategias,
    cenario_demanda,
    cenario_consumo,
    cenario_perdas,
  } = useSsdData()
  const [filters, setFilters] = useState<any>({})
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [ran, setRan] = useState(false)

  const handleSimulate = async () => {
    setLoading(true)
    let q = supabase.from('dados_simulacao').select('*')
    if (filters.id_fonte) q = q.eq('id_fonte', filters.id_fonte)
    if (filters.id_tc) q = q.eq('id_tc', filters.id_tc)
    if (filters.id_c) q = q.eq('id_c', filters.id_c)
    if (filters.id_e) q = q.eq('id_e', filters.id_e)
    if (filters.id_cd) q = q.eq('id_cd', filters.id_cd)
    if (filters.id_cc) q = q.eq('id_cc', filters.id_cc)
    if (filters.id_cp) q = q.eq('id_cp', filters.id_cp)

    const { data: res, error } = await q
    if (error) console.error(error)
    setData(res || [])
    setRan(true)
    setLoading(false)
  }

  const fontesMap = fonte_agua.reduce(
    (acc: any, f: any) => ({ ...acc, [f.id_fonte]: f.nome_fonte }),
    {},
  )

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Simulação de Cenários</h1>
        <p className="text-muted-foreground">
          Filtre os parâmetros desejados para visualizar o comportamento do sistema de recursos
          hídricos.
        </p>
      </div>

      <div className="bg-white p-6 shadow-md rounded-xl border grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Fonte de Água</label>
          <NativeSelect
            options={fonte_agua.map((o: any) => ({ value: o.id_fonte, label: o.nome_fonte }))}
            value={filters.id_fonte || ''}
            onChange={(v: any) => setFilters({ ...filters, id_fonte: v })}
            placeholder="Todas as Fontes"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Tipo de Cenário</label>
          <NativeSelect
            options={tipos_cenarios.map((o: any) => ({ value: o.id_tc, label: o.descricao }))}
            value={filters.id_tc || ''}
            onChange={(v: any) => setFilters({ ...filters, id_tc: v })}
            placeholder="Todos os Tipos"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Cenário</label>
          <NativeSelect
            options={cenarios.map((o: any) => ({ value: o.id_cenarios, label: o.cenarios }))}
            value={filters.id_c || ''}
            onChange={(v: any) => setFilters({ ...filters, id_c: v })}
            placeholder="Todos os Cenários"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Estratégia</label>
          <NativeSelect
            options={estrategias.map((o: any) => ({ value: o.id_estrategia, label: o.descricao }))}
            value={filters.id_e || ''}
            onChange={(v: any) => setFilters({ ...filters, id_e: v })}
            placeholder="Todas as Estratégias"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Demanda</label>
          <NativeSelect
            options={cenario_demanda.map((o: any) => ({
              value: o.id_cd,
              label: o.nome_cenario_demanda,
            }))}
            value={filters.id_cd || ''}
            onChange={(v: any) => setFilters({ ...filters, id_cd: v })}
            placeholder="Todas as Demandas"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Consumo</label>
          <NativeSelect
            options={cenario_consumo.map((o: any) => ({
              value: o.id_cc,
              label: o.nome_cenario_consumo,
            }))}
            value={filters.id_cc || ''}
            onChange={(v: any) => setFilters({ ...filters, id_cc: v })}
            placeholder="Todos os Consumos"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Perdas</label>
          <NativeSelect
            options={cenario_perdas.map((o: any) => ({
              value: o.id_cp,
              label: o.nome_cenario_perdas,
            }))}
            value={filters.id_cp || ''}
            onChange={(v: any) => setFilters({ ...filters, id_cp: v })}
            placeholder="Todas as Perdas"
          />
        </div>
        <div className="space-y-1 flex items-end">
          <Button onClick={handleSimulate} disabled={loading} className="w-full h-10">
            {loading ? 'Processando...' : 'Executar Simulação'}
          </Button>
        </div>
      </div>

      {ran && data.length === 0 && (
        <div className="text-center p-12 bg-white rounded-lg border border-dashed">
          <p className="text-muted-foreground">
            Nenhum dado de simulação encontrado para estes filtros.
          </p>
        </div>
      )}

      {data.length > 0 && <CenariosDashboard data={data} fontesMap={fontesMap} />}
    </div>
  )
}
