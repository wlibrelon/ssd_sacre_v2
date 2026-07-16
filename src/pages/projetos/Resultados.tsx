import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import {
  Check,
  ChevronsUpDown,
  Loader2,
  Target,
  FileBox,
  Eye,
  Image as ImageIcon,
  FileText as FileIcon,
  TableIcon,
  BarChart3,
  ArrowLeft,
} from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { ConstrutorConsulta } from './components/ConstrutorConsulta'

export default function Resultados() {
  const [wps, setWps] = useState<any[]>([])
  const [selectedWpId, setSelectedWpId] = useState<number | null>(null)
  const [open, setOpen] = useState(false)
  const [loading, setLoading] = useState(true)

  const [projetos, setProjetos] = useState<any[]>([])
  const [projetoSelecionado, setProjetoSelecionado] = useState<any>(null)

  const [results, setResults] = useState<any[]>([])
  const [tabelasDados, setTabelasDados] = useState<any[]>([])
  const [loadingProjeto, setLoadingProjeto] = useState(false)

  const [tabelaAberta, setTabelaAberta] = useState<any>(null)

  useEffect(() => {
    const fetchInitialData = async () => {
      const { data: wpsData } = await supabase
        .from('wps')
        .select('*, colaboradores(nome)')
        .order('wp')

      if (wpsData) setWps(wpsData)
      setLoading(false)
    }
    fetchInitialData()
  }, [])

  useEffect(() => {
    setProjetoSelecionado(null)
    setResults([])
    setTabelasDados([])

    if (!selectedWpId) {
      setProjetos([])
      return
    }

    const fetchProjetos = async () => {
      setLoading(true)
      const { data } = await supabase
        .from('projetos_wps')
        .select('*')
        .eq('id_wp', selectedWpId)
      setProjetos(data || [])
      setLoading(false)
    }
    fetchProjetos()
  }, [selectedWpId])

  useEffect(() => {
    if (!projetoSelecionado) return

    const fetchProjetoData = async () => {
      setLoadingProjeto(true)
      const [{ data: resData }, { data: tabelasData }] = await Promise.all([
        supabase
          .from('arq_resultados')
          .select('*')
          .eq('id_projeto', projetoSelecionado.id_projeto),
        supabase
          .from('resultado_tabela')
          .select('*')
          .eq('id_projeto', projetoSelecionado.id_projeto)
          .eq('status', 'publicado')
          .order('criado_em', { ascending: false }),
      ])
      setResults(resData || [])
      setTabelasDados(tabelasData || [])
      setLoadingProjeto(false)
    }
    fetchProjetoData()
  }, [projetoSelecionado])

  const handleOpenResult = async (fileName: string) => {
    const { data } = supabase.storage.from('arquivos_resultados').getPublicUrl(fileName)
    window.open(data.publicUrl, '_blank', 'noopener,noreferrer')
  }

  const getFileIcon = (fileName: string) => {
    if (!fileName) return <FileBox className="h-8 w-8 text-muted-foreground" />
    const ext = fileName.split('.').pop()?.toLowerCase()
    if (['jpg', 'jpeg', 'png', 'gif', 'svg', 'webp'].includes(ext || '')) {
      return <ImageIcon className="h-8 w-8 text-blue-500" />
    }
    if (ext === 'pdf') {
      return <FileIcon className="h-8 w-8 text-red-500" />
    }
    return <FileBox className="h-8 w-8 text-muted-foreground" />
  }

  return (
    <div className="container max-w-6xl mx-auto py-8 space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Resultados dos Projetos</h1>
        <p className="text-muted-foreground mt-2">
          Selecione um Work Package (WP), depois um projeto, para ver documentos, imagens e
          tabelas de dados vinculados a ele.
        </p>
      </div>

      <div className="flex items-center space-x-4">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button
              variant="outline"
              role="combobox"
              aria-expanded={open}
              className="w-full justify-between"
            >
              {selectedWpId
                ? (() => {
                    const wp = wps.find((w) => w.id_wp === selectedWpId)
                    return wp ? `WP-${wp.wp} - ${wp.titulo}` : 'WP selecionado'
                  })()
                : 'Selecione um WP...'}
              <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-full p-0">
            <Command>
              <CommandInput placeholder="Buscar WP..." />
              <CommandList>
                <CommandEmpty>Nenhum WP encontrado.</CommandEmpty>
                <CommandGroup>
                  {wps.map((wp) => (
                    <CommandItem
                      key={wp.id_wp}
                      value={`WP-${wp.wp} - ${wp.titulo || ''}`}
                      onSelect={() => {
                        setSelectedWpId(wp.id_wp === selectedWpId ? null : wp.id_wp)
                        setOpen(false)
                      }}
                    >
                      <Check
                        className={cn(
                          'mr-2 h-4 w-4 shrink-0',
                          selectedWpId === wp.id_wp ? 'opacity-100' : 'opacity-0',
                        )}
                      />
                      <span className="truncate">
                        WP-{wp.wp} - {wp.titulo}
                      </span>
                    </CommandItem>
                  ))}
                </CommandGroup>
              </CommandList>
            </Command>
          </PopoverContent>
        </Popover>
      </div>

      {loading ? (
        <div className="flex justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin text-primary" />
        </div>
      ) : !selectedWpId ? (
        <div className="flex flex-col items-center justify-center py-20 text-center animate-fade-in">
          <div className="bg-muted/50 p-6 rounded-full mb-6">
            <FileBox className="h-12 w-12 text-muted-foreground/50" />
          </div>
          <h3 className="text-xl font-semibold mb-2">Nenhum WP Selecionado</h3>
          <p className="text-muted-foreground max-w-md">
            Utilize o seletor acima para escolher um Work Package.
          </p>
        </div>
      ) : !projetoSelecionado ? (
        // ── Passo 2: escolher o projeto dentro do WP ──
        <div className="space-y-4 animate-fade-in-up">
          <h2 className="text-xl font-semibold flex items-center gap-2">
            <Target className="h-5 w-5 text-primary" /> Projetos deste WP
          </h2>
          {projetos.length === 0 ? (
            <p className="text-muted-foreground">Nenhum projeto cadastrado para este WP.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {projetos.map((p) => (
                <Card
                  key={p.id_projeto}
                  className="cursor-pointer hover:shadow-md transition-shadow hover:border-primary/40"
                  onClick={() => setProjetoSelecionado(p)}
                >
                  <CardHeader>
                    <CardTitle className="text-lg">{p.titulo}</CardTitle>
                    {p.resumo && (
                      <CardDescription className="line-clamp-3">{p.resumo}</CardDescription>
                    )}
                  </CardHeader>
                </Card>
              ))}
            </div>
          )}
        </div>
      ) : (
        // ── Passo 3: resultados do projeto selecionado ──
        <div className="space-y-6 animate-fade-in-up">
          <Button variant="ghost" size="sm" onClick={() => setProjetoSelecionado(null)}>
            <ArrowLeft className="h-4 w-4 mr-2" /> Voltar aos projetos
          </Button>

          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5 text-primary" />
                {projetoSelecionado.titulo}
              </CardTitle>
              <CardDescription className="text-base text-foreground">
                {projetoSelecionado.resumo || 'Sem descrição disponível.'}
              </CardDescription>
            </CardHeader>
          </Card>

          {projetoSelecionado.objetivos && (
            <Card>
              <CardHeader>
                <CardTitle className="text-base">Objetivo do Projeto</CardTitle>
                <CardDescription className="text-foreground whitespace-pre-line">
                  {projetoSelecionado.objetivos}
                </CardDescription>
              </CardHeader>
            </Card>
          )}

          {loadingProjeto ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-primary" />
            </div>
          ) : (
            <Tabs defaultValue="documentos" className="w-full">
              <TabsList>
                <TabsTrigger value="documentos">Documentos e Imagens</TabsTrigger>
                <TabsTrigger value="dados">Tabelas de Dados</TabsTrigger>
              </TabsList>

              <TabsContent value="documentos" className="mt-4">
                {results.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {results.map((resultado) => (
                      <Card
                        key={resultado.id_arq_res}
                        className="hover:shadow-md transition-shadow group"
                      >
                        <CardContent className="p-6 flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1 bg-muted p-3 rounded-xl group-hover:bg-primary/10 transition-colors">
                            {getFileIcon(resultado.nome_arq)}
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col h-full">
                            <div className="mb-4">
                              <h3 className="font-medium text-lg leading-tight mb-2">
                                {resultado.descricao || 'Documento de Resultado'}
                              </h3>
                              {resultado.nome_arq && (
                                <p
                                  className="text-sm text-muted-foreground truncate"
                                  title={resultado.nome_arq}
                                >
                                  Arquivo: {resultado.nome_arq.split('/').pop()}
                                </p>
                              )}
                            </div>
                            <div className="mt-auto">
                              <Button
                                variant="secondary"
                                size="sm"
                                className="w-full sm:w-auto hover:bg-primary hover:text-primary-foreground transition-colors"
                                onClick={() => handleOpenResult(resultado.nome_arq)}
                                disabled={!resultado.nome_arq}
                              >
                                <Eye className="w-4 h-4 mr-2" />
                                Exibir Resultado
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed bg-muted/20">
                    <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                      <FileBox className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-lg font-medium text-foreground">
                        Nenhum resultado encontrado
                      </p>
                      <p className="text-muted-foreground mt-1 max-w-sm">
                        Este projeto ainda não possui documentos ou imagens de resultados.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>

              <TabsContent value="dados" className="mt-4">
                {tabelasDados.length > 0 ? (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {tabelasDados.map((t) => (
                      <Card key={t.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6 flex items-start gap-4">
                          <div className="flex-shrink-0 mt-1 bg-muted p-3 rounded-xl">
                            <TableIcon className="h-8 w-8 text-primary" />
                          </div>
                          <div className="flex-1 min-w-0 flex flex-col h-full">
                            <div className="mb-4">
                              <h3 className="font-medium text-lg leading-tight mb-1">{t.titulo}</h3>
                              <p className="text-sm text-muted-foreground line-clamp-2">
                                {t.descricao_resumida}
                              </p>
                              {t.origem_pesquisa && (
                                <p className="text-xs text-primary mt-2">{t.origem_pesquisa}</p>
                              )}
                            </div>
                            <div className="mt-auto">
                              <Button size="sm" onClick={() => setTabelaAberta(t)}>
                                <BarChart3 className="w-4 h-4 mr-2" />
                                Analisar dados
                              </Button>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                ) : (
                  <Card className="border-dashed bg-muted/20">
                    <CardContent className="flex flex-col items-center justify-center h-48 text-center">
                      <TableIcon className="h-12 w-12 text-muted-foreground/50 mb-4" />
                      <p className="text-lg font-medium text-foreground">
                        Nenhuma tabela de dados publicada
                      </p>
                      <p className="text-muted-foreground mt-1 max-w-sm">
                        Este projeto ainda não possui tabelas de dados publicadas.
                      </p>
                    </CardContent>
                  </Card>
                )}
              </TabsContent>
            </Tabs>
          )}
        </div>
      )}

      {/* ── Construtor de consulta (abre por cima de tudo) ──
          Tamanho flexível: usuário pode arrastar o canto inferior direito
          pra aumentar/diminuir a janela (resize nativo do CSS), com um
          tamanho inicial generoso e limites mín/máx razoáveis. */}
      <Dialog open={!!tabelaAberta} onOpenChange={(o) => !o && setTabelaAberta(null)}>
        <DialogContent className="w-[92vw] max-w-[1400px] min-w-[600px] max-h-[85vh] overflow-y-auto resize">
          <DialogHeader>
            <DialogTitle>{tabelaAberta?.titulo}</DialogTitle>
            {tabelaAberta?.objetivo_resultado && (
              <p className="text-sm text-muted-foreground">{tabelaAberta.objetivo_resultado}</p>
            )}
            <p className="text-xs text-muted-foreground/70">
              Arraste o canto inferior direito da janela para redimensionar.
            </p>
          </DialogHeader>
          <div className="min-w-0">
            {tabelaAberta && <ConstrutorConsulta idTabela={tabelaAberta.id} />}
          </div>
        </DialogContent>
      </Dialog>
    </div>
  )
}
