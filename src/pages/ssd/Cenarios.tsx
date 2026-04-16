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
import useSimulationStore from '@/stores/useSimulationStore'
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
  Cell,
} from 'recharts'

const PERDAS = {
  atual: 0.3,
  meta: 0.15,
}

const DEMANDAS = {
  tendencial: 100,
  acelerada: 120,
  reduzida: 80,
}

const MySelect = ({
  options,
  value,
  onChange,
  placeholder,
}: {
  options: { value: string; label: string }[]
  value: string
  onChange: (value: string) => void
  placeholder: string
}) => (
  <Select value={value} onValueChange={onChange}>
    <SelectTrigger>
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      {options.map((option) => (
        <SelectItem key={option.value} value={option.value}>
          {option.label}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

const Cenarios: React.FC = () => {
  const { simulacao } = useSimulationStore()
  const [csvData, setCsvData] = useState<any[]>([])
  const [csvPreview, setCsvPreview] = useState<any[]>([])
  const [csvError, setCsvError] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [globalPerdas, setGlobalPerdas] = useState<string>('atual')
  const [globalDemanda, setGlobalDemanda] = useState<string>('tendencial')
  const [results, setResults] = useState<any[]>([])
  const [timeData, setTimeData] = useState<any[]>([])
  const [processingInfo, setProcessingInfo] = useState<string>('')
  const [chartDataA, setChartDataA] = useState<any[]>([])
  const [chartDataB, setChartDataB] = useState<any[]>([])
  const [chartDataC, setChartDataC] = useState<any[]>([])
  const [chartDataD, setChartDataD] = useState<any[]>([])
  const [simulationDetails, setSimulationDetails] = useState<
    Array<{ fonte: string; cenarios: string; estrategias: string; registrosEncontrados: number }>
  >([])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n')
      const headers = lines[0].split(',')
      const data = lines
        .slice(1)
        .map((line) => {
          const values = line.split(',')
          const obj: any = {}
          headers.forEach((header, index) => {
            obj[header.trim()] = values[index]?.trim() || ''
          })
          return obj
        })
        .filter((row) => Object.values(row).some((val) => val !== ''))
      setCsvData(data)
      setCsvPreview(data.slice(0, 5))
      setCsvError('')
    }
    reader.readAsText(file)
  }

  const handleSimulate = () => {
    if (!csvData.length) return

    let totalRegistros = 0
    let simulacoesComDados = 0
    const detailsArray = []
    const uniqueTempos = new Set<string>()

    const perdasValue = PERDAS[globalPerdas as keyof typeof PERDAS]
    const demandaValue = DEMANDAS[globalDemanda as keyof typeof DEMANDAS]
    const aggregated: any = {}

    simulacao.forEach((sim) => {
      const filtered = csvData.filter(
        (row) =>
          row.Fonte === sim.fonte &&
          row.Cenario === sim.cenarios &&
          row.Estrategia === sim.estrategias,
      )

      detailsArray.push({
        fonte: sim.fonte,
        cenarios: sim.cenarios,
        estrategias: sim.estrategias,
        registrosEncontrados: filtered.length,
      })

      totalRegistros += filtered.length
      if (filtered.length > 0) {
        simulacoesComDados++
      } else {
        console.warn(`Sem dados: ${sim.fonte}/${sim.cenarios}/${sim.estrategias}`)
      }

      filtered.forEach((row) => {
        const tempo = row.Tempo
        uniqueTempos.add(tempo)

        if (!aggregated[tempo]) {
          aggregated[tempo] = { tempo, captada: 0, distribuida: 0, fontes: {} }
        }
        const vazaoCaptada = parseFloat(row.Vazao_Captada) || 0
        const vazaoDistribuida = vazaoCaptada * (1 - perdasValue)
        aggregated[tempo].captada += vazaoCaptada
        aggregated[tempo].distribuida += vazaoDistribuida
        if (!aggregated[tempo].fontes[sim.fonte]) {
          aggregated[tempo].fontes[sim.fonte] = 0
        }
        aggregated[tempo].fontes[sim.fonte] += vazaoCaptada
      })
    })

    setSimulationDetails(detailsArray)
    const uniqueTemposArray = Array.from(uniqueTempos)
    setProcessingInfo(
      `Total de ${totalRegistros} registros filtrados | Tempos únicos: ${uniqueTemposArray.length} | Simulações com dados: ${simulacoesComDados}/${simulacao.length}`,
    )

    const timeData = Object.values(aggregated)
    setTimeData(timeData)

    const chartA: any[] = []
    const chartB: any[] = []
    const chartC: any[] = []
    const chartD: any[] = []

    timeData.forEach((item: any) => {
      chartA.push({ tempo: item.tempo, ...item.fontes })
      const totalCaptada = item.captada
      const fontesPercent = Object.keys(item.fontes).map((fonte) => ({
        fonte,
        percent: (item.fontes[fonte] / totalCaptada) * 100,
      }))
      chartB.push({
        tempo: item.tempo,
        ...Object.fromEntries(fontesPercent.map((f) => [f.fonte, f.percent])),
      })
      chartC.push({ tempo: item.tempo, captada: item.captada, distribuida: item.distribuida })
      chartD.push({ tempo: item.tempo, distribuida: item.distribuida, demanda: demandaValue })
    })

    setChartDataA(chartA)
    setChartDataB(chartB)
    setChartDataC(chartC)
    setChartDataD(chartD)
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
                <TableHead>Cenários</TableHead>
                <TableHead>Estratégias</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {simulacao.map((sim, index) => (
                <TableRow key={index}>
                  <TableCell>{sim.fonte}</TableCell>
                  <TableCell>{sim.cenarios}</TableCell>
                  <TableCell>{sim.estrategias}</TableCell>
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
            <label>Perdas: Atual 30%, Meta 15%</label>
            <MySelect
              options={[
                { value: 'atual', label: 'Atual (30%)' },
                { value: 'meta', label: 'Meta (15%)' },
              ]}
              value={globalPerdas}
              onChange={setGlobalPerdas}
              placeholder="Selecione Perdas"
            />
          </div>
          <div>
            <label>Demanda: Tendencial 100, Acelerada 120, Reduzida 80</label>
            <MySelect
              options={[
                { value: 'tendencial', label: 'Tendencial (100)' },
                { value: 'acelerada', label: 'Acelerada (120)' },
                { value: 'reduzida', label: 'Reduzida (80)' },
              ]}
              value={globalDemanda}
              onChange={setGlobalDemanda}
              placeholder="Selecione Demanda"
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <input type="file" accept=".csv" onChange={handleFileUpload} />
          {csvError && <p className="text-red-500">{csvError}</p>}
          {csvPreview.length > 0 && (
            <Table>
              <TableHeader>
                <TableRow>
                  {Object.keys(csvPreview[0]).map((key) => (
                    <TableHead key={key}>{key}</TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {csvPreview.map((row, index) => (
                  <TableRow key={index}>
                    {Object.values(row).map((val, i) => (
                      <TableCell key={i}>{val}</TableCell>
                    ))}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Resumo</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fonte</TableHead>
                <TableHead>Cenários</TableHead>
                <TableHead>Estratégias</TableHead>
                <TableHead>Registros Encontrados</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {simulationDetails.map((detail, index) => (
                <TableRow key={index}>
                  <TableCell>{detail.fonte}</TableCell>
                  <TableCell>{detail.cenarios}</TableCell>
                  <TableCell>{detail.estrategias}</TableCell>
                  <TableCell>{detail.registrosEncontrados}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <p className="mt-4 text-sm text-gray-600">{processingInfo}</p>
        </CardContent>
      </Card>

      <Button onClick={handleSimulate} className="flex items-center gap-2">
        <Play size={16} />
        Simular
      </Button>

      <div className="grid grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>(A) Vazão Captada por Fonte vs Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartDataA}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tempo" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(chartDataA[0] || {})
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
            <CardTitle>(B) % por Fonte vs Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={chartDataB}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tempo" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(chartDataB[0] || {})
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
            <CardTitle>(C) Vazão Captada vs Distribuída</CardTitle>
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
            <CardTitle>(D) Vazão Total Distribuída vs Demanda</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={chartDataD}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tempo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line type="monotone" dataKey="distribuida" stroke="#82ca9d" />
                <Line type="monotone" dataKey="demanda" stroke="#ff7300" />
                <ReferenceLine y={0} stroke="red" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Cenarios
