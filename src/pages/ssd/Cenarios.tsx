import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ReferenceLine,
} from 'recharts'
import Papa from 'papaparse'

const PERDAS = [0.3, 0.15]
const DEMANDAS = [100, 120, 80]

interface MySelectProps {
  options: { val: string; label: string }[]
  value: string
  onChange: (value: string) => void
  placeholder: string
}

const MySelect: React.FC<MySelectProps> = ({ options, value, onChange, placeholder }) => (
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

export default function Cenarios() {
  const [csvData, setCsvData] = useState<any[]>([])
  const [selectedFonte, setSelectedFonte] = useState('')
  const [selectedCenario, setSelectedCenario] = useState('')
  const [selectedEstrategia, setSelectedEstrategia] = useState('')
  const [perdaIndex, setPerdaIndex] = useState(0)
  const [demandaIndex, setDemandaIndex] = useState(0)
  const [simulationResults, setSimulationResults] = useState<any[]>([])
  const [chartDataA, setChartDataA] = useState<any[]>([])
  const [chartDataB, setChartDataB] = useState<any[]>([])
  const [chartDataC, setChartDataC] = useState<any[]>([])
  const [chartDataD, setChartDataD] = useState<any[]>([])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      Papa.parse(file, {
        header: true,
        complete: (results) => {
          setCsvData(results.data)
        },
        error: (error) => {
          console.error('Error parsing CSV:', error)
        },
      })
    }
  }

  const handleSimulate = () => {
    if (!csvData.length) return

    const filteredData = csvData.filter(
      (row) =>
        row.Fonte === selectedFonte &&
        row.cenario === selectedCenario &&
        row.estrategias === selectedEstrategia,
    )

    const groupedByTempo: { [key: string]: any[] } = {}
    filteredData.forEach((row) => {
      const tempo = row.Tempo
      if (!groupedByTempo[tempo]) {
        groupedByTempo[tempo] = []
      }
      groupedByTempo[tempo].push(row)
    })

    const results: any[] = []
    const chartA: any[] = []
    const chartB: any[] = []
    const chartC: any[] = []
    const chartD: any[] = []

    Object.keys(groupedByTempo).forEach((tempo) => {
      const rows = groupedByTempo[tempo]
      const totalVazaoCaptada = rows.reduce(
        (sum, row) => sum + parseFloat(row.Vazao_Captada || 0),
        0,
      )
      const perda = PERDAS[perdaIndex]
      const vazaoDistribuida = totalVazaoCaptada * (1 - perda)
      const demanda = DEMANDAS[demandaIndex]
      const percentual = (vazaoDistribuida / demanda) * 100

      results.push({
        Tempo: tempo,
        Vazao_Captada: totalVazaoCaptada,
        Vazao_Distribuida: vazaoDistribuida,
        Demanda: demanda,
        Percentual: percentual,
      })

      chartA.push({ Tempo: tempo, Vazao_Captada: totalVazaoCaptada })
      chartB.push({ Tempo: tempo, Percentual: percentual })
      chartC.push({
        Tempo: tempo,
        Vazao_Captada: totalVazaoCaptada,
        Vazao_Distribuida: vazaoDistribuida,
      })
      chartD.push({ Tempo: tempo, Vazao_Distribuida: vazaoDistribuida, Demanda: demanda })
    })

    setSimulationResults(results)
    setChartDataA(chartA)
    setChartDataB(chartB)
    setChartDataC(chartC)
    setChartDataD(chartD)
  }

  const fonteOptions = Array.from(new Set(csvData.map((row) => row.Fonte))).map((val) => ({
    val,
    label: val,
  }))
  const cenarioOptions = Array.from(new Set(csvData.map((row) => row.cenario))).map((val) => ({
    val,
    label: val,
  }))
  const estrategiaOptions = Array.from(new Set(csvData.map((row) => row.estrategias))).map(
    (val) => ({ val, label: val }),
  )

  return (
    <div className="p-4">
      <h1>Cenarios</h1>
      <div className="mb-4">
        <h2>Parâmetros Globais</h2>
        <div className="flex gap-4">
          <MySelect
            options={fonteOptions}
            value={selectedFonte}
            onChange={setSelectedFonte}
            placeholder="Selecione Fonte"
          />
          <MySelect
            options={cenarioOptions}
            value={selectedCenario}
            onChange={setSelectedCenario}
            placeholder="Selecione Cenário"
          />
          <MySelect
            options={estrategiaOptions}
            value={selectedEstrategia}
            onChange={setSelectedEstrategia}
            placeholder="Selecione Estratégia"
          />
          <Select
            value={perdaIndex.toString()}
            onValueChange={(val) => setPerdaIndex(parseInt(val))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Perda" />
            </SelectTrigger>
            <SelectContent>
              {PERDAS.map((p, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {p}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select
            value={demandaIndex.toString()}
            onValueChange={(val) => setDemandaIndex(parseInt(val))}
          >
            <SelectTrigger>
              <SelectValue placeholder="Demanda" />
            </SelectTrigger>
            <SelectContent>
              {DEMANDAS.map((d, i) => (
                <SelectItem key={i} value={i.toString()}>
                  {d}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="mb-4">
        <h2>Upload CSV</h2>
        <Input type="file" accept=".csv" onChange={handleFileUpload} />
      </div>
      <Button onClick={handleSimulate}>Simular</Button>
      <div className="mb-4">
        <h2>Tabela Simulação</h2>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Tempo</TableHead>
              <TableHead>Vazao_Captada</TableHead>
              <TableHead>Vazao_Distribuida</TableHead>
              <TableHead>Demanda</TableHead>
              <TableHead>Percentual</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {simulationResults.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.Tempo}</TableCell>
                <TableCell>{row.Vazao_Captada}</TableCell>
                <TableCell>{row.Vazao_Distribuida}</TableCell>
                <TableCell>{row.Demanda}</TableCell>
                <TableCell>{row.Percentual}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Gráfico A: Vazão Captada por Fonte</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart width={400} height={300} data={chartDataA}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Tempo" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Vazao_Captada" stroke="#8884d8" />
            </LineChart>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gráfico B: Percentual</CardTitle>
          </CardHeader>
          <CardContent>
            <BarChart width={400} height={300} data={chartDataB}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Tempo" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Percentual" fill="#82ca9d" />
            </BarChart>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gráfico C: Captada vs Distribuída</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart width={400} height={300} data={chartDataC}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Tempo" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Vazao_Captada" stroke="#8884d8" />
              <Line type="monotone" dataKey="Vazao_Distribuida" stroke="#82ca9d" />
            </LineChart>
          </CardContent>
        </Card>
        <Card>
          <CardHeader>
            <CardTitle>Gráfico D: Distribuída vs Demanda</CardTitle>
          </CardHeader>
          <CardContent>
            <LineChart width={400} height={300} data={chartDataD}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="Tempo" />
              <YAxis />
              <Tooltip />
              <Legend />
              <ReferenceLine y={0} stroke="red" />
              <Line type="monotone" dataKey="Vazao_Distribuida" stroke="#8884d8" />
              <Line type="monotone" dataKey="Demanda" stroke="#82ca9d" />
            </LineChart>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
