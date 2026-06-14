import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Pencil, Trash2, Plus } from 'lucide-react'

export function ColaboradoresTab() {
  const [items, setItems] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data } = await supabase.from('colaboradores').select('*').order('nome')
    if (data) setItems(data)
  }

  const handleSave = async () => {
    if (!formData.nome) return toast({ title: 'Nome é obrigatório', variant: 'destructive' })

    const payload = {
      nome: formData.nome,
      formacao: formData.formacao,
      link_internet: formData.link_internet,
    }

    if (formData.id_colaborador) {
      await supabase
        .from('colaboradores')
        .update(payload)
        .eq('id_colaborador', formData.id_colaborador)
      toast({ title: 'Colaborador atualizado' })
    } else {
      await supabase.from('colaboradores').insert(payload)
      toast({ title: 'Colaborador adicionado' })
    }
    setOpen(false)
    setFormData({})
    loadData()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este colaborador?')) return
    await supabase.from('colaboradores').delete().eq('id_colaborador', id)
    toast({ title: 'Colaborador excluído' })
    loadData()
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({})}>
              <Plus className="w-4 h-4 mr-2" /> Novo Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{formData.id_colaborador ? 'Editar' : 'Novo'} Colaborador</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Nome</Label>
                <Input
                  value={formData.nome || ''}
                  onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Formação</Label>
                <Input
                  value={formData.formacao || ''}
                  onChange={(e) => setFormData({ ...formData, formacao: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Link/Lattes</Label>
                <Input
                  value={formData.link_internet || ''}
                  onChange={(e) => setFormData({ ...formData, link_internet: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleSave} className="w-full">
              Salvar
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Formação</TableHead>
              <TableHead>Link</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id_colaborador}>
                <TableCell className="font-medium">{item.nome}</TableCell>
                <TableCell>{item.formacao}</TableCell>
                <TableCell>
                  {item.link_internet && (
                    <a
                      href={item.link_internet}
                      target="_blank"
                      rel="noreferrer"
                      className="text-primary hover:underline"
                    >
                      Link
                    </a>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setFormData(item)
                        setOpen(true)
                      }}
                    >
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(item.id_colaborador)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4">
                  Nenhum colaborador encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
