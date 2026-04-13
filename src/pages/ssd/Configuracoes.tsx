import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Button } from '@/components/ui/button'
import { Upload } from 'lucide-react'
import useSimulationStore from '@/stores/useSimulationStore'
import { useToast } from '@/hooks/use-toast'

const FONTES = [
  { id: 1, desc: 'Batalha (Superficial)' },
  { id: 2, desc: 'Bauru (Subterrânea)' },
  { id: 3, desc: 'Guarani (Subterrânea)' },
]
const ACOES = [
  { id: 1, desc: 'Nova Captação' },
  { id: 2, desc: 'Tratamento Avançado' },
]
const CENARIOS = [
  { id: 1, desc: 'Base' },
  { id: 2, desc: 'Pessimista' },
]
const SUB = [
  { id: 1, desc: 'Curto Prazo' },
  { id: 2, desc: 'Longo Prazo' },
]
const PERDAS = [
  { desc: 'Atual', val: '30%' },
  { desc: 'Reduzida', val: '15%' },
]
const DEMANDAS = [
  { id: 1, desc: 'Tendência Histórica' },
  { id: 2, desc: 'Acelerada' },
]

const DataPanel = ({ title, data, cols }: { title?: string; data: any[]; cols: string[] }) => (
  <div className="space-y-2">
    {title && <h3 className="text-sm font-semibold text-primary">{title}</h3>}
    <div className="border rounded-md max-h-[220px] overflow-auto bg-white">
      <Table className="text-xs">
        <TableHeader>
          <TableRow>
            {cols.map((c) => (
              <TableHead key={c}>{c}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((r, i) => (
            <TableRow key={i}>
              {Object.values(r).map((v: any, j) => (
                <TableCell key={j}>{v}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  </div>
)

export default function Configuracoes() {
  const { csvData, setCsvData, taxaRetorno, setTaxaRetorno } = useSimulationStore()
  const [taxa, setTaxa] = useState(taxaRetorno.toString())
  const { toast } = useToast()

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        const lines = (event.target?.result as string).split('\n')
        const parsed = lines
          .slice(1)
          .filter((l) => l.trim())
          .map((line) => {
            const [Tempo, Fonte, Vazao_Captada, Demanda, CAPEX, OPEX, Aceitacao_Social] =
              line.split(',')
            return {
              Tempo,
              Fonte,
              Vazao_Captada: parseFloat(Vazao_Captada),
              Demanda: parseFloat(Demanda),
              CAPEX: parseFloat(CAPEX),
              OPEX: parseFloat(OPEX),
              Aceitacao_Social: parseInt(Aceitacao_Social),
            }
          })
        if (parsed.length > 0 && parsed[0].Tempo) {
          setCsvData(parsed)
          toast({
            title: 'Sucesso',
            description: `${parsed.length} linhas importadas e formatadas.`,
          })
        } else throw new Error('Invalid CSV')
      } catch (err) {
        toast({
          title: 'Erro de Importação',
          description: 'Formato de CSV inválido.',
          variant: 'destructive',
        })
      }
    }
    reader.readAsText(file)
  }

  return (
    <div className="space-y-6 animate-fade-in max-w-6xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-primary">Configurações do SSD</h1>
        <p className="text-muted-foreground">
          Parâmetros e matrizes de dados para simulação hidroeconômica.
        </p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">1. Fontes de Água</CardTitle>
          </CardHeader>
          <CardContent>
            <DataPanel data={FONTES} cols={['ID', 'Descrição']} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">2. Cenários por fonte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <DataPanel title="Ações" data={ACOES} cols={['ID', 'Descrição']} />
            <DataPanel title="Cenários" data={CENARIOS} cols={['ID', 'Descrição']} />
            <DataPanel title="Tipo de Sub Cenário" data={SUB} cols={['ID', 'Descrição']} />
          </CardContent>
        </Card>

        <Card className="shadow-sm">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">3. Cenários do sistema de abastecimento</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <DataPanel title="Trajetória de Perdas" data={PERDAS} cols={['Descrição', 'Valor']} />
            <DataPanel title="Cenário de Demanda" data={DEMANDAS} cols={['ID', 'Descrição']} />
            <div className="space-y-2 pt-2 border-t">
              <Label>Taxa de Retorno (%)</Label>
              <div className="flex gap-2 max-w-xs">
                <Input
                  type="number"
                  step="0.01"
                  value={taxa}
                  onChange={(e) => setTaxa(e.target.value)}
                />
                <Button onClick={() => setTaxaRetorno(parseFloat(taxa))} variant="secondary">
                  Salvar
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="shadow-sm border-secondary/20">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">4. Importação de Dados (CSV)</CardTitle>
          </CardHeader>
          <CardContent className="space-y-5">
            <div className="flex items-center gap-4 bg-slate-50 p-4 rounded-lg border">
              <Input
                type="file"
                accept=".csv"
                onChange={handleUpload}
                className="max-w-[200px] cursor-pointer"
              />
              <Button variant="outline" className="pointer-events-none">
                <Upload className="mr-2 h-4 w-4" /> Escolher .csv
              </Button>
            </div>
            {csvData.length > 0 ? (
              <DataPanel
                title={`Preview da Matriz (${csvData.length} registros)`}
                data={csvData.slice(0, 5)}
                cols={['Tempo', 'Fonte', 'Vazão Cap.', 'Demanda', 'CAPEX', 'OPEX', 'Aceitação']}
              />
            ) : (
              <p className="text-sm text-muted-foreground italic">
                Nenhuma matriz de dados importada.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
