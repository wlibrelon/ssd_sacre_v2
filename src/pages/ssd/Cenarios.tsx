import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Scenario {
  Fonte: string
  cenario: string
  estrategia: string
}

interface SimulationData {
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

const SimulationComponent: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [selectedScenario, setSelectedScenario] = useState<string>('')
  const [simulationData, setSimulationData] = useState<SimulationData[]>([])
  const [filteredData, setFilteredData] = useState<SimulationData[]>([])
  const [loadingSimulation, setLoadingSimulation] = useState<boolean>(false)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    loadScenarios()
  }, [])

  const loadScenarios = async () => {
    try {
      const response = await fetch('/scenarios.csv')
      const text = await response.text()
      const parsed = parseCSV(text)
      setScenarios(parsed as Scenario[])
      console.log('Scenarios loaded:', parsed)
    } catch (err) {
      setError('Failed to load scenarios')
      console.error('Error loading scenarios:', err)
    }
  }

  const parseCSV = (csvText: string): any[] => {
    // Remove BOM if present
    const text = csvText.replace(/^\ufeff/, '')
    // Normalize accents
    const normalized = text.normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    const lines = normalized.split('\n')
    const headers = lines[0].split(',').map((h) => h.trim())
    const data = lines.slice(1).map((line) => {
      const values = line.split(',').map((v) => v.trim())
      const obj: any = {}
      headers.forEach((h, i) => {
        obj[h] = isNaN(Number(values[i])) ? values[i] : Number(values[i])
      })
      return obj
    })
    return data
  }

  const handleImportSimulation = async () => {
    setLoadingSimulation(true)
    setError('')
    try {
      const response = await fetch('/Dados_Simulacao_novo.csv')
      const text = await response.text()
      const parsed = parseCSV(text) as SimulationData[]
      setSimulationData(parsed)
      console.log('Simulation data loaded:', parsed)
      filterData(parsed)
    } catch (err) {
      setError('Failed to load simulation data')
      console.error('Error loading simulation data:', err)
    } finally {
      setLoadingSimulation(false)
    }
  }

  const filterData = (data: SimulationData[]) => {
    if (!selectedScenario) {
      setFilteredData([])
      return
    }
    const filtered = data.filter(
      (item) => `${item.Fonte} | ${item.cenario} | ${item.estrategia}` === selectedScenario,
    )
    setFilteredData(filtered)
    console.log('Filtered data:', filtered)
  }

  useEffect(() => {
    if (simulationData.length > 0) {
      filterData(simulationData)
    }
  }, [selectedScenario])

  return (
    <div className="p-4">
      <Card>
        <CardHeader>
          <CardTitle>Seleção de Cenário</CardTitle>
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
      <Button onClick={handleImportSimulation} disabled={loadingSimulation} className="mt-4">
        {loadingSimulation ? 'Carregando...' : 'Importar Dados de Simulação'}
      </Button>
      {filteredData.length > 0 && (
        <p className="mt-4">{filteredData.length} registros encontrados</p>
      )}
      {error && <p className="mt-4 text-red-500">{error}</p>}
    </div>
  )
}

export default SimulationComponent
