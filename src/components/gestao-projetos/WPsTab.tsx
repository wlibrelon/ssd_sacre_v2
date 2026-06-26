import { useState, useEffect, useRef } from 'react'
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
import { Pencil, Trash2, Plus, Users } from 'lucide-react'

const SELECTED_WP_KEY = 'wps_tab_selected_wp'

export function WPsTab() {
  const [items, setItems] = useState<any[]>([])
  const [colaboradores, setColaboradores] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const [selectedWp, setSelectedWp] = useState<any>(null)
  const [listaColab, setListaColab] = useState<any[]>([])
  const [addColabId, setAddColabId] = useState<string>('')
  const { toast } = useToast()
  const initializedRef = useRef(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [wpRes, colabRes] = await Promise.all([
      supabase.from('wps').select('*, colaboradores(nome)').order('wp'),
      supabase.from('colaboradores').select('*').order('nome'),
    ])
    if (wpRes.data) {
      setItems(wpRes.data)

      if (!initializedRef.current && wpRes.data.length > 0) {
        initializedRef.current = true
        const savedId = sessionStorage.getItem(SELECTED_WP_KEY)
        const toSelect = savedId
          ? (wpRes.data.find((w) => w.id_wp.toString() === savedId) ?? wpRes.data[0])
          : wpRes.data[0]
        setSelectedWp(toSelect)
        loadListaColab(toSelect.id_wp)
      }
    }
    if (colabRes.data) setColaboradores(colabRes.data)
  }

  const loadListaColab = async (id_wp: number) => {
    const { data } = await supabase
      .from('lista_colab')
      .select('*, colaboradores(nome)')
      .eq('id_wp', id_wp)
      .order('id_colaborador')
    if (data) setListaColab(data)
  }

  const handleSelectWp = (wp: any) => {
    setSelectedWp(wp)
    sessionStorage.setItem(SELECTED_WP_KEY, wp.id_wp.toString())
    loadListaColab(wp.id_wp)
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
    if (selectedWp?.id_wp === id) {
      setSelectedWp(null)
      setListaColab([])
      sessionStorage.removeItem(SELECTED_WP_KEY)
    }
    loadData()
  }

  const handleAddColab = async () => {
    if (!addColabId || !selectedWp) return
    const { error } = await supabase.from('lista_colab').insert({
      id_wp: selectedWp.id_wp,
      id_colaborador: parseInt(addColabId),
    })
    if (error) {
      toast({
        title: 'Erro ao adicionar colaborador',
        description: error.message,
        variant: 'destructive',
      })
      return
    }
    toast({ title: 'Colaborador adicionado' })
    setAddColabId('')
    loadListaColab(selectedWp.id_wp)
  }

  const handleRemoveColab = async (id_lista: number) => {
    if (!confirm('Remover colaborador deste WP?')) return
    await supabase.from('lista_colab').delete().eq('id', id_lista)
    toast({ title: 'Colaborador removido' })
    loadListaColab(selectedWp.id_wp)
  }

  const colabDisponiveis = colaboradores.filter(
    (c) => !listaColab.some((lc) => lc.id_colaborador === c.id_colaborador),
  )

  return (
    <div className="space-y-6 animate-fade-in-up">
      {/* Tabela de WPs */}
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
              <TableRow
                key={item.id_wp}
                className={`cursor-pointer transition-colors ${
                  selectedWp?.id_wp === item.id_wp ? 'bg-muted' : 'hover:bg-muted/50'
                }`}
                onClick={() => handleSelectWp(item)}
              >
                <TableCell>WP {item.wp}</TableCell>
                <TableCell className="font-medium">{item.titulo}</TableCell>
                <TableCell>{item.colaboradores?.nome || '-'}</TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={(e) => {
                        e.stopPropagation()
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
                      onClick={(e) => {
                        e.stopPropagation()
                        handleDelete(item.id_wp)
                      }}
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

      {/* Colaboradores do WP selecionado */}
      {selectedWp && (
        <div className="space-y-3 border rounded-md p-4">
          <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
            <Users className="w-4 h-4" />
            Colaboradores — WP {selectedWp.wp}: {selectedWp.titulo}
          </div>

          <div className="flex gap-2">
            <Select value={addColabId} onValueChange={setAddColabId}>
              <SelectTrigger className="flex-1">
                <SelectValue placeholder="Adicionar colaborador..." />
              </SelectTrigger>
              <SelectContent>
                {colabDisponiveis.map((c) => (
                  <SelectItem key={c.id_colaborador} value={c.id_colaborador.toString()}>
                    {c.nome}
                  </SelectItem>
                ))}
                {colabDisponiveis.length === 0 && (
                  <SelectItem value="_none" disabled>
                    Todos os colaboradores já adicionados
                  </SelectItem>
                )}
              </SelectContent>
            </Select>
            <Button onClick={handleAddColab} disabled={!addColabId}>
              <Plus className="w-4 h-4 mr-2" /> Adicionar
            </Button>
          </div>

          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead className="w-[80px]">Remover</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {listaColab.map((lc) => (
                <TableRow key={lc.id}>
                  <TableCell>{lc.colaboradores?.nome || '-'}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleRemoveColab(lc.id)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {listaColab.length === 0 && (
                <TableRow>
                  <TableCell colSpan={2} className="text-center py-3 text-muted-foreground text-sm">
                    Nenhum colaborador neste WP.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
