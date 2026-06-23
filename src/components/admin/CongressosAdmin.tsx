import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
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

// Converte qualquer valor de data (timestamp, ISO, etc.) para o formato
// aceito pelo <input type="date"> (YYYY-MM-DD)
function toDateInputValue(value: any) {
  if (!value) return ''
  const d = new Date(value)
  if (Number.isNaN(d.getTime())) return ''
  return d.toISOString().slice(0, 10)
}

export function CongressosAdmin() {
  const [items, setItems] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data } = await supabase
      .from('congressos')
      .select('*')
      .order('data', { ascending: false })
    if (data) setItems(data)
  }

  const handleNovo = () => {
    setFormData({
      status: 'Próximo',
      ativar: true,
      data_pub: toDateInputValue(new Date()),
    })
    setOpen(true)
  }

  const handleEditar = (item: any) => {
    setFormData({
      ...item,
      data: toDateInputValue(item.data),
      data_pub: toDateInputValue(item.data_pub),
    })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!formData.titulo || !formData.status)
      return toast({ title: 'Título e Status são obrigatórios', variant: 'destructive' })

    const payload = {
      titulo: formData.titulo,
      organizador: formData.organizador,
      data: formData.data || null,
      periodo: formData.periodo,
      local: formData.local,
      link: formData.link,
      status: formData.status,
      ativar: formData.ativar ?? true,
      data_pub: formData.data_pub || null,
    }

    if (formData.id_congresso) {
      await supabase.from('congressos').update(payload).eq('id_congresso', formData.id_congresso)
      toast({ title: 'Congresso atualizado' })
    } else {
      await supabase.from('congressos').insert(payload)
      toast({ title: 'Congresso criado' })
    }
    setOpen(false)
    setFormData({})
    loadData()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este congresso?')) return
    await supabase.from('congressos').delete().eq('id_congresso', id)
    toast({ title: 'Congresso excluído' })
    loadData()
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNovo}>
              <Plus className="w-4 h-4 mr-2" /> Novo Evento
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{formData.id_congresso ? 'Editar' : 'Novo'} Evento</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Título</Label>
                <Input
                  value={formData.titulo || ''}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Status</Label>
                  <Select
                    value={formData.status}
                    onValueChange={(val) => setFormData({ ...formData, status: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="Próximo">Próximo</SelectItem>
                      <SelectItem value="Realizado">Realizado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Data Principal</Label>
                  <Input
                    type="date"
                    value={formData.data || ''}
                    onChange={(e) => setFormData({ ...formData, data: e.target.value })}
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data de Publicação</Label>
                  <Input
                    type="date"
                    value={formData.data_pub || ''}
                    onChange={(e) => setFormData({ ...formData, data_pub: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Status de Exibição</Label>
                  <div className="flex items-center gap-2 h-10">
                    <Switch
                      checked={formData.ativar ?? true}
                      onCheckedChange={(checked) => setFormData({ ...formData, ativar: checked })}
                    />
                    <span className="text-sm text-muted-foreground">
                      {(formData.ativar ?? true) ? 'Ativo' : 'Inativo'}
                    </span>
                  </div>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Organizador</Label>
                <Input
                  value={formData.organizador || ''}
                  onChange={(e) => setFormData({ ...formData, organizador: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Período (Ex: 15-18 Novembro, 2025)</Label>
                <Input
                  value={formData.periodo || ''}
                  onChange={(e) => setFormData({ ...formData, periodo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Local (Ex: São Paulo, SP)</Label>
                <Input
                  value={formData.local || ''}
                  onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Link Externo</Label>
                <Input
                  value={formData.link || ''}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://..."
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
              <TableHead>Título</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Publicação</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id_congresso}>
                <TableCell className="font-medium">{item.titulo}</TableCell>
                <TableCell>
                  {item.data ? new Date(item.data).toLocaleDateString('pt-BR') : item.periodo}
                </TableCell>
                <TableCell>{item.status}</TableCell>
                <TableCell>{toDateInputValue(item.data_pub) || '-'}</TableCell>
                <TableCell>{item.ativar ? 'Sim' : 'Não'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditar(item)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(item.id_congresso)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4 text-muted-foreground">
                  Nenhum evento encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
