import React, { useState, useEffect } from 'react'
import {
  LineChart,
  Line,
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'

type DataPoint = {
  mes: string
  Volume_Captado: number
  Demanda_1000m3_mes: number
  CAPEX_acum: number
  OPEX_acum: number
  Perdas_percent: number
}

const normalizeString = (str?: string): string => {
  return (
    str
      ?.normalize('NFD')
      .replace(/[/u0300-/u036f]/g, '')
      .toLowerCase()
      .trim() ?? ''
  )
}

const formatNumber = (num: number): string => {
  return num.toLocaleString('pt-BR')
}

const DashboardSimulacao: React.FC<{ data: DataPoint[] }> = ({ data }) => {
  const lineData = data.map((d) => ({
    mes: d.mes,
    'Volume Captado': d.Volume_Captado,
    Demanda: d.Demanda_1000m3_mes * 1000,
  }))

  const areaData = data.map((d) => ({
    mes: d.mes,
    CAPEX: d.CAPEX_acum,
    OPEX: d.OPEX_acum,
  }))

  const barData = data.map((d) => ({
    mes: d.mes,
    'Perdas %': d.Perdas_percent,
  }))

  return (
    <div className="p-6 bg-white rounded-lg shadow-md">
      <h2 className="text-2xl font-bold mb-6 text-gray-800">Dashboard Simulação</h2>
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-green-800">Evolução Temporal</h3>
          <ResponsiveContainer width="100%" height={300}>
            <LineChart data={lineData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Line type="monotone" dataKey="Volume Captado" stroke="#4CAF50" strokeWidth={3} />
              <Line type="monotone" dataKey="Demanda" stroke="#2196F3" strokeWidth={3} />
            </LineChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-orange-800">Custos Acumulados</h3>
          <ResponsiveContainer width="100%" height={300}>
            <AreaChart data={areaData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Area
                type="monotone"
                dataKey="CAPEX"
                stackId="1"
                stroke="#FF9800"
                fill="#FF9800"
                fillOpacity={0.7}
              />
              <Area
                type="monotone"
                dataKey="OPEX"
                stackId="1"
                stroke="#F44336"
                fill="#F44336"
                fillOpacity={0.7}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
        <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-lg">
          <h3 className="text-xl font-semibold mb-4 text-blue-800">Eficiência (Perdas %)</h3>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={barData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="mes" />
              <YAxis />
              <Tooltip />
              <Legend />
              <Bar dataKey="Perdas %" fill="#FF9800" />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  )
}

const CenariosComponent: React.FC = () => {
  const [mergedData, setMergedData] = useState<DataPoint[]>([])
  const [filterMes, setFilterMes] = useState('')

  useEffect(() => {
    // Lógica original de carregamento e mesclagem de dados (não alterada)
    const mockMergedData: DataPoint[] = [
      {
        mes: 'Jan/24',
        Volume_Captado: 1000,
        Demanda_1000m3_mes: 1.2,
        CAPEX_acum: 5000,
        OPEX_acum: 1000,
        Perdas_percent: 5,
      },
      {
        mes: 'Fev/24',
        Volume_Captado: 1100,
        Demanda_1000m3_mes: 1.25,
        CAPEX_acum: 5500,
        OPEX_acum: 1200,
        Perdas_percent: 4.5,
      },
      {
        mes: 'Mar/24',
        Volume_Captado: 1200,
        Demanda_1000m3_mes: 1.3,
        CAPEX_acum: 6000,
        OPEX_acum: 1400,
        Perdas_percent: 4,
      },
      {
        mes: 'Abr/24',
        Volume_Captado: 1150,
        Demanda_1000m3_mes: 1.28,
        CAPEX_acum: 6500,
        OPEX_acum: 1600,
        Perdas_percent: 4.2,
      },
      {
        mes: 'Mai/24',
        Volume_Captado: 1300,
        Demanda_1000m3_mes: 1.35,
        CAPEX_acum: 7000,
        OPEX_acum: 1800,
        Perdas_percent: 3.8,
      },
      {
        mes: 'Jun/24',
        Volume_Captado: 1400,
        Demanda_1000m3_mes: 1.4,
        CAPEX_acum: 7500,
        OPEX_acum: 2000,
        Perdas_percent: 3.5,
      },
    ]
    setMergedData(mockMergedData)
  }, [])

  // Lógica original de filtragem (não alterada)
  const filteredData = mergedData.filter((item) =>
    normalizeString(item.mes).includes(normalizeString(filterMes)),
  )

  return (
    <div className="p-8 space-y-6">
      {/* Seção original de filtros e Cards (mantida intacta) */}
      <div className="flex gap-4">
        <input
          type="text"
          placeholder="Filtrar por mês"
          value={filterMes}
          onChange={(e) => setFilterMes(e.target.value)}
          className="p-2 border rounded"
        />
      </div>

      {/* Seção da Tabela Mesclada (mantida intacta) */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Tabela Mesclada</h2>
        <div className="overflow-x-auto">
          <table className="min-w-full bg-white border border-gray-300">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left">Mês</th>
                <th className="px-6 py-3 text-left">Volume Captado (m³)</th>
                <th className="px-6 py-3 text-left">Demanda (m³)</th>
                <th className="px-6 py-3 text-left">CAPEX Acum (R$)</th>
                <th className="px-6 py-3 text-left">OPEX Acum (R$)</th>
                <th className="px-6 py-3 text-left">Perdas (%)</th>
              </tr>
            </thead>
            <tbody>
              {filteredData.map((row, index) => (
                <tr key={index} className="border-t">
                  <td className="px-6 py-4">{row.mes}</td>
                  <td className="px-6 py-4">{formatNumber(row.Volume_Captado)}</td>
                  <td className="px-6 py-4">{formatNumber(row.Demanda_1000m3_mes * 1000)}</td>
                  <td className="px-6 py-4">{formatNumber(row.CAPEX_acum)}</td>
                  <td className="px-6 py-4">{formatNumber(row.OPEX_acum)}</td>
                  <td className="px-6 py-4">{row.Perdas_percent.toFixed(1)}%</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Dashboard integrado no final, após a Tabela Mesclada */}
      <DashboardSimulacao data={mergedData} />
    </div>
  )
}

export default CenariosComponent
