import { useState } from 'react'
import { useSsdData } from '@/hooks/use-ssd-data'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { NativeSelect } from './NativeSelect'
import { CrudTable } from './CrudTable'

export function GrupoCapexOpex() {
  const { acoes } = useSsdData()
  const { toast } = useToast()
  const [acaoId, setAcaoId] = useState<string>('')

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

  const importCapexAcao = async (e: any) => {
    const file = e.target.files[0]
    if (!file || !acaoId) {
      toast({ title: 'Atenção', description: 'Selecione uma ação.', variant: 'destructive' })
      return
    }
    try {
      const data = await parseCSV(file)
      const rows = data
        .filter((r: any) => r.tempo)
        .map((r: any) => ({
          id_acao: parseInt(acaoId),
          tempo: r.tempo,
          capex: parseFloat(r.capex) || 0,
        }))
      const { error } = await supabase.from('capex_acao').insert(rows)
      if (error) throw error
      toast({ title: 'Importado com sucesso.' })
      // Força recarregar CrudTable hackish alterando estado
      setAcaoId(acaoId + ' ')
      setTimeout(() => setAcaoId(acaoId.trim()), 50)
    } catch (err: any) {
      toast({ title: 'Erro na importação', description: err.message, variant: 'destructive' })
    }
  }

  const importCapexPerdas = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const data = await parseCSV(file)
      const rows = data
        .filter((r: any) => r.tempo)
        .map((r: any) => ({
          tempo: r.tempo,
          capex: parseFloat(r.capex) || 0,
        }))
      const { error } = await supabase.from('capex_perdas').insert(rows)
      if (error) throw error
      toast({ title: 'Importado com sucesso' })
    } catch (err: any) {
      toast({ title: 'Erro na importação', description: err.message, variant: 'destructive' })
    }
  }

  const importOpex = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const data = await parseCSV(file)
      const rows = data
        .filter((r: any) => r.tempo)
        .map((r: any) => ({
          tempo: r.tempo,
          opex: parseFloat(r.opex) || 0,
        }))
      const { error } = await supabase.from('opex').insert(rows)
      if (error) throw error
      toast({ title: 'Importado com sucesso' })
    } catch (err: any) {
      toast({ title: 'Erro na importação', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 gap-6 w-full">
        <div className="border p-4 rounded bg-white shadow space-y-4">
          <h3 className="font-semibold text-primary">CAPEX para Ações</h3>
          <NativeSelect
            options={acoes.map((o: any) => ({ value: o.id_acao, label: o.descricao }))}
            value={acaoId.trim()}
            onChange={(v: any) => setAcaoId(v)}
            placeholder="Selecione uma Ação..."
          />
          {acaoId.trim() && (
            <CrudTable
              table="capex_acao"
              title=""
              pk="id_ca"
              filter={{ col: 'id_acao', val: parseInt(acaoId.trim()) }}
              cols={[
                { key: 'tempo', label: 'Tempo (AAAA-MM)' },
                { key: 'capex', label: 'CAPEX (R$)' },
              ]}
            />
          )}
          <input
            type="file"
            onChange={importCapexAcao}
            accept=".csv"
            className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
          />
        </div>

        <div className="border p-4 rounded bg-white shadow space-y-4">
          <h3 className="font-semibold text-primary">CAPEX para Perdas</h3>
          <CrudTable
            table="capex_perdas"
            title=""
            pk="id_cp"
            cols={[
              { key: 'tempo', label: 'Tempo (AAAA-MM)' },
              { key: 'capex', label: 'CAPEX (R$)' },
            ]}
          />
          <input
            type="file"
            onChange={importCapexPerdas}
            accept=".csv"
            className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
          />
        </div>

        <div className="border p-4 rounded bg-white shadow space-y-4">
          <h3 className="font-semibold text-primary">OPEX</h3>
          <CrudTable
            table="opex"
            title=""
            pk="id_oa"
            cols={[
              { key: 'tempo', label: 'Tempo (AAAA-MM)' },
              { key: 'opex', label: 'OPEX (R$)' },
            ]}
          />
          <input
            type="file"
            onChange={importOpex}
            accept=".csv"
            className="text-sm w-full file:mr-4 file:py-2 file:px-4 file:rounded-md file:border-0 file:text-sm file:font-semibold file:bg-primary file:text-white hover:file:bg-primary/90"
          />
        </div>
      </div>
    </div>
  )
}
