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
import { Trash2, Folder, File as FileIcon, ChevronLeft, Pencil, Check, X } from 'lucide-react'

// ── Helpers ────────────────────────────────────────────────────────────────────
const formatData = (data: any): string => {
  if (data === null || data === undefined) return ''
  if (typeof data === 'string' || typeof data === 'number' || typeof data === 'boolean')
    return String(data)
  if (Array.isArray(data))
    return data
      .map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item)))
      .join(', ')
  if (typeof data === 'object')
    return Object.values(data)
      .map((item) => (typeof item === 'object' ? JSON.stringify(item) : String(item)))
      .join(', ')
  return String(data)
}

// ── FileSelectDialog ───────────────────────────────────────────────────────────
function FileSelectDialog({
  label,
  value,
  onChange,
  bucket = 'dados_brutos',
}: {
  label: string
  value: string
  onChange: (v: string) => void
  bucket?: string
}) {
  const [open, setOpen] = useState(false)
  const [path, setPath] = useState<string[]>([])
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const currentPathStr = path.join('/')

  useEffect(() => {
    if (!open) return
    setLoading(true)
    supabase.storage
      .from(bucket)
      .list(currentPathStr || undefined, { limit: 200 })
      .then(({ data }) => setItems(data || []))
      .finally(() => setLoading(false))
  }, [open, path, bucket])

  return (
    <div className="flex flex-col space-y-1">
      <label className="text-xs font-semibold">{label}</label>
      <div className="flex gap-2">
        <Input
          value={value || ''}
          readOnly
          placeholder="Nenhum arquivo"
          className="flex-1 text-xs"
        />
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o)
            if (!o) setPath([])
          }}
        >
          <DialogTrigger asChild>
            <Button variant="outline" type="button" size="sm">
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
              <span className="text-sm text-slate-500">
                {bucket} / {path.join(' / ')}
              </span>
            </div>
            <div className="border rounded-md min-h-[300px] max-h-[400px] overflow-y-auto">
              {loading ? (
                <div className="p-8 text-center text-sm text-slate-400">Carregando...</div>
              ) : items.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-400">
                  Nenhum item encontrado.
                </div>
              ) : (
                <div className="divide-y">
                  {items.map((item) => (
                    <div
                      key={item.name}
                      className="flex items-center p-3 hover:bg-slate-50 cursor-pointer"
                      onClick={() => {
                        if (!item.id) {
                          setPath((p) => [...p, item.name])
                        } else {
                          onChange(currentPathStr ? `${currentPathStr}/${item.name}` : item.name)
                          setOpen(false)
                          setPath([])
                        }
                      }}
                    >
                      {!item.id ? (
                        <Folder className="w-5 h-5 text-blue-500 mr-3 shrink-0" />
                      ) : (
                        <FileIcon className="w-5 h-5 text-slate-500 mr-3 shrink-0" />
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

// ── Tipos ──────────────────────────────────────────────────────────────────────
type ModeloRow = {
  id_mod: number
  id_fonte: number
  cenario: any
  estrategia: any
  arq_mod: string | null
  arq_perdas: string | null
  arq_demanda: string | null
  arq_capex_estrategias: string | null
  arq_capex_perdas: string | null
  arq_opex: string | null
  arq_indicador: string | null
  fonte_agua?: { nome_fonte: string }
}

type EditingModelo = {
  id_mod: number
  arq_mod: string
  arq_perdas: string
  arq_demanda: string
  arq_capex_estrategias: string
  arq_capex_perdas: string
  arq_opex: string
  arq_indicador: string
}

// ── Componente principal ───────────────────────────────────────────────────────
export function Importacao() {
  const [modelos, setModelos] = useState<ModeloRow[]>([])
  const [selectedModels, setSelectedModels] = useState<Record<number, boolean>>({})
  const [importStatus, setImportStatus] = useState<Record<number, string>>({})

  // Indicadores
  const [indicadores, setIndicadores] = useState<{ id_indicador: number; descricao: string }[]>([])
  const [selectedIndicador, setSelectedIndicador] = useState('')

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
    arq_indicador: '',
  })

  // Edição inline da tabela modelos
  const [editingModelo, setEditingModelo] = useState<EditingModelo | null>(null)
  const [savingEdit, setSavingEdit] = useState(false)

  // ── Fetch inicial ────────────────────────────────────────────────────────────
  useEffect(() => {
    let mounted = true

    const fetchData = async () => {
      try {
        const [modRes, indRes, refRes] = await Promise.all([
          supabase.from('modelos').select('*, fonte_agua(nome_fonte)'),
          supabase.from('indicadores').select('id_indicador, descricao').order('descricao'),
          Promise.all([
            supabase.from('fonte_agua').select('*'),
            supabase.from('tipos_cenarios').select('*'),
            supabase.from('cenarios').select('*'),
            supabase.from('acoes').select('*'),
            supabase.from('cenarios_fonte').select('*'),
            supabase.from('tipo_cenario_cenario').select('*'),
            supabase.from('acoes_fonte').select('*'),
          ]),
        ])

        if (mounted) {
          setModelos((modRes.data as ModeloRow[]) || [])
          setIndicadores(indRes.data || [])
          setRefData({
            fontes: refRes[0].data || [],
            tiposCenario: refRes[1].data || [],
            cenarios: refRes[2].data || [],
            acoes: refRes[3].data || [],
            cenariosFonte: refRes[4].data || [],
            tcCenario: refRes[5].data || [],
            acoesFonte: refRes[6].data || [],
          })
        }
      } catch (error) {
        console.error('Failed to fetch data:', error)
      }
    }

    fetchData()
    return () => {
      mounted = false
    }
  }, [])

  // ── Selects filtrados ────────────────────────────────────────────────────────
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

  // ── Salvar modelo ────────────────────────────────────────────────────────────
  const handleSaveModel = async () => {
    if (!idFonte) return toast.error('Selecione uma fonte de água')

    const { data, error } = await supabase
      .from('modelos')
      .insert({
        id_fonte: Number(idFonte),
        cenario: cenariosList,
        estrategia: estrategiasList,
        arq_mod: files.arq_mod || null,
        arq_perdas: files.arq_perdas || null,
        arq_demanda: files.arq_demanda || null,
        arq_capex_estrategias: files.arq_capex_estrategias || null,
        arq_capex_perdas: files.arq_capex_perdas || null,
        arq_opex: files.arq_opex || null,
        arq_indicador: files.arq_indicador || null,
      })
      .select('*, fonte_agua(nome_fonte)')
      .single()

    if (error) return toast.error(error.message)

    setModelos((prev) => [...prev, data as ModeloRow])
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
      arq_indicador: '',
    })
  }

  // ── Edição inline ────────────────────────────────────────────────────────────
  const startEdit = (m: ModeloRow) => {
    setEditingModelo({
      id_mod: m.id_mod,
      arq_mod: m.arq_mod || '',
      arq_perdas: m.arq_perdas || '',
      arq_demanda: m.arq_demanda || '',
      arq_capex_estrategias: m.arq_capex_estrategias || '',
      arq_capex_perdas: m.arq_capex_perdas || '',
      arq_opex: m.arq_opex || '',
      arq_indicador: m.arq_indicador || '',
    })
  }

  const cancelEdit = () => setEditingModelo(null)

  const saveEdit = async () => {
    if (!editingModelo) return
    setSavingEdit(true)
    const { id_mod, ...fields } = editingModelo
    const mapped = Object.fromEntries(
      Object.entries(fields).map(([k, v]) => [k, v === '' ? null : v]),
    )
    const { error } = await supabase.from('modelos').update(mapped).eq('id_mod', id_mod)
    if (error) {
      toast.error(`Erro ao salvar: ${error.message}`)
    } else {
      setModelos((prev) => prev.map((m) => (m.id_mod === id_mod ? { ...m, ...mapped } : m)))
      toast.success('Modelo atualizado')
      setEditingModelo(null)
    }
    setSavingEdit(false)
  }

  const handleDeleteModelo = async (id_mod: number) => {
    if (!confirm('Confirma a exclusão deste modelo?')) return
    const { error } = await supabase.from('modelos').delete().eq('id_mod', id_mod)
    if (error) toast.error(`Erro ao excluir: ${error.message}`)
    else {
      setModelos((prev) => prev.filter((m) => m.id_mod !== id_mod))
      toast.success('Modelo excluído')
    }
  }

  // ── Fetch CSV do Storage ─────────────────────────────────────────────────────
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

  // ── Importar arquivo de indicadores ─────────────────────────────────────────
  /**
   * Baixa o arquivo de indicadores (CSV ou JSON) do bucket 'dados_brutos'
   * e faz upsert na tabela 'indicadores_aplicado'.
   *
   * Formato CSV esperado:
   *   id_indicador;campo_extra;descricao;unidade;tempo;id_fonte;valor
   *
   * Formato JSON esperado: array de objetos com as mesmas chaves.
   */
  const importarIndicadores = async (arqPath: string): Promise<{ ok: boolean; count: number }> => {
    const cleanPath = arqPath.trim().replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^\//, '')
    const { data: fileData, error: dlError } = await supabase.storage
      .from('dados_brutos')
      .download(cleanPath)

    if (dlError || !fileData) {
      toast.error(`Erro ao baixar arquivo de indicadores: ${dlError?.message ?? 'não encontrado'}`)
      return { ok: false, count: 0 }
    }

    const text = await fileData.text()
    let rows: any[] = []

    const isJson = arqPath.toLowerCase().endsWith('.json') || text.trimStart().startsWith('[')
    if (isJson) {
      try {
        rows = JSON.parse(text)
        if (!Array.isArray(rows)) rows = [rows]
      } catch {
        toast.error('Arquivo de indicadores com formato JSON inválido')
        return { ok: false, count: 0 }
      }
    } else {
      const sep = text.includes(';') ? ';' : ','
      const lines = text.split('\n').filter((l) => l.trim())
      if (lines.length < 2) return { ok: false, count: 0 }
      const headers = lines[0].split(sep).map((h) => h.trim().replace(/^"|"$/g, ''))
      rows = lines.slice(1).map((line) => {
        const vals = line.split(sep).map((v) => v.trim().replace(/^"|"$/g, ''))
        return headers.reduce<Record<string, any>>((acc, h, i) => {
          acc[h] = vals[i] ?? null
          return acc
        }, {})
      })
    }

    if (rows.length === 0) return { ok: false, count: 0 }

    let erros = 0
    for (let i = 0; i < rows.length; i += 500) {
      const { error } = await supabase.from('indicadores_aplicado').upsert(rows.slice(i, i + 500))
      if (error) {
        console.error('upsert indicadores:', error)
        erros++
      }
    }

    return { ok: erros === 0, count: rows.length }
  }

  // ── Importar dados ───────────────────────────────────────────────────────────
  const handleImport = async () => {
    const selectedIds = Object.keys(selectedModels)
      .filter((k) => selectedModels[Number(k)])
      .map(Number)
    if (selectedIds.length === 0) return toast.error('Selecione ao menos um modelo')

    for (const id_mod of selectedIds) {
      setImportStatus((prev) => ({ ...prev, [id_mod]: 'Importando...' }))
      try {
        const mod = modelos.find((m) => m.id_mod === id_mod)
        if (!mod) continue

        // ── Dados principais (volume, perdas, demanda, capex, opex) ──────────
        const [mD, pD, dD, ceD, cpD, oD] = await Promise.all([
          fetchCSV(mod.arq_mod, 'volume_captado'),
          fetchCSV(mod.arq_perdas, 'perdas'),
          fetchCSV(mod.arq_demanda, 'demanda'),
          fetchCSV(mod.arq_capex_estrategias, 'capex_estrategia'),
          fetchCSV(mod.arq_capex_perdas, 'capex_perdas'),
          fetchCSV(mod.arq_opex, 'opex'),
        ])

        const allTempos = new Set([...mD, ...pD, ...dD, ...ceD, ...cpD, ...oD].map((d) => d.tempo))
        if (allTempos.size === 0) throw new Error('Sem dados nos arquivos principais')

        // Usa o id_s da simulacao_ssd (único registro existente)
        const { data: simRow } = await supabase
          .from('simulacao_ssd')
          .select('id_s')
          .limit(1)
          .single()
        const id_s = simRow?.id_s ?? 1

        const rows = Array.from(allTempos).map((t) => ({
          id_s,
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

        // ── Arquivo de indicadores (se configurado no modelo) ─────────────────
        if (mod.arq_indicador) {
          setImportStatus((prev) => ({ ...prev, [id_mod]: 'Importando indicadores...' }))
          const { ok, count } = await importarIndicadores(mod.arq_indicador)
          if (!ok) {
            setImportStatus((prev) => ({ ...prev, [id_mod]: 'Erro nos indicadores' }))
            continue
          }
          setImportStatus((prev) => ({
            ...prev,
            [id_mod]: `Concluído (${rows.length} dados + ${count} indicadores)`,
          }))
        } else {
          setImportStatus((prev) => ({ ...prev, [id_mod]: `Concluído (${rows.length} dados)` }))
        }
      } catch (err: any) {
        console.error('Erro importação:', err)
        setImportStatus((prev) => ({
          ...prev,
          [id_mod]: `Erro: ${err?.message ?? 'desconhecido'}`,
        }))
      }
    }
    toast.success('Processo finalizado')
  }

  // ── Colunas de arquivo editáveis na tabela ───────────────────────────────────
  const FILE_COLS: { key: keyof EditingModelo; label: string }[] = [
    { key: 'arq_mod', label: 'Modelo' },
    { key: 'arq_perdas', label: 'Perdas' },
    { key: 'arq_demanda', label: 'Demanda' },
    { key: 'arq_capex_estrategias', label: 'CAPEX Est.' },
    { key: 'arq_capex_perdas', label: 'CAPEX Per.' },
    { key: 'arq_opex', label: 'OPEX' },
    { key: 'arq_indicador', label: 'Indicador' },
  ]

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-20">
      {/* ── QUADRO 1: Indicador ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Indicador</CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-xs text-muted-foreground mb-3">
            Selecione o indicador que será vinculado à importação. O arquivo correspondente deverá
            ser informado no campo <strong>Arquivo de Indicador</strong> abaixo.
          </p>
          <div className="max-w-md">
            <label className="text-xs font-semibold text-muted-foreground block mb-1">
              Indicador
            </label>
            <Select value={selectedIndicador} onValueChange={setSelectedIndicador}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um indicador..." />
              </SelectTrigger>
              <SelectContent>
                {indicadores.map((ind) => (
                  <SelectItem key={ind.id_indicador} value={ind.id_indicador.toString()}>
                    {ind.descricao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* ── QUADRO 2: Cenários e Estratégias ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Configuração de cenários e estratégias para as fontes de água
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="max-w-md">
            <label className="text-xs font-semibold">Fonte de Água</label>
            <Select
              value={idFonte}
              onValueChange={(v) => {
                setIdFonte(v)
                setIdTc('')
                setIdC('')
                setIdAcao('')
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione..." />
              </SelectTrigger>
              <SelectContent>
                {refData.fontes.map((f: any) => (
                  <SelectItem key={f.id_fonte} value={f.id_fonte.toString()}>
                    {formatData(f.nome_fonte)}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Cenários */}
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
                        {formatData(t.descricao)}
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
                        {formatData(c.cenarios)}
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
                    {formatData(c)}
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

            {/* Estratégias */}
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
                        {formatData(a.descricao)}
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
                    {formatData(e)}
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

      {/* ── QUADRO 3: Seleção de arquivos ── */}
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
          <FileSelectDialog
            label="Arquivo de Indicador"
            value={files.arq_indicador}
            onChange={(v) => setFiles((p) => ({ ...p, arq_indicador: v }))}
          />

          <div className="col-span-full mt-2">
            <Button onClick={handleSaveModel}>Salvar Configuração</Button>
          </div>
        </CardContent>
      </Card>

      {/* ── QUADRO 4: Tabela de modelos com edição inline ── */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Modelos cadastrados</h3>
          <span className="text-xs text-muted-foreground">
            {modelos.length} {modelos.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        <div className="overflow-x-auto max-h-[480px] overflow-y-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-100 sticky top-0 z-10">
              <tr>
                <th className="px-2 py-2.5 w-10 text-center font-semibold text-slate-600">Imp</th>
                <th className="px-3 py-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">
                  Fonte
                </th>
                <th className="px-3 py-2.5 text-left font-semibold text-slate-600">Cenários</th>
                <th className="px-3 py-2.5 text-left font-semibold text-slate-600">Estratégias</th>
                {FILE_COLS.map((col) => (
                  <th
                    key={col.key}
                    className="px-3 py-2.5 text-left font-semibold text-slate-600 whitespace-nowrap"
                  >
                    {col.label}
                  </th>
                ))}
                <th className="px-3 py-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">
                  Status
                </th>
                <th className="px-2 py-2.5 text-center font-semibold text-slate-600 w-20">Ações</th>
              </tr>
            </thead>
            <tbody className="divide-y">
              {modelos.length === 0 && (
                <tr>
                  <td
                    colSpan={FILE_COLS.length + 5}
                    className="px-4 py-8 text-center text-slate-400"
                  >
                    Nenhum modelo cadastrado.
                  </td>
                </tr>
              )}
              {modelos.map((m) => {
                const isEditing = editingModelo?.id_mod === m.id_mod
                return (
                  <tr
                    key={m.id_mod}
                    className={`hover:bg-slate-50 transition-colors ${isEditing ? 'bg-amber-50/40' : ''}`}
                  >
                    {/* Checkbox de importação */}
                    <td className="px-2 py-2 text-center">
                      <Checkbox
                        checked={!!selectedModels[m.id_mod]}
                        onCheckedChange={(c) =>
                          setSelectedModels((p) => ({ ...p, [m.id_mod]: !!c }))
                        }
                      />
                    </td>

                    {/* Fonte */}
                    <td className="px-3 py-2 font-medium text-slate-700 whitespace-nowrap">
                      {formatData(m.fonte_agua?.nome_fonte) || `Fonte ${m.id_fonte}`}
                    </td>

                    {/* Cenários */}
                    <td className="px-3 py-2 text-slate-600 max-w-[180px]">
                      <span className="block truncate" title={formatData(m.cenario)}>
                        {formatData(m.cenario) || <span className="text-slate-300">—</span>}
                      </span>
                    </td>

                    {/* Estratégias */}
                    <td className="px-3 py-2 text-slate-600 max-w-[180px]">
                      <span className="block truncate" title={formatData(m.estrategia)}>
                        {formatData(m.estrategia) || <span className="text-slate-300">—</span>}
                      </span>
                    </td>

                    {/* Colunas de arquivo */}
                    {FILE_COLS.map((col) => (
                      <td key={col.key} className="px-2 py-2 max-w-[160px]">
                        {isEditing ? (
                          <div className="flex gap-1 items-center min-w-[140px]">
                            <Input
                              className="h-6 text-[11px] px-1.5"
                              value={editingModelo[col.key]}
                              onChange={(e) =>
                                setEditingModelo((p) =>
                                  p ? { ...p, [col.key]: e.target.value } : null,
                                )
                              }
                            />
                          </div>
                        ) : (
                          <span
                            className="block truncate font-mono text-[10px] text-slate-500"
                            title={(m[col.key as keyof ModeloRow] as string) || ''}
                          >
                            {m[col.key as keyof ModeloRow] ? (
                              (m[col.key as keyof ModeloRow] as string).split('/').pop()
                            ) : (
                              <span className="text-slate-300">—</span>
                            )}
                          </span>
                        )}
                      </td>
                    ))}

                    {/* Status de importação */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      {importStatus[m.id_mod] ? (
                        <span
                          className={`text-[11px] font-semibold ${
                            importStatus[m.id_mod].startsWith('Concluído')
                              ? 'text-emerald-600'
                              : importStatus[m.id_mod].startsWith('Erro')
                                ? 'text-red-500'
                                : 'text-amber-500'
                          }`}
                        >
                          {importStatus[m.id_mod]}
                        </span>
                      ) : (
                        <span className="text-slate-300 text-[11px]">—</span>
                      )}
                    </td>

                    {/* Ações */}
                    <td className="px-2 py-2 text-center">
                      {isEditing ? (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={saveEdit}
                            disabled={savingEdit}
                            title="Salvar"
                            className="p-1 rounded hover:bg-emerald-100 text-emerald-600 transition-colors disabled:opacity-40"
                          >
                            <Check className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={cancelEdit}
                            title="Cancelar"
                            className="p-1 rounded hover:bg-slate-100 text-slate-500 transition-colors"
                          >
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      ) : (
                        <div className="flex items-center justify-center gap-1">
                          <button
                            onClick={() => startEdit(m)}
                            title="Editar arquivos"
                            className="p-1 rounded hover:bg-amber-100 text-amber-600 transition-colors"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteModelo(m.id_mod)}
                            title="Excluir"
                            className="p-1 rounded hover:bg-red-100 text-red-500 transition-colors"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Botão Importar ── */}
      <div className="flex justify-end">
        <Button onClick={handleImport} className="w-52">
          Importar dados
        </Button>
      </div>
    </div>
  )
}
