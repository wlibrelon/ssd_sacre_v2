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

export function WPsTab() {
  const [items, setItems] = useState<any[]>([])
  const [colaboradores, setColaboradores] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [wpRes, colabRes] = await Promise.all([
      supabase.from('wps').select('*, colaboradores(nome)').order('wp'),
      supabase.from('colaboradores').select('*').order('nome'),
    ])
    if (wpRes.data) setItems(wpRes.data)
    if (colabRes.data) setColaboradores(colabRes.data)
  }

  const handleSave = async () => {
    if (!formData.titulo) return toast({ title: 'Título é obrigatório', variant: 'destructive' })

    const payload = {
      wp: formData.wp ? parseInt(formData.wp) : null,
      titulo: formData.titulo,
      descricao: formData.descricao,
      id_gerente: formData.id_gerente ? parseInt(formData.id_gerente) : null,
    }

    if (formData.id_wp) {
      await supabase.from('wps').update(payload).eq('id_wp', formData.id_wp)
      toast({ title: 'WP atualizado' })
    } else {
      await supabase.from('wps').insert(payload)
      toast({ title: 'WP criado' })
    }
    setOpen(false)
    setFormData({})
    loadData()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este Work Package?')) return
    await supabase.from('wps').delete().eq('id_wp', id)
    toast({ title: 'WP excluído' })
    loadData()
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({})}>
              <Plus className="w-4 h-4 mr-2" /> Novo WP
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{formData.id_wp ? 'Editar' : 'Novo'} Work Package</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="grid grid-cols-4 gap-4">
                <div className="space-y-2 col-span-1">
                  <Label>Número WP</Label>
                  <Input
                    type="number"
                    value={formData.wp || ''}
                    onChange={(e) => setFormData({ ...formData, wp: e.target.value })}
                  />
                </div>
                <div className="space-y-2 col-span-3">
                  <Label>Título</Label>
                  <Input
                    value={formData.titulo || ''}
                    onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.descricao || ''}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Gerente</Label>
                <Select
                  value={formData.id_gerente?.toString()}
                  onValueChange={(val) => setFormData({ ...formData, id_gerente: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
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
              <TableHead className="w-[80px]">WP</TableHead>
              <TableHead>Título</TableHead>
              <TableHead>Gerente</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id_wp}>
                <TableCell>WP {item.wp}</TableCell>
                <TableCell className="font-medium">{item.titulo}</TableCell>
                <TableCell>{item.colaboradores?.nome || '-'}</TableCell>
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
                      onClick={() => handleDelete(item.id_wp)}
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
                  Nenhum WP encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
