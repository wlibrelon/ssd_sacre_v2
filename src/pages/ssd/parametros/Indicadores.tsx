import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Trash2 } from 'lucide-react'
import { NativeSelect } from '../components/NativeSelect'

export function Indicadores() {
  const [indicadores, setIndicadores] = useState<any[]>([])
  const [fontes, setFontes] = useState<any[]>([])

  const [form, setForm] = useState({
    id_fonte: '',
    descricao: '',
    unidade: '',
    campo_extra: '',
  })

  const loadData = async () => {
    const [indRes, fRes] = await Promise.all([
      supabase.from('indicadores').select('*, fonte_agua(nome_fonte)'),
      supabase.from('fonte_agua').select('*'),
    ])
    if (indRes.data) setIndicadores(indRes.data)
    if (fRes.data) setFontes(fRes.data)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async () => {
    if (!form.id_fonte || !form.descricao || !form.campo_extra)
      return toast.error('Preencha os campos obrigatórios')

    if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(form.campo_extra)) {
      return toast.error('Campo Extra inválido. Use apenas letras, números e underline.')
    }

    const { error } = await supabase.from('indicadores').insert({
      id_fonte: parseInt(form.id_fonte),
      descricao: form.descricao,
      unidade: form.unidade,
      campo_extra: form.campo_extra,
    })
    if (error) toast.error('Erro ao salvar')
    else {
      toast.success('Indicador salvo')
      setForm({ id_fonte: '', descricao: '', unidade: '', campo_extra: '' })
      loadData()
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir indicador?')) return
    await supabase.from('indicadores').delete().eq('id_indicador', id)
    loadData()
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-lg border grid grid-cols-1 md:grid-cols-4 gap-4">
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
          <label className="text-xs font-semibold">Descrição *</label>
          <Input
            className="mt-1"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-semibold">Unidade</label>
          <Input
            className="mt-1"
            value={form.unidade}
            onChange={(e) => setForm({ ...form, unidade: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-semibold">Campo Extra (DB) *</label>
          <Input
            className="mt-1"
            value={form.campo_extra}
            onChange={(e) => setForm({ ...form, campo_extra: e.target.value })}
            placeholder="ex: ph_medio"
          />
        </div>
        <div className="col-span-1 md:col-span-4 flex justify-end">
          <Button onClick={handleSave}>Incluir Indicador</Button>
        </div>
      </div>

      <div className="border rounded overflow-hidden">
        <table className="w-full text-sm">
          <thead className="bg-slate-100">
            <tr>
              <th className="p-2 text-left">Fonte</th>
              <th className="p-2 text-left">Descrição</th>
              <th className="p-2 text-left">Unidade</th>
              <th className="p-2 text-left">Campo DB</th>
              <th className="p-2 w-16">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {indicadores.map((i) => (
              <tr key={i.id_indicador} className="hover:bg-slate-50">
                <td className="p-2">{i.fonte_agua?.nome_fonte}</td>
                <td className="p-2">{i.descricao}</td>
                <td className="p-2">{i.unidade}</td>
                <td className="p-2 font-mono text-xs">{i.campo_extra}</td>
                <td className="p-2 text-center">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={() => handleDelete(i.id_indicador)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
            {indicadores.length === 0 && (
              <tr>
                <td colSpan={5} className="p-4 text-center text-muted-foreground">
                  Nenhum indicador cadastrado
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
