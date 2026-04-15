import React, { useState, useEffect } from 'react'
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
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
  ResponsiveContainer,
} from 'recharts'
import useSimulationStore from '@/stores/useSimulationStore'

type SimulacaoRow = {
  Tempo: string
  Fonte: string
  cenario: string
  estrategia: string
  Vazao_Captada: number
  Demanda: number
  CAPEX: number
  OPEX: number
  Aceitacao_Social: number
}

type ProcessedData = {
  Tempo: string
  Vazao_Captada: number
  Vazao_Distribuida: number
  Fonte: string
  Demanda: number
}

const Cenarios: React.FC = () => {
  const { simulacao, csvData, setCsvData, setSimulacao } = useSimulationStore()
  const [perdas, setPerdas] = useState<number>(0.3)
  const [demanda, setDemanda] = useState<number>(100)
  const [processedData, setProcessedData] = useState<ProcessedData[]>([])
  const [chartData1, setChartData1] = useState<any[]>([])
  const [chartData2, setChartData2] = useState<any[]>([])
  const [chartData3, setChartData3] = useState<any[]>([])
  const [chartData4, setChartData4] = useState<any[]>([])

  const handleCsvUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const rows = text.split('\n').map((row) => row.split(','))
        const headers = rows[0]
        const requiredHeaders = [
          'Tempo',
          'Fonte',
          'cenario',
          'estrategia',
          'Vazao_Captada',
          'Demanda',
          'CAPEX',
          'OPEX',
          'Aceitacao_Social',
        ]
        const isValid = requiredHeaders.every((header) => headers.includes(header))
        if (!isValid) {
          alert('CSV inválido: colunas obrigatórias não encontradas.')
          return
        }
        const data: SimulacaoRow[] = rows.slice(1).map((row) => ({
          Tempo: row[0],
          Fonte: row[1],
          cenario: row[2],
          estrategia: row[3],
          Vazao_Captada: parseFloat(row[4]),
          Demanda: parseFloat(row[5]),
          CAPEX: parseFloat(row[6]),
          OPEX: parseFloat(row[7]),
          Aceitacao_Social: parseFloat(row[8]),
        }))
        setCsvData(data)
      }
      reader.readAsText(file)
    }
  }

  const runSimulation = () => {
    if (!csvData.length) return
    const filteredData = csvData
      .filter((row: SimulacaoRow) => {
        const sim = simulacao.find((s) => s.Fonte?.toLowerCase() === row.Fonte?.toLowerCase())
        return sim && sim.cenario === row.cenario && sim.estrategia === row.estrategia
      })
      .map((row: SimulacaoRow) => ({
        ...row,
        Vazao_Distribuida: row.Vazao_Captada * (1 - perdas),
        Demanda: demanda,
      }))
    setProcessedData(filteredData)

    // Process Chart 1: Line - Vazão captada por Fonte (X = Tempo)
    const groupedByTempo = filteredData.reduce((acc, row) => {
      if (!acc[row.Tempo]) acc[row.Tempo] = {}
      acc[row.Tempo][row.Fonte] = row.Vazao_Captada
      return acc
    }, {} as any)
    const chart1Data = Object.keys(groupedByTempo).map((tempo) => ({
      Tempo: tempo,
      ...groupedByTempo[tempo],
    }))
    setChartData1(chart1Data)

    // Process Chart 2: Stacked Bar - % por Fonte (X = Tempo)
    const chart2Data = Object.keys(groupedByTempo).map((tempo) => {
      const total = Object.values(groupedByTempo[tempo]).reduce(
        (sum: number, val: number) => sum + val,
        0,
      )
      const obj: any = { Tempo: tempo }
      Object.keys(groupedByTempo[tempo]).forEach((fonte) => {
        obj[fonte] = (groupedByTempo[tempo][fonte] / total) * 100
      })
      return obj
    })
    setChartData2(chart2Data)

    // Process Chart 3: Line - Vazão captada vs distribuída
    const chart3Data = filteredData.map((row) => ({
      Tempo: row.Tempo,
      Vazao_Captada: row.Vazao_Captada,
      Vazao_Distribuida: row.Vazao_Distribuida,
    }))
    setChartData3(chart3Data)

    // Process Chart 4: Line + Bar - Vazão total distribuída vs Demanda
    const totalDistributed = filteredData.reduce((acc, row) => {
      if (!acc[row.Tempo]) acc[row.Tempo] = 0
      acc[row.Tempo] += row.Vazao_Distribuida
      return acc
    }, {} as any)
    const chart4Data = Object.keys(totalDistributed).map((tempo) => ({
      Tempo: tempo,
      Vazao_Distribuida: totalDistributed[tempo],
      Demanda: demanda,
    }))
    setChartData4(chart4Data)
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Tabela de Simulação</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tempo</TableHead>
                <TableHead>Fonte</TableHead>
                <TableHead>Cenário</TableHead>
                <TableHead>Estratégia</TableHead>
                <TableHead>Vazão Captada</TableHead>
                <TableHead>Demanda</TableHead>
                <TableHead>CAPEX</TableHead>
                <TableHead>OPEX</TableHead>
                <TableHead>Aceitação Social</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {simulacao.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.Tempo}</TableCell>
                  <TableCell>{row.Fonte}</TableCell>
                  <TableCell>{row.cenario}</TableCell>
                  <TableCell>{row.estrategia}</TableCell>
                  <TableCell>{row.Vazao_Captada}</TableCell>
                  <TableCell>{row.Demanda}</TableCell>
                  <TableCell>{row.CAPEX}</TableCell>
                  <TableCell>{row.OPEX}</TableCell>
                  <TableCell>{row.Aceitacao_Social}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Parâmetros Globais</CardTitle>
        </CardHeader>
        <CardContent className="space-y-2">
          <div>
            <label>Perdas:</label>
            <Select
              value={perdas.toString()}
              onValueChange={(value) => setPerdas(parseFloat(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.3">30%</SelectItem>
                <SelectItem value="0.15">15%</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label>Demanda:</label>
            <Select
              value={demanda.toString()}
              onValueChange={(value) => setDemanda(parseFloat(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="120">120</SelectItem>
                <SelectItem value="80">80</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Importação CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <input type="file" accept=".csv" onChange={handleCsvUpload} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo de Processamento</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Dados processados: {processedData.length}</p>
        </CardContent>
      </Card>

      <Button onClick={runSimulation}>Rodar Simulação</Button>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Chart 1: Vazão Captada por Fonte</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData1}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Tempo" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(chartData1[0] || {})
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
            <CardTitle>Chart 2: % por Fonte</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData2}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Tempo" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(chartData2[0] || {})
                  .filter((key) => key !== 'Tempo')
                  .map((fonte) => (
                    <Bar key={fonte} dataKey={fonte} stackId="a" fill="#8884d8" />
                  ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chart 3: Vazão Captada vs Distribuída</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartData3}>
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
            <CardTitle>Chart 4: Vazão Distribuída vs Demanda</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartData4}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Tempo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Vazao_Distribuida" fill="#8884d8" />
                <Line type="monotone" dataKey="Demanda" stroke="#ff7300" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Cenarios
