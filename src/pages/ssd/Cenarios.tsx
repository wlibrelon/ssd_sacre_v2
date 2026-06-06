import { useState } from 'react'
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

const MONTHS = [
  { v: '1', l: 'Janeiro' },
  { v: '2', l: 'Fevereiro' },
  { v: '3', l: 'Março' },
  { v: '4', l: 'Abril' },
  { v: '5', l: 'Maio' },
  { v: '6', l: 'Junho' },
  { v: '7', l: 'Julho' },
  { v: '8', l: 'Agosto' },
  { v: '9', l: 'Setembro' },
  { v: '10', l: 'Outubro' },
  { v: '11', l: 'Novembro' },
  { v: '12', l: 'Dezembro' },
]

export default function Cenarios() {
  const {
    fonte_agua,
    tipos_cenarios,
    cenarios,
    acoes,
    cenario_demanda,
    cenario_consumo,
    cenario_perdas,
    simulacao_ssd,
    cenario_simulacao,
  } = useSsdData()

  const [filters, setFilters] = useState<any>({})
  const [data, setData] = useState<any[]>([])
  const [groupedData, setGroupedData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [ran, setRan] = useState(false)

  const aplicarCalculosModulares = (data: any[], sim: any, cd: any, cc: any, cp: any) => {
    const tempos = Array.from(new Set(data.map((d) => d.tempo))).sort()
    const pop_inicial = sim?.pop_inicial || 0
    const vol_hab = cc?.vol_hab || 0
    const perc_demanda = cd?.percentual || 0
    const perc_inicial_perdas = sim?.perc_inicial_perdas || 0
    const inicio_perdas = sim?.inicio_perdas || ''
    const perc_final_perdas = cp?.percentual || 0

    const temposNorm = tempos.map((t: any) => (t ? t.replace(/\//g, '-') : ''))
    const inicio_perdas_norm = inicio_perdas ? inicio_perdas.replace(/\//g, '-') : ''

    const startPerdasIdx = temposNorm.findIndex((t: any) => t >= inicio_perdas_norm)
    const totalStepsPerdas = startPerdasIdx >= 0 ? tempos.length - 1 - startPerdasIdx : 0
    const perdasStep =
      totalStepsPerdas > 0 ? (perc_inicial_perdas - perc_final_perdas) / totalStepsPerdas : 0

    const calculatedData = data.map((row) => {
      let rowDemanda = row.demanda || 0
      let rowPerdas = row.perdas || 0
      let populacao_calculada = 0
      const tIdx = tempos.indexOf(row.tempo)

      if (sim?.demanda_auto && cd && cc) {
        const ano_inicial = parseInt((tempos[0] || '0').split(/[-/]/)[0])
        const row_ano = parseInt((row.tempo || '0').split(/[-/]/)[0])
        const tempo_anos = row_ano - ano_inicial
        const popAtual = pop_inicial * Math.pow(1 + perc_demanda / 100, tempo_anos)
        populacao_calculada = popAtual
        rowDemanda = popAtual * vol_hab
      }

      if (sim?.perdas_auto && cp) {
        if (startPerdasIdx === -1 || tIdx <= startPerdasIdx) {
          rowPerdas = perc_inicial_perdas
        } else {
          const passos = tIdx - startPerdasIdx
          rowPerdas = perc_inicial_perdas - perdasStep * passos
          if (perc_inicial_perdas >= perc_final_perdas && rowPerdas < perc_final_perdas) {
            rowPerdas = perc_final_perdas
          } else if (perc_inicial_perdas < perc_final_perdas && rowPerdas > perc_final_perdas) {
            rowPerdas = perc_final_perdas
          }
        }
      }

      return { ...row, demanda: rowDemanda, perdas: rowPerdas, populacao_calculada }
    })

    return calculatedData
  }

  const applyFinancialMetrics = async (simId: number) => {
    let q = supabase.from('dados_simulacao').select('*')
    if (filters.id_s) q = q.eq('id_s', filters.id_s)

    if (filters.ano_inicio) q = q.gte('tempo', `${filters.ano_inicio}/01`)
    if (filters.ano_fim) q = q.lte('tempo', `${filters.ano_fim}/12`)

    if (filters.meses && filters.meses.length > 0) {
      const orString = filters.meses
        .map((m: string) => `tempo.ilike.%/${m.padStart(2, '0')}`)
        .join(',')
      q = q.or(orString)
    }

    const [
      { data: capexAcao },
      { data: acoesFonte },
      { data: capexPerdas },
      { data: opexData },
      { data: dsData, error },
    ] = await Promise.all([
      supabase.from('capex_acao').select('*'),
      supabase.from('acoes_fonte').select('*'),
      supabase.from('capex_perdas').select('*'),
      supabase.from('opex').select('*'),
      q,
    ])

    if (error) console.error(error)
    if (!dsData) return []

    const capexAcaoMap: Record<string, number> = {}
    if (capexAcao && acoesFonte) {
      capexAcao.forEach((ca) => {
        const af = acoesFonte.filter((a) => a.id_acao === ca.id_acao)
        af.forEach((a) => {
          const tempoNorm = ca.tempo ? ca.tempo.replace(/\//g, '-') : ''
          const key = `${tempoNorm}_${a.id_fonte}`
          capexAcaoMap[key] = (capexAcaoMap[key] || 0) + (ca.capex || 0)
        })
      })
    }

    const capexPerdasMap: Record<string, number> = {}
    if (capexPerdas) {
      capexPerdas.forEach((cp) => {
        if (cp.tempo) {
          const tempoNorm = cp.tempo.replace(/\//g, '-')
          capexPerdasMap[tempoNorm] = (capexPerdasMap[tempoNorm] || 0) + (cp.capex || 0)
        }
      })
    }

    const opexMap: Record<string, number> = {}
    if (opexData) {
      opexData.forEach((op) => {
        if (op.tempo) {
          const tempoNorm = op.tempo.replace(/\//g, '-')
          opexMap[tempoNorm] = (opexMap[tempoNorm] || 0) + (op.opex || 0)
        }
      })
    }

    const updates: any[] = []
    const dsUpdated = dsData.map((row) => {
      let newCapexEst = 0
      if (row.tempo && row.id_fonte) {
        const tempoNorm = row.tempo.replace(/\//g, '-')
        newCapexEst += capexAcaoMap[`${tempoNorm}_${row.id_fonte}`] || 0
      }

      let newCapexPer = 0
      if (row.tempo) {
        const tempoNorm = row.tempo.replace(/\//g, '-')
        newCapexPer += capexPerdasMap[tempoNorm] || 0
      }

      let newOpex = 0
      if (row.tempo) {
        const tempoNorm = row.tempo.replace(/\//g, '-')
        newOpex = opexMap[tempoNorm] || 0
      }

      if (
        row.capex_estrategia !== newCapexEst ||
        row.capex_perdas !== newCapexPer ||
        row.opex !== newOpex
      ) {
        const updatedRow = {
          ...row,
          capex_estrategia: newCapexEst,
          capex_perdas: newCapexPer,
          opex: newOpex,
        }
        updates.push(updatedRow)
        return updatedRow
      }
      return row
    })

    if (updates.length > 0) {
      const batchSize = 1000
      for (let i = 0; i < updates.length; i += batchSize) {
        await supabase.from('dados_simulacao').upsert(updates.slice(i, i + batchSize))
      }
    }

    return dsUpdated
  }

  const handleSimulate = async () => {
    setLoading(true)
    let resData = await applyFinancialMetrics(parseInt(filters.id_s))
    const activeSimObj = simulacao_ssd.find((s: any) => s.id_s === parseInt(filters.id_s))

    if (activeSimObj?.demanda_auto || activeSimObj?.perdas_auto) {
      const cd = cenario_demanda.find((c: any) => c.id_cd === parseInt(filters.id_cd_auto))
      const cc = cenario_consumo.find((c: any) => c.id_cc === parseInt(filters.id_cc_auto))
      const cp = cenario_perdas.find((c: any) => c.id_cp === parseInt(filters.id_cp_auto))
      resData = aplicarCalculosModulares(resData, activeSimObj, cd, cc, cp)
    }

    const processedData = resData.map((row: any) => {
      const volume_captado = row.volume_captado || 0
      const perdas_percentual = row.perdas || 0
      const volume_distribuido = volume_captado * (1 - perdas_percentual / 100)
      const demanda = row.demanda || 0

      const capex = (row.capex_estrategia || 0) + (row.capex_perdas || 0)

      return {
        ...row,
        capex,
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

  const activeSimObj = simulacao_ssd.find((s: any) => s.id_s === parseInt(filters.id_s))
  const contextData =
    activeSimObj && cenario_simulacao
      ? cenario_simulacao.filter((cs: any) => cs.id_s === activeSimObj.id_s)
      : []

  const getF = (id: any) => fonte_agua.find((x: any) => x.id_fonte === id)?.nome_fonte
  const getTc = (id: any) => tipos_cenarios.find((x: any) => x.id_tc === id)?.descricao
  const getC = (id: any) => cenarios.find((x: any) => x.id_cenarios === id)?.cenarios
  const getAcao = (id: any) => acoes.find((x: any) => x.id_acao === id)?.descricao

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
        <div className="space-y-6 md:col-span-2">
          <div className="bg-white p-5 shadow-sm rounded-xl border border-slate-200 w-full">
            <h3 className="font-semibold text-primary border-b pb-3 mb-4 text-sm uppercase tracking-wider">
              Cenários para Simulação
            </h3>
            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Simulação</label>
                <NativeSelect
                  className="w-full"
                  options={simulacao_ssd.map((o: any) => ({
                    value: o.id_s,
                    label: o.descricao,
                  }))}
                  value={filters.id_s || ''}
                  onChange={(v: any) => setFilters({ ...filters, id_s: v })}
                  placeholder="Escolha uma Simulação"
                />
              </div>
            </div>
            {activeSimObj && (
              <div className="mt-4 border rounded-md overflow-hidden animate-fade-in-up">
                <Table>
                  <TableHeader className="bg-slate-50">
                    <TableRow>
                      <TableHead className="text-xs">Fonte</TableHead>
                      <TableHead className="text-xs">Tipo Cenário</TableHead>
                      <TableHead className="text-xs">Cenário</TableHead>
                      <TableHead className="text-xs">Ação</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {contextData.map((row: any) => (
                      <TableRow key={row.id_cs}>
                        <TableCell className="text-xs py-2">{getF(row.id_fonte)}</TableCell>
                        <TableCell className="text-xs py-2">{getTc(row.id_tc)}</TableCell>
                        <TableCell className="text-xs py-2">{getC(row.id_c)}</TableCell>
                        <TableCell className="text-xs py-2">{getAcao(row.id_acao)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
          {activeSimObj && (activeSimObj.demanda_auto || activeSimObj.perdas_auto) && (
            <div className="bg-white p-5 shadow-sm rounded-xl border border-slate-200 w-full mt-6">
              <h3 className="font-semibold text-primary border-b pb-3 mb-4 text-sm uppercase tracking-wider">
                Demanda e Perdas (Automático)
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {activeSimObj.demanda_auto && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground">Demanda</h4>
                    <NativeSelect
                      className="w-full"
                      options={cenario_demanda.map((o: any) => ({
                        value: o.id_cd,
                        label: o.nome_cenario_demanda,
                      }))}
                      value={filters.id_cd_auto || ''}
                      onChange={(v: any) => setFilters({ ...filters, id_cd_auto: v })}
                      placeholder="Cenário Demanda"
                    />
                    <NativeSelect
                      className="w-full"
                      options={cenario_consumo.map((o: any) => ({
                        value: o.id_cc,
                        label: o.nome_cenario_consumo,
                      }))}
                      value={filters.id_cc_auto || ''}
                      onChange={(v: any) => setFilters({ ...filters, id_cc_auto: v })}
                      placeholder="Cenário Consumo"
                    />
                  </div>
                )}
                {activeSimObj.perdas_auto && (
                  <div className="space-y-3">
                    <h4 className="text-sm font-semibold text-muted-foreground">Perdas</h4>
                    <NativeSelect
                      className="w-full"
                      options={cenario_perdas.map((o: any) => ({
                        value: o.id_cp,
                        label: o.nome_cenario_perdas,
                      }))}
                      value={filters.id_cp_auto || ''}
                      onChange={(v: any) => setFilters({ ...filters, id_cp_auto: v })}
                      placeholder="Cenário Perdas"
                    />
                  </div>
                )}
              </div>
            </div>
          )}
          <div className="bg-white p-5 shadow-sm rounded-xl border border-slate-200 flex flex-col w-full mt-6">
            <h3 className="font-semibold text-primary border-b pb-3 mb-4 text-sm uppercase tracking-wider">
              Período
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
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
                    2039, 2040, 2041, 2042, 2043, 2044, 2045, 2046, 2047, 2048, 2049, 2050,
                  ].map((y) => ({
                    value: y,
                    label: y.toString(),
                  }))}
                  value={filters.ano_fim || ''}
                  onChange={(v: any) => setFilters({ ...filters, ano_fim: v })}
                  placeholder="Fim"
                />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground">
                  Meses (Múltipla Seleção)
                </label>
                <div className="space-x-2">
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => setFilters({ ...filters, meses: MONTHS.map((m) => m.v) })}
                  >
                    Marcar todos
                  </button>
                  <button
                    type="button"
                    className="text-xs text-primary hover:underline"
                    onClick={() => setFilters({ ...filters, meses: [] })}
                  >
                    Desmarcar todos
                  </button>
                </div>
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-2">
                {MONTHS.map((m) => (
                  <label
                    key={m.v}
                    className="flex items-center space-x-2 border p-2 rounded-md hover:bg-slate-50 cursor-pointer"
                  >
                    <input
                      type="checkbox"
                      className="w-4 h-4 rounded border-gray-300 text-primary focus:ring-primary"
                      checked={filters.meses?.includes(m.v) || false}
                      onChange={(e) => {
                        const current = filters.meses || []
                        setFilters({
                          ...filters,
                          meses: e.target.checked
                            ? [...current, m.v]
                            : current.filter((x: string) => x !== m.v),
                        })
                      }}
                    />
                    <span className="text-xs font-medium">{m.l}</span>
                  </label>
                ))}
              </div>
            </div>
            <div className="pt-6 flex flex-col gap-2">
              <Button
                onClick={handleSimulate}
                disabled={loading || !filters.id_s}
                className="w-full h-11 shadow-sm text-base disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {loading ? 'Processando...' : 'Executar Simulação'}
              </Button>
              {!filters.id_s && (
                <p className="text-xs text-red-500 text-center font-medium">
                  Selecione uma simulação para executar.
                </p>
              )}
            </div>
          </div>
        </div>
        <div className="space-y-6"></div>
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
