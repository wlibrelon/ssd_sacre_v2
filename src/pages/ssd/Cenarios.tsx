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
        console.log('Carregando cenarios.csv...')
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

        console.log('Cenários carregados:', parsedScenarios.length)
        setScenarios(parsedScenarios)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchCsv()
  }, [])

  // ===== IMPORTAÇÃO E FILTRAGEM COM CONSTRUÇÃO DINÂMICA DE scenario_key =====
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

      const parsed: any[] = []

      for (let i = 1; i < lines.length; i++) {
        const parts = lines[i].split(',')
        const record: any = {}
        headers.forEach((header, index) => {
          record[header] = isNaN(Number(parts[index])) ? parts[index].trim() : Number(parts[index])
        })
        parsed.push(record)
      }

      logs.push(`Total de registros parseados: ${parsed.length}`)

      // ===== CONSTRUIR scenario_key DINAMICAMENTE =====
      logs.push('\n===== CONSTRUINDO scenario_key DINAMICAMENTE =====')

      const parsedWithKey: SimulationRecord[] = parsed.map((record) => {
        const scenario_key = `${record.Fonte} | ${record.cenario} | ${record.estrategia}`
        return {
          ...record,
          scenario_key,
        }
      })

      logs.push(`scenario_key construído para ${parsedWithKey.length} registros`)
      logs.push('Primeiros 3 scenario_keys construídos:')
      for (let i = 0; i < Math.min(3, parsedWithKey.length); i++) {
        logs.push(`  Record ${i}: "${parsedWithKey[i].scenario_key}"`)
      }

      setSimulationData(parsedWithKey)

      // ===== FILTRAGEM USANDO scenario_key =====
      logs.push('\n===== INICIANDO FILTRAGEM =====')
      logs.push(`Filtrando por: "${selectedScenario}"`)

      logs.push('\n--- Analisando primeiros 3 registros ---')
      for (let i = 0; i < Math.min(3, parsedWithKey.length); i++) {
        const record = parsedWithKey[i]
        const match = record.scenario_key === selectedScenario
        logs.push(`\nRecord ${i}:`)
        logs.push(`  scenario_key: "${record.scenario_key}"`)
        logs.push(`  Match: ${match}`)
      }
      logs.push('\n--- Fim da análise de amostra ---')

      const filtered = parsedWithKey.filter((record) => record.scenario_key === selectedScenario)

      logs.push(`\nTotal de registros filtrados: ${filtered.length}`)
      logs.push('===== FILTRAGEM CONCLUÍDA =====\n')

      setFilteredData(filtered)
      setDebugLog(logs)

      console.log(logs.join('\n'))
    } catch (err) {
      console.error('Erro ao importar:', err)
      logs.push(`ERRO: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setDebugLog(logs)
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
            <pre className="text-xs bg-gray-100 p-4 rounded overflow-auto max-h-96 whitespace-pre-wrap">
              {debugLog.join('\n')}
            </pre>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default CenariosComponent
