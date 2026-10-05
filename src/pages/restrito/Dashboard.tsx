import { useState, useEffect } from 'react'
import { useAuth } from '@/hooks/use-auth'
import { Navigate } from 'react-router-dom'
import { supabase } from '@/lib/supabase/client'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { RichTextEditor } from '@/components/ui/rich-text-editor'
import { sanitizeHtml } from '@/lib/sanitize-html'
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from '@/components/ui/accordion'
import { ArtigosTab } from '@/components/gestao-projetos/ArtigosTab'
import { MidiaAdmin } from '@/components/admin/MidiaAdmin'
import { CongressosAdmin } from '@/components/admin/CongressosAdmin'
import { UsuariosAdmin } from '@/components/admin/UsuariosAdmin'

export default function Dashboard() {
  const { user, profile, isAuthenticated, loading } = useAuth()
  const { toast } = useToast()
  const [documents, setDocuments] = useState<any[]>([])
  const [paginasEstudo, setPaginasEstudo] = useState<
    { id: number; titulo: string; conteudo_html: string; ordem: number }[]
  >([])
  const [novaPaginaTitulo, setNovaPaginaTitulo] = useState('')
  const [openPaginaId, setOpenPaginaId] = useState('')
  const [descricaoDoc, setDescricaoDoc] = useState('')

  useEffect(() => {
    if (!isAuthenticated) return
    loadData()
  }, [isAuthenticated])

  const loadData = async () => {
    const { data: docsData } = await supabase
      .from('documentos_publicos')
      .select('*')
      .order('criado_em', { ascending: false })
    if (docsData) setDocuments(docsData)

    const { data: paginasData } = await supabase
      .from('conteudo_estudo')
      .select('*')
      .order('ordem', { ascending: true })
      .order('id', { ascending: true })
    if (paginasData) setPaginasEstudo(paginasData)
  }

  const updatePaginaHtml = (id: number, html: string) => {
    setPaginasEstudo((prev) => prev.map((p) => (p.id === id ? { ...p, conteudo_html: html } : p)))
  }

  const savePagina = async (id: number) => {
    const pagina = paginasEstudo.find((p) => p.id === id)
    if (!pagina) return
    const sanitized = sanitizeHtml(pagina.conteudo_html)
    await supabase.from('conteudo_estudo').update({ conteudo_html: sanitized }).eq('id', id)
    toast({ title: 'Conteúdo salvo' })
  }

  const addPagina = async () => {
    const titulo = novaPaginaTitulo.trim()
    if (!titulo) {
      return toast({ title: 'Digite um título para a opção do menu', variant: 'destructive' })
    }
    const proximaOrdem = paginasEstudo.length
      ? Math.max(...paginasEstudo.map((p) => p.ordem ?? 0)) + 1
      : 1
    const { data, error } = await supabase
      .from('conteudo_estudo')
      .insert({ titulo, conteudo_html: '', ordem: proximaOrdem })
      .select()
      .single()
    if (error || !data) {
      toast({ title: 'Erro ao criar opção', description: error?.message, variant: 'destructive' })
      return
    }
    setPaginasEstudo((prev) => [...prev, data])
    setNovaPaginaTitulo('')
    setOpenPaginaId(String(data.id))
    toast({ title: 'Opção criada — edite o conteúdo abaixo e salve' })
  }

  const renamePagina = async (id: number, tituloAtual: string) => {
    const novo = window.prompt('Novo título da opção de menu:', tituloAtual)
    if (!novo || !novo.trim() || novo.trim() === tituloAtual) return
    const tituloLimpo = novo.trim()
    await supabase.from('conteudo_estudo').update({ titulo: tituloLimpo }).eq('id', id)
    setPaginasEstudo((prev) => prev.map((p) => (p.id === id ? { ...p, titulo: tituloLimpo } : p)))
  }

  const deletePagina = async (id: number, titulo: string) => {
    if (!window.confirm(`Excluir a opção "${titulo}" do menu? O conteúdo dela será perdido.`)) return
    await supabase.from('conteudo_estudo').delete().eq('id', id)
    setPaginasEstudo((prev) => prev.filter((p) => p.id !== id))
    toast({ title: 'Opção excluída' })
  }

  const movePagina = async (id: number, direction: -1 | 1) => {
    const sorted = [...paginasEstudo].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0) || a.id - b.id)
    const index = sorted.findIndex((p) => p.id === id)
    const targetIndex = index + direction
    if (index === -1 || targetIndex < 0 || targetIndex >= sorted.length) return
    const current = sorted[index]
    const target = sorted[targetIndex]
    const currentOrdem = current.ordem ?? 0
    const targetOrdem = target.ordem ?? 0
    await supabase.from('conteudo_estudo').update({ ordem: targetOrdem }).eq('id', current.id)
    await supabase.from('conteudo_estudo').update({ ordem: currentOrdem }).eq('id', target.id)
    setPaginasEstudo((prev) =>
      prev.map((p) => {
        if (p.id === current.id) return { ...p, ordem: targetOrdem }
        if (p.id === target.id) return { ...p, ordem: currentOrdem }
        return p
      }),
    )
  }

  const uploadDoc = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    const filename = `${Date.now()}_${file.name}`
    const { data: uploadData, error } = await supabase.storage
      .from('documentos')
      .upload(filename, file)
    if (error) return toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(filename)
    await supabase.from('documentos_publicos').insert({
      nome: file.name,
      descricao: descricaoDoc,
      url_arquivo: urlData.publicUrl,
    })
    toast({ title: 'Documento enviado' })
    setDescricaoDoc('')
    loadData()
  }

  const deleteDoc = async (id: number, url: string) => {
    await supabase.from('documentos_publicos').delete().eq('id', id)
    const filename = url.split('/').pop()
    if (filename) await supabase.storage.from('documentos').remove([filename])
    loadData()
  }

  const [AtividadesAdmin, setAtividadesAdmin] = useState<any>(null)
  useEffect(() => {
    import('@/components/admin/AtividadesSociaisAdmin').then((m) =>
      setAtividadesAdmin(() => m.AtividadesSociaisAdmin),
    )
  }, [])

  if (loading) return null
  if (!isAuthenticated) return <Navigate to="/auth" replace />

  const isAdmin = profile?.id_ga === 4

  return (
    <div className="space-y-8 animate-fade-in max-w-6xl mx-auto p-4">
      <div className="flex justify-between items-end border-b pb-4">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-primary">Painel Administrativo</h1>
          <p className="text-muted-foreground mt-2 text-lg">
            Autenticado como: <strong className="text-secondary">{profile?.nome}</strong>
          </p>
        </div>
      </div>

      <Tabs defaultValue="divulgacao" className="w-full">
        <TabsList className="flex flex-wrap h-auto gap-2 mb-6">
          <TabsTrigger value="divulgacao">Divulgação</TabsTrigger>
          {isAdmin && <TabsTrigger value="usuarios">Usuários da plataforma</TabsTrigger>}
          {isAdmin && <TabsTrigger value="conteudo">Gestão de Conteúdo</TabsTrigger>}
          {isAdmin && <TabsTrigger value="documentos">Documentos Públicos</TabsTrigger>}
        </TabsList>

        <TabsContent value="divulgacao">
          <Card>
            <CardHeader>
              <CardTitle>Gestão de Divulgação</CardTitle>
              <CardDescription>Gerencie publicações, mídia e eventos do projeto.</CardDescription>
            </CardHeader>
            <CardContent>
              <Accordion type="single" collapsible className="w-full">
                <AccordionItem value="publicacoes">
                  <AccordionTrigger className="text-lg">Publicações Científicas</AccordionTrigger>
                  <AccordionContent className="pt-4 border-t">
                    <ArtigosTab />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="midia">
                  <AccordionTrigger className="text-lg">Mídia e Notícias</AccordionTrigger>
                  <AccordionContent className="pt-4 border-t">
                    <MidiaAdmin />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="congressos">
                  <AccordionTrigger className="text-lg">Congressos e Eventos</AccordionTrigger>
                  <AccordionContent className="pt-4 border-t">
                    <CongressosAdmin />
                  </AccordionContent>
                </AccordionItem>
                <AccordionItem value="atividades">
                  <AccordionTrigger className="text-lg">Atividades Sociais</AccordionTrigger>
                  <AccordionContent className="pt-4 border-t">
                    {AtividadesAdmin ? (
                      <AtividadesAdmin />
                    ) : (
                      <p className="text-sm text-muted-foreground p-4 bg-muted/20 text-center rounded-md">
                        Carregando...
                      </p>
                    )}
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </CardContent>
          </Card>
        </TabsContent>

        {isAdmin && (
          <>
            <TabsContent value="usuarios">
              <UsuariosAdmin />
            </TabsContent>

            <TabsContent value="conteudo">
              <Card>
                <CardHeader>
                  <CardTitle>Gestão de Conteúdo</CardTitle>
                  <CardDescription>
                    Define as opções que aparecem no menu "Área de Estudo" (além de Documentos e
                    Mapas, que são fixas) e o conteúdo de cada uma.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Input
                      value={novaPaginaTitulo}
                      onChange={(e) => setNovaPaginaTitulo(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') addPagina()
                      }}
                      placeholder="Título da nova opção de menu (ex: Metodologia)"
                    />
                    <Button onClick={addPagina} className="sm:shrink-0">
                      Adicionar opção
                    </Button>
                  </div>

                  {paginasEstudo.length === 0 ? (
                    <p className="rounded-md bg-muted/20 p-4 text-center text-sm text-muted-foreground">
                      Nenhuma opção cadastrada ainda.
                    </p>
                  ) : (
                    <Accordion
                      type="single"
                      collapsible
                      className="w-full"
                      value={openPaginaId}
                      onValueChange={setOpenPaginaId}
                    >
                      {[...paginasEstudo]
                        .sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0) || a.id - b.id)
                        .map((pagina, index, arr) => (
                          <AccordionItem key={pagina.id} value={String(pagina.id)}>
                            <AccordionTrigger className="text-lg">{pagina.titulo}</AccordionTrigger>
                            <AccordionContent className="space-y-4 border-t pt-4">
                              <div className="flex flex-wrap items-center gap-2">
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => renamePagina(pagina.id, pagina.titulo)}
                                >
                                  Renomear
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={index === 0}
                                  onClick={() => movePagina(pagina.id, -1)}
                                >
                                  Mover para cima
                                </Button>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={index === arr.length - 1}
                                  onClick={() => movePagina(pagina.id, 1)}
                                >
                                  Mover para baixo
                                </Button>
                                <Button
                                  variant="destructive"
                                  size="sm"
                                  onClick={() => deletePagina(pagina.id, pagina.titulo)}
                                >
                                  Excluir opção
                                </Button>
                              </div>
                              <RichTextEditor
                                value={pagina.conteudo_html}
                                onChange={(html) => updatePaginaHtml(pagina.id, html)}
                                placeholder={`Escreva o conteúdo de "${pagina.titulo}"...`}
                              />
                              <Button onClick={() => savePagina(pagina.id)}>Salvar</Button>
                            </AccordionContent>
                          </AccordionItem>
                        ))}
                    </Accordion>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="documentos">
              <Card>
                <CardHeader>
                  <CardTitle>Documentos Públicos</CardTitle>
                  <CardDescription>
                    Faça upload de documentos para a Área de Estudo.
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-6">
                  <div className="space-y-2">
                    <Input
                      type="text"
                      placeholder="Descrição do documento"
                      value={descricaoDoc}
                      onChange={(e) => setDescricaoDoc(e.target.value)}
                      className="w-full"
                    />
                    <Input type="file" onChange={uploadDoc} />
                  </div>
                  <div className="overflow-auto max-h-[300px] border rounded-md">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>Descrição</TableHead>
                          <TableHead>Data</TableHead>
                          <TableHead>Ações</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {documents.map((d) => (
                          <TableRow key={d.id}>
                            <TableCell>{d.nome}</TableCell>
                            <TableCell>{d.descricao}</TableCell>
                            <TableCell>
                              {new Date(d.criado_em).toLocaleDateString('pt-BR')}
                            </TableCell>
                            <TableCell className="space-x-2">
                              <Button size="sm" variant="outline" asChild>
                                <a href={d.url_arquivo} target="_blank" rel="noreferrer">
                                  Ver
                                </a>
                              </Button>
                              <Button
                                size="sm"
                                variant="destructive"
                                onClick={() => deleteDoc(d.id, d.url_arquivo)}
                              >
                                Excluir
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>
          </>
        )}
      </Tabs>
    </div>
  )
}
