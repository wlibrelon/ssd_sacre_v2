import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Switch } from '@/components/ui/switch'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog'
import { Plus, Edit, Trash2, CheckCircle2, XCircle, FileArchive, ImageIcon } from 'lucide-react'
import { CamadaFormModal } from './CamadaFormModal'

export function GestaoCamadas() {
  const [camadas, setCamadas] = useState<any[]>([])
  const [categorias, setCategorias] = useState<string[]>([])
  const [fileStatuses, setFileStatuses] = useState<Record<string, boolean>>({})
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCamada, setEditingCamada] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const { toast } = useToast()

  const fetchCamadas = async () => {
    const { data } = await supabase
      .from('camadas_mapa')
      .select('*')
      .order('categoria')
      .order('ordem_exibicao')
    if (data) {
      setCamadas(data)
      setCategorias(Array.from(new Set(data.map((c) => c.categoria).filter(Boolean))) as string[])
      checkStatuses(data)
    }
  }

  const checkStatuses = async (data: any[]) => {
    const statuses: Record<string, boolean> = {}
    await Promise.all(
      data.map(async (c) => {
        const b = c.tipo_dados === 'vetorial' ? 'camadas-vetor' : 'camadas-raster'
        const { data: files } = await supabase.storage.from(b).list(c.id_camada)
        statuses[c.id_camada] = !!(files && files.length > 0)
      }),
    )
    setFileStatuses(statuses)
  }

  useEffect(() => {
    fetchCamadas()
  }, [])

  const toggleAtivo = async (id: string, curr: boolean) => {
    await supabase.from('camadas_mapa').update({ ativo: !curr }).eq('id_camada', id)
    fetchCamadas()
  }

  const handleDelete = async () => {
    if (!deletingId) return
    const camada = camadas.find((c) => c.id_camada === deletingId)
    if (camada) {
      const b = camada.tipo_dados === 'vetorial' ? 'camadas-vetor' : 'camadas-raster'
      await supabase.from('camadas_mapa').delete().eq('id_camada', deletingId)
      await supabase.storage
        .from(b)
        .remove([`${deletingId}/origem.${camada.tipo_dados === 'vetorial' ? 'zip' : 'tif'}`])
      toast({ title: 'Camada excluída com sucesso' })
      fetchCamadas()
    }
    setDeletingId(null)
  }

  return (
    <div className="p-6 max-w-6xl mx-auto space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold">Gestão de Camadas</h1>
        <Button
          onClick={() => {
            setEditingCamada(null)
            setIsFormOpen(true)
          }}
        >
          <Plus className="w-4 h-4 mr-2" /> Nova Camada
        </Button>
      </div>

      <div className="border rounded-md bg-card">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Categoria</TableHead>
              <TableHead>Tipo</TableHead>
              <TableHead>Arquivo</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {camadas.map((c) => (
              <TableRow key={c.id_camada}>
                <TableCell className="font-medium">{c.nome}</TableCell>
                <TableCell>{c.categoria}</TableCell>
                <TableCell>
                  <Badge variant={c.tipo_dados === 'vetorial' ? 'default' : 'secondary'}>
                    {c.tipo_dados === 'vetorial' ? (
                      <FileArchive className="w-3 h-3 mr-1" />
                    ) : (
                      <ImageIcon className="w-3 h-3 mr-1" />
                    )}
                    {c.tipo_dados === 'vetorial' ? 'Vetorial' : 'Raster'}
                  </Badge>
                </TableCell>
                <TableCell>
                  {fileStatuses[c.id_camada] ? (
                    <span className="flex items-center text-green-600 text-sm font-medium">
                      <CheckCircle2 className="w-4 h-4 mr-1" /> Enviado
                    </span>
                  ) : (
                    <span className="flex items-center text-amber-600 text-sm font-medium">
                      <XCircle className="w-4 h-4 mr-1" /> Aguardando
                    </span>
                  )}
                </TableCell>
                <TableCell>
                  <Switch
                    checked={c.ativo}
                    onCheckedChange={() => toggleAtivo(c.id_camada, c.ativo)}
                  />
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      setEditingCamada(c)
                      setIsFormOpen(true)
                    }}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button variant="ghost" size="icon" onClick={() => setDeletingId(c.id_camada)}>
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {camadas.length === 0 && (
              <TableRow>
                <TableCell colSpan={6} className="text-center py-8 text-muted-foreground">
                  Nenhuma camada encontrada
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      <Dialog open={!!deletingId} onOpenChange={(v) => !v && setDeletingId(null)}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Excluir Camada</DialogTitle>
          </DialogHeader>
          <DialogDescription>
            Deseja excluir permanentemente esta camada e seus arquivos? Isso também removerá feições
            vinculadas.
          </DialogDescription>
          <DialogFooter>
            <Button variant="outline" onClick={() => setDeletingId(null)}>
              Cancelar
            </Button>
            <Button variant="destructive" onClick={handleDelete}>
              Excluir
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <CamadaFormModal
        open={isFormOpen}
        onOpenChange={setIsFormOpen}
        camada={editingCamada}
        categorias={categorias}
        onSuccess={() => {
          setIsFormOpen(false)
          fetchCamadas()
        }}
      />
    </div>
  )
}
