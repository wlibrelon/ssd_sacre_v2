import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Trash2, Edit2, Search } from 'lucide-react'
import { NativeSelect } from '../components/NativeSelect'
import { FilePickerModal } from '../components/FilePickerModal'

export function ModelosHidro() {
  const [modelos, setModelos] = useState<any[]>([])
  const [fontes, setFontes] = useState<any[]>([])

  const [form, setForm] = useState({
    id_mod: null as number | null,
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
  const [pickerState, setPickerState] = useState<{ open: boolean; field: string }>({
    open: false,
    field: '',
  })

  const loadData = async () => {
    const [mRes, fRes, bRes] = await Promise.all([
      supabase
        .from('modelos')
        .select('*, fonte_agua(nome_fonte)')
        .order('id_mod', { ascending: false }),
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

    const payload = {
      id_fonte: parseInt(form.id_fonte),
      cenario: form.cenario,
      estrategia: form.estrategia,
      arq_mod: form.arq_mod || null,
      arq_perdas: form.arq_perdas || null,
      arq_demanda: form.arq_demanda || null,
      arq_capex_estrategias: form.arq_capex_estrategias || null,
      arq_capex_perdas: form.arq_capex_perdas || null,
      arq_opex: form.arq_opex || null,
    }

    let error
    if (form.id_mod) {
      const res = await supabase.from('modelos').update(payload).eq('id_mod', form.id_mod)
      error = res.error
    } else {
      const res = await supabase.from('modelos').insert(payload)
      error = res.error
    }

    if (error) toast.error('Erro ao salvar')
    else {
      toast.success(form.id_mod ? 'Modelo atualizado' : 'Modelo salvo')
      setForm({
        id_mod: null,
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

  const handleEdit = (m: any) => {
    setForm({
      id_mod: m.id_mod,
      id_fonte: m.id_fonte?.toString() || '',
      cenario: m.cenario || '',
      estrategia: m.estrategia || '',
      arq_mod: m.arq_mod || '',
      arq_perdas: m.arq_perdas || '',
      arq_demanda: m.arq_demanda || '',
      arq_capex_estrategias: m.arq_capex_estrategias || '',
      arq_capex_perdas: m.arq_capex_perdas || '',
      arq_opex: m.arq_opex || '',
    })
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir modelo?')) return
    await supabase.from('modelos').delete().eq('id_mod', id)
    loadData()
  }

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
            { key: 'arq_mod', label: 'Mod' },
            { key: 'arq_perdas', label: 'Perdas' },
            { key: 'arq_demanda', label: 'Demanda' },
            { key: 'arq_capex_estrategias', label: 'CAPEX Estratégias' },
            { key: 'arq_capex_perdas', label: 'CAPEX Perdas' },
            { key: 'arq_opex', label: 'OPEX' },
          ].map((field) => (
            <div key={field.key}>
              <label className="text-xs font-semibold capitalize mb-1 block">{field.label}</label>
              <div className="flex gap-2 items-center w-full mt-1">
                <Button
                  variant="outline"
                  onClick={() => setPickerState({ open: true, field: field.key })}
                  className="flex-1 truncate justify-start text-xs font-normal px-2"
                >
                  <Search className="w-3 h-3 mr-2 shrink-0" />
                  {(form as any)[field.key] || 'Selecionar arquivo...'}
                </Button>
                {(form as any)[field.key] && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setForm({ ...form, [field.key]: '' })}
                    title="Limpar"
                    className="h-9 w-9 shrink-0"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
          ))}
        </div>
        <div className="col-span-1 md:col-span-2 flex justify-between items-center mt-2">
          <Button
            variant="ghost"
            onClick={() =>
              setForm({
                id_mod: null,
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
            }
            disabled={!form.id_mod}
          >
            Cancelar Edição
          </Button>
          <Button onClick={handleSave}>{form.id_mod ? 'Atualizar Modelo' : 'Gravar Modelo'}</Button>
        </div>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 text-left">Fonte</th>
              <th className="p-2 text-left">Cenário</th>
              <th className="p-2 text-left">Estratégia</th>
              <th className="p-2 w-24 text-center">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {modelos.map((m) => (
              <tr
                key={m.id_mod}
                className={`hover:bg-slate-50 ${form.id_mod === m.id_mod ? 'bg-primary/5' : ''}`}
              >
                <td className="p-2">{m.fonte_agua?.nome_fonte}</td>
                <td className="p-2">{m.cenario}</td>
                <td className="p-2">{m.estrategia}</td>
                <td className="p-2 flex space-x-1 justify-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-primary"
                    onClick={() => handleEdit(m)}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
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
      <FilePickerModal
        open={pickerState.open}
        onOpenChange={(open) => setPickerState({ ...pickerState, open })}
        bucket="dados_brutos"
        folder=""
        onSelect={(fileName) => {
          setForm({ ...form, [pickerState.field]: fileName })
          setPickerState({ open: false, field: '' })
        }}
      />
    </div>
  )
}
