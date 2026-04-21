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
  scenario_key?: string
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
  const [debugLog, setDebugLog] = useState<string[]>([])

  // ===== CARREGAMENTO ORIGINAL DE cenarios.csv =====
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

        // Pular header (linha 0)
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i]
          // Split para pegar: Fonte, cenario, estrategia, scenario_key (se existir)
          const parts = line.split(',').map((p) => p.trim())

          if (parts.length >= 3) {
            const fonte = parts[0].normalize('NFD')
            const cenario = parts[1].normalize('NFD')
            const estrategia = parts[2].normalize('NFD')
            // Se existir 4ª coluna (scenario_key), use; senão, construa dinamicamente
            const scenario_key = parts[3]
              ? parts[3].normalize('NFD')
              : `${fonte} | ${cenario} | ${estrategia}`

            parsedScenarios.push({
              fonte,
              cenario,
              estrategia,
              scenario_key,
            })
          }
        }

        console.log('Cenários parseados:', parsedScenarios)
        setScenarios(parsedScenarios)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchCsv()
  }, [])

  // ===== IMPORTAÇÃO E FILTRAGEM COM scenario_key =====
  const handleImportSimulation = async () => {
    if (!selectedScenario) {
      alert('Selecione um cenário antes de importar dados')
      return
    }

    setLoadingSimulation(true)
    setDebugLog([])
    const logs: string[] = []

    try {
      logs.push('===== INICIANDO IMPORTAÇÃO =====')
      logs.push(`Cenário selecionado: ${selectedScenario}`)

      const response = await fetch('/Dados_Simulacao_novo.csv')
      if (!response.ok) {
        throw new Error('Failed to fetch simulation data')
      }

      const text = await response.text()
      logs.push(`Arquivo obtido, tamanho: ${text.length}`)

      const cleanedText = text.replace(/^\ufeff/, '')
      const lines = cleanedText.split('\n').filter((line) => line.trim() !== '')
      logs.push(`Total de linhas: ${lines.length}`)

      const headers = lines[0].split(',').map((h) => h.trim())
      logs.push(`Headers: ${headers.join(', ')}`)

      const parsed: SimulationRecord[] = []

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',')
        const record: any = {}
        headers.forEach((header, index) => {
          record[header] = isNaN(Number(parts[index])) ? parts[index].trim() : Number(parts[index])
        })
        parsed.push(record)
      }

      logs.push(`Total de registros parseados: ${parsed.length}`)
      setSimulationData(parsed)

      // FILTRAGEM USANDO scenario_key
      filterData(parsed, logs)
    } catch (err) {
      console.error('Erro ao importar:', err)
      logs.push(`ERRO: ${err instanceof Error ? err.message : 'Unknown error'}`)
      alert('Erro ao importar dados de simulação')
    } finally {
      setLoadingSimulation(false)
      setDebugLog(logs)
    }
  }

  const filterData = (data: SimulationRecord[], logs: string[]) => {
    logs.push('\n===== INICIANDO FILTRAGEM =====')
    logs.push(`selectedScenario recebido: "${selectedScenario}"`)

    // Encontrar o scenario_key correspondente
    const selectedScenarioObj = scenarios.find(
      (s) => `${s.fonte} | ${s.cenario} | ${s.estrategia}` === selectedScenario,
    )

    if (!selectedScenarioObj) {
      logs.push('ERRO: Cenário selecionado não encontrado na lista de cenários')
      setFilteredData([])
      setDebugLog(logs)
      return
    }

    const scenario_key = selectedScenarioObj.scenario_key

    logs.push(`Filtrando por scenario_key: "${scenario_key}"`)
    logs.push('\n--- Analisando primeiros 3 registros ---')

    // Debug dos primeiros 3 registros
    for (let i = 0; i < Math.min(3, data.length); i++) {
      const record = data[i]
      const match = record.scenario_key === scenario_key
      logs.push(`\nRecord ${i}:`)
      logs.push(`  scenario_key: "${record.scenario_key}"`)
      logs.push(`  Match: "${record.scenario_key}" === "${scenario_key}" ? ${match}`)
    }
    logs.push('\n--- Fim da análise de amostra ---')

    // Executar filtro
    const filtered = data.filter((record) => record.scenario_key === scenario_key)

    logs.push(`\nTotal de registros filtrados: ${filtered.length}`)
    logs.push('===== FILTRAGEM CONCLUÍDA =====\n')

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
                <SelectItem
                  key={index}
                  value={`${scenario.fonte} | ${scenario.cenario} | ${scenario.estrategia}`}
                >
                  {`${scenario.fonte} | ${scenario.cenario} | ${scenario.estrategia}`}
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

      {debugLog.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle>Debug Log</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96">
              {debugLog.join('\n')}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CenariosComponent
