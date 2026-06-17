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
import { Pencil, Trash2, Plus, UploadCloud } from 'lucide-react'

export function MidiaAdmin() {
  const [items, setItems] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [uploading, setUploading] = useState(false)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data } = await supabase
      .from('midia')
      .select('*')
      .order('id_midia', { ascending: false })
    if (data) setItems(data)
  }

  const handleSave = async () => {
    if (!formData.titulo || !formData.tipo)
      return toast({ title: 'Título e Tipo são obrigatórios', variant: 'destructive' })

    const payload = {
      titulo: formData.titulo,
      tipo: formData.tipo,
      descricao: formData.descricao,
      link: formData.link,
      arq_imagem: formData.arq_imagem,
      arq_video: formData.arq_video,
    }

    if (formData.id_midia) {
      await supabase.from('midia').update(payload).eq('id_midia', formData.id_midia)
      toast({ title: 'Mídia atualizada' })
    } else {
      await supabase.from('midia').insert(payload)
      toast({ title: 'Mídia criada' })
    }
    setOpen(false)
    setFormData({})
    loadData()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este item?')) return
    await supabase.from('midia').delete().eq('id_midia', id)
    toast({ title: 'Item excluído' })
    loadData()
  }

  const handleImageUpload = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    setUploading(true)
    const filename = `${Date.now()}_${file.name.replace(/[^a-zA-Z0-9.]/g, '')}`
    const { error } = await supabase.storage.from('imagens').upload(filename, file)
    setUploading(false)

    if (error) {
      toast({ title: 'Erro no upload', description: error.message, variant: 'destructive' })
    } else {
      setFormData({ ...formData, arq_imagem: filename })
      toast({ title: 'Imagem enviada com sucesso' })
    }
  }

  return (
    <div className="space-y-4 animate-fade-in">
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({})}>
              <Plus className="w-4 h-4 mr-2" /> Nova Mídia
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-xl max-h-[90vh] overflow-y-auto">
            <DialogHeader>
              <DialogTitle>{formData.id_midia ? 'Editar' : 'Nova'} Mídia</DialogTitle>
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
                <Label>Tipo</Label>
                <Select
                  value={formData.tipo}
                  onValueChange={(val) => setFormData({ ...formData, tipo: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="Reportagem">Reportagem</SelectItem>
                    <SelectItem value="Vídeo">Vídeo</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Link Externo</Label>
                <Input
                  value={formData.link || ''}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                  placeholder="https://..."
                />
              </div>
              <div className="space-y-2">
                <Label>Imagem de Capa</Label>
                <div className="flex items-center gap-2">
                  <Input
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    disabled={uploading}
                  />
                  {uploading && (
                    <UploadCloud className="animate-pulse w-5 h-5 text-muted-foreground" />
                  )}
                </div>
                {formData.arq_imagem && (
                  <p className="text-xs text-muted-foreground">Arquivo: {formData.arq_imagem}</p>
                )}
              </div>
              <div className="space-y-2">
                <Label>Descrição / Resumo</Label>
                <Textarea
                  value={formData.descricao || ''}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
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
              <TableHead>Imagem</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item.id_midia}>
                <TableCell className="font-medium">{item.titulo}</TableCell>
                <TableCell>{item.tipo}</TableCell>
                <TableCell>{item.arq_imagem ? 'Sim' : 'Não'}</TableCell>
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
                      onClick={() => handleDelete(item.id_midia)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-4 text-muted-foreground">
                  Nenhuma mídia encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
