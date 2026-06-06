import { useState, useEffect } from 'react'
import { useSsdData } from '@/hooks/use-ssd-data'
import { NativeSelect } from './components/NativeSelect'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { CenariosDashboard } from './components/CenariosDashboard'
import { Checkbox } from '@/components/ui/checkbox'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ReferenceArea,
} from 'recharts'

const MONTHS = [
  { v: '1', l: 'Janeiro' },
  { v: '2', l: 'Fevereiro' },
  { v: '3', l: 'MarÃ§o' },
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

const LINE_COLORS = ['#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed', '#0891b2', '#be185d']

// â”€â”€ helpers de seguranÃ§a hÃ­drica â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

type StatusSeg = 'seguro' | 'alerta' | 'crise'

function getStatus(indice: number, limiarAlerta: number, limiarCrise: number): StatusSeg {
  if (indice >= limiarAlerta) return 'seguro'
  if (indice >= limiarCrise) return 'alerta'
  return 'crise'
}

const STATUS_LABEL: Record<StatusSeg, string> = {
  seguro: 'Seguro',
  alerta: 'Alerta',
  crise: 'Crise',
}

const STATUS_COLORS: Record<StatusSeg, { bg: string; text: string; border: string }> = {
  seguro: { bg: 'bg-emerald-50', text: 'text-emerald-700', border: 'border-emerald-200' },
  alerta: { bg: 'bg-amber-50', text: 'text-amber-700', border: 'border-amber-200' },
  crise: { bg: 'bg-red-50', text: 'text-red-700', border: 'border-red-200' },
}

const STATUS_BADGE: Record<StatusSeg, string> = {
  seguro: 'bg-emerald-100 text-emerald-700',
  alerta: 'bg-amber-100 text-amber-700',
  crise: 'bg-red-100 text-red-700',
}

// Tooltip customizado para o grÃ¡fico de seguranÃ§a hÃ­drica
const TooltipSeguranca = ({ active, payload, label, limiarAlerta, limiarCrise }: any) => {
  if (!active || !payload || payload.length === 0) return null
  return (
    <div className="bg-white border border-slate-200 rounded-lg shadow-lg p-3 text-xs space-y-1 min-w-[200px]">
      <p className="font-semibold text-slate-700 border-b pb-1 mb-1">{label}</p>
      {payload.map((entry: any) => {
        const indice = typeof entry.value === 'number' ? entry.value : null
        if (indice == null) return null
        const status = getStatus(indice, limiarAlerta, limiarCrise)
        const vol = entry.payload[`__vol_${entry.dataKey}`]
        const dem = entry.payload[`__dem_${entry.dataKey}`]
        return (
          <div key={entry.dataKey} className="space-y-0.5">
            <div className="flex items-center gap-1.5">
              <span
                className="w-2.5 h-2.5 rounded-full inline-block shrink-0"
                style={{ background: entry.color }}
              />
              <span className="font-medium text-slate-600">{entry.dataKey}</span>
            </div>
            <div className="pl-4 space-y-0.5 text-slate-500">
              <div>
                Ãndice:{' '}
                <span className={`font-bold ${STATUS_COLORS[status].text}`}>
                  {indice.toLocaleString('pt-BR', {
                    minimumFractionDigits: 2,
                    maximumFractionDigits: 2,
                  })}
                </span>{' '}
                <span
                  className={`px-1.5 py-0.5 rounded text-[10px] font-semibold ${STATUS_BADGE[status]}`}
                >
                  {STATUS_LABEL[status]}
                </span>
              </div>
              {vol != null && (
                <div>
                  Vol. distribuÃ­do: {vol.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} mÂ³
                </div>
              )}
              {dem != null && (
                <div>Demanda: {dem.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} mÂ³</div>
              )}
            </div>
          </div>
        )
      })}
    </div>
  )
}

// â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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

  // SeguranÃ§a hÃ­drica
  const [segurancaHidrica, setSegurancaHidrica] = useState<{
    porFonte: Record<
      number,
      { indicesMes: { tempo: string; indice: number; vol: number; dem: number }[] }
    >
    chartData: any[]
    criticos: {
      tempo: string
      id_fonte: number
      indice: number
      status: StatusSeg
      deficit: number
    }[]
    fontes: number[]
  } | null>(null)

  // Indicadores
  const [indicadores, setIndicadores] = useState<any[]>([])
  const [selectedIndicadores, setSelectedIndicadores] = useState<number[]>([])

  useEffect(() => {
    if (!filters.id_s) {
      setIndicadores([])
      setSelectedIndicadores([])
      return
    }
    supabase
      .from('indicadores_aplicado')
      .select('*, indicadores(*)')
      .eq('id_s', filters.id_s)
      .then(({ data: rows }) => {
        if (!rows) return
        const unique = Object.values(
          rows.reduce((acc: any, r: any) => {
            if (r.indicadores && !acc[r.indicadores.id_indicador]) {
              acc[r.indicadores.id_indicador] = r.indicadores
            }
            return acc
          }, {}),
        )
        setIndicadores(unique as any[])
        setSelectedIndicadores([])
      })
  }, [filters.id_s])

  const toggleIndicador = (id: number) => {
    setSelectedIndicadores((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

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

    // â”€â”€ Calcula seguranÃ§a hÃ­drica a partir de processedData â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€
    const limiarAlerta = activeSimObj?.limiar_alerta ?? 0.8
    const limiarCrise = activeSimObj?.limiar_crise ?? 0.6

    // Agrupa por tempo+fonte (mÃ©dia quando hÃ¡ mÃºltiplos id_mod)
    const segMap: Record<
      string,
      { vol: number; dem: number; count: number; id_fonte: number; tempo: string }
    > = {}
    processedData.forEach((row: any) => {
      const key = `${row.tempo}_${row.id_fonte}`
      if (!segMap[key])
        segMap[key] = { vol: 0, dem: 0, count: 0, id_fonte: row.id_fonte, tempo: row.tempo }
      segMap[key].vol += row.volume_distribuido || 0
      segMap[key].dem += row.demanda || 0
      segMap[key].count += 1
    })

    // Por fonte: lista de Ã­ndices mensais
    const porFonte: Record<
      number,
      { indicesMes: { tempo: string; indice: number; vol: number; dem: number }[] }
    > = {}
    Object.values(segMap).forEach(({ id_fonte, tempo, vol, dem, count }) => {
      const avgVol = vol / count
      const avgDem = dem / count
      const indice = avgDem > 0 ? Math.min(1, avgVol / avgDem) : 1
      if (!porFonte[id_fonte]) porFonte[id_fonte] = { indicesMes: [] }
      porFonte[id_fonte].indicesMes.push({ tempo, indice, vol: avgVol, dem: avgDem })
    })

    const fontesPresentes = Object.keys(porFonte).map(Number)

    // chartData: uma entrada por tempo, chave = nome da fonte
    // chaves auxiliares __vol_ e __dem_ para o tooltip (nÃ£o renderizadas como Line)
    const temposUnicos = Array.from(new Set(Object.values(segMap).map((r) => r.tempo))).sort()
    const fontesMapLocal = fonte_agua.reduce(
      (acc: any, f: any) => ({ ...acc, [f.id_fonte]: f.nome_fonte }),
      {},
    )
    const chartDataSeg = temposUnicos.map((tempo) => {
      const point: any = { tempo }
      fontesPresentes.forEach((id_fonte) => {
        const mesData = porFonte[id_fonte].indicesMes.find((m) => m.tempo === tempo)
        if (mesData) {
          const nomeFonte = fontesMapLocal[id_fonte] || String(id_fonte)
          point[nomeFonte] = parseFloat(mesData.indice.toFixed(4))
          point[`__vol_${nomeFonte}`] = mesData.vol
          point[`__dem_${nomeFonte}`] = mesData.dem
        }
      })
      return point
    })

    // PerÃ­odos crÃ­ticos (alerta ou crise)
    const criticos: {
      tempo: string
      id_fonte: number
      indice: number
      status: StatusSeg
      deficit: number
    }[] = []
    Object.entries(porFonte).forEach(([idFonteStr, { indicesMes }]) => {
      const id_fonte = Number(idFonteStr)
      indicesMes.forEach(({ tempo, indice, vol, dem }) => {
        const status = getStatus(indice, limiarAlerta, limiarCrise)
        if (status !== 'seguro') {
          criticos.push({ tempo, id_fonte, indice, status, deficit: Math.max(0, dem - vol) })
        }
      })
    })
    criticos.sort((a, b) => a.tempo.localeCompare(b.tempo) || a.id_fonte - b.id_fonte)

    setSegurancaHidrica({ porFonte, chartData: chartDataSeg, criticos, fontes: fontesPresentes })
    // â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€

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
  const limiarAlerta = activeSimObj?.limiar_alerta ?? 0.8
  const limiarCrise = activeSimObj?.limiar_crise ?? 0.6

  // Monta grÃ¡ficos de indicadores selecionados
  const indicadoresCharts = (() => {
    if (!ran || data.length === 0 || selectedIndicadores.length === 0) return []

    const indsSelected = indicadores.filter((ind) => selectedIndicadores.includes(ind.id_indicador))

    const porUnidade: Record<string, any[]> = {}
    indsSelected.forEach((ind) => {
      const unidade = ind.unidade || 'sem_unidade'
      if (!porUnidade[unidade]) porUnidade[unidade] = []
      porUnidade[unidade].push(ind)
    })

    return Object.entries(porUnidade).map(([unidade, inds]) => {
      const tempos = Array.from(new Set(data.map((d: any) => d.tempo))).sort()
      const fontes = Array.from(new Set(data.map((d: any) => d.id_fonte))) as number[]

      const chartData = tempos.map((tempo) => {
        const point: any = { tempo }
        fontes.forEach((id_fonte) => {
          const rows = data.filter((d: any) => d.tempo === tempo && d.id_fonte === id_fonte)
          inds.forEach((ind) => {
            const campo = ind.campo_extra
            const values = rows
              .map((r: any) => r.valores_extras?.[campo])
              .filter((v: any) => v != null && !isNaN(Number(v)))
              .map(Number)
            if (values.length > 0) {
              const avg = values.reduce((a: number, b: number) => a + b, 0) / values.length
              const key = `${fontesMap[id_fonte] || id_fonte} â€” ${ind.descricao || campo}`
              point[key] = avg
            }
          })
        })
        return point
      })

      const linhas: string[] = []
      fontes.forEach((id_fonte) => {
        inds.forEach((ind) => {
          const key = `${fontesMap[id_fonte] || id_fonte} â€” ${ind.descricao || ind.campo_extra}`
          const temData = chartData.some((pt: any) => pt[key] != null)
          if (temData) linhas.push(key)
        })
      })

      const titulo = inds.map((ind: any) => ind.descricao || ind.campo_extra).join(' - ')

      return { unidade, chartData, linhas, titulo }
    })
  })()

  // Cards de seguranÃ§a derivados do estado
  const segCards = segurancaHidrica
    ? segurancaHidrica.fontes.map((id_fonte) => {
        const { indicesMes } = segurancaHidrica.porFonte[id_fonte]
        const indicesMedio = indicesMes.reduce((s, m) => s + m.indice, 0) / (indicesMes.length || 1)
        const mesesAlerta = indicesMes.filter(
          (m) => getStatus(m.indice, limiarAlerta, limiarCrise) === 'alerta',
        ).length
        const mesesCrise = indicesMes.filter(
          (m) => getStatus(m.indice, limiarAlerta, limiarCrise) === 'crise',
        ).length
        const statusGeral = getStatus(indicesMedio, limiarAlerta, limiarCrise)
        return { id_fonte, indicesMedio, mesesAlerta, mesesCrise, statusGeral }
      })
    : []

  const segChartLinhas = segurancaHidrica
    ? segurancaHidrica.fontes.map((id_fonte) => fontesMap[id_fonte] || String(id_fonte))
    : []

  return (
    <div className="p-6 space-y-6 max-w-[1400px] mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">SimulaÃ§Ã£o de CenÃ¡rios</h1>
        <p className="text-muted-foreground">
          Filtre os parÃ¢metros desejados para visualizar o comportamento do sistema de recursos
          hÃ­dricos.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 animate-fade-in">
        <div className="space-y-6 md:col-span-2">
          {/* SimulaÃ§Ã£o */}
          <div className="bg-white p-5 shadow-sm rounded-xl border border-slate-200 w-full">
            <h3 className="font-semibold text-primary border-b pb-3 mb-4 text-sm uppercase tracking-wider">
              CenÃ¡rios para SimulaÃ§Ã£o
            </h3>
            <div className="space-y-1">
              <label className="text-xs font-semibold text-muted-foreground">SimulaÃ§Ã£o</label>
              <NativeSelect
                className="w-full"
                options={simulacao_ssd.map((o: any) => ({
                  value: o.id_s,
                  label: o.descricao,
                }))}
                value={filters.id_s || ''}
                onChange={(v: any) => setFilters({ ...filters, id_s: v })}
                placeholder="Escolha uma SimulaÃ§Ã£o"
              />
            </div>
          </div>

          {/* Demanda e Perdas (AutomÃ¡tico) */}
          {activeSimObj && (activeSimObj.demanda_auto || activeSimObj.perdas_auto) && (
            <div className="bg-white p-5 shadow-sm rounded-xl border border-slate-200 w-full">
              <h3 className="font-semibold text-primary border-b pb-3 mb-4 text-sm uppercase tracking-wider">
                Demanda e Perdas (AutomÃ¡tico)
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
                      placeholder="CenÃ¡rio Demanda"
                    />
                    <NativeSelect
                      className="w-full"
                      options={cenario_consumo.map((o: any) => ({
                        value: o.id_cc,
                        label: o.nome_cenario_consumo,
                      }))}
                      value={filters.id_cc_auto || ''}
                      onChange={(v: any) => setFilters({ ...filters, id_cc_auto: v })}
                      placeholder="CenÃ¡rio Consumo"
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
                      placeholder="CenÃ¡rio Perdas"
                    />
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Indicadores */}
          {filters.id_s && (
            <div className="bg-white p-5 shadow-sm rounded-xl border border-slate-200 w-full">
              <h3 className="font-semibold text-primary border-b pb-3 mb-4 text-sm uppercase tracking-wider">
                Indicadores
              </h3>
              {indicadores.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nenhum indicador configurado para esta simulaÃ§Ã£o.
                </p>
              ) : (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground mb-3">
                    Selecione os indicadores para gerar grÃ¡ficos de sÃ©rie histÃ³rica por fonte de
                    Ã¡gua.
                  </p>
                  {indicadores.map((ind) => (
                    <label
                      key={ind.id_indicador}
                      className="flex items-center gap-3 border p-2.5 rounded-md hover:bg-slate-50 cursor-pointer"
                    >
                      <Checkbox
                        checked={selectedIndicadores.includes(ind.id_indicador)}
                        onCheckedChange={() => toggleIndicador(ind.id_indicador)}
                      />
                      <span className="text-sm font-medium flex-1">
                        {ind.descricao || ind.campo_extra}
                      </span>
                      {ind.unidade && (
                        <span className="text-xs text-muted-foreground bg-slate-100 px-2 py-0.5 rounded">
                          {ind.unidade}
                        </span>
                      )}
                    </label>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* PerÃ­odo */}
          <div className="bg-white p-5 shadow-sm rounded-xl border border-slate-200 flex flex-col w-full">
            <h3 className="font-semibold text-primary border-b pb-3 mb-4 text-sm uppercase tracking-wider">
              PerÃ­odo
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 flex-1">
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Ano InÃ­cio</label>
                <NativeSelect
                  className="w-full"
                  options={[
                    2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038,
                    2039, 2040, 2041, 2042, 2043, 2044, 2045, 2046, 2047, 2048, 2049, 2050,
                  ].map((y) => ({ value: y, label: y.toString() }))}
                  value={filters.ano_inicio || ''}
                  onChange={(v: any) => setFilters({ ...filters, ano_inicio: v })}
                  placeholder="InÃ­cio"
                />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-semibold text-muted-foreground">Ano Fim</label>
                <NativeSelect
                  className="w-full"
                  options={[
                    2026, 2027, 2028, 2029, 2030, 2031, 2032, 2033, 2034, 2035, 2036, 2037, 2038,
                    2039, 2040, 2041, 2042, 2043, 2044, 2045, 2046, 2047, 2048, 2049, 2050,
                  ].map((y) => ({ value: y, label: y.toString() }))}
                  value={filters.ano_fim || ''}
                  onChange={(v: any) => setFilters({ ...filters, ano_fim: v })}
                  placeholder="Fim"
                />
              </div>
            </div>
            <div className="space-y-2 mt-4">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-muted-foreground">
                  Meses (MÃºltipla SeleÃ§Ã£o)
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
                {loading ? 'Processando...' : 'Executar SimulaÃ§Ã£o'}
              </Button>
              {!filters.id_s && (
                <p className="text-xs text-red-500 text-center font-medium">
                  Selecione uma simulaÃ§Ã£o para executar.
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
            Nenhum dado de simulaÃ§Ã£o encontrado para estes filtros.
          </p>
        </div>
      )}

      {/* â”€â”€ BLOCO 1: Cards de seguranÃ§a hÃ­drica por fonte â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {segurancaHidrica && segCards.length > 0 && (
        <div>
          <h2 className="text-lg font-semibold text-primary mb-3">Ãndice de SeguranÃ§a HÃ­drica</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {segCards.map(({ id_fonte, indicesMedio, mesesAlerta, mesesCrise, statusGeral }) => {
              const c = STATUS_COLORS[statusGeral]
              return (
                <div
                  key={id_fonte}
                  className={`rounded-xl border p-4 space-y-3 ${c.bg} ${c.border}`}
                >
                  <div className="flex items-start justify-between gap-2">
                    <span className="text-sm font-semibold text-slate-700 leading-tight">
                      {fontesMap[id_fonte] || `Fonte ${id_fonte}`}
                    </span>
                    <span
                      className={`shrink-0 text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[statusGeral]}`}
                    >
                      {STATUS_LABEL[statusGeral]}
                    </span>
                  </div>

                  <div className={`text-3xl font-bold ${c.text}`}>
                    {indicesMedio.toLocaleString('pt-BR', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 2,
                    })}
                  </div>
                  <p className="text-[11px] text-slate-500 -mt-2">Ã­ndice mÃ©dio do perÃ­odo</p>

                  <div className="flex gap-4 text-xs pt-1 border-t border-slate-200">
                    <div>
                      <span className="font-bold text-amber-600">{mesesAlerta}</span>
                      <span className="text-slate-500 ml-1">
                        {mesesAlerta === 1 ? 'mÃªs em alerta' : 'meses em alerta'}
                      </span>
                    </div>
                    <div>
                      <span className="font-bold text-red-600">{mesesCrise}</span>
                      <span className="text-slate-500 ml-1">
                        {mesesCrise === 1 ? 'mÃªs em crise' : 'meses em crise'}
                      </span>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* â”€â”€ BLOCO 2: GrÃ¡fico do Ã­ndice de seguranÃ§a hÃ­drica â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {segurancaHidrica && segurancaHidrica.chartData.length > 0 && (
        <div className="bg-white p-5 shadow-sm rounded-xl border border-slate-200">
          <h3 className="font-semibold text-primary border-b pb-3 mb-4 text-sm uppercase tracking-wider">
            SÃ©rie Temporal â€” Ãndice de SeguranÃ§a HÃ­drica
          </h3>
          <div className="flex flex-wrap gap-6 text-xs text-slate-500 mb-4">
            <div className="flex items-center gap-1.5">
              <span className="w-7 border-t-2 border-dashed border-amber-400 inline-block" />
              <span>
                Limiar de Alerta (
                {limiarAlerta.toLocaleString('pt-BR', { minimumFractionDigits: 1 })})
              </span>
            </div>
            <div className="flex items-center gap-1.5">
              <span className="w-7 border-t-2 border-dashed border-red-400 inline-block" />
              <span>
                Limiar de Crise ({limiarCrise.toLocaleString('pt-BR', { minimumFractionDigits: 1 })}
                )
              </span>
            </div>
          </div>
          <ResponsiveContainer width="100%" height={340}>
            <LineChart
              data={segurancaHidrica.chartData}
              margin={{ top: 4, right: 24, left: 8, bottom: 4 }}
            >
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />

              {/* Zonas de risco coloridas */}
              <ReferenceArea
                y1={0}
                y2={limiarCrise}
                fill="#ef4444"
                fillOpacity={0.07}
                ifOverflow="hidden"
              />
              <ReferenceArea
                y1={limiarCrise}
                y2={limiarAlerta}
                fill="#f59e0b"
                fillOpacity={0.07}
                ifOverflow="hidden"
              />

              <XAxis dataKey="tempo" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis
                domain={[0, 1]}
                tick={{ fontSize: 11 }}
                tickFormatter={(v) => v.toFixed(1)}
                label={{
                  value: 'Ãndice (0â€“1)',
                  angle: -90,
                  position: 'insideLeft',
                  offset: 10,
                  style: { fontSize: 11 },
                }}
              />

              <Tooltip
                content={<TooltipSeguranca limiarAlerta={limiarAlerta} limiarCrise={limiarCrise} />}
              />
              <Legend wrapperStyle={{ fontSize: 12 }} />

              {/* Linhas de limiar */}
              <ReferenceLine
                y={limiarAlerta}
                stroke="#f59e0b"
                strokeDasharray="6 3"
                strokeWidth={1.5}
              />
              <ReferenceLine
                y={limiarCrise}
                stroke="#ef4444"
                strokeDasharray="6 3"
                strokeWidth={1.5}
              />

              {/* Uma linha por fonte */}
              {segChartLinhas.map((nomeFonte, idx) => (
                <Line
                  key={nomeFonte}
                  type="monotone"
                  dataKey={nomeFonte}
                  stroke={LINE_COLORS[idx % LINE_COLORS.length]}
                  dot={false}
                  strokeWidth={2}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      )}

      {/* â”€â”€ BLOCO 3: Tabela de perÃ­odos crÃ­ticos â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€â”€ */}
      {segurancaHidrica && segurancaHidrica.criticos.length > 0 && (
        <div className="bg-white p-5 shadow-sm rounded-xl border border-slate-200">
          <h3 className="font-semibold text-primary border-b pb-3 mb-4 text-sm uppercase tracking-wider">
            PerÃ­odos CrÃ­ticos
          </h3>
          <div className="overflow-x-auto">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-slate-50 text-xs text-slate-500 uppercase tracking-wider">
                  <th className="px-3 py-2 text-left font-semibold">PerÃ­odo</th>
                  <th className="px-3 py-2 text-left font-semibold">Fonte</th>
                  <th className="px-3 py-2 text-right font-semibold">Ãndice</th>
                  <th className="px-3 py-2 text-center font-semibold">Status</th>
                  <th className="px-3 py-2 text-right font-semibold">DÃ©ficit (mÂ³)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {segurancaHidrica.criticos.map((row, i) => (
                  <tr key={i} className="hover:bg-slate-50">
                    <td className="px-3 py-2 font-mono text-slate-600">{row.tempo}</td>
                    <td className="px-3 py-2 text-slate-700">
                      {fontesMap[row.id_fonte] || `Fonte ${row.id_fonte}`}
                    </td>
                    <td className="px-3 py-2 text-right font-semibold text-slate-700">
                      {row.indice.toLocaleString('pt-BR', {
                        minimumFractionDigits: 2,
                        maximumFractionDigits: 2,
                      })}
                    </td>
                    <td className="px-3 py-2 text-center">
                      <span
                        className={`inline-block text-[11px] font-bold px-2 py-0.5 rounded-full ${STATUS_BADGE[row.status]}`}
                      >
                        {STATUS_LABEL[row.status]}
                      </span>
                    </td>
                    <td className="px-3 py-2 text-right text-slate-600">
                      {row.deficit.toLocaleString('pt-BR', { maximumFractionDigits: 0 })}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* CenariosDashboard â€” sem alteraÃ§Ã£o */}
      {data.length > 0 && <CenariosDashboard data={data} fontesMap={fontesMap} />}

      {/* GrÃ¡ficos de Indicadores â€” sem alteraÃ§Ã£o */}
      {indicadoresCharts.length > 0 && (
        <div className="space-y-6">
          {indicadoresCharts.map(({ unidade, chartData, linhas, titulo }) => (
            <div
              key={unidade}
              className="bg-white p-5 shadow-sm rounded-xl border border-slate-200"
            >
              <h3 className="font-semibold text-primary border-b pb-3 mb-4 text-sm uppercase tracking-wider">
                Indicadores: {titulo}
              </h3>
              <ResponsiveContainer width="100%" height={320}>
                <LineChart data={chartData} margin={{ top: 4, right: 24, left: 8, bottom: 4 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                  <XAxis dataKey="tempo" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
                  <YAxis
                    tick={{ fontSize: 11 }}
                    label={{
                      value: unidade,
                      angle: -90,
                      position: 'insideLeft',
                      offset: 10,
                      style: { fontSize: 11 },
                    }}
                  />
                  <Tooltip
                    contentStyle={{ fontSize: 12 }}
                    formatter={(value: any) =>
                      typeof value === 'number'
                        ? value.toLocaleString('pt-BR', { maximumFractionDigits: 2 })
                        : value
                    }
                  />
                  <Legend wrapperStyle={{ fontSize: 12 }} />
                  {linhas.map((linha, idx) => (
                    <Line
                      key={linha}
                      type="monotone"
                      dataKey={linha}
                      stroke={LINE_COLORS[idx % LINE_COLORS.length]}
                      dot={false}
                      strokeWidth={2}
                    />
                  ))}
                </LineChart>
              </ResponsiveContainer>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
