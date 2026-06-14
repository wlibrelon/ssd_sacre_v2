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
import { Checkbox } from '@/components/ui/checkbox'

export function ArtigosTab() {
  const { toast } = useToast()
  const [artigos, setArtigos] = useState<any[]>([])
  const [tipos, setTipos] = useState<any[]>([])
  const [projetos, setProjetos] = useState<any[]>([])
  const [colaboradores, setColaboradores] = useState<any[]>([])

  const [form, setForm] = useState({
    id_artigo: 0,
    titulo: '',
    resumo: '',
    abstract: '',
    doi: '',
    arquivo: '',
    id_tipo_artigo: '',
    id_projeto: '',
  })
  const [autores, setAutores] = useState<any[]>([])

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: aData } = await supabase.from('artigos').select('*, tipo_artigo(descricao)')
    setArtigos(aData || [])
    const { data: tData } = await supabase.from('tipo_artigo').select('*')
    setTipos(tData || [])
    const { data: pData } = await supabase.from('projetos_wps').select('*')
    setProjetos(pData || [])
    const { data: cData } = await supabase.from('colaboradores').select('*').order('nome')
    setColaboradores(cData || [])
  }

  const editArtigo = async (a: any) => {
    setForm({
      id_artigo: a.id_artigo,
      titulo: a.titulo || '',
      resumo: a.resumo || '',
      abstract: a.abstract || '',
      doi: a.doi || '',
      arquivo: a.arquivo || '',
      id_tipo_artigo: a.id_tipo_artigo?.toString() || '',
      id_projeto: a.id_projeto?.toString() || '',
    })
    const { data } = await supabase.from('artigos_autores').select('*').eq('id_artigo', a.id_artigo)
    setAutores(data || [])
  }

  const saveArtigo = async () => {
    if (!form.titulo || !form.id_tipo_artigo)
      return toast({ title: 'Título e Tipo são obrigatórios', variant: 'destructive' })
    const payload = {
      titulo: form.titulo,
      resumo: form.resumo,
      abstract: form.abstract,
      doi: form.doi,
      arquivo: form.arquivo,
      id_tipo_artigo: parseInt(form.id_tipo_artigo),
      id_projeto: form.id_projeto ? parseInt(form.id_projeto) : null,
    }
    let artigoId = form.id_artigo
    if (artigoId) {
      await supabase.from('artigos').update(payload).eq('id_artigo', artigoId)
      await supabase.from('artigos_autores').delete().eq('id_artigo', artigoId)
    } else {
      const { data } = await supabase.from('artigos').insert(payload).select().single()
      if (data) artigoId = data.id_artigo
    }

    if (artigoId && autores.length > 0) {
      await supabase
        .from('artigos_autores')
        .insert(
          autores.map((a) => ({
            id_artigo: artigoId,
            id_autor: a.id_autor,
            is_principal: a.is_principal,
          })),
        )
    }

    toast({ title: 'Artigo salvo' })
    loadData()
    setForm({
      id_artigo: 0,
      titulo: '',
      resumo: '',
      abstract: '',
      doi: '',
      arquivo: '',
      id_tipo_artigo: '',
      id_projeto: '',
    })
    setAutores([])
  }

  const deleteArtigo = async (id: number) => {
    await supabase.from('artigos').delete().eq('id_artigo', id)
    loadData()
  }

  const uploadDoc = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    const filename = `${Date.now()}_${file.name}`
    const { error } = await supabase.storage.from('documentos').upload(filename, file)
    if (error) return toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    const { data: urlData } = supabase.storage.from('documentos').getPublicUrl(filename)
    setForm({ ...form, arquivo: urlData.publicUrl })
    toast({ title: 'Arquivo enviado' })
  }

  const toggleAutor = (id_colab: number) => {
    if (autores.find((a) => a.id_autor === id_colab))
      setAutores(autores.filter((a) => a.id_autor !== id_colab))
    else setAutores([...autores, { id_autor: id_colab, is_principal: false }])
  }

  const setPrincipal = (id_colab: number) => {
    setAutores(
      autores.map((a) =>
        a.id_autor === id_colab ? { ...a, is_principal: true } : { ...a, is_principal: false },
      ),
    )
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Catálogo de Artigos</h3>
        <div className="overflow-auto max-h-[400px] border rounded-md">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Título</TableHead>
                <TableHead>Tipo</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {artigos.map((a) => (
                <TableRow key={a.id_artigo}>
                  <TableCell className="max-w-[200px] truncate" title={a.titulo}>
                    {a.titulo}
                  </TableCell>
                  <TableCell>{a.tipo_artigo?.descricao}</TableCell>
                  <TableCell className="space-x-2">
                    <Button size="sm" variant="outline" onClick={() => editArtigo(a)}>
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={() => deleteArtigo(a.id_artigo)}
                    >
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <Button
          onClick={() => {
            setForm({
              id_artigo: 0,
              titulo: '',
              resumo: '',
              abstract: '',
              doi: '',
              arquivo: '',
              id_tipo_artigo: '',
              id_projeto: '',
            })
            setAutores([])
          }}
        >
          Novo Artigo
        </Button>
      </div>

      <div className="space-y-4 border p-4 rounded-md bg-muted/5">
        <h3 className="font-semibold text-lg">
          {form.id_artigo ? 'Editar Artigo' : 'Novo Artigo'}
        </h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="col-span-2">
            <label className="text-sm">Título</label>
            <Input
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm">Tipo</label>
            <Select
              value={form.id_tipo_artigo || undefined}
              onValueChange={(v) => setForm({ ...form, id_tipo_artigo: v })}
            >
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
          <div>
            <label className="text-sm">Projeto (Opcional)</label>
            <Select
              value={form.id_projeto || undefined}
              onValueChange={(v) => setForm({ ...form, id_projeto: v === 'none' ? '' : v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Sem projeto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="none">Sem projeto</SelectItem>
                {projetos.map((p) => (
                  <SelectItem key={p.id_projeto} value={p.id_projeto.toString()}>
                    {p.titulo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <label className="text-sm">DOI</label>
            <Input value={form.doi} onChange={(e) => setForm({ ...form, doi: e.target.value })} />
          </div>
          <div className="col-span-2">
            <label className="text-sm">Arquivo PDF (Storage)</label>
            <Input type="file" onChange={uploadDoc} accept=".pdf,.doc,.docx" />
            {form.arquivo && (
              <div className="text-xs mt-1 text-muted-foreground truncate" title={form.arquivo}>
                Arquivo atual: {form.arquivo}
              </div>
            )}
          </div>
          <div className="col-span-2">
            <label className="text-sm">Resumo</label>
            <Textarea
              rows={3}
              value={form.resumo}
              onChange={(e) => setForm({ ...form, resumo: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm">Abstract</label>
            <Textarea
              rows={3}
              value={form.abstract}
              onChange={(e) => setForm({ ...form, abstract: e.target.value })}
            />
          </div>
        </div>

        <div className="space-y-2 pt-4 border-t">
          <h4 className="font-semibold text-sm">Autores (Selecione e marque o Principal)</h4>
          <div className="max-h-[150px] overflow-auto border p-2 rounded-md space-y-2 bg-background">
            {colaboradores.map((c) => {
              const selected = autores.find((a) => a.id_autor === c.id_colaborador)
              return (
                <div
                  key={c.id_colaborador}
                  className="flex items-center justify-between border-b pb-2 last:border-0 last:pb-0"
                >
                  <div className="flex items-center gap-2">
                    <Checkbox
                      checked={!!selected}
                      onCheckedChange={() => toggleAutor(c.id_colaborador)}
                    />
                    <span className="text-sm font-medium">{c.nome}</span>
                  </div>
                  {selected && (
                    <div className="flex items-center gap-2">
                      <Checkbox
                        id={`prin-${c.id_colaborador}`}
                        checked={selected.is_principal}
                        onCheckedChange={() => setPrincipal(c.id_colaborador)}
                      />
                      <label
                        htmlFor={`prin-${c.id_colaborador}`}
                        className="text-xs text-muted-foreground cursor-pointer"
                      >
                        Principal
                      </label>
                    </div>
                  )}
                </div>
              )
            })}
            {colaboradores.length === 0 && (
              <div className="text-xs text-muted-foreground p-2">
                Nenhum colaborador cadastrado.
              </div>
            )}
          </div>
        </div>
        <Button onClick={saveArtigo} className="w-full">
          Salvar Artigo
        </Button>
      </div>
    </div>
  )
}
