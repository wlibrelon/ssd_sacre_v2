import React, { useState, useCallback, useEffect } from 'react'
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
  Cell,
  BarChart,
  Bar,
} from 'recharts'

const normalizeString = (str: string): string => {
  return (
    str
      ?.toString()
      .toLowerCase()
      .trim()
      .replace(/\s+/g, ' ')
      .replace(/[^\w\s]/g, '') || ''
  )
}

const formatNumber = (num: number, decimals: number = 2): string => {
  return num.toLocaleString('pt-BR', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  })
}

const CenariosComponent: React.FC = () => {
  const [simulationRecords, setSimulationRecords] = useState<any[]>([])
  const [demandaScenarios, setDemandaScenarios] = useState<any[]>([])
  const [perdasScenarios, setPerdasScenarios] = useState<any[]>([])
  const [selectedDemanda, setSelectedDemanda] = useState('')
  const [selectedPerdas, setSelectedPerdas] = useState('')
  const [showSummary, setShowSummary] = useState(false)
  const [summaryData, setSummaryData] = useState({
    meses: 0,
    captado: 0,
    demandado: 0,
    demandaTotal: 0,
    perdasMedia: 0,
  })
  const [chartData, setChartData] = useState<any[]>([])

  const handleSimulacaoFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Apenas arquivos CSV são permitidos.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Arquivo muito grande (máximo 10MB).')
      return
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setSimulationRecords(results.data as any[])
        setShowSummary(false)
      },
      error: (error) => alert('Erro ao processar arquivo de simulação: ' + error),
    })
  }, [])

  const handleDemandaFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Apenas arquivos CSV são permitidos.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Arquivo muito grande (máximo 10MB).')
      return
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setDemandaScenarios(results.data as any[])
        setSelectedDemanda('')
        setShowSummary(false)
      },
      error: (error) => alert('Erro ao processar cenários de demanda: ' + error),
    })
  }, [])

  const handlePerdasFile = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Apenas arquivos CSV são permitidos.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('Arquivo muito grande (máximo 10MB).')
      return
    }
    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        setPerdasScenarios(results.data as any[])
        setSelectedPerdas('')
        setShowSummary(false)
      },
      error: (error) => alert('Erro ao processar cenários de perdas: ' + error),
    })
  }, [])

  const handleExecutar = useCallback(() => {
    if (!selectedDemanda || !selectedPerdas) {
      alert('Selecione os cenários de demanda e perdas.')
      return
    }
    const demandaRow = demandaScenarios.find((s: any) => s.Cenário === selectedDemanda)
    const perdasRow = perdasScenarios.find((s: any) => s.Cenário === selectedPerdas)
    if (!demandaRow || !perdasRow) {
      alert('Cenário selecionado não encontrado.')
      return
    }
    const merged: any[] = []
    let totalCaptado = 0
    let totalDemandado = 0
    let totalGrossDemand = 0
    let totalPerdas = 0
    simulationRecords.forEach((rec: any) => {
      const mes = Number(rec.Mês)
      const vazao = Number(rec.Vazao_1000m3_mes || 0)
      const demandaStr = demandaRow[`Mês ${mes}`]
      const perdasStr = perdasRow[`Mês ${mes}`]
      const demandaVal = Number(demandaStr ?? 0)
      const perdasVal = Number(perdasStr ?? 0)
      const eficiencia = Math.max(0.01, 1 - perdasVal / 100) // Avoid div by zero
      const grossDemand = demandaVal / eficiencia
      const balance = vazao - grossDemand
      merged.push({
        Mes: mes,
        Vazao: vazao,
        Demanda: demandaVal,
        Perdas: perdasVal,
        Balance: balance,
      })
      totalCaptado += vazao
      totalDemandado += demandaVal
      totalGrossDemand += grossDemand
      totalPerdas += perdasVal
    })
    const meses = merged.length
    const perdasMedia = meses > 0 ? totalPerdas / meses : 0
    setSummaryData({
      meses,
      captado: totalCaptado,
      demandado: totalDemandado,
      demandaTotal: totalGrossDemand,
      perdasMedia,
    })
    setChartData(merged)
    setShowSummary(true)
  }, [simulationRecords, demandaScenarios, perdasScenarios, selectedDemanda, selectedPerdas])

  useEffect(() => {
    if (
      demandaScenarios.length > 0 &&
      perdasScenarios.length > 0 &&
      demandaScenarios.length !== perdasScenarios.length
    ) {
      alert(
        `Quantidades de cenários diferentes: Demanda (${demandaScenarios.length}), Perdas (${perdasScenarios.length}).`,
      )
    }
  }, [demandaScenarios.length, perdasScenarios.length])

  const isDataLoaded =
    simulationRecords.length > 0 && demandaScenarios.length > 0 && perdasScenarios.length > 0

  return (
    <div className="container mx-auto p-8 max-w-7xl">
      <h1 className="text-4xl font-bold text-gray-900 mb-12 text-center">Componente de Cenários</h1>

      {/* Seção de Importação */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Importar Dados</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="border p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Dados_Simulacao_novo.csv
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleSimulacaoFile}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="border p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              cenarios_demanda.csv
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handleDemandaFile}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
          <div className="border p-4 rounded-lg">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              cenarios_perdas.csv
            </label>
            <input
              type="file"
              accept=".csv"
              onChange={handlePerdasFile}
              className="w-full p-2 border border-gray-300 rounded-md"
            />
          </div>
        </div>
      </section>

      {/* Seção de Configuração */}
      <section className="mb-12">
        <h2 className="text-2xl font-bold mb-6">Configuração</h2>
        {!isDataLoaded ? (
          <div className="text-center py-12 text-gray-500">
            Carregue todos os arquivos CSV para configurar os cenários.
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
              <div className="lg:col-span-1 p-6 border-2 border-gray-300 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4">Cenários de Demanda</h3>
                <select
                  value={selectedDemanda}
                  onChange={(e) => setSelectedDemanda(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um cenário</option>
                  {demandaScenarios.map((scenario: any, index: number) => (
                    <option key={index} value={scenario.Cenário}>
                      {scenario.Cenário}
                    </option>
                  ))}
                </select>
              </div>
              <div className="lg:col-span-1 p-6 border-2 border-gray-300 rounded-xl shadow-lg">
                <h3 className="text-xl font-bold mb-4">Cenários de Perdas</h3>
                <select
                  value={selectedPerdas}
                  onChange={(e) => setSelectedPerdas(e.target.value)}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="">Selecione um cenário</option>
                  {perdasScenarios.map((scenario: any, index: number) => (
                    <option key={index} value={scenario.Cenário}>
                      {scenario.Cenário}
                    </option>
                  ))}
                </select>
              </div>
              <div className="p-6 border-2 border-blue-300 rounded-xl shadow-lg flex items-center justify-center">
                <button
                  onClick={handleExecutar}
                  disabled={!selectedDemanda || !selectedPerdas}
                  className="w-full bg-blue-600 text-white py-4 px-8 rounded-lg font-bold text-lg hover:bg-blue-700 disabled:bg-gray-400 disabled:cursor-not-allowed transition-colors"
                >
                  Executar a Simulação
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      {/* Dashboard */}
      {showSummary && (
        <section>
          <h2 className="text-3xl font-bold mb-8 text-center">Dashboard de Resultados</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6 mb-12">
            <div className="p-6 bg-white border-4 border-gray-400 rounded-xl shadow-lg text-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Meses</h3>
              <p className="text-3xl font-bold text-gray-900">{summaryData.meses}</p>
            </div>
            <div className="p-6 bg-white border-4 border-green-500 rounded-xl shadow-lg text-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Volume Captado (1000m³)</h3>
              <p className="text-3xl font-bold text-green-900">
                {formatNumber(summaryData.captado)}
              </p>
            </div>
            <div className="p-6 bg-white border-4 border-blue-500 rounded-xl shadow-lg text-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Volume Demandado (1000m³)
              </h3>
              <p className="text-3xl font-bold text-blue-900">
                {formatNumber(summaryData.demandado)}
              </p>
            </div>
            <div className="p-6 bg-white border-4 border-orange-500 rounded-xl shadow-lg text-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Demanda Total (1000m³)</h3>
              <p className="text-3xl font-bold text-orange-900">
                {formatNumber(summaryData.demandaTotal)}
              </p>
            </div>
            <div className="p-6 bg-white border-4 border-red-500 rounded-xl shadow-lg text-center">
              <h3 className="text-lg font-semibold text-gray-700 mb-2">Perdas Média (%)</h3>
              <p className="text-3xl font-bold text-red-900">
                {formatNumber(summaryData.perdasMedia, 1)}%
              </p>
            </div>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold mb-6">Vazão × Demanda</h3>
              <ResponsiveContainer width="100%" height={400}>
                <LineChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="Mes" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line
                    type="monotone"
                    dataKey="Vazao"
                    stroke="#8884d8"
                    strokeWidth={3}
                    dot={false}
                  />
                  <Line
                    type="monotone"
                    dataKey="Demanda"
                    stroke="#82ca9d"
                    strokeWidth={3}
                    dot={false}
                  />
                </LineChart>
              </ResponsiveContainer>
            </div>
            <div className="bg-white p-6 rounded-xl shadow-lg">
              <h3 className="text-xl font-bold mb-6">Demanda × Perdas</h3>
              <ResponsiveContainer width="100%" height={400}>
                <ScatterChart>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" dataKey="Demanda" name="Demanda" unit=" 1000m³" />
                  <YAxis type="number" dataKey="Perdas" name="Perdas" unit=" %" />
                  <Tooltip cursor={{ strokeDasharray: '3 3' }} />
                  <Scatter name="A" data={chartData} fill="#8884d8">
                    {chartData.map((entry, index) => (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.Balance >= 0 ? '#10b981' : '#ef4444'}
                        r={6}
                      />
                    ))}
                  </Scatter>
                </ScatterChart>
              </ResponsiveContainer>
            </div>
          </div>

          <div className="bg-white p-6 rounded-xl shadow-lg">
            <h3 className="text-xl font-bold mb-6">Déficit / Superávit</h3>
            <ResponsiveContainer width="100%" height={400}>
              <BarChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="Mes" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="Balance">
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.Balance >= 0 ? '#10b981' : '#ef4444'} />
                  ))}
                </Bar>
              </BarChart>
            </ResponsiveContainer>
          </div>
        </section>
      )}
    </div>
  )
}

export default CenariosComponent
