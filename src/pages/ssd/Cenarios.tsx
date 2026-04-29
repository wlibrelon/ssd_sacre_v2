import React, { useState } from 'react'
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

interface DataPoint {
  date: string
  volume: number
  source: string
}

interface Filters {
  ano_inicio: number
  ano_fim: number
  mes: number | null
}

interface ChartDataPoint {
  date: string
  [key: string]: number | string
}

const initialData: DataPoint[] = [
  { date: '2023-01', volume: 1200, source: 'Rio Principal' },
  { date: '2023-01', volume: 800, source: 'Poço Auxiliar' },
  { date: '2023-01', volume: 400, source: 'Cisterna Reserva' },
  { date: '2023-02', volume: 1300, source: 'Rio Principal' },
  { date: '2023-02', volume: 900, source: 'Poço Auxiliar' },
  { date: '2023-02', volume: 500, source: 'Cisterna Reserva' },
  { date: '2023-03', volume: 1100, source: 'Rio Principal' },
  { date: '2023-03', volume: 700, source: 'Poço Auxiliar' },
  { date: '2023-03', volume: 300, source: 'Cisterna Reserva' },
  { date: '2024-01', volume: 1400, source: 'Rio Principal' },
  { date: '2024-01', volume: 1000, source: 'Poço Auxiliar' },
  { date: '2024-01', volume: 600, source: 'Cisterna Reserva' },
]

const CenariosDashboard: React.FC<{ data: DataPoint[] }> = ({ data }) => {
  const dates = Array.from(new Set(data.map((d) => d.date))).sort()
  const sources = Array.from(new Set(data.map((d) => d.source)))

  const colorMap: Record<string, string> = {
    'Rio Principal': '#ff7300',
    'Poço Auxiliar': '#8884d8',
    'Cisterna Reserva': '#82ca9d',
  }

  const chartData: ChartDataPoint[] = dates.map((date) => {
    const row: ChartDataPoint = { date }
    sources.forEach((source) => {
      const val = data.find((d) => d.date === date && d.source === source)?.volume || 0
      row[source] = val
    })
    return row
  })

  return (
    <div>
      <h2>Volume Captado (m³)</h2>
      <ResponsiveContainer width="100%" height={400}>
        <LineChart data={chartData} margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
          <CartesianGrid strokeDasharray="3 3" />
          <XAxis dataKey="date" />
          <YAxis unit=" m³" />
          <Tooltip />
          <Legend />
          {sources.map((source) => (
            <Line
              key={source}
              dataKey={source}
              stroke={colorMap[source] || '#8884d8'}
              dot={false}
              activeDot={{ r: 6 }}
              name={source}
            />
          ))}
        </LineChart>
      </ResponsiveContainer>
    </div>
  )
}

const Cenarios: React.FC = () => {
  const [data] = useState<DataPoint[]>(initialData)
  const [filters, setFilters] = useState<Filters>({
    ano_inicio: 2023,
    ano_fim: 2024,
    mes: null,
  })

  const years: number[] = [2022, 2023, 2024, 2025]
  const months: number[] = Array.from({ length: 12 }, (_, i) => i + 1)

  const filteredData: DataPoint[] = data.filter((d) => {
    const [yearStr, monthStr] = d.date.split('-')
    const year = +yearStr
    const month = +monthStr
    return (
      year >= filters.ano_inicio &&
      year <= filters.ano_fim &&
      (filters.mes === null || month === filters.mes)
    )
  })

  const handleFilterChange = (key: keyof Filters) => (e: React.ChangeEvent<HTMLSelectElement>) => {
    const value = e.target.value
    setFilters((prev) => ({
      ...prev,
      [key]: key === 'mes' ? (value === '' ? null : +value) : +value,
    }))
  }

  return (
    <div>
      <h1>Cenários</h1>
      <div className="filters">
        <label>
          Ano Início:
          <select value={filters.ano_inicio} onChange={handleFilterChange('ano_inicio')}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label>
          Ano Fim:
          <select value={filters.ano_fim} onChange={handleFilterChange('ano_fim')}>
            {years.map((y) => (
              <option key={y} value={y}>
                {y}
              </option>
            ))}
          </select>
        </label>
        <label>
          Mês:
          <select value={filters.mes ?? ''} onChange={handleFilterChange('mes')}>
            <option value="">Todos</option>
            {months.map((m) => (
              <option key={m} value={m}>
                {m.toString().padStart(2, '0')}
              </option>
            ))}
          </select>
        </label>
      </div>
      <CenariosDashboard data={filteredData} />
      <div style={{ marginTop: '20px' }}>
        <h3>Tabela de Conferência dos Dados Simulados</h3>
        <table style={{ width: '100%', borderCollapse: 'collapse', border: '1px solid #ddd' }}>
          <thead>
            <tr style={{ backgroundColor: '#f0f0f0' }}>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Data</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Fonte</th>
              <th style={{ border: '1px solid #ddd', padding: '8px' }}>Volume Captado (m³)</th>
            </tr>
          </thead>
          <tbody>
            {filteredData.map((d, i) => (
              <tr key={i}>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{d.date}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>{d.source}</td>
                <td style={{ border: '1px solid #ddd', padding: '8px' }}>
                  {d.volume.toLocaleString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default Cenarios
export { CenariosDashboard }
