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

  // ===== NOVOS ESTADOS PARA DEMANDA E PERDAS =====
  const [demandaCenario, setDemandaCenario] = useState<string>('')
  const [demandaConsumo, setDemandaConsumo] = useState<string>('')
  const [indicePerda, setIndicePerda] = useState<string>('')

  // ===== FUNÇÃO DE NORMALIZAÇÃO AGRESSIVA =====
  const normalizeString = (str: string): string => {
    let normalized = str.replace(/\ufeff/g, '')
    normalized = normalized.replace(/\u00a0/g, '')
    normalized = normalized.replace(/\t/g, '')
    normalized = normalized.replace(/[\u200b-\u200d]/g, '')
    normalized = normalized.normalize('NFD')
    normalized = normalized.toLowerCase()
    normalized = normalized.trim()
    return normalized
  }

  // ===== CARREGAMENTO ORIGINAL DE cenarios.csv =====
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

  // ===== IMPORTAÇÃO E FILTRAGEM (SILENCIOSA) =====
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

      // Filtragem silenciosa com normalização
      const selectedNormalized = normalizeString(selectedScenario)
      const filtered = parsedWithKey.filter((record) => {
        const recordNormalized = normalizeString(record.scenario_key)
        return recordNormalized === selectedNormalized
      })

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
      {/* ===== CARD DE SELEÇÃO DE CENÁRIOS =====*/}
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

      {/* ===== BOTÃO IMPORTAR =====*/}
      <Button
        onClick={handleImportSimulation}
        disabled={loadingSimulation || !selectedScenario}
        className="w-full"
      >
        {loadingSimulation ? 'Carregando...' : 'Importar Dados de Simulação'}
      </Button>

      {/* ===== SEÇÃO: CONFIGURAÇÃO DE DEMANDA E PERDAS =====*/}
      <div className="space-y-4 mt-8">
        <h2 className="text-xl font-bold">Configuração de Demanda e Perdas</h2>

        {/* CARDS LADO A LADO */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {/* CARD 1: DEMANDA DE CONSUMO */}
          <Card>
            <CardHeader>
              <CardTitle>Demanda de consumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Combobox: Cenários */}
              <div>
                <label className="block text-sm font-medium mb-2">Cenários</label>
                <Select value={demandaCenario} onValueChange={setDemandaCenario}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um cenário" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Estagnação populacional">Estagnação populacional</SelectItem>
                    <SelectItem value="Crescimento tendencial">Crescimento tendencial</SelectItem>
                    <SelectItem value="Crescimento acelerado">Crescimento acelerado</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {/* Combobox: Consumo */}
              <div>
                <label className="block text-sm font-medium mb-2">Consumo</label>
                <Select value={demandaConsumo} onValueChange={setDemandaConsumo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione consumo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Crescente - até 250 L/pcd">
                      Crescente - até 250 L/pcd
                    </SelectItem>
                    <SelectItem value="Estável - 215 L/pcd">Estável - 215 L/pcd</SelectItem>
                    <SelectItem value="Decrescente - até 180 L/pcd">
                      Decrescente - até 180 L/pcd
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>

          {/* CARD 2: CENÁRIOS DE PERDAS */}
          <Card>
            <CardHeader>
              <CardTitle>Cenários de perdas</CardTitle>
            </CardHeader>
            <CardContent>
              {/* Combobox: Índice de Perdas */}
              <div>
                <label className="block text-sm font-medium mb-2">Índice de perdas</label>
                <Select value={indicePerda} onValueChange={setIndicePerda}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione índice" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="30%">30%</SelectItem>
                    <SelectItem value="28%">28%</SelectItem>
                    <SelectItem value="26%">26%</SelectItem>
                    <SelectItem value="24%">24%</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

export default CenariosComponent
