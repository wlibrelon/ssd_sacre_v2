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

type Scenario = {
  Fonte: string
  cenario: string
  estrategia: string
}

type SimulationRecord = {
  scenario_key: string
  Tempo: string
  Fonte: string
  cenario: string
  estrategia: string
  Vazao_Captada: number
  Demanda: number
  CAPEX: number
  OPEX: number
  Aceitacao_Social: number
  [key: string]: any
}

const CenariosComponent: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [selectedScenario, setSelectedScenario] = useState<string>('')
  const [simulationData, setSimulationData] = useState<SimulationRecord[]>([])
  const [filteredData, setFilteredData] = useState<SimulationRecord[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')
  const [loadingSimulation, setLoadingSimulation] = useState<boolean>(false)

  useEffect(() => {
    const fetchCsv = async () => {
      try {
        const response = await fetch('/cenarios.csv')
        if (!response.ok) {
          throw new Error('Failed to fetch CSV')
        }
        const text = await response.text()
        const cleanedText = text.replace(/^\ufeff/, '')
        const lines = cleanedText.split('\n').filter((line) => line.trim() !== '')

        const parsedScenarios: Scenario[] = []

        for (let i = 1; i < lines.length; i++) {
          const line = lines[i]
          const parts = line.split(',').map((p) => p.trim())

          if (parts.length >= 3) {
            const Fonte = parts[0].normalize('NFD')
            const cenario = parts[1].normalize('NFD')
            const estrategia = parts[2].normalize('NFD')

            parsedScenarios.push({
              Fonte,
              cenario,
              estrategia,
            })
          }
        }

        setScenarios(parsedScenarios)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchCsv()
  }, [])

  const handleImportSimulation = async () => {
    if (!selectedScenario) {
      alert('Selecione um cenário antes de importar dados')
      return
    }

    setLoadingSimulation(true)

    try {
      const response = await fetch('/Dados_Simulacao_novo.csv')
      if (!response.ok) {
        throw new Error('Failed to fetch simulation data')
      }

      const text = await response.text()
      const cleanedText = text.replace(/^\ufeff/, '')
      const lines = cleanedText.split('\n').filter((line) => line.trim() !== '')

      const headers = lines[0].split(',').map((h) => h.trim())

      const parsed: any[] = []

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',')
        const record: any = {}
        headers.forEach((header, index) => {
          record[header] = isNaN(Number(parts[index])) ? parts[index].trim() : Number(parts[index])
        })
        parsed.push(record)
      }

      // Construir scenario_key dinamicamente
      const parsedWithKey: SimulationRecord[] = parsed.map((record) => ({
        ...record,
        scenario_key: `${record.Fonte} | ${record.cenario} | ${record.estrategia}`,
      }))

      setSimulationData(parsedWithKey)

      // Filtrar
      const filtered = parsedWithKey.filter((record) => record.scenario_key === selectedScenario)
      setFilteredData(filtered)
    } catch (err) {
      alert('Erro ao importar dados de simulação')
    } finally {
      setLoadingSimulation(false)
    }
  }

  if (loading) {
    return <div className="p-4">Carregando cenários...</div>
  }

  if (error) {
    return <div className="p-4 text-red-600">Erro: {error}</div>
  }

  return (
    <div className="space-y-4 p-4">
      <Card>
        <CardHeader>
          <CardTitle>Cenários para simulação</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedScenario} onValueChange={setSelectedScenario}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cenário" />
            </SelectTrigger>
            <SelectContent>
              {scenarios.map((scenario, index) => (
                <SelectItem
                  key={index}
                  value={`${scenario.Fonte} | ${scenario.cenario} | ${scenario.estrategia}`}
                >
                  {`${scenario.Fonte} | ${scenario.cenario} | ${scenario.estrategia}`}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Button
        onClick={handleImportSimulation}
        disabled={loadingSimulation || !selectedScenario}
        className="w-full"
      >
        {loadingSimulation ? 'Carregando...' : 'Importar Dados de Simulação'}
      </Button>

      {simulationData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-bold">
              {filteredData.length > 0 ? (
                <span className="text-green-600">
                  ✓ {filteredData.length} registros encontrados
                </span>
              ) : (
                <span className="text-red-600">✗ Nenhum registro encontrado</span>
              )}
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CenariosComponent
