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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Play, Upload } from 'lucide-react'
import { useSimulationStore } from '@/stores/simulationStore'
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
} from 'recharts'

const PERDAS = [
  { label: 'Atual (30%)', val: 0.3 },
  { label: 'Meta (15%)', val: 0.15 },
]

const DEMANDAS = [
  { label: 'Tendencial', val: 100 },
  { label: 'Acelerada', val: 120 },
  { label: 'Reduzida', val: 80 },
]

const MySelect: React.FC<{
  options: { label: string; val: any }[]
  value: any
  onChange: (value: any) => void
  placeholder: string
}> = ({ options, value, onChange, placeholder }) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger>
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      {options.map((option) => (
        <SelectItem key={option.val} value={option.val}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

interface CsvRow {
  Tempo: string
  Fonte: string
  Cenario: string
  Estrategia: string
  Vazao_Captada: number
}

interface SimulationRow {
  fonte: string
  cenarios: string
  estrategias: string
}

interface ChartDataA {
  Tempo: string
  [key: string]: any
}

interface ChartDataB {
  Tempo: string
  [key: string]: any
}

interface ChartDataC {
  Tempo: string
  Vazao_Captada: number
  Vazao_Distribuida: number
}

interface ChartDataD {
  Tempo: string
  Vazao_Total_Distribuida: number
  Demanda: number
}

const Cenarios: React.FC = () => {
  const { simulacao } = useSimulationStore()

  const [csvData, setCsvData] = useState<CsvRow[]>([])
  const [csvPreview, setCsvPreview] = useState<string>('')
  const [csvError, setCsvError] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [globalPerdas, setGlobalPerdas] = useState<number>(0.3)
  const [globalDemanda, setGlobalDemanda] = useState<number>(100)
  const [results, setResults] = useState<any[]>([])
  const [timeData, setTimeData] = useState<string[]>([])
  const [processingInfo, setProcessingInfo] = useState<any[]>([])
  const [chartDataA, setChartDataA] = useState<ChartDataA[]>([])
  const [chartDataB, setChartDataB] = useState<ChartDataB[]>([])
  const [chartDataC, setChartDataC] = useState<ChartDataC[]>([])
  const [chartDataD, setChartDataD] = useState<ChartDataD[]>([])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n')
      const headers = lines[0].split(',')
      const requiredColumns = ['Tempo', 'Fonte', 'Cenario', 'Estrategia', 'Vazao_Captada']
      const hasAllColumns = requiredColumns.every((col) => headers.includes(col))
      if (!hasAllColumns) {
        setCsvError('CSV must contain columns: Tempo, Fonte, Cenario, Estrategia, Vazao_Captada')
        return
      }
      setCsvError('')
      const data: CsvRow[] = []
      for (let i = 1; i < lines.length; i++) {
        const row = lines[i].split(',')
        if (row.length === headers.length) {
          data.push({
            Tempo: row[0],
            Fonte: row[1],
            Cenario: row[2],
            Estrategia: row[3],
            Vazao_Captada: parseFloat(row[4]),
          })
        }
      }
      setCsvData(data)
      setCsvPreview(lines.slice(0, 6).join('\n')) // Preview first 5 lines
    }
    reader.readAsText(file)
  }

  const handleSimulate = () => {
    if (!csvData.length || !simulacao.length) {
      alert('Upload CSV and ensure simulation data is available')
      return
    }
    const uniqueTimes = [...new Set(csvData.map((row) => row.Tempo))].sort()
    setTimeData(uniqueTimes)
    const processing = []
    const chartA: ChartDataA[] = []
    const chartB: ChartDataB[] = []
    const chartC: ChartDataC[] = []
    const chartD: ChartDataD[] = []

    // Initialize chart structures
    uniqueTimes.forEach((time) => {
      chartA.push({ Tempo: time })
      chartB.push({ Tempo: time })
      chartC.push({ Tempo: time, Vazao_Captada: 0, Vazao_Distribuida: 0 })
      chartD.push({ Tempo: time, Vazao_Total_Distribuida: 0, Demanda: globalDemanda })
    })

    simulacao.forEach((sim: SimulationRow) => {
      const filtered = csvData.filter(
        (row) =>
          row.Fonte === sim.fonte &&
          row.Cenario === sim.cenarios &&
          row.Estrategia === sim.estrategias,
      )
      const aggregated: { [time: string]: { captada: number; distribuida: number } } = {}
      filtered.forEach((row) => {
        if (!aggregated[row.Tempo]) aggregated[row.Tempo] = { captada: 0, distribuida: 0 }
        aggregated[row.Tempo].captada += row.Vazao_Captada
        aggregated[row.Tempo].distribuida += row.Vazao_Captada * (1 - globalPerdas)
      })
      processing.push({
        fonte: sim.fonte,
        cenarios: sim.cenarios,
        estrategias: sim.estrategias,
        totalCaptada: Object.values(aggregated).reduce((sum, val) => sum + val.captada, 0),
        totalDistribuida: Object.values(aggregated).reduce((sum, val) => sum + val.distribuida, 0),
      })

      // Update chartA: Line Vazão captada por Fonte vs Tempo
      uniqueTimes.forEach((time) => {
        if (!chartA.find((c) => c.Tempo === time)[sim.fonte])
          chartA.find((c) => c.Tempo === time)[sim.fonte] = 0
        chartA.find((c) => c.Tempo === time)[sim.fonte] += aggregated[time]?.captada || 0
      })

      // ChartB: Stacked Bar % by Fonte vs Tempo (assuming % of total)
      // Simplified: % of captada for each fonte
      uniqueTimes.forEach((time) => {
        const total = chartA.find((c) => c.Tempo === time)[sim.fonte] || 0
        if (!chartB.find((c) => c.Tempo === time)[sim.fonte])
          chartB.find((c) => c.Tempo === time)[sim.fonte] = 0
        chartB.find((c) => c.Tempo === time)[sim.fonte] =
          total > 0 ? (aggregated[time]?.captada / total) * 100 : 0
      })

      // ChartC: Vazao captada vs distribuida
      uniqueTimes.forEach((time) => {
        chartC.find((c) => c.Tempo === time).Vazao_Captada += aggregated[time]?.captada || 0
        chartC.find((c) => c.Tempo === time).Vazao_Distribuida += aggregated[time]?.distribuida || 0
      })

      // ChartD: Total distribuida vs Demanda
      uniqueTimes.forEach((time) => {
        chartD.find((c) => c.Tempo === time).Vazao_Total_Distribuida +=
          aggregated[time]?.distribuida || 0
      })
    })

    setProcessingInfo(processing)
    setChartDataA(chartA)
    setChartDataB(chartB)
    setChartDataC(chartC)
    setChartDataD(chartD)
  }

  return (
    <div className="p-4 space-y-4">
      {/* Tabela de Simulação */}
      <Card>
        <CardHeader>
          <CardTitle>Tabela de Simulação</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fonte</TableHead>
                <TableHead>Cenários</TableHead>
                <TableHead>Estratégias</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {simulacao.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.fonte}</TableCell>
                  <TableCell>{row.cenarios}</TableCell>
                  <TableCell>{row.estrategias}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Parâmetros Globais */}
      <Card>
        <CardHeader>
          <CardTitle>Parâmetros Globais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <label>Perdas:</label>
            <MySelect
              options={PERDAS}
              value={globalPerdas}
              onChange={setGlobalPerdas}
              placeholder="Selecione Perdas"
            />
          </div>
          <div>
            <label>Demanda:</label>
            <MySelect
              options={DEMANDAS}
              value={globalDemanda}
              onChange={setGlobalDemanda}
              placeholder="Selecione Demanda"
            />
          </div>
        </CardContent>
      </Card>

      {/* Upload CSV */}
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <input type="file" accept=".csv" onChange={handleFileUpload} />
          {csvPreview && <pre>{csvPreview}</pre>}
          {csvError && <p className="text-red-500">{csvError}</p>}
        </CardContent>
      </Card>

      {/* Resumo Processamento */}
      <Card>
        <CardHeader>
          <CardTitle>Resumo Processamento</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fonte</TableHead>
                <TableHead>Cenários</TableHead>
                <TableHead>Estratégias</TableHead>
                <TableHead>Total Captada</TableHead>
                <TableHead>Total Distribuída</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {processingInfo.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.fonte}</TableCell>
                  <TableCell>{row.cenarios}</TableCell>
                  <TableCell>{row.estrategias}</TableCell>
                  <TableCell>{row.totalCaptada}</TableCell>
                  <TableCell>{row.totalDistribuida}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Botão Rodar */}
      <Button onClick={handleSimulate} className="flex items-center gap-2">
        <Play size={16} /> Rodar Simulação
      </Button>

      {/* Grid 2x2 Gráficos */}
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Gráfico A: Vazão Captada por Fonte vs Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartDataA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Tempo" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(chartDataA[0] || {})
                  .filter((key) => key !== 'Tempo')
                  .map((fonte) => (
                    <Line key={fonte} type="monotone" dataKey={fonte} stroke="#8884d8" />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gráfico B: % por Fonte vs Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartDataB}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Tempo" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(chartDataB[0] || {})
                  .filter((key) => key !== 'Tempo')
                  .map((fonte) => (
                    <Bar key={fonte} dataKey={fonte} stackId="a" fill="#82ca9d" />
                  ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gráfico C: Vazão Captada vs Distribuída vs Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartDataC}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Tempo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="Vazao_Captada" stroke="#8884d8" />
                <Line type="monotone" dataKey="Vazao_Distribuida" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gráfico D: Vazão Total Distribuída vs Demanda vs Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chartDataD}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Tempo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <ReferenceLine y={0} stroke="red" />
                <Line type="monotone" dataKey="Vazao_Total_Distribuida" stroke="#8884d8" />
                <Line type="monotone" dataKey="Demanda" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Cenarios
