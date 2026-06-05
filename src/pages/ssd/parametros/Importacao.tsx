import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { NativeSelect } from '../components/NativeSelect'
import { Checkbox } from '@/components/ui/checkbox'

export function Importacao() {
  const [simulacoes, setSimulacoes] = useState<any[]>([])
  const [modelos, setModelos] = useState<any[]>([])
  const [selectedSim, setSelectedSim] = useState('')
  const [selectedModels, setSelectedModels] = useState<Record<number, number | null>>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    supabase
      .from('simulacao_ssd')
      .select('*')
      .then((res) => setSimulacoes(res.data || []))
    supabase
      .from('modelos')
      .select('*, fonte_agua(nome_fonte)')
      .then((res) => setModelos(res.data || []))
  }, [])

  const handleSelectModel = (id_fonte: number, id_mod: number | null) => {
    setSelectedModels((prev) => ({ ...prev, [id_fonte]: id_mod }))
  }

  // Normaliza o caminho removendo barras duplicadas e espaços
  const normalizePath = (path: string): string => {
    return path
      .trim()
      .replace(/\/g, '/') // troca backslash por slash
      .replace(/\/+/g, '/') // remove barras duplicadas 
      .replace(/^\//, '') // remove barra inicial se houver
  }

  const fetchCSV = async (
    path: string | null | undefined,
    label = '',
  ): Promise<{ tempo: string; valor: number }[]> => {
    // CORRIGIDO: checar null/undefined/string vazia explicitamente
    if (path == null || path.trim() === '') return []
    const cleanPath = normalizePath(path)
    const { data, error } = await supabase.storage.from('dados_brutos').download(cleanPath)
    // CORRIGIDO: logar o erro real em vez de engolir silenciosamente
    if (error) {
      console.error(`[fetchCSV] Erro ao baixar "${cleanPath}" (${label}):`, error.message)
      toast.error(`Arquivo não encontrado no storage: ${cleanPath}`)
      return []
    }
    if (!data) return []
    const text = await data.text()
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l)
    if (lines.length < 2) return []
    const header = lines[0].toLowerCase().split(/[,;]/)
    // tIdx: coluna com 'tempo'; fallback para coluna 0
    const tIdx = header.findIndex((h) => h.includes('tempo'))
    const tIdxFinal = tIdx >= 0 ? tIdx : 0
    // vIdx: primeiro índice diferente de tIdxFinal
    const vIdx = header.findIndex((_, i) => i !== tIdxFinal)
    const vIdxFinal = vIdx >= 0 ? vIdx : tIdxFinal === 0 ? 1 : 0
    return lines
      .slice(1)
      .map((l) => {
        const parts = l.split(/[,;]/)
        let tempo = parts[tIdxFinal] ? parts[tIdxFinal].trim() : ''
        if (tempo.includes('-')) tempo = tempo.replace(/-/g, '/')
        let valor = 0
        if (parts[vIdxFinal]) {
          const raw = parts[vIdxFinal].trim()
          // Detecta formato: vírgula = PT-BR (milhar=ponto, decimal=vírgula)
          const vRaw = raw.includes(',') ? raw.replace(/\./g, '').replace(',', '.') : raw
          valor = parseFloat(vRaw)
        }
        return { tempo, valor: isNaN(valor) ? 0 : valor }
      })
      .filter((d) => d.tempo)
  }

  const handleImport = async () => {
    if (!selectedSim) return toast.error('Selecione uma simulação')
    // BUG 7 CORRIGIDO: validar que selectedSim é um número válido antes de usar
    const idSimulacao = parseInt(selectedSim, 10)
    if (isNaN(idSimulacao)) return toast.error('ID de simulação inválido')
    const modsToImport = Object.values(selectedModels).filter(
      (v) => v != null && v !== 0,
    ) as number[]
    if (modsToImport.length === 0) return toast.error('Selecione ao menos um modelo')
    setLoading(true)
    const { data: inds } = await supabase
      .from('indicadores_aplicado')
      .select('*, indicadores(*)')
      .eq('id_s', idSimulacao)

    for (const id_mod of modsToImport) {
      const mod = modelos.find((m) => m.id_mod === id_mod)
      if (!mod) continue

      // ✅ CORRIGIDO: Monta caminho completo - ÚNICA DECLARAÇÃO
      const p = (folder: string, file: string | null | undefined) =>
        file ? `${folder}/${file.trim()}` : null

      const [modData, perdasData, demData, capexEData, capexPData, opexData] = await Promise.all([
        fetchCSV(p('modelos', mod.arq_mod), `volume_captado [${mod.fonte_agua?.nome_fonte}]`),
        fetchCSV(p('perdas', mod.arq_perdas), `perdas [${mod.fonte_agua?.nome_fonte}]`),
        fetchCSV(p('demadas', mod.arq_demanda), `demanda [${mod.fonte_agua?.nome_fonte}]`),
        fetchCSV(
          p('capex_estrategias', mod.arq_capex_estrategias),
          `capex_estrategia [${mod.fonte_agua?.nome_fonte}]`,
        ),
        fetchCSV(
          p('capex_perdas', mod.arq_capex_perdas),
          `capex_perdas [${mod.fonte_agua?.nome_fonte}]`,
        ),
        fetchCSV(p('opex', mod.arq_opex), `opex [${mod.fonte_agua?.nome_fonte}]`),
      ])

      // BUG 3 CORRIGIDO: incluir TODOS os arrays na união de tempos
      const allTempos = new Set([
        ...modData.map((d) => d.tempo),
        ...perdasData.map((d) => d.tempo),
        ...demData.map((d) => d.tempo),
        ...capexEData.map((d) => d.tempo),
        ...capexPData.map((d) => d.tempo),
        ...opexData.map((d) => d.tempo),
      ])

      // BUG 6 CORRIGIDO: avisar quando nenhum tempo foi encontrado
      if (allTempos.size === 0) {
        toast.error(`Nenhum dado encontrado nos arquivos do modelo: ${mod.fonte_agua?.nome_fonte}`)
        continue
      }

      const mergedByTempo: Record<string, any> = {}
      allTempos.forEach((t) => {
        mergedByTempo[t] = {
          id_s: idSimulacao,
          id_mod: mod.id_mod,
          id_fonte: mod.id_fonte,
          tempo: t,
          volume_captado: modData.find((d) => d.tempo === t)?.valor ?? 0,
          perdas: perdasData.find((d) => d.tempo === t)?.valor ?? 0,
          demanda: demData.find((d) => d.tempo === t)?.valor ?? 0,
          capex_estrategia: capexEData.find((d) => d.tempo === t)?.valor ?? 0,
          capex_perdas: capexPData.find((d) => d.tempo === t)?.valor ?? 0,
          opex: opexData.find((d) => d.tempo === t)?.valor ?? 0,
          valores_extras: {},
        }
      })

      if (inds) {
        for (const ia of inds) {
          if (ia.indicadores?.id_fonte === mod.id_fonte) {
            const indData = await fetchCSV(
              `indicadores/${ia.arquivo}`,
              `indicador [${ia.indicadores?.campo_extra}]`,
            )
            indData.forEach((d) => {
              if (mergedByTempo[d.tempo]) {
                mergedByTempo[d.tempo].valores_extras[ia.indicadores.campo_extra] = d.valor
              }
            })
          }
        }
      }

      const rows = Object.values(mergedByTempo)
      if (rows.length > 0) {
        for (let i = 0; i < rows.length; i += 500) {
          const batch = rows.slice(i, i + 500)
          const { error } = await supabase
            .from('dados_simulacao')
            .upsert(batch, { onConflict: 'id_s,id_mod,id_fonte,tempo', ignoreDuplicates: false })
          if (error) {
            console.error('Upsert error:', error)
            toast.error(`Erro ao importar lote de ${mod.fonte_agua?.nome_fonte}: ${error.message}`)
            setLoading(false)
            return
          }
        }
      }
    }

    // BUG 8 CORRIGIDO: filtrar também por id_mod
    const { data: simData } = await supabase
      .from('dados_simulacao')
      .select('capex_estrategia, capex_perdas, perdas')
      .eq('id_s', idSimulacao)
      .in('id_mod', modsToImport)
      .order('tempo', { ascending: true })

    if (simData && simData.length > 0) {
      const totalCapex = simData.reduce(
        (s, r) => s + (r.capex_estrategia || 0) + (r.capex_perdas || 0),
        0,
      )
      const perdasIniciais = simData[0].perdas || 0
      const perdasFinais = simData[simData.length - 1].perdas || 0
      const avgReduction = perdasIniciais - perdasFinais
      await supabase
        .from('simulacao_ssd')
        .update({ total_capex: totalCapex, media_reducao_perdas: avgReduction })
        .eq('id_s', idSimulacao)
    }

    setLoading(false)
    toast.success('Importação e cálculos concluídos!')
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-lg border">
        <label className="text-xs font-semibold">Simulação de Destino *</label>
        <NativeSelect
          className="w-full max-w-md mt-1"
          value={selectedSim}
          onChange={setSelectedSim}
          options={simulacoes.map((s) => ({ value: s.id_s, label: s.descricao }))}
          placeholder="Selecione"
        />
      </div>
      <div className="border rounded overflow-hidden max-h-96 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 sticky top-0 z-10">
            <tr>
              <th className="p-2 w-12 text-center">Imp</th>
              <th className="p-2 text-left">Fonte de Água</th>
              <th className="p-2 text-left">Cenário</th>
              <th className="p-2 text-left">Estratégia</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {modelos.map((m) => (
              <tr key={m.id_mod} className="hover:bg-slate-50">
                <td className="p-2 text-center">
                  <Checkbox
                    checked={selectedModels[m.id_fonte] === m.id_mod}
                    onCheckedChange={(c) => {
                      if (c) handleSelectModel(m.id_fonte, m.id_mod)
                      else handleSelectModel(m.id_fonte, null)
                    }}
                  />
                </td>
                <td className="p-2 font-medium">{m.fonte_agua?.nome_fonte}</td>
                <td className="p-2">{m.cenario}</td>
                <td className="p-2">{m.estrategia}</td>
              </tr>
            ))}
            {modelos.length === 0 && (
              <tr>
                <td colSpan={4} className="p-4 text-center text-muted-foreground">
                  Nenhum modelo cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      <div className="flex justify-end">
        <Button onClick={handleImport} disabled={loading || !selectedSim} className="w-48">
          {loading ? 'Importando...' : 'Executar Importação'}
        </Button>
      </div>
    </div>
  )
}