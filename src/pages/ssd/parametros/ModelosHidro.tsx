import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Trash2, Edit2, Search, X, Check } from 'lucide-react'
import { NativeSelect } from '../components/NativeSelect'
import { FilePickerModal } from '../components/FilePickerModal'

const FILE_FIELDS = [
  { key: 'arq_mod', label: 'Mod' },
  { key: 'arq_perdas', label: 'Perdas' },
  { key: 'arq_demanda', label: 'Demanda' },
  { key: 'arq_capex_estrategias', label: 'CAPEX Estratégias' },
  { key: 'arq_capex_perdas', label: 'CAPEX Perdas' },
  { key: 'arq_opex', label: 'OPEX' },
]

const emptyForm = {
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
}

export function ModelosHidro() {
  const [modelos, setModelos] = useState<any[]>([])
  const [fontes, setFontes] = useState<any[]>([])
  const [form, setForm] = useState(emptyForm)
  const [filesInBucket, setFilesInBucket] = useState<any[]>([])
  const [pickerState, setPickerState] = useState<{
    open: boolean
    field: string
    context: 'form' | 'inline'
  }>({
    open: false,
    field: '',
    context: 'form',
  })

  // Estado do formulário inline de edição na tabela
  const [inlineEdit, setInlineEdit] = useState<any | null>(null)

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

  // ── Salvar novo registro ───────────────────────────────────────────────────
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

    const res = await supabase.from('modelos').insert(payload).select().single()

    if (res.error) {
      toast.error('Erro ao salvar: ' + res.error.message)
    } else {
      toast.success('Modelo salvo')
      setForm(emptyForm)
      loadData()
    }
  }

  // ── Edição inline na tabela ────────────────────────────────────────────────
  const handleInlineEdit = (m: any) => {
    setInlineEdit({
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

  const handleInlineSave = async () => {
    if (!inlineEdit.id_fonte || !inlineEdit.cenario || !inlineEdit.estrategia)
      return toast.error('Preencha os campos obrigatórios')

    const payload = {
      id_fonte: parseInt(inlineEdit.id_fonte),
      cenario: inlineEdit.cenario,
      estrategia: inlineEdit.estrategia,
      arq_mod: inlineEdit.arq_mod || null,
      arq_perdas: inlineEdit.arq_perdas || null,
      arq_demanda: inlineEdit.arq_demanda || null,
      arq_capex_estrategias: inlineEdit.arq_capex_estrategias || null,
      arq_capex_perdas: inlineEdit.arq_capex_perdas || null,
      arq_opex: inlineEdit.arq_opex || null,
    }

    const res = await supabase
      .from('modelos')
      .update(payload)
      .eq('id_mod', inlineEdit.id_mod)
      .select()
      .single()

    if (res.error) {
      toast.error('Erro ao atualizar: ' + res.error.message)
    } else {
      toast.success('Modelo atualizado')
      setInlineEdit(null)
      loadData()
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir modelo?')) return
    await supabase.from('modelos').delete().eq('id_mod', id)
    loadData()
  }

  return (
    <div className="space-y-6">
      {/* ── Formulário de novo registro ── */}
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
          {FILE_FIELDS.map((field) => (
            <div key={field.key}>
              <label className="text-xs font-semibold capitalize mb-1 block">{field.label}</label>
              <div className="flex gap-2 items-center w-full mt-1">
                <Button
                  variant="outline"
                  onClick={() => setPickerState({ open: true, field: field.key, context: 'form' })}
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
        <div className="col-span-1 md:col-span-2 flex justify-end mt-2">
          <Button onClick={handleSave}>Gravar Modelo</Button>
        </div>
      </div>

      {/* ── Tabela de modelos cadastrados ── */}
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
              <>
                {/* Linha normal */}
                <tr
                  key={m.id_mod}
                  className={`hover:bg-slate-50 ${inlineEdit?.id_mod === m.id_mod ? 'bg-primary/5' : ''}`}
                >
                  <td className="p-2">{m.fonte_agua?.nome_fonte}</td>
                  <td className="p-2">{m.cenario}</td>
                  <td className="p-2">{m.estrategia}</td>
                  <td className="p-2 flex space-x-1 justify-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-primary"
                      title="Editar"
                      onClick={() =>
                        inlineEdit?.id_mod === m.id_mod ? setInlineEdit(null) : handleInlineEdit(m)
                      }
                    >
                      <Edit2 className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 text-destructive"
                      title="Excluir"
                      onClick={() => handleDelete(m.id_mod)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </td>
                </tr>

                {/* Linha expandida de edição inline */}
                {inlineEdit?.id_mod === m.id_mod && (
                  <tr key={`edit-${m.id_mod}`} className="bg-primary/5">
                    <td colSpan={4} className="px-4 py-4">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        {/* Fonte */}
                        <div>
                          <label className="text-xs font-semibold">Fonte de Água *</label>
                          <NativeSelect
                            className="w-full mt-1"
                            value={inlineEdit.id_fonte}
                            onChange={(v) => setInlineEdit({ ...inlineEdit, id_fonte: v })}
                            options={fontes.map((f) => ({
                              value: f.id_fonte,
                              label: f.nome_fonte,
                            }))}
                            placeholder="Selecione"
                          />
                        </div>
                        {/* Cenário */}
                        <div>
                          <label className="text-xs font-semibold">Cenário *</label>
                          <Input
                            className="mt-1"
                            value={inlineEdit.cenario}
                            onChange={(e) =>
                              setInlineEdit({ ...inlineEdit, cenario: e.target.value })
                            }
                          />
                        </div>
                        {/* Estratégia */}
                        <div>
                          <label className="text-xs font-semibold">Estratégia *</label>
                          <Input
                            className="mt-1"
                            value={inlineEdit.estrategia}
                            onChange={(e) =>
                              setInlineEdit({ ...inlineEdit, estrategia: e.target.value })
                            }
                          />
                        </div>

                        {/* Campos de arquivo */}
                        {FILE_FIELDS.map((field) => (
                          <div key={field.key}>
                            <label className="text-xs font-semibold capitalize mb-1 block">
                              {field.label}
                            </label>
                            <div className="flex gap-2 items-center mt-1">
                              <Button
                                variant="outline"
                                onClick={() =>
                                  setPickerState({
                                    open: true,
                                    field: field.key,
                                    context: 'inline',
                                  })
                                }
                                className="flex-1 truncate justify-start text-xs font-normal px-2"
                              >
                                <Search className="w-3 h-3 mr-2 shrink-0" />
                                {inlineEdit[field.key] || 'Selecionar arquivo...'}
                              </Button>
                              {inlineEdit[field.key] && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  onClick={() => setInlineEdit({ ...inlineEdit, [field.key]: '' })}
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

                      {/* Botões de ação inline */}
                      <div className="flex justify-end gap-2 mt-4 border-t pt-3">
                        <Button variant="ghost" size="sm" onClick={() => setInlineEdit(null)}>
                          <X className="w-4 h-4 mr-1" />
                          Cancelar
                        </Button>
                        <Button size="sm" onClick={handleInlineSave}>
                          <Check className="w-4 h-4 mr-1" />
                          Salvar Alterações
                        </Button>
                      </div>
                    </td>
                  </tr>
                )}
              </>
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

      {/* FilePickerModal — único, compartilhado entre form e inline */}
      <FilePickerModal
        open={pickerState.open}
        onOpenChange={(open) => setPickerState({ ...pickerState, open })}
        bucket="dados_brutos"
        folder=""
        onSelect={(fileName) => {
          if (pickerState.context === 'inline' && inlineEdit) {
            setInlineEdit({ ...inlineEdit, [pickerState.field]: fileName })
          } else {
            setForm({ ...form, [pickerState.field]: fileName })
          }
          setPickerState({ open: false, field: '', context: 'form' })
        }}
      />
    </div>
  )
}
