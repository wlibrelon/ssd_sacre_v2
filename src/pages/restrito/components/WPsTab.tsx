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

export function WPsTab() {
  const { toast } = useToast()
  const [wps, setWPs] = useState<any[]>([])
  const [colaboradores, setColaboradores] = useState<any[]>([])
  const [selectedWP, setSelectedWP] = useState<any>(null)

  const [form, setForm] = useState({ id_wp: 0, wp: '', titulo: '', menu: '', id_gerente: '' })
  const [desc, setDesc] = useState('')
  const [wpColabs, setWpColabs] = useState<any[]>([])
  const [selectedNewColab, setSelectedNewColab] = useState('')

  useEffect(() => {
    loadData()
  }, [])
  const loadData = async () => {
    const { data: wpsData } = await supabase
      .from('wps')
      .select('*, colaboradores(nome)')
      .order('wp')
    if (wpsData) setWPs(wpsData)
    const { data: colsData } = await supabase.from('colaboradores').select('*').order('nome')
    if (colsData) setColaboradores(colsData)
  }

  const loadWpDetails = async (wp: any) => {
    setSelectedWP(wp)
    setDesc(wp.descricao || '')
    const { data } = await supabase
      .from('lista_colab')
      .select('*, colaboradores(*)')
      .eq('id_wp', wp.id_wp)
    if (data) setWpColabs(data)
  }

  const saveWP = async () => {
    const payload = {
      wp: parseInt(form.wp),
      titulo: form.titulo,
      menu: form.menu,
      id_gerente: parseInt(form.id_gerente) || null,
    }
    if (form.id_wp) await supabase.from('wps').update(payload).eq('id_wp', form.id_wp)
    else await supabase.from('wps').insert(payload)
    toast({ title: 'WP Salvo' })
    setForm({ id_wp: 0, wp: '', titulo: '', menu: '', id_gerente: '' })
    loadData()
  }

  const deleteWP = async (id: number) => {
    await supabase.from('wps').delete().eq('id_wp', id)
    if (selectedWP?.id_wp === id) setSelectedWP(null)
    loadData()
  }

  const saveDesc = async () => {
    if (!selectedWP) return
    await supabase.from('wps').update({ descricao: desc }).eq('id_wp', selectedWP.id_wp)
    toast({ title: 'Descrição atualizada' })
    loadData()
  }

  const addColab = async () => {
    if (!selectedWP || !selectedNewColab) return
    await supabase
      .from('lista_colab')
      .insert({ id_wp: selectedWP.id_wp, id_colaborador: parseInt(selectedNewColab) })
    loadWpDetails(selectedWP)
    setSelectedNewColab('')
  }

  const removeColab = async (id: number) => {
    await supabase.from('lista_colab').delete().eq('id_lista_colab', id)
    loadWpDetails(selectedWP)
  }

  return (
    <div className="grid md:grid-cols-2 gap-6">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg">Work Packages</h3>
        <div className="overflow-auto border rounded-md max-h-[300px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>WP</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wps.map((w) => (
                <TableRow
                  key={w.id_wp}
                  className={cn(
                    'cursor-pointer hover:bg-muted/50',
                    selectedWP?.id_wp === w.id_wp && 'bg-muted',
                  )}
                  onClick={() => loadWpDetails(w)}
                >
                  <TableCell>{w.wp}</TableCell>
                  <TableCell>{w.titulo}</TableCell>
                  <TableCell className="space-x-2">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={(e) => {
                        e.stopPropagation()
                        setForm({
                          id_wp: w.id_wp,
                          wp: w.wp,
                          titulo: w.titulo,
                          menu: w.menu,
                          id_gerente: w.id_gerente?.toString() || '',
                        })
                      }}
                    >
                      Editar
                    </Button>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        deleteWP(w.id_wp)
                      }}
                    >
                      Excluir
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
        <div className="grid grid-cols-2 gap-4 border p-4 rounded-md bg-muted/20">
          <div>
            <label className="text-sm">Número WP</label>
            <Input
              value={form.wp}
              onChange={(e) => setForm({ ...form, wp: e.target.value })}
              type="number"
            />
          </div>
          <div>
            <label className="text-sm">Menu</label>
            <Input value={form.menu} onChange={(e) => setForm({ ...form, menu: e.target.value })} />
          </div>
          <div className="col-span-2">
            <label className="text-sm">Título</label>
            <Input
              value={form.titulo}
              onChange={(e) => setForm({ ...form, titulo: e.target.value })}
            />
          </div>
          <div className="col-span-2">
            <label className="text-sm">Gerente</label>
            <Select
              value={form.id_gerente || undefined}
              onValueChange={(v) => setForm({ ...form, id_gerente: v })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione um gerente..." />
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
          <div className="col-span-2 flex gap-2">
            <Button onClick={saveWP}>{form.id_wp ? 'Atualizar WP' : 'Adicionar WP'}</Button>
            {!!form.id_wp && (
              <Button
                variant="outline"
                onClick={() => setForm({ id_wp: 0, wp: '', titulo: '', menu: '', id_gerente: '' })}
              >
                Cancelar
              </Button>
            )}
          </div>
        </div>
      </div>

      {selectedWP ? (
        <div className="space-y-6">
          <div className="space-y-2 border p-4 rounded-md bg-muted/10">
            <h3 className="font-semibold text-lg">Descrição do WP {selectedWP.wp}</h3>
            <Textarea rows={6} value={desc} onChange={(e) => setDesc(e.target.value)} />
            <Button onClick={saveDesc} className="w-full">
              Salvar Descrição
            </Button>
          </div>
          <div className="space-y-2 border p-4 rounded-md bg-muted/10">
            <h3 className="font-semibold text-lg">Colaboradores Associados</h3>
            <div className="flex gap-2">
              <Select value={selectedNewColab || undefined} onValueChange={setSelectedNewColab}>
                <SelectTrigger>
                  <SelectValue placeholder="Adicionar colaborador..." />
                </SelectTrigger>
                <SelectContent>
                  {colaboradores
                    .filter((c) => !wpColabs.find((wc) => wc.id_colaborador === c.id_colaborador))
                    .map((c) => (
                      <SelectItem key={c.id_colaborador} value={c.id_colaborador.toString()}>
                        {c.nome}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
              <Button onClick={addColab}>Adicionar</Button>
            </div>
            <div className="overflow-auto max-h-[200px] border rounded-md mt-2">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-24">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wpColabs.map((wc) => (
                    <TableRow key={wc.id_lista_colab}>
                      <TableCell>{wc.colaboradores?.nome}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeColab(wc.id_lista_colab)}
                        >
                          Remover
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {wpColabs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center text-muted-foreground">
                        Nenhum associado
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center justify-center text-muted-foreground border rounded-md p-8 bg-muted/5">
          Selecione um WP para ver os detalhes
        </div>
      )}
    </div>
  )
}
