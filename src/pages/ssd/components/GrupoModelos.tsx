import { useState, useEffect } from 'react'
import { getTable, insertRow, deleteRow } from '@/services/ssd'
import { NativeSelect } from './NativeSelect'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { FilePickerModal } from './FilePickerModal'
import { Trash2, FileText } from 'lucide-react'
import { useSsdData } from '@/hooks/use-ssd-data'
import { useToast } from '@/hooks/use-toast'

const DATA_TYPES = ['Modelos', 'Perdas', 'Demanda', 'CAPEX Estratégias', 'CAPEX Perdas', 'OPEX']

const TYPE_FOLDER_MAP: Record<string, string> = {
  Modelos: 'modelos',
  Perdas: 'perdas',
  Demanda: 'demandas',
  'CAPEX Estratégias': 'capex_estrategias',
  'CAPEX Perdas': 'capex_perdas',
  OPEX: 'opex',
}

export function GrupoModelos() {
  const { fonte_agua } = useSsdData()
  const { toast } = useToast()

  const [modelos, setModelos] = useState<any[]>([])
  const [idFonte, setIdFonte] = useState('')
  const [cenario, setCenario] = useState('')
  const [estrategia, setEstrategia] = useState('')

  const [dataType, setDataType] = useState(DATA_TYPES[0])
  const [tempMap, setTempMap] = useState<{ type: string; fileName: string }[]>([])
  const [pickerOpen, setPickerOpen] = useState(false)

  const load = async () => {
    setModelos(await getTable('modelos'))
  }

  useEffect(() => {
    load()
  }, [])

  const handleInclude = () => setPickerOpen(true)

  const handleFileSelect = (fileName: string) => {
    const newMap = tempMap.filter((x) => x.type !== dataType)
    newMap.push({ type: dataType, fileName })
    setTempMap(newMap)
    setPickerOpen(false)
  }

  const handleRemoveTemp = (type: string) => {
    setTempMap(tempMap.filter((x) => x.type !== type))
  }

  const handleGravar = async () => {
    if (!idFonte) return toast({ title: 'Selecione uma fonte', variant: 'destructive' })
    if (!cenario || !estrategia)
      return toast({ title: 'Preencha Cenário e Estratégia', variant: 'destructive' })

    const payload = {
      id_fonte: parseInt(idFonte),
      cenario,
      estrategia,
      arq_mod: tempMap.find((x) => x.type === 'Modelos')?.fileName || null,
      arq_perdas: tempMap.find((x) => x.type === 'Perdas')?.fileName || null,
      arq_demanda: tempMap.find((x) => x.type === 'Demanda')?.fileName || null,
      arq_capex_estrategias: tempMap.find((x) => x.type === 'CAPEX Estratégias')?.fileName || null,
      arq_capex_perdas: tempMap.find((x) => x.type === 'CAPEX Perdas')?.fileName || null,
      arq_opex: tempMap.find((x) => x.type === 'OPEX')?.fileName || null,
    }

    try {
      await insertRow('modelos', payload)
      toast({ title: 'Modelo salvo com sucesso!' })
      setIdFonte('')
      setCenario('')
      setEstrategia('')
      setTempMap([])
      load()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (id: number) => {
    if (!window.confirm('Tem certeza que deseja excluir este modelo?')) return
    await deleteRow('modelos', 'id_mod', id)
    load()
  }

  const getFonteName = (id: number) =>
    fonte_agua.find((x: any) => x.id_fonte === id)?.nome_fonte || id

  return (
    <div className="space-y-8">
      <div className="bg-white p-6 border rounded-lg shadow-sm space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="text-sm font-semibold mb-1 block">Fonte de Água</label>
            <NativeSelect
              options={fonte_agua.map((o: any) => ({ value: o.id_fonte, label: o.nome_fonte }))}
              value={idFonte}
              onChange={setIdFonte}
              placeholder="Selecione uma fonte..."
            />
          </div>
          <div>
            <label className="text-sm font-semibold mb-1 block">Cenário</label>
            <Input
              placeholder="Nome do cenário"
              value={cenario}
              onChange={(e) => setCenario(e.target.value)}
            />
          </div>
          <div>
            <label className="text-sm font-semibold mb-1 block">Estratégia</label>
            <Input
              placeholder="Nome da estratégia"
              value={estrategia}
              onChange={(e) => setEstrategia(e.target.value)}
            />
          </div>
        </div>

        <div className="border-t pt-6">
          <label className="text-base font-semibold mb-4 block">
            Associação de Arquivos do Storage
          </label>
          <div className="flex flex-col sm:flex-row gap-4 mb-6">
            <div className="flex-1 max-w-sm">
              <label className="text-sm font-medium mb-1 block">Seleção de arquivos de dados</label>
              <div className="flex gap-2">
                <NativeSelect
                  options={DATA_TYPES.map((t) => ({ value: t, label: t }))}
                  value={dataType}
                  onChange={setDataType}
                />
                <Button onClick={handleInclude} variant="secondary">
                  Incluir
                </Button>
              </div>
            </div>
          </div>

          {tempMap.length > 0 ? (
            <div className="border rounded-md overflow-hidden mb-6 shadow-sm">
              <table className="w-full text-sm text-left">
                <thead className="bg-muted">
                  <tr>
                    <th className="px-4 py-2 font-semibold">Tipo de Dado</th>
                    <th className="px-4 py-2 font-semibold">Arquivo Selecionado (.csv)</th>
                    <th className="px-4 py-2 w-24 text-center font-semibold">Ação</th>
                  </tr>
                </thead>
                <tbody>
                  {tempMap.map((m) => (
                    <tr key={m.type} className="border-t hover:bg-muted/30">
                      <td className="px-4 py-2 font-medium">{m.type}</td>
                      <td className="px-4 py-2">
                        <div className="flex items-center gap-2">
                          <FileText className="w-4 h-4 text-primary" />
                          {m.fileName}
                        </div>
                      </td>
                      <td className="px-4 py-2 text-center">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleRemoveTemp(m.type)}
                          title="Excluir"
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="p-4 border border-dashed rounded-md text-center text-sm text-muted-foreground mb-6">
              Nenhum arquivo associado. Selecione o tipo e clique em Incluir.
            </div>
          )}

          <Button onClick={handleGravar} className="w-full sm:w-auto" size="lg">
            Gravar Modelo
          </Button>
        </div>
      </div>

      <div className="bg-white p-6 border rounded-lg shadow-sm">
        <h3 className="font-semibold text-lg mb-4">Modelos Hidrogeológicos Cadastrados</h3>
        <div className="overflow-x-auto border rounded-md">
          <table className="w-full text-sm text-left whitespace-nowrap">
            <thead className="bg-muted">
              <tr>
                <th className="px-4 py-3 font-semibold">Fonte</th>
                <th className="px-4 py-3 font-semibold">Cenário</th>
                <th className="px-4 py-3 font-semibold">Estratégia</th>
                <th className="px-4 py-3 font-semibold">Mod</th>
                <th className="px-4 py-3 font-semibold">Perdas</th>
                <th className="px-4 py-3 font-semibold">Demanda</th>
                <th className="px-4 py-3 font-semibold">Capex Est.</th>
                <th className="px-4 py-3 font-semibold">Capex Perd.</th>
                <th className="px-4 py-3 font-semibold">Opex</th>
                <th className="px-4 py-3 font-semibold text-center">Ações</th>
              </tr>
            </thead>
            <tbody>
              {modelos.map((m: any) => (
                <tr key={m.id_mod} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-2 font-medium">{getFonteName(m.id_fonte)}</td>
                  <td className="px-4 py-2">{m.cenario}</td>
                  <td className="px-4 py-2">{m.estrategia}</td>
                  <td className="px-4 py-2 text-muted-foreground">{m.arq_mod || '-'}</td>
                  <td className="px-4 py-2 text-muted-foreground">{m.arq_perdas || '-'}</td>
                  <td className="px-4 py-2 text-muted-foreground">{m.arq_demanda || '-'}</td>
                  <td className="px-4 py-2 text-muted-foreground">
                    {m.arq_capex_estrategias || '-'}
                  </td>
                  <td className="px-4 py-2 text-muted-foreground">{m.arq_capex_perdas || '-'}</td>
                  <td className="px-4 py-2 text-muted-foreground">{m.arq_opex || '-'}</td>
                  <td className="px-4 py-2 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(m.id_mod)}
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))}
              {modelos.length === 0 && (
                <tr>
                  <td
                    colSpan={10}
                    className="px-4 py-6 text-center text-muted-foreground border-t border-dashed"
                  >
                    Nenhum modelo cadastrado.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <FilePickerModal
        open={pickerOpen}
        onOpenChange={setPickerOpen}
        bucket="dados_brutos"
        folder={TYPE_FOLDER_MAP[dataType]}
        onSelect={handleFileSelect}
      />
    </div>
  )
}
