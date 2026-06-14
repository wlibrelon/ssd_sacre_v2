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

export function WorkPackages() {
  const [wps, setWps] = useState<any[]>([])
  const [colaboradores, setColaboradores] = useState<any[]>([])

  const [wpNum, setWpNum] = useState('')
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [menu, setMenu] = useState('')
  const [idGerente, setIdGerente] = useState('')

  const [selectedWp, setSelectedWp] = useState<any>(null)
  const [wpColabs, setWpColabs] = useState<any[]>([])
  const [colabToAdd, setColabToAdd] = useState('')

  const { toast } = useToast()

  useEffect(() => {
    loadWps()
    loadColaboradores()
  }, [])

  const loadWps = async () => {
    const { data } = await supabase.from('wps').select('*, gerente:colaboradores(nome)').order('wp')
    if (data) setWps(data)
  }

  const loadColaboradores = async () => {
    const { data } = await supabase.from('colaboradores').select('*').order('nome')
    if (data) setColaboradores(data)
  }

  const saveWp = async () => {
    if (!titulo || !wpNum)
      return toast({
        title: 'Aviso',
        description: 'Preencha os campos WP e Título',
        variant: 'destructive',
      })
    const { error } = await supabase.from('wps').insert([
      {
        wp: parseInt(wpNum),
        titulo,
        descricao,
        menu,
        id_gerente: idGerente ? parseInt(idGerente) : null,
      },
    ])
    if (error) toast({ title: 'Erro', description: error.message, variant: 'destructive' })
    else {
      toast({ title: 'Work Package salvo com sucesso' })
      setWpNum('')
      setTitulo('')
      setDescricao('')
      setMenu('')
      setIdGerente('')
      loadWps()
    }
  }

  const removeWp = async (id: number) => {
    await supabase.from('wps').delete().eq('id_wp', id)
    if (selectedWp?.id_wp === id) setSelectedWp(null)
    loadWps()
  }

  const loadWpColabs = async (wpId: number) => {
    const { data } = await supabase
      .from('lista_colab')
      .select('*, colaborador:colaboradores(*)')
      .eq('id_wp', wpId)
    if (data) setWpColabs(data)
  }

  useEffect(() => {
    if (selectedWp) loadWpColabs(selectedWp.id_wp)
  }, [selectedWp])

  const addColabToWp = async () => {
    if (!selectedWp || !colabToAdd) return
    await supabase
      .from('lista_colab')
      .insert([{ id_wp: selectedWp.id_wp, id_colaborador: parseInt(colabToAdd) }])
    loadWpColabs(selectedWp.id_wp)
    setColabToAdd('')
  }

  const removeColabFromWp = async (id_lista: number) => {
    await supabase.from('lista_colab').delete().eq('id_lista_colab', id_lista)
    if (selectedWp) loadWpColabs(selectedWp.id_wp)
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
      <div className="space-y-4">
        <h3 className="font-semibold text-lg border-b pb-2">Gerenciar Work Packages</h3>
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-1">
            <label className="text-sm font-medium">Nº do WP</label>
            <Input
              placeholder="Ex: 1"
              type="number"
              value={wpNum}
              onChange={(e) => setWpNum(e.target.value)}
            />
          </div>
          <div className="space-y-1">
            <label className="text-sm font-medium">Nome no Menu</label>
            <Input
              placeholder="Ex: Coordenação"
              value={menu}
              onChange={(e) => setMenu(e.target.value)}
            />
          </div>
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Título</label>
          <Input
            placeholder="Título do WP"
            value={titulo}
            onChange={(e) => setTitulo(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Descrição</label>
          <Textarea
            placeholder="Descrição do Work Package"
            value={descricao}
            onChange={(e) => setDescricao(e.target.value)}
          />
        </div>
        <div className="space-y-1">
          <label className="text-sm font-medium">Gerente do WP</label>
          <Select value={idGerente} onValueChange={setIdGerente}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione o Gerente" />
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
        <Button onClick={saveWp} className="w-full">
          Adicionar WP
        </Button>

        <div className="border rounded-md mt-6">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>WP</TableHead>
                <TableHead>Título</TableHead>
                <TableHead className="w-[80px]">Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {wps.map((w) => (
                <TableRow
                  key={w.id_wp}
                  className={`cursor-pointer transition-colors ${selectedWp?.id_wp === w.id_wp ? 'bg-secondary' : 'hover:bg-muted/50'}`}
                  onClick={() => setSelectedWp(w)}
                >
                  <TableCell className="font-medium">WP {w.wp}</TableCell>
                  <TableCell>{w.titulo}</TableCell>
                  <TableCell>
                    <Button
                      size="sm"
                      variant="destructive"
                      onClick={(e) => {
                        e.stopPropagation()
                        removeWp(w.id_wp)
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
        <p className="text-sm text-muted-foreground">
          Selecione um WP na lista para gerenciar seus colaboradores.
        </p>
      </div>

      <div className="space-y-4 md:border-l md:pl-8">
        <h3 className="font-semibold text-lg border-b pb-2">
          Colaboradores vinculados:{' '}
          <span className="text-primary">
            {selectedWp ? `WP ${selectedWp.wp}` : 'Nenhum WP selecionado'}
          </span>
        </h3>

        {selectedWp ? (
          <>
            <div className="flex gap-2">
              <Select value={colabToAdd} onValueChange={setColabToAdd}>
                <SelectTrigger className="flex-1">
                  <SelectValue placeholder="Selecione um colaborador..." />
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
              <Button onClick={addColabToWp}>Vincular</Button>
            </div>

            <div className="border rounded-md mt-4">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Nome</TableHead>
                    <TableHead className="w-[100px]">Ação</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {wpColabs.map((lc) => (
                    <TableRow key={lc.id_lista_colab}>
                      <TableCell>{lc.colaborador?.nome}</TableCell>
                      <TableCell>
                        <Button
                          size="sm"
                          variant="destructive"
                          onClick={() => removeColabFromWp(lc.id_lista_colab)}
                        >
                          Remover
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
                  {wpColabs.length === 0 && (
                    <TableRow>
                      <TableCell colSpan={2} className="text-center py-4 text-muted-foreground">
                        Nenhum colaborador vinculado a este WP.
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
          </>
        ) : (
          <div className="flex items-center justify-center h-48 bg-muted/20 border border-dashed rounded-md">
            <p className="text-muted-foreground">Selecione um WP para vincular colaboradores.</p>
          </div>
        )}
      </div>
    </div>
  )
}
