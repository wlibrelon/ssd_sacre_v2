import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { useToast } from '@/hooks/use-toast'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Pencil, Trash2 } from 'lucide-react'
import { useAuth } from '@/hooks/use-auth'

const formatarDataHora = (valor?: string | null) =>
  valor
    ? new Date(valor).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

export function UsuariosAdmin() {
  const { toast } = useToast()
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [userFilterMode, setUserFilterMode] = useState<'pendentes' | 'todos' | 'grupo'>(
    'pendentes',
  )
  const [groupFilterId, setGroupFilterId] = useState('')
  const { user } = useAuth()

  // Grupo escolhido na aprovação (por usuário). Começa com o grupo solicitado no cadastro.
  const [gaAprovacao, setGaAprovacao] = useState<Record<string, string>>({})

  // Dialog Alterar grupo
  const [editando, setEditando] = useState<any>(null)
  const [novoGa, setNovoGa] = useState('')
  const [salvandoGrupo, setSalvandoGrupo] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const { data: usersData } = await supabase
      .from('perfis_usuarios')
      .select('*')
      .order('created_at', { ascending: false })
    if (usersData) setAllUsers(usersData)

    const { data: groupsData } = await supabase.from('grupo_acesso').select('*')
    if (groupsData) setGroups(groupsData)
  }

  const nomeGrupo = (id_ga?: number | null) =>
    id_ga ? groups.find((g) => g.id_ga === id_ga)?.nome_grupo || '—' : '—'

  const gaSelecionado = (u: any) =>
    gaAprovacao[u.id] ?? (u.id_ga_solicitado ? u.id_ga_solicitado.toString() : '')

  const approveUser = async (u: any) => {
    const id_ga = parseInt(gaSelecionado(u))
    if (!id_ga) return toast({ title: 'Selecione um grupo', variant: 'destructive' })
    const { error } = await supabase
      .from('perfis_usuarios')
      .update({ status: 'aprovado', id_ga })
      .eq('id', u.id)
    if (error) {
      return toast({
        title: 'Erro ao aprovar usuário',
        description: error.message,
        variant: 'destructive',
      })
    }
    toast({ title: 'Usuário aprovado', description: `Grupo: ${nomeGrupo(id_ga)}` })
    loadData()
  }

  const abrirAlterarGrupo = (u: any) => {
    setEditando(u)
    setNovoGa(u.id_ga ? u.id_ga.toString() : '')
  }

  const salvarGrupo = async () => {
    if (!editando || !novoGa) return
    setSalvandoGrupo(true)
    const { error } = await supabase
      .from('perfis_usuarios')
      .update({ id_ga: parseInt(novoGa) })
      .eq('id', editando.id)
    setSalvandoGrupo(false)
    if (error) {
      return toast({
        title: 'Erro ao alterar grupo',
        description: error.message,
        variant: 'destructive',
      })
    }
    toast({ title: 'Grupo alterado', description: `Novo grupo: ${nomeGrupo(parseInt(novoGa))}` })
    setEditando(null)
    loadData()
  }

  const excluirUsuario = async (u: any) => {
    if (u.id === user?.id) {
      return toast({ title: 'Você não pode excluir o próprio usuário', variant: 'destructive' })
    }
    if (
      !confirm(
        `Excluir o usuário "${u.nome || u.email}"? O acesso dele à plataforma será removido e essa ação não pode ser desfeita.`,
      )
    )
      return
    const { error } = await supabase.rpc('excluir_usuario', { p_id: u.id })
    if (error) {
      return toast({
        title: 'Erro ao excluir usuário',
        description: error.message,
        variant: 'destructive',
      })
    }
    toast({ title: 'Usuário excluído' })
    loadData()
  }

  const filteredUsers = allUsers.filter((u) => {
    if (userFilterMode === 'pendentes') return u.status === 'pendente'
    if (userFilterMode === 'grupo') return groupFilterId ? u.id_ga === parseInt(groupFilterId) : true
    return true
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle>
          {userFilterMode === 'pendentes'
            ? 'Usuários Pendentes'
            : userFilterMode === 'grupo'
              ? 'Usuários por Grupo'
              : 'Todos os Usuários'}
        </CardTitle>
        <CardDescription>
          {userFilterMode === 'pendentes'
            ? 'Aprove os usuários e defina seus grupos de acesso.'
            : userFilterMode === 'grupo'
              ? 'Filtre os usuários cadastrados por grupo de acesso.'
              : 'Todos os usuários cadastrados na plataforma.'}
        </CardDescription>
        <div className="flex flex-col gap-2 pt-2 sm:flex-row sm:items-center">
          <Select
            value={userFilterMode}
            onValueChange={(val) => setUserFilterMode(val as typeof userFilterMode)}
          >
            <SelectTrigger className="w-full sm:w-[220px]">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="pendentes">Para aprovação</SelectItem>
              <SelectItem value="todos">Todos</SelectItem>
              <SelectItem value="grupo">Por grupo</SelectItem>
            </SelectContent>
          </Select>
          {userFilterMode === 'grupo' && (
            <Select value={groupFilterId} onValueChange={setGroupFilterId}>
              <SelectTrigger className="w-full sm:w-[220px]">
                <SelectValue placeholder="Selecione um grupo..." />
              </SelectTrigger>
              <SelectContent>
                {groups.map((g) => (
                  <SelectItem key={g.id_ga} value={g.id_ga.toString()}>
                    {g.nome_grupo}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          )}
        </div>
      </CardHeader>
      <CardContent>
        <div className="overflow-auto max-h-[400px]">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Nome</TableHead>
                <TableHead>E-mail</TableHead>
                <TableHead>Organização</TableHead>
                <TableHead>Data de inclusão</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Grupo solicitado</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.nome}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.organizacao}</TableCell>
                  <TableCell className="whitespace-nowrap">{formatarDataHora(u.created_at)}</TableCell>
                  <TableCell>
                    <span
                      className={`text-xs font-medium px-2 py-1 rounded-full ${
                        u.status === 'aprovado'
                          ? 'bg-green-100 text-green-700'
                          : 'bg-amber-100 text-amber-700'
                      }`}
                    >
                      {u.status === 'aprovado' ? 'Aprovado' : 'Pendente'}
                    </span>
                  </TableCell>
                  <TableCell>{nomeGrupo(u.id_ga_solicitado)}</TableCell>
                  <TableCell>
                    {u.status === 'pendente' ? (
                      <Select
                        value={gaSelecionado(u)}
                        onValueChange={(val) => setGaAprovacao((m) => ({ ...m, [u.id]: val }))}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione..." />
                        </SelectTrigger>
                        <SelectContent>
                          {groups.map((g) => (
                            <SelectItem key={g.id_ga} value={g.id_ga.toString()}>
                              {g.nome_grupo}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    ) : (
                      nomeGrupo(u.id_ga)
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      {u.status === 'pendente' ? (
                        <Button size="sm" onClick={() => approveUser(u)}>
                          Aprovar
                        </Button>
                      ) : (
                        <Button
                          variant="ghost"
                          size="icon"
                          title="Alterar grupo"
                          onClick={() => abrirAlterarGrupo(u)}
                        >
                          <Pencil className="w-4 h-4" />
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        title="Excluir usuário"
                        disabled={u.id === user?.id}
                        onClick={() => excluirUsuario(u)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={8} className="text-center">
                    {userFilterMode === 'pendentes'
                      ? 'Nenhum usuário pendente.'
                      : 'Nenhum usuário encontrado.'}
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </div>
      </CardContent>

      <Dialog open={!!editando} onOpenChange={(o) => !o && setEditando(null)}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Alterar grupo do usuário</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            <p className="text-sm text-muted-foreground">
              {editando?.nome || editando?.email}
              {editando?.id_ga_solicitado && (
                <> · solicitou: {nomeGrupo(editando.id_ga_solicitado)}</>
              )}
            </p>
            <div className="space-y-2">
              <Label>Grupo de acesso</Label>
              <Select value={novoGa} onValueChange={setNovoGa}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione..." />
                </SelectTrigger>
                <SelectContent>
                  {groups.map((g) => (
                    <SelectItem key={g.id_ga} value={g.id_ga.toString()}>
                      {g.nome_grupo}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <Button className="w-full" disabled={!novoGa || salvandoGrupo} onClick={salvarGrupo}>
            {salvandoGrupo ? 'Salvando...' : 'Salvar'}
          </Button>
        </DialogContent>
      </Dialog>
    </Card>
  )
}
