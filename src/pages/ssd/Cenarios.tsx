// Adicione estes imports no topo do arquivo (depois dos imports existentes):
import {
  LineChart,
  BarChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
  ComposedChart,
} from 'recharts'

// Adicione estes 4 estados novos (depois dos estados existentes):
const [chartDataA, setChartDataA] = useState<any[]>([])
const [chartDataB, setChartDataB] = useState<any[]>([])
const [chartDataC, setChartDataC] = useState<any[]>([])
const [chartDataD, setChartDataD] = useState<any[]>([])

// Substitua COMPLETAMENTE a função handleSimulate por:
const handleSimulate = () => {
  if (csvData.length === 0) {
    alert('Por favor, importe um CSV válido antes de rodar a simulação')
    return
  }

  // Filtrar dados por simulacao
  const filteredBySimulation = csvData.filter((row) => {
    return simulacao.some(
      (sim) =>
        row.Fonte === sim.fonte &&
        row.cenario === sim.cenarios &&
        row.estrategia === sim.estrategias,
    )
  })

  // Calcular Vazao_Distribuida para todos os registros filtrados
  const processed = filteredBySimulation.map((row) => ({
    ...row,
    Vazao_Captada: parseFloat(row.Vazao_Captada),
    Vazao_Distribuida: parseFloat(row.Vazao_Captada) * (1 - globalPerdas),
  }))

  setResults(processed)

  // Preparar dados para os 4 gráficos
  const groupedByTempo: { [tempo: string]: any[] } = {}
  processed.forEach((row) => {
    if (!groupedByTempo[row.Tempo]) groupedByTempo[row.Tempo] = []
    groupedByTempo[row.Tempo].push(row)
  })

  // Gráfico A: Linha - Vazão captada por Fonte vs Tempo
  const graphA = Object.entries(groupedByTempo).map(([tempo, rows]) => {
    const obj: any = { Tempo: tempo }
    rows.forEach((row) => {
      obj[row.Fonte] = (obj[row.Fonte] || 0) + row.Vazao_Captada
    })
    return obj
  })
  setChartDataA(graphA)

  // Gráfico B: Barra empilhada - % por Fonte vs Tempo
  const graphB = Object.entries(groupedByTempo).map(([tempo, rows]) => {
    const total = rows.reduce((sum, row) => sum + row.Vazao_Captada, 0)
    const obj: any = { Tempo: tempo }
    rows.forEach((row) => {
      obj[row.Fonte] = ((obj[row.Fonte] || 0) + row.Vazao_Captada / total) * 100
    })
    return obj
  })
  setChartDataB(graphB)

  // Gráfico C: Linha - Vazão captada vs distribuída vs Tempo
  const graphC = Object.entries(groupedByTempo).map(([tempo, rows]) => ({
    Tempo: tempo,
    Vazao_Captada: rows.reduce((sum, row) => sum + row.Vazao_Captada, 0),
    Vazao_Distribuida: rows.reduce((sum, row) => sum + row.Vazao_Distribuida, 0),
  }))
  setChartDataC(graphC)

  // Gráfico D: Linha - Vazão total distribuída vs Demanda vs Tempo
  const graphD = Object.entries(groupedByTempo).map(([tempo, rows]) => ({
    Tempo: tempo,
    Vazao_Total_Distribuida: rows.reduce((sum, row) => sum + row.Vazao_Distribuida, 0),
    Demanda: globalDemanda,
    Saldo: rows.reduce((sum, row) => sum + row.Vazao_Distribuida, 0) - globalDemanda,
  }))
  setChartDataD(graphD)
}

// Substitua a última seção {results.length > 0 && <SimulationCharts...} por:
{
  results.length > 0 && (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Gráfico A */}
      <Card className="shadow-sm">
        <CardHeader className="py-4 bg-slate-50/50">
          <CardTitle className="text-lg">Vazão Captada por Fonte vs Tempo</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartDataA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Tempo" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(chartDataA[0] || {})
                .filter((k) => k !== 'Tempo')
                .map((fonte, idx) => (
                  <Line
                    key={fonte}
                    type="monotone"
                    dataKey={fonte}
                    stroke={`hsl(${idx * 60}, 70%, 50%)`}
                    strokeWidth={2}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico B */}
      <Card className="shadow-sm">
        <CardHeader className="py-4 bg-slate-50/50">
          <CardTitle className="text-lg">% por Fonte vs Tempo (Empilhado)</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ResponsiveContainer width="100%" height={350}>
            <BarChart data={chartDataB}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Tempo" />
              <YAxis />
              <Tooltip />
              <Legend />
              {Object.keys(chartDataB[0] || {})
                .filter((k) => k !== 'Tempo')
                .map((fonte, idx) => (
                  <Bar
                    key={fonte}
                    dataKey={fonte}
                    stackId="a"
                    fill={`hsl(${idx * 60}, 70%, 50%)`}
                  />
                ))}
            </BarChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico C */}
      <Card className="shadow-sm">
        <CardHeader className="py-4 bg-slate-50/50">
          <CardTitle className="text-lg">Vazão Captada vs Distribuída vs Tempo</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartDataC}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Tempo" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Vazao_Captada" stroke="#8884d8" strokeWidth={2} />
              <Line type="monotone" dataKey="Vazao_Distribuida" stroke="#82ca9d" strokeWidth={2} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico D */}
      <Card className="shadow-sm">
        <CardHeader className="py-4 bg-slate-50/50">
          <CardTitle className="text-lg">Vazão Total Distribuída vs Demanda vs Tempo</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <ResponsiveContainer width="100%" height={350}>
            <LineChart data={chartDataD}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Tempo" />
              <YAxis />
              <Tooltip />
              <Legend />
              <ReferenceLine
                y={0}
                stroke="#000000"
                strokeDasharray="5 5"
                label={{ value: 'Equilíbrio (Y=0)', position: 'right', fill: '#000' }}
              />
              <Line
                type="monotone"
                dataKey="Vazao_Total_Distribuida"
                stroke="#8884d8"
                strokeWidth={2}
                name="Vazão Distribuída"
              />
              <Line
                type="monotone"
                dataKey="Demanda"
                stroke="#ff0000"
                strokeWidth={2}
                name="Demanda"
              />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>
    </div>
  )
}
