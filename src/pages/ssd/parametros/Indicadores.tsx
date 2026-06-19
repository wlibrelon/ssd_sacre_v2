import { useState, useEffect } from 'react'
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
import { Pencil, Trash2, Plus } from 'lucide-react'

type IndicadorRow = {
  id_indicador: number
  descricao: string
  campo_extra: string
  unidade: string
  id_fonte: number
  fonte_agua?: { nome_fonte: string }
}

export function Indicadores() {
  const [fontes, setFontes] = useState<any[]>([])
  const [idFonteFiltro, setIdFonteFiltro] = useState<string>('todas')

  const [indicadores, setIndicadores] = useState<IndicadorRow[]>([])
  const [loading, setLoading] = useState(true)

  const [open, setOpen] = useState(false)
  const [formData, setFormData] = useState<any>({})
  const { toast } = useToast()

  useEffect(() => {
    loadFontes()
  }, [])

  useEffect(() => {
    loadIndicadores()
  }, [idFonteFiltro])

  const loadFontes = async () => {
    const { data } = await supabase.from('fonte_agua').select('*').order('nome_fonte')
    if (data) setFontes(data)
  }

  const loadIndicadores = async () => {
    setLoading(true)
    let query = supabase.from('indicadores').select('*, fonte_agua(nome_fonte)').order('descricao')

    if (idFonteFiltro !== 'todas') {
      query = query.eq('id_fonte', Number(idFonteFiltro))
    }

    const { data, error } = await query
    if (!error && data) setIndicadores(data as IndicadorRow[])
    setLoading(false)
  }

  const handleSave = async () => {
    if (!formData.descricao)
      return toast({ title: 'Descrição é obrigatória', variant: 'destructive' })
    if (!formData.campo_extra)
      return toast({ title: 'Campo extra é obrigatório', variant: 'destructive' })
    if (!formData.id_fonte)
      return toast({ title: 'Fonte de água é obrigatória', variant: 'destructive' })

    const payload = {
      descricao: formData.descricao,
      campo_extra: formData.campo_extra,
      unidade: formData.unidade || null,
      id_fonte: Number(formData.id_fonte),
    }

    try {
      if (formData.id_indicador) {
        const { error } = await supabase
          .from('indicadores')
          .update(payload)
          .eq('id_indicador', formData.id_indicador)
        if (error) throw error
        toast({ title: 'Indicador atualizado' })
      } else {
        const { error } = await supabase.from('indicadores').insert(payload)
        if (error) throw error
        toast({ title: 'Indicador adicionado' })
      }
      setOpen(false)
      setFormData({})
      loadIndicadores()
    } catch (err: any) {
      toast({ title: 'Erro ao salvar', description: err.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (id: number) => {
    if (!confirm('Excluir este indicador?')) return
    const { error } = await supabase.from('indicadores').delete().eq('id_indicador', id)
    if (error) {
      toast({ title: 'Erro ao excluir', description: error.message, variant: 'destructive' })
    } else {
      toast({ title: 'Indicador excluído' })
      loadIndicadores()
    }
  }

  return (
    <div className="space-y-4">
      {/* Filtro por fonte + Novo indicador */}
      <div className="flex flex-wrap items-end justify-between gap-3">
        <div className="space-y-1 max-w-xs">
          <Label className="text-xs">Filtrar por Fonte de Água</Label>
          <Select value={idFonteFiltro} onValueChange={setIdFonteFiltro}>
            <SelectTrigger>
              <SelectValue placeholder="Todas as fontes" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="todas">Todas as fontes</SelectItem>
              {fontes.map((f) => (
                <SelectItem key={f.id_fonte} value={f.id_fonte.toString()}>
                  {f.nome_fonte}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <Dialog
          open={open}
          onOpenChange={(o) => {
            setOpen(o)
            if (!o) setFormData({})
          }}
        >
          <DialogTrigger asChild>
            <Button size="sm" onClick={() => setFormData({})}>
              <Plus className="w-4 h-4 mr-2" /> Novo Indicador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-md">
            <DialogHeader>
              <DialogTitle>{formData.id_indicador ? 'Editar' : 'Novo'} Indicador</DialogTitle>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div className="space-y-2">
                <Label>Fonte de Água</Label>
                <Select
                  value={formData.id_fonte ? formData.id_fonte.toString() : ''}
                  onValueChange={(val) => setFormData({ ...formData, id_fonte: val })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione a fonte..." />
                  </SelectTrigger>
                  <SelectContent>
                    {fontes.map((f) => (
                      <SelectItem key={f.id_fonte} value={f.id_fonte.toString()}>
                        {f.nome_fonte}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>Descrição</Label>
                <Input
                  placeholder="Ex: Turbidez da água"
                  value={formData.descricao || ''}
                  onChange={(e) => setFormData({ ...formData, descricao: e.target.value })}
                />
              </div>

              <div className="space-y-2">
                <Label>Campo Extra</Label>
                <Input
                  placeholder="Ex: turbidez"
                  value={formData.campo_extra || ''}
                  onChange={(e) => setFormData({ ...formData, campo_extra: e.target.value })}
                />
                <p className="text-[11px] text-muted-foreground">
                  Nome da coluna no CSV de importação e chave em valores_extras (sem espaços ou
                  acentos).
                </p>
              </div>

              <div className="space-y-2">
                <Label>Unidade</Label>
                <Input
                  placeholder="Ex: NTU, mg/L, %"
                  value={formData.unidade || ''}
                  onChange={(e) => setFormData({ ...formData, unidade: e.target.value })}
                />
              </div>
            </div>
            <Button onClick={handleSave} className="w-full">
              Salvar
            </Button>
          </DialogContent>
        </Dialog>
      </div>

      {/* Tabela de indicadores */}
      <div className="border rounded-md">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Descrição</TableHead>
              <TableHead>Campo Extra</TableHead>
              <TableHead>Unidade</TableHead>
              <TableHead>Fonte</TableHead>
              <TableHead className="w-[100px]">Ações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  Carregando...
                </TableCell>
              </TableRow>
            )}
            {!loading &&
              indicadores.map((ind) => (
                <TableRow key={ind.id_indicador}>
                  <TableCell className="font-medium">{ind.descricao}</TableCell>
                  <TableCell className="font-mono text-xs text-muted-foreground">
                    {ind.campo_extra}
                  </TableCell>
                  <TableCell>
                    {ind.unidade ? (
                      <span className="text-xs bg-slate-100 px-2 py-0.5 rounded">
                        {ind.unidade}
                      </span>
                    ) : (
                      <span className="text-slate-300">-</span>
                    )}
                  </TableCell>
                  <TableCell>{ind.fonte_agua?.nome_fonte || `Fonte ${ind.id_fonte}`}</TableCell>
                  <TableCell>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => {
                          setFormData(ind)
                          setOpen(true)
                        }}
                      >
                        <Pencil className="w-4 h-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        className="text-destructive"
                        onClick={() => handleDelete(ind.id_indicador)}
                      >
                        <Trash2 className="w-4 h-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            {!loading && indicadores.length === 0 && (
              <TableRow>
                <TableCell colSpan={5} className="text-center py-4 text-muted-foreground">
                  Nenhum indicador encontrado.
                </TableCell>
              </TableRow>
            )}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
