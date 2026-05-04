import { useState, useEffect } from 'react'
import { useSsdData } from '@/hooks/use-ssd-data'
import { NativeSelect } from './components/NativeSelect'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { CenariosDashboard } from './components/CenariosDashboard'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

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
  const [groupedData, setGroupedData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [ran, setRan] = useState(false)
  const [simulacoes, setSimulacoes] = useState<any[]>([])

  useEffect(() => {
    supabase
      .from('simulacao_ssd')
      .select('*')
      .then(({ data }) => {
        if (data) setSimulacoes(data)
      })
  }, [])

  const handleSimulate = async () => {
    setLoading(true)
    let q = supabase.from('dados_simulacao').select('*')

    if (filters.id_s) q = q.eq('id_s', filters.id_s)
    if (filters.id_fonte) q = q.eq('id_fonte', filters.id_fonte)
    if (filters.id_tc) q = q.eq('id_tc', filters.id_tc)
    if (filters.id_c) q = q.eq('id_c', filters.id_c)
    if (filters.id_e) q = q.eq('id_e', filters.id_e)
    if (filters.id_cd) q = q.eq('id_cd', filters.id_cd)
    if (filters.id_cc) q = q.eq('id_cc', filters.id_cc)
    if (filters.id_cp) q = q.eq('id_cp', filters.id_cp)

    if (filters.ano_inicio) q = q.gte('tempo', `${filters.ano_inicio}-01`)
    if (filters.ano_fim) q = q.lte('tempo', `${filters.ano_fim}-12`)
    if (filters.mes) q = q.ilike('tempo', `%-${filters.mes.padStart(2, '0')}`)

    const { data: res, error } = await q
    if (error) console.error(error)

    const processedData = (res || []).map((row: any) => {
      const volume_captado = row.volume_captado || 0
      const perdas_percentual = row.perdas || 0
      const volume_distribuido = volume_captado * (1 - perdas_percentual / 100)
      const demanda = row.demanda || 0

      return {
        ...row,
        volume_distribuido,
        distribuicao_total: volume_distribuido,
        deficit: demanda - volume_distribuido,
      }
    })

    const groupedMap = processedData.reduce((acc: any, row: any) => {
      const key = `${row.tempo}_${row.id_fonte}`
      if (!acc[key]) {
        acc[key] = {
          tempo: row.tempo,
          id_fonte: row.id_fonte,
          volume_distribuido: 0,
          demanda: 0,
          deficit: 0,
          capex: 0,
          opex: 0,
          count: 0,
        }
      }
      acc[key].volume_distribuido += row.volume_distribuido || 0
      acc[key].demanda += row.demanda || 0
      acc[key].deficit += row.deficit || 0
      acc[key].capex += row.capex || 0
      acc[key].opex += row.opex || 0
      acc[key].count += 1
      return acc
    }, {})

    const groupedArray = Object.values(groupedMap)
      .map((g: any) => ({
        tempo: g.tempo,
        id_fonte: g.id_fonte,
        volume_distribuido: g.volume_distribuido,
        demanda: g.demanda / g.count,
        deficit: g.deficit,
        capex: g.capex / g.count,
        opex: g.opex / g.count,
      }))
      .sort((a: any, b: any) => a.tempo.localeCompare(b.tempo))

    setData(processedData)
    setGroupedData(groupedArray)
    setRan(true)
    setLoading(false)
  }

  const fontesMap = fonte_agua.reduce(
    (acc: any, f: any) => ({ ...acc, [f.id_fonte]: f.nome_fonte }),
    {},
  )

  const formatCurrency = (val: number) =>
    new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(val)

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Simulação de Cenários</h1>
        <p className="text-muted-foreground">
          Filtre os parâmetros desejados para visualizar o comportamento do sistema de recursos
          hídricos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
        {/* COLUNA PRINCIPAL (MAIS LARGA) */}
        <div className="space-y-6 md:col-span-2">
          {/* Quadro 1 */}
          <div className="bg-white p-5 shadow-sm rounded-xl border border-slate-200 w-full">
            <h3 className="font-semibold text-primary border-b pb-3 mb-4 text-sm uppercase tracking-wider">
              Cenários para Simulação
            </h3>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Simulação</label>
                <NativeSelect
                  className="w-full"
                  options={simulacoes.map((o: any) => ({
                    value: o.id_s,
                    label: o.descricao,
                  }))}
                  value={filters.id_s || ''}
                  onChange={(v: any) => setFilters({ ...filters, id_s: v })}
                  placeholder="Todas as Simulações"
                />
              </div>
            </div>
          </div>

          {/* Quadro 3 */}
          <div className="bg-white p-5 shadow-sm rounded-xl border border-slate-200 flex flex-col w-full">
            <h3 className="font-semibold text-primary border-b pb-3 mb-4 text-sm uppercase tracking-wider">
              Período
            </h3>

            {/* Layout melhorado */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 flex-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Ano Início</label>
                <NativeSelect
                  className="w-full"
                  options={[
                    2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038,
                    2039, 2040, 2041, 2042, 2043, 2044, 2045, 2046, 2047, 2048, 2049, 2050,
                  ].map((y) => ({
                    value: y,
                    label: y.toString(),
                  }))}
                  value={filters.ano_inicio || ''}
                  onChange={(v: any) => setFilters({ ...filters, ano_inicio: v })}
                  placeholder="Início"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Ano Fim</label>
                <NativeSelect
                  className="w-full"
                  options={[
                    2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038,
                    2039, 2040, 2041, 2042, 2043, 2044, 2045, 2046, 2047, 2048, 2049, 2040, 2050,
                  ].map((y) => ({
                    value: y,
                    label: y.toString(),
                  }))}
                  value={filters.ano_fim || ''}
                  onChange={(v: any) => setFilters({ ...filters, ano_fim: v })}
                  placeholder="Fim"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">
                  Mês Específico
                </label>
                <NativeSelect
                  className="w-full"
                  options={Array.from({ length: 12 }, (_, i) => ({
                    value: (i + 1).toString(),
                    label: (i + 1).toString().padStart(2, '0'),
                  }))}
                  value={filters.mes || ''}
                  onChange={(v: any) => setFilters({ ...filters, mes: v })}
                  placeholder="Todos os meses"
                />
              </div>
            </div>

            <div className="pt-6">
              <Button
                onClick={handleSimulate}
                disabled={loading}
                className="w-full h-11 shadow-sm text-base"
              >
                {loading ? 'Processando...' : 'Executar Simulação'}
              </Button>
            </div>
          </div>
        </div>

        {/* COLUNA DIREITA (RESERVADA PRA FUTURO / DASHBOARD / FILTROS) */}
        <div className="space-y-6">{/* Pode adicionar KPIs, resumo, etc */}</div>
      </div>

      {ran && data.length === 0 && (
        <div className="text-center p-12 bg-white rounded-lg border border-dashed">
          <p className="text-muted-foreground">
            Nenhum dado de simulação encontrado para estes filtros.
          </p>
        </div>
      )}

      {data.length > 0 && (
        <>
          <CenariosDashboard data={data} fontesMap={fontesMap} />
        </>
      )}
    </div>
  )
}
