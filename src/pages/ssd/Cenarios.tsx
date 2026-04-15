import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Play, Upload } from 'lucide-react'
import useSimulationStore from '@/stores/useSimulationStore'
import { SimulationCharts } from '@/components/SimulationCharts'

const PERDAS = [
  { label: 'Atual (30%)', val: 0.3 },
  { label: 'Meta (15%)', val: 0.15 },
]
const DEMANDAS = [
  { label: 'Tendencial', val: 100 },
  { label: 'Acelerada', val: 120 },
  { label: 'Reduzida', val: 80 },
]

const MySelect = ({ val, setVal, placeholder, options }: any) => (
  <Select value={val} onValueChange={setVal}>
    <SelectTrigger className="h-9 text-xs font-medium">
      <SelectValue placeholder={placeholder} />
    </SelectTrigger>
    <SelectContent>
      {options.map((o: any) => (
        <SelectItem key={o.val ?? o} value={o.val?.toString() ?? o}>
          {o.label ?? o}
        </SelectItem>
      ))}
    </SelectContent>
  </Select>
)

export default function Cenarios() {
  const { simulacao } = useSimulationStore()
  const [csvData, setCsvData] = useState<any[]>([])
  const [csvPreview, setCsvPreview] = useState<any[]>([])
  const [csvError, setCsvError] = useState<string>('')
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const [globalPerdas, setGlobalPerdas] = useState(0.3)
  const [globalDemanda, setGlobalDemanda] = useState(100)
  const [results, setResults] = useState<any[]>([])
  const [timeData, setTimeData] = useState<any[]>([])
  const [processingInfo, setProcessingInfo] = useState<any[]>([])

  const requiredColumns = [
    'Tempo',
    'Fonte',
    'cenario',
    'estrategia',
    'Vazao_Captada',
    'Demanda',
    'CAPEX',
    'OPEX',
    'Aceitacao_Social',
  ]

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file.name)
    const reader = new FileReader()

    reader.onload = (event) => {
      try {
        let result = event.target?.result as string | undefined
        if (!result) throw new Error('Arquivo vazio ou inválido')

        const lines = result.split('\n')
        const headers = lines[0].split(',').map((h) => h.trim())

        // Validar colunas obrigatórias
        const missingColumns = requiredColumns.filter((col) => !headers.includes(col))
        if (missingColumns.length > 0) {
          setCsvError(`Colunas obrigatórias faltando: ${missingColumns.join(', ')}`)
          setCsvData([])
          setCsvPreview([])
          return
        }

        setCsvError('')

        // Parse dados
        const parsed = lines
          .slice(1)
          .filter((l) => l.trim())
          .map((line) => {
            const values = line.split(',').map((v) => v.trim())
            const obj: any = {}
            headers.forEach((header, index) => {
              obj[header] = values[index]
            })
            return obj
          })

        setCsvData(parsed)
        setCsvPreview(parsed.slice(0, 5))
      } catch (err) {
        setSelectedFile(null)
        setCsvError(
          `Erro ao processar CSV: ${err instanceof Error ? err.message : 'erro desconhecido'}`,
        )
        setCsvData([])
        setCsvPreview([])
      }
    }

    reader.readAsText(file, 'UTF-8')
  }

  // ✅ NOVA FUNÇÃO: Filtrar csvData por cada simulacao
  const filterCsvBySimulation = (csvData: any[], simRow: any) => {
    return csvData.filter(
      (row) =>
        row.Fonte === simRow.fonte &&
        row.cenario === simRow.cenarios &&
        row.estrategia === simRow.estrategia,
    )
  }

  // ✅ MODIFICADO: handleSimulate com lógica de filtro multi-critério
  const handleSimulate = () => {
    if (csvData.length === 0) {
      alert('Por favor, importe um CSV válido antes de rodar a simulação')
      return
    }

    if (!simulacao || simulacao.length === 0) {
      alert('Por favor, configure simulações na página de Configurações')
      return
    }

    // Arrays para acumular resultados
    let allResults: any[] = []
    let consolidatedTimeData: any[] = {}
    const procInfo: any[] = []

    // ✅ LOOP: Processar cada simulacao
    simulacao.forEach((sim, simIndex) => {
      // Filtrar csvData por Fonte, Cenario, Estrategia
      const filteredData = filterCsvBySimulation(csvData, sim)

      console.log(
        `Simulação ${simIndex}: Fonte=${sim.fonte}, Cenario=${sim.cenarios}, Estrategia=${sim.estrategia}`,
      )
      console.log(`  → Registros encontrados: ${filteredData.length}`)

      // Processa apenas dados filtrados
      const res = filteredData.map((r) => {
        return {
          ...r,
          Vazao_Distribuida: parseFloat(r.Vazao_Captada) * (1 - globalPerdas),
          Demanda_Ajustada: globalDemanda,
          Simulacao_Index: simIndex,
        }
      })

      allResults = [...allResults, ...res]

      // Agrupar por Tempo (similar ao original)
      const grouped = res.reduce((acc: any, row) => {
        if (!acc[row.Tempo])
          acc[row.Tempo] = { Tempo: row.Tempo, Demanda: row.Demanda, TotalCap: 0, TotalDist: 0 }
        acc[row.Tempo][`${row.Fonte}_Cap`] = parseFloat(row.Vazao_Captada)
        acc[row.Tempo].TotalCap += parseFloat(row.Vazao_Captada)
        acc[row.Tempo].TotalDist += parseFloat(res[0].Vazao_Distribuida)
        return acc
      }, {})

      // Consolidar timeData
      Object.entries(grouped).forEach(([tempo, data]) => {
        if (!consolidatedTimeData[tempo]) {
          consolidatedTimeData[tempo] = data
        } else {
          ;(consolidatedTimeData[tempo] as any).TotalCap += (data as any).TotalCap
          ;(consolidatedTimeData[tempo] as any).TotalDist += (data as any).TotalDist
        }
      })

      // Registrar informação de processamento
      procInfo.push({
        simulacao_index: simIndex,
        fonte: sim.fonte,
        cenario: sim.cenarios,
        estrategia: sim.estrategia,
        registros_encontrados: filteredData.length,
      })
    })

    setResults(allResults)

    // ✅ Consolidar timeData final
    const finalTimeData = Object.values(consolidatedTimeData)
      .map((t: any) => ({ ...t, Saldo: t.TotalDist - t.Demanda }))
      .sort((a: any, b: any) => a.Tempo.localeCompare(b.Tempo))

    setTimeData(finalTimeData)
    setProcessingInfo(procInfo)
  }

  return (
    <div className="space-y-6 max-w-7xl mx-auto animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-primary">Simulador de Cenários</h1>
        <p className="text-muted-foreground mt-1">
          Configure os parâmetros para cada fonte e execute o modelo matemático para prever os
          resultados.
        </p>
      </div>

      {/* ✅ Tabela de Simulação */}
      {simulacao && simulacao.length > 0 && (
        <Card className="shadow-sm border-t-4 border-t-secondary">
          <CardHeader className="py-4 bg-slate-50/50">
            <CardTitle className="text-lg">Tabela de Simulação</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr>
                    <th className="border border-gray-300 p-2 text-left">Fonte</th>
                    <th className="border border-gray-300 p-2 text-left">Cenários</th>
                    <th className="border border-gray-300 p-2 text-left">Estratégias</th>
                  </tr>
                </thead>
                <tbody>
                  {simulacao.map((s, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-2">{s.fonte}</td>
                      <td className="border border-gray-300 p-2">{s.cenarios}</td>
                      <td className="border border-gray-300 p-2">{s.estrategias}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✅ Quadro Parâmetros Globais - MANTIDO INTACTO */}
      <Card className="shadow-sm border-t-4 border-t-secondary">
        <CardHeader className="py-4 bg-slate-50/50">
          <CardTitle className="text-lg">Parâmetros Globais</CardTitle>
        </CardHeader>
        <CardContent className="pt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Perdas
              </p>
              <MySelect
                val={globalPerdas.toString()}
                setVal={(v: string) => setGlobalPerdas(parseFloat(v))}
                placeholder="Trajetória de Perdas"
                options={PERDAS}
              />
            </div>
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Demanda
              </p>
              <MySelect
                val={globalDemanda.toString()}
                setVal={(v: string) => setGlobalDemanda(parseFloat(v))}
                placeholder="Cenário de Demanda"
                options={DEMANDAS}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ✅ NOVO: Resumo de Processamento */}
      {processingInfo.length > 0 && (
        <Card className="shadow-sm border-t-4 border-t-green-500">
          <CardHeader className="py-4 bg-green-50/50">
            <CardTitle className="text-lg">Resumo de Simulações Processadas</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="overflow-x-auto">
              <table className="w-full border-collapse border border-gray-300">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="border border-gray-300 p-2 text-left">Índice</th>
                    <th className="border border-gray-300 p-2 text-left">Fonte</th>
                    <th className="border border-gray-300 p-2 text-left">Cenário</th>
                    <th className="border border-gray-300 p-2 text-left">Estratégia</th>
                    <th className="border border-gray-300 p-2 text-center">
                      Registros Encontrados
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {processingInfo.map((info, i) => (
                    <tr key={i} className="hover:bg-gray-50">
                      <td className="border border-gray-300 p-2">{info.simulacao_index}</td>
                      <td className="border border-gray-300 p-2">{info.fonte}</td>
                      <td className="border border-gray-300 p-2">{info.cenario}</td>
                      <td className="border border-gray-300 p-2">{info.estrategia}</td>
                      <td className="border border-gray-300 p-2 text-center font-semibold">
                        {info.registros_encontrados}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </Card>
      )}

      {/* ✅ NOVO: Quadro Importação CSV */}
      <Card className="shadow-sm border-t-4 border-t-secondary">
        <CardHeader className="py-4 bg-slate-50/50">
          <CardTitle className="text-lg">Importação de Dados (CSV)</CardTitle>
        </CardHeader>
        <CardContent className="pt-4 space-y-4">
          <div className="bg-slate-50 p-6 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary/50 transition-all duration-200 group">
            <label htmlFor="csv-file" className="cursor-pointer block w-full">
              <Button
                type="button"
                size="lg"
                className="w-full justify-center group-hover:scale-[1.02] transition-transform"
                onClick={() => document.getElementById('csv-file')?.click()}
              >
                <Upload className="mr-2 h-5 w-5" />
                {selectedFile ? 'Alterar arquivo' : 'Escolher .CSV'}
              </Button>
            </label>
            <input
              id="csv-file"
              type="file"
              accept=".csv"
              onChange={handleFileUpload}
              className="sr-only"
            />
            {selectedFile && (
              <p className="mt-3 text-sm text-green-600 font-medium flex items-center justify-center">
                ✅ {selectedFile} selecionado
              </p>
            )}
            <p className="mt-2 text-xs text-muted-foreground text-center">
              Selecione um CSV com colunas: Tempo, Fonte, cenario, estrategia, Vazao_Captada,
              Demanda, CAPEX, OPEX, Aceitacao_Social
            </p>
          </div>

          {csvError && (
            <div className="bg-red-50 p-4 rounded-md border border-red-200">
              <p className="text-sm text-red-700">❌ {csvError}</p>
            </div>
          )}

          {csvPreview.length > 0 && (
            <div>
              <h3 className="text-sm font-semibold mb-2">
                Preview dos Dados ({csvData.length} registros)
              </h3>
              <div className="overflow-x-auto border rounded-md max-h-[300px] overflow-y-auto">
                <table className="w-full border-collapse border border-gray-300 text-xs">
                  <thead className="bg-gray-100 sticky top-0">
                    <tr>
                      {requiredColumns.map((col) => (
                        <th key={col} className="border border-gray-300 p-2 text-left">
                          {col}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {csvPreview.map((row, i) => (
                      <tr key={i} className="hover:bg-gray-50">
                        {requiredColumns.map((col) => (
                          <td key={col} className="border border-gray-300 p-2">
                            {row[col] || '-'}
                          </td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* ✅ Botão Rodar Simulação - MANTIDO INTACTO */}
      <div className="flex justify-end">
        <Button
          onClick={handleSimulate}
          size="lg"
          className="w-full sm:w-auto bg-primary text-white shadow-md hover:bg-primary/90"
        >
          <Play className="w-4 h-4 mr-2" /> Rodar Simulação
        </Button>
      </div>

      {/* ✅ Gráficos - MANTIDO INTACTO */}
      {results.length > 0 && <SimulationCharts results={results} timeData={timeData} />}
    </div>
  )
}
