import {
  LineChart,
  Line,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  ReferenceLine,
  ResponsiveContainer,
  CartesianGrid,
} from 'recharts'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart'
import { Button } from '@/components/ui/button'
import { Download } from 'lucide-react'

export function SimulationCharts({ results, timeData }: { results: any[]; timeData: any[] }) {
  const barData = timeData.map((t) => {
    const sum = (t.Batalha_Cap || 0) + (t.Bauru_Cap || 0) + (t.Guarani_Cap || 0) || 1
    return {
      Tempo: t.Tempo,
      Batalha: ((t.Batalha_Cap || 0) / sum) * 100,
      Bauru: ((t.Bauru_Cap || 0) / sum) * 100,
      Guarani: ((t.Guarani_Cap || 0) / sum) * 100,
    }
  })

  const avgDist = results.reduce((s, r) => s + r.Vazao_Distribuida, 0) / (timeData.length || 1)
  const avgDem = timeData.reduce((s, t) => s + t.Demanda, 0) / (timeData.length || 1)
  const deficits = timeData.filter((t) => t.Saldo < 0)

  const handleExport = () => {
    const csv =
      'Tempo,TotalCaptada,TotalDistribuida,Demanda,Saldo\n' +
      timeData
        .map(
          (t) =>
            `${t.Tempo},${t.TotalCap.toFixed(2)},${t.TotalDist.toFixed(2)},${t.Demanda.toFixed(2)},${t.Saldo.toFixed(2)}`,
        )
        .join('\n')
    const a = document.createElement('a')
    a.href = URL.createObjectURL(new Blob([csv], { type: 'text/csv' }))
    a.download = 'resultados_simulacao.csv'
    a.click()
  }

  const chartColors = {
    Batalha: 'hsl(var(--chart-1))',
    Bauru: 'hsl(var(--chart-2))',
    Guarani: 'hsl(var(--chart-3))',
  }

  return (
    <div className="space-y-6 animate-fade-in-up mt-8">
      <div className="flex justify-between items-center pb-2 border-b">
        <h2 className="text-2xl font-bold text-primary">Resultados e Projeções</h2>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="w-4 h-4 mr-2" /> Exportar CSV
        </Button>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase font-semibold">
              Média Distribuída
            </p>
            <p className="text-2xl font-bold text-primary mt-1">
              {avgDist.toFixed(0)}{' '}
              <span className="text-sm font-normal text-muted-foreground">m³/h</span>
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase font-semibold">Média Demanda</p>
            <p className="text-2xl font-bold text-primary mt-1">
              {avgDem.toFixed(0)}{' '}
              <span className="text-sm font-normal text-muted-foreground">m³/h</span>
            </p>
          </CardContent>
        </Card>
        <Card className="border-destructive/30">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase font-semibold">
              Meses c/ Déficit
            </p>
            <p className="text-2xl font-bold text-destructive mt-1">{deficits.length}</p>
          </CardContent>
        </Card>
        <Card className="border-green-600/30">
          <CardContent className="p-5">
            <p className="text-xs text-muted-foreground uppercase font-semibold">
              Meses c/ Superávit
            </p>
            <p className="text-2xl font-bold text-green-600 mt-1">
              {timeData.length - deficits.length}
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid lg:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm">Vazão Captada por Fonte</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ChartContainer config={{}} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis
                    dataKey="Tempo"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="Batalha_Cap"
                    name="Batalha"
                    stroke={chartColors.Batalha}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Bauru_Cap"
                    name="Bauru"
                    stroke={chartColors.Bauru}
                    strokeWidth={2}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Guarani_Cap"
                    name="Guarani"
                    stroke={chartColors.Guarani}
                    strokeWidth={2}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm">% Vazão por Fonte</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ChartContainer config={{}} className="w-full h-full">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={barData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis
                    dataKey="Tempo"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="Batalha" stackId="a" fill={chartColors.Batalha} />
                  <Bar dataKey="Bauru" stackId="a" fill={chartColors.Bauru} />
                  <Bar dataKey="Guarani" stackId="a" fill={chartColors.Guarani} />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-sm">Total Captada vs Total Distribuída</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ChartContainer
              config={{
                cap: { color: 'hsl(var(--primary))' },
                dist: { color: 'hsl(var(--secondary))' },
              }}
              className="w-full h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis
                    dataKey="Tempo"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Line
                    type="monotone"
                    dataKey="TotalCap"
                    name="Captada Total"
                    stroke="var(--color-cap)"
                    strokeWidth={3}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="TotalDist"
                    name="Distribuída Total"
                    stroke="var(--color-dist)"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-l-4 border-l-secondary">
          <CardHeader>
            <CardTitle className="text-sm">Saldo Hídrico (Distribuída vs Demanda)</CardTitle>
          </CardHeader>
          <CardContent className="h-[280px]">
            <ChartContainer
              config={{ saldo: { color: 'hsl(var(--chart-5))' } }}
              className="w-full h-full"
            >
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={timeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} opacity={0.3} />
                  <XAxis
                    dataKey="Tempo"
                    tickLine={false}
                    axisLine={false}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 12 }} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <ReferenceLine
                    y={0}
                    stroke="hsl(var(--destructive))"
                    strokeDasharray="4 4"
                    strokeWidth={2}
                  />
                  <Line
                    type="monotone"
                    dataKey="Saldo"
                    name="Saldo (Surplus/Deficit)"
                    stroke="var(--color-saldo)"
                    strokeWidth={3}
                    dot={{ r: 3 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>

      {deficits.length > 0 && (
        <Card className="border-destructive/40 bg-destructive/5 mt-6 shadow-none">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm text-destructive font-bold">
              Atenção: Meses com Déficit Hídrico
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
              {deficits.slice(0, 12).map((t) => (
                <div
                  key={t.Tempo}
                  className="bg-white/60 p-2 rounded border border-destructive/20 flex justify-between"
                >
                  <span className="font-medium">{t.Tempo}</span>
                  <span className="text-destructive font-bold">{t.Saldo.toFixed(1)}</span>
                </div>
              ))}
              {deficits.length > 12 && (
                <div className="p-2 text-muted-foreground">
                  ... e mais {deficits.length - 12} meses
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
