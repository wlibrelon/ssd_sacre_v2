import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function ColaboradoresTab() {
  const { toast } = useToast()
  const [colaboradores, setColaboradores] = useState<any[]>([])
  const [form, setForm] = useState({ id_colaborador: 0, nome: '', link_internet: '', formacao: '' })

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data } = await supabase.from('colaboradores').select('*').order('nome')
    if (data) setColaboradores(data)
  }

  const save = async () => {
    if (!form.nome) return toast({ title: 'Nome obrigatório', variant: 'destructive' })
    const payload = { nome: form.nome, link_internet: form.link_internet, formacao: form.formacao }
    if (form.id_colaborador) {
      await supabase.from('colaboradores').update(payload).eq('id_colaborador', form.id_colaborador)
    } else {
      await supabase.from('colaboradores').insert(payload)
    }
    setForm({ id_colaborador: 0, nome: '', link_internet: '', formacao: '' })
    loadData()
    toast({ title: 'Salvo com sucesso' })
  }

  const del = async (id: number) => {
    await supabase.from('colaboradores').delete().eq('id_colaborador', id)
    loadData()
    toast({ title: 'Excluído com sucesso' })
  }

  return (
    <div className="space-y-6">
      <div className="flex gap-4 items-end flex-wrap">
        <div className="flex-1 min-w-[200px] space-y-1">
          <label className="text-sm font-medium">Nome</label>
          <Input value={form.nome} onChange={(e) => setForm({ ...form, nome: e.target.value })} />
        </div>
        <div className="flex-1 min-w-[200px] space-y-1">
          <label className="text-sm font-medium">Formação</label>
          <Input
            value={form.formacao}
            onChange={(e) => setForm({ ...form, formacao: e.target.value })}
          />
        </div>
        <div className="flex-1 min-w-[200px] space-y-1">
          <label className="text-sm font-medium">Link URL</label>
          <Input
            value={form.link_internet}
            onChange={(e) => setForm({ ...form, link_internet: e.target.value })}
          />
        </div>
        <Button onClick={save}>{form.id_colaborador ? 'Atualizar' : 'Adicionar'}</Button>
        {!!form.id_colaborador && (
          <Button
            variant="outline"
            onClick={() =>
              setForm({ id_colaborador: 0, nome: '', link_internet: '', formacao: '' })
            }
          >
            Cancelar
          </Button>
        )}
      </div>
      <div className="overflow-auto border rounded-md max-h-[400px]">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Formação</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {colaboradores.map((c) => (
              <TableRow key={c.id_colaborador}>
                <TableCell>{c.nome}</TableCell>
                <TableCell>{c.formacao}</TableCell>
                <TableCell>
                  {c.link_internet && (
                    <a
                      href={c.link_internet}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Link
                    </a>
                  )}
                </TableCell>
                <TableCell className="space-x-2">
                  <Button size="sm" variant="outline" onClick={() => setForm(c)}>
                    Editar
                  </Button>
                  <Button size="sm" variant="destructive" onClick={() => del(c.id_colaborador)}>
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
