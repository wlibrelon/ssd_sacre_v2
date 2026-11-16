import { useState, useEffect, useRef } from 'react'
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
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { useToast } from '@/hooks/use-toast'
import { Pencil, Trash2, Plus, Upload, FileText, ExternalLink } from 'lucide-react'

// Referências específicas de um projeto: link de DOI e/ou PDF anexado.
// PDFs ficam no bucket "artigos_referencia", em referencias/<id_projeto>/.

export type ProjetoReferencia = {
  id: string
  id_projeto: number
  descricao: string
  doi: string | null
  arquivo: string | null
}

const BUCKET = 'artigos_referencia'

/** Aceita "10.xxxx/...", "doi:10.xxxx/..." ou URL completa e devolve um link clicável. */
export const doiParaUrl = (doi: string) => {
  const v = doi.trim()
  if (/^https?:\/\//i.test(v)) return v
  return `https://doi.org/${v.replace(/^doi:\s*/i, '')}`
}

export const urlArquivoReferencia = (arquivo: string) =>
  supabase.storage.from(BUCKET).getPublicUrl(arquivo).data.publicUrl

interface ReferenciasPanelProps {
  idProjeto: number
  tituloProjeto: string
}

export function ReferenciasPanel({ idProjeto, tituloProjeto }: ReferenciasPanelProps) {
  const { toast } = useToast()
  const [itens, setItens] = useState<ProjetoReferencia[]>([])
  const [loading, setLoading] = useState(false)

  const [open, setOpen] = useState(false)
  const [editando, setEditando] = useState<ProjetoReferencia | null>(null)
  const [descricao, setDescricao] = useState('')
  const [doi, setDoi] = useState('')
  const [arquivo, setArquivo] = useState<File | null>(null)
  const [removerArquivo, setRemoverArquivo] = useState(false)
  const [salvando, setSalvando] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  useEffect(() => {
    load()
  }, [idProjeto])

  const load = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('projeto_referencia')
      .select('*')
      .eq('id_projeto', idProjeto)
      .order('criado_em', { ascending: false })
    if (!error && data) setItens(data)
    setLoading(false)
  }

  const abrir = (ref?: ProjetoReferencia) => {
    setEditando(ref ?? null)
    setDescricao(ref?.descricao ?? '')
    setDoi(ref?.doi ?? '')
    setArquivo(null)
    setRemoverArquivo(false)
    setOpen(true)
  }

  const fechar = () => {
    setOpen(false)
    setEditando(null)
    setDescricao('')
    setDoi('')
    setArquivo(null)
    setRemoverArquivo(false)
  }

  const temArquivoFinal = !!arquivo || (!!editando?.arquivo && !removerArquivo)
  const podeSalvar = !!descricao.trim() && (!!doi.trim() || temArquivoFinal)

  const handleSalvar = async () => {
    if (!descricao.trim())
      return toast({ title: 'Descrição é obrigatória', variant: 'destructive' })
    if (!doi.trim() && !temArquivoFinal)
      return toast({ title: 'Informe um DOI ou anexe um PDF', variant: 'destructive' })

    setSalvando(true)
    try {
      let caminho: string | null = editando?.arquivo ?? null

      if (arquivo) {
        const nomeUnico = `referencias/${idProjeto}/${Date.now()}_${Math.random()
          .toString(36)
          .substring(7)}.pdf`
        const { data: up, error: upErr } = await supabase.storage
          .from(BUCKET)
          .upload(nomeUnico, arquivo, { contentType: 'application/pdf' })
        if (upErr) throw upErr
        if (editando?.arquivo) await supabase.storage.from(BUCKET).remove([editando.arquivo])
        caminho = up.path
      } else if (removerArquivo && editando?.arquivo) {
        await supabase.storage.from(BUCKET).remove([editando.arquivo])
        caminho = null
      }

      const payload = {
        id_projeto: idProjeto,
        descricao: descricao.trim(),
        doi: doi.trim() || null,
        arquivo: caminho,
      }

      const { error } = editando
        ? await supabase.from('projeto_referencia').update(payload).eq('id', editando.id)
        : await supabase.from('projeto_referencia').insert(payload)
      if (error) throw error

      toast({ title: editando ? 'Referência atualizada' : 'Referência incluída' })
      fechar()
      load()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setSalvando(false)
    }
  }

  const handleExcluir = async (ref: ProjetoReferencia) => {
    if (!confirm('Excluir esta referência?')) return
    try {
      if (ref.arquivo) await supabase.storage.from(BUCKET).remove([ref.arquivo])
      const { error } = await supabase.from('projeto_referencia').delete().eq('id', ref.id)
      if (error) throw error
      toast({ title: 'Referência excluída' })
      load()
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Referências vinculadas a <span className="font-medium">{tituloProjeto}</span>
        </p>
        <Button size="sm" onClick={() => abrir()}>
          <Plus className="w-4 h-4 mr-2" /> Incluir Referência
        </Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Descrição</TableHead>
            <TableHead>DOI</TableHead>
            <TableHead>Arquivo</TableHead>
            <TableHead className="w-[80px]">Ações</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {loading ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-slate-400">
                Carregando...
              </TableCell>
            </TableRow>
          ) : itens.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center py-6 text-slate-400">
                Nenhuma referência incluída para este projeto.
              </TableCell>
            </TableRow>
          ) : (
            itens.map((ref) => (
              <TableRow key={ref.id}>
                <TableCell className="font-medium">{ref.descricao}</TableCell>
                <TableCell>
                  {ref.doi ? (
                    <a
                      href={doiParaUrl(ref.doi)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-primary hover:underline text-sm"
                    >
                      <ExternalLink className="w-4 h-4 shrink-0" />
                      <span className="truncate max-w-[220px]">{ref.doi}</span>
                    </a>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  {ref.arquivo ? (
                    <a
                      href={urlArquivoReferencia(ref.arquivo)}
                      target="_blank"
                      rel="noreferrer"
                      className="flex items-center gap-1.5 text-primary hover:underline text-sm"
                    >
                      <FileText className="w-4 h-4 shrink-0" /> PDF
                    </a>
                  ) : (
                    <span className="text-slate-400">-</span>
                  )}
                </TableCell>
                <TableCell>
                  <div className="flex gap-2">
                    <Button variant="ghost" size="icon" onClick={() => abrir(ref)}>
                      <Pencil className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive"
                      onClick={() => handleExcluir(ref)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>

      <Dialog open={open} onOpenChange={(o) => !o && fechar()}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>{editando ? 'Editar' : 'Incluir'} Referência</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-4">
            <div className="space-y-2">
              <Label>Descrição</Label>
              <Input
                placeholder="Ex: Silva et al. (2024) – Disponibilidade hídrica em Bauru"
                value={descricao}
                onChange={(e) => setDescricao(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>DOI</Label>
              <Input
                placeholder="Ex: 10.1016/j.ecolecon.2024.108123"
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
              />
            </div>
            <div className="space-y-2">
              <Label>Arquivo (PDF)</Label>
              <div className="flex gap-2">
                <Input
                  readOnly
                  className="flex-1"
                  placeholder={
                    editando?.arquivo && !removerArquivo
                      ? 'Manter arquivo atual'
                      : 'Nenhum arquivo selecionado'
                  }
                  value={arquivo ? arquivo.name : ''}
                />
                <input
                  type="file"
                  accept="application/pdf,.pdf"
                  ref={fileInputRef}
                  className="hidden"
                  onChange={(e) => {
                    const f = e.target.files?.[0] || null
                    if (f && !/\.pdf$/i.test(f.name)) {
                      toast({ title: 'Selecione um arquivo PDF', variant: 'destructive' })
                      return
                    }
                    setArquivo(f)
                    setRemoverArquivo(false)
                  }}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => fileInputRef.current?.click()}
                >
                  <Upload className="w-4 h-4 mr-2" /> Buscar
                </Button>
              </div>
              {editando?.arquivo && !arquivo && !removerArquivo && (
                <button
                  type="button"
                  className="text-xs text-destructive hover:underline"
                  onClick={() => setRemoverArquivo(true)}
                >
                  Remover PDF atual
                </button>
              )}
              <p className="text-xs text-muted-foreground">
                Informe ao menos um: DOI ou PDF anexado.
              </p>
            </div>
          </div>
          <Button className="w-full" disabled={salvando || !podeSalvar} onClick={handleSalvar}>
            {salvando ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
