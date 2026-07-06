import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Progress } from '@/components/ui/progress'
import { Plus, Trash2 } from 'lucide-react'

export function CamadaFormModal({ open, onOpenChange, camada, categorias, onSuccess }: any) {
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [progress, setProgress] = useState(0)
  const [file, setFile] = useState<File | null>(null)

  const [form, setForm] = useState({
    nome: '',
    descricao: '',
    categoria: '',
    tipo_dados: 'vetorial',
    ordem: 0,
    zoom_min: 0,
    zoom_max: 22,
    ativo: true,
    visivel: false,
    epsg_origem: 4674,
    campo_nome: '',
  })
  const [estilo, setEstilo] = useState({
    fillColor: '#3388ff',
    color: '#3388ff',
    weight: 2,
    opacity: 0.5,
  })
  const [legenda, setLegenda] = useState<
    { color: string; label: string; type: 'point' | 'line' | 'polygon' }[]
  >([])

  useEffect(() => {
    if (open) {
      setForm({
        nome: camada?.nome || '',
        descricao: camada?.descricao || '',
        categoria: camada?.categoria || '',
        tipo_dados: camada?.tipo_dados || 'vetorial',
        ordem: camada?.ordem_exibicao || 0,
        zoom_min: camada?.zoom_min || 0,
        zoom_max: camada?.zoom_max || 22,
        ativo: camada?.ativo ?? true,
        visivel: camada?.visivel_por_padrao ?? false,
        epsg_origem: camada?.epsg_origem || 4674,
        campo_nome: camada?.campo_nome || '',
      })
      setEstilo(
        camada?.estilo || { fillColor: '#3388ff', color: '#3388ff', weight: 2, opacity: 0.5 },
      )
      setLegenda((camada?.legenda || []).map((l: any) => ({ type: 'point', ...l })))
      setFile(null)
      setProgress(0)
    }
  }, [open, camada])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const data = {
        nome: form.nome,
        descricao: form.descricao,
        categoria: form.categoria,
        tipo_dados: form.tipo_dados,
        tabela_origem: form.tipo_dados === 'vetorial' ? 'feicoes_geoespaciais' : null,
        ordem_exibicao: form.ordem,
        zoom_min: form.zoom_min,
        zoom_max: form.zoom_max,
        ativo: form.ativo,
        visivel_por_padrao: form.visivel,
        estilo: form.tipo_dados === 'vetorial' ? estilo : {},
        legenda,
        epsg_origem: form.tipo_dados === 'vetorial' ? form.epsg_origem : null,
        campo_nome: form.tipo_dados === 'vetorial' ? form.campo_nome.trim() || null : null,
      }

      let id = camada?.id_camada
      if (!id) {
        const { data: res, error } = await supabase
          .from('camadas_mapa')
          .insert(data)
          .select()
          .single()
        if (error) throw error
        id = res.id_camada
      } else {
        const { error } = await supabase.from('camadas_mapa').update(data).eq('id_camada', id)
        if (error) throw error
      }

      if (file) {
        setProgress(20)
        const bucket = form.tipo_dados === 'vetorial' ? 'camadas_vetor' : 'camadas_raster'
        const ext = form.tipo_dados === 'vetorial' ? 'zip' : 'tif'
        const { error } = await supabase.storage
          .from(bucket)
          .upload(`${id}/origem.${ext}`, file, { upsert: true })
        if (error) throw error
        setProgress(100)

        // Se um novo arquivo foi enviado (cadastro ou substituição), a importação
        // anterior (se houver) não é mais válida até que o usuário importe de novo.
        await supabase
          .from('camadas_mapa')
          .update({ status_importacao: 'pendente', mensagem_erro: null })
          .eq('id_camada', id)
      }

      toast({ title: 'Sucesso', description: 'Camada salva com sucesso.' })
      onSuccess()
    } catch (err: any) {
      toast({ title: 'Erro', description: err.message, variant: 'destructive' })
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{camada ? 'Editar' : 'Nova'} Camada</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <ScrollArea className="h-[65vh] pr-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2 col-span-2">
                <Label>Nome</Label>
                <Input
                  required
                  value={form.nome}
                  onChange={(e) => setForm({ ...form, nome: e.target.value })}
                />
              </div>
              <div className="space-y-2 col-span-2">
                <Label>Descrição</Label>
                <Textarea
                  value={form.descricao}
                  onChange={(e) => setForm({ ...form, descricao: e.target.value })}
                />
              </div>
              <div className="space-y-2">
                <Label>Categoria</Label>
                <Input
                  required
                  list="cats"
                  value={form.categoria}
                  onChange={(e) => setForm({ ...form, categoria: e.target.value })}
                />
                <datalist id="cats">
                  {categorias.map((c: string) => (
                    <option key={c} value={c} />
                  ))}
                </datalist>
              </div>
              <div className="space-y-2">
                <Label>Tipo de Dados</Label>
                <Select
                  disabled={!!camada}
                  value={form.tipo_dados}
                  onValueChange={(v) => setForm({ ...form, tipo_dados: v })}
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="vetorial">Vetorial</SelectItem>
                    <SelectItem value="raster">Raster</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="col-span-2 grid grid-cols-3 gap-4 p-4 border rounded-md">
                <div className="space-y-2">
                  <Label>Ordem Exibição</Label>
                  <Input
                    type="number"
                    value={form.ordem}
                    onChange={(e) => setForm({ ...form, ordem: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Zoom Min</Label>
                  <Input
                    type="number"
                    value={form.zoom_min}
                    onChange={(e) => setForm({ ...form, zoom_min: Number(e.target.value) })}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Zoom Max</Label>
                  <Input
                    type="number"
                    value={form.zoom_max}
                    onChange={(e) => setForm({ ...form, zoom_max: Number(e.target.value) })}
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={form.ativo}
                    onCheckedChange={(c) => setForm({ ...form, ativo: c })}
                  />
                  <Label>Ativo</Label>
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    checked={form.visivel}
                    onCheckedChange={(c) => setForm({ ...form, visivel: c })}
                  />
                  <Label>Visível por Padrão</Label>
                </div>
              </div>

              <div className="space-y-2 col-span-2">
                <Label>
                  Arquivo fonte (
                  {form.tipo_dados === 'vetorial' ? '.zip max 50MB' : '.tif max 200MB'})
                </Label>
                <Input
                  type="file"
                  accept={form.tipo_dados === 'vetorial' ? '.zip' : '.tif,.tiff'}
                  onChange={(e) => setFile(e.target.files?.[0] || null)}
                />
                {loading && file && <Progress value={progress} className="h-2 mt-2" />}
              </div>

              {form.tipo_dados === 'vetorial' && (
                <>
                  <div className="space-y-2 col-span-2">
                    <Label>EPSG de Origem</Label>
                    <Input
                      type="number"
                      value={form.epsg_origem}
                      onChange={(e) => setForm({ ...form, epsg_origem: Number(e.target.value) })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Sistema de coordenadas do shapefile original. 4674 = SIRGAS 2000 (padrão
                      IBGE). 4326 = WGS84/GPS. Se o shapefile estiver em UTM, use o EPSG da zona
                      (ex: 31983 para a zona 23S).
                    </p>
                  </div>

                  <div className="space-y-2 col-span-2">
                    <Label>Campo de Nome da Feição (opcional)</Label>
                    <Input
                      placeholder="ex: id_sacre, nm_municip, codigo..."
                      value={form.campo_nome}
                      onChange={(e) => setForm({ ...form, campo_nome: e.target.value })}
                    />
                    <p className="text-xs text-muted-foreground">
                      Nome exato da coluna de atributo do shapefile (.dbf) que deve ser usada como
                      identificação/rótulo de cada feição ao importar. Se deixar em branco, a
                      importação tenta adivinhar usando nomes comuns (nome, name, rotulo...).
                    </p>
                  </div>

                  <div className="col-span-2 grid grid-cols-4 gap-4 p-4 border rounded-md">
                    <div className="space-y-2">
                      <Label>Cor Preench.</Label>
                      <Input
                        type="color"
                        className="h-10 w-full"
                        value={estilo.fillColor}
                        onChange={(e) => setEstilo({ ...estilo, fillColor: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Cor Borda</Label>
                      <Input
                        type="color"
                        className="h-10 w-full"
                        value={estilo.color}
                        onChange={(e) => setEstilo({ ...estilo, color: e.target.value })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Espessura (px)</Label>
                      <Input
                        type="number"
                        min={0}
                        value={estilo.weight}
                        onChange={(e) => setEstilo({ ...estilo, weight: Number(e.target.value) })}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label>Opacidade (0-1)</Label>
                      <Input
                        type="number"
                        step={0.1}
                        min={0}
                        max={1}
                        value={estilo.opacity}
                        onChange={(e) => setEstilo({ ...estilo, opacity: Number(e.target.value) })}
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="col-span-2 p-4 border rounded-md space-y-4">
                <div className="flex justify-between items-center">
                  <Label className="text-base font-semibold">Legenda</Label>
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      setLegenda([...legenda, { color: '#000000', label: '', type: 'point' }])
                    }
                  >
                    <Plus className="w-4 h-4 mr-2" /> Adicionar
                  </Button>
                </div>
                {legenda.map((l, i) => (
                  <div key={i} className="flex gap-2 items-center">
                    <Input
                      type="color"
                      value={l.color}
                      className="w-16 h-10"
                      onChange={(e) => {
                        const n = [...legenda]
                        n[i].color = e.target.value
                        setLegenda(n)
                      }}
                    />
                    <Select
                      value={l.type}
                      onValueChange={(v) => {
                        const n = [...legenda]
                        n[i].type = v as 'point' | 'line' | 'polygon'
                        setLegenda(n)
                      }}
                    >
                      <SelectTrigger className="w-32 shrink-0">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="point">Ponto</SelectItem>
                        <SelectItem value="line">Linha</SelectItem>
                        <SelectItem value="polygon">Polígono</SelectItem>
                      </SelectContent>
                    </Select>
                    <Input
                      placeholder="Rótulo"
                      value={l.label}
                      onChange={(e) => {
                        const n = [...legenda]
                        n[i].label = e.target.value
                        setLegenda(n)
                      }}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => setLegenda(legenda.filter((_, idx) => idx !== i))}
                    >
                      <Trash2 className="w-4 h-4 text-destructive" />
                    </Button>
                  </div>
                ))}
                {legenda.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center">
                    Nenhum item na legenda
                  </p>
                )}
              </div>
            </div>
          </ScrollArea>
          <div className="flex justify-end gap-2 pt-4 border-t">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancelar
            </Button>
            <Button type="submit" disabled={loading}>
              {loading ? 'Salvando...' : 'Salvar Camada'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
