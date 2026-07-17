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

export default function Dashboard() {
  const { user, profile, isAuthenticated, loading } = useAuth()
  const { toast } = useToast()
  const [pendingUsers, setPendingUsers] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [documents, setDocuments] = useState<any[]>([])
  const [contexto, setContexto] = useState('')
  const [objetivos, setObjetivos] = useState('')
  const [descricaoDoc, setDescricaoDoc] = useState('')

  useEffect(() => {
    if (!isAuthenticated) return
    loadData()
  }, [isAuthenticated])

  const loadData = async () => {
    const { data: usersData } = await supabase
      .from('perfis_usuarios')
      .select('*')
      .eq('status', 'pendente')
    if (usersData) setPendingUsers(usersData)

    const { data: groupsData } = await supabase.from('grupo_acesso').select('*')
    if (groupsData) setGroups(groupsData)

    const { data: docsData } = await supabase
      .from('documentos_publicos')
      .select('*')
      .order('criado_em', { ascending: false })
    if (docsData) setDocuments(docsData)

    const { data: contData } = await supabase.from('conteudo_estudo').select('*')
    if (contData) {
      const ctx = contData.find((c) => c.secao === 'contexto')
      const obj = contData.find((c) => c.secao === 'objetivos')
      if (ctx) setContexto(ctx.conteudo_html || '')
      if (obj) setObjetivos(obj.conteudo_html || '')
    }
  }

  const approveUser = async (id: string, id_ga: number) => {
    if (!id_ga) return toast({ title: 'Selecione um grupo', variant: 'destructive' })
    await supabase.from('perfis_usuarios').update({ status: 'aprovado', id_ga }).eq('id', id)
    toast({ title: 'Usuário aprovado' })
    loadData()
  }

  const saveContent = async (secao: string, conteudo_html: string) => {
    const sanitized = sanitizeHtml(conteudo_html)
    const { data } = await supabase
      .from('conteudo_estudo')
      .select('id')
      .eq('secao', secao)
      .maybeSingle()
    if (data?.id) {
      await supabase.from('conteudo_estudo').update({ conteudo_html: sanitized }).eq('id', data.id)
    } else {
      await supabase.from('conteudo_estudo').insert({ secao, conteudo_html: sanitized })
    }
    toast({ title: 'Conteúdo salvo' })
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
          {isAdmin && <TabsTrigger value="usuarios">Aprovação de Usuários</TabsTrigger>}
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
              <Card>
                <CardHeader>
                  <CardTitle>Usuários Pendentes</CardTitle>
                  <CardDescription>
                    Aprove os usuários e defina seus grupos de acesso.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-auto max-h-[400px]">
                    <Table>
                      <TableHeader>
                        <TableRow>
                          <TableHead>Nome</TableHead>
                          <TableHead>E-mail</TableHead>
                          <TableHead>Organização</TableHead>
                          <TableHead>Grupo</TableHead>
                          <TableHead>Ação</TableHead>
                        </TableRow>
                      </TableHeader>
                      <TableBody>
                        {pendingUsers.map((u) => (
                          <TableRow key={u.id}>
                            <TableCell>{u.nome}</TableCell>
                            <TableCell>{u.email}</TableCell>
                            <TableCell>{u.organizacao}</TableCell>
                            <TableCell>
                              <Select
                                onValueChange={(val) => {
                                  u.selectedGa = parseInt(val)
                                }}
                              >
                                <SelectTrigger>
                                  <SelectValue placeholder="Selecione..." />
                                </SelectTrigger>
                                <SelectContent>
                                  {groups.map((g) => (
                                    <SelectItem key={g.id_ga} value={g.id_ga.toString()}>
                                      {g.nome_grupo}
                                    </SelectItem>
                                  ))}
                                </SelectContent>
                              </Select>
                            </TableCell>
                            <TableCell>
                              <Button size="sm" onClick={() => approveUser(u.id, u.selectedGa)}>
                                Aprovar
                              </Button>
                            </TableCell>
                          </TableRow>
                        ))}
                        {pendingUsers.length === 0 && (
                          <TableRow>
                            <TableCell colSpan={5} className="text-center">
                              Nenhum usuário pendente.
                            </TableCell>
                          </TableRow>
                        )}
                      </TableBody>
                    </Table>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="conteudo">
              <Card>
                <CardHeader>
                  <CardTitle>Gestão de Conteúdo</CardTitle>
                  <CardDescription>
                    Edite os textos exibidos na Área de Estudo.
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Accordion type="single" collapsible className="w-full">
                    <AccordionItem value="contexto">
                      <AccordionTrigger className="text-lg">
                        Contexto (Área de Estudo)
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 border-t space-y-4">
                        <RichTextEditor
                          value={contexto}
                          onChange={setContexto}
                          placeholder="Escreva o conteúdo de Contexto..."
                        />
                        <Button onClick={() => saveContent('contexto', contexto)}>
                          Salvar Contexto
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                    <AccordionItem value="objetivos">
                      <AccordionTrigger className="text-lg">
                        Objetivos (Área de Estudo)
                      </AccordionTrigger>
                      <AccordionContent className="pt-4 border-t space-y-4">
                        <RichTextEditor
                          value={objetivos}
                          onChange={setObjetivos}
                          placeholder="Escreva o conteúdo de Objetivos..."
                        />
                        <Button onClick={() => saveContent('objetivos', objetivos)}>
                          Salvar Objetivos
                        </Button>
                      </AccordionContent>
                    </AccordionItem>
                  </Accordion>
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
