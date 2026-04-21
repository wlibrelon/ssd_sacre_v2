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
      console.log('===== INICIANDO IMPORTAÇÃO =====')
      console.log('Cenário selecionado:', selectedScenario)

      const response = await fetch('/Dados_Simulacao_novo.csv')
      if (!response.ok) {
        throw new Error('Failed to fetch simulation data')
      }

      const text = await response.text()
      console.log('Arquivo obtido, tamanho:', text.length)

      const cleanedText = text.replace(/^\ufeff/, '')
      const lines = cleanedText.split('\n').filter((line) => line.trim() !== '')
      console.log('Total de linhas:', lines.length)

      const headers = lines[0].split(',').map((h) => h.trim())
      console.log('Headers encontrados:', headers)

      const parsed: SimulationRecord[] = []

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',').map((p) => p.trim())
        const record: any = {}
        headers.forEach((header, index) => {
          record[header] = isNaN(Number(parts[index])) ? parts[index] : Number(parts[index])
        })
        parsed.push(record)
      }

      console.log('Total de registros parseados:', parsed.length)
      setSimulationData(parsed)

      // EXECUTAR FILTRAGEM
      filterData(parsed)
    } catch (err) {
      console.error('Erro ao importar:', err)
      alert('Erro ao importar dados de simulação')
    } finally {
      setLoadingSimulation(false)
    }
  }

  const filterData = (data: SimulationRecord[]) => {
    console.log('\n===== INICIANDO FILTRAGEM =====')
    console.log('selectedScenario recebido:', selectedScenario)

    // Extrair e normalizar selectedScenario
    const [selFonte, selCenario, selEstrategia] = selectedScenario
      .split(' | ')
      .map((s) => s.trim().normalize('NFD').toLowerCase())

    console.log('Filtrado por:', { selFonte, selCenario, selEstrategia })

    // Debug dos primeiros 3 registros
    console.log('\n--- Analisando primeiros 3 registros ---')
    for (let i = 0; i < Math.min(3, data.length); i++) {
      const record = data[i]
      const recFonte = record.Fonte.trim().normalize('NFD').toLowerCase()
      const recCenario = record.cenario.trim().normalize('NFD').toLowerCase()
      const recEstrategia = record.estrategia.trim().normalize('NFD').toLowerCase()

      console.log(`Record ${i}:`, {
        original: `${record.Fonte} | ${record.cenario} | ${record.estrategia}`,
        normalized: `${recFonte} | ${recCenario} | ${recEstrategia}`,
        matches:
          recFonte === selFonte && recCenario === selCenario && recEstrategia === selEstrategia,
      })
    }
    console.log('--- Fim da análise de amostra ---\n')

    // Executar filtro
    const filtered = data.filter((record) => {
      const recFonte = record.Fonte.trim().normalize('NFD').toLowerCase()
      const recCenario = record.cenario.trim().normalize('NFD').toLowerCase()
      const recEstrategia = record.estrategia.trim().normalize('NFD').toLowerCase()

      return recFonte === selFonte && recCenario === selCenario && recEstrategia === selEstrategia
    })

    console.log('Total de registros filtrados:', filtered.length)
    console.log('===== FILTRAGEM CONCLUÍDA =====\n')

    setFilteredData(filtered)
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

      {simulationData.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Resultado da Filtragem</CardTitle>
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
