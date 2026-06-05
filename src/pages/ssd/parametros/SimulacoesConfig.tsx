import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { toast } from 'sonner'
import { Trash2, Edit2, Search } from 'lucide-react'
import { NativeSelect } from '../components/NativeSelect'
import { Checkbox } from '@/components/ui/checkbox'
import { FilePickerModal } from '../components/FilePickerModal'

export function SimulacoesConfig() {
  const [simulacoes, setSimulacoes] = useState<any[]>([])
  const [indicadores, setIndicadores] = useState<any[]>([])
  const [arquivos, setArquivos] = useState<any[]>([])

  const [form, setForm] = useState({
    id_s: 0,
    descricao: '',
    pop_inicial: '',
    inicio_perdas: '',
    perc_inicial_perdas: '',
    demanda_auto: false,
    perdas_auto: false,
  })

  const [selectedSim, setSelectedSim] = useState<number | null>(null)
  const [indicadoresAplicados, setIndicadoresAplicados] = useState<any[]>([])
  const [indForm, setIndForm] = useState({ id_indicador: '', arquivo: '' })
  const [indPickerOpen, setIndPickerOpen] = useState(false)

  const loadData = async () => {
    const [sRes, iRes, fRes] = await Promise.all([
      supabase.from('simulacao_ssd').select('*').order('id_s', { ascending: false }).limit(5),
      supabase.from('indicadores').select('*'),
      supabase.storage.from('dados_brutos').list('indicadores', { limit: 100 }),
    ])
    if (sRes.data) setSimulacoes(sRes.data)
    if (iRes.data) setIndicadores(iRes.data)
    if (fRes.data) setArquivos(fRes.data.filter((x) => x.id))
  }

  const loadIndicadoresAplicados = async (id_s: number) => {
    const { data } = await supabase
      .from('indicadores_aplicado')
      .select('*, indicadores(descricao)')
      .eq('id_s', id_s)
    if (data) setIndicadoresAplicados(data)
  }

  useEffect(() => {
    loadData()
  }, [])
  useEffect(() => {
    if (selectedSim) loadIndicadoresAplicados(selectedSim)
  }, [selectedSim])

  const handleSaveSim = async () => {
    if (!form.descricao) return toast.error('Descrição obrigatória')
    const payload = {
      descricao: form.descricao,
      pop_inicial: Number(form.pop_inicial) || null,
      inicio_perdas: form.inicio_perdas || null,
      perc_inicial_perdas: Number(form.perc_inicial_perdas) || null,
      demanda_auto: form.demanda_auto,
      perdas_auto: form.perdas_auto,
    }

    if (form.id_s) {
      await supabase.from('simulacao_ssd').update(payload).eq('id_s', form.id_s)
      toast.success('Atualizado')
    } else {
      await supabase.from('simulacao_ssd').insert(payload)
      toast.success('Criado')
    }
    setForm({
      id_s: 0,
      descricao: '',
      pop_inicial: '',
      inicio_perdas: '',
      perc_inicial_perdas: '',
      demanda_auto: false,
      perdas_auto: false,
    })
    loadData()
  }

  const handleDeleteSim = async (id: number) => {
    if (!confirm('Excluir simulação?')) return
    await supabase.from('simulacao_ssd').delete().eq('id_s', id)
    loadData()
  }

  const handleEditSim = (s: any) => {
    setForm({
      id_s: s.id_s,
      descricao: s.descricao || '',
      pop_inicial: s.pop_inicial || '',
      inicio_perdas: s.inicio_perdas || '',
      perc_inicial_perdas: s.perc_inicial_perdas || '',
      demanda_auto: s.demanda_auto || false,
      perdas_auto: s.perdas_auto || false,
    })
  }

  const handleAddInd = async () => {
    if (!selectedSim || !indForm.id_indicador || !indForm.arquivo)
      return toast.error('Selecione simulação, indicador e arquivo')
    await supabase.from('indicadores_aplicado').insert({
      id_s: selectedSim,
      id_indicador: parseInt(indForm.id_indicador),
      arquivo: indForm.arquivo,
    })
    loadIndicadoresAplicados(selectedSim)
    setIndForm({ id_indicador: '', arquivo: '' })
  }

  const handleDelInd = async (id: number) => {
    await supabase.from('indicadores_aplicado').delete().eq('id_ia', id)
    if (selectedSim) loadIndicadoresAplicados(selectedSim)
  }

  return (
    <div className="space-y-6">
      <div className="bg-slate-50 p-4 rounded-lg border grid grid-cols-1 md:grid-cols-4 gap-4">
        <div className="md:col-span-2">
          <label className="text-xs font-semibold">Descrição *</label>
          <Input
            className="mt-1"
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-semibold">População Inicial</label>
          <Input
            className="mt-1"
            type="number"
            value={form.pop_inicial}
            onChange={(e) => setForm({ ...form, pop_inicial: e.target.value })}
          />
        </div>
        <div>
          <label className="text-xs font-semibold">Início de Perdas (AAAA-MM)</label>
          <Input
            className="mt-1"
            value={form.inicio_perdas}
            onChange={(e) => setForm({ ...form, inicio_perdas: e.target.value })}
            placeholder="2026-01"
          />
        </div>
        <div>
          <label className="text-xs font-semibold">% Inicial Perdas</label>
          <Input
            className="mt-1"
            type="number"
            value={form.perc_inicial_perdas}
            onChange={(e) => setForm({ ...form, perc_inicial_perdas: e.target.value })}
          />
        </div>
        <div className="flex items-center space-x-2 md:col-span-2 pt-6">
          <Checkbox
            id="d_auto"
            checked={form.demanda_auto}
            onCheckedChange={(c: boolean) => setForm({ ...form, demanda_auto: c })}
          />
          <label htmlFor="d_auto" className="text-sm font-medium">
            Cálculo auto Demanda
          </label>

          <div className="w-4"></div>
          <Checkbox
            id="p_auto"
            checked={form.perdas_auto}
            onCheckedChange={(c: boolean) => setForm({ ...form, perdas_auto: c })}
          />
          <label htmlFor="p_auto" className="text-sm font-medium">
            Cálculo auto Perdas
          </label>
        </div>
        <div className="col-span-1 flex justify-end pt-5">
          <Button onClick={handleSaveSim}>{form.id_s ? 'Atualizar' : 'Salvar Novo'}</Button>
        </div>
      </div>

      <div className="border rounded overflow-hidden max-h-60 overflow-y-auto">
        <table className="w-full text-sm">
          <thead className="bg-slate-100 sticky top-0">
            <tr>
              <th className="p-2 text-left">Descrição</th>
              <th className="p-2 text-left">População</th>
              <th className="p-2 text-left">Auto Calc</th>
              <th className="p-2 w-24">Ações</th>
            </tr>
          </thead>
          <tbody className="divide-y">
            {simulacoes.map((s) => (
              <tr
                key={s.id_s}
                className={`cursor-pointer hover:bg-slate-50 ${selectedSim === s.id_s ? 'bg-primary/5' : ''}`}
                onClick={() => setSelectedSim(s.id_s)}
              >
                <td className="p-2">{s.descricao}</td>
                <td className="p-2">{s.pop_inicial}</td>
                <td className="p-2">
                  {s.demanda_auto ? 'D' : ''} {s.perdas_auto ? 'P' : ''}
                </td>
                <td className="p-2 flex space-x-1">
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleEditSim(s)
                    }}
                  >
                    <Edit2 className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-destructive"
                    onClick={(e) => {
                      e.stopPropagation()
                      handleDeleteSim(s.id_s)
                    }}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {selectedSim && (
        <div className="bg-slate-50 p-4 rounded-lg border mt-6">
          <h4 className="font-semibold mb-4 text-primary">
            Indicadores aplicados na simulação selecionada
          </h4>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 items-end">
            <div>
              <label className="text-xs font-semibold mb-1 block">Indicador</label>
              <NativeSelect
                className="w-full"
                value={indForm.id_indicador}
                onChange={(v) => setIndForm({ ...indForm, id_indicador: v })}
                options={indicadores.map((i) => ({ value: i.id_indicador, label: i.descricao }))}
                placeholder="Selecione"
              />
            </div>
            <div>
              <label className="text-xs font-semibold mb-1 block">Arquivo de dados</label>
              <div className="flex gap-2 items-center w-full">
                <Button
                  variant="outline"
                  onClick={() => setIndPickerOpen(true)}
                  className="flex-1 truncate justify-start"
                >
                  <Search className="w-4 h-4 mr-2" />
                  {indForm.arquivo || 'Selecionar arquivo...'}
                </Button>
                {indForm.arquivo && (
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setIndForm({ ...indForm, arquivo: '' })}
                    title="Limpar"
                  >
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                )}
              </div>
            </div>
            <div>
              <Button onClick={handleAddInd} className="w-full">
                Incluir indicador
              </Button>
            </div>
          </div>
          <div className="border rounded bg-white">
            <table className="w-full text-sm">
              <thead className="bg-slate-100">
                <tr>
                  <th className="p-2 text-left">Indicador</th>
                  <th className="p-2 text-left">Arquivo</th>
                  <th className="p-2 w-16">Ações</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {indicadoresAplicados.map((ia) => (
                  <tr key={ia.id_ia}>
                    <td className="p-2">{ia.indicadores?.descricao}</td>
                    <td className="p-2">{ia.arquivo}</td>
                    <td className="p-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        className="h-8 w-8 text-destructive"
                        onClick={() => handleDelInd(ia.id_ia)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </td>
                  </tr>
                ))}
                {indicadoresAplicados.length === 0 && (
                  <tr>
                    <td colSpan={3} className="p-4 text-center text-muted-foreground">
                      Nenhum indicador vinculado
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      <FilePickerModal
        open={indPickerOpen}
        onOpenChange={setIndPickerOpen}
        bucket="dados_brutos"
        folder="indicadores"
        onSelect={(fileName) => {
          setIndForm({ ...indForm, arquivo: fileName })
          setIndPickerOpen(false)
        }}
      />
    </div>
  )
}
