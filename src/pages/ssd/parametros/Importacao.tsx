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

  const fetchCSV = async (path: string) => {
    if (!path) return []
    const { data, error } = await supabase.storage.from('dados_brutos').download(path)
    if (error || !data) return []
    const text = await data.text()
    const lines = text
      .split('\n')
      .map((l) => l.trim())
      .filter((l) => l && !l.toLowerCase().startsWith('tempo'))
    return lines.map((l) => {
      const parts = l.split(/[,;]/)
      return { tempo: parts[0], valor: parseFloat(parts[1] || '0') }
    })
  }

  const handleImport = async () => {
    if (!selectedSim) return toast.error('Selecione uma simulação')
    const modsToImport = Object.values(selectedModels).filter((v) => v)
    if (modsToImport.length === 0) return toast.error('Selecione ao menos um modelo')

    setLoading(true)

    const { data: inds } = await supabase
      .from('indicadores_aplicado')
      .select('*, indicadores(*)')
      .eq('id_s', selectedSim)

    for (const id_mod of modsToImport) {
      const mod = modelos.find((m) => m.id_mod === id_mod)
      if (!mod) continue

      const [modData, perdasData, demData, capexEData, capexPData, opexData] = await Promise.all([
        fetchCSV(mod.arq_mod),
        fetchCSV(mod.arq_perdas),
        fetchCSV(mod.arq_demanda),
        fetchCSV(mod.arq_capex_estrategias),
        fetchCSV(mod.arq_capex_perdas),
        fetchCSV(mod.arq_opex),
      ])

      const mergedByTempo: Record<string, any> = {}
      const allTempos = new Set([
        ...modData.map((d) => d.tempo),
        ...perdasData.map((d) => d.tempo),
        ...demData.map((d) => d.tempo),
      ])

      allTempos.forEach((t) => {
        mergedByTempo[t] = {
          id_s: parseInt(selectedSim),
          id_mod: mod.id_mod,
          id_fonte: mod.id_fonte,
          tempo: t,
          volume_captado: modData.find((d) => d.tempo === t)?.valor || 0,
          perdas: perdasData.find((d) => d.tempo === t)?.valor || 0,
          demanda: demData.find((d) => d.tempo === t)?.valor || 0,
          capex_estrategia: capexEData.find((d) => d.tempo === t)?.valor || 0,
          capex_perdas: capexPData.find((d) => d.tempo === t)?.valor || 0,
          opex: opexData.find((d) => d.tempo === t)?.valor || 0,
          valores_extras: {},
        }
      })

      if (inds) {
        for (const ia of inds) {
          if (ia.indicadores?.id_fonte === mod.id_fonte) {
            const indData = await fetchCSV(`indicadores/${ia.arquivo}`)
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
          await supabase
            .from('dados_simulacao')
            .upsert(rows.slice(i, i + 500), { onConflict: 'id_s,id_mod,id_fonte,tempo' })
        }
      }
    }

    // Analytic updates for the simulation logic
    const { data: simData } = await supabase
      .from('dados_simulacao')
      .select('capex_estrategia, capex_perdas, perdas')
      .eq('id_s', selectedSim)
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
        .eq('id_s', selectedSim)
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
