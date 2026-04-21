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
  fonte: string
  cenario: string
  estrategia: string
  display: string
}

type SimulationRecord = {
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
        console.log('Fetching cenarios.csv...')
        const response = await fetch('/cenarios.csv')
        if (!response.ok) {
          throw new Error('Failed to fetch CSV')
        }
        const text = await response.text()
        const cleanedText = text.replace(/^\ufeff/, '')
        const lines = cleanedText.split('\n').filter((line) => line.trim() !== '')

        const parsedScenarios: Scenario[] = []
        lines.forEach((line) => {
          const parts = line.split(',')
          if (parts.length >= 3) {
            const fonte = parts[0].trim().normalize('NFD')
            const cenario = parts[1].trim().normalize('NFD')
            const estrategia = parts[2].trim().normalize('NFD')
            const display = `${fonte} | ${cenario} | ${estrategia}`
            parsedScenarios.push({ fonte, cenario, estrategia, display })
          }
        })

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
      console.log('Fetching Dados_Simulacao_novo.csv...')
      const response = await fetch('/Dados_Simulacao_novo.csv')
      if (!response.ok) {
        throw new Error('Failed to fetch simulation data')
      }
      const text = await response.text()
      const cleanedText = text.replace(/^\ufeff/, '')
      const lines = cleanedText.split('\n').filter((line) => line.trim() !== '')

      const headers = lines[0].split(',').map((h) => h.trim())
      const parsed: SimulationRecord[] = []

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim())
        const record: any = {}
        headers.forEach((header, index) => {
          record[header] = isNaN(Number(parts[index])) ? parts[index] : Number(parts[index])
        })
        parsed.push(record)
      }

      setSimulationData(parsed)
      filterData(parsed)
      console.log('Simulation data loaded:', parsed.length, 'records')
    } catch (err) {
      console.error('Error loading simulation data:', err)
      alert('Erro ao importar dados de simulação')
    } finally {
      setLoadingSimulation(false)
    }
  }

  const filterData = (data: SimulationRecord[]) => {
    const [fonte, cenario, estrategia] = selectedScenario.split(' | ').map((s) => s.trim())
    const filtered = data.filter(
      (record) =>
        record.Fonte.normalize('NFD') === fonte &&
        record.cenario.normalize('NFD') === cenario &&
        record.estrategia.normalize('NFD') === estrategia,
    )
    setFilteredData(filtered)
    console.log('Filtered records:', filtered.length)
  }

  if (loading) {
    return <div>Carregando...</div>
  }

  if (error) {
    return <div>Erro: {error}</div>
  }

  return (
    <div className="space-y-4">
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
                <SelectItem key={index} value={scenario.display}>
                  {scenario.display}
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

      {filteredData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Dados Filtrados</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm font-semibold">{filteredData.length} registros encontrados</p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CenariosComponent
