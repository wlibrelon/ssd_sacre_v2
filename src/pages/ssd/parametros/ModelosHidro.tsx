import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { NativeSelect } from '../components/NativeSelect'

export function ModelosHidro() {
  const [modelos, setModelos] = useState<any[]>([])
  const [fontes, setFontes] = useState<any[]>([])

  const [form, setForm] = useState({
    id_fonte: '',
    cenario: '',
    estrategia: '',
    arq_mod: '',
    arq_perdas: '',
    arq_demanda: '',
    arq_capex_estrategias: '',
    arq_capex_perdas: '',
    arq_opex: '',
  })
  const [filesInBucket, setFilesInBucket] = useState<any[]>([])

  const loadData = async () => {
    const [mRes, fRes, bRes] = await Promise.all([
      supabase.from('modelos').select('*, fonte_agua(nome_fonte)'),
      supabase.from('fonte_agua').select('*'),
      supabase.storage.from('dados_brutos').list('', { limit: 200 }),
    ])
    if (mRes.data) setModelos(mRes.data)
    if (fRes.data) setFontes(fRes.data)
    if (bRes.data) setFilesInBucket(bRes.data.filter((x) => x.id))
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async () => {
    if (!form.id_fonte || !form.cenario || !form.estrategia)
      return toast.error('Preencha os campos obrigatórios')
    const { error } = await supabase.from('modelos').insert({
      id_fonte: parseInt(form.id_fonte),
      cenario: form.cenario,
      estrategia: form.estrategia,
      arq_mod: form.arq_mod,
      arq_perdas: form.arq_perdas,
      arq_demanda: form.arq_demanda,
      arq_capex_estrategias: form.arq_capex_estrategias,
      arq_capex_perdas: form.arq_capex_perdas,
      arq_opex: form.arq_opex,
    })
    if (error) toast.error('Erro ao salvar')
    else {
      toast.success('Modelo salvo')
      setForm({
        id_fonte: '',
        cenario: '',
        estrategia: '',
        arq_mod: '',
        arq_perdas: '',
        arq_demanda: '',
        arq_capex_estrategias: '',
        arq_capex_perdas: '',
        arq_opex: '',
      })
      loadData()
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir modelo?')) return
    await supabase.from('modelos').delete().eq('id_mod', id)
    loadData()
  }

  const fileOptions = [
    { value: '', label: 'Nenhum' },
    ...filesInBucket.map((f) => ({ value: f.name, label: f.name })),
  ]

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-lg border grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-xs font-semibold">Fonte de Água *</label>
          <NativeSelect
            className="w-full mt-1"
            value={form.id_fonte}
            onChange={(v) => setForm({ ...form, id_fonte: v })}
            options={fontes.map((f) => ({ value: f.id_fonte, label: f.nome_fonte }))}
            placeholder="Selecione"
          />
        </div>
        <div>
          <label className="text-xs font-semibold">Cenário *</label>
          <Input
            className="mt-1"
            value={form.cenario}
            onChange={(e) => setForm({ ...form, cenario: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-semibold">Estratégia *</label>
          <Input
            className="mt-1"
            value={form.estrategia}
            onChange={(e) => setForm({ ...form, estrategia: e.target.value })}
          />
        </div>

        <div className="col-span-1 md:col-span-2 border-t pt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            'arq_mod',
            'arq_perdas',
            'arq_demanda',
            'arq_capex_estrategias',
            'arq_capex_perdas',
            'arq_opex',
          ].map((field) => (
            <div key={field}>
              <label className="text-xs font-semibold capitalize">
                {field.replace('arq_', '').replace('_', ' ')}
              </label>
              <NativeSelect
                className="w-full mt-1"
                value={(form as any)[field]}
                onChange={(v) => setForm({ ...form, [field]: v })}
                options={fileOptions}
              />
            </div>
          ))}
        </div>
        <div className="col-span-1 md:col-span-2 flex justify-end">
          <Button onClick={handleSave}>Gravar Modelo</Button>
        </div>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 text-left">Fonte</th>
              <th className="p-2 text-left">Cenário</th>
              <th className="p-2 text-left">Estratégia</th>
              <th className="p-2 w-16">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {modelos.map((m) => (
              <tr key={m.id_mod} className="hover:bg-slate-50">
                <td className="p-2">{m.fonte_agua?.nome_fonte}</td>
                <td className="p-2">{m.cenario}</td>
                <td className="p-2">{m.estrategia}</td>
                <td className="p-2 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(m.id_mod)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
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
    </div>
  )
}
