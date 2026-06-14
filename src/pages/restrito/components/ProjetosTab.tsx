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
import { cn } from '@/lib/utils'

export function ProjetosTab() {
  const { toast } = useToast()
  const [wps, setWPs] = useState<any[]>([])
  const [selectedWP, setSelectedWP] = useState('')
  const [projetos, setProjetos] = useState<any[]>([])
  const [selectedProjeto, setSelectedProjeto] = useState<any>(null)

  const [form, setForm] = useState({
    id_projeto: 0,
    titulo: '',
    resumo: '',
    objetivos: '',
    id_autor: '',
  })
  const [resultados, setResultados] = useState<any[]>([])
  const [formRes, setFormRes] = useState({ descricao: '', nome_arq: '' })

  useEffect(() => {
    supabase
      .from('wps')
      .select('*')
      .order('wp')
      .then(({ data }) => setWPs(data || []))
  }, [])

  useEffect(() => {
    if (!selectedWP) {
      setProjetos([])
      setSelectedProjeto(null)
      return
    }
    loadProjetos()
  }, [selectedWP])

  const loadProjetos = async () => {
    const { data } = await supabase.from('projetos_wps').select('*').eq('id_wp', selectedWP)
    setProjetos(data || [])
  }

  const loadResultados = async (proj: any) => {
    setSelectedProjeto(proj)
    setForm({
      id_projeto: proj.id_projeto,
      titulo: proj.titulo || '',
      resumo: proj.resumo || '',
      objetivos: proj.objetivos || '',
      id_autor: proj.id_autor?.toString() || '',
    })
    const { data } = await supabase
      .from('arq_resultados')
      .select('*')
      .eq('id_projeto', proj.id_projeto)
    setResultados(data || [])
  }

  const saveProj = async () => {
    if (!selectedWP) return toast({ title: 'Selecione um WP', variant: 'destructive' })
    const payload = {
      id_wp: parseInt(selectedWP),
      titulo: form.titulo,
      resumo: form.resumo,
      objetivos: form.objetivos,
      id_autor: parseInt(form.id_autor) || null,
    }
    if (form.id_projeto)
      await supabase.from('projetos_wps').update(payload).eq('id_projeto', form.id_projeto)
    else await supabase.from('projetos_wps').insert(payload)
    toast({ title: 'Projeto salvo' })
    loadProjetos()
    if (!form.id_projeto)
      setForm({ id_projeto: 0, titulo: '', resumo: '', objetivos: '', id_autor: '' })
  }

  const delProj = async (id: number) => {
    await supabase.from('projetos_wps').delete().eq('id_projeto', id)
    if (selectedProjeto?.id_projeto === id) setSelectedProjeto(null)
    loadProjetos()
  }

  const saveRes = async () => {
    if (!selectedProjeto) return
    await supabase
      .from('arq_resultados')
      .insert({
        id_projeto: selectedProjeto.id_projeto,
        descricao: formRes.descricao,
        nome_arq: formRes.nome_arq,
      })
    setFormRes({ descricao: '', nome_arq: '' })
    loadResultados(selectedProjeto)
  }

  const delRes = async (id: number) => {
    await supabase.from('arq_resultados').delete().eq('id_arq_res', id)
    loadResultados(selectedProjeto)
  }

  return (
    <div className="space-y-6">
      <div className="w-full md:w-1/3">
        <label className="text-sm font-medium mb-1 block">Selecione o Work Package</label>
        <Select value={selectedWP || undefined} onValueChange={setSelectedWP}>
          <SelectTrigger>
            <SelectValue placeholder="Selecione um WP" />
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

      <div className="grid md:grid-cols-2 gap-6">
        <div>
          <h3 className="font-semibold text-lg mb-2">Projetos</h3>
          <div className="overflow-auto border rounded-md max-h-[300px]">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Título</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {projetos.map((p) => (
                  <TableRow
                    key={p.id_projeto}
                    className={cn(
                      'cursor-pointer hover:bg-muted/50',
                      selectedProjeto?.id_projeto === p.id_projeto && 'bg-muted',
                    )}
                    onClick={() => loadResultados(p)}
                  >
                    <TableCell>{p.titulo}</TableCell>
                    <TableCell className="space-x-2">
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={(e) => {
                          e.stopPropagation()
                          delProj(p.id_projeto)
                        }}
                      >
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {projetos.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={2} className="text-center text-muted-foreground">
                      Nenhum projeto encontrado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          <Button
            className="mt-4"
            variant="outline"
            onClick={() => {
              setSelectedProjeto(null)
              setForm({ id_projeto: 0, titulo: '', resumo: '', objetivos: '', id_autor: '' })
            }}
          >
            Novo Projeto
          </Button>
        </div>

        <div className="space-y-4 border p-4 rounded-md bg-muted/10">
          <h3 className="font-semibold text-lg">
            {form.id_projeto ? 'Editar Projeto' : 'Novo Projeto'}
          </h3>
          <div>
            <label className="text-sm">Título</label>
            <Input
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm">ID Autor (Numérico)</label>
            <Input
              type="number"
              value={form.id_autor}
              onChange={(e) => setForm({ ...form, id_autor: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm">Resumo</label>
            <Textarea
              rows={3}
              value={form.resumo}
              onChange={(e) => setForm({ ...form, resumo: e.target.value })}
            />
          </div>
          <div>
            <label className="text-sm">Objetivos</label>
            <Textarea
              rows={3}
              value={form.objetivos}
              onChange={(e) => setForm({ ...form, objetivos: e.target.value })}
            />
          </div>
          <Button onClick={saveProj} className="w-full">
            Salvar Projeto
          </Button>
        </div>
      </div>

      {selectedProjeto && (
        <div className="border-t pt-6 space-y-4">
          <h3 className="font-semibold text-lg">Resultados do Projeto</h3>
          <div className="flex gap-4 items-end flex-wrap">
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm">Descrição do Resultado</label>
              <Input
                value={formRes.descricao}
                onChange={(e) => setFormRes({ ...formRes, descricao: e.target.value })}
              />
            </div>
            <div className="flex-1 min-w-[200px]">
              <label className="text-sm">Nome do Arquivo</label>
              <Input
                value={formRes.nome_arq}
                onChange={(e) => setFormRes({ ...formRes, nome_arq: e.target.value })}
              />
            </div>
            <Button onClick={saveRes}>Adicionar Resultado</Button>
          </div>
          <div className="overflow-auto max-h-[250px] border rounded-md">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Arquivo</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {resultados.map((r) => (
                  <TableRow key={r.id_arq_res}>
                    <TableCell>{r.descricao}</TableCell>
                    <TableCell>{r.nome_arq}</TableCell>
                    <TableCell>
                      <Button size="sm" variant="destructive" onClick={() => delRes(r.id_arq_res)}>
                        Excluir
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
                {resultados.length === 0 && (
                  <TableRow>
                    <TableCell colSpan={3} className="text-center text-muted-foreground">
                      Nenhum resultado adicionado
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
