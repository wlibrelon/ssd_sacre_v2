import React, { useState, useEffect } from 'react'
import Papa from 'papaparse'
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
  scenario_key: string
  [key: string]: any
}

type SimulationRecord = {
  scenario_key: string
  Tempo?: string
  Fonte?: string
  cenario?: string
  estrategia?: string
  Vazao_Captada?: number
  Demanda?: number
  CAPEX?: number
  OPEX?: number
  Aceitacao_Social?: number
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

  // Carregar cenarios.csv ao montar o componente
  useEffect(() => {
    const loadScenarios = async () => {
      try {
        console.log('Carregando cenarios.csv...')
        const response = await fetch('/cenarios.csv')
        if (!response.ok) {
          throw new Error('Failed to load cenarios.csv')
        }
        const text = await response.text()
        // Remove BOM se presente
        const cleanText = text.replace(/^\ufeff/, '')

        Papa.parse(cleanText, {
          header: true,
          skipEmptyLines: true,
          transformHeader: (header: string) => header.trim(),
          complete: (results) => {
            const data: Scenario[] = results.data as Scenario[]
            console.log('Cenários carregados:', data.length)
            setScenarios(data)
            setLoading(false)
          },
          error: (err) => {
            console.error('Erro ao fazer parse de cenarios.csv:', err)
            setError('Erro ao carregar cenários')
            setLoading(false)
          },
        })
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setLoading(false)
      }
    }

    loadScenarios()
  }, [])

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
      logs.push(`Cenário selecionado: "${selectedScenario}"`)

      const response = await fetch('/Dados_Simulacao_novo.csv')
      if (!response.ok) {
        throw new Error('Failed to load Dados_Simulacao_novo.csv')
      }

      const text = await response.text()
      logs.push(`Arquivo obtido, tamanho: ${text.length} bytes`)

      // Remove BOM se presente
      const cleanText = text.replace(/^\ufeff/, '')

      Papa.parse(cleanText, {
        header: true,
        skipEmptyLines: true,
        transformHeader: (header: string) => header.trim(),
        complete: (results) => {
          const parsed = results.data as SimulationRecord[]
          logs.push(`Total de registros parseados: ${parsed.length}`)

          // EXECUTAR FILTRAGEM COM scenario_key
          logs.push('\n===== INICIANDO FILTRAGEM =====')

          // Debug dos primeiros 3 registros
          logs.push('--- Analisando primeiros 3 registros ---')
          for (let i = 0; i < Math.min(3, parsed.length); i++) {
            const record = parsed[i]
            const match = record.scenario_key === selectedScenario
            logs.push(`\nRecord ${i}:`)
            logs.push(`  scenario_key: "${record.scenario_key}"`)
            logs.push(`  Match: "${record.scenario_key}" === "${selectedScenario}" ? ${match}`)
          }
          logs.push('\n--- Fim da análise de amostra ---')

          // Executar filtro
          const filtered = parsed.filter((record) => record.scenario_key === selectedScenario)

          logs.push(`\nTotal de registros filtrados: ${filtered.length}`)
          logs.push('===== FILTRAGEM CONCLUÍDA =====\n')

          setSimulationData(parsed)
          setFilteredData(filtered)
          setDebugLog(logs)

          console.log(logs.join('\n'))
        },
        error: (err) => {
          logs.push(`ERRO: ${err.message}`)
          setDebugLog(logs)
          console.error('Erro ao fazer parse:', err)
          alert('Erro ao importar dados de simulação')
        },
      })
    } catch (err) {
      const errorMsg = err instanceof Error ? err.message : 'Unknown error'
      logs.push(`ERRO: ${errorMsg}`)
      setDebugLog(logs)
      alert('Erro ao buscar arquivo de simulação')
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
                <SelectItem key={index} value={scenario.scenario_key}>
                  {scenario.scenario_key}
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
