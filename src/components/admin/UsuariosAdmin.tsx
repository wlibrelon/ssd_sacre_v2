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

export function UsuariosAdmin() {
  const { toast } = useToast()
  const [allUsers, setAllUsers] = useState<any[]>([])
  const [groups, setGroups] = useState<any[]>([])
  const [userFilterMode, setUserFilterMode] = useState<'pendentes' | 'todos' | 'grupo'>(
    'pendentes',
  )
  const [groupFilterId, setGroupFilterId] = useState('')

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

  const approveUser = async (id: string, id_ga: number) => {
    if (!id_ga) return toast({ title: 'Selecione um grupo', variant: 'destructive' })
    await supabase.from('perfis_usuarios').update({ status: 'aprovado', id_ga }).eq('id', id)
    toast({ title: 'Usuário aprovado' })
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
                <TableHead>Status</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>Ação</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((u) => (
                <TableRow key={u.id}>
                  <TableCell>{u.nome}</TableCell>
                  <TableCell>{u.email}</TableCell>
                  <TableCell>{u.organizacao}</TableCell>
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
                  <TableCell>
                    {u.status === 'pendente' ? (
                      <Select
                        onValueChange={(val) => {
                          u.selectedGa = parseInt(val)
                        }}
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
                      groups.find((g) => g.id_ga === u.id_ga)?.nome_grupo || '—'
                    )}
                  </TableCell>
                  <TableCell>
                    {u.status === 'pendente' ? (
                      <Button size="sm" onClick={() => approveUser(u.id, u.selectedGa)}>
                        Aprovar
                      </Button>
                    ) : (
                      <span className="text-xs text-muted-foreground">—</span>
                    )}
                  </TableCell>
                </TableRow>
              ))}
              {filteredUsers.length === 0 && (
                <TableRow>
                  <TableCell colSpan={6} className="text-center">
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
    </Card>
  )
}
