import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'

export function Artigos() {
  const [artigos, setArtigos] = useState<any[]>([])
  const [projetos, setProjetos] = useState<any[]>([])
  const [tipos, setTipos] = useState<any[]>([])
  const [colaboradores, setColaboradores] = useState<any[]>([])

  const [titulo, setTitulo] = useState('')
  const [idProjeto, setIdProjeto] = useState('')
  const [idTipo, setIdTipo] = useState('')
  const [resumo, setResumo] = useState('')
  const [doi, setDoi] = useState('')

  const [selectedArtigo, setSelectedArtigo] = useState<any>(null)
  const [autores, setAutores] = useState<any[]>([])
  const [idAutor, setIdAutor] = useState('')
  const [isPrincipal, setIsPrincipal] = useState(false)

  const [novoTipo, setNovoTipo] = useState('')

  const { toast } = useToast()

  useEffect(() => {
    loadArtigos()
    loadProjetos()
    loadTipos()
    loadColabs()
  }, [])

  const loadArtigos = async () => {
    const { data } = await supabase
      .from('artigos')
      .select('*, tipo:tipo_artigo(descricao), projeto:projetos_wps(titulo)')
    if (data) setArtigos(data)
  }

  const loadProjetos = async () => {
    const { data } = await supabase.from('projetos_wps').select('id_projeto, titulo')
    if (data) setProjetos(data)
  }

  const loadTipos = async () => {
    const { data } = await supabase.from('tipo_artigo').select('*')
    if (data) setTipos(data)
  }

  const loadColabs = async () => {
    const { data } = await supabase.from('colaboradores').select('*')
    if (data) setColaboradores(data)
  }

  const saveTipo = async () => {
    if (!novoTipo) return
    await supabase.from('tipo_artigo').insert([{ descricao: novoTipo }])
    setNovoTipo('')
    loadTipos()
    toast({ title: 'Tipo de artigo adicionado' })
  }

  const removeTipo = async (id: number) => {
    await supabase.from('tipo_artigo').delete().eq('id_tipo', id)
    loadTipos()
  }

  const saveArtigo = async () => {
    if (!titulo)
      return toast({
        title: 'Aviso',
        description: 'O título é obrigatório',
        variant: 'destructive',
      })
    const { error } = await supabase.from('artigos').insert([
      {
        titulo,
        id_projeto: idProjeto ? parseInt(idProjeto) : null,
        id_tipo_artigo: idTipo ? parseInt(idTipo) : null,
        resumo,
        doi,
      },
    ])
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    else {
      toast({ title: 'Artigo salvo com sucesso' })
      setTitulo('')
      setIdProjeto('')
      setIdTipo('')
      setResumo('')
      setDoi('')
      loadArtigos()
    }
  }

  const removeArtigo = async (id: number) => {
    await supabase.from('artigos').delete().eq('id_artigo', id)
    if (selectedArtigo?.id_artigo === id) setSelectedArtigo(null)
    loadArtigos()
  }

  const loadAutores = async (artigoId: number) => {
    const { data } = await supabase
      .from('artigos_autores')
      .select('*, autor:colaboradores(*)')
      .eq('id_artigo', artigoId)
    if (data) setAutores(data)
  }

  useEffect(() => {
    if (selectedArtigo) loadAutores(selectedArtigo.id_artigo)
  }, [selectedArtigo])

  const addAutor = async () => {
    if (!selectedArtigo || !idAutor)
      return toast({ title: 'Aviso', description: 'Selecione um autor', variant: 'destructive' })
    await supabase.from('artigos_autores').insert([
      {
        id_artigo: selectedArtigo.id_artigo,
        id_autor: parseInt(idAutor),
        is_principal: isPrincipal,
      },
    ])
    setIdAutor('')
    setIsPrincipal(false)
    loadAutores(selectedArtigo.id_artigo)
  }

  const removeAutor = async (id: number) => {
    await supabase.from('artigos_autores').delete().eq('id_artigo_autor', id)
    if (selectedArtigo) loadAutores(selectedArtigo.id_artigo)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-6">
        <div>
          <h3 className="font-semibold text-lg border-b pb-2 mb-4">
            Gerenciar Artigos e Publicações
          </h3>
          <div className="space-y-3">
            <div className="space-y-1">
              <label className="text-sm font-medium">Título da Publicação</label>
              <Input
                placeholder="Título completo..."
                value={titulo}
                onChange={(e) => setTitulo(e.target.value)}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-1">
                <label className="text-sm font-medium">Projeto Relacionado</label>
                <Select value={idProjeto} onValueChange={setIdProjeto}>
                  <SelectTrigger>
                    <SelectValue placeholder="Vincular a Projeto" />
                  </SelectTrigger>
                  <SelectContent>
                    {projetos.map((p) => (
                      <SelectItem key={p.id_projeto} value={p.id_projeto.toString()}>
                        {p.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Tipo</label>
                <Select value={idTipo} onValueChange={setIdTipo}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione..." />
                  </SelectTrigger>
                  <SelectContent>
                    {tipos.map((t) => (
                      <SelectItem key={t.id_tipo} value={t.id_tipo.toString()}>
                        {t.descricao}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">DOI / Link de Acesso</label>
              <Input
                placeholder="URL ou DOI..."
                value={doi}
                onChange={(e) => setDoi(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <label className="text-sm font-medium">Resumo / Abstract</label>
              <Textarea
                placeholder="Resumo do artigo..."
                value={resumo}
                onChange={(e) => setResumo(e.target.value)}
              />
            </div>

            <Button onClick={saveArtigo} className="w-full">
              Cadastrar Artigo
            </Button>
          </div>
        </div>

        <div className="border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead className="w-[120px]">Tipo</TableHead>
                <TableHead className="w-[80px]">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artigos.map((a) => (
                <TableRow
                  key={a.id_artigo}
                  className={`cursor-pointer transition-colors ${selectedArtigo?.id_artigo === a.id_artigo ? 'bg-secondary' : 'hover:bg-muted/50'}`}
                  onClick={() => setSelectedArtigo(a)}
                >
                  <TableCell className="font-medium">{a.titulo}</TableCell>
                  <TableCell>{a.tipo?.descricao || '-'}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeArtigo(a.id_artigo)
                      }}
                    >
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
              {artigos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                    Nenhum artigo cadastrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>

        <div className="bg-muted/30 p-4 rounded-md border space-y-3">
          <h4 className="font-semibold text-sm">Gerenciar Tipos de Publicação</h4>
          <div className="flex gap-2">
            <Input
              placeholder="Novo tipo (ex: Anais de Congresso)..."
              value={novoTipo}
              onChange={(e) => setNovoTipo(e.target.value)}
            />
            <Button onClick={saveTipo} variant="secondary">
              Adicionar
            </Button>
          </div>
          <div className="flex flex-wrap gap-2 pt-2">
            {tipos.map((t) => (
              <div
                key={t.id_tipo}
                className="bg-background border px-3 py-1 rounded-full flex items-center gap-2 text-sm shadow-sm"
              >
                {t.descricao}
                <button
                  onClick={() => removeTipo(t.id_tipo)}
                  className="text-destructive hover:text-destructive/80"
                >
                  &times;
                </button>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="space-y-4 md:border-l md:pl-8">
        <h3 className="font-semibold text-lg border-b pb-2">
          Autores do Artigo:{' '}
          <span className="text-primary">
            {selectedArtigo ? selectedArtigo.titulo : 'Nenhum selecionado'}
          </span>
        </h3>

        {selectedArtigo ? (
          <>
            <div className="flex items-end gap-3 bg-muted/30 p-4 rounded-md border">
              <div className="flex-1 space-y-1">
                <label className="text-sm font-medium">Selecione o Colaborador</label>
                <Select value={idAutor} onValueChange={setIdAutor}>
                  <SelectTrigger>
                    <SelectValue placeholder="Procurar autor..." />
                  </SelectTrigger>
                  <SelectContent>
                    {colaboradores
                      .filter((c) => !autores.find((a) => a.id_autor === c.id_colaborador))
                      .map((c) => (
                        <SelectItem key={c.id_colaborador} value={c.id_colaborador.toString()}>
                          {c.nome}
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <Switch id="is-principal" checked={isPrincipal} onCheckedChange={setIsPrincipal} />
                <Label htmlFor="is-principal">Autor Principal</Label>
              </div>
              <Button onClick={addAutor}>Vincular</Button>
            </div>

            <div className="border rounded-md mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-[100px]">Principal?</TableHead>
                    <TableHead className="w-[100px]">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {autores.map((a) => (
                    <TableRow key={a.id_artigo_autor}>
                      <TableCell className="font-medium">{a.autor?.nome}</TableCell>
                      <TableCell>{a.is_principal ? 'Sim' : 'Não'}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeAutor(a.id_artigo_autor)}
                        >
                          Remover
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {autores.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                        Nenhum autor vinculado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-48 bg-muted/20 border border-dashed rounded-md">
            <p className="text-muted-foreground">Selecione um artigo para vincular autores.</p>
          </div>
        )}
      </div>
    </div>
  )
}
