import React, { useState, useEffect } from 'react'
import useSimulationStore from '@/stores/useSimulationStore' // ← AQUI: SEM chaves
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

import { Card, CardContent, CardHeader, CardTitle } from '../components/ui/card' // Assuming shadcn/ui path
import { Button } from '../components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '../components/ui/table'

type CsvRow = {
  Tempo: string
  Fonte: string
  Cenario: string
  Estrategia: string
  Vazao_Captada: number
}

type SimulacaoRow = {
  fonte: string
  cenario: string
  estrategia: string
}

type ChartData = {
  tempo: string
  [key: string]: any
}

const Cenarios: React.FC = () => {
  const { simulacao, csvData, globalPerdas, globalDemanda, setGlobalPerdas, setGlobalDemanda } =
    useSimulationStore()
  const [results, setResults] = useState<any[]>([])
  const [chartDataA, setChartDataA] = useState<ChartData[]>([])
  const [chartDataB, setChartDataB] = useState<ChartData[]>([])
  const [chartDataC, setChartDataC] = useState<ChartData[]>([])
  const [chartDataD, setChartDataD] = useState<ChartData[]>([])
  const [resumo, setResumo] = useState<
    { fonte: string; cenario: string; estrategia: string; registros: number }[]
  >([])

  const filterBySim = (data: CsvRow[], sim: SimulacaoRow): CsvRow[] => {
    return data.filter(
      (row) =>
        row.Fonte === sim.fonte && row.Cenario === sim.cenario && row.Estrategia === sim.estrategia,
    )
  }

  const handleSimulate = () => {
    if (!csvData || csvData.length === 0) {
      alert('CSV vazio')
      return
    }
    if (!simulacao || simulacao.length === 0) {
      alert('Simulação vazia')
      return
    }
    const processed: any[] = []
    const resumoTemp: { fonte: string; cenario: string; estrategia: string; registros: number }[] =
      []
    const dataA: { [tempo: string]: { [fonte: string]: number } } = {}
    const dataB: { [tempo: string]: { [fonte: string]: number } } = {}
    const dataC: { [tempo: string]: { captada: number; distribuida: number } } = {}
    const dataD: { [tempo: string]: { distribuidaTotal: number; demanda: number } } = {}

    simulacao.forEach((sim) => {
      const filtered = filterBySim(csvData, sim)
      if (filtered.length === 0) {
        alert(`Filtros sem resultados para ${sim.fonte}, ${sim.cenario}, ${sim.estrategia}`)
        return
      }
      resumoTemp.push({
        fonte: sim.fonte,
        cenario: sim.cenario,
        estrategia: sim.estrategia,
        registros: filtered.length,
      })
      filtered.forEach((row) => {
        const vazaoDistribuida = row.Vazao_Captada * (1 - globalPerdas)
        processed.push({ ...row, Vazao_Distribuida: vazaoDistribuida })
        // Agregação para gráficos
        if (!dataA[row.Tempo]) dataA[row.Tempo] = {}
        dataA[row.Tempo][row.Fonte] = (dataA[row.Tempo][row.Fonte] || 0) + row.Vazao_Captada
        if (!dataB[row.Tempo]) dataB[row.Tempo] = {}
        dataB[row.Tempo][row.Fonte] = (dataB[row.Tempo][row.Fonte] || 0) + row.Vazao_Captada
        if (!dataC[row.Tempo]) dataC[row.Tempo] = { captada: 0, distribuida: 0 }
        dataC[row.Tempo].captada += row.Vazao_Captada
        dataC[row.Tempo].distribuida += vazaoDistribuida
        if (!dataD[row.Tempo]) dataD[row.Tempo] = { distribuidaTotal: 0, demanda: globalDemanda }
        dataD[row.Tempo].distribuidaTotal += vazaoDistribuida
      })
    })
    setResults(processed)
    setResumo(resumoTemp)
    // Processar % para B
    const chartB: ChartData[] = Object.keys(dataB).map((tempo) => {
      const total = Object.values(dataB[tempo]).reduce((sum, val) => sum + val, 0)
      const entry: ChartData = { tempo }
      Object.keys(dataB[tempo]).forEach((fonte) => {
        entry[fonte] = (dataB[tempo][fonte] / total) * 100
      })
      return entry
    })
    setChartDataA(Object.keys(dataA).map((tempo) => ({ tempo, ...dataA[tempo] })))
    setChartDataB(chartB)
    setChartDataC(Object.keys(dataC).map((tempo) => ({ tempo, ...dataC[tempo] })))
    setChartDataD(Object.keys(dataD).map((tempo) => ({ tempo, ...dataD[tempo] })))
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
                <TableHead>Fonte</TableHead>
                <TableHead>Cenario</TableHead>
                <TableHead>Estrategia</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {simulacao.map((sim, idx) => (
                <TableRow key={idx}>
                  <TableCell>{sim.fonte}</TableCell>
                  <TableCell>{sim.cenario}</TableCell>
                  <TableCell>{sim.estrategia}</TableCell>
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
              value={globalPerdas.toString()}
              onValueChange={(val) => setGlobalPerdas(parseFloat(val))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.1">0.1</SelectItem>
                <SelectItem value="0.2">0.2</SelectItem>
                {/* Add more options */}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label>Demanda:</label>
            <Select
              value={globalDemanda.toString()}
              onValueChange={(val) => setGlobalDemanda(parseFloat(val))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100</SelectItem>
                <SelectItem value="200">200</SelectItem>
                {/* Add more options */}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
        </CardHeader>
        <CardContent>
          {/* Assume CSV upload component here, e.g., <input type="file" /> */}
          <p>CSV loaded: {csvData ? csvData.length : 0} rows</p>
        </CardContent>
      </Card>
      <Card>
        <CardHeader>
          <CardTitle>Resumo de Processamento</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fonte</TableHead>
                <TableHead>Cenario</TableHead>
                <TableHead>Estrategia</TableHead>
                <TableHead>Registros</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {resumo.map((r, idx) => (
                <TableRow key={idx}>
                  <TableCell>{r.fonte}</TableCell>
                  <TableCell>{r.cenario}</TableCell>
                  <TableCell>{r.estrategia}</TableCell>
                  <TableCell>{r.registros}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
      <Button onClick={handleSimulate}>Rodar Simulação</Button>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Vazão Captada por Fonte vs Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartDataA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tempo" />
                <YAxis />
                <Tooltip />
                <Legend />
                {/* Dynamic lines based on fontes */}
                {Object.keys(chartDataA[0] || {})
                  .filter((k) => k !== 'tempo')
                  .map((fonte) => (
                    <Line key={fonte} type="monotone" dataKey={fonte} stroke="#8884d8" />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>% por Fonte vs Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartDataB}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tempo" />
                <YAxis />
                <Tooltip />
                <Legend />
                {/* Dynamic bars */}
                {Object.keys(chartDataB[0] || {})
                  .filter((k) => k !== 'tempo')
                  .map((fonte) => (
                    <Bar key={fonte} dataKey={fonte} stackId="a" fill="#8884d8" />
                  ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Vazão Captada vs Distribuída vs Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartDataC}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tempo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="captada" stroke="#8884d8" />
                <Line type="monotone" dataKey="distribuida" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Vazão Total Distribuída vs Demanda vs Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartDataD}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tempo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <ReferenceLine y={0} stroke="red" />
                <Line type="monotone" dataKey="distribuidaTotal" stroke="#8884d8" />
                <Line type="monotone" dataKey="demanda" stroke="#82ca9d" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Cenarios
