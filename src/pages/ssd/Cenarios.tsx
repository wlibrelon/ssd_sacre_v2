import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Slider } from '@/components/ui/slider'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { WaterSpinner } from '@/components/WaterSpinner'
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  ChartLegend,
  ChartLegendContent,
} from '@/components/ui/chart'
import { LineChart, Line, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from 'recharts'
import { Play, Settings2 } from 'lucide-react'

const generateMockData = (prec: number, pop: number, loss: number) => {
  const baseDemand = 100 + pop / 10
  const baseSupply = 150 * (prec / 100)
  const lossFactor = loss / 100

  return Array.from({ length: 25 }).map((_, i) => ({
    ano: 2025 + i,
    demanda: Math.round(baseDemand + i * 2),
    oferta: Math.round(baseSupply - i * 0.5 - baseSupply * lossFactor),
  }))
}

export default function Cenarios() {
  const [isSimulating, setIsSimulating] = useState(false)
  const [hasSimulated, setHasSimulated] = useState(false)
  const [params, setParams] = useState({ prec: 100, pop: 10, loss: 30 })
  const [chartData, setChartData] = useState<any[]>([])

  const handleRun = () => {
    setIsSimulating(true)
    // Conceptually calling a Python backend here
    setTimeout(() => {
      setChartData(generateMockData(params.prec, params.pop, params.loss))
      setIsSimulating(false)
      setHasSimulated(true)
    }, 2500)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-primary">Simulador de Cenários</h1>
        <p className="text-muted-foreground mt-1">
          Ajuste as variáveis e execute os modelos para prever a oferta e demanda hídrica.
        </p>
      </div>

      <div className="grid lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-1 shadow-sm">
          <CardHeader className="bg-slate-50/50 border-b pb-4">
            <CardTitle className="flex items-center gap-2 text-lg">
              <Settings2 className="h-5 w-5" /> Variáveis de Entrada
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-8 pt-6">
            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Precipitação Anual (%)</Label>
                <span className="text-sm font-bold text-primary">{params.prec}%</span>
              </div>
              <Slider
                value={[params.prec]}
                onValueChange={([v]) => setParams((p) => ({ ...p, prec: v }))}
                min={50}
                max={150}
                step={5}
              />
              <p className="text-xs text-muted-foreground">
                Variação em relação à média histórica.
              </p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Crescimento Populacional (%)</Label>
                <span className="text-sm font-bold text-primary">+{params.pop}%</span>
              </div>
              <Slider
                value={[params.pop]}
                onValueChange={([v]) => setParams((p) => ({ ...p, pop: v }))}
                min={0}
                max={50}
                step={1}
              />
              <p className="text-xs text-muted-foreground">Projeção de crescimento até 2050.</p>
            </div>

            <div className="space-y-3">
              <div className="flex justify-between">
                <Label>Índice de Perdas na Rede (%)</Label>
                <span className="text-sm font-bold text-primary">{params.loss}%</span>
              </div>
              <Slider
                value={[params.loss]}
                onValueChange={([v]) => setParams((p) => ({ ...p, loss: v }))}
                min={10}
                max={60}
                step={1}
              />
              <p className="text-xs text-muted-foreground">Eficiência da distribuição física.</p>
            </div>

            <Button
              className="w-full gap-2 bg-primary mt-4"
              size="lg"
              onClick={handleRun}
              disabled={isSimulating}
            >
              <Play className="h-4 w-4" />{' '}
              {isSimulating ? 'Executando Modelo...' : 'Simular Cenário'}
            </Button>
            <p className="text-[10px] text-center text-muted-foreground">
              *Nota: Esta ação dispara remotamente scripts Python de modelagem (WEAP).
            </p>
          </CardContent>
        </Card>

        <Card className="lg:col-span-2 shadow-sm flex flex-col">
          <CardHeader>
            <CardTitle>Projeção Hídrica (2025 - 2050)</CardTitle>
            <CardDescription>Comparativo entre Oferta Disponível e Demanda Urbana</CardDescription>
          </CardHeader>
          <CardContent className="flex-1 min-h-[400px] flex items-center justify-center relative">
            {isSimulating ? (
              <WaterSpinner text="Processando dados no servidor..." />
            ) : hasSimulated ? (
              <ChartContainer
                config={{
                  demanda: { label: 'Demanda (m³/s)', color: 'hsl(var(--destructive))' },
                  oferta: { label: 'Oferta (m³/s)', color: 'hsl(var(--secondary))' },
                }}
                className="w-full h-full min-h-[350px]"
              >
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={chartData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="ano" tickLine={false} axisLine={false} />
                    <YAxis tickLine={false} axisLine={false} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="demanda"
                      stroke="var(--color-demanda)"
                      strokeWidth={3}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="oferta"
                      stroke="var(--color-oferta)"
                      strokeWidth={3}
                      dot={false}
                    />
                    <ChartLegend content={<ChartLegendContent />} />
                  </LineChart>
                </ResponsiveContainer>
              </ChartContainer>
            ) : (
              <div className="text-center text-muted-foreground">
                <Activity className="h-16 w-16 mx-auto mb-4 opacity-20" />
                <p>Ajuste os parâmetros e clique em simular para visualizar os resultados.</p>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
