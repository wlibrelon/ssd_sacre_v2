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

// Componente genérico de CRUD para tabelas de catálogo simples (id + descrição),
// como tipo_artigo. Pra cadastrar um novo catálogo (ex: fonte_agua, tipos_cenarios),
// basta adicionar uma entrada em ConfiguracoesTab.tsx apontando pra essa mesma
// tabela/colunas — sem precisar duplicar tela.
type CatalogoSimplesProps = {
  tabela: string
  idField: string
  descField: string
  label: string
}

export function CatalogoSimples({ tabela, idField, descField, label }: CatalogoSimplesProps) {
  const [items, setItems] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [tabela])

  const loadData = async () => {
    const { data, error } = await supabase.from(tabela).select('*').order(descField)
    if (!error && data) setItems(data)
  }

  const handleNovo = () => {
    setFormData({})
    setOpen(true)
  }

  const handleEditar = (item: any) => {
    setFormData(item)
    setOpen(true)
  }

  const handleSave = async () => {
    const valor = (formData[descField] || '').trim()
    if (!valor) return toast({ title: 'Descrição é obrigatória', variant: 'destructive' })

    const payload = { [descField]: valor }

    if (formData[idField]) {
      const { error } = await supabase.from(tabela).update(payload).eq(idField, formData[idField])
      if (error)
        return toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
      toast({ title: 'Item atualizado' })
    } else {
      const { error } = await supabase.from(tabela).insert(payload)
      if (error)
        return toast({ title: 'Erro ao salvar', description: error.message, variant: 'destructive' })
      toast({ title: 'Item criado' })
    }
    setOpen(false)
    setFormData({})
    loadData()
  }

  const handleDelete = async (id: number) => {
    if (!confirm(`Excluir este item de "${label}"?`)) return
    const { error } = await supabase.from(tabela).delete().eq(idField, id)
    if (error)
      return toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' })
    toast({ title: 'Item excluído' })
    loadData()
  }

  return (
    <div className="space-y-4 animate-fade-in-up">
      <div className="flex justify-between items-center gap-4">
        <p className="text-sm text-muted-foreground">
          Gerencie os valores disponíveis no campo "{label}".
        </p>
        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o)
            if (!o) setFormData({})
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" onClick={handleNovo}>
              <Plus className="w-4 h-4 mr-2" /> Novo
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>
                {formData[idField] ? 'Editar' : 'Novo'} — {label}
              </DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  value={formData[descField] || ''}
                  onChange={(e) => setFormData({ ...formData, [descField]: e.target.value })}
                  autoFocus
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
              <TableHead>Descrição</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => (
              <TableRow key={item[idField]}>
                <TableCell className="font-medium">{item[descField]}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => handleEditar(item)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleDelete(item[idField])}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={2} className="text-center py-4">
                  Nenhum item cadastrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
