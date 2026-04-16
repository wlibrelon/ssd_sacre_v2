import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from './ui/card'
import { Button } from './ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from './ui/table'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import html2canvas from 'html2canvas'

const Cenarios: React.FC = () => {
  const [csvData, setCsvData] = useState<any[]>([])
  const [timeData, setTimeData] = useState<any[]>([])
  const [simulationDetails, setSimulationDetails] = useState<any[]>([])
  const [summaryMetrics, setSummaryMetrics] = useState({
    mediaVazao: 0,
    mediaDemanda: 0,
    totalCapex: 0,
    totalOpex: 0,
    totalMeses: 0,
    deficitMonths: 0,
    excessoMonths: 0,
  })
  const [tabelaDeficit, setTabelaDeficit] = useState<any[]>([])
  const chartARef = useRef<HTMLDivElement>(null)
  const chartCRef = useRef<HTMLDivElement>(null)
  const chartDRef = useRef<HTMLDivElement>(null)
  const [demandaValue, setDemandaValue] = useState<number>(0)
  const [chartDataA, setChartDataA] = useState<any[]>([])
  const [chartDataB, setChartDataB] = useState<any[]>([])
  const [chartDataC, setChartDataC] = useState<any[]>([])
  const [chartDataD, setChartDataD] = useState<any[]>([])

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const rows = text.split('\n').map((row) => row.split(','))
        const headers = rows[0]
        const data = rows
          .slice(1)
          .map((row) => {
            const obj: any = {}
            headers.forEach((header, index) => {
              obj[header.trim()] = row[index]?.trim() || ''
            })
            return obj
          })
          .filter((row) => Object.values(row).some((val) => val !== ''))
        setCsvData(data)
      }
      reader.readAsText(file)
    }
  }

  const normalize = (data: any[]) => {
    if (data.length === 0) return []
    const keys = Object.keys(data[0])
    return data.map((row) => {
      const normalized: any = {}
      keys.forEach((key) => {
        normalized[key] = parseFloat(row[key]) || 0
      })
      return normalized
    })
  }

  const handleSimulate = () => {
    // Existing simulation logic here
    // Assuming setChartDataA, setChartDataB, setChartDataC, setChartDataD are set
    // After setChartDataD
    const mediaDistribuida =
      timeData.reduce((sum: number, t: any) => sum + t.distribuida, 0) / timeData.length
    const totalCapexValue = csvData.reduce(
      (sum: number, r: any) => sum + (parseFloat(r.CAPEX) || 0),
      0,
    )
    const totalOpexValue = csvData.reduce(
      (sum: number, r: any) => sum + (parseFloat(r.OPEX) || 0),
      0,
    )
    const deficitMonthsData = timeData.filter((t: any) => t.distribuida < demandaValue)
    setSummaryMetrics({
      mediaVazao: mediaDistribuida,
      mediaDemanda: demandaValue,
      totalCapex: totalCapexValue,
      totalOpex: totalOpexValue,
      totalMeses: timeData.length,
      deficitMonths: deficitMonthsData.length,
      excessoMonths: timeData.length - deficitMonthsData.length,
    })
    setTabelaDeficit(
      deficitMonthsData.map((t) => ({ tempo: t.tempo, saldo: t.distribuida - demandaValue })),
    )
  }

  const exportCSV = () => {
    const csvContent = [
      ['Tempo', 'Vazão Distribuída', 'Demanda', 'Saldo'],
      ...timeData.map((t) => [
        t.tempo,
        t.distribuida,
        demandaValue,
        (t.distribuida || 0) - demandaValue,
      ]),
    ]
    const rowsWithSummary = [
      ...csvContent,
      [],
      ['RESUMO EXECUTIVO'],
      ['Métrica', 'Valor'],
      ['Média Vazão Distribuída', summaryMetrics.mediaVazao.toFixed(2)],
      ['Média Demanda', summaryMetrics.mediaDemanda.toFixed(2)],
      ['Total CAPEX', summaryMetrics.totalCapex.toFixed(2)],
      ['Total OPEX', summaryMetrics.totalOpex.toFixed(2)],
      ['Total de Meses', summaryMetrics.totalMeses],
      ['Meses com Déficit', summaryMetrics.deficitMonths],
      ['Meses com Excedente', summaryMetrics.excessoMonths],
    ]
    const csv = rowsWithSummary.map((row) => row.join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'resultados_simulacao.csv'
    a.click()
    URL.revokeObjectURL(url)
  }

  const exportPNG = (ref: React.RefObject<HTMLDivElement>, filename: string) => {
    if (ref.current) {
      html2canvas(ref.current).then((canvas) => {
        const link = document.createElement('a')
        link.download = filename
        link.href = canvas.toDataURL('image/png')
        link.click()
      })
    }
  }

  return (
    <div className="container mx-auto p-4">
      {/* Upload CSV */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <input type="file" accept=".csv" onChange={handleFileUpload} />
        </CardContent>
      </Card>

      {/* Parâmetros Globais */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Parâmetros Globais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Demanda</label>
            <input
              type="number"
              value={demandaValue}
              onChange={(e) => setDemandaValue(parseFloat(e.target.value) || 0)}
              className="border rounded p-2 w-full"
            />
          </div>
        </CardContent>
      </Card>

      {/* Summary Dashboard Cards */}
      {timeData.length > 0 && (
        <>
          <div className="grid grid-cols-7 gap-4 mb-6">
            <Card className="bg-blue-50 border-l-4 border-l-blue-500">
              <CardContent className="pt-6">
                <div className="text-sm font-semibold text-gray-600">Média Vazão Distribuída</div>
                <div className="text-2xl font-bold text-blue-600 mt-2">
                  {summaryMetrics.mediaVazao.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-green-50 border-l-4 border-l-green-500">
              <CardContent className="pt-6">
                <div className="text-sm font-semibold text-gray-600">Média Demanda</div>
                <div className="text-2xl font-bold text-green-600 mt-2">
                  {summaryMetrics.mediaDemanda.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-orange-50 border-l-4 border-l-orange-500">
              <CardContent className="pt-6">
                <div className="text-sm font-semibold text-gray-600">Total CAPEX</div>
                <div className="text-2xl font-bold text-orange-600 mt-2">
                  {summaryMetrics.totalCapex.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-red-50 border-l-4 border-l-red-500">
              <CardContent className="pt-6">
                <div className="text-sm font-semibold text-gray-600">Total OPEX</div>
                <div className="text-2xl font-bold text-red-600 mt-2">
                  {summaryMetrics.totalOpex.toFixed(2)}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-gray-50 border-l-4 border-l-gray-500">
              <CardContent className="pt-6">
                <div className="text-sm font-semibold text-gray-600">Total de Meses</div>
                <div className="text-2xl font-bold text-gray-600 mt-2">
                  {summaryMetrics.totalMeses}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-amber-50 border-l-4 border-l-amber-700">
              <CardContent className="pt-6">
                <div className="text-sm font-semibold text-gray-600">Meses com Déficit</div>
                <div className="text-2xl font-bold text-amber-700 mt-2">
                  {summaryMetrics.deficitMonths}
                </div>
              </CardContent>
            </Card>
            <Card className="bg-emerald-50 border-l-4 border-l-emerald-700">
              <CardContent className="pt-6">
                <div className="text-sm font-semibold text-gray-600">Meses com Excedente</div>
                <div className="text-2xl font-bold text-emerald-700 mt-2">
                  {summaryMetrics.excessoMonths}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Deficit Table */}
          {tabelaDeficit.length > 0 && (
            <Card className="mb-6">
              <CardHeader>
                <CardTitle>Meses com Déficit</CardTitle>
              </CardHeader>
              <CardContent>
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Tempo</TableHead>
                      <TableHead>Saldo (Distribuída - Demanda)</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {tabelaDeficit.map((row, index) => (
                      <TableRow key={index}>
                        <TableCell>{row.tempo}</TableCell>
                        <TableCell className="text-red-600 font-semibold">
                          {row.saldo.toFixed(2)}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          )}

          {/* Export Buttons */}
          <div className="flex gap-2 mb-6">
            <Button onClick={exportCSV} className="bg-green-600 hover:bg-green-700">
              📥 Exportar CSV
            </Button>
            <Button
              onClick={() => exportPNG(chartARef, 'graficoA.png')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              📊 Exportar Gráfico A (PNG)
            </Button>
            <Button
              onClick={() => exportPNG(chartCRef, 'graficoC.png')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              📊 Exportar Gráfico C (PNG)
            </Button>
            <Button
              onClick={() => exportPNG(chartDRef, 'graficoD.png')}
              className="bg-blue-600 hover:bg-blue-700"
            >
              📊 Exportar Gráfico D (PNG)
            </Button>
          </div>
        </>
      )}

      <Button onClick={handleSimulate} className="mb-6">
        Simular
      </Button>

      {/* Gráfico A */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>(A) Vazão Captada por Fonte vs Tempo</CardTitle>
        </CardHeader>
        <CardContent ref={chartARef}>
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
                    dot={false}
                  />
                ))}
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico B */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>(B) Vazão Distribuída vs Tempo</CardTitle>
        </CardHeader>
        <CardContent>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartDataB}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tempo" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="distribuida" stroke="#8884d8" />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico C */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>(C) Demanda vs Tempo</CardTitle>
        </CardHeader>
        <CardContent ref={chartCRef}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartDataC}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tempo" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="demanda" stroke="#82ca9d" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Gráfico D */}
      <Card className="mb-6">
        <CardHeader>
          <CardTitle>(D) Saldo vs Tempo</CardTitle>
        </CardHeader>
        <CardContent ref={chartDRef}>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={chartDataD}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="tempo" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="saldo" stroke="#ffc658" dot={false} />
            </LineChart>
          </ResponsiveContainer>
        </CardContent>
      </Card>

      {/* Tabela de Simulação */}
      <Card>
        <CardHeader>
          <CardTitle>Tabela de Simulação</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Tempo</TableHead>
                <TableHead>Vazão Distribuída</TableHead>
                <TableHead>Demanda</TableHead>
                <TableHead>Saldo</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {timeData.map((row, index) => (
                <TableRow key={index}>
                  <TableCell>{row.tempo}</TableCell>
                  <TableCell>{row.distribuida}</TableCell>
                  <TableCell>{demandaValue}</TableCell>
                  <TableCell>{(row.distribuida || 0) - demandaValue}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default Cenarios
