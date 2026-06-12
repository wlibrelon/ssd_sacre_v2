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

// ── FileSelectDialog ──────────────────────────────────────────────────────────

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
            <Button variant="outline" type="button">Buscar</Button>
          </DialogTrigger>
          <DialogContent className="max-w-4xl">
            <DialogHeader>
              <DialogTitle>Selecionar: {label}</DialogTitle>
            </DialogHeader>
            <div className="flex items-center space-x-2 bg-slate-50 p-2 rounded border">
              <Button variant="ghost" size="sm" onClick={() => setPath((p) => p.slice(0, -1))} disabled={path.length === 0}>
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

// ── Helpers JSONB ─────────────────────────────────────────────────────────────

function buildCenarioJsonb(cenariosList: { tcChave: string; cChave: string }[]) {
  return cenariosList.reduce<Record<string, string>>((acc, item) => {
    acc[item.tcChave] = item.cChave
    return acc
  }, {})
}

function buildEstrategiaJsonb(estrategiasList: { chave: string }[]) {
  return estrategiasList.map((e) => e.chave)
}

// ── Tipo para indicador com arquivo associado ─────────────────────────────────
// Cada entrada representa um indicador selecionado + o arquivo CSV a importar.
// campo_extra é a chave que será usada no JSONB valores_extras.

type IndicadorItem = {
  id_indicador: number
  descricao: string
  unidade: string
  campo_extra: string   // chave no JSONB de valores_extras
  arq_indicador: string // path no storage para o CSV deste indicador
}

// ─────────────────────────────────────────────────────────────────────────────

