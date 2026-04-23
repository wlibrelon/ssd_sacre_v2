import React, { useState, useEffect, useMemo, useCallback } from 'react'
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
  cenario: string
}

type SimulationRecord = {
  Mes: string
  cenario: string
  Vazao_Ajustada: number
  Volume_Captado: number
  Demanda: number
  CAPEX: number
  OPEX: number
}

type DemandaRow = {
  Cenario: string
  Consumo: string
  Mes: string
  Demanda: number
}

type PerdasRow = {
  Indice_Perda: string
  Mes: string
  Perda: number
}

type MergedSimulationRecord = SimulationRecord & {
  Demanda: number
  Perda: number
}

const Cenarios: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [selectedScenario, setSelectedScenario] = useState<string>('')
  const [simulationData, setSimulationData] = useState<SimulationRecord[]>([])
  const [filteredData, setFilteredData] = useState<SimulationRecord[]>([])
  const [demandaData, setDemandaData] = useState<DemandaRow[]>([])
  const [perdasData, setPerdasData] = useState<PerdasRow[]>([])
  const [mergedData, setMergedData] = useState<MergedSimulationRecord[]>([])
  const [demandaCenario, setDemandaCenario] = useState<string>('')
  const [demandaConsumo, setDemandaConsumo] = useState<string>('')
  const [indicePerda, setIndicePerda] = useState<string>('')

  const normalizeString = useCallback((str: string): string => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .replace(/[^a-z0-9]/gi, '')
      .trim()
      .toLowerCase()
  }, [])

  const formatNumber = useCallback((num: number): string => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'decimal',
      minimumFractionDigits: 0,
      maximumFractionDigits: 2,
    }).format(num)
  }, [])

  useEffect(() => {
    Papa.parse('/cenarios.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const data = results.data as any[]
        const cleanData = data
          .filter((row) => row && row.cenario)
          .map((row) => ({ cenario: row.cenario }))
        setScenarios(cleanData as Scenario[])
      },
    })
  }, [])

  const handleScenarioChange = useCallback(
    (value: string) => {
      setSelectedScenario(value)
      setMergedData([])
      if (simulationData.length > 0) {
        const filtered = simulationData.filter((row) => normalizeString(row.cenario) === value)
        setFilteredData(filtered)
      }
    },
    [simulationData, normalizeString],
  )

  const handleImportSimulation = useCallback(() => {
    // Load simulation data
    Papa.parse('/Dados_Simulacao_novo.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rawData = results.data as any[]
        const data: SimulationRecord[] = rawData
          .filter((row) => row && row.Mes && row.cenario)
          .map((row) => ({
            Mes: row.Mes,
            cenario: row.cenario,
            Vazao_Ajustada: parseFloat(row.Vazao_Ajustada || '0'),
            Volume_Captado: parseFloat(row.Volume_Captado || '0'),
            Demanda: parseFloat(row.Demanda || '0'),
            CAPEX: parseFloat(row.CAPEX || '0'),
            OPEX: parseFloat(row.OPEX || '0'),
          }))
          .filter((row) => !isNaN(row.Vazao_Ajustada))
        setSimulationData(data)
        if (selectedScenario) {
          const filtered = data.filter((row) => normalizeString(row.cenario) === selectedScenario)
          setFilteredData(filtered)
        } else {
          setFilteredData(data)
        }
      },
    })

    // Load demanda data
    Papa.parse('/cenarios_demanda.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rawData = results.data as any[]
        const data: DemandaRow[] = rawData
          .filter((row) => row && row.Mes)
          .map((row) => ({
            Cenario: row.Cenario,
            Consumo: row.Consumo,
            Mes: row.Mes,
            Demanda: parseFloat(row.Demanda || '0'),
          }))
          .filter((row) => !isNaN(row.Demanda))
        setDemandaData(data)
      },
    })

    // Load perdas data
    Papa.parse('/cenarios_perdas.csv', {
      download: true,
      header: true,
      skipEmptyLines: true,
      complete: (results) => {
        const rawData = results.data as any[]
        const data: PerdasRow[] = rawData
          .filter((row) => row && row.Mes)
          .map((row) => ({
            Indice_Perda: row.Indice_Perda,
            Mes: row.Mes,
            Perda: parseFloat(row.Perda || '0'),
          }))
          .filter((row) => !isNaN(row.Perda))
        setPerdasData(data)
      },
    })
  }, [selectedScenario, normalizeString])

  const demandaCenarios = useMemo(
    () => Array.from(new Set(demandaData.map((d) => normalizeString(d.Cenario)))),
    [demandaData, normalizeString],
  )
  const demandaConsumos = useMemo(
    () => Array.from(new Set(demandaData.map((d) => normalizeString(d.Consumo)))),
    [demandaData, normalizeString],
  )
  const indicesPerda = useMemo(
    () => Array.from(new Set(perdasData.map((p) => normalizeString(p.Indice_Perda)))),
    [perdasData, normalizeString],
  )

  const handleExecuteSimulation = useCallback(() => {
    if (!selectedScenario || filteredData.length === 0) {
      alert('Selecione um cenário e importe a simulação primeiro.')
      return
    }
    if (!demandaCenario || !demandaConsumo || !indicePerda) {
      alert('Selecione cenário de demanda, consumo e índice de perda.')
      return
    }

    const filteredDemanda = demandaData.filter(
      (d) =>
        normalizeString(d.Cenario) === demandaCenario &&
        normalizeString(d.Consumo) === demandaConsumo,
    )
    if (filteredDemanda.length === 0) {
      alert('Nenhum dado de demanda encontrado para as seleções.')
      return
    }
    const demandaMap = new Map(filteredDemanda.map((d) => [d.Mes, d.Demanda]))

    const filteredPerdas = perdasData.filter((p) => normalizeString(p.Indice_Perda) === indicePerda)
    if (filteredPerdas.length === 0) {
      alert('Nenhum dado de perdas encontrado para a seleção.')
      return
    }
    const perdasMap = new Map(filteredPerdas.map((p) => [p.Mes, p.Perda]))

    const merged: MergedSimulationRecord[] = filteredData
      .map((row) => ({
        ...row,
        Demanda: demandaMap.get(row.Mes) || row.Demanda,
        Perda: perdasMap.get(row.Mes) || 0,
      }))
      .filter((m) => m.Mes) // Ensure valid

    setMergedData(merged)
  }, [
    selectedScenario,
    filteredData,
    demandaData,
    perdasData,
    demandaCenario,
    demandaConsumo,
    indicePerda,
    normalizeString,
  ])

  const summary = useMemo(() => {
    if (filteredData.length === 0) {
      return { tempo: 0, volume: 0, demanda: 0, capex: 0, opex: 0 }
    }
    const tempo = filteredData.length
    const volume = filteredData.reduce((sum, r) => sum + r.Volume_Captado, 0)
    const demandaTotal = filteredData.reduce((sum, r) => sum + r.Demanda, 0)
    const capex = filteredData.reduce((sum, r) => sum + r.CAPEX, 0)
    const opex = filteredData.reduce((sum, r) => sum + r.OPEX, 0)
    return { tempo, volume, demanda: demandaTotal, capex, opex }
  }, [filteredData])

  const sensitivityMetrics = useMemo(() => {
    if (mergedData.length === 0) {
      return {
        vazaoMedia: 0,
        perdaTotal: 0,
        deficitMedio: 0,
        superavitMedio: 0,
        taxaCoberturaMedia: 0,
      }
    }
    const vazaoMedia = mergedData.reduce((sum, r) => sum + r.Vazao_Ajustada, 0) / mergedData.length
    const perdaTotal = mergedData.reduce((sum, r) => sum + r.Perda, 0)
    let deficitSum = 0
    let superavitSum = 0
    let coberturaSum = 0
    mergedData.forEach((r) => {
      const disponivel = r.Vazao_Ajustada - r.Perda
      const deficit = Math.max(0, r.Demanda - disponivel)
      const superavit = Math.max(0, disponivel - r.Demanda)
      deficitSum += deficit
      superavitSum += superavit
      if (r.Demanda > 0) {
        coberturaSum += (disponivel / r.Demanda) * 100
      }
    })
    const deficitMedio = deficitSum / mergedData.length
    const superavitMedio = superavitSum / mergedData.length
    const taxaCoberturaMedia = coberturaSum / mergedData.length
    return {
      vazaoMedia,
      perdaTotal,
      deficitMedio,
      superavitMedio,
      taxaCoberturaMedia,
    }
  }, [mergedData])

  return (
    <div className="container mx-auto p-6 space-y-6">
      <h1 className="text-3xl font-bold">Dashboard SACRE - Simulação de Abastecimento</h1>

      <Button onClick={handleImportSimulation} className="w-full md:w-auto">
        Importar Dados de Simulação
      </Button>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Card de seleção de cenários */}
        <div className="md:col-span-3">
          <Card>
            <CardHeader>
              <CardTitle>Seleção de Cenário</CardTitle>
            </CardHeader>
            <CardContent>
              <Select value={selectedScenario} onValueChange={handleScenarioChange}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um cenário" />
                </SelectTrigger>
                <SelectContent>
                  {scenarios.map((s, index) => (
                    <SelectItem key={index} value={normalizeString(s.cenario)}>
                      {s.cenario}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </CardContent>
          </Card>
        </div>

        {/* Card Demanda de Consumo */}
        <div className="md:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle>Demanda de Consumo</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <label className="text-sm font-medium block mb-1">Cenário de Demanda</label>
                <Select value={demandaCenario} onValueChange={setDemandaCenario}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {demandaCenarios.map((cen, index) => (
                      <SelectItem key={index} value={cen}>
                        {cen}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <label className="text-sm font-medium block mb-1">Consumo</label>
                <Select value={demandaConsumo} onValueChange={setDemandaConsumo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {demandaConsumos.map((con, index) => (
                      <SelectItem key={index} value={con}>
                        {con}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Card Cenários de Perdas */}
        <div className="md:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Cenários de Perdas</CardTitle>
            </CardHeader>
            <CardContent>
              <div>
                <label className="text-sm font-medium block mb-1">Índice de Perda</label>
                <Select value={indicePerda} onValueChange={setIndicePerda}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione" />
                  </SelectTrigger>
                  <SelectContent>
                    {indicesPerda.map((ind, index) => (
                      <SelectItem key={index} value={ind}>
                        {ind}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Botão Executar a Simulação */}
        <div className="md:col-span-3">
          <Button onClick={handleExecuteSimulation} className="w-full h-12 text-lg">
            Executar a Simulação
          </Button>
        </div>
      </div>

      {/* Cards de resumo */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Resumo da Simulação</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Tempo total</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{summary.tempo} meses</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Volume captado</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatNumber(summary.volume)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">Demanda</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatNumber(summary.demanda)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">CAPEX</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatNumber(summary.capex)}</p>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-lg">OPEX</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-3xl font-bold">{formatNumber(summary.opex)}</p>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Dashboard de sensibilidade */}
      {mergedData.length > 0 && (
        <div>
          <h2 className="text-2xl font-semibold mb-4">Dashboard de Sensibilidade Hidrológica</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Vazão Ajustada Média</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatNumber(sensitivityMetrics.vazaoMedia)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Perda Total</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">{formatNumber(sensitivityMetrics.perdaTotal)}</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Déficit Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {formatNumber(sensitivityMetrics.deficitMedio)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Superávit Médio</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {formatNumber(sensitivityMetrics.superavitMedio)}
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-lg">Taxa de Cobertura Média</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-3xl font-bold">
                  {formatNumber(sensitivityMetrics.taxaCoberturaMedia)}%
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  )
}

export default Cenarios
