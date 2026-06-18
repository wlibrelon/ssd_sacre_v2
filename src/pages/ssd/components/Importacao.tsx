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
/**
 * arq_indicador: JSONB no banco.
 * Estrutura: { "<id_indicador>": "<path_arquivo>", ... }
 * Ex: { "3": "pasta/turbidez.csv", "7": "pasta/ph.csv" }
 */
type ArqIndicadorMap = Record<string, string> // chave = id_indicador (string), valor = path

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
  arq_indicador: ArqIndicadorMap | null // JSONB { id_indicador: path }
  fonte_agua?: { nome_fonte: string }
}

/** Draft de um indicador sendo montado no formulário */
type IndicadorDraft = {
  id_indicador: number
  descricao: string
  campo_extra: string // nome da coluna no CSV e chave no JSONB valores_extras
  arq: string // path do arquivo no storage
}

type EditingModelo = {
  id_mod: number
  arq_mod: string
  arq_perdas: string
  arq_demanda: string
  arq_capex_estrategias: string
  arq_capex_perdas: string
  arq_opex: string
  /** Cópia editável do JSONB de indicadores, serializado como string JSON para o Input */
  arq_indicador_raw: string
}

// ── Componente principal ───────────────────────────────────────────────────────
export function Importacao() {
  const [modelos, setModelos] = useState<ModeloRow[]>([])
  const [selectedModels, setSelectedModels] = useState<Record<number, boolean>>({})
  const [importStatus, setImportStatus] = useState<Record<number, string>>({})

  // Lista completa de indicadores disponíveis (tabela indicadores)
  const [indicadores, setIndicadores] = useState<
    { id_indicador: number; descricao: string; campo_extra: string; id_fonte: number }[]
  >([])

  // Draft de montagem de indicadores no formulário
  const [indicadorSelecionado, setIndicadorSelecionado] = useState('') // id_indicador selecionado no Select
  const [indicadorArq, setIndicadorArq] = useState('') // arquivo escolhido para esse indicador
  const [indicadoresDraft, setIndicadoresDraft] = useState<IndicadorDraft[]>([])

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
  // Cada item guarda label (exibição) — formato final gravado: ["label1", "label2"]
  const [cenariosList, setCenariosList] = useState<{ label: string; tcDescricao: string }[]>([])
  // Cada item guarda label (exibição) — formato final gravado: ["label1", "label2"]
  const [estrategiasList, setEstrategiasList] = useState<{ label: string }[]>([])
  const [files, setFiles] = useState({
    arq_mod: '',
    arq_perdas: '',
    arq_demanda: '',
    arq_capex_estrategias: '',
    arq_capex_perdas: '',
    arq_opex: '',
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
          supabase
            .from('indicadores')
            .select('id_indicador, descricao, campo_extra, id_fonte')
            .order('descricao'),
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

  // Indicadores filtrados pela fonte selecionada e não adicionados ao draft
  const indicadoresDisponiveis = indicadores.filter(
    (ind) =>
      ind.id_fonte === Number(idFonte) &&
      !indicadoresDraft.some((d) => d.id_indicador === ind.id_indicador),
  )

  // ── Adicionar indicador ao draft ─────────────────────────────────────────────
  const handleAdicionarIndicador = () => {
    if (!indicadorSelecionado) return toast.error('Selecione um indicador')
    if (!indicadorArq) return toast.error('Selecione o arquivo do indicador')
    const ind = indicadores.find((i) => i.id_indicador.toString() === indicadorSelecionado)
    if (!ind) return
    setIndicadoresDraft((p) => [
      ...p,
      {
        id_indicador: ind.id_indicador,
        descricao: ind.descricao,
        campo_extra: ind.campo_extra,
        arq: indicadorArq,
      },
    ])
    setIndicadorSelecionado('')
    setIndicadorArq('')
  }

  // ── Salvar modelo ────────────────────────────────────────────────────────────
  const handleSaveModel = async () => {
    if (!idFonte) return toast.error('Selecione uma fonte de água')

    // Monta o JSONB de indicadores: { "id_indicador": "path_arquivo" }
    const arqIndicadorJsonb: ArqIndicadorMap | null =
      indicadoresDraft.length > 0
        ? indicadoresDraft.reduce<ArqIndicadorMap>((acc, d) => {
            acc[d.id_indicador.toString()] = d.arq
            return acc
          }, {})
        : null

    // Monta array de cenários com labels legíveis: ["Tipo: Cenario", ...]
    const cenarioArray = cenariosList.map((item) => item.label)

    // Monta array de estratégias com labels legíveis: ["Acao1", "Acao2"]
    const estrategiaArray = estrategiasList.map((e) => e.label)

    const { data, error } = await supabase
      .from('modelos')
      .insert({
        id_fonte: Number(idFonte),
        cenario: cenarioArray,
        estrategia: estrategiaArray,
        arq_mod: files.arq_mod || null,
        arq_perdas: files.arq_perdas || null,
        arq_demanda: files.arq_demanda || null,
        arq_capex_estrategias: files.arq_capex_estrategias || null,
        arq_capex_perdas: files.arq_capex_perdas || null,
        arq_opex: files.arq_opex || null,
        arq_indicador: arqIndicadorJsonb,
      })
      .select('*, fonte_agua(nome_fonte)')
      .single()

    if (error) return toast.error(error.message)

    setModelos((prev) => [...prev, data as ModeloRow])
    toast.success('Modelo salvo com sucesso')
    setIdFonte('')
    setCenariosList([])
    setEstrategiasList([])
    setIndicadoresDraft([])
    setFiles({
      arq_mod: '',
      arq_perdas: '',
      arq_demanda: '',
      arq_capex_estrategias: '',
      arq_capex_perdas: '',
      arq_opex: '',
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
      // Exibe o JSONB serializado para edição direta
      arq_indicador_raw: m.arq_indicador ? JSON.stringify(m.arq_indicador, null, 2) : '',
    })
  }

  const cancelEdit = () => setEditingModelo(null)

  const saveEdit = async () => {
    if (!editingModelo) return
    setSavingEdit(true)
    const { id_mod, arq_indicador_raw, ...strFields } = editingModelo

    // Parse do JSONB editado manualmente
    let arq_indicador: ArqIndicadorMap | null = null
    if (arq_indicador_raw.trim()) {
      try {
        arq_indicador = JSON.parse(arq_indicador_raw)
      } catch {
        toast.error('JSON de indicadores inválido. Corrija antes de salvar.')
        setSavingEdit(false)
        return
      }
    }

    const mapped = {
      ...Object.fromEntries(Object.entries(strFields).map(([k, v]) => [k, v === '' ? null : v])),
      arq_indicador,
    }

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

  /**
   * Lê o CSV do indicador (colunas: tempo + campo_extra) e faz upsert do
   * campo_extra em dados_simulacao.valores_extras (JSONB) para cada tempo.
   *
   * Exemplo: campo_extra = "turbidez", CSV tem colunas "tempo" e "turbidez".
   * Resultado em dados_simulacao: valores_extras = { "turbidez": 12.5, ... }
   */
  const importarIndicador = async (
    arqPath: string,
    campoExtra: string,
    id_mod: number,
    id_fonte: number,
    id_s: number,
  ): Promise<{ ok: boolean; count: number; errorMsg?: string }> => {
    // ── 1. Normaliza path ──────────────────────────────────────────────────────
    const cleanPath = arqPath.trim().replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^\//, '')

    // ── 2. Download ────────────────────────────────────────────────────────────
    const { data: fileData, error: dlError } = await supabase.storage
      .from('dados_brutos')
      .download(cleanPath)

    if (dlError || !fileData) {
      return {
        ok: false,
        count: 0,
        errorMsg: `Download falhou (${cleanPath}): ${dlError?.message ?? 'não encontrado'}`,
      }
    }

    // ── 3. Parse CSV ───────────────────────────────────────────────────────────
    const text = await fileData.text()
    if (!text.trim()) return { ok: false, count: 0, errorMsg: 'Arquivo vazio' }

    const firstLine = text.split('\n')[0].replace(/^\uFEFF/, '')
    const countSemi = (firstLine.match(/;/g) || []).length
    const countComma = (firstLine.match(/,/g) || []).length
    const sep = countSemi >= countComma ? ';' : ','

    const lines = text.split('\n').filter((l) => l.trim())
    if (lines.length < 2) return { ok: false, count: 0, errorMsg: 'CSV sem dados' }

    const headers = lines[0]
      .replace(/^\uFEFF/, '')
      .split(sep)
      .map((h) =>
        h
          .trim()
          .replace(/^["'\r]+|["'\r]+$/g, '')
          .toLowerCase(),
      )

    // Localiza coluna de tempo e coluna do campo_extra
    const tIdx = headers.findIndex((h) => h === 'tempo' || h.includes('tempo'))
    const vIdx = headers.findIndex((h) => h === campoExtra.toLowerCase())

    if (tIdx < 0)
      return {
        ok: false,
        count: 0,
        errorMsg: `Coluna "tempo" não encontrada. Headers: [${headers.join(', ')}]`,
      }
    if (vIdx < 0)
      return {
        ok: false,
        count: 0,
        errorMsg: `Coluna "${campoExtra}" não encontrada. Headers: [${headers.join(', ')}]`,
      }

    // Mapeia tempo → valor do campo_extra
    const valoresPorTempo: Record<string, number | null> = {}
    for (const line of lines.slice(1)) {
      if (!line.trim()) continue
      const vals = line.split(sep).map((v) => v.trim().replace(/^["'\r]+|["'\r]+$/g, ''))
      const tempo = (vals[tIdx] || '').replace(/-/g, '/')
      const raw = vals[vIdx] ?? ''
      const num = parseFloat(raw.replace(',', '.'))
      valoresPorTempo[tempo] = isNaN(num) ? null : num
    }

    const tempos = Object.keys(valoresPorTempo)
    if (tempos.length === 0) return { ok: false, count: 0, errorMsg: 'Nenhum dado de tempo válido' }

    // ── 4. Busca os registros existentes em dados_simulacao para esses tempos ──
    const { data: existentes, error: selErr } = await supabase
      .from('dados_simulacao')
      .select('id_ds, tempo, valores_extras')
      .eq('id_s', id_s)
      .eq('id_mod', id_mod)
      .eq('id_fonte', id_fonte)
      .in('tempo', tempos)

    if (selErr) {
      return { ok: false, count: 0, errorMsg: `Erro ao buscar dados_simulacao: ${selErr.message}` }
    }

    if (!existentes || existentes.length === 0) {
      return {
        ok: false,
        count: 0,
        errorMsg:
          'Nenhum registro encontrado em dados_simulacao para esses tempos. Importe os dados principais primeiro.',
      }
    }

    // ── 5. Atualiza valores_extras (merge JSONB) ───────────────────────────────
    const updates = existentes.map((row: any) => ({
      id_ds: row.id_ds,
      valores_extras: {
        ...(row.valores_extras ?? {}),
        [campoExtra]: valoresPorTempo[row.tempo] ?? null,
      },
    }))

    let erros = 0
    let errorMsg = ''
    for (let i = 0; i < updates.length; i += 500) {
      const lote = updates.slice(i, i + 500)
      const { error } = await supabase.from('dados_simulacao').upsert(lote, { onConflict: 'id_ds' })
      if (error) {
        console.error(`[importarIndicador "${campoExtra}"] upsert valores_extras lote ${i}:`, error)
        errorMsg = error.message
        erros++
      }
    }

    return erros === 0 ? { ok: true, count: updates.length } : { ok: false, count: 0, errorMsg }
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

        // ── Dados principais ────────────────────────────────────────────────
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

        // ── Indicadores: lê cada CSV e merge em dados_simulacao.valores_extras ──
        const arqIndMap = mod.arq_indicador // { "id_indicador": "path" } | null
        if (arqIndMap && typeof arqIndMap === 'object' && Object.keys(arqIndMap).length > 0) {
          const pares = Object.entries(arqIndMap)
          let totalIndicadores = 0
          let errosIndicadores = 0

          for (const [idIndStr, arqPath] of pares) {
            const idInd = Number(idIndStr)
            const indMeta = indicadores.find((x) => x.id_indicador === idInd)
            const campoExtra = indMeta?.campo_extra ?? ''
            const indNome = indMeta?.descricao ?? `id=${idIndStr}`

            if (!campoExtra) {
              errosIndicadores++
              toast.error(`Indicador "${indNome}" não tem campo_extra definido`, { duration: 8000 })
              continue
            }

            setImportStatus((prev) => ({
              ...prev,
              [id_mod]: `Importando indicador "${indNome}" (${campoExtra})...`,
            }))

            const { ok, count, errorMsg } = await importarIndicador(
              arqPath,
              campoExtra,
              mod.id_mod,
              mod.id_fonte,
              id_s,
            )

            if (!ok) {
              errosIndicadores++
              const msgCompleta = `Indicador "${indNome}" (${campoExtra}): ${errorMsg ?? 'erro desconhecido'}`
              toast.error(msgCompleta, { duration: 10000 })
            } else {
              totalIndicadores += count
            }
          }

          const resumo =
            errosIndicadores > 0
              ? `Concluído c/ erros (${rows.length} dados, ${errosIndicadores}/${pares.length} indicadores falharam)`
              : `Concluído (${rows.length} dados + ${totalIndicadores} valores_extras em ${pares.length} indicador(es))`
          setImportStatus((prev) => ({ ...prev, [id_mod]: resumo }))
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

  // ── Colunas de arquivo simples na tabela (sem arq_indicador) ─────────────────
  const FILE_COLS: {
    key: keyof Omit<EditingModelo, 'id_mod' | 'arq_indicador_raw'>
    label: string
  }[] = [
    { key: 'arq_mod', label: 'Modelo' },
    { key: 'arq_perdas', label: 'Perdas' },
    { key: 'arq_demanda', label: 'Demanda' },
    { key: 'arq_capex_estrategias', label: 'CAPEX Est.' },
    { key: 'arq_capex_perdas', label: 'CAPEX Per.' },
    { key: 'arq_opex', label: 'OPEX' },
  ]

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-20">
      {/* ── QUADRO 1: Cenários, Estratégias e Indicadores ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Configuração de cenários, estratégias e indicadores para as fontes de água
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Fonte */}
          <div className="max-w-xs">
            <label className="text-xs font-semibold">Fonte de Água</label>
            <Select
              value={idFonte}
              onValueChange={(v) => {
                setIdFonte(v)
                setIdTc('')
                setIdC('')
                setIdAcao('')
                setCenariosList([])
                setEstrategiasList([])
                setIndicadoresDraft([])
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Cenários */}
            <div className="border p-4 rounded-lg bg-slate-50 space-y-3">
              <h3 className="font-semibold text-sm">Montagem de Cenários</h3>
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
                size="sm"
                disabled={!idTc || !idC}
                onClick={() => {
                  const t = refData.tiposCenario.find((x: any) => x.id_tc.toString() === idTc)
                  const c = refData.cenarios.find((x: any) => x.id_cenarios.toString() === idC)
                  if (t && c) {
                    const label = `${t.descricao}: ${c.cenarios}`
                    // Impede duplicata de tipo de cenário
                    if (cenariosList.some((d) => d.tcDescricao === t.descricao)) {
                      return toast.error('Este tipo de cenário já foi adicionado')
                    }
                    setCenariosList((p) => [...p, { label, tcDescricao: t.descricao }])
                    setIdTc('')
                    setIdC('')
                  }
                }}
              >
                Adicionar Cenário
              </Button>
              {/* Preview do array que será gravado */}
              {cenariosList.length > 0 && (
                <div className="bg-slate-100 border rounded p-2 text-[10px] font-mono text-slate-500 break-all">
                  {JSON.stringify(cenariosList.map((c) => c.label))}
                </div>
              )}
              <ul className="space-y-1.5">
                {cenariosList.map((c, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center bg-white px-2 py-1.5 rounded border text-xs"
                  >
                    <span className="truncate flex-1 mr-2">{c.label}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-destructive shrink-0"
                      onClick={() => setCenariosList((p) => p.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Estratégias */}
            <div className="border p-4 rounded-lg bg-slate-50 space-y-3">
              <h3 className="font-semibold text-sm">Montagem de Estratégias</h3>
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
                size="sm"
                disabled={!idAcao}
                onClick={() => {
                  const a = refData.acoes.find((x: any) => x.id_acao.toString() === idAcao)
                  if (a) {
                    const label: string = a.descricao
                    if (estrategiasList.some((d) => d.label === label)) {
                      return toast.error('Esta ação já foi adicionada')
                    }
                    setEstrategiasList((p) => [...p, { label }])
                    setIdAcao('')
                  }
                }}
              >
                Adicionar Ação
              </Button>
              {/* Preview do array que será gravado */}
              {estrategiasList.length > 0 && (
                <div className="bg-slate-100 border rounded p-2 text-[10px] font-mono text-slate-500 break-all">
                  {JSON.stringify(estrategiasList.map((e) => e.label))}
                </div>
              )}
              <ul className="space-y-1.5">
                {estrategiasList.map((e, i) => (
                  <li
                    key={i}
                    className="flex justify-between items-center bg-white px-2 py-1.5 rounded border text-xs"
                  >
                    <span className="truncate flex-1 mr-2">{e.label}</span>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-5 w-5 text-destructive shrink-0"
                      onClick={() => setEstrategiasList((p) => p.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="w-3 h-3" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* Indicadores */}
            <div className="border p-4 rounded-lg bg-slate-50 space-y-3">
              <h3 className="font-semibold text-sm">Montagem de Indicadores</h3>
              {/* Select do indicador */}
              <Select value={indicadorSelecionado} onValueChange={setIndicadorSelecionado}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o indicador..." />
                </SelectTrigger>
                <SelectContent>
                  {indicadoresDisponiveis.map((ind) => (
                    <SelectItem key={ind.id_indicador} value={ind.id_indicador.toString()}>
                      {ind.descricao}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>

              {/* FileSelectDialog para o arquivo deste indicador */}
              {indicadorSelecionado && (
                <FileSelectDialog
                  label="Arquivo do indicador"
                  value={indicadorArq}
                  onChange={setIndicadorArq}
                />
              )}

              <Button
                className="w-full"
                size="sm"
                disabled={!indicadorSelecionado || !indicadorArq}
                onClick={handleAdicionarIndicador}
              >
                Adicionar Indicador
              </Button>

              {/* Preview do JSONB que será gravado */}
              {indicadoresDraft.length > 0 && (
                <div className="bg-slate-100 border rounded p-2 text-[10px] font-mono text-slate-500 break-all">
                  {JSON.stringify(
                    indicadoresDraft.reduce<Record<string, string>>((acc, d) => {
                      acc[d.id_indicador.toString()] = d.arq
                      return acc
                    }, {}),
                    null,
                    2,
                  )}
                </div>
              )}

              {/* Lista dos indicadores adicionados */}
              <ul className="space-y-1.5">
                {indicadoresDraft.map((d) => (
                  <li
                    key={d.id_indicador}
                    className="bg-white border rounded px-2 py-1.5 text-xs space-y-0.5"
                  >
                    <div className="flex justify-between items-start gap-1">
                      <span className="font-medium text-slate-700 leading-tight">
                        {d.descricao}
                      </span>
                      <button
                        onClick={() =>
                          setIndicadoresDraft((p) =>
                            p.filter((x) => x.id_indicador !== d.id_indicador),
                          )
                        }
                        className="text-destructive hover:text-red-700 shrink-0 mt-0.5"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                    <div className="font-mono text-[10px] text-slate-400 truncate" title={d.arq}>
                      {d.arq.split('/').pop()}
                    </div>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── QUADRO 2: Seleção de arquivos ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Seleção de arquivos para importação</CardTitle>
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
          <div className="col-span-full mt-2">
            <Button onClick={handleSaveModel}>Salvar Configuração</Button>
          </div>
        </CardContent>
      </Card>

      {/* ── QUADRO 3: Tabela de modelos com edição inline ── */}
      <div className="bg-white border rounded-xl shadow-sm overflow-hidden">
        <div className="px-4 py-3 border-b bg-slate-50 flex items-center justify-between">
          <h3 className="text-sm font-semibold text-slate-700">Modelos cadastrados</h3>
          <span className="text-xs text-muted-foreground">
            {modelos.length} {modelos.length === 1 ? 'registro' : 'registros'}
          </span>
        </div>

        <div className="overflow-x-auto max-h-[520px] overflow-y-auto">
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
                {/* Coluna especial: indicadores JSONB */}
                <th className="px-3 py-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">
                  Indicadores
                  <span className="font-normal text-slate-400 ml-1">(JSONB)</span>
                </th>
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
                    colSpan={FILE_COLS.length + 6}
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
                    {/* Checkbox */}
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

                    {/* Cenários — array de strings */}
                    <td className="px-3 py-2 text-slate-600 max-w-[180px]">
                      {Array.isArray(m.cenario) && m.cenario.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {m.cenario.map((c: string) => (
                            <span
                              key={c}
                              className="inline-block bg-blue-50 border border-blue-200 text-blue-700 rounded px-1 py-0.5 text-[10px]"
                            >
                              {c}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Estratégias — array de strings */}
                    <td className="px-3 py-2 text-slate-600 max-w-[180px]">
                      {Array.isArray(m.estrategia) && m.estrategia.length > 0 ? (
                        <div className="flex flex-wrap gap-1">
                          {m.estrategia.map((e: string) => (
                            <span
                              key={e}
                              className="inline-block bg-emerald-50 border border-emerald-200 text-emerald-700 rounded px-1 py-0.5 text-[10px]"
                            >
                              {e}
                            </span>
                          ))}
                        </div>
                      ) : (
                        <span className="text-slate-300">—</span>
                      )}
                    </td>

                    {/* Arquivos simples */}
                    {FILE_COLS.map((col) => (
                      <td key={col.key} className="px-2 py-2 max-w-[140px]">
                        {isEditing ? (
                          <Input
                            className="h-6 text-[11px] px-1.5 min-w-[120px]"
                            value={editingModelo[col.key]}
                            onChange={(e) =>
                              setEditingModelo((p) =>
                                p ? { ...p, [col.key]: e.target.value } : null,
                              )
                            }
                          />
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

                    {/* Indicadores JSONB */}
                    <td className="px-2 py-2 max-w-[220px]">
                      {isEditing ? (
                        /* Edição manual do JSON inteiro */
                        <textarea
                          className="w-full min-w-[180px] h-20 text-[10px] font-mono border rounded px-1.5 py-1 resize-y focus:outline-none focus:ring-1 focus:ring-primary"
                          value={editingModelo.arq_indicador_raw}
                          placeholder='{"3": "pasta/arq.csv"}'
                          onChange={(e) =>
                            setEditingModelo((p) =>
                              p ? { ...p, arq_indicador_raw: e.target.value } : null,
                            )
                          }
                        />
                      ) : m.arq_indicador && Object.keys(m.arq_indicador).length > 0 ? (
                        <div className="space-y-0.5">
                          {Object.entries(m.arq_indicador).map(([idInd, arq]) => {
                            const ind = indicadores.find((i) => i.id_indicador.toString() === idInd)
                            return (
                              <div key={idInd} className="text-[10px] leading-tight">
                                <span className="font-semibold text-slate-600">
                                  {ind?.descricao ?? `Ind. ${idInd}`}
                                </span>
                                <span
                                  className="block font-mono text-slate-400 truncate"
                                  title={arq}
                                >
                                  {arq.split('/').pop()}
                                </span>
                              </div>
                            )
                          })}
                        </div>
                      ) : (
                        <span className="text-slate-300 text-[10px]">—</span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-3 py-2 whitespace-nowrap">
                      {importStatus[m.id_mod] ? (
                        <span
                          className={`text-[11px] font-semibold ${
                            importStatus[m.id_mod].startsWith('Concluído')
                              ? 'text-emerald-600'
                              : importStatus[m.id_mod].startsWith('Erro') ||
                                  importStatus[m.id_mod].includes('erros')
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
