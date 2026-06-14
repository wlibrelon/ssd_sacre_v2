import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableHeader,
  TableRow,
  TableHead,
  TableBody,
  TableCell,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog'
import { Pencil, Trash, Plus } from 'lucide-react'

export function ColaboradoresTab() {
  const [colaboradores, setColaboradores] = useState<any[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [form, setForm] = useState({ id_colaborador: 0, nome: '', link_internet: '', formacao: '' })
  const { toast } = useToast()

  const loadData = async () => {
    const { data } = await supabase.from('colaboradores').select('*').order('nome')
    if (data) setColaboradores(data)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleSave = async () => {
    if (!form.nome) return toast({ title: 'Nome obrigatório', variant: 'destructive' })
    if (form.id_colaborador) {
      const { error } = await supabase
        .from('colaboradores')
        .update({
          nome: form.nome,
          link_internet: form.link_internet,
          formacao: form.formacao,
        })
        .eq('id_colaborador', form.id_colaborador)
      if (error) return toast({ title: 'Erro', description: error.message, variant: 'destructive' })
      toast({ title: 'Colaborador atualizado' })
    } else {
      const { error } = await supabase.from('colaboradores').insert({
        nome: form.nome,
        link_internet: form.link_internet,
        formacao: form.formacao,
      })
      if (error) return toast({ title: 'Erro', description: error.message, variant: 'destructive' })
      toast({ title: 'Colaborador criado' })
    }
    setIsOpen(false)
    loadData()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja realmente remover este colaborador?')) return
    const { error } = await supabase.from('colaboradores').delete().eq('id_colaborador', id)
    if (error) return toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    toast({ title: 'Colaborador removido' })
    loadData()
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center">
        <h3 className="text-lg font-medium text-muted-foreground">Diretório de Colaboradores</h3>
        <Button
          onClick={() => {
            setForm({ id_colaborador: 0, nome: '', link_internet: '', formacao: '' })
            setIsOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Novo Colaborador
        </Button>
      </div>
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Formação</TableHead>
              <TableHead>Link Web</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {colaboradores.map((c) => (
              <TableRow key={c.id_colaborador}>
                <TableCell className="font-medium">{c.nome}</TableCell>
                <TableCell>{c.formacao}</TableCell>
                <TableCell>
                  {c.link_internet && (
                    <a
                      href={c.link_internet}
                      target="_blank"
                      rel="noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Acessar Perfil
                    </a>
                  )}
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setForm(c)
                        setIsOpen(true)
                      }}
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(c.id_colaborador)}
                    >
                      <Trash className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {colaboradores.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-6">
                  Nenhum colaborador cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={isOpen} onOpenChange={setIsOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {form.id_colaborador ? 'Editar Colaborador' : 'Novo Colaborador'}
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Nome Completo</Label>
              <Input
                value={form.nome}
                onChange={(e) => setForm({ ...form, nome: e.target.value })}
                placeholder="Ex: João da Silva"
              />
            </div>
            <div className="space-y-2">
              <Label>Formação</Label>
              <Input
                value={form.formacao}
                onChange={(e) => setForm({ ...form, formacao: e.target.value })}
                placeholder="Ex: Engenheiro Civil"
              />
            </div>
            <div className="space-y-2">
              <Label>Link (Lattes, LinkedIn, etc.)</Label>
              <Input
                value={form.link_internet}
                onChange={(e) => setForm({ ...form, link_internet: e.target.value })}
                placeholder="https://"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSave}>Salvar</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
