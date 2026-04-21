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

        // Pular header
        for (let i = 1; i < lines.length; i++) {
          const line = lines[i]
          // Split apenas uma vez para cada coluna (sem split indiscriminado)
          const parts = line.split(',', 3) // Pega apenas os 3 primeiros campos

          if (parts.length === 3) {
            parsedScenarios.push({
              Fonte: parts[0].trim(),
              cenario: parts[1].trim(),
              estrategia: parts[2].trim(),
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

      // EXECUTAR FILTRAGEM
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

    // CRÍTICO: Split apenas em ' | ' uma única vez, pegando os 3 primeiros campos
    const parts = selectedScenario.split(' | ', 3)

    if (parts.length !== 3) {
      logs.push(`ERRO: selectedScenario não tem exatamente 3 partes. Recebido: ${parts.length}`)
      logs.push(`Partes: ${parts.map((p, i) => `[${i}]="${p}"`).join(', ')}`)
      setFilteredData([])
      return
    }

    const [selFonte, selCenario, selEstrategia] = parts.map((s) => s.trim())

    logs.push(`Filtrando por:`)
    logs.push(`  Fonte: "${selFonte}"`)
    logs.push(`  cenario: "${selCenario}"`)
    logs.push(`  estrategia: "${selEstrategia}"`)

    // Debug dos primeiros 3 registros
    logs.push('\n--- Analisando primeiros 3 registros ---')
    for (let i = 0; i < Math.min(3, data.length); i++) {
      const record = data[i]
      const recFonte = record.Fonte.trim()
      const recCenario = record.cenario.trim()
      const recEstrategia = record.estrategia.trim()

      const matchFonte = recFonte === selFonte
      const matchCenario = recCenario === selCenario
      const matchEstrategia = recEstrategia === selEstrategia

      logs.push(`\nRecord ${i}:`)
      logs.push(`  Fonte: "${recFonte}" === "${selFonte}" ? ${matchFonte}`)
      logs.push(`  cenario: "${recCenario}" === "${selCenario}" ? ${matchCenario}`)
      logs.push(`  estrategia: "${recEstrategia}" === "${selEstrategia}" ? ${matchEstrategia}`)
      logs.push(`  MATCH GERAL: ${matchFonte && matchCenario && matchEstrategia}`)
    }
    logs.push('\n--- Fim da análise de amostra ---')

    // Executar filtro
    const filtered = data.filter((record) => {
      return (
        record.Fonte.trim() === selFonte &&
        record.cenario.trim() === selCenario &&
        record.estrategia.trim() === selEstrategia
      )
    })

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
