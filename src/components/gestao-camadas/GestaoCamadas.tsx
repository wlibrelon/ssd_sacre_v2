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
import {
  Plus,
  Edit,
  Trash2,
  CheckCircle2,
  XCircle,
  FileArchive,
  ImageIcon,
  Upload,
  Loader2,
  AlertCircle,
  Clock,
} from 'lucide-react'
import { CamadaFormModal } from './CamadaFormModal'
import { importarCamadaVetorial, importarCamadaRaster } from '@/lib/importacao-camadas'

export function GestaoCamadas() {
  const [camadas, setCamadas] = useState<any[]>([])
  const [categorias, setCategorias] = useState<string[]>([])
  const [fileStatuses, setFileStatuses] = useState<Record<string, boolean>>({})
  const [isFormOpen, setIsFormOpen] = useState(false)
  const [editingCamada, setEditingCamada] = useState<any>(null)
  const [deletingId, setDeletingId] = useState<string | null>(null)
  const [importingId, setImportingId] = useState<string | null>(null)
  const [progressMessage, setProgressMessage] = useState('')
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
        const b = c.tipo_dados === 'vetorial' ? 'camadas_vetor' : 'camadas_raster'
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
    const { error } = await supabase
      .from('camadas_mapa')
      .update({ ativo: !curr })
      .eq('id_camada', id)
    if (error) {
      toast({ title: 'Erro ao atualizar', description: error.message, variant: 'destructive' })
      return
    }
    fetchCamadas()
  }

  const handleDelete = async () => {
    if (!deletingId) return
    const camada = camadas.find((c) => c.id_camada === deletingId)
    if (camada) {
      const b = camada.tipo_dados === 'vetorial' ? 'camadas_vetor' : 'camadas_raster'
      const { error } = await supabase.from('camadas_mapa').delete().eq('id_camada', deletingId)
      if (error) {
        toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' })
        setDeletingId(null)
        return
      }
      await supabase.storage
        .from(b)
        .remove([`${deletingId}/origem.${camada.tipo_dados === 'vetorial' ? 'zip' : 'tif'}`])
      toast({ title: 'Camada excluída com sucesso' })
      fetchCamadas()
    }
    setDeletingId(null)
  }

  const handleImportar = async (camada: any) => {
    setImportingId(camada.id_camada)
    setProgressMessage('Iniciando importação...')
    try {
      if (camada.tipo_dados === 'vetorial') {
        const resultado = await importarCamadaVetorial(camada, (msg) => setProgressMessage(msg))
        toast({
          title: 'Importação concluída',
          description: `${resultado.total} feições importadas com sucesso.`,
        })
      } else {
        await importarCamadaRaster(camada)
        toast({
          title: 'Importação concluída',
          description: 'Arquivo raster vinculado com sucesso à camada.',
        })
      }
    } catch (err: any) {
      toast({
        title: 'Erro na importação',
        description: err.message || 'Erro desconhecido.',
        variant: 'destructive',
      })
    } finally {
      setImportingId(null)
      setProgressMessage('')
      fetchCamadas()
    }
  }

  const renderStatus = (c: any) => {
    if (importingId === c.id_camada) {
      return (
        <span className="flex items-center gap-1.5 text-blue-600 text-sm font-medium">
          <Loader2 className="w-3.5 h-3.5 animate-spin shrink-0" />
          <span className="truncate max-w-[220px]">{progressMessage || 'Importando...'}</span>
        </span>
      )
    }

    switch (c.status_importacao) {
      case 'importando':
        return (
          <span className="flex items-center gap-1.5 text-blue-600 text-sm font-medium">
            <Loader2 className="w-3.5 h-3.5 animate-spin" /> Importando...
          </span>
        )
      case 'importado':
        return (
          <span
            className="flex items-center gap-1.5 text-green-600 text-sm font-medium"
            title={
              c.importado_em
                ? `Importado em ${new Date(c.importado_em).toLocaleString('pt-BR')}`
                : undefined
            }
          >
            <CheckCircle2 className="w-4 h-4" />
            Importado{c.tipo_dados === 'vetorial' ? ` (${c.total_feicoes ?? 0} feições)` : ''}
          </span>
        )
      case 'erro':
        return (
          <span
            className="flex items-center gap-1.5 text-destructive text-sm font-medium"
            title={c.mensagem_erro || 'Erro desconhecido'}
          >
            <AlertCircle className="w-4 h-4" /> Erro
          </span>
        )
      default:
        return fileStatuses[c.id_camada] ? (
          <span className="flex items-center gap-1.5 text-amber-600 text-sm font-medium">
            <Clock className="w-4 h-4" /> Pronto para importar
          </span>
        ) : (
          <span className="flex items-center gap-1.5 text-muted-foreground text-sm font-medium">
            <XCircle className="w-4 h-4" /> Aguardando arquivo
          </span>
        )
    }
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
              <TableHead>Status</TableHead>
              <TableHead>Ativo</TableHead>
              <TableHead className="text-right">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {camadas.map((c) => {
              const estaImportando =
                importingId === c.id_camada || c.status_importacao === 'importando'
              const podeImportar = fileStatuses[c.id_camada] && !estaImportando

              return (
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
                  <TableCell>{renderStatus(c)}</TableCell>
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
                      disabled={!podeImportar}
                      title={
                        podeImportar ? 'Importar dados' : 'Envie o arquivo fonte antes de importar'
                      }
                      onClick={() => handleImportar(c)}
                    >
                      {estaImportando ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Upload className="w-4 h-4" />
                      )}
                    </Button>
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
              )
            })}
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
