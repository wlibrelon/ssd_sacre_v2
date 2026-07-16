import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { useToast } from '@/hooks/use-toast'
import {
  Upload,
  Plus,
  Trash2,
  Pencil,
  TableIcon,
  ChevronLeft,
  ChevronRight,
  Check,
} from 'lucide-react'
import {
  parseCsv,
  montarDicionarioSugerido,
  converterValor,
  inferirColuna,
  ROTULOS_TIPO,
  ROTULOS_PAPEL,
  type ColunaDicionario,
  type TipoColuna,
  type PapelColuna,
  type CsvParseado,
} from '@/lib/resultados/dicionario'

const AGREGACOES_POR_PAPEL: Record<PapelColuna, ColunaDicionario['agregacoes_permitidas']> = {
  metrica: ['soma', 'media', 'min', 'max', 'contagem'],
  dimensao: ['contagem', 'contagem_distinta'],
  identificador: ['contagem_distinta'],
  ignorar: [],
}

interface TabelasDadosPanelProps {
  idProjeto: number
  tituloProjeto: string
}

export function TabelasDadosPanel({ idProjeto, tituloProjeto }: TabelasDadosPanelProps) {
  const { toast } = useToast()

  const [tabelas, setTabelas] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  const [open, setOpen] = useState(false)
  const [step, setStep] = useState<1 | 2 | 3>(1)
  const [csvFile, setCsvFile] = useState<File | null>(null)
  const [csvParsed, setCsvParsed] = useState<CsvParseado | null>(null)
  const [dicionario, setDicionario] = useState<ColunaDicionario[]>([])
  const [doc, setDoc] = useState({
    titulo: '',
    descricao_resumida: '',
    objetivo_resultado: '',
    origem_pesquisa: '',
    metodologia: '',
  })
  const [publicarAgora, setPublicarAgora] = useState(true)
  const [salvando, setSalvando] = useState(false)
  const [analisando, setAnalisando] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Dialog Editar Tabela (documentação + colunas) ────────────────────────────
  const [openEdit, setOpenEdit] = useState(false)
  const [editingTabela, setEditingTabela] = useState<any>(null)
  const [editDoc, setEditDoc] = useState({
    titulo: '',
    descricao_resumida: '',
    objetivo_resultado: '',
    origem_pesquisa: '',
    metodologia: '',
  })
  const [editColunas, setEditColunas] = useState<(ColunaDicionario & { id?: string })[]>([])
  const [colunaParaAdicionar, setColunaParaAdicionar] = useState<string>('')
  const [loadingEditColunas, setLoadingEditColunas] = useState(false)
  const [editPreviewLinhas, setEditPreviewLinhas] = useState<Record<string, any>[]>([])
  const [loadingEditPreview, setLoadingEditPreview] = useState(false)
  const [savingEdit, setSavingEdit] = useState(false)

  useEffect(() => {
    loadTabelas()
  }, [idProjeto])

  const loadTabelas = async () => {
    setLoading(true)
    const { data, error } = await supabase
      .from('resultado_tabela')
      .select('*')
      .eq('id_projeto', idProjeto)
      .order('criado_em', { ascending: false })
    if (!error && data) setTabelas(data)
    setLoading(false)
  }

  const resetWizard = () => {
    setStep(1)
    setCsvFile(null)
    setCsvParsed(null)
    setDicionario([])
    setDoc({
      titulo: '',
      descricao_resumida: '',
      objetivo_resultado: '',
      origem_pesquisa: '',
      metodologia: '',
    })
    setPublicarAgora(true)
  }

  const handleAnalisarArquivo = async () => {
    if (!csvFile) return
    setAnalisando(true)
    try {
      const parsed = await parseCsv(csvFile)
      if (parsed.headers.length === 0) {
        toast({
          title: 'Não foi possível identificar colunas no arquivo',
          variant: 'destructive',
        })
        return
      }
      setCsvParsed(parsed)
      setDicionario(montarDicionarioSugerido(parsed))
      setDoc((d) => ({ ...d, titulo: d.titulo || csvFile.name.replace(/\.csv$/i, '') }))
      setStep(2)
    } catch (err: any) {
      toast({ title: 'Erro ao ler o CSV', description: err.message, variant: 'destructive' })
    } finally {
      setAnalisando(false)
    }
  }

  const updateColuna = (index: number, patch: Partial<ColunaDicionario>) => {
    setDicionario((prev) =>
      prev.map((c, i) => {
        if (i !== index) return c
        const atualizado = { ...c, ...patch }
        // ao trocar o papel, ajusta as agregações permitidas automaticamente —
        // o usuário raciocina em cima de "pra que serve essa coluna", não em
        // cima de quais funções SQL ela aceita
        if (patch.papel) {
          atualizado.agregacoes_permitidas = AGREGACOES_POR_PAPEL[patch.papel]
        }
        return atualizado
      }),
    )
  }

  const handleSalvar = async () => {
    if (!csvParsed) return
    if (!doc.titulo.trim())
      return toast({ title: 'Título da tabela é obrigatório', variant: 'destructive' })
    if (!doc.descricao_resumida.trim())
      return toast({ title: 'Descrição resumida é obrigatória', variant: 'destructive' })
    if (!doc.objetivo_resultado.trim())
      return toast({ title: 'Objetivo do resultado é obrigatório', variant: 'destructive' })

    const temCampoUtil = dicionario.some((c) => c.papel === 'metrica' || c.papel === 'dimensao')
    if (!temCampoUtil) {
      return toast({
        title: 'Marque ao menos uma coluna como métrica ou dimensão',
        description: 'Sem isso não é possível montar seleções sobre essa tabela depois.',
        variant: 'destructive',
      })
    }

    setSalvando(true)
    try {
      // 1) upload do CSV original (guardado para rastreabilidade/auditoria)
      const nomeUnico = `resultados/${idProjeto}/${Date.now()}_${csvFile!.name}`
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('dados_brutos')
        .upload(nomeUnico, csvFile!)
      if (uploadError) throw uploadError

      // 2) cria o registro no catálogo (documentação)
      const { data: tabelaInserida, error: tabelaError } = await supabase
        .from('resultado_tabela')
        .insert({
          id_projeto: idProjeto,
          titulo: doc.titulo.trim(),
          descricao_resumida: doc.descricao_resumida.trim(),
          objetivo_resultado: doc.objetivo_resultado.trim(),
          origem_pesquisa: doc.origem_pesquisa.trim() || null,
          metodologia: doc.metodologia.trim() || null,
          arquivo_original: uploadData.path,
          status: publicarAgora ? 'publicado' : 'rascunho',
        })
        .select()
        .single()
      if (tabelaError) throw tabelaError

      const idTabela = tabelaInserida.id

      // 3) grava o dicionário de colunas
      const colunasPayload = dicionario
        .filter((c) => c.papel !== 'ignorar')
        .map((c) => ({
          id_tabela: idTabela,
          nome_original: c.nome_original,
          rotulo_amigavel: c.rotulo_amigavel.trim() || c.nome_original,
          tipo_detectado: c.tipo_detectado,
          papel: c.papel,
          unidade: c.unidade.trim() || null,
          agregacoes_permitidas: c.agregacoes_permitidas,
          ordem: c.ordem,
        }))
      const { error: colunaError } = await supabase.from('resultado_coluna').insert(colunasPayload)
      if (colunaError) throw colunaError

      // 4) converte e envia as linhas em lote via RPC (mesmo padrão usado
      // para feições geoespaciais em importar_feicoes_lote)
      const mapaTipos = new Map(dicionario.map((c) => [c.nome_original, c.tipo_detectado]))
      const linhasConvertidas = csvParsed.linhas.map((linha) => {
        const linhaConvertida: Record<string, string | number | null> = {}
        for (const header of csvParsed.headers) {
          const tipo = mapaTipos.get(header) ?? 'texto'
          linhaConvertida[header] = converterValor(linha[header] ?? '', tipo)
        }
        return linhaConvertida
      })

      const { error: rpcError } = await supabase.rpc('importar_linhas_resultado_lote', {
        p_id_tabela: idTabela,
        p_linhas: linhasConvertidas,
      })
      if (rpcError) throw rpcError

      await supabase
        .from('resultado_tabela')
        .update({ total_linhas: linhasConvertidas.length })
        .eq('id', idTabela)

      toast({ title: 'Tabela de dados salva com sucesso' })
      setOpen(false)
      resetWizard()
      loadTabelas()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar tabela', description: err.message, variant: 'destructive' })
    } finally {
      setSalvando(false)
    }
  }

  const handleAbrirEdicao = async (tabela: any) => {
    setEditingTabela(tabela)
    setEditDoc({
      titulo: tabela.titulo || '',
      descricao_resumida: tabela.descricao_resumida || '',
      objetivo_resultado: tabela.objetivo_resultado || '',
      origem_pesquisa: tabela.origem_pesquisa || '',
      metodologia: tabela.metodologia || '',
    })
    setOpenEdit(true)

    setLoadingEditColunas(true)
    const { data, error } = await supabase
      .from('resultado_coluna')
      .select('*')
      .eq('id_tabela', tabela.id)
      .order('ordem')
    if (!error && data) {
      setEditColunas(
        data.map((c) => ({
          id: c.id,
          nome_original: c.nome_original,
          rotulo_amigavel: c.rotulo_amigavel || c.nome_original,
          tipo_detectado: c.tipo_detectado as TipoColuna,
          papel: c.papel as PapelColuna,
          unidade: c.unidade || '',
          agregacoes_permitidas: c.agregacoes_permitidas || [],
          ordem: c.ordem,
        })),
      )
    }
    setLoadingEditColunas(false)

    // Pré-visualização dos dados já importados (mesmo padrão do assistente de
    // criação): algumas linhas reais da tabela, pra dar contexto na hora de
    // ajustar rótulo/tipo/papel/unidade de cada coluna.
    setLoadingEditPreview(true)
    const { data: linhasData, error: linhasError } = await supabase
      .from('resultado_linha')
      .select('linha')
      .eq('id_tabela', tabela.id)
      .order('id')
      .limit(50)
    if (!linhasError && linhasData) {
      setEditPreviewLinhas(linhasData.map((r) => r.linha as Record<string, any>))
    }
    setLoadingEditPreview(false)
  }

  const updateEditColuna = (index: number, patch: Partial<ColunaDicionario>) => {
    setEditColunas((prev) =>
      prev.map((c, i) => {
        if (i !== index) return c
        const atualizado = { ...c, ...patch }
        if (patch.papel) {
          atualizado.agregacoes_permitidas = AGREGACOES_POR_PAPEL[patch.papel]
        }
        return atualizado
      }),
    )
  }

  // Colunas que existem nos dados brutos importados (chaves do JSONB de
  // resultado_linha) mas que não estão em resultado_coluna — ou seja, foram
  // marcadas como "ignorar" no momento da importação e nunca ganharam um
  // registro no dicionário.
  const nomesColunasAtuais = new Set(editColunas.map((c) => c.nome_original))
  const colunasIgnoradas =
    editPreviewLinhas.length > 0
      ? Object.keys(editPreviewLinhas[0]).filter((h) => !nomesColunasAtuais.has(h))
      : []

  const handleAdicionarColunaIgnorada = () => {
    if (!colunaParaAdicionar) return
    const valoresAmostra = editPreviewLinhas.map((l) => String(l[colunaParaAdicionar] ?? ''))
    const proximaOrdem = editColunas.reduce((max, c) => Math.max(max, c.ordem), -1) + 1
    const sugerida = inferirColuna(colunaParaAdicionar, valoresAmostra, proximaOrdem)
    setEditColunas((prev) => [...prev, sugerida])
    setColunaParaAdicionar('')
  }

  const handleRemoverColunaNaoSalva = (index: number) => {
    setEditColunas((prev) => prev.filter((_, i) => i !== index))
  }

  const handleSalvarEdicao = async () => {
    if (!editingTabela) return
    if (!editDoc.titulo.trim())
      return toast({ title: 'Título da tabela é obrigatório', variant: 'destructive' })
    if (!editDoc.descricao_resumida.trim())
      return toast({ title: 'Descrição resumida é obrigatória', variant: 'destructive' })
    if (!editDoc.objetivo_resultado.trim())
      return toast({ title: 'Objetivo do resultado é obrigatório', variant: 'destructive' })

    setSavingEdit(true)
    try {
      const { error } = await supabase
        .from('resultado_tabela')
        .update({
          titulo: editDoc.titulo.trim(),
          descricao_resumida: editDoc.descricao_resumida.trim(),
          objetivo_resultado: editDoc.objetivo_resultado.trim(),
          origem_pesquisa: editDoc.origem_pesquisa.trim() || null,
          metodologia: editDoc.metodologia.trim() || null,
        })
        .eq('id', editingTabela.id)
      if (error) throw error

      // Atualiza cada coluna já existente e insere as que foram adicionadas
      // de volta (colunas que estavam marcadas como "ignorar" na importação
      // e não tinham registro em resultado_coluna ainda).
      const resultadosColunas = await Promise.all(
        editColunas.map((c) =>
          c.id
            ? supabase
                .from('resultado_coluna')
                .update({
                  rotulo_amigavel: c.rotulo_amigavel.trim() || c.nome_original,
                  tipo_detectado: c.tipo_detectado,
                  papel: c.papel,
                  unidade: c.unidade.trim() || null,
                  agregacoes_permitidas: c.agregacoes_permitidas,
                })
                .eq('id', c.id)
            : supabase.from('resultado_coluna').insert({
                id_tabela: editingTabela.id,
                nome_original: c.nome_original,
                rotulo_amigavel: c.rotulo_amigavel.trim() || c.nome_original,
                tipo_detectado: c.tipo_detectado,
                papel: c.papel,
                unidade: c.unidade.trim() || null,
                agregacoes_permitidas: c.agregacoes_permitidas,
                ordem: c.ordem,
              }),
        ),
      )
      const colunaComErro = resultadosColunas.find((r) => r.error)
      if (colunaComErro?.error) throw colunaComErro.error

      toast({ title: 'Tabela atualizada' })
      setOpenEdit(false)
      setEditingTabela(null)
      loadTabelas()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    } finally {
      setSavingEdit(false)
    }
  }

  const handleTogglePublicacao = async (tabela: any) => {
    const novoStatus = tabela.status === 'publicado' ? 'rascunho' : 'publicado'
    const { error } = await supabase
      .from('resultado_tabela')
      .update({ status: novoStatus })
      .eq('id', tabela.id)
    if (error) {
      toast({ title: 'Erro ao atualizar status', description: error.message, variant: 'destructive' })
    } else {
      loadTabelas()
    }
  }

  const handleDelete = async (tabela: any) => {
    if (!confirm(`Excluir a tabela "${tabela.titulo}"? Essa ação não pode ser desfeita.`)) return
    try {
      if (tabela.arquivo_original) {
        await supabase.storage.from('dados_brutos').remove([tabela.arquivo_original])
      }
      const { error } = await supabase.from('resultado_tabela').delete().eq('id', tabela.id)
      if (error) throw error
      toast({ title: 'Tabela excluída' })
      loadTabelas()
    } catch (err: any) {
      toast({ title: 'Erro ao excluir', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <p className="text-xs text-slate-500">
          Tabelas de dados vinculadas a <span className="font-medium">{tituloProjeto}</span>
        </p>

        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o)
            if (!o) resetWizard()
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm">
              <Plus className="w-4 h-4 mr-2" /> Nova Tabela de Dados
            </Button>
          </DialogTrigger>
          <DialogContent
            className="w-[92vw] max-w-[1400px] min-w-[600px] max-h-[85vh] overflow-y-auto resize"
          >
            <DialogHeader>
              <DialogTitle>Nova Tabela de Dados — Passo {step} de 3</DialogTitle>
              <p className="text-xs text-muted-foreground/70">
                Arraste o canto inferior direito da janela para redimensionar.
              </p>
            </DialogHeader>

            {/* ── Passo 1: upload do CSV ── */}
            {step === 1 && (
              <div className="space-y-4 py-2 min-w-0">
                <p className="text-sm text-slate-600">
                  Envie um arquivo CSV com os dados do resultado. Na próxima etapa você revisa
                  como o sistema entendeu cada coluna antes de publicar.
                </p>
                <div className="flex gap-2">
                  <Input
                    readOnly
                    className="flex-1"
                    placeholder="Nenhum arquivo selecionado"
                    value={csvFile ? csvFile.name : ''}
                  />
                  <input
                    type="file"
                    accept=".csv"
                    ref={fileInputRef}
                    className="hidden"
                    onChange={(e) => setCsvFile(e.target.files?.[0] || null)}
                  />
                  <Button type="button" variant="outline" onClick={() => fileInputRef.current?.click()}>
                    <Upload className="w-4 h-4 mr-2" /> Buscar
                  </Button>
                </div>
                <Button className="w-full" disabled={!csvFile || analisando} onClick={handleAnalisarArquivo}>
                  {analisando ? 'Analisando...' : 'Analisar arquivo'}
                  {!analisando && <ChevronRight className="w-4 h-4 ml-2" />}
                </Button>
              </div>
            )}

            {/* ── Passo 2: dicionário de dados ── */}
            {step === 2 && csvParsed && (
              <div className="space-y-4 py-2 min-w-0">
                {/* Pré-visualização dos dados: topo da janela, altura limitada
                    a ~5 linhas visíveis com scroll vertical pro restante. */}
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-medium">Pré-visualização dos dados</p>
                  {/* table cru (sem o wrapper div do componente <Table>) —
                      assim esse div é o ÚNICO contêiner de scroll, nos dois
                      eixos, e a barra horizontal fica presa à base da área
                      visível em vez de "sumir" lá embaixo do conteúdo. */}
                  <div className="border rounded-md overflow-auto min-w-0 max-h-[230px]">
                    <table className="w-full caption-bottom text-sm">
                      <TableHeader>
                        <TableRow>
                          {csvParsed.headers.map((h) => (
                            <TableHead
                              key={h}
                              className="sticky top-0 bg-background whitespace-nowrap"
                            >
                              {h}
                            </TableHead>
                          ))}
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {csvParsed.linhas.map((linha, i) => (
                          <TableRow key={i}>
                            {csvParsed.headers.map((h) => (
                              <TableCell key={h} className="whitespace-nowrap">
                                {linha[h]}
                              </TableCell>
                            ))}
                          </TableRow>
                        ))}
                      </TableBody>
                    </table>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    {csvParsed.linhas.length} linha(s) no arquivo.
                  </p>
                </div>

                <div className="flex items-center justify-between gap-2">
                  <p className="text-sm text-slate-600">
                    O sistema sugeriu um tipo e um papel para cada coluna. Ajuste o que for
                    necessário — isso define o que fica disponível depois para seleção,
                    totalização e agrupamento.
                  </p>
                  <p className="text-xs text-muted-foreground/70 whitespace-nowrap shrink-0">
                    Arraste o canto ↘ para redimensionar
                  </p>
                </div>
                {/* Largura independente da pré-visualização acima: min-w-0
                    impede que essa tabela "herde" a largura estufada da
                    tabela de dados. Resize vertical próprio (resize-y),
                    desacoplado do redimensionamento da janela principal. */}
                <div className="border rounded-md overflow-auto resize-y min-w-0 min-h-[160px] h-[320px] max-h-[65vh]">
                  <table className="w-full caption-bottom text-sm">
                    <TableHeader>
                      <TableRow>
                        <TableHead className="sticky top-0 bg-background">Coluna no arquivo</TableHead>
                        <TableHead className="sticky top-0 bg-background">Rótulo amigável</TableHead>
                        <TableHead className="sticky top-0 bg-background w-[150px]">Tipo</TableHead>
                        <TableHead className="sticky top-0 bg-background w-[190px]">Papel</TableHead>
                        <TableHead className="sticky top-0 bg-background w-[110px]">Unidade</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {dicionario.map((col, i) => (
                        <TableRow key={col.nome_original}>
                          <TableCell className="font-mono text-xs text-muted-foreground">
                            {col.nome_original}
                          </TableCell>
                          <TableCell>
                            <Input
                              value={col.rotulo_amigavel}
                              onChange={(e) => updateColuna(i, { rotulo_amigavel: e.target.value })}
                            />
                          </TableCell>
                          <TableCell>
                            <Select
                              value={col.tipo_detectado}
                              onValueChange={(v) => updateColuna(i, { tipo_detectado: v as TipoColuna })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {(Object.keys(ROTULOS_TIPO) as TipoColuna[]).map((t) => (
                                  <SelectItem key={t} value={t}>
                                    {ROTULOS_TIPO[t]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Select
                              value={col.papel}
                              onValueChange={(v) => updateColuna(i, { papel: v as PapelColuna })}
                            >
                              <SelectTrigger>
                                <SelectValue />
                              </SelectTrigger>
                              <SelectContent>
                                {(Object.keys(ROTULOS_PAPEL) as PapelColuna[]).map((p) => (
                                  <SelectItem key={p} value={p}>
                                    {ROTULOS_PAPEL[p]}
                                  </SelectItem>
                                ))}
                              </SelectContent>
                            </Select>
                          </TableCell>
                          <TableCell>
                            <Input
                              placeholder="ex: m³"
                              value={col.unidade}
                              onChange={(e) => updateColuna(i, { unidade: e.target.value })}
                            />
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </table>
                </div>
                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(1)}>
                    <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                  </Button>
                  <Button onClick={() => setStep(3)}>
                    Continuar <ChevronRight className="w-4 h-4 ml-2" />
                  </Button>
                </div>
              </div>
            )}

            {/* ── Passo 3: documentação ── */}
            {step === 3 && (
              <div className="space-y-4 py-2 min-w-0">
                <p className="text-sm text-slate-600">
                  Cada projeto tem uma estrutura de resultado diferente — essa documentação é o
                  que permite entender o dado depois, mesmo sem ter acompanhado a pesquisa.
                </p>
                <div className="space-y-2">
                  <Label>Título da tabela *</Label>
                  <Input
                    value={doc.titulo}
                    onChange={(e) => setDoc({ ...doc, titulo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição resumida *</Label>
                  <Textarea
                    rows={2}
                    placeholder="Do que se trata essa tabela, em poucas linhas"
                    value={doc.descricao_resumida}
                    onChange={(e) => setDoc({ ...doc, descricao_resumida: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Objetivo desse resultado *</Label>
                  <Textarea
                    rows={2}
                    placeholder="Que pergunta da pesquisa esse resultado responde"
                    value={doc.objetivo_resultado}
                    onChange={(e) => setDoc({ ...doc, objetivo_resultado: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Origem na pesquisa</Label>
                  <Input
                    placeholder="Ex: Dissertação de Fulano, Cap. 4 (2024)"
                    value={doc.origem_pesquisa}
                    onChange={(e) => setDoc({ ...doc, origem_pesquisa: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Metodologia (opcional)</Label>
                  <Textarea
                    rows={2}
                    value={doc.metodologia}
                    onChange={(e) => setDoc({ ...doc, metodologia: e.target.value })}
                  />
                </div>
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="publicar-agora"
                    checked={publicarAgora}
                    onChange={(e) => setPublicarAgora(e.target.checked)}
                  />
                  <Label htmlFor="publicar-agora" className="cursor-pointer">
                    Publicar imediatamente (visível no módulo de Resultados)
                  </Label>
                </div>

                <div className="flex justify-between">
                  <Button variant="outline" onClick={() => setStep(2)}>
                    <ChevronLeft className="w-4 h-4 mr-2" /> Voltar
                  </Button>
                  <Button onClick={handleSalvar} disabled={salvando}>
                    {salvando ? (
                      'Salvando...'
                    ) : (
                      <>
                        <Check className="w-4 h-4 mr-2" /> Salvar Tabela de Dados
                      </>
                    )}
                  </Button>
                </div>
              </div>
            )}
          </DialogContent>
        </Dialog>
      </div>

      {/* ── Lista de tabelas já cadastradas ── */}
      <div className="border rounded-md overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Título</TableHead>
              <TableHead>Linhas</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="w-[120px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-slate-400">
                  Carregando...
                </TableCell>
              </TableRow>
            ) : tabelas.length === 0 ? (
              <TableRow>
                <TableCell colSpan={4} className="text-center py-6 text-slate-400">
                  Nenhuma tabela de dados cadastrada para este projeto.
                </TableCell>
              </TableRow>
            ) : (
              tabelas.map((t) => (
                <TableRow key={t.id}>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      <TableIcon className="w-4 h-4 text-primary shrink-0" />
                      <div>
                        <p className="font-medium">{t.titulo}</p>
                        <p className="text-xs text-muted-foreground line-clamp-1">
                          {t.descricao_resumida}
                        </p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell>{t.total_linhas ?? 0}</TableCell>
                  <TableCell>
                    <Badge
                      variant={t.status === 'publicado' ? 'default' : 'secondary'}
                      className="cursor-pointer"
                      onClick={() => handleTogglePublicacao(t)}
                    >
                      {t.status === 'publicado' ? 'Publicado' : 'Rascunho'}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-1">
                      <Button variant="ghost" size="icon" onClick={() => handleAbrirEdicao(t)}>
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(t)}
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
      </div>

      {/* Dialog Editar Tabela (documentação + colunas) */}
      <Dialog
        open={openEdit}
        onOpenChange={(o) => {
          setOpenEdit(o)
          if (!o) {
            setEditingTabela(null)
            setEditColunas([])
            setEditPreviewLinhas([])
            setColunaParaAdicionar('')
          }
        }}
      >
        <DialogContent className="max-w-6xl w-[95vw] max-h-[85vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Editar Tabela de Dados</DialogTitle>
          </DialogHeader>

          <Tabs defaultValue="documentacao" className="w-full min-w-0">
            <TabsList className="mb-2">
              <TabsTrigger value="documentacao">Documentação</TabsTrigger>
              <TabsTrigger value="colunas">Colunas ({editColunas.length})</TabsTrigger>
            </TabsList>

            <TabsContent value="documentacao" className="mt-0">
              <div className="space-y-4 py-2">
                <div className="space-y-2">
                  <Label>Título da tabela *</Label>
                  <Input
                    value={editDoc.titulo}
                    onChange={(e) => setEditDoc({ ...editDoc, titulo: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Descrição resumida *</Label>
                  <Textarea
                    rows={2}
                    value={editDoc.descricao_resumida}
                    onChange={(e) =>
                      setEditDoc({ ...editDoc, descricao_resumida: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Objetivo desse resultado *</Label>
                  <Textarea
                    rows={2}
                    value={editDoc.objetivo_resultado}
                    onChange={(e) =>
                      setEditDoc({ ...editDoc, objetivo_resultado: e.target.value })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <Label>Origem na pesquisa</Label>
                  <Input
                    value={editDoc.origem_pesquisa}
                    onChange={(e) => setEditDoc({ ...editDoc, origem_pesquisa: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Metodologia (opcional)</Label>
                  <Textarea
                    rows={2}
                    value={editDoc.metodologia}
                    onChange={(e) => setEditDoc({ ...editDoc, metodologia: e.target.value })}
                  />
                </div>
              </div>
            </TabsContent>

            <TabsContent value="colunas" className="mt-0">
              <div className="space-y-3 py-2 min-w-0">
                <p className="text-sm text-slate-600">
                  Ajuste rótulo, tipo, papel e unidade de cada coluna. Isso define o que fica
                  disponível para seleção, totalização e agrupamento no construtor de consulta.
                  As colunas em si (do arquivo original importado) não podem ser adicionadas ou
                  removidas por aqui.
                </p>

                {/* Pré-visualização dos dados já importados */}
                <div className="space-y-1 min-w-0">
                  <p className="text-sm font-medium">Pré-visualização dos dados</p>
                  {loadingEditPreview ? (
                    <p className="text-sm text-slate-400 py-4 text-center border rounded-md">
                      Carregando...
                    </p>
                  ) : editPreviewLinhas.length === 0 ? (
                    <p className="text-sm text-slate-400 py-4 text-center border rounded-md">
                      Nenhuma linha encontrada para esta tabela.
                    </p>
                  ) : (
                    <div className="border rounded-md overflow-auto min-w-0 max-h-[230px]">
                      <table className="w-full caption-bottom text-sm">
                        <TableHeader>
                          <TableRow>
                            {editColunas.map((c) => (
                              <TableHead
                                key={c.nome_original}
                                className="sticky top-0 bg-background whitespace-nowrap"
                              >
                                {c.nome_original}
                              </TableHead>
                            ))}
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {editPreviewLinhas.map((linha, i) => (
                            <TableRow key={i}>
                              {editColunas.map((c) => (
                                <TableCell key={c.nome_original} className="whitespace-nowrap">
                                  {String(linha[c.nome_original] ?? '')}
                                </TableCell>
                              ))}
                            </TableRow>
                          ))}
                        </TableBody>
                      </table>
                    </div>
                  )}
                </div>

                {/* Reincluir coluna que foi marcada como "ignorar" na importação
                    original — ela existe nos dados brutos, mas nunca ganhou um
                    registro no dicionário de colunas. */}
                {colunasIgnoradas.length > 0 && (
                  <div className="flex items-end gap-2 border rounded-md p-3 bg-slate-50">
                    <div className="flex-1 space-y-1">
                      <Label className="text-xs text-muted-foreground">
                        Incluir coluna ignorada na importação
                      </Label>
                      <Select value={colunaParaAdicionar} onValueChange={setColunaParaAdicionar}>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione uma coluna..." />
                        </SelectTrigger>
                        <SelectContent>
                          {colunasIgnoradas.map((nome) => (
                            <SelectItem key={nome} value={nome}>
                              {nome}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <Button
                      type="button"
                      variant="outline"
                      disabled={!colunaParaAdicionar}
                      onClick={handleAdicionarColunaIgnorada}
                    >
                      <Plus className="w-4 h-4 mr-2" /> Adicionar coluna
                    </Button>
                  </div>
                )}

                {loadingEditColunas ? (
                  <p className="text-sm text-slate-400 py-6 text-center">Carregando colunas...</p>
                ) : (
                  <div className="border rounded-md overflow-auto resize-y min-w-0 min-h-[160px] h-[320px] max-h-[65vh]">
                    <table className="w-full caption-bottom text-sm">
                      <TableHeader>
                        <TableRow>
                          <TableHead className="sticky top-0 bg-background">Coluna no arquivo</TableHead>
                          <TableHead className="sticky top-0 bg-background">Rótulo amigável</TableHead>
                          <TableHead className="sticky top-0 bg-background w-[150px]">Tipo</TableHead>
                          <TableHead className="sticky top-0 bg-background w-[190px]">Papel</TableHead>
                          <TableHead className="sticky top-0 bg-background w-[110px]">Unidade</TableHead>
                          <TableHead className="sticky top-0 bg-background w-[60px]" />
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {editColunas.map((col, i) => (
                          <TableRow key={col.id ?? `novo-${col.nome_original}`}>
                            <TableCell className="font-mono text-xs text-muted-foreground">
                              {col.nome_original}
                              {!col.id && (
                                <Badge variant="secondary" className="ml-2 text-[10px]">
                                  Nova
                                </Badge>
                              )}
                            </TableCell>
                            <TableCell>
                              <Input
                                value={col.rotulo_amigavel}
                                onChange={(e) =>
                                  updateEditColuna(i, { rotulo_amigavel: e.target.value })
                                }
                              />
                            </TableCell>
                            <TableCell>
                              <Select
                                value={col.tipo_detectado}
                                onValueChange={(v) =>
                                  updateEditColuna(i, { tipo_detectado: v as TipoColuna })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {(Object.keys(ROTULOS_TIPO) as TipoColuna[]).map((t) => (
                                    <SelectItem key={t} value={t}>
                                      {ROTULOS_TIPO[t]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Select
                                value={col.papel}
                                onValueChange={(v) =>
                                  updateEditColuna(i, { papel: v as PapelColuna })
                                }
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  {(Object.keys(ROTULOS_PAPEL) as PapelColuna[]).map((p) => (
                                    <SelectItem key={p} value={p}>
                                      {ROTULOS_PAPEL[p]}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Input
                                placeholder="ex: m³"
                                value={col.unidade}
                                onChange={(e) => updateEditColuna(i, { unidade: e.target.value })}
                              />
                            </TableCell>
                            <TableCell>
                              {!col.id && (
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="text-destructive"
                                  onClick={() => handleRemoverColunaNaoSalva(i)}
                                  title="Remover (ainda não salva)"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </Button>
                              )}
                            </TableCell>
                          </TableRow>
                        ))}
                        {editColunas.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={6} className="text-center py-4 text-slate-400">
                              Nenhuma coluna cadastrada para esta tabela.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </table>
                  </div>
                )}
                <p className="text-xs text-muted-foreground">
                  Alterar o tipo de uma coluna não converte retroativamente os valores já
                  importados — vale para os dados que entrarem depois de uma nova análise.
                </p>
              </div>
            </TabsContent>
          </Tabs>

          <Button onClick={handleSalvarEdicao} disabled={savingEdit} className="w-full">
            {savingEdit ? 'Salvando...' : 'Salvar alterações'}
          </Button>
        </DialogContent>
      </Dialog>
    </div>
  )
}
