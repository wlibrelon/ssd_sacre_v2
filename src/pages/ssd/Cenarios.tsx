import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Play, Upload } from 'lucide-react'
import useSimulationStore from '@/stores/useSimulationStore'
import {
  LineChart,
  BarChart,
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ReferenceLine,
} from 'recharts'

const Cenarios: React.FC = () => {
  const { simulacao, setSimulacao } = useSimulationStore()
  const [csvData, setCsvData] = useState<any[]>([])
  const [results, setResults] = useState<any[]>([])
  const [chart1Data, setChart1Data] = useState<any[]>([])
  const [chart2Data, setChart2Data] = useState<any[]>([])
  const [chart3Data, setChart3Data] = useState<any[]>([])
  const [chart4Data, setChart4Data] = useState<any[]>([])

  const handleSimulate = () => {
    if (csvData.length === 0 || simulacao.length === 0) {
      alert('Please import CSV and add simulations')
      return
    }

    const processedResults: any[] = []
    const chart1: any[] = []
    const chart2: any[] = []
    const chart3: any[] = []
    const chart4: any[] = []

    simulacao.forEach((sim: any) => {
      const filteredData = csvData.filter(
        (row) =>
          row.Fonte === sim.fonte &&
          row.cenario === sim.cenarios &&
          row.estrategia === sim.estrategia,
      )
      // Process filteredData into results, chart1Data, etc.
      // Assuming data structure: { tempo, vazao_captada, vazao_distribuida, demanda, fonte, etc. }
      // Aggregate or map as needed
      // For chart1: group by tempo and fonte
      // This is placeholder; actual logic depends on data
      const tempChart1 = filteredData.reduce((acc, row) => {
        const existing = acc.find((item: any) => item.tempo === row.tempo)
        if (existing) {
          existing[row.Fonte] = row.vazao_captada
        } else {
          acc.push({ tempo: row.tempo, [row.Fonte]: row.vazao_captada })
        }
        return acc
      }, [])
      chart1.push(...tempChart1)

      // Similar for others
      // chart2: % per fonte per tempo
      // chart3: vazao_captada and distribuida per tempo
      // chart4: vazao_total_distribuida + demanda per tempo
      // Implement aggregation logic here
    })

    setResults(processedResults)
    setChart1Data(chart1)
    setChart2Data(chart2)
    setChart3Data(chart3)
    setChart4Data(chart4)
  }

  return (
    <div className="space-y-6">
      {/* Tabela Simulação */}
      <Card className="border shadow-sm border-t-4 border-t-blue-500">
        <CardHeader>
          <CardTitle>Tabela Simulação</CardTitle>
        </CardHeader>
        <CardContent>{/* Table content */}</CardContent>
      </Card>

      {/* Parâmetros Globais */}
      <Card className="border shadow-sm border-t-4 border-t-green-500">
        <CardHeader>
          <CardTitle>Parâmetros Globais</CardTitle>
        </CardHeader>
        <CardContent>{/* Parameters */}</CardContent>
      </Card>

      {/* Importação CSV */}
      <Card className="border shadow-sm border-t-4 border-t-yellow-500">
        <CardHeader>
          <CardTitle>Importação CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <Button>
            <Upload className="mr-2" /> Importar CSV
          </Button>
        </CardContent>
      </Card>

      {/* Resumo Processamento */}
      <Card className="border shadow-sm border-t-4 border-t-purple-500">
        <CardHeader>
          <CardTitle>Resumo Processamento</CardTitle>
        </CardHeader>
        <CardContent>{/* Summary */}</CardContent>
      </Card>

      {/* Botão Rodar Simulação */}
      <Button onClick={handleSimulate}>
        <Play className="mr-2" /> Rodar Simulação
      </Button>

      {/* Gráficos */}
      {results.length > 0 && (
        <div className="grid md:grid-cols-2 gap-4 overflow-x-auto">
          <Card>
            <CardHeader>
              <CardTitle>Chart 1: Tempo vs Vazao Captada por Fonte</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chart1Data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tempo" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {/* Dynamic lines per fonte */}
                  {Object.keys(chart1Data[0] || {})
                    .filter((key) => key !== 'tempo')
                    .map((fonte, index) => (
                      <Line
                        key={fonte}
                        type="monotone"
                        dataKey={fonte}
                        stroke={`hsl(${index * 60}, 70%, 50%)`}
                      />
                    ))}
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chart 2: Tempo vs % por Fonte</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chart2Data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tempo" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  {/* Stacked bars */}
                  {Object.keys(chart2Data[0] || {})
                    .filter((key) => key !== 'tempo')
                    .map((fonte, index) => (
                      <Bar
                        key={fonte}
                        dataKey={fonte}
                        stackId="a"
                        fill={`hsl(${index * 60}, 70%, 50%)`}
                      />
                    ))}
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chart 3: Tempo vs Vazao Captada e Distribuida</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chart3Data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tempo" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="vazao_captada" stroke="#8884d8" />
                  <Line type="monotone" dataKey="vazao_distribuida" stroke="#82ca9d" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Chart 4: Tempo vs Vazao Total Distribuida e Demanda</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <ComposedChart data={chart4Data}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tempo" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="vazao_total_distribuida" fill="#8884d8" />
                  <Line type="monotone" dataKey="demanda" stroke="#ff0000" />
                  <ReferenceLine y={0} stroke="#000000" strokeDasharray="5 5" />
                </ComposedChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}
export default Cenarios
