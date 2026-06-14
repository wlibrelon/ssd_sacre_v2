import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
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

export function ProjetosTab() {
  const [items, setItems] = useState<any[]>([])
  const [wps, setWPs] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [projRes, wpRes] = await Promise.all([
      supabase
        .from('projetos_wps')
        .select('*, wps(wp, titulo)')
        .order('id_projeto', { ascending: false }),
      supabase.from('wps').select('*').order('wp'),
    ])
    if (projRes.data) setItems(projRes.data)
    if (wpRes.data) setWPs(wpRes.data)
  }

  const handleSave = async () => {
    if (!formData.titulo) return toast({ title: 'Título é obrigatório', variant: 'destructive' })

    const payload = {
      titulo: formData.titulo,
      resumo: formData.resumo,
      objetivos: formData.objetivos,
      id_wp: formData.id_wp ? parseInt(formData.id_wp) : null,
    }

    if (formData.id_projeto) {
      await supabase.from('projetos_wps').update(payload).eq('id_projeto', formData.id_projeto)
      toast({ title: 'Projeto atualizado' })
    } else {
      await supabase.from('projetos_wps').insert(payload)
      toast({ title: 'Projeto criado' })
    }
    setOpen(false)
    setFormData({})
    loadData()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este Projeto?')) return
    await supabase.from('projetos_wps').delete().eq('id_projeto', id)
    toast({ title: 'Projeto excluído' })
    loadData()
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({})}>
              <Plus className="w-4 h-4 mr-2" /> Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{formData.id_projeto ? 'Editar' : 'Novo'} Projeto</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={formData.titulo || ''}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Vinculado ao WP</Label>
                <Select
                  value={formData.id_wp?.toString()}
                  onValueChange={(val) => setFormData({ ...formData, id_wp: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um WP..." />
                  </SelectTrigger>
                  <SelectContent>
                    {wps.map((w) => (
                      <SelectItem key={w.id_wp} value={w.id_wp.toString()}>
                        WP {w.wp} - {w.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Resumo</Label>
                <Textarea
                  value={formData.resumo || ''}
                  onChange={(e) => setFormData({ ...formData, resumo: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Objetivos</Label>
                <Textarea
                  value={formData.objetivos || ''}
                  onChange={(e) => setFormData({ ...formData, objetivos: e.target.value })}
                  rows={3}
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
              <TableHead>Título do Projeto</TableHead>
              <TableHead>WP Vinculado</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id_projeto}>
                <TableCell className="font-medium">{item.titulo}</TableCell>
                <TableCell>{item.wps ? `WP ${item.wps.wp}` : '-'}</TableCell>
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
                      onClick={() => handleDelete(item.id_projeto)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  Nenhum projeto encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
