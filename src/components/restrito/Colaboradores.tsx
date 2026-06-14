import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useToast } from '@/hooks/use-toast'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export function Colaboradores() {
  const [colaboradores, setColaboradores] = useState<any[]>([])
  const [nome, setNome] = useState('')
  const [link_internet, setLinkInternet] = useState('')
  const [formacao, setFormacao] = useState('')
  const { toast } = useToast()

  useEffect(() => {
    load()
  }, [])

  const load = async () => {
    const { data } = await supabase.from('colaboradores').select('*').order('nome')
    if (data) setColaboradores(data)
  }

  const save = async () => {
    if (!nome) return
    const { error } = await supabase
      .from('colaboradores')
      .insert([{ nome, link_internet, formacao }])
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    else {
      toast({ title: 'Colaborador salvo com sucesso' })
      setNome('')
      setLinkInternet('')
      setFormacao('')
      load()
    }
  }

  const remove = async (id: number) => {
    const { error } = await supabase.from('colaboradores').delete().eq('id_colaborador', id)
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    else {
      toast({ title: 'Colaborador removido' })
      load()
    }
  }

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-4 gap-2 items-end">
        <div>
          <label className="text-sm font-medium mb-1 block">Nome</label>
          <Input
            placeholder="Ex: João Silva"
            value={nome}
            onChange={(e) => setNome(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Link (Lattes, LinkedIn)</label>
          <Input
            placeholder="URL"
            value={link_internet}
            onChange={(e) => setLinkInternet(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium mb-1 block">Formação</label>
          <Input
            placeholder="Ex: Doutorado em X"
            value={formacao}
            onChange={(e) => setFormacao(e.target.value)}
          />
        </div>
        <Button onClick={save} className="w-full">
          Adicionar Colaborador
        </Button>
      </div>

      <div className="border rounded-md mt-4">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Nome</TableHead>
              <TableHead>Link</TableHead>
              <TableHead>Formação</TableHead>
              <TableHead className="w-[100px]">Ação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {colaboradores.map((c) => (
              <TableRow key={c.id_colaborador}>
                <TableCell className="font-medium">{c.nome}</TableCell>
                <TableCell>
                  {c.link_internet ? (
                    <a
                      href={c.link_internet}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      Link
                    </a>
                  ) : (
                    '-'
                  )}
                </TableCell>
                <TableCell>{c.formacao || '-'}</TableCell>
                <TableCell>
                  <Button size="sm" variant="destructive" onClick={() => remove(c.id_colaborador)}>
                    Excluir
                  </Button>
                </TableCell>
              </TableRow>
            ))}
            {colaboradores.length === 0 && (
              <TableRow>
                <TableCell colSpan={4} className="text-center text-muted-foreground py-4">
                  Nenhum colaborador cadastrado
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
