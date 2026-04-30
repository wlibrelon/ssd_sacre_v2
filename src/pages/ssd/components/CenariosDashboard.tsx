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
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'

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
        if (t[`${fName}_cap`]) t[`${fName}_pct`] = (t[`${fName}_cap`] / t.captacao_total) * 100
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

      {deficitMonths.length > 0 && (
        <Card className="bg-red-50/50 border-red-200">
          <CardHeader>
            <CardTitle className="text-sm text-red-700">Histórico de Déficit</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-red-600 font-medium break-words">
              {deficitMonths.join(', ')}
            </p>
          </CardContent>
        </Card>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Volume Captado por Fonte</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
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
                    stroke={`hsl(var(--primary))`}
                    strokeWidth={2}
                    opacity={1 - i * 0.2}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Participação das Fontes(%)</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
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
                    fill={`hsl(var(--primary))`}
                    opacity={1 - i * 0.2}
                  />
                ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Captação vs Distribuição</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tempo" />
                <YAxis />
                <Tooltip formatter={(value: number) => formatVol(value)} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="captacao_total"
                  name="Total Captado"
                  stroke="#2563eb"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="distribuicao_total"
                  name="Total Distribuído"
                  stroke="#16a34a"
                  strokeWidth={2}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Distribuição, Demanda e Déficit</CardTitle>
          </CardHeader>
          <CardContent className="h-[350px]">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" />
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
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="demanda"
                  name="Demanda"
                  stroke="#9333ea"
                  strokeWidth={2}
                />
                <Line
                  type="monotone"
                  dataKey="deficit"
                  name="Déficit/Excedente"
                  stroke="#f59e0b"
                  strokeWidth={3}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
