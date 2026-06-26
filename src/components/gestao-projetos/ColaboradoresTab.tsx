import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { useToast } from '@/hooks/use-toast'
import { Pencil, Trash2, Plus, Upload } from 'lucide-react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

export function ColaboradoresTab() {
  const [colaboradores, setColaboradores] = useState<any[]>([])
  const [grupos, setGrupos] = useState<any[]>([])

  const [openColab, setOpenColab] = useState(false)
  const [openGrupo, setOpenGrupo] = useState(false)

  const [formData, setFormData] = useState<any>({})
  const [grupoFormData, setGrupoFormData] = useState<any>({})
  const [fotoFile, setFotoFile] = useState<File | null>(null)

  const fileInputRef = useRef<HTMLInputElement>(null)
  const { toast } = useToast()

  useEffect(() => {
    loadData()
  }, [])

  const loadData = async () => {
    const [colabRes, grupRes] = await Promise.all([
      supabase.from('colaboradores').select('*, grupo_colaboradores(descricao)').order('nome'),
      supabase.from('grupo_colaboradores').select('*').order('id_grupo'),
    ])
    if (colabRes.data) setColaboradores(colabRes.data)
    if (grupRes.data) setGrupos(grupRes.data)
  }

  // Faz upload da foto no bucket 'fotos_colaboradores' e remove a foto antiga se existir
  const handleUpload = async (file: File, fotoAntigaPath?: string) => {
    // Remove a foto antiga do storage antes de subir a nova
    if (fotoAntigaPath) {
      await supabase.storage.from('fotos_colaboradores').remove([fotoAntigaPath])
    }

    const ext = file.name.split('.').pop()
    const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${ext}`

    const { data, error } = await supabase.storage
      .from('fotos_colaboradores')
      .upload(fileName, file)

    if (error) throw error
    return data.path
  }

  const handleSaveColaborador = async () => {
    if (!formData.nome) return toast({ title: 'Nome é obrigatório', variant: 'destructive' })

    try {
      let fotoPath = formData.foto

      // Passa o path da foto antiga para ser removida do storage ao trocar
      if (fotoFile) {
        fotoPath = await handleUpload(fotoFile, formData.foto || undefined)
      }

      const payload = {
        nome: formData.nome,
        formacao: formData.formacao,
        link_internet: formData.link_internet,
        status: formData.status || 'Ativo',
        id_grupo: formData.id_grupo || null,
        foto: fotoPath,
      }

      if (formData.id_colaborador) {
        await supabase
          .from('colaboradores')
          .update(payload)
          .eq('id_colaborador', formData.id_colaborador)
        toast({ title: 'Colaborador atualizado' })
      } else {
        await supabase.from('colaboradores').insert(payload)
        toast({ title: 'Colaborador adicionado' })
      }

      setOpenColab(false)
      setFormData({})
      setFotoFile(null)
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    }
  }

  const handleDeleteColaborador = async (id: number) => {
    if (!confirm('Excluir este colaborador?')) return

    // Remove a foto do storage antes de excluir o registro
    const colaborador = colaboradores.find((c) => c.id_colaborador === id)
    if (colaborador?.foto) {
      await supabase.storage.from('fotos_colaboradores').remove([colaborador.foto])
    }

    await supabase.from('colaboradores').delete().eq('id_colaborador', id)
    toast({ title: 'Colaborador excluído' })
    loadData()
  }

  const handleSaveGrupo = async () => {
    if (!grupoFormData.descricao)
      return toast({ title: 'Descrição é obrigatória', variant: 'destructive' })

    try {
      const payload = { descricao: grupoFormData.descricao }

      if (grupoFormData.id_grupo) {
        const { error } = await supabase
          .from('grupo_colaboradores')
          .update(payload)
          .eq('id_grupo', grupoFormData.id_grupo)
        if (error) throw error
        toast({ title: 'Grupo atualizado' })
      } else {
        const { error } = await supabase.from('grupo_colaboradores').insert(payload)
        if (error) throw error
        toast({ title: 'Grupo adicionado' })
      }

      setOpenGrupo(false)
      setGrupoFormData({})
      loadData()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar grupo', description: err.message, variant: 'destructive' })
    }
  }

  const handleDeleteGrupo = async (id: number) => {
    if (!confirm('Excluir este grupo? Colaboradores ficarão sem grupo.')) return
    await supabase.from('grupo_colaboradores').delete().eq('id_grupo', id)
    toast({ title: 'Grupo excluído' })
    loadData()
  }

  // Retorna a URL pública da foto a partir do bucket 'fotos_colaboradores'
  const getFotoUrl = (fotoPath: string) => {
    return supabase.storage.from('fotos_colaboradores').getPublicUrl(fotoPath).data.publicUrl
  }

  return (
    <div className="space-y-8 animate-fade-in-up">
      {/* Grupos CRUD */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Grupos de Colaboradores</CardTitle>
          <Dialog open={openGrupo} onOpenChange={setOpenGrupo}>
            <DialogTrigger asChild>
              <Button size="sm" onClick={() => setGrupoFormData({})}>
                <Plus className="w-4 h-4 mr-2" /> Novo Grupo
              </Button>
            </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>{grupoFormData.id_grupo ? 'Editar' : 'Novo'} Grupo</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Descrição</Label>
                  <Input
                    value={grupoFormData.descricao || ''}
                    onChange={(e) =>
                      setGrupoFormData({ ...grupoFormData, descricao: e.target.value })
                    }
                  />
                </div>
              </div>
              <Button onClick={handleSaveGrupo} className="w-full">
                Salvar
              </Button>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {grupos.map((g) => (
                <TableRow key={g.id_grupo}>
                  <TableCell>{g.id_grupo}</TableCell>
                  <TableCell>{g.descricao}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setGrupoFormData(g)
                          setOpenGrupo(true)
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDeleteGrupo(g.id_grupo)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {grupos.length === 0 && (
                <TableRow>
                  <TableCell colSpan={3} className="text-center py-4">
                    Nenhum grupo encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Colaboradores CRUD */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
          <CardTitle className="text-xl font-bold">Colaboradores</CardTitle>
          <Dialog
            open={openColab}
            onOpenChange={(open) => {
              setOpenColab(open)
              if (!open) {
                setFormData({})
                setFotoFile(null)
              }
            }}
          >
            <DialogTrigger asChild>
              <Button size="sm">
                <Plus className="w-4 h-4 mr-2" /> Novo Colaborador
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
              <DialogHeader>
                <DialogTitle>{formData.id_colaborador ? 'Editar' : 'Novo'} Colaborador</DialogTitle>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Foto</Label>
                  <div className="flex items-center gap-4">
                    {(fotoFile || formData.foto) && (
                      <div className="w-16 h-16 rounded-full overflow-hidden border bg-gray-100 flex-shrink-0">
                        <img
                          src={fotoFile ? URL.createObjectURL(fotoFile) : getFotoUrl(formData.foto)}
                          alt="Preview"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <Input
                        type="file"
                        accept="image/*"
                        ref={fileInputRef}
                        className="hidden"
                        onChange={(e) => setFotoFile(e.target.files?.[0] || null)}
                      />
                      <Button
                        type="button"
                        variant="outline"
                        className="w-full"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        <Upload className="w-4 h-4 mr-2" />{' '}
                        {fotoFile ? fotoFile.name : formData.foto ? 'Trocar Foto' : 'Fazer Upload'}
                      </Button>
                    </div>
                  </div>
                </div>
                <div className="space-y-2">
                  <Label>Nome</Label>
                  <Input
                    value={formData.nome || ''}
                    onChange={(e) => setFormData({ ...formData, nome: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Formação / Cargo</Label>
                  <Input
                    value={formData.formacao || ''}
                    onChange={(e) => setFormData({ ...formData, formacao: e.target.value })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Link (Lattes, LinkedIn)</Label>
                  <Input
                    value={formData.link_internet || ''}
                    onChange={(e) => setFormData({ ...formData, link_internet: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Status</Label>
                    <Select
                      value={formData.status || 'Ativo'}
                      onValueChange={(val) => setFormData({ ...formData, status: val })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="Ativo">Ativo</SelectItem>
                        <SelectItem value="Inativo">Inativo</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Grupo</Label>
                    <Select
                      value={formData.id_grupo ? formData.id_grupo.toString() : ''}
                      onValueChange={(val) => setFormData({ ...formData, id_grupo: parseInt(val) })}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione" />
                      </SelectTrigger>
                      <SelectContent>
                        {grupos.map((g) => (
                          <SelectItem key={g.id_grupo} value={g.id_grupo.toString()}>
                            {g.descricao}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>
              </div>
              <Button onClick={handleSaveColaborador} className="w-full">
                Salvar
              </Button>
            </DialogContent>
          </Dialog>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Foto</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Grupo</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="w-[100px]">Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {colaboradores.map((item) => (
                <TableRow key={item.id_colaborador}>
                  <TableCell>
                    <div className="w-10 h-10 rounded-full overflow-hidden border bg-gray-100">
                      {item.foto ? (
                        <img
                          src={getFotoUrl(item.foto)}
                          alt={item.nome}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center text-xs font-semibold text-gray-500 bg-gray-200">
                          {item.nome?.substring(0, 2).toUpperCase()}
                        </div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">
                    <div className="flex flex-col">
                      <span>{item.nome}</span>
                      <span className="text-xs text-muted-foreground">{item.formacao}</span>
                    </div>
                  </TableCell>
                  <TableCell>{item.grupo_colaboradores?.descricao || '-'}</TableCell>
                  <TableCell>
                    <span
                      className={`px-2 py-1 rounded-full text-xs font-medium ${item.status === 'Ativo' ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}
                    >
                      {item.status}
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setFormData(item)
                          setOpenColab(true)
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDeleteColaborador(item.id_colaborador)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
              {colaboradores.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="text-center py-4">
                    Nenhum colaborador encontrado.
                  </TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
