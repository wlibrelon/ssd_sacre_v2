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
import { Pencil, Trash2, Plus, Upload, FileText } from 'lucide-react'

type ArqResultado = {
  id_arq_res: number
  id_projeto: number
  descricao: string
  nome_arq: string
}

export function ProjetosTab() {
  const [items, setItems] = useState<any[]>([])
  const [wps, setWPs] = useState<any[]>([])
  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const { toast } = useToast()

  // ── Projeto selecionado na tabela ────────────────────────────────────────────
  const [projetoSelecionado, setProjetoSelecionado] = useState<any>(null)

  // ── Resultados ───────────────────────────────────────────────────────────────
  const [resultados, setResultados] = useState<ArqResultado[]>([])
  const [loadingResultados, setLoadingResultados] = useState(false)
  const [resDescricao, setResDescricao] = useState('')
  const [resFile, setResFile] = useState<File | null>(null)
  const [savingRes, setSavingRes] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Dialog Incluir Resultados ────────────────────────────────────────────────
  const [openResultados, setOpenResultados] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [projRes, wpRes] = await Promise.all([
      supabase
        .from('projetos_wps')
        .select('*, wps(wp, titulo)')
        .order('id_projeto', { ascending: false }),
      supabase.from('wps').select('*').order('wp'),
    ])
    if (projRes.data) setItems(projRes.data)
    if (wpRes.data) setWPs(wpRes.data)
  }

  // ── CRUD Projetos ────────────────────────────────────────────────────────────
  const handleSave = async () => {
    if (!formData.titulo) return toast({ title: 'Título é obrigatório', variant: 'destructive' })

    const payload = {
      titulo: formData.titulo,
      resumo: formData.resumo,
      objetivos: formData.objetivos,
      id_wp: formData.id_wp ? parseInt(formData.id_wp) : null,
    }

    if (formData.id_projeto) {
      await supabase.from('projetos_wps').update(payload).eq('id_projeto', formData.id_projeto)
      toast({ title: 'Projeto atualizado' })
    } else {
      await supabase.from('projetos_wps').insert(payload)
      toast({ title: 'Projeto criado' })
    }
    setOpen(false)
    setFormData({})
    loadData()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este Projeto?')) return
    await supabase.from('projetos_wps').delete().eq('id_projeto', id)
    toast({ title: 'Projeto excluído' })
    if (projetoSelecionado?.id_projeto === id) {
      setProjetoSelecionado(null)
      setResultados([])
    }
    loadData()
  }

  // ── Selecionar projeto na tabela → carrega resultados ────────────────────────
  const handleSelecionarProjeto = async (item: any) => {
    // Clicou no mesmo: deseleciona
    if (projetoSelecionado?.id_projeto === item.id_projeto) {
      setProjetoSelecionado(null)
      setResultados([])
      return
    }
    setProjetoSelecionado(item)
    await loadResultados(item.id_projeto)
  }

  // ── Resultados ───────────────────────────────────────────────────────────────
  const loadResultados = async (id_projeto: number) => {
    setLoadingResultados(true)
    const { data, error } = await supabase
      .from('arq_resultados')
      .select('*')
      .eq('id_projeto', id_projeto)
      .order('id_arq_res', { ascending: false })
    if (!error && data) setResultados(data)
    setLoadingResultados(false)
  }

  const handleSaveResultado = async () => {
    if (!projetoSelecionado) return
    if (!resFile) return toast({ title: 'Selecione um arquivo', variant: 'destructive' })
    if (!resDescricao.trim())
      return toast({ title: 'Descrição é obrigatória', variant: 'destructive' })

    setSavingRes(true)
    try {
      const ext = resFile.name.split('.').pop()
      const nomeUnico = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`

      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('arquivos_resultados')
        .upload(nomeUnico, resFile)

      if (uploadError) throw uploadError

      const { error: insertError } = await supabase.from('arq_resultados').insert({
        id_projeto: projetoSelecionado.id_projeto,
        descricao: resDescricao.trim(),
        nome_arq: uploadData.path,
      })

      if (insertError) throw insertError

      toast({ title: 'Arquivo salvo com sucesso' })
      setResDescricao('')
      setResFile(null)
      setOpenResultados(false)
      loadResultados(projetoSelecionado.id_projeto)
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setSavingRes(false)
    }
  }

  const handleDeleteResultado = async (res: ArqResultado) => {
    if (!confirm('Excluir este arquivo?')) return
    try {
      await supabase.storage.from('arquivos_resultados').remove([res.nome_arq])
      const { error } = await supabase
        .from('arq_resultados')
        .delete()
        .eq('id_arq_res', res.id_arq_res)
      if (error) throw error
      toast({ title: 'Arquivo excluído' })
      loadResultados(res.id_projeto)
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' })
    }
  }

  const getArquivoUrl = (nomeArq: string) =>
    supabase.storage.from('arquivos_resultados').getPublicUrl(nomeArq).data.publicUrl

  // ── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4 animate-fade-in-up">
      {/* Botão Novo Projeto */}
      <div className="flex justify-end">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setFormData({})}>
              <Plus className="w-4 h-4 mr-2" /> Novo Projeto
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>{formData.id_projeto ? 'Editar' : 'Novo'} Projeto</DialogTitle>
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
                <Label>Vinculado ao WP</Label>
                <Select
                  value={formData.id_wp?.toString()}
                  onValueChange={(val) => setFormData({ ...formData, id_wp: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione um WP..." />
                  </SelectTrigger>
                  <SelectContent>
                    {wps.map((w) => (
                      <SelectItem key={w.id_wp} value={w.id_wp.toString()}>
                        WP {w.wp} - {w.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Resumo</Label>
                <Textarea
                  value={formData.resumo || ''}
                  onChange={(e) => setFormData({ ...formData, resumo: e.target.value })}
                  rows={3}
                />
              </div>
              <div className="space-y-2">
                <Label>Objetivos</Label>
                <Textarea
                  value={formData.objetivos || ''}
                  onChange={(e) => setFormData({ ...formData, objetivos: e.target.value })}
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

      {/* ── Tabela de Projetos ── */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título do Projeto</TableHead>
              <TableHead>WP Vinculado</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {items.map((item) => {
              const selecionado = projetoSelecionado?.id_projeto === item.id_projeto
              return (
                <TableRow
                  key={item.id_projeto}
                  onClick={() => handleSelecionarProjeto(item)}
                  className={`cursor-pointer transition-colors ${
                    selecionado ? 'bg-primary/5 border-l-2 border-l-primary' : 'hover:bg-slate-50'
                  }`}
                >
                  <TableCell className="font-medium">
                    <div className="flex items-center gap-2">
                      {selecionado && (
                        <span className="w-1.5 h-1.5 rounded-full bg-primary shrink-0" />
                      )}
                      {item.titulo}
                    </div>
                  </TableCell>
                  <TableCell>{item.wps ? `WP ${item.wps.wp}` : '-'}</TableCell>
                  <TableCell>
                    <div className="flex gap-2" onClick={(e) => e.stopPropagation()}>
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
                        onClick={() => handleDelete(item.id_projeto)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              )
            })}
            {items.length === 0 && (
              <TableRow>
                <TableCell colSpan={3} className="text-center py-4">
                  Nenhum projeto encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>

      {/* ── Painel de Resultados (aparece ao selecionar um projeto) ── */}
      {projetoSelecionado && (
        <div className="border rounded-md overflow-hidden">
          {/* Cabeçalho do painel */}
          <div className="flex items-center justify-between px-4 py-3 bg-slate-50 border-b">
            <div>
              <p className="text-sm font-semibold text-slate-700">Arquivos de Resultados</p>
              <p className="text-xs text-slate-500 mt-0.5">
                {projetoSelecionado.titulo}
                {projetoSelecionado.wps && (
                  <span className="ml-2 text-primary">· WP {projetoSelecionado.wps.wp}</span>
                )}
              </p>
            </div>

            {/* Botão Incluir Resultados */}
            <Dialog
              open={openResultados}
              onOpenChange={(o) => {
                setOpenResultados(o)
                if (!o) {
                  setResDescricao('')
                  setResFile(null)
                }
              }}
            >
              <DialogTrigger asChild>
                <Button size="sm">
                  <Plus className="w-4 h-4 mr-2" /> Incluir Resultado
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle>Incluir Resultado</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-4">
                  <p className="text-xs text-slate-500">
                    Projeto:{' '}
                    <span className="font-medium text-slate-700">{projetoSelecionado.titulo}</span>
                  </p>
                  <div className="space-y-2">
                    <Label>Descrição</Label>
                    <Input
                      placeholder="Ex: Relatório final WP1"
                      value={resDescricao}
                      onChange={(e) => setResDescricao(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Arquivo</Label>
                    <div className="flex gap-2">
                      <Input
                        readOnly
                        className="flex-1"
                        placeholder="Nenhum arquivo selecionado"
                        value={resFile ? resFile.name : ''}
                      />
                      <input
                        type="file"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => setResFile(e.target.files?.[0] || null)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" /> Buscar
                      </Button>
                    </div>
                  </div>
                </div>
                <Button
                  className="w-full"
                  disabled={savingRes || !resFile || !resDescricao.trim()}
                  onClick={handleSaveResultado}
                >
                  {savingRes ? (
                    'Salvando...'
                  ) : (
                    <>
                      <Plus className="w-4 h-4 mr-2" /> Incluir arquivo
                    </>
                  )}
                </Button>
              </DialogContent>
            </Dialog>
          </div>

          {/* Tabela de resultados */}
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Descrição</TableHead>
                <TableHead>Arquivo</TableHead>
                <TableHead className="w-[80px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loadingResultados ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-slate-400">
                    Carregando...
                  </TableCell>
                </TableRow>
              ) : resultados.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-6 text-slate-400">
                    Nenhum arquivo incluído para este projeto.
                  </TableCell>
                </TableRow>
              ) : (
                resultados.map((res) => (
                  <TableRow key={res.id_arq_res}>
                    <TableCell className="font-medium">{res.descricao}</TableCell>
                    <TableCell>
                      <a
                        href={getArquivoUrl(res.nome_arq)}
                        target="_blank"
                        rel="noreferrer"
                        className="flex items-center gap-1.5 text-primary hover:underline text-sm"
                        title={res.nome_arq}
                      >
                        <FileText className="w-4 h-4 shrink-0" />
                        <span className="truncate max-w-[240px] font-mono text-xs">
                          {res.nome_arq}
                        </span>
                      </a>
                    </TableCell>
                    <TableCell>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDeleteResultado(res)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      )}
    </div>
  )
}
