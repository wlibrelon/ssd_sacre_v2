import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Checkbox } from '@/components/ui/checkbox'
import { Plus, Trash } from 'lucide-react'

export function WPsTab() {
  const [wps, setWps] = useState<any[]>([])
  const [colaboradores, setColaboradores] = useState<any[]>([])
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [form, setForm] = useState({ wp: '', titulo: '', descricao: '', menu: '', id_gerente: '' })
  const [selectedColabs, setSelectedColabs] = useState<number[]>([])
  const { toast } = useToast()

  const loadData = async () => {
    const { data: w } = await supabase.from('wps').select('*').order('wp')
    if (w) setWps(w)
    const { data: c } = await supabase.from('colaboradores').select('*').order('nome')
    if (c) setColaboradores(c)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSelect = async (w: any) => {
    setSelectedId(w.id_wp)
    setForm({
      wp: w.wp?.toString() || '',
      titulo: w.titulo || '',
      descricao: w.descricao || '',
      menu: w.menu || '',
      id_gerente: w.id_gerente?.toString() || '',
    })
    const { data } = await supabase
      .from('lista_colab')
      .select('id_colaborador')
      .eq('id_wp', w.id_wp)
    if (data) setSelectedColabs(data.map((d) => d.id_colaborador))
  }

  const handleNew = () => {
    setSelectedId(null)
    setForm({ wp: '', titulo: '', descricao: '', menu: '', id_gerente: '' })
    setSelectedColabs([])
  }

  const handleSave = async () => {
    const payload = {
      wp: parseInt(form.wp) || null,
      titulo: form.titulo,
      descricao: form.descricao,
      menu: form.menu,
      id_gerente: form.id_gerente ? parseInt(form.id_gerente) : null,
    }
    let wpId = selectedId

    if (wpId) {
      const { error } = await supabase.from('wps').update(payload).eq('id_wp', wpId)
      if (error)
        return toast({
          title: 'Erro ao atualizar',
          description: error.message,
          variant: 'destructive',
        })
    } else {
      const { data, error } = await supabase.from('wps').insert(payload).select().single()
      if (error)
        return toast({ title: 'Erro ao criar', description: error.message, variant: 'destructive' })
      if (data) wpId = data.id_wp
    }

    if (wpId) {
      await supabase.from('lista_colab').delete().eq('id_wp', wpId)
      if (selectedColabs.length > 0) {
        const inserts = selectedColabs.map((cId) => ({ id_wp: wpId, id_colaborador: cId }))
        await supabase.from('lista_colab').insert(inserts)
      }
    }

    toast({ title: 'Work Package salvo com sucesso!' })
    loadData()
    handleNew()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente excluir este Work Package?')) return
    const { error } = await supabase.from('wps').delete().eq('id_wp', id)
    if (error) return toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    toast({ title: 'Work Package removido' })
    loadData()
    if (selectedId === id) handleNew()
  }

  return (
    <div className="grid md:grid-cols-[350px_1fr] gap-6">
      <div className="space-y-4 border-r pr-4">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-lg">Lista de WPs</h3>
          <Button variant="outline" size="sm" onClick={handleNew}>
            <Plus className="w-4 h-4 mr-1" /> Novo
          </Button>
        </div>
        <ScrollArea className="h-[550px]">
          <div className="space-y-2">
            {wps.map((w) => (
              <div
                key={w.id_wp}
                className={`p-3 border rounded-md cursor-pointer transition-colors flex justify-between items-start ${selectedId === w.id_wp ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50'}`}
                onClick={() => handleSelect(w)}
              >
                <div>
                  <div className="font-medium text-sm">WP {w.wp}</div>
                  <div className="text-sm font-semibold line-clamp-1">{w.titulo}</div>
                  <div className="text-xs text-muted-foreground mt-1">Menu: {w.menu}</div>
                </div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 h-8 w-8 shrink-0"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDelete(w.id_wp)
                  }}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {wps.length === 0 && (
              <p className="text-sm text-center text-muted-foreground py-4">
                Nenhum WP encontrado.
              </p>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h3 className="font-semibold text-xl">
            {selectedId ? 'Editar Work Package' : 'Novo Work Package'}
          </h3>
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Número do WP</Label>
            <Input
              type="number"
              value={form.wp}
              onChange={(e) => setForm({ ...form, wp: e.target.value })}
              placeholder="Ex: 1"
            />
          </div>
          <div className="space-y-2">
            <Label>Menu (Abreviação)</Label>
            <Input
              value={form.menu}
              onChange={(e) => setForm({ ...form, menu: e.target.value })}
              placeholder="Ex: WP1"
            />
          </div>
        </div>

        <div className="space-y-2">
          <Label>Título</Label>
          <Input
            value={form.titulo}
            onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            placeholder="Ex: Estudo de Base..."
          />
        </div>

        <div className="space-y-2">
          <Label>Descrição</Label>
          <Textarea
            rows={4}
            value={form.descricao}
            onChange={(e) => setForm({ ...form, descricao: e.target.value })}
          />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="space-y-2">
            <Label>Gerente / Líder do WP</Label>
            <Select
              value={form.id_gerente}
              onValueChange={(v) => setForm({ ...form, id_gerente: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um gerente..." />
              </SelectTrigger>
              <SelectContent>
                {colaboradores.map((c) => (
                  <SelectItem key={c.id_colaborador} value={c.id_colaborador.toString()}>
                    {c.nome}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label>Equipe Associada (Colaboradores)</Label>
            <ScrollArea className="h-[160px] border rounded-md p-3 bg-muted/10">
              <div className="space-y-3">
                {colaboradores.map((c) => (
                  <div key={c.id_colaborador} className="flex items-center space-x-3">
                    <Checkbox
                      id={`colab-${c.id_colaborador}`}
                      checked={selectedColabs.includes(c.id_colaborador)}
                      onCheckedChange={(chk) => {
                        if (chk) setSelectedColabs([...selectedColabs, c.id_colaborador])
                        else
                          setSelectedColabs(selectedColabs.filter((id) => id !== c.id_colaborador))
                      }}
                    />
                    <label
                      htmlFor={`colab-${c.id_colaborador}`}
                      className="text-sm font-medium leading-none cursor-pointer"
                    >
                      {c.nome}
                    </label>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        </div>

        <Button onClick={handleSave} className="w-full md:w-auto" size="lg">
          {selectedId ? 'Salvar Alterações' : 'Criar Work Package'}
        </Button>
      </div>
    </div>
  )
}
