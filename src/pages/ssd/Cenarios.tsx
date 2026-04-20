import Papa from 'papaparse'
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
import { Play, Download } from 'lucide-react'
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
} from 'recharts'

const PERDAS = { atual: 0.3, meta: 0.15 }
const DEMANDAS = { tendencial: 100, acelerada: 120, reduzida: 80 }

const MySelect = ({ options, value, onChange, placeholder }) => (
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

const formatNumber = (value: number): string => {
  return value.toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
}

const Cenarios: React.FC = () => {
  const [demandaCenario, setDemandaCenario] = useState<string>('Estagnação Populacional')
  const [demandaConsumo, setDemandaConsumo] = useState<string>('Estável - 215 L/pcd')
  const [perdas, setPerdas] = useState<string>('30%')

  const { simulacao, demandaPerdasList = [], setDemandaPerdas } = useSimulationStore()
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
  const [dashboardMetrics, setDashboardMetrics] = useState<any>(null)
  const [deficitMonths, setDeficitMonths] = useState<any[]>([])

  const normalize = (str: string): string => {
    return str.trim().toLowerCase().replace(/\s+/g, ' ')
  }

  const exportToCSV = (data: any[], filename: string) => {
    if (!data || data.length === 0) {
      alert('Nenhum dado para exportar')
      return
    }

    const headers = Object.keys(data[0])
    const csvContent = [
      headers.join(','),
      ...data.map((row) => headers.map((header) => row[header] || '').join(',')),
    ].join('\n')

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' })
    const link = document.createElement('a')
    const url = URL.createObjectURL(blob)
    link.setAttribute('href', url)
    link.setAttribute('download', `${filename}.csv`)
    link.style.visibility = 'hidden'
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
  }

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setSelectedFile(file)
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n')
      const headers = lines[0].split(',').map((h) => h.trim())

      console.log('Headers parseados:', headers)

      const data = lines
        .slice(1)
        .map((line) => {
          const values = line.split(',')
          const obj: any = {}
          headers.forEach((header, index) => {
            const rawValue = values[index]?.trim() || ''
            obj[header] = rawValue
          })
          return obj
        })
        .filter((row) => Object.values(row).some((val) => val !== ''))

      setCsvData(data)
      setCsvPreview(data.slice(0, 5))
      setCsvError('')

      console.log('Amostra de dados parseados:', data.slice(0, 2))
    }
    reader.readAsText(file)
  }

  const handleSimulate = () => {
    if (!csvData.length) {
      alert('CSV vazio!')
      return
    }

    let totalRegistros = 0
    let simulacoesComDados = 0
    const detailsArray = []
    const uniqueTempos = new Set<string>()

    const perdasValue = PERDAS[globalPerdas as keyof typeof PERDAS]
    const demandaValue = DEMANDAS[globalDemanda as keyof typeof DEMANDAS]
    const aggregated: any = {}
    let totalCapex = 0
    let totalOpex = 0
    let totalCaptada = 0
    let totalDistribuida = 0
    const deficitList: any[] = []

    simulacao.forEach((sim) => {
      const fonteNorm = normalize(sim.fonte)
      const cenarioNorm = normalize(sim.cenarios)
      const estrategiaNorm = normalize(sim.estrategias)

      console.log(
        `Filtrando: Fonte=[${fonteNorm}], Cenario=[${cenarioNorm}], Estrategia=[${estrategiaNorm}]`,
      )

      const filtered = csvData.filter((row) => {
        const rowFonteNorm = normalize(row.Fonte || '')
        const rowCenarioNorm = normalize(row.cenario || '')
        const rowEstrategiaNorm = normalize(row.estrategia || '')

        return (
          rowFonteNorm === fonteNorm &&
          rowCenarioNorm === cenarioNorm &&
          rowEstrategiaNorm === estrategiaNorm
        )
      })

      console.log(`Registros encontrados: ${filtered.length}`)

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
          aggregated[tempo] = { tempo, captada: 0, distribuida: 0, fontes: {}, capex: 0, opex: 0 }
        }

        const vazaoCaptada = parseFloat(row.Vazao_Captada) || 0
        const vazaoDistribuida = vazaoCaptada * (1 - perdasValue)
        const capex = parseFloat(row.CAPEX) || 0
        const opex = parseFloat(row.OPEX) || 0

        aggregated[tempo].captada += vazaoCaptada
        aggregated[tempo].distribuida += vazaoDistribuida
        aggregated[tempo].capex += capex
        aggregated[tempo].opex += opex
        totalCapex += capex
        totalOpex += opex
        totalCaptada += vazaoCaptada
        totalDistribuida += vazaoDistribuida

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

    let mesesComDeficit = 0
    let mesesComExcedente = 0

    timeData.forEach((item: any) => {
      const saldo = item.distribuida - demandaValue

      if (saldo < 0) {
        mesesComDeficit++
        deficitList.push({
          tempo: item.tempo,
          deficit: Math.abs(saldo),
          distribuida: item.distribuida,
          demanda: demandaValue,
        })
      } else if (saldo > 0) {
        mesesComExcedente++
      }
    })

    const mediaCaptada = totalCaptada / timeData.length
    const mediaDistribuida = totalDistribuida / timeData.length
    const mediaDemanda = demandaValue

    setDashboardMetrics({
      mediaCaptada: mediaCaptada.toFixed(2),
      mediaDistribuida: mediaDistribuida.toFixed(2),
      mediaDemanda: mediaDemanda.toFixed(2),
      totalCapex: totalCapex.toFixed(2),
      totalOpex: totalOpex.toFixed(2),
      totalMeses: timeData.length,
      mesesComDeficit,
      mesesComExcedente,
    })

    setDeficitMonths(deficitList)

    const chartA: any[] = []
    const chartB: any[] = []
    const chartC: any[] = []
    const chartD: any[] = []

    timeData.forEach((item: any) => {
      chartA.push({ tempo: item.tempo, ...item.fontes })
      const totalCaptadaItem = item.captada
      const fontesPercent = Object.keys(item.fontes).map((fonte) => ({
        fonte,
        percent: (item.fontes[fonte] / totalCaptadaItem) * 100,
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
          <CardTitle>Cenários para Simulação</CardTitle>
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
          <CardTitle>Configuração de Demanda e Perdas</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-6">
            <div className="grid md:grid-cols-2 gap-6 mb-4">
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Demanda de consumo</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Cenários</label>
                  <select
                    value={demandaCenario}
                    onChange={(e) => setDemandaCenario(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Estagnação Populacional">Estagnação Populacional</option>
                    <option value="Crescimento Tendencial">Crescimento Tendencial</option>
                    <option value="Crescimento Acelerado">Crescimento Acelerado</option>
                  </select>
                </div>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Consumo</label>
                  <select
                    value={demandaConsumo}
                    onChange={(e) => setDemandaConsumo(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="Crescente - até 250 L/pcd">Crescente - até 250 L/pcd</option>
                    <option value="Estável - 215 L/pcd">Estável - 215 L/pcd</option>
                    <option value="Decrescente - até 180 L/pcd">Decrescente - até 180 L/pcd</option>
                  </select>
                </div>
              </div>
              <div className="bg-white p-4 rounded-lg shadow-md">
                <h3 className="text-lg font-semibold mb-4">Cenários de Perdas</h3>
                <div className="mb-4">
                  <label className="block text-sm font-medium mb-2">Índice de Perdas</label>
                  <select
                    value={perdas}
                    onChange={(e) => setPerdas(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                  >
                    <option value="30%">30%</option>
                    <option value="28%">28%</option>
                    <option value="26%">26%</option>
                    <option value="24%">24%</option>
                  </select>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Importação de dados para simulação</CardTitle>
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

      <Button onClick={handleSimulate} className="flex items-center gap-2">
        <Play size={16} />
        Simular
      </Button>

      {dashboardMetrics && (
        <div className="space-y-4">
          <div className="grid grid-cols-5 gap-4">
            <Card className="bg-gradient-to-br from-blue-50 to-blue-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Média Captada (m3)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-blue-600">
                  {formatNumber(parseFloat(dashboardMetrics.mediaCaptada))}
                </div>
                <p className="text-xs text-gray-500 mt-1">m³/s</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-cyan-50 to-cyan-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Média Distribuída (m3)
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-cyan-600">
                  {formatNumber(parseFloat(dashboardMetrics.mediaDistribuida))}
                </div>
                <p className="text-xs text-gray-500 mt-1">m³/s</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-green-50 to-green-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Média Demanda</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-green-600">
                  {formatNumber(parseFloat(dashboardMetrics.mediaDemanda))}
                </div>
                <p className="text-xs text-gray-500 mt-1">m³/s</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-orange-50 to-orange-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total CAPEX</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-orange-600">
                  {formatNumber(parseFloat(dashboardMetrics.totalCapex))}
                </div>
                <p className="text-xs text-gray-500 mt-1">R$</p>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-red-50 to-red-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total OPEX</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-red-600">
                  {formatNumber(parseFloat(dashboardMetrics.totalOpex))}
                </div>
                <p className="text-xs text-gray-500 mt-1">R$</p>
              </CardContent>
            </Card>
          </div>

          <div className="grid grid-cols-3 gap-4">
            <Card className="bg-gradient-to-br from-purple-50 to-purple-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">Total de Meses</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-purple-600">
                  {dashboardMetrics.totalMeses}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Meses com Déficit
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-yellow-600">
                  {dashboardMetrics.mesesComDeficit}
                </div>
              </CardContent>
            </Card>

            <Card className="bg-gradient-to-br from-teal-50 to-teal-100">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-gray-600">
                  Meses com Excedente
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold text-teal-600">
                  {dashboardMetrics.mesesComExcedente}
                </div>
              </CardContent>
            </Card>
          </div>

          {deficitMonths.length > 0 && (
            <Card>
              <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle>Meses e Anos com Déficit</CardTitle>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => exportToCSV(deficitMonths, 'deficit_months')}
                  className="flex items-center gap-2"
                >
                  <Download size={16} />
                  Exportar
                </Button>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tempo</TableHead>
                      <TableHead>Volume Distribuído</TableHead>
                      <TableHead>Demanda</TableHead>
                      <TableHead>Déficit</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {deficitMonths.map((month, index) => (
                      <TableRow key={index}>
                        <TableCell>{month.tempo}</TableCell>
                        <TableCell>{formatNumber(month.distribuida)}</TableCell>
                        <TableCell>{formatNumber(month.demanda)}</TableCell>
                        <TableCell className="text-red-600 font-bold">
                          {formatNumber(month.deficit)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>(A) Volume Captado por Fonte vs Tempo</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportToCSV(chartDataA, 'grafico_a')}
              className="flex items-center gap-2"
            >
              <Download size={16} />
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer
              width="100%"
              height={300}
              margin={{ left: 80, right: 30, top: 20, bottom: 20 }}
            >
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
                      dot={false}
                      isAnimationActive={false}
                    />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>(B) % por Fonte vs Tempo</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportToCSV(chartDataB, 'grafico_b')}
              className="flex items-center gap-2"
            >
              <Download size={16} />
            </Button>
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
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>(C) Volume Captado vs Distribuído</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportToCSV(chartDataC, 'grafico_c')}
              className="flex items-center gap-2"
            >
              <Download size={16} />
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer
              width="100%"
              height={300}
              margin={{ left: 80, right: 30, top: 20, bottom: 20 }}
            >
              <LineChart data={chartDataC}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tempo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="captada"
                  stroke="#8884d8"
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="distribuida"
                  stroke="#82ca9d"
                  dot={false}
                  isAnimationActive={false}
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>(D) Volume Total Distribuído vs Demanda</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportToCSV(chartDataD, 'grafico_d')}
              className="flex items-center gap-2"
            >
              <Download size={16} />
            </Button>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer
              width="100%"
              height={300}
              margin={{ left: 80, right: 30, top: 20, bottom: 20 }}
            >
              <LineChart data={chartDataD}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="tempo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="distribuida"
                  stroke="#82ca9d"
                  dot={false}
                  isAnimationActive={false}
                />
                <Line
                  type="monotone"
                  dataKey="demanda"
                  stroke="#ff7300"
                  dot={false}
                  isAnimationActive={false}
                />
                <ReferenceLine y={0} stroke="red" />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {timeData.length > 0 && (
        <Card>
          <CardHeader className="flex flex-row items-center justify-between">
            <CardTitle>Tabela Completa de Dados Processados</CardTitle>
            <Button
              size="sm"
              variant="outline"
              onClick={() => exportToCSV(timeData, 'dados_processados_completos')}
              className="flex items-center gap-2"
            >
              <Download size={16} />
              Exportar
            </Button>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tempo</TableHead>
                    <TableHead>Volume Captado</TableHead>
                    <TableHead>Volume Distribuído</TableHead>
                    <TableHead>CAPEX</TableHead>
                    <TableHead>OPEX</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {timeData.map((row, index) => (
                    <TableRow key={index}>
                      <TableCell>{row.tempo}</TableCell>
                      <TableCell>{formatNumber(row.captada)}</TableCell>
                      <TableCell>{formatNumber(row.distribuida)}</TableCell>
                      <TableCell>{formatNumber(row.capex)}</TableCell>
                      <TableCell>{formatNumber(row.opex)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

const [loadedFromFile, setLoadedFromFile] = useState(false)
const [availableOptions, setAvailableOptions] = useState<string[]>([])
const [selectedScenario, setSelectedScenario] = useState<string>('')

useEffect(() => {
  const loadCsv = async () => {
    try {
      const response = await fetch('/cenarios.csv')
      const csvText = await response.text()
      Papa.parse(csvText, {
        header: true,
        complete: (results: any) => {
          const allData = results.data.filter(
            (row: any) => row.Fonte && row.cenario && row.estrategia,
          )
          setCsvData(allData)
          setLoadedFromFile(true)
          // Gerar opções únicas concatenadas
          const uniqueOptions = Array.from(
            new Set(allData.map((row: any) => `${row.Fonte} | ${row.cenario} | ${row.estrategia}`)),
          )
          setAvailableOptions(uniqueOptions as string[])
          console.log('✅ CSV carregado automaticamente:', uniqueOptions.length, 'opções')
        },
        error: (error: any) => {
          console.error('❌ Erro ao parsear CSV:', error)
        },
      })
    } catch (error) {
      console.error('❌ Erro ao buscar CSV:', error)
    }
  }
  loadCsv()
}, [])

const handleScenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
  const selected = e.target.value
  setSelectedScenario(selected)
  if (selected) {
    const [fonte, cenario, estrategia] = selected.split(' | ')
    const filtered = csvData.filter(
      (row: any) =>
        normalize(row.Fonte) === normalize(fonte) &&
        normalize(row.cenario) === normalize(cenario) &&
        normalize(row.estrategia) === normalize(estrategia),
    )
    setCsvData(filtered)
    console.log(`✅ Filtrado: ${filtered.length} registros para ${selected}`)
  }
}
export default Cenarios
