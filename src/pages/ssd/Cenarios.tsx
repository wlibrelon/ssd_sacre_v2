import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Button } from '@/components/ui/button'
import { Play } from 'lucide-react'
import useSimulationStore from '@/stores/useSimulationStore'
import { SimulationCharts } from '@/components/SimulationCharts'

const FONTES = ['Batalha', 'Bauru', 'Guarani']
const CENARIOS = ['Base', 'Clima Seco', 'Clima Úmido']
const SUB_CENARIOS = ['Curto Prazo', 'Médio Prazo', 'Longo Prazo']
const PERDAS = [
  { label: 'Atual (30%)', val: 0.3 },
  { label: 'Meta (15%)', val: 0.15 },
]
const DEMANDAS = ['Normal', 'Alta (+20%)', 'Baixa (-10%)']
const ACOES = ['Ação 1: Nova Captação', 'Ação 2: Tratamento Avançado', 'Ação 3: Conscientização']

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
  const { csvData } = useSimulationStore()
  const [selections, setSelections] = useState<Record<string, any>>(
    FONTES.reduce(
      (acc, f) => ({ ...acc, [f]: { cenario: '', sub: '', perdas: 0.3, demanda: '', acoes: [] } }),
      {},
    ),
  )
  const [results, setResults] = useState<any[]>([])
  const [timeData, setTimeData] = useState<any[]>([])

  const handleSimulate = () => {
    const res = csvData.map((r) => {
      const sel = selections[r.Fonte]
      const perdas = sel ? sel.perdas : 0.3
      return {
        ...r,
        Vazao_Distribuida: r.Vazao_Captada * (1 - perdas),
        Cenario_da_fonte: sel ? `${sel.cenario} ${sel.sub}` : '',
        Acoes: sel ? sel.acoes.join(', ') : '',
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

      <div className="grid md:grid-cols-3 gap-6">
        {FONTES.map((f) => {
          const sel = selections[f]
          const update = (k: string, v: any) =>
            setSelections((s) => ({ ...s, [f]: { ...s[f], [k]: v } }))
          return (
            <Card key={f} className="shadow-sm border-t-4 border-t-secondary">
              <CardHeader className="py-4 bg-slate-50/50">
                <CardTitle className="text-lg">{f}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 pt-4">
                <div className="space-y-2">
                  <MySelect
                    val={sel.cenario}
                    setVal={(v: string) => update('cenario', v)}
                    placeholder="Selecione o Cenário"
                    options={CENARIOS}
                  />
                  <MySelect
                    val={sel.sub}
                    setVal={(v: string) => update('sub', v)}
                    placeholder="Sub Cenário"
                    options={SUB_CENARIOS}
                  />
                  <MySelect
                    val={sel.perdas.toString()}
                    setVal={(v: string) => update('perdas', parseFloat(v))}
                    placeholder="Trajetória de Perdas"
                    options={PERDAS}
                  />
                  <MySelect
                    val={sel.demanda}
                    setVal={(v: string) => update('demanda', v)}
                    placeholder="Cenário de Demanda"
                    options={DEMANDAS}
                  />
                </div>
                <div className="pt-3 border-t">
                  <p className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                    Ações Integradas
                  </p>
                  <div className="space-y-1.5">
                    {ACOES.map((a) => (
                      <label
                        key={a}
                        className="flex items-start gap-2 text-xs py-0.5 cursor-pointer group"
                      >
                        <Checkbox
                          checked={sel.acoes.includes(a)}
                          onCheckedChange={(c) =>
                            update(
                              'acoes',
                              c ? [...sel.acoes, a] : sel.acoes.filter((x: string) => x !== a),
                            )
                          }
                          className="mt-0.5"
                        />
                        <span className="group-hover:text-primary transition-colors leading-tight">
                          {a}
                        </span>
                      </label>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      <div className="flex justify-end">
        <Button
          onClick={handleSimulate}
          size="lg"
          className="w-full sm:w-auto bg-primary text-white shadow-md hover:bg-primary/90"
        >
          <Play className="w-4 h-4 mr-2" /> Rodar Simulação
        </Button>
      </div>

      {results.length > 0 && <SimulationCharts results={results} timeData={timeData} />}
    </div>
  )
}
