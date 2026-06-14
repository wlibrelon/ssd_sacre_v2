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

export function Projetos() {
  const [wps, setWps] = useState<any[]>([])
  const [projetos, setProjetos] = useState<any[]>([])
  const [colaboradores, setColaboradores] = useState<any[]>([])

  const [idWp, setIdWp] = useState('')
  const [titulo, setTitulo] = useState('')
  const [idAutor, setIdAutor] = useState('')
  const [resumo, setResumo] = useState('')
  const [objetivos, setObjetivos] = useState('')

  const [selectedProj, setSelectedProj] = useState<any>(null)
  const [arqResultados, setArqResultados] = useState<any[]>([])
  const [arqDescricao, setArqDescricao] = useState('')
  const [arqNome, setArqNome] = useState('')
  const [filterWp, setFilterWp] = useState('all')

  const { toast } = useToast()

  useEffect(() => {
    loadWps()
    loadColabs()
    loadProjetos()
  }, [])

  const loadWps = async () => {
    const { data } = await supabase.from('wps').select('*').order('wp')
    if (data) setWps(data)
  }

  const loadColabs = async () => {
    const { data } = await supabase.from('colaboradores').select('*').order('nome')
    if (data) setColaboradores(data)
  }

  const loadProjetos = async () => {
    const { data } = await supabase
      .from('projetos_wps')
      .select('*, wp:wps(wp, titulo), autor:colaboradores(nome)')
    if (data) setProjetos(data)
  }

  const saveProjeto = async () => {
    if (!titulo || !idWp)
      return toast({
        title: 'Aviso',
        description: 'Selecione um WP e informe o Título',
        variant: 'destructive',
      })
    const { error } = await supabase.from('projetos_wps').insert([
      {
        id_wp: parseInt(idWp),
        titulo,
        id_autor: idAutor ? parseInt(idAutor) : null,
        resumo,
        objetivos,
      },
    ])
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    else {
      toast({ title: 'Projeto salvo com sucesso' })
      setTitulo('')
      setIdWp('')
      setIdAutor('')
      setResumo('')
      setObjetivos('')
      loadProjetos()
    }
  }

  const removeProjeto = async (id: number) => {
    await supabase.from('projetos_wps').delete().eq('id_projeto', id)
    if (selectedProj?.id_projeto === id) setSelectedProj(null)
    loadProjetos()
  }

  const loadArqResultados = async (projId: number) => {
    const { data } = await supabase.from('arq_resultados').select('*').eq('id_projeto', projId)
    if (data) setArqResultados(data)
  }

  useEffect(() => {
    if (selectedProj) loadArqResultados(selectedProj.id_projeto)
  }, [selectedProj])

  const saveArq = async () => {
    if (!selectedProj || !arqNome)
      return toast({
        title: 'Aviso',
        description: 'Informe o nome/link do arquivo',
        variant: 'destructive',
      })
    await supabase.from('arq_resultados').insert([
      {
        id_projeto: selectedProj.id_projeto,
        descricao: arqDescricao,
        nome_arq: arqNome,
      },
    ])
    setArqDescricao('')
    setArqNome('')
    toast({ title: 'Resultado adicionado' })
    loadArqResultados(selectedProj.id_projeto)
  }

  const removeArq = async (id: number) => {
    await supabase.from('arq_resultados').delete().eq('id_arq_res', id)
    if (selectedProj) loadArqResultados(selectedProj.id_projeto)
  }

  const filteredProjetos =
    filterWp === 'all' ? projetos : projetos.filter((p) => p.id_wp?.toString() === filterWp)

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Gerenciar Projetos</h3>

        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-sm font-medium">Vincular ao Work Package</label>
            <Select value={idWp} onValueChange={setIdWp}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o WP" />
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
          <div className="space-y-1">
            <label className="text-sm font-medium">Título do Projeto</label>
            <Input
              placeholder="Título"
              value={titulo}
              onChange={(e) => setTitulo(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Autor / Responsável Principal</label>
            <Select value={idAutor} onValueChange={setIdAutor}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o Autor Principal" />
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
          <div className="space-y-1">
            <label className="text-sm font-medium">Resumo</label>
            <Textarea
              placeholder="Breve resumo..."
              value={resumo}
              onChange={(e) => setResumo(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Objetivos</label>
            <Textarea
              placeholder="Principais objetivos..."
              value={objetivos}
              onChange={(e) => setObjetivos(e.target.value)}
            />
          </div>
          <Button onClick={saveProjeto} className="w-full">
            Adicionar Projeto
          </Button>
        </div>

        <div className="mt-8 pt-4">
          <div className="flex items-center justify-between mb-4 border-b pb-2">
            <h4 className="font-semibold text-lg">Lista de Projetos</h4>
            <Select value={filterWp} onValueChange={setFilterWp}>
              <SelectTrigger className="w-[180px]">
                <SelectValue placeholder="Filtrar por WP" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os WPs</SelectItem>
                {wps.map((w) => (
                  <SelectItem key={w.id_wp} value={w.id_wp.toString()}>
                    WP {w.wp}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead className="w-[80px]">WP</TableHead>
                  <TableHead>Título do Projeto</TableHead>
                  <TableHead className="w-[80px]">Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredProjetos.map((p) => (
                  <TableRow
                    key={p.id_projeto}
                    className={`cursor-pointer transition-colors ${selectedProj?.id_projeto === p.id_projeto ? 'bg-secondary' : 'hover:bg-muted/50'}`}
                    onClick={() => setSelectedProj(p)}
                  >
                    <TableCell className="font-medium whitespace-nowrap">WP {p.wp?.wp}</TableCell>
                    <TableCell>{p.titulo}</TableCell>
                    <TableCell>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          removeProjeto(p.id_projeto)
                        }}
                      >
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {filteredProjetos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                      Nenhum projeto encontrado.
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      </div>

      <div className="space-y-4 md:border-l md:pl-8">
        <h3 className="font-semibold text-lg border-b pb-2">
          Arquivos de Resultados:{' '}
          <span className="text-primary">
            {selectedProj ? selectedProj.titulo : 'Nenhum selecionado'}
          </span>
        </h3>

        {selectedProj ? (
          <>
            <div className="space-y-3 bg-muted/30 p-4 rounded-md border">
              <div className="space-y-1">
                <label className="text-sm font-medium">Nome do Arquivo / URL</label>
                <Input
                  placeholder="URL ou nome identificador..."
                  value={arqNome}
                  onChange={(e) => setArqNome(e.target.value)}
                />
              </div>
              <div className="space-y-1">
                <label className="text-sm font-medium">Descrição Opcional</label>
                <Input
                  placeholder="Descreva este resultado..."
                  value={arqDescricao}
                  onChange={(e) => setArqDescricao(e.target.value)}
                />
              </div>
              <Button onClick={saveArq} className="w-full">
                Adicionar Arquivo de Resultado
              </Button>
            </div>

            <div className="border rounded-md mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Arquivo</TableHead>
                    <TableHead>Descrição</TableHead>
                    <TableHead className="w-[100px]">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {arqResultados.map((a) => (
                    <TableRow key={a.id_arq_res}>
                      <TableCell className="font-medium">{a.nome_arq}</TableCell>
                      <TableCell>{a.descricao}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeArq(a.id_arq_res)}
                        >
                          Remover
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {arqResultados.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={3} className="text-center py-4 text-muted-foreground">
                        Nenhum resultado anexado.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-48 bg-muted/20 border border-dashed rounded-md">
            <p className="text-muted-foreground">
              Selecione um projeto para gerenciar seus resultados.
            </p>
          </div>
        )}
      </div>
    </div>
  )
}
