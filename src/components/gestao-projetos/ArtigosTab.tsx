import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
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

export function ArtigosTab() {
  const [items, setItems] = useState<any[]>([])
  const [projetos, setProjetos] = useState<any[]>([])
  const [tipos, setTipos] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [aRes, pRes, tRes] = await Promise.all([
      supabase
        .from('artigos')
        .select('*, projetos_wps(titulo), tipo_artigo(descricao)')
        .order('id_artigo', { ascending: false }),
      supabase.from('projetos_wps').select('id_projeto, titulo').order('titulo'),
      supabase.from('tipo_artigo').select('*').order('descricao'),
    ])
    if (aRes.data) setItems(aRes.data)
    if (pRes.data) setProjetos(pRes.data)
    if (tRes.data) setTipos(tRes.data)
  }

  const handleNovo = () => {
    setFormData({
      ativar: true,
      data_pub: toDateInputValue(new Date()),
    })
    setOpen(true)
  }

  const handleEditar = (item: any) => {
    setFormData({
      ...item,
      data_pub: toDateInputValue(item.data_pub),
    })
    setOpen(true)
  }

  const handleSave = async () => {
    if (!formData.titulo) return toast({ title: 'Título é obrigatório', variant: 'destructive' })

    const payload = {
      titulo: formData.titulo,
      resumo: formData.resumo,
      abstract: formData.abstract,
      doi: formData.doi,
      revista: formData.revista,
      id_projeto: formData.id_projeto ? parseInt(formData.id_projeto) : null,
      id_tipo_artigo: formData.id_tipo_artigo ? parseInt(formData.id_tipo_artigo) : null,
      ativar: formData.ativar ?? true,
      data_pub: formData.data_pub || null,
    }

    if (formData.id_artigo) {
      await supabase.from('artigos').update(payload).eq('id_artigo', formData.id_artigo)
      toast({ title: 'Artigo atualizado' })
    } else {
      await supabase.from('artigos').insert(payload)
      toast({ title: 'Artigo criado' })
    }
    setOpen(false)
    setFormData({})
    loadData()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este Artigo?')) return
    await supabase.from('artigos').delete().eq('id_artigo', id)
    toast({ title: 'Artigo excluído' })
    loadData()
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={handleNovo}>
              <Plus className="w-4 h-4 mr-2" /> Novo Artigo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{formData.id_artigo ? 'Editar' : 'Novo'} Artigo</DialogTitle>
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
                  <Label>Tipo de Artigo</Label>
                  <Select
                    value={formData.id_tipo_artigo?.toString()}
                    onValueChange={(val) => setFormData({ ...formData, id_tipo_artigo: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {tipos.map((t) => (
                        <SelectItem key={t.id_tipo} value={t.id_tipo.toString()}>
                          {t.descricao}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label>Vinculado ao Projeto</Label>
                  <Select
                    value={formData.id_projeto?.toString()}
                    onValueChange={(val) => setFormData({ ...formData, id_projeto: val })}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Selecione..." />
                    </SelectTrigger>
                    <SelectContent>
                      {projetos.map((p) => (
                        <SelectItem key={p.id_projeto} value={p.id_projeto.toString()}>
                          {p.titulo}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>DOI</Label>
                  <Input
                    value={formData.doi || ''}
                    onChange={(e) => setFormData({ ...formData, doi: e.target.value })}
                    placeholder="ex: 10.1000/xyz123"
                  />
                </div>
                <div className="space-y-2">
                  <Label>Revista (Journal)</Label>
                  <Input
                    value={formData.revista || ''}
                    onChange={(e) => setFormData({ ...formData, revista: e.target.value })}
                    placeholder="Nome da revista ou periódico"
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
                <Label>Resumo (PT)</Label>
                <Textarea
                  value={formData.resumo || ''}
                  onChange={(e) => setFormData({ ...formData, resumo: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Abstract (EN)</Label>
                <Textarea
                  value={formData.abstract || ''}
                  onChange={(e) => setFormData({ ...formData, abstract: e.target.value })}
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
              <TableHead>Título</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Projeto</TableHead>
              <TableHead>Publicação</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id_artigo}>
                <TableCell className="font-medium">{item.titulo}</TableCell>
                <TableCell>{item.tipo_artigo?.descricao || '-'}</TableCell>
                <TableCell>{item.projetos_wps?.titulo || '-'}</TableCell>
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
                      onClick={() => handleDelete(item.id_artigo)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-4">
                  Nenhum artigo encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
