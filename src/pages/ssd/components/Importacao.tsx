import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { Trash2, Folder, File as FileIcon, ChevronLeft } from 'lucide-react'

function FileSelectDialog({
  label,
  value,
  onChange,
}: {
  label: string
  value: string
  onChange: (v: string) => void
}) {
  const [open, setOpen] = useState(false)
  const [path, setPath] = useState<string[]>([])
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const currentPathStr = path.join('/')

  useEffect(() => {
    if (open) {
      setLoading(true)
      supabase.storage
        .from('dados_brutos')
        .list(currentPathStr, { limit: 200 })
        .then(({ data }) => setItems(data || []))
        .finally(() => setLoading(false))
    }
  }, [open, path])

  return (
    <div className="flex flex-col space-y-1">
      <label className="text-xs font-semibold">{label}</label>
      <div className="flex gap-2">
        <Input value={value || ''} readOnly placeholder="Nenhum arquivo" className="flex-1" />
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" type="button">
              Buscar
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Selecionar: {label}</DialogTitle>
            </DialogHeader>
            <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded border">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setPath((p) => p.slice(0, -1))}
                disabled={path.length === 0}
              >
                <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
              </Button>
              <span className="text-sm">dados_brutos / {path.join(' / ')}</span>
            </div>
            <div className="border rounded-md min-h-[300px] max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center">Carregando...</div>
              ) : (
                <div className="divide-y">
                  {items.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center p-3 hover:bg-slate-50 cursor-pointer"
                      onClick={() => {
                        if (!item.id) setPath((p) => [...p, item.name])
                        else {
                          onChange(currentPathStr ? `${currentPathStr}/${item.name}` : item.name)
                          setOpen(false)
                        }
                      }}
                    >
                      {!item.id ? (
                        <Folder className="w-5 h-5 text-blue-500 mr-3" />
                      ) : (
                        <FileIcon className="w-5 h-5 text-slate-500 mr-3" />
                      )}
                      <span className="text-sm">{item.name}</span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}

export function Importacao() {
  const [simulacoes, setSimulacoes] = useState<any[]>([])
  const [modelos, setModelos] = useState<any[]>([])
  const [selectedSim, setSelectedSim] = useState('')
  const [selectedModels, setSelectedModels] = useState<Record<number, boolean>>({})
  const [importStatus, setImportStatus] = useState<Record<number, string>>({})

  const [refData, setRefData] = useState<any>({
    fontes: [],
    tiposCenario: [],
    cenarios: [],
    acoes: [],
    cenariosFonte: [],
    tcCenario: [],
    acoesFonte: [],
  })

  const [idFonte, setIdFonte] = useState('')
  const [idTc, setIdTc] = useState('')
  const [idC, setIdC] = useState('')
  const [idAcao, setIdAcao] = useState('')
  const [cenariosList, setCenariosList] = useState<string[]>([])
  const [estrategiasList, setEstrategiasList] = useState<string[]>([])
  const [files, setFiles] = useState({
    arq_mod: '',
    arq_perdas: '',
    arq_demanda: '',
    arq_capex_estrategias: '',
    arq_capex_perdas: '',
    arq_opex: '',
  })

  useEffect(() => {
    supabase
      .from('simulacao_ssd')
      .select('*')
      .then((res) => setSimulacoes(res.data || []))
    supabase
      .from('modelos')
      .select('*, fonte_agua(nome_fonte)')
      .then((res) => setModelos(res.data || []))
    Promise.all([
      supabase.from('fonte_agua').select('*'),
      supabase.from('tipos_cenarios').select('*'),
      supabase.from('cenarios').select('*'),
      supabase.from('acoes').select('*'),
      supabase.from('cenarios_fonte').select('*'),
      supabase.from('tipo_cenario_cenario').select('*'),
      supabase.from('acoes_fonte').select('*'),
    ]).then((res) =>
      setRefData({
        fontes: res[0].data || [],
        tiposCenario: res[1].data || [],
        cenarios: res[2].data || [],
        acoes: res[3].data || [],
        cenariosFonte: res[4].data || [],
        tcCenario: res[5].data || [],
        acoesFonte: res[6].data || [],
      }),
    )
  }, [])

  const filteredTipos = refData.tiposCenario.filter((tc: any) =>
    refData.cenariosFonte.some(
      (cf: any) => cf.id_fonte === Number(idFonte) && cf.id_tc === tc.id_tc,
    ),
  )
  const filteredCenarios = refData.cenarios.filter((c: any) =>
    refData.tcCenario.some((tcc: any) => tcc.id_tc === Number(idTc) && tcc.id_c === c.id_cenarios),
  )
  const filteredAcoes = refData.acoes.filter((a: any) =>
    refData.acoesFonte.some(
      (af: any) => af.id_fonte === Number(idFonte) && af.id_acao === a.id_acao,
    ),
  )

  const handleSaveModel = async () => {
    if (!idFonte) return toast.error('Selecione uma fonte de água')
    const { data, error } = await supabase
      .from('modelos')
      .insert({
        id_fonte: Number(idFonte),
        cenario: cenariosList,
        estrategia: estrategiasList,
        ...files,
      })
      .select('*, fonte_agua(nome_fonte)')
      .single()
    if (error) return toast.error(error.message)
    setModelos([...modelos, data])
    toast.success('Modelo salvo com sucesso')
    setIdFonte('')
    setCenariosList([])
    setEstrategiasList([])
    setFiles({
      arq_mod: '',
      arq_perdas: '',
      arq_demanda: '',
      arq_capex_estrategias: '',
      arq_capex_perdas: '',
      arq_opex: '',
    })
  }

  const fetchCSV = async (path: string | null | undefined, label = '') => {
    if (!path) return []
    const cleanPath = path.trim().replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^\//, '')
    const { data, error } = await supabase.storage.from('dados_brutos').download(cleanPath)
    if (error || !data) return []
    const lines = (await data.text())
      .split('\n')
      .map((l) => l.trim())
      .filter(Boolean)
    if (lines.length < 2) return []
    const header = lines[0].toLowerCase().split(/[,;]/)
    const tIdx = header.findIndex((h) => h.includes('tempo'))
    const tIdxFinal = tIdx >= 0 ? tIdx : 0
    const vIdx = header.findIndex(
      (h) =>
        h.includes(label.toLowerCase()) ||
        h.replace(/_/g, '') === label.toLowerCase().replace(/_/g, ''),
    )
    const vIdxFinal = vIdx >= 0 ? vIdx : tIdxFinal === 0 ? 1 : 0

    return lines
      .slice(1)
      .map((l) => {
        const parts = l.split(/[,;]/)
        return {
          tempo: (parts[tIdxFinal] || '').trim().replace(/-/g, '/'),
          valor:
            parseFloat((parts[vIdxFinal] || '0').trim().replace(/\./g, '').replace(',', '.')) || 0,
        }
      })
      .filter((d) => d.tempo)
  }

  const handleImport = async () => {
    const selectedIds = Object.keys(selectedModels)
      .filter((k) => selectedModels[Number(k)])
      .map(Number)
    if (!selectedSim) return toast.error('Selecione uma simulação')
    if (selectedIds.length === 0) return toast.error('Selecione ao menos um modelo')

    for (const id_mod of selectedIds) {
      setImportStatus((prev) => ({ ...prev, [id_mod]: 'Importando...' }))
      try {
        const mod = modelos.find((m) => m.id_mod === id_mod)
        if (!mod) continue
        const [mD, pD, dD, ceD, cpD, oD] = await Promise.all([
          fetchCSV(mod.arq_mod, 'volume_captado'),
          fetchCSV(mod.arq_perdas, 'perdas'),
          fetchCSV(mod.arq_demanda, 'demanda'),
          fetchCSV(mod.arq_capex_estrategias, 'capex_estrategia'),
          fetchCSV(mod.arq_capex_perdas, 'capex_perdas'),
          fetchCSV(mod.arq_opex, 'opex'),
        ])
        const allTempos = new Set([...mD, ...pD, ...dD, ...ceD, ...cpD, ...oD].map((d) => d.tempo))
        if (allTempos.size === 0) throw new Error('Sem dados')

        const rows = Array.from(allTempos).map((t) => ({
          id_s: Number(selectedSim),
          id_mod: mod.id_mod,
          id_fonte: mod.id_fonte,
          tempo: t,
          volume_captado: mD.find((d) => d.tempo === t)?.valor ?? 0,
          perdas: pD.find((d) => d.tempo === t)?.valor ?? 0,
          demanda: dD.find((d) => d.tempo === t)?.valor ?? 0,
          capex_estrategia: ceD.find((d) => d.tempo === t)?.valor ?? 0,
          capex_perdas: cpD.find((d) => d.tempo === t)?.valor ?? 0,
          opex: oD.find((d) => d.tempo === t)?.valor ?? 0,
          cenarios: mod.cenario,
          estrategias: mod.estrategia,
        }))

        for (let i = 0; i < rows.length; i += 500) {
          const { error } = await supabase
            .from('dados_simulacao')
            .upsert(rows.slice(i, i + 500) as any, { onConflict: 'id_s,id_mod,id_fonte,tempo' })
          if (error) throw error
        }
        setImportStatus((prev) => ({ ...prev, [id_mod]: 'Concluído' }))
      } catch (err: any) {
        setImportStatus((prev) => ({ ...prev, [id_mod]: 'Erro' }))
      }
    }
    toast.success('Processo finalizado')
  }

  return (
    <div className="space-y-6 pb-20">
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Simulação de Destino *</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedSim} onValueChange={setSelectedSim}>
            <SelectTrigger className="max-w-md">
              <SelectValue placeholder="Selecione..." />
            </SelectTrigger>
            <SelectContent>
              {simulacoes.map((s) => (
                <SelectItem key={s.id_s} value={s.id_s.toString()}>
                  {s.descricao}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Configuração de cenários e estratégias para as fontes de água
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="max-w-md">
            <label className="text-xs font-semibold">Fonte de Água</label>
            <Select value={idFonte} onValueChange={setIdFonte}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {refData.fontes.map((f: any) => (
                  <SelectItem key={f.id_fonte} value={f.id_fonte.toString()}>
                    {f.nome_fonte}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border p-4 rounded-lg bg-slate-50 space-y-4">
              <h3 className="font-semibold text-sm">Montagem de cenários</h3>
              <div className="space-y-2">
                <Select value={idTc} onValueChange={setIdTc}>
                  <SelectTrigger>
                    <SelectValue placeholder="Tipo de cenário..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredTipos.map((t: any) => (
                      <SelectItem key={t.id_tc} value={t.id_tc.toString()}>
                        {t.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={idC} onValueChange={setIdC}>
                  <SelectTrigger>
                    <SelectValue placeholder="Cenário..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredCenarios.map((c: any) => (
                      <SelectItem key={c.id_cenarios} value={c.id_cenarios.toString()}>
                        {c.cenarios}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  className="w-full"
                  disabled={!idTc || !idC}
                  onClick={() => {
                    const t = refData.tiposCenario.find((x: any) => x.id_tc.toString() === idTc)
                    const c = refData.cenarios.find((x: any) => x.id_cenarios.toString() === idC)
                    if (t && c) {
                      setCenariosList((p) => [...p, `${t.descricao}: ${c.cenarios}`])
                      setIdTc('')
                      setIdC('')
                    }
                  }}
                >
                  Adicionar Cenário
                </Button>
              </div>
              <ul className="space-y-2">
                {cenariosList.map((c, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center bg-white p-2 rounded border text-sm"
                  >
                    {c}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => setCenariosList((p) => p.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
            <div className="border p-4 rounded-lg bg-slate-50 space-y-4">
              <h3 className="font-semibold text-sm">Montagem de Estratégia</h3>
              <div className="space-y-2">
                <Select value={idAcao} onValueChange={setIdAcao}>
                  <SelectTrigger>
                    <SelectValue placeholder="Escolha a ação..." />
                  </SelectTrigger>
                  <SelectContent>
                    {filteredAcoes.map((a: any) => (
                      <SelectItem key={a.id_acao} value={a.id_acao.toString()}>
                        {a.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  className="w-full"
                  disabled={!idAcao}
                  onClick={() => {
                    const a = refData.acoes.find((x: any) => x.id_acao.toString() === idAcao)
                    if (a) {
                      setEstrategiasList((p) => [...p, a.descricao])
                      setIdAcao('')
                    }
                  }}
                >
                  Adicionar Ação
                </Button>
              </div>
              <ul className="space-y-2">
                {estrategiasList.map((e, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center bg-white p-2 rounded border text-sm"
                  >
                    {e}
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-6 w-6 text-destructive"
                      onClick={() => setEstrategiasList((p) => p.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Seleção de arquivo para importação</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FileSelectDialog
            label="Arquivo de Modelo"
            value={files.arq_mod}
            onChange={(v) => setFiles((p) => ({ ...p, arq_mod: v }))}
          />
          <FileSelectDialog
            label="Arquivo de Perdas"
            value={files.arq_perdas}
            onChange={(v) => setFiles((p) => ({ ...p, arq_perdas: v }))}
          />
          <FileSelectDialog
            label="Arquivo de Demanda"
            value={files.arq_demanda}
            onChange={(v) => setFiles((p) => ({ ...p, arq_demanda: v }))}
          />
          <FileSelectDialog
            label="Arquivo de CAPEX Estratégias"
            value={files.arq_capex_estrategias}
            onChange={(v) => setFiles((p) => ({ ...p, arq_capex_estrategias: v }))}
          />
          <FileSelectDialog
            label="Arquivo de CAPEX Perdas"
            value={files.arq_capex_perdas}
            onChange={(v) => setFiles((p) => ({ ...p, arq_capex_perdas: v }))}
          />
          <FileSelectDialog
            label="Arquivo de OPEX"
            value={files.arq_opex}
            onChange={(v) => setFiles((p) => ({ ...p, arq_opex: v }))}
          />
          <div className="col-span-full mt-4">
            <Button onClick={handleSaveModel}>Salvar Configuração</Button>
          </div>
        </CardContent>
      </Card>

      <div className="border rounded overflow-hidden max-h-96 overflow-y-auto bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 sticky top-0 z-10">
            <tr>
              <th className="p-2 w-12">Imp</th>
              <th className="p-2 text-left">Fonte</th>
              <th className="p-2 text-left">Cenários</th>
              <th className="p-2 text-left">Estratégias</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {modelos.map((m) => (
              <tr key={m.id_mod} className="hover:bg-slate-50">
                <td className="p-2 text-center">
                  <Checkbox
                    checked={!!selectedModels[m.id_mod]}
                    onCheckedChange={(c) => setSelectedModels((p) => ({ ...p, [m.id_mod]: !!c }))}
                  />
                </td>
                <td className="p-2 font-medium">{m.fonte_agua?.nome_fonte}</td>
                <td className="p-2">{(m.cenario || []).join(', ')}</td>
                <td className="p-2">{(m.estrategia || []).join(', ')}</td>
                <td className="p-2 font-semibold">{importStatus[m.id_mod] || '-'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleImport} className="w-48">
          Importar dados
        </Button>
      </div>
    </div>
  )
}
