import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
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
  DialogFooter,
} from '@/components/ui/dialog'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Trash2, Edit, Plus, Image as ImageIcon, X } from 'lucide-react'
import { ScrollArea } from '@/components/ui/scroll-area'

type FotoAtividade = {
  url: string
  descricao: string
}

type AtividadeSocial = {
  id_ativ_soc: number
  titulo: string
  descricao: string
  data_atividade: string
  data_pub: string
  link: string
  local: string
  entidade: string
  publico_alvo: string
  fotos: FotoAtividade[]
  ativar: boolean
}

type FormFoto = FotoAtividade & {
  file?: File
  id_temp?: string
}

export function AtividadesSociaisAdmin() {
  const [atividades, setAtividades] = useState<AtividadeSocial[]>([])
  const [loading, setLoading] = useState(false)
  const [open, setOpen] = useState(false)
  const { toast } = useToast()

  const [formData, setFormData] = useState<Partial<AtividadeSocial>>({
    ativar: true,
    fotos: [],
  })
  const [formFotos, setFormFotos] = useState<FormFoto[]>([])

  const loadData = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('atividades_sociais' as any)
      .select('*')
      .order('data_atividade', { ascending: false })
    if (error) {
      toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      setAtividades(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadData()
  }, [])

  const handleOpen = (atividade?: AtividadeSocial) => {
    if (atividade) {
      setFormData(atividade)
      setFormFotos(atividade.fotos?.map((f) => ({ ...f, id_temp: Math.random().toString() })) || [])
    } else {
      setFormData({ ativar: true })
      setFormFotos([])
    }
    setOpen(true)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const newFotos: FormFoto[] = Array.from(e.target.files).map((file) => ({
        url: URL.createObjectURL(file),
        descricao: '',
        file,
        id_temp: Math.random().toString(),
      }))
      setFormFotos([...formFotos, ...newFotos])
    }
  }

  const removeFoto = (id_temp?: string, url?: string) => {
    setFormFotos(formFotos.filter((f) => f.id_temp !== id_temp || f.url !== url))
  }

  const updateFotoDescricao = (id_temp: string, descricao: string) => {
    setFormFotos(formFotos.map((f) => (f.id_temp === id_temp ? { ...f, descricao } : f)))
  }

  const save = async () => {
    try {
      setLoading(true)

      const fotosFinais: FotoAtividade[] = []

      for (const foto of formFotos) {
        if (foto.file) {
          const filename = `${Date.now()}_${foto.file.name.replace(/[^a-zA-Z0-9.]/g, '_')}`
          const { error: uploadError } = await supabase.storage
            .from('atividades_sociais')
            .upload(filename, foto.file)
          if (uploadError) throw uploadError

          const { data: urlData } = supabase.storage
            .from('atividades_sociais')
            .getPublicUrl(filename)
          fotosFinais.push({ url: urlData.publicUrl, descricao: foto.descricao })
        } else {
          fotosFinais.push({ url: foto.url, descricao: foto.descricao })
        }
      }

      const payload = {
        ...formData,
        fotos: fotosFinais,
      }

      if (payload.id_ativ_soc) {
        const { error } = await supabase
          .from('atividades_sociais' as any)
          .update(payload)
          .eq('id_ativ_soc', payload.id_ativ_soc)
        if (error) throw error
        toast({ title: 'Atividade atualizada' })
      } else {
        const { error } = await supabase.from('atividades_sociais' as any).insert([payload])
        if (error) throw error
        toast({ title: 'Atividade criada' })
      }

      setOpen(false)
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  const remove = async (id: number) => {
    if (!confirm('Deseja realmente excluir esta atividade?')) return
    try {
      const { error } = await supabase
        .from('atividades_sociais' as any)
        .delete()
        .eq('id_ativ_soc', id)
      if (error) throw error
      toast({ title: 'Atividade removida' })
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-lg font-semibold">Atividades Sociais</h3>
        <Button onClick={() => handleOpen()}>
          <Plus className="w-4 h-4 mr-2" /> Adicionar
        </Button>
      </div>

      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Data</TableHead>
              <TableHead>Local</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {atividades.map((item) => (
              <TableRow key={item.id_ativ_soc}>
                <TableCell className="font-medium">{item.titulo}</TableCell>
                <TableCell>
                  {item.data_atividade
                    ? new Date(item.data_atividade + 'T00:00:00').toLocaleDateString()
                    : ''}
                </TableCell>
                <TableCell>{item.local}</TableCell>
                <TableCell>{item.ativar ? 'Ativo' : 'Inativo'}</TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="icon" onClick={() => handleOpen(item)}>
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="text-destructive"
                    onClick={() => remove(item.id_ativ_soc)}
                  >
                    <Trash2 className="w-4 h-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {atividades.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
                  Nenhuma atividade encontrada.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] flex flex-col p-0 gap-0">
          <DialogHeader className="p-6 pb-2">
            <DialogTitle>
              {formData.id_ativ_soc ? 'Editar Atividade' : 'Nova Atividade'}
            </DialogTitle>
          </DialogHeader>

          <ScrollArea className="flex-1 overflow-y-auto px-6 py-2">
            <div className="grid grid-cols-2 gap-4">
              <div className="col-span-2 space-y-2">
                <Label>Título</Label>
                <Input
                  value={formData.titulo || ''}
                  onChange={(e) => setFormData({ ...formData, titulo: e.target.value })}
                />
              </div>
              <div className="col-span-2 space-y-2">
                <Label>Descrição</Label>
                <Textarea
                  value={formData.descricao || ''}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Data da Atividade</Label>
                <Input
                  type="date"
                  value={formData.data_atividade || ''}
                  onChange={(e) => setFormData({ ...formData, data_atividade: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Data de Publicação</Label>
                <Input
                  type="date"
                  value={formData.data_pub || ''}
                  onChange={(e) => setFormData({ ...formData, data_pub: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Local</Label>
                <Input
                  value={formData.local || ''}
                  onChange={(e) => setFormData({ ...formData, local: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Entidade</Label>
                <Input
                  value={formData.entidade || ''}
                  onChange={(e) => setFormData({ ...formData, entidade: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Público Alvo</Label>
                <Input
                  value={formData.publico_alvo || ''}
                  onChange={(e) => setFormData({ ...formData, publico_alvo: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Link</Label>
                <Input
                  value={formData.link || ''}
                  onChange={(e) => setFormData({ ...formData, link: e.target.value })}
                />
              </div>

              <div className="col-span-2 flex items-center space-x-2 pt-2 pb-4">
                <Switch
                  checked={formData.ativar || false}
                  onCheckedChange={(c) => setFormData({ ...formData, ativar: c })}
                />
                <Label>Exibir no site</Label>
              </div>

              <div className="col-span-2 space-y-4 border-t pt-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base">Fotos</Label>
                  <Button variant="outline" size="sm" asChild>
                    <label className="cursor-pointer">
                      <ImageIcon className="w-4 h-4 mr-2" /> Adicionar Fotos
                      <input
                        type="file"
                        multiple
                        accept="image/*"
                        className="hidden"
                        onChange={handleFileChange}
                      />
                    </label>
                  </Button>
                </div>

                <div className="space-y-4">
                  {formFotos.map((foto) => (
                    <div
                      key={foto.id_temp}
                      className="flex gap-4 border rounded p-3 items-start bg-muted/20"
                    >
                      <img
                        src={foto.url}
                        alt="Preview"
                        className="w-24 h-24 object-cover rounded"
                      />
                      <div className="flex-1 space-y-2">
                        <Label>Descrição da Foto</Label>
                        <Input
                          placeholder="Ex: Reunião com a comunidade..."
                          value={foto.descricao}
                          onChange={(e) => updateFotoDescricao(foto.id_temp!, e.target.value)}
                        />
                      </div>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive mt-6"
                        onClick={() => removeFoto(foto.id_temp, foto.url)}
                      >
                        <X className="w-4 h-4" />
                      </Button>
                    </div>
                  ))}
                  {formFotos.length === 0 && (
                    <p className="text-sm text-muted-foreground text-center py-4">
                      Nenhuma foto adicionada.
                    </p>
                  )}
                </div>
              </div>
            </div>
          </ScrollArea>

          <DialogFooter className="p-6 pt-4 border-t">
            <Button variant="outline" onClick={() => setOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={save} disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
