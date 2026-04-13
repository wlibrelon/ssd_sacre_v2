import { useState, useRef } from 'react'
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
  { id: 1, desc: 'Barraginhas' },
  { id: 1, desc: 'Campo de poços SAG' },
  { id: 1, desc: 'Uso atual SAG' },
  { id: 1, desc: 'Inclusão de 100 poços SAG' },
  { id: 2, desc: 'Uso atual SAB' },
]
const CENARIOS = [
  { id: 1, desc: 'Tendencial' },
  { id: 1, desc: 'Pessimista' },
  { id: 2, desc: 'Conservacionista' },
]
const SUB = [
  { id: 1, desc: 'Clima' },
  { id: 1, desc: 'Uso da Terra Batalha' },
  { id: 1, desc: 'Uso da Terra Bauru' },
  { id: 2, desc: 'Condutividade SAG' },
]
const PERDAS = [
  { desc: 'Atual', val: '30%' },
  { desc: 'Reduzida', val: '15%' },
]
const DEMANDAS = [
  { id: 1, desc: 'Tendencial' },
  { id: 1, desc: 'Acelerada' },
  { id: 2, desc: 'Reduzida' },
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

// 🔧 Função auxiliar para corrigir encoding de caracteres acentuados
function fixEncoding(text: string): string {
  // Detecta caracteres corrompidos comuns quando UTF-8 é mal interpretado
  const hasCorruptedChars =
    /[\u00C2\u00C3\u00C9\u00CA\u00D4\u00DB\u00E2\u00EA\u00F4\u00FB\uFFFD]/g.test(text)

  if (hasCorruptedChars) {
    try {
      // Tenta decodificar como ISO-8859-1 (Latin-1)
      const bytes = new Uint8Array(text.length)
      for (let i = 0; i < text.length; i++) {
        bytes[i] = text.charCodeAt(i)
      }
      return new TextDecoder('iso-8859-1').decode(bytes)
    } catch (error) {
      console.warn('Falha ao corrigir encoding:', error)
      return text
    }
  }

  return text
}

export default function Configuracoes() {
  const { csvData, setCsvData, taxaRetorno, setTaxaRetorno } = useSimulationStore()
  const [taxa, setTaxa] = useState(taxaRetorno.toString())
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [selectedFile, setSelectedFile] = useState<string | null>(null)
  const { toast } = useToast()

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setSelectedFile(file.name)

    const reader = new FileReader()
    reader.onload = (event) => {
      try {
        let result = event.target?.result as string | undefined
        if (!result) throw new Error('File empty or invalid')

        // 🔧 Aplicar correção de encoding
        result = fixEncoding(result)

        const lines = result.split('\n')
        const parsed = lines
          .slice(1)
          .filter((l) => l.trim())
          .map((line) => {
            const [
              Tempo,
              Fonte,
              Cenario,
              Estrategia,
              Vazao_Captada,
              Demanda,
              CAPEX,
              OPEX,
              Aceitacao_Social,
            ] = line.split(',').map((col) => col.trim())
            return {
              Tempo,
              Fonte,
              Cenario,
              Estrategia,
              Vazao_Captada: parseFloat(Vazao_Captada || '0'),
              Demanda: parseFloat(Demanda || '0'),
              CAPEX: parseFloat(CAPEX || '0'),
              OPEX: parseFloat(OPEX || '0'),
              Aceitacao_Social: parseInt(Aceitacao_Social || '0'),
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
        setSelectedFile(null)
        toast({
          title: 'Erro de Importação',
          description:
            'Formato de CSV inválido. Verifique colunas: Tempo,Fonte,Cenario,Estrategia,Vazao_Captada,Demanda,CAPEX,OPEX,Aceitacao_Social.',
          variant: 'destructive',
        })
      }
    }
    reader.readAsText(file, 'UTF-8')
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
            <div className="bg-slate-50 p-6 rounded-xl border-2 border-dashed border-slate-200 hover:border-primary/50 transition-all duration-200 group">
              <label htmlFor="file-upload" className="cursor-pointer block w-full">
                <Button
                  type="button"
                  size="lg"
                  className="w-full justify-center group-hover:scale-[1.02] transition-transform"
                  onClick={handleButtonClick}
                  aria-label="Escolher arquivo CSV"
                >
                  <Upload className="mr-2 h-5 w-5" />
                  {selectedFile ? 'Alterar arquivo' : 'Escolher .CSV'}
                </Button>
              </label>
              <input
                ref={fileInputRef}
                id="file-upload"
                type="file"
                accept=".csv"
                onChange={handleUpload}
                className="sr-only"
              />
              {selectedFile && (
                <p className="mt-3 text-sm text-success font-medium flex items-center justify-center">
                  ✅ {selectedFile} selecionado
                </p>
              )}
              <p className="mt-2 text-xs text-muted-foreground text-center">
                Arraste ou clique para selecionar um CSV com colunas: Tempo, Fonte, Cenário,
                Estratégia, Vazão Captada, Demanda, CAPEX, OPEX, Aceitação Social
              </p>
            </div>
            {csvData.length > 0 ? (
              <DataPanel
                title={`Preview da Matriz (${csvData.length} registros)`}
                data={csvData.slice(0, 5)}
                cols={[
                  'Tempo',
                  'Fonte',
                  'Cenário',
                  'Estratégia',
                  'Vazão Cap.',
                  'Demanda',
                  'CAPEX',
                  'OPEX',
                  'Aceitação',
                ]}
              />
            ) : (
              <p className="text-sm text-muted-foreground italic text-center py-8">
                Importe um CSV para visualizar a matriz de simulação.
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
