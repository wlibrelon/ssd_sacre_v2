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

type Cenario = {
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
  const [cenarios, setCenarios] = useState<Cenario[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  // Armazenar seleção em 3 campos separados
  const [selectedFonte, setSelectedFonte] = useState<string>('')
  const [selectedCenario, setSelectedCenario] = useState<string>('')
  const [selectedEstrategia, setSelectedEstrategia] = useState<string>('')
  const [selectedDisplay, setSelectedDisplay] = useState<string>('')

  const [simulationData, setSimulationData] = useState<SimulationRecord[]>([])
  const [filteredData, setFilteredData] = useState<SimulationRecord[]>([])
  const [loadingSimulation, setLoadingSimulation] = useState<boolean>(false)
  const [debugLog, setDebugLog] = useState<string[]>([])

  // Carregar cenarios.csv ao montar o componente
  useEffect(() => {
    const fetchCenarios = async () => {
      try {
        console.log('Carregando cenarios.csv com PapaParse...')
        const response = await fetch('/cenarios.csv')
        const text = await response.text()

        Papa.parse(text, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            const parsed = results.data as Cenario[]
            console.log('Cenários parseados:', parsed)
            setCenarios(parsed)
            setLoading(false)
          },
          error: (error) => {
            console.error('Erro ao fazer parse de cenarios.csv:', error)
            setError('Erro ao carregar cenários')
            setLoading(false)
          },
        })
      } catch (err) {
        setError('Erro ao buscar cenarios.csv')
        setLoading(false)
      }
    }

    fetchCenarios()
  }, [])

  const handleSelectChange = (displayValue: string) => {
    // Encontrar o cenário correspondente
    const selected = cenarios.find(
      (c) => `${c.Fonte} | ${c.cenario} | ${c.estrategia}` === displayValue,
    )

    if (selected) {
      setSelectedFonte(selected.Fonte)
      setSelectedCenario(selected.cenario)
      setSelectedEstrategia(selected.estrategia)
      setSelectedDisplay(displayValue)

      console.log('Selecionado:')
      console.log(`  Fonte: "${selected.Fonte}"`)
      console.log(`  cenario: "${selected.cenario}"`)
      console.log(`  estrategia: "${selected.estrategia}"`)
    }
  }

  const handleImportSimulation = async () => {
    if (!selectedFonte || !selectedCenario || !selectedEstrategia) {
      alert('Selecione um cenário antes de importar dados')
      return
    }

    setLoadingSimulation(true)
    const logs: string[] = []

    try {
      logs.push('===== INICIANDO IMPORTAÇÃO =====')
      logs.push(`Fonte selecionada: "${selectedFonte}"`)
      logs.push(`cenario selecionado: "${selectedCenario}"`)
      logs.push(`estrategia selecionada: "${selectedEstrategia}"`)

      const response = await fetch('/Dados_Simulacao_novo.csv')
      const text = await response.text()

      Papa.parse(text, {
        header: true,
        skipEmptyLines: true,
        complete: (results) => {
          const parsed = results.data as SimulationRecord[]
          logs.push(`Total de registros parseados: ${parsed.length}`)

          // EXECUTAR FILTRAGEM COM MATCH EXATO
          logs.push('\n===== INICIANDO FILTRAGEM =====')

          // Debug dos primeiros 3 registros
          logs.push('--- Analisando primeiros 3 registros ---')
          for (let i = 0; i < Math.min(3, parsed.length); i++) {
            const record = parsed[i]
            const matchFonte = record.Fonte === selectedFonte
            const matchCenario = record.cenario === selectedCenario
            const matchEstrategia = record.estrategia === selectedEstrategia

            logs.push(`\nRecord ${i}:`)
            logs.push(`  Fonte: "${record.Fonte}" === "${selectedFonte}" ? ${matchFonte}`)
            logs.push(`  cenario: "${record.cenario}" === "${selectedCenario}" ? ${matchCenario}`)
            logs.push(
              `  estrategia: "${record.estrategia}" === "${selectedEstrategia}" ? ${matchEstrategia}`,
            )
            logs.push(`  MATCH GERAL: ${matchFonte && matchCenario && matchEstrategia}`)
          }
          logs.push('\n--- Fim da análise de amostra ---')

          // Executar filtro
          const filtered = parsed.filter((record) => {
            return (
              record.Fonte === selectedFonte &&
              record.cenario === selectedCenario &&
              record.estrategia === selectedEstrategia
            )
          })

          logs.push(`\nTotal de registros filtrados: ${filtered.length}`)
          logs.push('===== FILTRAGEM CONCLUÍDA =====\n')

          setFilteredData(filtered)
          setDebugLog(logs)

          console.log(logs.join('\n'))
        },
        error: (error) => {
          logs.push(`ERRO: ${error.message}`)
          setDebugLog(logs)
          console.error('Erro ao fazer parse de Dados_Simulacao_novo.csv:', error)
          alert('Erro ao importar dados de simulação')
        },
      })
    } catch (err) {
      logs.push(`ERRO: ${err instanceof Error ? err.message : 'Unknown error'}`)
      setDebugLog(logs)
      alert('Erro ao buscar arquivo de simulação')
    } finally {
      setLoadingSimulation(false)
    }
  }

  if (loading) {
    return <div>Carregando cenários...</div>
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
          <Select value={selectedDisplay} onValueChange={handleSelectChange}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cenário" />
            </SelectTrigger>
            <SelectContent>
              {cenarios.map((scenario, index) => {
                const displayValue = `${scenario.Fonte} | ${scenario.cenario} | ${scenario.estrategia}`
                return (
                  <SelectItem key={index} value={displayValue}>
                    {displayValue}
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Button
        onClick={handleImportSimulation}
        disabled={loadingSimulation || !selectedFonte}
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
