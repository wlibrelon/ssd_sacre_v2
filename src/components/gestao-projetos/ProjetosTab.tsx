import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { useToast } from '@/hooks/use-toast'
import { Textarea } from '@/components/ui/textarea'
import {
  Select,
  SelectTrigger,
  SelectValue,
  SelectContent,
  SelectItem,
} from '@/components/ui/select'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Trash, Plus } from 'lucide-react'

export function ProjetosTab() {
  const [wps, setWps] = useState<any[]>([])
  const [colaboradores, setColaboradores] = useState<any[]>([])
  const [filterWp, setFilterWp] = useState<string>('all')
  const [projetos, setProjetos] = useState<any[]>([])
  const [selectedProjeto, setSelectedProjeto] = useState<any>(null)

  const [form, setForm] = useState({
    id_wp: '',
    titulo: '',
    id_autor: '',
    resumo: '',
    objetivos: '',
  })
  const [arqDescricao, setArqDescricao] = useState('')
  const [arqNome, setArqNome] = useState('')
  const [arquivos, setArquivos] = useState<any[]>([])

  const { toast } = useToast()

  const loadBase = async () => {
    const { data: w } = await supabase.from('wps').select('*').order('wp')
    if (w) setWps(w)
    const { data: c } = await supabase.from('colaboradores').select('*').order('nome')
    if (c) setColaboradores(c)
  }

  const loadProjetos = async () => {
    let q = supabase.from('projetos_wps').select('*').order('titulo')
    if (filterWp !== 'all') q = q.eq('id_wp', parseInt(filterWp))
    const { data } = await q
    if (data) setProjetos(data)
  }

  useEffect(() => {
    loadBase()
  }, [])
  useEffect(() => {
    loadProjetos()
    handleNewProjeto()
  }, [filterWp])

  const loadArquivos = async (idProj: number) => {
    const { data } = await supabase.from('arq_resultados').select('*').eq('id_projeto', idProj)
    if (data) setArquivos(data)
  }

  const handleSelectProjeto = (p: any) => {
    setSelectedProjeto(p)
    setForm({
      id_wp: p.id_wp?.toString() || '',
      titulo: p.titulo || '',
      id_autor: p.id_autor?.toString() || '',
      resumo: p.resumo || '',
      objetivos: p.objetivos || '',
    })
    loadArquivos(p.id_projeto)
  }

  const handleNewProjeto = () => {
    setSelectedProjeto(null)
    setForm({
      id_wp: filterWp !== 'all' ? filterWp : '',
      titulo: '',
      id_autor: '',
      resumo: '',
      objetivos: '',
    })
    setArquivos([])
  }

  const handleSaveProjeto = async () => {
    if (!form.titulo) return toast({ title: 'Título obrigatório', variant: 'destructive' })
    const payload = {
      id_wp: form.id_wp ? parseInt(form.id_wp) : null,
      titulo: form.titulo,
      id_autor: form.id_autor ? parseInt(form.id_autor) : null,
      resumo: form.resumo,
      objetivos: form.objetivos,
    }

    if (selectedProjeto) {
      const { error } = await supabase
        .from('projetos_wps')
        .update(payload)
        .eq('id_projeto', selectedProjeto.id_projeto)
      if (error) return toast({ title: 'Erro', description: error.message, variant: 'destructive' })
      toast({ title: 'Projeto atualizado' })
    } else {
      const { data, error } = await supabase.from('projetos_wps').insert(payload).select().single()
      if (error) return toast({ title: 'Erro', description: error.message, variant: 'destructive' })
      toast({ title: 'Projeto criado' })
      if (data) handleSelectProjeto(data)
    }
    loadProjetos()
  }

  const handleDeleteProjeto = async (id: number) => {
    if (!confirm('Excluir este projeto?')) return
    const { error } = await supabase.from('projetos_wps').delete().eq('id_projeto', id)
    if (error) return toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    toast({ title: 'Projeto removido' })
    if (selectedProjeto?.id_projeto === id) handleNewProjeto()
    loadProjetos()
  }

  const handleAddArquivo = async () => {
    if (!selectedProjeto) return
    if (!arqDescricao || !arqNome)
      return toast({ title: 'Preencha descrição e nome do arquivo', variant: 'destructive' })

    const { error } = await supabase.from('arq_resultados').insert({
      id_projeto: selectedProjeto.id_projeto,
      descricao: arqDescricao,
      nome_arq: arqNome,
    })
    if (error) return toast({ title: 'Erro', description: error.message, variant: 'destructive' })

    setArqDescricao('')
    setArqNome('')
    loadArquivos(selectedProjeto.id_projeto)
  }

  const handleDeleteArquivo = async (id: number) => {
    const { error } = await supabase.from('arq_resultados').delete().eq('id_arq_res', id)
    if (error) return toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    if (selectedProjeto) loadArquivos(selectedProjeto.id_projeto)
  }

  return (
    <div className="grid md:grid-cols-[350px_1fr] gap-6">
      <div className="space-y-4 border-r pr-4">
        <div className="space-y-2 bg-muted/20 p-3 rounded-md border">
          <Label className="text-muted-foreground">Filtrar por WP</Label>
          <Select value={filterWp} onValueChange={setFilterWp}>
            <SelectTrigger className="bg-background">
              <SelectValue placeholder="Todos os WPs" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os WPs</SelectItem>
              {wps.map((w) => (
                <SelectItem key={w.id_wp} value={w.id_wp.toString()}>
                  WP {w.wp} - {w.titulo}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex justify-between items-center pt-2">
          <h3 className="font-semibold text-lg">Projetos</h3>
          <Button variant="outline" size="sm" onClick={handleNewProjeto}>
            <Plus className="w-4 h-4 mr-1" /> Novo
          </Button>
        </div>

        <ScrollArea className="h-[500px]">
          <div className="space-y-2">
            {projetos.map((p) => (
              <div
                key={p.id_projeto}
                className={`p-3 border rounded-md cursor-pointer transition-colors flex justify-between items-center ${selectedProjeto?.id_projeto === p.id_projeto ? 'bg-primary/5 border-primary/20' : 'hover:bg-muted/50'}`}
                onClick={() => handleSelectProjeto(p)}
              >
                <div className="line-clamp-2 text-sm font-medium leading-tight">{p.titulo}</div>
                <Button
                  variant="ghost"
                  size="icon"
                  className="text-red-500 shrink-0 ml-2 h-8 w-8"
                  onClick={(e) => {
                    e.stopPropagation()
                    handleDeleteProjeto(p.id_projeto)
                  }}
                >
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            ))}
            {projetos.length === 0 && (
              <div className="text-sm text-muted-foreground text-center py-8">
                Nenhum projeto encontrado.
              </div>
            )}
          </div>
        </ScrollArea>
      </div>

      <div className="space-y-8">
        <div className="space-y-4">
          <h3 className="font-semibold text-xl">
            {selectedProjeto ? 'Editar Projeto' : 'Novo Projeto'}
          </h3>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Work Package</Label>
              <Select value={form.id_wp} onValueChange={(v) => setForm({ ...form, id_wp: v })}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o WP..." />
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
              <Label>Autor / Responsável</Label>
              <Select
                value={form.id_autor}
                onValueChange={(v) => setForm({ ...form, id_autor: v })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione o Autor..." />
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
          </div>

          <div className="space-y-2">
            <Label>Título do Projeto</Label>
            <Input
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Resumo</Label>
            <Textarea
              rows={3}
              value={form.resumo}
              onChange={(e) => setForm({ ...form, resumo: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label>Objetivos</Label>
            <Textarea
              rows={3}
              value={form.objetivos}
              onChange={(e) => setForm({ ...form, objetivos: e.target.value })}
            />
          </div>

          <Button onClick={handleSaveProjeto} size="lg">
            Salvar Projeto
          </Button>
        </div>

        {selectedProjeto && (
          <div className="border-t pt-6 space-y-4">
            <h4 className="font-semibold text-lg">Arquivos de Resultados</h4>
            <div className="bg-muted/10 border rounded-lg p-4 space-y-4">
              <div className="flex flex-col md:flex-row gap-3 items-end">
                <div className="flex-1 space-y-2 w-full">
                  <Label>Descrição do Arquivo</Label>
                  <Input
                    value={arqDescricao}
                    onChange={(e) => setArqDescricao(e.target.value)}
                    placeholder="Ex: Tabela de dados brutos"
                  />
                </div>
                <div className="flex-1 space-y-2 w-full">
                  <Label>Nome do Arquivo (Físico/URL)</Label>
                  <Input
                    value={arqNome}
                    onChange={(e) => setArqNome(e.target.value)}
                    placeholder="Ex: dados_2025.csv"
                  />
                </div>
                <Button onClick={handleAddArquivo} variant="secondary" className="w-full md:w-auto">
                  <Plus className="w-4 h-4 mr-2" /> Adicionar
                </Button>
              </div>

              <div className="bg-background rounded-md border mt-2">
                {arquivos.length === 0 && (
                  <p className="text-sm text-muted-foreground p-4 text-center">
                    Nenhum arquivo de resultado associado a este projeto.
                  </p>
                )}
                {arquivos.map((a, i) => (
                  <div
                    key={a.id_arq_res}
                    className={`flex justify-between items-center p-3 ${i !== arquivos.length - 1 ? 'border-b' : ''}`}
                  >
                    <div>
                      <div className="font-semibold text-sm text-primary">{a.nome_arq}</div>
                      <div className="text-xs text-muted-foreground mt-0.5">{a.descricao}</div>
                    </div>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteArquivo(a.id_arq_res)}
                    >
                      <Trash className="w-4 h-4 text-red-500" />
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
