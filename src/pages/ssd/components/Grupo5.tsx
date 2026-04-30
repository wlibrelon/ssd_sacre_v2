import { useState } from 'react'
import { useSsdData } from '@/hooks/use-ssd-data'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { NativeSelect } from './NativeSelect'

export function Grupo5() {
  const {
    fonte_agua,
    tipos_cenarios,
    cenarios,
    estrategias,
    cenario_demanda,
    cenario_consumo,
    cenario_perdas,
  } = useSsdData()
  const { toast } = useToast()

  const [volState, setVolState] = useState<any>({})
  const [demState, setDemState] = useState<any>({})
  const [perState, setPerState] = useState<any>({})

  const parseCSV = async (file: File) => {
    const text = await file.text()
    const lines = text.trim().split('\n')
    const headers = lines[0].split(',').map((h) => h.trim().toLowerCase())
    return lines.slice(1).map((line) => {
      const values = line.split(',')
      const obj: any = {}
      headers.forEach((h, i) => {
        obj[h] = values[i]?.trim()
      })
      return obj
    })
  }

  const importVol = async (e: any) => {
    const file = e.target.files[0]
    if (!file || !volState.id_fonte || !volState.id_tc || !volState.id_c || !volState.id_e) {
      toast({
        title: 'Atenção',
        description: 'Selecione todas as opções antes de importar.',
        variant: 'destructive',
      })
      return
    }
    try {
      const data = await parseCSV(file)
      const rows = data
        .filter((r: any) => r.tempo)
        .map((r: any) => ({
          id_fonte: volState.id_fonte,
          id_tc: volState.id_tc,
          id_c: volState.id_c,
          id_e: volState.id_e,
          tempo: r.tempo,
          volume_captado: parseFloat(r.volume_captado) || 0,
          capex: parseFloat(r.capex) || 0,
          opex: parseFloat(r.opex) || 0,
          rebaixamento: parseFloat(r.rebaixamento) || 0,
        }))
      const { error } = await supabase.from('dados_simulacao').insert(rows)
      if (error) throw error
      toast({ title: 'Importado com sucesso' })
    } catch (err: any) {
      toast({ title: 'Erro na importação', description: err.message, variant: 'destructive' })
    }
  }

  const importDem = async (e: any) => {
    const file = e.target.files[0]
    if (!file || !demState.id_cd || !demState.id_cc) return
    try {
      const data = await parseCSV(file)
      for (const r of data.filter((r: any) => r.tempo)) {
        await supabase
          .from('dados_simulacao')
          .update({
            id_cd: demState.id_cd,
            id_cc: demState.id_cc,
            demanda: parseFloat(r.demanda) || 0,
          })
          .eq('tempo', r.tempo)
      }
      toast({ title: 'Importado com sucesso' })
    } catch (err: any) {
      toast({ title: 'Erro na importação', description: err.message, variant: 'destructive' })
    }
  }

  const importPer = async (e: any) => {
    const file = e.target.files[0]
    if (!file || !perState.id_cp) return
    try {
      const data = await parseCSV(file)
      for (const r of data.filter((r: any) => r.tempo)) {
        await supabase
          .from('dados_simulacao')
          .update({ id_cp: perState.id_cp, perdas: parseFloat(r.perdas) || 0 })
          .eq('tempo', r.tempo)
      }
      toast({ title: 'Importado com sucesso' })
    } catch (err: any) {
      toast({ title: 'Erro na importação', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold border-b pb-2">Importação de dados para simulação</h2>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="border p-4 rounded bg-white shadow space-y-4">
          <h3 className="font-semibold text-primary">Volume Captado por Fonte</h3>
          <NativeSelect
            options={fonte_agua.map((o: any) => ({ value: o.id_fonte, label: o.nome_fonte }))}
            value={volState.id_fonte || ''}
            onChange={(v: any) => setVolState({ ...volState, id_fonte: v })}
            placeholder="Fonte de Água"
          />
          <NativeSelect
            options={tipos_cenarios.map((o: any) => ({ value: o.id_tc, label: o.descricao }))}
            value={volState.id_tc || ''}
            onChange={(v: any) => setVolState({ ...volState, id_tc: v })}
            placeholder="Tipo Cenário"
          />
          <NativeSelect
            options={cenarios.map((o: any) => ({ value: o.id_cenarios, label: o.cenarios }))}
            value={volState.id_c || ''}
            onChange={(v: any) => setVolState({ ...volState, id_c: v })}
            placeholder="Cenário"
          />
          <NativeSelect
            options={estrategias.map((o: any) => ({ value: o.id_estrategia, label: o.descricao }))}
            value={volState.id_e || ''}
            onChange={(v: any) => setVolState({ ...volState, id_e: v })}
            placeholder="Estratégia"
          />
          <input
            type="file"
            onChange={importVol}
            accept=".csv"
            className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
          />
        </div>

        <div className="border p-4 rounded bg-white shadow space-y-4">
          <h3 className="font-semibold text-primary">Demandas</h3>
          <NativeSelect
            options={cenario_demanda.map((o: any) => ({
              value: o.id_cd,
              label: o.nome_cenario_demanda,
            }))}
            value={demState.id_cd || ''}
            onChange={(v: any) => setDemState({ ...demState, id_cd: v })}
            placeholder="Cenário Demanda"
          />
          <NativeSelect
            options={cenario_consumo.map((o: any) => ({
              value: o.id_cc,
              label: o.nome_cenario_consumo,
            }))}
            value={demState.id_cc || ''}
            onChange={(v: any) => setDemState({ ...demState, id_cc: v })}
            placeholder="Cenário Consumo"
          />
          <input
            type="file"
            onChange={importDem}
            accept=".csv"
            className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
          />
        </div>

        <div className="border p-4 rounded bg-white shadow space-y-4">
          <h3 className="font-semibold text-primary">Perdas</h3>
          <NativeSelect
            options={cenario_perdas.map((o: any) => ({
              value: o.id_cp,
              label: o.nome_cenario_perdas,
            }))}
            value={perState.id_cp || ''}
            onChange={(v: any) => setPerState({ ...perState, id_cp: v })}
            placeholder="Cenário Perdas"
          />
          <input
            type="file"
            onChange={importPer}
            accept=".csv"
            className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
          />
        </div>
      </div>
    </div>
  )
}
