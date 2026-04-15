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
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
  ComposedChart,
  ReferenceLine,
} from 'recharts'
import { useStore } from '@/store' // Assuming a store hook, e.g., Zustand

type CsvRow = {
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

type Simulation = {
  id: string
  fonte: string
  cenario: string
  estrategia: string
  // Add other fields as needed
}

const Cenarios: React.FC = () => {
  const { simulations } = useStore() // Assuming store has simulations array
  const [csvData, setCsvData] = useState<CsvRow[]>([])
  const [perdas, setPerdas] = useState<number>(0.3)
  const [demandaGlobal, setDemandaGlobal] = useState<number>(100)
  const [filteredData, setFilteredData] = useState<CsvRow[]>([])
  const [preview, setPreview] = useState<string[]>([])
  const [error, setError] = useState<string>('')

  const requiredColumns = [
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

  const handleFileUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (e) => {
      const text = e.target?.result as string
      const lines = text.split('\n')
      setPreview(lines.slice(0, 5))
      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
      const missing = requiredColumns.filter((col) => !headers.includes(col.toLowerCase()))
      if (missing.length > 0) {
        setError(`Missing columns: ${missing.join(', ')}`)
        return
      }
      setError('')
      const data: CsvRow[] = lines
        .slice(1)
        .map((line) => {
          const values = line.split(',')
          return {
            Tempo: values[0],
            Fonte: values[1],
            cenario: values[2],
            estrategia: values[3],
            Vazao_Captada: parseFloat(values[4]),
            Demanda: parseFloat(values[5]),
            CAPEX: parseFloat(values[6]),
            OPEX: parseFloat(values[7]),
            Aceitacao_Social: parseFloat(values[8]),
          }
        })
        .filter((row) => !isNaN(row.Vazao_Captada)) // Basic validation
      setCsvData(data)
    }
    reader.readAsText(file)
  }

  useEffect(() => {
    if (simulations.length === 0 || csvData.length === 0) return
    const processed = simulations.map((sim) => {
      const filtered = csvData.filter(
        (row) =>
          row.Fonte.toLowerCase() === sim.fonte.toLowerCase() &&
          row.cenario.toLowerCase() === sim.cenario.toLowerCase() &&
          row.estrategia.toLowerCase() === sim.estrategia.toLowerCase(),
      )
      console.log(`Simulation ${sim.id}: ${filtered.length} records found`)
      return {
        ...sim,
        records: filtered,
        vazaoDistribuida: filtered.map((r) => ({
          ...r,
          Vazao_Distribuida: r.Vazao_Captada * (1 - perdas),
        })),
      }
    })
    setFilteredData(processed.flatMap((p) => p.records))
  }, [simulations, csvData, perdas])

  // Prepare data for charts
  const chart1Data = filteredData.reduce((acc, row) => {
    const existing = acc.find((d) => d.Tempo === row.Tempo)
    if (existing) {
      existing[row.Fonte] = row.Vazao_Captada
    } else {
      acc.push({ Tempo: row.Tempo, [row.Fonte]: row.Vazao_Captada })
    }
    return acc
  }, [] as any[])

  const chart2Data = filteredData.reduce((acc, row) => {
    const existing = acc.find((d) => d.Tempo === row.Tempo)
    if (existing) {
      existing[row.Fonte] = (row.Vazao_Captada / existing.total) * 100
      existing.total += row.Vazao_Captada
    } else {
      acc.push({ Tempo: row.Tempo, [row.Fonte]: 100, total: row.Vazao_Captada }) // Simplified for single
    }
    return acc
  }, [] as any[])

  const chart3Data = filteredData.map((row) => ({
    Tempo: row.Tempo,
    Vazao_Captada: row.Vazao_Captada,
    Vazao_Distribuida: row.Vazao_Captada * (1 - perdas),
  }))

  const chart4Data = filteredData.reduce((acc, row) => {
    const existing = acc.find((d) => d.Tempo === row.Tempo)
    if (existing) {
      existing.Vazao_Total_Distribuida += row.Vazao_Captada * (1 - perdas)
    } else {
      acc.push({
        Tempo: row.Tempo,
        Vazao_Total_Distribuida: row.Vazao_Captada * (1 - perdas),
        Demanda: demandaGlobal,
      })
    }
    return acc
  }, [] as any[])

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Simulação Table</CardTitle>
        </CardHeader>
        <CardContent>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Fonte</th>
                <th className="border border-gray-300 p-2">Cenário</th>
                <th className="border border-gray-300 p-2">Estratégia</th>
                {/* Add more columns as needed */}
              </tr>
            </thead>
            <tbody>
              {simulations.map((sim) => (
                <tr key={sim.id}>
                  <td className="border border-gray-300 p-2">{sim.fonte}</td>
                  <td className="border border-gray-300 p-2">{sim.cenario}</td>
                  <td className="border border-gray-300 p-2">{sim.estrategia}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Parâmetros Globais</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <Select value={perdas.toString()} onValueChange={(v) => setPerdas(parseFloat(v))}>
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Perdas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="0.3">30%</SelectItem>
                <SelectItem value="0.15">15%</SelectItem>
              </SelectContent>
            </Select>
            <Select
              value={demandaGlobal.toString()}
              onValueChange={(v) => setDemandaGlobal(parseFloat(v))}
            >
              <SelectTrigger className="w-32">
                <SelectValue placeholder="Demanda" />
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

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <input type="file" accept=".csv" onChange={handleFileUpload} />
          {error && <p className="text-red-500">{error}</p>}
          {preview.length > 0 && (
            <div>
              <h4>Preview:</h4>
              <pre>{preview.join('\n')}</pre>
            </div>
          )}
        </CardContent>
      </Card>

      <Card className="mt-4">
        <CardHeader>
          <CardTitle>Resumo de Processamento</CardTitle>
        </CardHeader>
        <CardContent>
          {simulations.map((sim) => {
            const count = csvData.filter(
              (row) =>
                row.Fonte.toLowerCase() === sim.fonte.toLowerCase() &&
                row.cenario.toLowerCase() === sim.cenario.toLowerCase() &&
                row.estrategia.toLowerCase() === sim.estrategia.toLowerCase(),
            ).length
            return (
              <p key={sim.id}>
                {count > 0
                  ? `${count} registros encontrados para ${sim.fonte}, ${sim.cenario}, ${sim.estrategia}`
                  : `Nenhum registro encontrado para ${sim.fonte}, ${sim.cenario}, ${sim.estrategia}`}
              </p>
            )
          })}
        </CardContent>
      </Card>

      <div className="grid grid-cols-2 gap-4 mt-4">
        <Card>
          <CardHeader>
            <CardTitle>Chart 1: Tempo vs Vazao_Captada por Fonte</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chart1Data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Tempo" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(chart1Data[0] || {})
                  .filter((k) => k !== 'Tempo')
                  .map((fonte) => (
                    <Line key={fonte} type="monotone" dataKey={fonte} stroke="#8884d8" />
                  ))}
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chart 2: % por Fonte por Tempo</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chart2Data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Tempo" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Object.keys(chart2Data[0] || {})
                  .filter((k) => k !== 'Tempo' && k !== 'total')
                  .map((fonte) => (
                    <Bar key={fonte} dataKey={fonte} stackId="a" fill="#8884d8" />
                  ))}
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Chart 3: Vazao_Captada vs Vazao_Distribuida</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <LineChart data={chart3Data}>
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
            <CardTitle>Chart 4: Vazao_Total_Distribuida vs Demanda</CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={chart4Data}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Tempo" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Bar dataKey="Vazao_Total_Distribuida" fill="#8884d8" />
                <Line type="monotone" dataKey="Demanda" stroke="#ff7300" />
                <ReferenceLine y={0} stroke="#000" />
              </ComposedChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Cenarios
