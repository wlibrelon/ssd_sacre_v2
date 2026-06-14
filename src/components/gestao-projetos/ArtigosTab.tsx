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
import { Checkbox } from '@/components/ui/checkbox'
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from '@/components/ui/sheet'
import { Trash, Pencil, Plus } from 'lucide-react'

export function ArtigosTab() {
  const [artigos, setArtigos] = useState<any[]>([])
  const [tipos, setTipos] = useState<any[]>([])
  const [projetos, setProjetos] = useState<any[]>([])
  const [colaboradores, setColaboradores] = useState<any[]>([])

  const [isOpen, setIsOpen] = useState(false)
  const [selectedId, setSelectedId] = useState<number | null>(null)
  const [form, setForm] = useState({
    titulo: '',
    resumo: '',
    abstract: '',
    doi: '',
    arquivo: '',
    id_tipo_artigo: '',
    id_projeto: '',
  })

  const [autores, setAutores] = useState<{ id_autor: number; is_principal: boolean }[]>([])

  const { toast } = useToast()

  const loadBase = async () => {
    const { data: t } = await supabase.from('tipo_artigo').select('*').order('descricao')
    if (t) setTipos(t)
    const { data: p } = await supabase
      .from('projetos_wps')
      .select('id_projeto, titulo')
      .order('titulo')
    if (p) setProjetos(p)
    const { data: c } = await supabase.from('colaboradores').select('*').order('nome')
    if (c) setColaboradores(c)
    loadArtigos()
  }

  const loadArtigos = async () => {
    const { data } = await supabase
      .from('artigos')
      .select(`*, tipo_artigo(descricao), projetos_wps(titulo)`)
      .order('id_artigo', { ascending: false })
    if (data) setArtigos(data)
  }

  useEffect(() => {
    loadBase()
  }, [])

  const handleOpenNew = () => {
    setSelectedId(null)
    setForm({
      titulo: '',
      resumo: '',
      abstract: '',
      doi: '',
      arquivo: '',
      id_tipo_artigo: '',
      id_projeto: '',
    })
    setAutores([])
    setIsOpen(true)
  }

  const handleEdit = async (a: any) => {
    setSelectedId(a.id_artigo)
    setForm({
      titulo: a.titulo || '',
      resumo: a.resumo || '',
      abstract: a.abstract || '',
      doi: a.doi || '',
      arquivo: a.arquivo || '',
      id_tipo_artigo: a.id_tipo_artigo?.toString() || '',
      id_projeto: a.id_projeto?.toString() || '',
    })
    const { data } = await supabase
      .from('artigos_autores')
      .select('id_autor, is_principal')
      .eq('id_artigo', a.id_artigo)
    if (data) setAutores(data)
    setIsOpen(true)
  }

  const handleSave = async () => {
    if (!form.titulo) return toast({ title: 'Título obrigatório', variant: 'destructive' })

    const parsedIdProjeto =
      form.id_projeto && form.id_projeto !== 'none' ? parseInt(form.id_projeto) : null

    const payload = {
      titulo: form.titulo,
      resumo: form.resumo,
      abstract: form.abstract,
      doi: form.doi,
      arquivo: form.arquivo,
      id_tipo_artigo: form.id_tipo_artigo ? parseInt(form.id_tipo_artigo) : null,
      id_projeto: parsedIdProjeto,
    }

    let artId = selectedId
    if (artId) {
      const { error } = await supabase.from('artigos').update(payload).eq('id_artigo', artId)
      if (error) return toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    } else {
      const { data, error } = await supabase.from('artigos').insert(payload).select().single()
      if (error) return toast({ title: 'Erro', description: error.message, variant: 'destructive' })
      if (data) artId = data.id_artigo
    }

    if (artId) {
      await supabase.from('artigos_autores').delete().eq('id_artigo', artId)
      if (autores.length > 0) {
        const inserts = autores.map((a) => ({
          id_artigo: artId,
          id_autor: a.id_autor,
          is_principal: a.is_principal,
        }))
        await supabase.from('artigos_autores').insert(inserts)
      }
    }

    toast({ title: 'Artigo salvo com sucesso' })
    setIsOpen(false)
    loadArtigos()
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Deseja excluir este artigo?')) return
    const { error } = await supabase.from('artigos').delete().eq('id_artigo', id)
    if (error) return toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    toast({ title: 'Artigo removido' })
    loadArtigos()
  }

  const toggleAutor = (idColab: number) => {
    if (autores.find((a) => a.id_autor === idColab)) {
      setAutores(autores.filter((a) => a.id_autor !== idColab))
    } else {
      setAutores([...autores, { id_autor: idColab, is_principal: false }])
    }
  }

  const setPrincipal = (idColab: number, isP: boolean) => {
    setAutores(autores.map((a) => (a.id_autor === idColab ? { ...a, is_principal: isP } : a)))
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-between items-center bg-muted/20 p-4 rounded-lg border">
        <div>
          <h3 className="font-semibold text-lg">Biblioteca de Publicações</h3>
          <p className="text-sm text-muted-foreground">
            Gerencie artigos, teses, livros e relatórios vinculados aos projetos.
          </p>
        </div>
        <Button onClick={handleOpenNew} size="lg">
          <Plus className="w-4 h-4 mr-2" /> Novo Artigo
        </Button>
      </div>

      <ScrollArea className="h-[600px] border rounded-md p-4">
        <div className="space-y-4">
          {artigos.map((a) => (
            <div
              key={a.id_artigo}
              className="p-4 border rounded-lg bg-card/50 flex justify-between items-start gap-4 transition-all hover:border-primary/40"
            >
              <div className="space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="bg-primary/10 text-primary text-xs px-2.5 py-0.5 rounded-full font-medium">
                    {a.tipo_artigo?.descricao || 'Sem tipo'}
                  </span>
                  <h4 className="font-semibold text-lg leading-tight">{a.titulo}</h4>
                </div>
                <div className="space-y-1 mt-2">
                  {a.projetos_wps && (
                    <p className="text-sm text-muted-foreground">
                      <span className="font-medium text-foreground">Projeto:</span>{' '}
                      {a.projetos_wps.titulo}
                    </p>
                  )}
                  {a.doi && (
                    <p className="text-sm">
                      <span className="font-medium text-foreground">DOI:</span>{' '}
                      <a
                        href={`https://doi.org/${a.doi}`}
                        target="_blank"
                        rel="noreferrer"
                        className="text-blue-500 hover:underline"
                      >
                        {a.doi}
                      </a>
                    </p>
                  )}
                </div>
              </div>
              <div className="flex space-x-2 shrink-0">
                <Button variant="outline" size="sm" onClick={() => handleEdit(a)}>
                  <Pencil className="w-4 h-4" />
                </Button>
                <Button variant="destructive" size="sm" onClick={() => handleDelete(a.id_artigo)}>
                  <Trash className="w-4 h-4" />
                </Button>
              </div>
            </div>
          ))}
          {artigos.length === 0 && (
            <p className="text-center text-muted-foreground py-12">
              Nenhum artigo ou publicação cadastrado.
            </p>
          )}
        </div>
      </ScrollArea>

      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent className="w-full sm:max-w-2xl overflow-y-auto">
          <SheetHeader className="mb-6">
            <SheetTitle className="text-2xl">
              {selectedId ? 'Editar Publicação' : 'Nova Publicação'}
            </SheetTitle>
            <SheetDescription>
              Preencha os detalhes e associe os autores da publicação.
            </SheetDescription>
          </SheetHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Tipo de Publicação</Label>
                <Select
                  value={form.id_tipo_artigo}
                  onValueChange={(v) => setForm({ ...form, id_tipo_artigo: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo..." />
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
              <div className="space-y-2">
                <Label>Projeto Vinculado</Label>
                <Select
                  value={form.id_projeto}
                  onValueChange={(v) => setForm({ ...form, id_projeto: v })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Opcional..." />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Nenhum Projeto</SelectItem>
                    {projetos.map((p) => (
                      <SelectItem key={p.id_projeto} value={p.id_projeto.toString()}>
                        {p.titulo}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label>Título da Publicação</Label>
              <Textarea
                rows={2}
                value={form.titulo}
                onChange={(e) => setForm({ ...form, titulo: e.target.value })}
                placeholder="Título completo..."
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>DOI</Label>
                <Input
                  value={form.doi}
                  onChange={(e) => setForm({ ...form, doi: e.target.value })}
                  placeholder="Ex: 10.1000/xyz123"
                />
              </div>
              <div className="space-y-2">
                <Label>Arquivo ou Link (URL)</Label>
                <Input
                  value={form.arquivo}
                  onChange={(e) => setForm({ ...form, arquivo: e.target.value })}
                  placeholder="https://..."
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Resumo (Português)</Label>
              <Textarea
                rows={4}
                value={form.resumo}
                onChange={(e) => setForm({ ...form, resumo: e.target.value })}
              />
            </div>
            <div className="space-y-2">
              <Label>Abstract (Inglês)</Label>
              <Textarea
                rows={4}
                value={form.abstract}
                onChange={(e) => setForm({ ...form, abstract: e.target.value })}
              />
            </div>

            <div className="space-y-3 pt-4 border-t">
              <Label className="text-lg font-semibold text-foreground">Gestão de Autores</Label>
              <p className="text-sm text-muted-foreground mb-4">
                Selecione os colaboradores envolvidos. Marque o checkbox verde para designar o autor
                principal.
              </p>
              <ScrollArea className="h-[250px] border rounded-md p-3 bg-muted/10">
                <div className="space-y-1">
                  {colaboradores.map((c) => {
                    const isSelected = autores.some((a) => a.id_autor === c.id_colaborador)
                    const isPrincipal =
                      autores.find((a) => a.id_autor === c.id_colaborador)?.is_principal || false
                    return (
                      <div
                        key={c.id_colaborador}
                        className={`flex items-center justify-between p-2 rounded-md transition-colors ${isSelected ? 'bg-primary/5 border border-primary/20' : 'hover:bg-muted'}`}
                      >
                        <div className="flex items-center space-x-3">
                          <Checkbox
                            id={`art-colab-${c.id_colaborador}`}
                            checked={isSelected}
                            onCheckedChange={() => toggleAutor(c.id_colaborador)}
                          />
                          <label
                            htmlFor={`art-colab-${c.id_colaborador}`}
                            className="text-sm font-medium leading-none cursor-pointer"
                          >
                            {c.nome}
                          </label>
                        </div>
                        {isSelected && (
                          <div className="flex items-center space-x-2 bg-background px-2 py-1 rounded border shadow-sm">
                            <label className="text-xs text-muted-foreground font-medium">
                              Autor Principal?
                            </label>
                            <Checkbox
                              className="data-[state=checked]:bg-green-500 data-[state=checked]:text-white"
                              checked={isPrincipal}
                              onCheckedChange={(chk) => setPrincipal(c.id_colaborador, !!chk)}
                            />
                          </div>
                        )}
                      </div>
                    )
                  })}
                </div>
              </ScrollArea>
            </div>

            <div className="pt-6">
              <Button onClick={handleSave} className="w-full" size="lg">
                Salvar Publicação
              </Button>
            </div>
          </div>
        </SheetContent>
      </Sheet>
    </div>
  )
}
