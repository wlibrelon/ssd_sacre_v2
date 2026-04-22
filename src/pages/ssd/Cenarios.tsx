import React, { useState, useEffect, ChangeEvent } from 'react'
import Papa from 'papaparse'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  ScatterChart,
  Scatter,
  BarChart,
  Bar,
} from 'recharts'

type Record = { [key: string]: string }

type SimulationRecord = {
  mes: number
  vazao_captada: number
  demanda_1000m3_mes: number
  perdas_pct: number
  demanda_m3_mes: number
  deficit: number
  superavit: number
}

const CenariosComponent: React.FC = () => {
  // Cenários states
  const [cenariosData, setCenariosData] = useState<Record[]>([])
  const [cenariosColumns, setCenariosColumns] = useState<string[]>([])
  const [vazaoColumn, setVazaoColumn] = useState('')
  const [normalizeFactor, setNormalizeFactor] = useState(30)

  // Demanda states
  const [demandaData, setDemandaData] = useState<Record[]>([])
  const [demandaColumns, setDemandaColumns] = useState<string[]>([])
  const [demandaColumn, setDemandaColumn] = useState('')

  // Perdas states
  const [perdasData, setPerdasData] = useState<Record[]>([])
  const [perdasColumns, setPerdasColumns] = useState<string[]>([])
  const [perdasColumn, setPerdasColumn] = useState('')

  // Filtered data states (kept for original structure)
  const [filteredData, setFilteredData] = useState<any[]>([])
  const [demandaFilteredData, setDemandaFilteredData] = useState<any[]>([])
  const [perdasFilteredData, setPerdasFilteredData] = useState<any[]>([])

  // Dashboard
  const [showDashboard, setShowDashboard] = useState(false)
  const [mergedSimulationData, setMergedSimulationData] = useState<SimulationRecord[]>([])

  const handleCenariosUpload = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const data = results.data as Record[]
        setCenariosData(data)
      },
    })
  }

  const handleDemandaUpload = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const data = results.data as Record[]
        setDemandaData(data)
      },
    })
  }

  const handlePerdasUpload = (file: File) => {
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results: any) => {
        const data = results.data as Record[]
        setPerdasData(data)
      },
    })
  }

  useEffect(() => {
    if (cenariosData.length > 0 && cenariosData[0]) {
      const cols = Object.keys(cenariosData[0]).filter((k) => !k.toLowerCase().includes('mes'))
      setCenariosColumns(cols)
    }
  }, [cenariosData])

  useEffect(() => {
    if (demandaData.length > 0 && demandaData[0]) {
      const cols = Object.keys(demandaData[0]).filter((k) => k.toLowerCase().includes('demanda'))
      setDemandaColumns(Object.keys(demandaData[0]))
    }
  }, [demandaData])

  useEffect(() => {
    if (perdasData.length > 0 && perdasData[0]) {
      setPerdasColumns(Object.keys(perdasData[0]))
    }
  }, [perdasData])

  const handleImportSimulation = () => {
    // Validações pré-importação
    if (!cenariosData.length) {
      alert('Carregue o arquivo cenarios.csv')
      return
    }
    if (!vazaoColumn) {
      alert('Selecione a coluna de vazão captada')
      return
    }
    if (!demandaData.length) {
      alert('Carregue o arquivo de demanda')
      return
    }
    if (!demandaColumn) {
      alert('Selecione a coluna de demanda')
      return
    }
    if (!perdasData.length) {
      alert('Carregue o arquivo de perdas')
      return
    }
    if (!perdasColumn) {
      alert('Selecione a coluna de perdas')
      return
    }

    // Process filtered data
    const vazaoFiltered = cenariosData
      .map((row) => {
        const mesStr = row.Mes
        const vazaoStr = row[vazaoColumn]
        const mes = parseInt(mesStr || '0')
        const vazao = parseFloat(vazaoStr || '0') * normalizeFactor
        if (isNaN(mes) || isNaN(vazao) || mes <= 0) return null
        return { mes, vazao_captada: vazao }
      })
      .filter(Boolean) as any[]

    const demFiltered = demandaData
      .map((row) => {
        const mesStr = row.Mes
        const demStr = row[demandaColumn]
        const mes = parseInt(mesStr || '0')
        const dem = parseFloat(demStr || '0')
        if (isNaN(mes) || isNaN(dem)) return null
        return { mes, demanda_1000m3_mes: dem }
      })
      .filter(Boolean) as any[]

    const perFiltered = perdasData
      .map((row) => {
        const mesStr = row.Mes
        const perStr = row[perdasColumn]
        const mes = parseInt(mesStr || '0')
        const per = parseFloat(perStr || '0')
        if (isNaN(mes) || isNaN(per)) return null
        return { mes, perdas_pct: per }
      })
      .filter(Boolean) as any[]

    const demandaRecordsCount = demFiltered.length
    const perdasRecordsCount = perFiltered.length
    const vazaoRecordsCount = vazaoFiltered.length

    if (demandaRecordsCount !== perdasRecordsCount || demandaRecordsCount !== vazaoRecordsCount) {
      alert(
        `Quantidades diferentes: Demanda ${demandaRecordsCount}, Perdas ${perdasRecordsCount}, Vazão ${vazaoRecordsCount}`,
      )
      return
    }

    // Merge data
    const merged: SimulationRecord[] = vazaoFiltered.map((row: any, i: number) => ({
      mes: row.mes,
      vazao_captada: row.vazao_captada,
      demanda_1000m3_mes: demFiltered[i].demanda_1000m3_mes,
      perdas_pct: perFiltered[i].perdas_pct,
      demanda_m3_mes: demFiltered[i].demanda_1000m3_mes * 1000,
      deficit: Math.max(0, demFiltered[i].demanda_1000m3_mes * 1000 - row.vazao_captada),
      superavit: Math.max(0, row.vazao_captada - demFiltered[i].demanda_1000m3_mes * 1000),
    }))

    setFilteredData(vazaoFiltered)
    setDemandaFilteredData(demFiltered)
    setPerdasFilteredData(perFiltered)
    setMergedSimulationData(merged)
    setShowDashboard(true)
  }

  const formatNumber = (num: number): string => num.toLocaleString('pt-BR')
  const formatPercent = (pct: number): string => pct.toFixed(2) + '%'

  const totalMeses = mergedSimulationData.length
  const volumeCaptadoTotal = mergedSimulationData.reduce((sum, r) => sum + r.vazao_captada, 0)
  const volumeDemandadoTotal = mergedSimulationData.reduce((sum, r) => sum + r.demanda_m3_mes, 0)
  const demandaTotal = mergedSimulationData.reduce((sum, r) => sum + r.demanda_1000m3_mes, 0)
  const perdasMedia =
    totalMeses > 0 ? mergedSimulationData.reduce((sum, r) => sum + r.perdas_pct, 0) / totalMeses : 0

  return (
    <div className="container mx-auto p-6 space-y-8 max-w-7xl">
      {/* Card de Cenários */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Cenários</h2>
        <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-2">Arquivo cenarios.csv</label>
              <input
                type="file"
                accept=".csv"
                className="border border-gray-300 px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                onChange={(e: ChangeEvent<HTMLInputElement>) => {
                  const file = e.target.files?.[0]
                  if (file) handleCenariosUpload(file)
                }}
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Coluna Vazão Captada</label>
              <select
                value={vazaoColumn}
                onChange={(e) => setVazaoColumn(e.target.value)}
                className="border border-gray-300 px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="">Selecione...</option>
                {cenariosColumns.map((col) => (
                  <option key={col} value={col}>
                    {col}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-2">Fator de Normalização</label>
              <input
                type="number"
                value={normalizeFactor}
                onChange={(e: ChangeEvent<HTMLInputElement>) =>
                  setNormalizeFactor(parseFloat(e.target.value) || 30)
                }
                className="border border-gray-300 px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Ex: 30"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Configuração de Demanda e Perdas */}
      <div>
        <h2 className="text-2xl font-bold mb-4">Configuração de Demanda e Perdas</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Card Demanda */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Demanda</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Arquivo demanda.csv</label>
                <input
                  type="file"
                  accept=".csv"
                  className="border border-gray-300 px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0]
                    if (file) handleDemandaUpload(file)
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Coluna Demanda (1000m³/mês)
                </label>
                <select
                  value={demandaColumn}
                  onChange={(e) => setDemandaColumn(e.target.value)}
                  className="border border-gray-300 px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione...</option>
                  {demandaColumns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Card Perdas */}
          <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6">
            <h3 className="text-lg font-semibold mb-4">Perdas</h3>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium mb-2">Arquivo perdas.csv</label>
                <input
                  type="file"
                  accept=".csv"
                  className="border border-gray-300 px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                  onChange={(e: ChangeEvent<HTMLInputElement>) => {
                    const file = e.target.files?.[0]
                    if (file) handlePerdasUpload(file)
                  }}
                />
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">Coluna Perdas (%)</label>
                <select
                  value={perdasColumn}
                  onChange={(e) => setPerdasColumn(e.target.value)}
                  className="border border-gray-300 px-3 py-2 rounded-md w-full focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione...</option>
                  {perdasColumns.map((col) => (
                    <option key={col} value={col}>
                      {col}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
        <button
          onClick={handleImportSimulation}
          className="bg-blue-500 hover:bg-blue-600 text-white font-medium py-3 px-8 rounded-lg transition-colors"
        >
          Executar a Simulação
        </button>
      </div>

      {/* Dashboard */}
      {showDashboard && mergedSimulationData.length > 0 && (
        <div>
          <h2 className="text-2xl font-bold mb-6">Dashboard</h2>
          {/* Linha 1: 5 cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Total Meses</h3>
              <p className="text-2xl font-bold text-gray-900">{totalMeses}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Volume Captado Total</h3>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(volumeCaptadoTotal)} m³
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Volume Demandado Total</h3>
              <p className="text-2xl font-bold text-gray-900">
                {formatNumber(volumeDemandadoTotal)} m³
              </p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Demanda 1000m³/mês Total</h3>
              <p className="text-2xl font-bold text-gray-900">{formatNumber(demandaTotal)}</p>
            </div>
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 text-center">
              <h3 className="text-sm font-medium text-gray-500 mb-1">Perdas % Média</h3>
              <p className="text-2xl font-bold text-gray-900">{formatPercent(perdasMedia)}</p>
            </div>
          </div>

          {/* Linha 2: 3 Gráficos */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            {/* Gráfico 1: LineChart Vazão vs Demanda */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 h-[500px]">
              <h3 className="text-lg font-semibold mb-4">Vazão vs Demanda ao longo do tempo</h3>
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={mergedSimulationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" label={{ value: 'Tempo (Mês)', position: 'insideBottom' }} />
                  <YAxis label={{ value: 'Volume (m³/mês)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="vazao_captada"
                    stroke="#8884d8"
                    name="Vazão Captada"
                  />
                  <Line type="monotone" dataKey="demanda_m3_mes" stroke="#82ca9d" name="Demanda" />
                </LineChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico 2: Scatter Demanda vs Perdas */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 h-[500px]">
              <h3 className="text-lg font-semibold mb-4">Correlação Demanda vs Perdas</h3>
              <ResponsiveContainer width="100%" height="100%">
                <ScatterChart>
                  <CartesianGrid />
                  <XAxis
                    type="number"
                    dataKey="demanda_1000m3_mes"
                    name="Demanda"
                    unit=" x1000 m³/mês"
                  />
                  <YAxis type="number" dataKey="perdas_pct" name="Perdas" unit=" %" />
                  <Tooltip />
                  <Scatter name="Demanda-Perdas" data={mergedSimulationData} fill="#8884d8" />
                </ScatterChart>
              </ResponsiveContainer>
            </div>

            {/* Gráfico 3: BarChart Déficit/Superávit */}
            <div className="bg-white border border-gray-200 rounded-lg shadow-sm p-6 h-[500px]">
              <h3 className="text-lg font-semibold mb-4">Déficit / Superávit Mensal</h3>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={mergedSimulationData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="mes" />
                  <YAxis label={{ value: 'Volume (m³/mês)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="deficit" stackId="a" fill="#ef4444" name="Déficit" />
                  <Bar dataKey="superavit" stackId="a" fill="#10b981" name="Superávit" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}

export default CenariosComponent
