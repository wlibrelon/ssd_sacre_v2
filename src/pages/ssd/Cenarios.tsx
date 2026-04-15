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
import { Play } from 'lucide-react'
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
  const { csvData, simulacao } = useSimulationStore()
  const [selectedSimulacaoIndex, setSelectedSimulacaoIndex] = useState<number>(0)
  const [globalPerdas, setGlobalPerdas] = useState(0.3)
  const [globalDemanda, setGlobalDemanda] = useState(100)
  const [results, setResults] = useState<any[]>([])
  const [timeData, setTimeData] = useState<any[]>([])

  const handleSimulate = () => {
    // Manter toda a lógica original, usando dados de simulacao selecionada
    const res = csvData.map((r) => {
      return {
        ...r,
        Vazao_Distribuida: r.Vazao_Captada * (1 - globalPerdas),
        Demanda: globalDemanda,
        Cenario_Simulacao:
          selectedSimulacaoIndex >= 0
            ? `${simulacao[selectedSimulacaoIndex].fonte} | ${simulacao[selectedSimulacaoIndex].cenarios} | ${simulacao[selectedSimulacaoIndex].estrategias}`
            : '',
      }
    })
    setResults(res)

    const grouped = res.reduce((acc: any, row) => {
      if (!acc[row.Tempo])
        acc[row.Tempo] = { Tempo: row.Tempo, Demanda: row.Demanda, TotalCap: 0, TotalDist: 0 }
      acc[row.Tempo][`${row.Fonte}_Cap`] = row.Vazao_Captada
      acc[row.Tempo].TotalCap += row.Vazao_Captada
      acc[row.Tempo].TotalDist += row.Vazao_Distribuida
      return acc
    }, {})

    setTimeData(
      Object.values(grouped)
        .map((t: any) => ({ ...t, Saldo: t.TotalDist - t.Demanda }))
        .sort((a, b) => a.Tempo.localeCompare(b.Tempo)),
    )
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

      {/* ✅ NOVO: Tabela de Simulação - PRIMEIRO CARD */}
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

      {/* Quadro: Seleção de Simulação */}
      {simulacao && simulacao.length > 0 && (
        <Card className="shadow-sm border-t-4 border-t-secondary">
          <CardHeader className="py-4 bg-slate-50/50">
            <CardTitle className="text-lg">Seleção de Simulação</CardTitle>
          </CardHeader>
          <CardContent className="pt-4">
            <div className="space-y-2">
              <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-1">
                Cenários e Estratégias
              </p>
              <Select
                value={selectedSimulacaoIndex.toString()}
                onValueChange={(v) => setSelectedSimulacaoIndex(parseInt(v))}
              >
                <SelectTrigger className="h-9 text-xs font-medium">
                  <SelectValue placeholder="Selecione uma simulação" />
                </SelectTrigger>
                <SelectContent>
                  {simulacao.map((s, idx) => (
                    <SelectItem key={idx} value={idx.toString()}>
                      {`${s.fonte} | ${s.cenarios} | ${s.estrategias}`}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Quadro Parâmetros Globais - MANTIDO INTACTO */}
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

      {/* Botão Rodar Simulação - MANTIDO INTACTO */}
      <div className="flex justify-end">
        <Button
          onClick={handleSimulate}
          size="lg"
          className="w-full sm:w-auto bg-primary text-white shadow-md hover:bg-primary/90"
        >
          <Play className="w-4 h-4 mr-2" /> Rodar Simulação
        </Button>
      </div>

      {/* Gráficos - MANTIDO INTACTO */}
      {results.length > 0 && <SimulationCharts results={results} timeData={timeData} />}
    </div>
  )
}
