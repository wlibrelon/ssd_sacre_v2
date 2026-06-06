import { useState } from 'react'
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Maximize2, Download } from 'lucide-react'

const CHART_COLORS = [
  '#2563eb',
  '#dc2626',
  '#16a34a',
  '#d97706',
  '#9333ea',
  '#0d9488',
  '#be123c',
  '#4f46e5',
]

const MONTH_LABELS = [
  'Jan',
  'Fev',
  'Mar',
  'Abr',
  'Mai',
  'Jun',
  'Jul',
  'Ago',
  'Set',
  'Out',
  'Nov',
  'Dez',
]

const ChartWrapper = ({ title, data, children }: any) => {
  const [isOpen, setIsOpen] = useState(false)

  const handleExport = () => {
    if (!data || data.length === 0) return
    const keys = Object.keys(data[0])
    const csvRows = [
      keys.join(','),
      ...data.map((row: any) => keys.map((k) => `"${row[k] || 0}"`).join(',')),
    ]
    const csvContent = csvRows.join('\n')
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.setAttribute('href', url)
    link.setAttribute('download', `${title.replace(/\s+/g, '_').toLowerCase()}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    URL.revokeObjectURL(url)
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between pb-2">
        <CardTitle className="text-lg">{title}</CardTitle>
        <div className="flex gap-1">
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8"
            onClick={handleExport}
            title="Exportar CSV"
          >
            <Download className="h-4 w-4" />
          </Button>
          <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
              <Button variant="ghost" size="icon" className="h-8 w-8" title="Expandir (Zoom)">
                <Maximize2 className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-[95vw] h-[85vh] flex flex-col">
              <DialogHeader>
                <DialogTitle>{title}</DialogTitle>
              </DialogHeader>
              <div className="flex-1 w-full min-h-0 relative mt-4">{children}</div>
            </DialogContent>
          </Dialog>
        </div>
      </CardHeader>
      <CardContent className="h-[350px]">
        <div className="w-full h-full relative">{children}</div>
      </CardContent>
    </Card>
  )
}

// ── Mapa de calor de déficit ──────────────────────────────────────────────────
// deficitMonths: array de strings no formato "AAAA/MM"
// deficitValues: Record<"AAAA/MM", number> com o valor do saldo (negativo = déficit)
const DeficitHeatmap = ({
  deficitMonths,
  allMonths,
  deficitValues,
}: {
  deficitMonths: string[]
  allMonths: string[]
  deficitValues: Record<string, number>
}) => {
  if (allMonths.length === 0) return null

  // Extrai anos e meses presentes nos dados
  const anosSet = new Set<string>()
  const mesesSet = new Set<number>()
  allMonths.forEach((t) => {
    const [ano, mes] = t.split('/')
    anosSet.add(ano)
    mesesSet.add(parseInt(mes))
  })
  const anos = Array.from(anosSet).sort()
  const meses = Array.from(mesesSet).sort((a, b) => a - b)

  const deficitSet = new Set(deficitMonths)

  // Intensidade: normaliza o déficit mais negativo → célula mais escura
  const deficitNums = deficitMonths.map((t) => deficitValues[t] ?? 0)
  const minVal = Math.min(...deficitNums, 0)

  const getIntensity = (val: number): number => {
    if (minVal === 0) return 0.6
    return Math.min(0.9, 0.3 + (Math.abs(val) / Math.abs(minVal)) * 0.6)
  }

  return (
    <Card className="border-red-200 bg-red-50/30">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-sm text-red-700">Mapa de Déficit Hídrico</CardTitle>
          <div className="flex items-center gap-3 text-[11px] text-slate-500">
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-sm inline-block bg-slate-100 border border-slate-200" />
              Sem dados
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-sm inline-block bg-emerald-100 border border-emerald-200" />
              Superávit
            </div>
            <div className="flex items-center gap-1">
              <span className="w-4 h-4 rounded-sm inline-block bg-red-400 border border-red-500" />
              Déficit
            </div>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-xs">
            <thead>
              <tr>
                {/* Coluna de ano */}
                <th className="text-left px-2 py-1.5 font-semibold text-slate-500 w-16 sticky left-0 bg-red-50/30">
                  Ano
                </th>
                {meses.map((m) => (
                  <th
                    key={m}
                    className="text-center px-1 py-1.5 font-semibold text-slate-500 min-w-[36px]"
                  >
                    {MONTH_LABELS[m - 1]}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {anos.map((ano) => (
                <tr key={ano} className="border-t border-red-100">
                  <td className="px-2 py-1 font-bold text-slate-600 sticky left-0 bg-red-50/30">
                    {ano}
                  </td>
                  {meses.map((m) => {
                    const mesStr = String(m).padStart(2, '0')
                    const key = `${ano}/${mesStr}`
                    const hasData = allMonths.includes(key)
                    const isDeficit = deficitSet.has(key)
                    const val = deficitValues[key]

                    if (!hasData) {
                      return (
                        <td key={m} className="px-1 py-1 text-center">
                          <div className="w-8 h-7 mx-auto rounded-sm bg-slate-100 border border-slate-200" />
                        </td>
                      )
                    }

                    if (isDeficit) {
                      const intensity = getIntensity(val)
                      const alpha = Math.round(intensity * 255)
                        .toString(16)
                        .padStart(2, '0')
                      return (
                        <td
                          key={m}
                          className="px-1 py-1 text-center"
                          title={`${key}: ${val?.toLocaleString('pt-BR', { maximumFractionDigits: 0 })} m³`}
                        >
                          <div
                            className="w-8 h-7 mx-auto rounded-sm border border-red-400 flex items-center justify-center cursor-default"
                            style={{ backgroundColor: `#ef4444${alpha}` }}
                          >
                            <span className="text-[9px] font-bold text-white drop-shadow-sm leading-none">
                              ✕
                            </span>
                          </div>
                        </td>
                      )
                    }

                    return (
                      <td key={m} className="px-1 py-1 text-center" title={`${key}: superávit`}>
                        <div className="w-8 h-7 mx-auto rounded-sm bg-emerald-100 border border-emerald-200 flex items-center justify-center">
                          <span className="text-[9px] font-bold text-emerald-600 leading-none">
                            ✓
                          </span>
                        </div>
                      </td>
                    )
                  })}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Legenda de intensidade */}
        {deficitMonths.length > 0 && minVal < 0 && (
          <div className="mt-3 flex items-center gap-2 text-[11px] text-slate-500">
            <span>Intensidade do déficit:</span>
            <div className="flex items-center gap-0.5">
              {[0.3, 0.5, 0.7, 0.9].map((op) => (
                <div
                  key={op}
                  className="w-5 h-3 rounded-sm"
                  style={{ backgroundColor: `rgba(239,68,68,${op})` }}
                />
              ))}
            </div>
            <span>menor → maior</span>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export function CenariosDashboard({ data, fontesMap }: any) {
  const timeMap: any = {}
  let totalCapex = 0
  let totalOpex = 0
  let monthsWithDeficit = 0
  let monthsWithExcedent = 0

  data.forEach((row: any) => {
    const vd = row.volume_captado * (1 - (row.perdas || 0) / 100)
    if (!timeMap[row.tempo]) {
      timeMap[row.tempo] = {
        tempo: row.tempo,
        distribuicao_total: 0,
        demanda: row.demanda || 0,
        captacao_total: 0,
      }
    }
    timeMap[row.tempo].distribuicao_total += vd
    timeMap[row.tempo].captacao_total += row.volume_captado || 0
    totalCapex += row.capex || 0
    totalOpex += row.opex || 0

    const fName = fontesMap[row.id_fonte] || `Fonte_${row.id_fonte}`
    timeMap[row.tempo][`${fName}_cap`] =
      (timeMap[row.tempo][`${fName}_cap`] || 0) + row.volume_captado
  })

  const chartData = Object.values(timeMap)
    .map((t: any) => {
      const deficit = t.distribuicao_total - t.demanda
      if (deficit < 0) monthsWithDeficit++
      else monthsWithExcedent++

      Object.keys(fontesMap).forEach((k) => {
        const fName = fontesMap[k]
        if (t[`${fName}_cap`]) {
          t[`${fName}_pct`] = Math.min(
            100,
            Math.floor((t[`${fName}_cap`] / t.captacao_total) * 100),
          )
        }
      })
      return { ...t, deficit }
    })
    .sort((a: any, b: any) => a.tempo.localeCompare(b.tempo))

  const avgDist =
    chartData.reduce((acc: any, curr: any) => acc + curr.distribuicao_total, 0) /
    (chartData.length || 1)
  const avgDem =
    chartData.reduce((acc: any, curr: any) => acc + curr.demanda, 0) / (chartData.length || 1)
  const fontesKeys = Object.values(fontesMap) as string[]

  // Mapa de calor: todos os tempos presentes e quais têm déficit
  const allMonths = chartData.map((x: any) => x.tempo)
  const deficitValues: Record<string, number> = {}
  chartData.forEach((x: any) => {
    deficitValues[x.tempo] = x.deficit
  })
  const deficitMonths = chartData.filter((x: any) => x.deficit < 0).map((x: any) => x.tempo)

  const formatBRL = (v: number) =>
    new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL',
      maximumFractionDigits: 0,
    }).format(v)
  const formatVol = (v: number) =>
    new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(v) + ' m³'

  return (
    <div className="space-y-6 animate-fade-in-up">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Média Distribuída</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{formatVol(avgDist)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Média Demanda</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-blue-600">{formatVol(avgDem)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total CAPEX</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-orange-600">{formatBRL(totalCapex)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total OPEX</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-600">{formatBRL(totalOpex)}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Total Meses</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold">{chartData.length}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Meses c/ Déficit</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-red-500">{monthsWithDeficit}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-muted-foreground">Meses c/ Excedente</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-xl font-bold text-green-600">{monthsWithExcedent}</div>
          </CardContent>
        </Card>
      </div>

      {/* Mapa de calor substituindo o card de texto */}
      <DeficitHeatmap
        deficitMonths={deficitMonths}
        allMonths={allMonths}
        deficitValues={deficitValues}
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <ChartWrapper title="Volume Captado por Fonte" data={chartData}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
              <XAxis dataKey="tempo" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatVol(value)} />
              <Legend />
              {fontesKeys.map((fk, i) => (
                <Line
                  key={fk}
                  type="monotone"
                  dataKey={`${fk}_cap`}
                  name={fk}
                  stroke={CHART_COLORS[i % CHART_COLORS.length]}
                  strokeWidth={2.5}
                  dot={false}
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="Participação das Fontes (%)" data={chartData}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
              <XAxis dataKey="tempo" />
              <YAxis domain={[0, 100]} />
              <Tooltip formatter={(value: number) => `${value.toFixed(1)}%`} />
              <Legend />
              {fontesKeys.map((fk, i) => (
                <Bar
                  key={fk}
                  dataKey={`${fk}_pct`}
                  name={fk}
                  stackId="a"
                  fill={CHART_COLORS[i % CHART_COLORS.length]}
                />
              ))}
            </BarChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="Captação vs Distribuição" data={chartData}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
              <XAxis dataKey="tempo" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatVol(value)} />
              <Legend />
              <Line
                type="monotone"
                dataKey="captacao_total"
                name="Total Captado"
                stroke="#0f172a"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="distribuicao_total"
                name="Total Distribuído"
                stroke="#16a34a"
                strokeWidth={2.5}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>

        <ChartWrapper title="Distribuição, Demanda e Saldo" data={chartData}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
              <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
              <XAxis dataKey="tempo" />
              <YAxis />
              <Tooltip formatter={(value: number) => formatVol(value)} />
              <Legend />
              <ReferenceLine y={0} stroke="#ef4444" strokeWidth={2} strokeDasharray="3 3" />
              <Line
                type="monotone"
                dataKey="distribuicao_total"
                name="Distribuído"
                stroke="#16a34a"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="demanda"
                name="Demanda"
                stroke="#4f46e5"
                strokeWidth={2.5}
                dot={false}
              />
              <Line
                type="monotone"
                dataKey="deficit"
                name="Saldo"
                stroke="#f59e0b"
                strokeWidth={3}
                dot={false}
              />
            </LineChart>
          </ResponsiveContainer>
        </ChartWrapper>
      </div>
    </div>
  )
}