export function Importacao() {
  const [modelos, setModelos] = useState<any[]>([])
  const [selectedModels, setSelectedModels] = useState<Record<number, boolean>>({})
  const [importStatus, setImportStatus] = useState<Record<number, { label: string; detail?: string }>>({})

  const [refData, setRefData] = useState<any>({
    fontes: [],
    tiposCenario: [],
    cenarios: [],
    acoes: [],
    cenariosFonte: [],
    tcCenario: [],
    acoesFonte: [],
    // indicadores por fonte: { [id_fonte]: Indicador[] }
    indicadoresFonte: {} as Record<number, any[]>,
  })

  const [idFonte, setIdFonte]   = useState('')
  const [idTc, setIdTc]         = useState('')
  const [idC, setIdC]           = useState('')
  const [idAcao, setIdAcao]     = useState('')
  const [idIndicador, setIdIndicador] = useState('')

  const [cenariosList, setCenariosList]     = useState<{ label: string; tcChave: string; cChave: string }[]>([])
  const [estrategiasList, setEstrategiasList] = useState<{ label: string; chave: string }[]>([])
  // Lista de indicadores selecionados com seus arquivos
  const [indicadoresList, setIndicadoresList] = useState<IndicadorItem[]>([])

  const [files, setFiles] = useState({
    arq_mod: '',
    arq_perdas: '',
    arq_demanda: '',
    arq_capex_estrategias: '',
    arq_capex_perdas: '',
    arq_opex: '',
  })

  // ── Diagnóstico de carregamento de indicadores (exibido na UI) ──────────
  const [indDiag, setIndDiag] = useState<{ tentativa: string; rows: any[]; erro?: string } | null>(null)

  // ── Carregamento de dados de referência ───────────────────────────────────
  useEffect(() => {
    supabase
      .from('modelos')
      .select('*, fonte_agua(nome_fonte)')
      .then((res) => setModelos(res.data || []))

    // Dados de referência fixos (sem indicadores)
    Promise.all([
      supabase.from('fonte_agua').select('*'),
      supabase.from('tipos_cenarios').select('*'),
      supabase.from('cenarios').select('*'),
      supabase.from('acoes').select('*'),
      supabase.from('cenarios_fonte').select('*'),
      supabase.from('tipo_cenario_cenario').select('*'),
      supabase.from('acoes_fonte').select('*'),
    ]).then((res) => {
      setRefData((prev: any) => ({
        ...prev,
        fontes:        res[0].data || [],
        tiposCenario:  res[1].data || [],
        cenarios:      res[2].data || [],
        acoes:         res[3].data || [],
        cenariosFonte: res[4].data || [],
        tcCenario:     res[5].data || [],
        acoesFonte:    res[6].data || [],
      }))
    })

    // Busca indicadores com estratégia em cascata para descobrir o schema real:
    // Tentativa 1 — indicadores tem id_fonte direto
    // Tentativa 2 — tabela indicadores_fonte (relação N:N)
    // Tentativa 3 — indicadores_aplicado (usada na simulação)
    const carregarIndicadores = async () => {
      const erros: string[] = []

      // Tentativa 1: campo id_fonte diretamente na tabela indicadores
      const t1 = await supabase.from('indicadores').select('*')
      if (!t1.error && t1.data && t1.data.length > 0 && 'id_fonte' in t1.data[0]) {
        const indicadoresFonte: Record<number, any[]> = {}
        t1.data.forEach((row: any) => {
          const fid = Number(row.id_fonte)
          if (!indicadoresFonte[fid]) indicadoresFonte[fid] = []
          indicadoresFonte[fid].push(row)
        })
        setIndDiag({ tentativa: 'indicadores (id_fonte direto)', rows: t1.data })
        setRefData((prev: any) => ({ ...prev, indicadoresFonte }))
        return
      }
      erros.push(t1.error
        ? \`indicadores: \${t1.error.message}\`
        : \`indicadores: \${t1.data?.length ?? 0} rows, sem campo id_fonte\`)

      // Tentativa 2: tabela indicadores_fonte como N:N com join
      const t2 = await supabase.from('indicadores_fonte').select('*, indicadores(*)')
      if (!t2.error && t2.data && t2.data.length > 0) {
        const indicadoresFonte: Record<number, any[]> = {}
        t2.data.forEach((row: any) => {
          const fid = Number(row.id_fonte)
          if (!indicadoresFonte[fid]) indicadoresFonte[fid] = []
          const ind = row.indicadores ?? row
          if (ind) indicadoresFonte[fid].push(ind)
        })
        setIndDiag({ tentativa: 'indicadores_fonte JOIN indicadores', rows: t2.data })
        setRefData((prev: any) => ({ ...prev, indicadoresFonte }))
        return
      }
      erros.push(t2.error ? \`indicadores_fonte: \${t2.error.message}\` : \`indicadores_fonte: 0 rows\`)

      // Tentativa 3: indicadores_aplicado com id_fonte
      const t3 = await supabase.from('indicadores_aplicado').select('*, indicadores(*)')
      if (!t3.error && t3.data && t3.data.length > 0) {
        const indicadoresFonte: Record<number, any[]> = {}
        t3.data.forEach((row: any) => {
          const fid = Number(row.id_fonte ?? 0)
          if (!fid) return
          if (!indicadoresFonte[fid]) indicadoresFonte[fid] = []
          const ind = row.indicadores ?? row
          if (ind) indicadoresFonte[fid].push(ind)
        })
        setIndDiag({ tentativa: 'indicadores_aplicado JOIN indicadores', rows: t3.data })
        setRefData((prev: any) => ({ ...prev, indicadoresFonte }))
        return
      }
      erros.push(t3.error ? \`indicadores_aplicado: \${t3.error.message}\` : \`indicadores_aplicado: 0 rows com id_fonte\`)

      // Nenhuma tentativa funcionou
      setIndDiag({ tentativa: 'nenhuma funcionou', rows: [], erro: erros.join(' | ') })
    }

    carregarIndicadores()
  }, [])

  // ── Selects filtrados pela fonte selecionada ──────────────────────────────
  const filteredTipos = refData.tiposCenario.filter((tc: any) =>
    refData.cenariosFonte.some((cf: any) => cf.id_fonte === Number(idFonte) && cf.id_tc === tc.id_tc),
  )
  const filteredCenarios = refData.cenarios.filter((c: any) =>
    refData.tcCenario.some((tcc: any) => tcc.id_tc === Number(idTc) && tcc.id_c === c.id_cenarios),
  )
  const filteredAcoes = refData.acoes.filter((a: any) =>
    refData.acoesFonte.some((af: any) => af.id_fonte === Number(idFonte) && af.id_acao === a.id_acao),
  )
  // Indicadores disponíveis para a fonte selecionada (excluindo já adicionados)
  const filteredIndicadores: any[] = idFonte
    ? (refData.indicadoresFonte[Number(idFonte)] || []).filter(
        (ind: any) => !indicadoresList.some((i) => i.id_indicador === ind.id_indicador),
      )
    : []

  // ── Resolve labels para exibição na tabela ────────────────────────────────
  function resolveCenarioLabel(cenarioObj: Record<string, string>): string {
    return Object.entries(cenarioObj)
      .map(([tcChave, cChave]) => {
        const tc = refData.tiposCenario.find((t: any) => (t.chave ?? t.id_tc.toString()) === tcChave)
        const c  = refData.cenarios.find((x: any) => (x.chave ?? x.cenarios.toLowerCase().replace(/\s+/g, '_')) === cChave)
        return `${tc?.descricao ?? tcChave}: ${c?.cenarios ?? cChave}`
      })
      .join(', ')
  }

  function resolveEstrategiaLabel(arr: string[]): string {
    return arr.map((chave) => {
      const a = refData.acoes.find((x: any) => (x.chave ?? x.descricao.toLowerCase().replace(/\s+/g, '_')) === chave)
      return a?.descricao ?? chave
    }).join(', ')
  }

  // ── Salva configuração (modelo) ───────────────────────────────────────────
  // Os indicadores e seus arquivos são gravados na tabela 'modelos' como JSONB
  // no campo 'indicadores_config': [{ id_indicador, campo_extra, arq_indicador }, ...]
  // Isso permite que a importação saiba quais CSVs buscar e em qual chave gravar.
  const handleSaveModel = async () => {
    if (!idFonte) return toast.error('Selecione uma fonte de água')

    const cenarioJsonb    = buildCenarioJsonb(cenariosList)
    const estrategiaJsonb = buildEstrategiaJsonb(estrategiasList)

    // Valida que indicadores com arquivo vazios não bloqueiem (arquivo é opcional —
    // indicadores sem arquivo serão ignorados na importação)
    const indicadoresConfig = indicadoresList.map(({ id_indicador, campo_extra, arq_indicador }) => ({
      id_indicador,
      campo_extra,
      arq_indicador: arq_indicador || null,
    }))

    const { data, error } = await supabase
      .from('modelos')
      .insert({
        id_fonte: Number(idFonte),
        cenario: cenarioJsonb,
        estrategia: estrategiaJsonb,
        // JSONB com a lista de indicadores e arquivos associados
        indicadores_config: indicadoresConfig.length > 0 ? indicadoresConfig : null,
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
    setIndicadoresList([])
    setFiles({ arq_mod: '', arq_perdas: '', arq_demanda: '', arq_capex_estrategias: '', arq_capex_perdas: '', arq_opex: '' })
  }

  // ── fetchCSV: lê um arquivo CSV do storage e retorna [{tempo, valor}] ─────
  const fetchCSV = async (path: string | null | undefined, label = '') => {
    if (!path) return []
    const cleanPath = path.trim().replace(/\\/g, '/').replace(/\/+/g, '/').replace(/^\//, '')
    const { data, error } = await supabase.storage.from('dados_brutos').download(cleanPath)
    if (error) throw new Error(`Erro ao baixar "${cleanPath}" (${label}): ${error.message}`)
    if (!data) return []
    const lines = (await data.text()).split('\n').map((l) => l.trim()).filter(Boolean)
    if (lines.length < 2) return []
    const header = lines[0].toLowerCase().split(/[,;]/)
    const tIdx = header.findIndex((h) => h.includes('tempo'))
    const tIdxFinal = tIdx >= 0 ? tIdx : 0
    const vIdx = header.findIndex(
      (h) => h.includes(label.toLowerCase()) || h.replace(/_/g, '') === label.toLowerCase().replace(/_/g, ''),
    )
    const vIdxFinal = vIdx >= 0 ? vIdx : tIdxFinal === 0 ? 1 : 0
    return lines.slice(1).map((l) => {
      const parts = l.split(/[,;]/)
      return {
        tempo: (parts[tIdxFinal] || '').trim().replace(/-/g, '/'),
        valor: parseFloat((parts[vIdxFinal] || '0').trim().replace(/\./g, '').replace(',', '.')) || 0,
      }
    }).filter((d) => d.tempo)
  }

  // ── Importação principal ──────────────────────────────────────────────────
  const handleImport = async () => {
    const selectedIds = Object.keys(selectedModels).filter((k) => selectedModels[Number(k)]).map(Number)
    if (selectedIds.length === 0) return toast.error('Selecione ao menos um modelo')

    let hasError = false
    for (const id_mod of selectedIds) {
      setImportStatus((prev) => ({ ...prev, [id_mod]: { label: 'Importando...' } }))
      try {
        const mod = modelos.find((m) => m.id_mod === id_mod)
        if (!mod) throw new Error('Modelo não encontrado')

        // ── 1. Carrega CSVs dos campos fixos ─────────────────────────────
        const [mD, pD, dD, ceD, cpD, oD] = await Promise.all([
          fetchCSV(mod.arq_mod,               'volume_captado'),
          fetchCSV(mod.arq_perdas,            'perdas'),
          fetchCSV(mod.arq_demanda,           'demanda'),
          fetchCSV(mod.arq_capex_estrategias, 'capex_estrategia'),
          fetchCSV(mod.arq_capex_perdas,      'capex_perdas'),
          fetchCSV(mod.arq_opex,              'opex'),
        ])

        // ── 2. Carrega CSVs dos indicadores dinamicamente ─────────────────
        // indicadores_config: [{ id_indicador, campo_extra, arq_indicador }]
        // Cada um gera uma série { tempo, valor } que vai para valores_extras[campo_extra]
        let indConfig: { id_indicador: number; campo_extra: string; arq_indicador: string | null }[] = []
        if (mod.indicadores_config) {
          if (typeof mod.indicadores_config === 'string') {
            try { indConfig = JSON.parse(mod.indicadores_config) } catch { indConfig = [] }
          } else if (Array.isArray(mod.indicadores_config)) {
            indConfig = mod.indicadores_config
          }
        }

        // Busca dados de cada indicador em paralelo (ignora os sem arquivo)
        const indDataMap: Record<string, { tempo: string; valor: number }[]> = {}
        await Promise.all(
          indConfig
            .filter((ic) => !!ic.arq_indicador && !!ic.campo_extra)
            .map(async (ic) => {
              const rows = await fetchCSV(ic.arq_indicador!, ic.campo_extra)
              indDataMap[ic.campo_extra] = rows
            }),
        )

        // ── 3. Monta o conjunto de tempos unificado ───────────────────────
        const allIndRows = Object.values(indDataMap).flat()
        const allTempos = new Set([...mD, ...pD, ...dD, ...ceD, ...cpD, ...oD, ...allIndRows].map((d) => d.tempo))
        if (allTempos.size === 0)
          throw new Error('Nenhuma linha de dados encontrada nos arquivos CSV')

        // ── 4. Normaliza JSONB de cenários e estratégias ──────────────────
        let cenariosObj: Record<string, string> = {}
        if (typeof mod.cenario === 'string') {
          try { cenariosObj = JSON.parse(mod.cenario || '{}') } catch { cenariosObj = {} }
        } else if (mod.cenario && typeof mod.cenario === 'object' && !Array.isArray(mod.cenario)) {
          cenariosObj = mod.cenario
        }

        let estrategiasArr: string[] = []
        if (typeof mod.estrategia === 'string') {
          try { estrategiasArr = JSON.parse(mod.estrategia || '[]') } catch { estrategiasArr = [] }
        } else if (Array.isArray(mod.estrategia)) {
          estrategiasArr = mod.estrategia
        }

        // ── 5. Monta as linhas para inserção ─────────────────────────────
        // valores_extras: JSONB dinâmico { campo_extra: valor, ... }
        // Cada chave corresponde a um indicador definido pelo gestor.
        const rows = Array.from(allTempos).map((t) => {
          // Monta o objeto valores_extras apenas com os indicadores que têm dado para este tempo
          const valoresExtras: Record<string, number> = {}
          Object.entries(indDataMap).forEach(([campo, serie]) => {
            const found = serie.find((d) => d.tempo === t)
            if (found !== undefined) valoresExtras[campo] = found.valor
          })

          return {
            id_mod:           mod.id_mod,
            id_fonte:         mod.id_fonte,
            tempo:            t,
            volume_captado:   mD.find((d) => d.tempo === t)?.valor ?? 0,
            perdas:           pD.find((d) => d.tempo === t)?.valor ?? 0,
            demanda:          dD.find((d) => d.tempo === t)?.valor ?? 0,
            capex_estrategia: ceD.find((d) => d.tempo === t)?.valor ?? 0,
            capex_perdas:     cpD.find((d) => d.tempo === t)?.valor ?? 0,
            opex:             oD.find((d) => d.tempo === t)?.valor ?? 0,
            cenarios:         cenariosObj,
            estrategias:      estrategiasArr,
            // JSONB dinâmico com valores dos indicadores por campo_extra
            // Ex: { "iqr": 0.85, "turbidez": 12.3 }
            valores_extras: Object.keys(valoresExtras).length > 0 ? valoresExtras : null,
          }
        })

        // ── 6. Limpa registros anteriores e insere os novos ───────────────
        const { error: deleteError } = await supabase
          .from('dados_simulacao')
          .delete()
          .eq('id_mod', mod.id_mod)
          .eq('id_fonte', mod.id_fonte)
        if (deleteError)
          throw new Error(`Erro ao limpar dados anteriores: ${deleteError.message}`)

        for (let i = 0; i < rows.length; i += 500) {
          const { error } = await supabase
            .from('dados_simulacao')
            .insert(rows.slice(i, i + 500) as any)
          if (error)
            throw new Error(
              `Erro no banco (lote ${i / 500 + 1}): ${error.message}${error.details ? ` — ${error.details}` : ''}${error.hint ? ` | Dica: ${error.hint}` : ''}`,
            )
        }

        setImportStatus((prev) => ({ ...prev, [id_mod]: { label: `Concluído (${rows.length} linhas)` } }))
      } catch (err: any) {
        hasError = true
        const msg: string = err?.message ?? String(err)
        setImportStatus((prev) => ({ ...prev, [id_mod]: { label: 'Erro', detail: msg } }))
        toast.error(`Modelo ${id_mod}: ${msg}`, { duration: 10000 })
      }
    }
    if (!hasError) toast.success('Importação concluída com sucesso')
  }

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-6 pb-20">

      {/* ── CARD 1: Configuração de cenários, estratégias e indicadores ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">
            Configuração de cenários, estratégias e indicadores para as fontes de água
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">

          {/* Seleção de Fonte */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-2xl">
            <div className="space-y-1">
              <label className="text-xs font-semibold">Fonte de Água</label>
              <Select
                value={idFonte}
                onValueChange={(v) => {
                  setIdFonte(v)
                  // Limpa itens da fonte anterior ao trocar
                  setIdTc(''); setIdC(''); setIdAcao(''); setIdIndicador('')
                  setCenariosList([]); setEstrategiasList([]); setIndicadoresList([])
                }}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione a fonte..." />
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
          </div>

          {/* Três quadros lado a lado: Cenários | Estratégias | Indicadores */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">

            {/* ── Montagem de Cenários ── */}
            <div className="border p-4 rounded-lg bg-slate-50 space-y-4">
              <h3 className="font-semibold text-sm">Montagem de Cenários</h3>
              <div className="space-y-2">
                <Select value={idTc} onValueChange={setIdTc}>
                  <SelectTrigger><SelectValue placeholder="Tipo de cenário..." /></SelectTrigger>
                  <SelectContent>
                    {filteredTipos.map((t: any) => (
                      <SelectItem key={t.id_tc} value={t.id_tc.toString()}>{t.descricao}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Select value={idC} onValueChange={setIdC}>
                  <SelectTrigger><SelectValue placeholder="Cenário..." /></SelectTrigger>
                  <SelectContent>
                    {filteredCenarios.map((c: any) => (
                      <SelectItem key={c.id_cenarios} value={c.id_cenarios.toString()}>{c.cenarios}</SelectItem>
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
                      setCenariosList((p) => [...p, {
                        label: `${t.descricao}: ${c.cenarios}`,
                        tcChave: t.chave ?? t.id_tc.toString(),
                        cChave:  c.chave ?? c.cenarios.toLowerCase().replace(/\s+/g, '_'),
                      }])
                      setIdTc(''); setIdC('')
                    }
                  }}
                >
                  Adicionar Cenário
                </Button>
              </div>
              <ul className="space-y-2">
                {cenariosList.map((c, i) => (
                  <li key={i} className="flex justify-between items-center bg-white p-2 rounded border text-sm">
                    {c.label}
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive"
                      onClick={() => setCenariosList((p) => p.filter((_, idx) => idx !== i))}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Montagem de Estratégia ── */}
            <div className="border p-4 rounded-lg bg-slate-50 space-y-4">
              <h3 className="font-semibold text-sm">Montagem de Estratégia</h3>
              <div className="space-y-2">
                <Select value={idAcao} onValueChange={setIdAcao}>
                  <SelectTrigger><SelectValue placeholder="Escolha a ação..." /></SelectTrigger>
                  <SelectContent>
                    {filteredAcoes.map((a: any) => (
                      <SelectItem key={a.id_acao} value={a.id_acao.toString()}>{a.descricao}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <Button
                  className="w-full"
                  disabled={!idAcao}
                  onClick={() => {
                    const a = refData.acoes.find((x: any) => x.id_acao.toString() === idAcao)
                    if (a) {
                      setEstrategiasList((p) => [...p, {
                        label: a.descricao,
                        chave: a.chave ?? a.descricao.toLowerCase().replace(/\s+/g, '_'),
                      }])
                      setIdAcao('')
                    }
                  }}
                >
                  Adicionar Ação
                </Button>
              </div>
              <ul className="space-y-2">
                {estrategiasList.map((e, i) => (
                  <li key={i} className="flex justify-between items-center bg-white p-2 rounded border text-sm">
                    {e.label}
                    <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive"
                      onClick={() => setEstrategiasList((p) => p.filter((_, idx) => idx !== i))}>
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </li>
                ))}
              </ul>
            </div>

            {/* ── Definição de Indicadores ── */}
            <div className="border p-4 rounded-lg bg-slate-50 space-y-4">
              <h3 className="font-semibold text-sm">Definição de Indicadores</h3>

              {/* Painel de diagnóstico — visível apenas enquanto a estrutura não for confirmada */}
              {indDiag && (
                <div className={`text-[11px] rounded p-2 border ${indDiag.erro ? 'bg-red-50 border-red-200 text-red-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'}`}>
                  <p className="font-semibold">Diagnóstico indicadores</p>
                  <p>Tentativa: <strong>{indDiag.tentativa}</strong> — {indDiag.rows.length} registro(s) encontrado(s)</p>
                  {indDiag.erro && <p className="mt-1 text-red-600">{indDiag.erro}</p>}
                  {indDiag.rows.length > 0 && (
                    <details className="mt-1">
                      <summary className="cursor-pointer">Ver primeiros campos do 1º registro</summary>
                      <pre className="mt-1 text-[10px] whitespace-pre-wrap break-all">
                        {JSON.stringify(indDiag.rows[0], null, 2)}
                      </pre>
                    </details>
                  )}
                </div>
              )}

              {!idFonte ? (
                <p className="text-xs text-muted-foreground">Selecione uma fonte de água para ver os indicadores disponíveis.</p>
              ) : filteredIndicadores.length === 0 && indicadoresList.length === 0 ? (
                <p className="text-xs text-muted-foreground">
                  Nenhum indicador disponível para esta fonte (id_fonte={idFonte}).
                  {indDiag && <> Tentativa usada: <strong>{indDiag.tentativa}</strong>.</>}
                </p>
              ) : (
                <div className="space-y-2">
                  {filteredIndicadores.length > 0 && (
                    <>
                      <Select value={idIndicador} onValueChange={setIdIndicador}>
                        <SelectTrigger><SelectValue placeholder="Selecione o indicador..." /></SelectTrigger>
                        <SelectContent>
                          {filteredIndicadores.map((ind: any) => (
                            <SelectItem key={ind.id_indicador} value={ind.id_indicador.toString()}>
                              {ind.descricao}
                              {ind.unidade ? ` (${ind.unidade})` : ''}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <Button
                        className="w-full"
                        disabled={!idIndicador}
                        onClick={() => {
                          const allInds: any[] = refData.indicadoresFonte[Number(idFonte)] || []
                          const ind = allInds.find((x: any) => x.id_indicador.toString() === idIndicador)
                          if (ind) {
                            setIndicadoresList((p) => [...p, {
                              id_indicador: ind.id_indicador,
                              descricao:    ind.descricao,
                              unidade:      ind.unidade || '',
                              campo_extra:  ind.campo_extra,
                              arq_indicador: '',
                            }])
                            setIdIndicador('')
                          }
                        }}
                      >
                        Adicionar Indicador
                      </Button>
                    </>
                  )}
                </div>
              )}

              {/* Lista de indicadores adicionados com seleção do arquivo CSV */}
              {indicadoresList.length > 0 && (
                <ul className="space-y-3 mt-2">
                  {indicadoresList.map((ind, i) => (
                    <li key={i} className="bg-white p-3 rounded border space-y-2">
                      <div className="flex justify-between items-start">
                        <div>
                          <p className="text-sm font-medium">{ind.descricao}</p>
                          <p className="text-[11px] text-muted-foreground">
                            Chave: <code className="bg-slate-100 px-1 rounded">{ind.campo_extra}</code>
                            {ind.unidade && <> · Unidade: <strong>{ind.unidade}</strong></>}
                          </p>
                        </div>
                        <Button variant="ghost" size="icon" className="h-6 w-6 text-destructive shrink-0"
                          onClick={() => setIndicadoresList((p) => p.filter((_, idx) => idx !== i))}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                      {/* Seleção do arquivo CSV para este indicador */}
                      <FileSelectDialog
                        label={`Arquivo CSV — ${ind.descricao}`}
                        value={ind.arq_indicador}
                        onChange={(v) =>
                          setIndicadoresList((p) =>
                            p.map((item, idx) => idx === i ? { ...item, arq_indicador: v } : item)
                          )
                        }
                      />
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* ── CARD 2: Seleção de arquivos de dados fixos ── */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm">Seleção de arquivo para importação</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <FileSelectDialog label="Arquivo de Modelo"          value={files.arq_mod}               onChange={(v) => setFiles((p) => ({ ...p, arq_mod: v }))} />
          <FileSelectDialog label="Arquivo de Perdas"          value={files.arq_perdas}             onChange={(v) => setFiles((p) => ({ ...p, arq_perdas: v }))} />
          <FileSelectDialog label="Arquivo de Demanda"         value={files.arq_demanda}            onChange={(v) => setFiles((p) => ({ ...p, arq_demanda: v }))} />
          <FileSelectDialog label="Arquivo de CAPEX Estratégias" value={files.arq_capex_estrategias} onChange={(v) => setFiles((p) => ({ ...p, arq_capex_estrategias: v }))} />
          <FileSelectDialog label="Arquivo de CAPEX Perdas"   value={files.arq_capex_perdas}       onChange={(v) => setFiles((p) => ({ ...p, arq_capex_perdas: v }))} />
          <FileSelectDialog label="Arquivo de OPEX"            value={files.arq_opex}               onChange={(v) => setFiles((p) => ({ ...p, arq_opex: v }))} />
          <div className="col-span-full mt-4">
            <Button onClick={handleSaveModel}>Salvar Configuração</Button>
          </div>
        </CardContent>
      </Card>

      {/* ── Tabela de modelos configurados ── */}
      <div className="border rounded overflow-hidden max-h-[500px] overflow-y-auto bg-white">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 sticky top-0 z-10">
            <tr>
              <th className="p-2 w-12">Imp</th>
              <th className="p-2 text-left">Fonte</th>
              <th className="p-2 text-left">Cenários</th>
              <th className="p-2 text-left">Estratégias</th>
              <th className="p-2 text-left">Indicadores</th>
              <th className="p-2 text-left">Status</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {modelos.map((m) => {
              let cenarioObj: Record<string, string> = {}
              if (typeof m.cenario === 'string') {
                try { cenarioObj = JSON.parse(m.cenario || '{}') } catch { cenarioObj = {} }
              } else if (m.cenario && typeof m.cenario === 'object' && !Array.isArray(m.cenario)) {
                cenarioObj = m.cenario
              }

              let estrategiaArr: string[] = []
              if (typeof m.estrategia === 'string') {
                try { estrategiaArr = JSON.parse(m.estrategia || '[]') } catch { estrategiaArr = [] }
              } else if (Array.isArray(m.estrategia)) {
                estrategiaArr = m.estrategia
              }

              // Exibe os indicadores configurados (nome da chave campo_extra + descrição se disponível)
              let indConfig: { campo_extra: string; id_indicador: number }[] = []
              if (typeof m.indicadores_config === 'string') {
                try { indConfig = JSON.parse(m.indicadores_config || '[]') } catch { indConfig = [] }
              } else if (Array.isArray(m.indicadores_config)) {
                indConfig = m.indicadores_config
              }

              const indLabel = indConfig.length > 0
                ? indConfig.map((ic) => {
                    // Tenta resolver a descrição a partir dos dados carregados em memória
                    const allInds = Object.values(refData.indicadoresFonte).flat() as any[]
                    const found = allInds.find((x: any) => x.id_indicador === ic.id_indicador)
                    return found ? `${found.descricao} (${ic.campo_extra})` : ic.campo_extra
                  }).join(', ')
                : '-'

              return (
                <tr key={m.id_mod} className="hover:bg-slate-50">
                  <td className="p-2 text-center">
                    <Checkbox
                      checked={!!selectedModels[m.id_mod]}
                      onCheckedChange={(c) => setSelectedModels((p) => ({ ...p, [m.id_mod]: !!c }))}
                    />
                  </td>
                  <td className="p-2 font-medium">{m.fonte_agua?.nome_fonte}</td>
                  <td className="p-2">{Object.keys(cenarioObj).length > 0 ? resolveCenarioLabel(cenarioObj) : '-'}</td>
                  <td className="p-2">{estrategiaArr.length > 0 ? resolveEstrategiaLabel(estrategiaArr) : '-'}</td>
                  <td className="p-2 text-slate-600 text-xs">{indLabel}</td>
                  <td className="p-2">
                    {importStatus[m.id_mod] ? (
                      <div>
                        <span className={`font-semibold ${
                          importStatus[m.id_mod].label === 'Erro'
                            ? 'text-destructive'
                            : importStatus[m.id_mod].label.startsWith('Concluído')
                              ? 'text-green-600'
                              : 'text-muted-foreground'
                        }`}>
                          {importStatus[m.id_mod].label}
                        </span>
                        {importStatus[m.id_mod].detail && (
                          <p className="text-xs text-destructive mt-0.5 whitespace-pre-wrap break-all">
                            {importStatus[m.id_mod].detail}
                          </p>
                        )}
                      </div>
                    ) : (
                      <span className="text-muted-foreground">-</span>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      <div className="flex justify-end">
        <Button onClick={handleImport} className="w-48">Importar dados</Button>
      </div>
    </div>
  )
}