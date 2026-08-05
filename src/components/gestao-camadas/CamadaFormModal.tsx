import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { listarCamposShapefile } from '@/lib/importacao-camadas'
import { useToast } from '@/hooks/use-toast'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Switch } from '@/components/ui/switch'
import { Checkbox } from '@/components/ui/checkbox'
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
    dbf_encoding: 'latin1',
  })
  const [estilo, setEstilo] = useState({
    fillColor: '#3388ff',
    color: '#3388ff',
    weight: 2,
    opacity: 0.5,
    pointSymbol: 'circle',
    lineStyle: 'solid',
  })
  const [legenda, setLegenda] = useState<
    { color: string; label: string; type: 'point' | 'line' | 'polygon' }[]
  >([])
  // Campos (colunas do .dbf) disponíveis para escolher como "Campo de Nome
  // da Feição". Populado ao selecionar um novo .zip, ou (ao editar uma
  // camada já importada, sem trocar o arquivo) a partir de uma feição já
  // gravada no banco.
  const [camposDisponiveis, setCamposDisponiveis] = useState<string[]>([])
  const [carregandoCampos, setCarregandoCampos] = useState(false)
  // Atributos escolhidos para aparecer na janela de detalhes ao clicar numa
  // feição no mapa. Vazio = mostra todos (comportamento de fallback).
  const [camposExibicao, setCamposExibicao] = useState<string[]>([])

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
        dbf_encoding: camada?.dbf_encoding || 'latin1',
      })
      setEstilo({
        fillColor: '#3388ff',
        color: '#3388ff',
        weight: 2,
        opacity: 0.5,
        pointSymbol: 'circle',
        lineStyle: 'solid',
        ...(camada?.estilo || {}),
      })
      setLegenda((camada?.legenda || []).map((l: any) => ({ type: 'point', ...l })))
      setCamposExibicao(Array.isArray(camada?.campos_exibicao) ? camada.campos_exibicao : [])
      setFile(null)
      setProgress(0)

      // Ao editar uma camada vetorial já importada, tenta descobrir os
      // campos disponíveis a partir de uma feição já gravada — assim o
      // combobox de "Campo de Nome" funciona mesmo sem reenviar o arquivo.
      setCamposDisponiveis([])
      if (camada?.id_camada && camada?.tipo_dados === 'vetorial') {
        supabase
          .from('feicoes_geoespaciais')
          .select('propriedades')
          .eq('id_camada', camada.id_camada)
          .limit(1)
          .then(({ data }) => {
            const props = data?.[0]?.propriedades
            if (props && typeof props === 'object') {
              setCamposDisponiveis(Object.keys(props).sort((a, b) => a.localeCompare(b)))
            }
          })
      }
    }
  }, [open, camada])

  // Ao selecionar um novo arquivo .zip (camada vetorial), lê o .dbf no
  // navegador para popular o combobox de "Campo de Nome da Feição" com as
  // colunas reais do shapefile, em vez de depender de digitação manual.
  // Também reroda ao trocar a codificação, para conferir se os nomes de
  // campo (que também podem ter acentos) ficam corretos com a nova opção.
  useEffect(() => {
    if (!file || form.tipo_dados !== 'vetorial') return
    let ativo = true
    setCarregandoCampos(true)
    listarCamposShapefile(file, form.dbf_encoding)
      .then((campos) => {
        if (ativo) setCamposDisponiveis(campos)
      })
      .catch((err) => {
        console.warn('[CamadaFormModal] Não foi possível ler os campos do shapefile:', err)
        if (ativo) setCamposDisponiveis([])
      })
      .finally(() => {
        if (ativo) setCarregandoCampos(false)
      })
    return () => {
      ativo = false
    }
  }, [file, form.tipo_dados, form.dbf_encoding])

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
        campos_exibicao: form.tipo_dados === 'vetorial' ? camposExibicao : [],
        dbf_encoding: form.tipo_dados === 'vetorial' ? form.dbf_encoding : null,
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
                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>EPSG de Origem</Label>
                      <Input
                        type="number"
                        value={form.epsg_origem}
                        onChange={(e) => setForm({ ...form, epsg_origem: Number(e.target.value) })}
                      />
                      <p className="text-xs text-muted-foreground">
                        Sistema de coordenadas do shapefile original. 4674 = SIRGAS 2000 (padrão
                        IBGE). 4326 = WGS84/GPS. Se estiver em UTM, use o EPSG da zona (ex: 31983
                        para a zona 23S).
                      </p>
                    </div>
                    <div className="space-y-2">
                      <Label>Codificação de Texto do .dbf</Label>
                      <Select
                        value={form.dbf_encoding}
                        onValueChange={(v) => setForm({ ...form, dbf_encoding: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="latin1">ISO-8859-1 / Windows-1252 (Latin1)</SelectItem>
                          <SelectItem value="utf-8">UTF-8</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Se acentos aparecerem errados (ex: "Ã§Ã£o" em vez de "ção") depois de
                        importar, troque essa opção e reimporte a camada.
                      </p>
                    </div>
                  </div>

                  <div className="col-span-2 grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Campo de Nome da Feição (opcional)</Label>
                      {camposDisponiveis.length > 0 ? (
                        <Select
                          value={form.campo_nome || '__nenhum__'}
                          onValueChange={(v) =>
                            setForm({ ...form, campo_nome: v === '__nenhum__' ? '' : v })
                          }
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um campo..." />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="__nenhum__">
                              (nenhum — usar adivinhação automática)
                            </SelectItem>
                            {camposDisponiveis.map((c) => (
                              <SelectItem key={c} value={c}>
                                {c}
                              </SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Input
                          placeholder={
                            carregandoCampos
                              ? 'Lendo campos do arquivo...'
                              : 'ex: id_sacre, nm_municip, codigo...'
                          }
                          disabled={carregandoCampos}
                          value={form.campo_nome}
                          onChange={(e) => setForm({ ...form, campo_nome: e.target.value })}
                        />
                      )}
                      <p className="text-xs text-muted-foreground">
                        Coluna usada como identificação/rótulo de cada feição ao importar. Em
                        branco, a importação tenta adivinhar (nome, name, rotulo...).
                      </p>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center justify-between">
                        <Label>Atributos na janela de detalhes</Label>
                        {camposDisponiveis.length > 0 && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="text-xs text-primary hover:underline"
                              onClick={() => setCamposExibicao([...camposDisponiveis])}
                            >
                              Todos
                            </button>
                            <button
                              type="button"
                              className="text-xs text-muted-foreground hover:underline"
                              onClick={() => setCamposExibicao([])}
                            >
                              Nenhum
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="border rounded-md p-2 h-[88px] overflow-y-auto space-y-1">
                        {camposDisponiveis.length === 0 && (
                          <p className="text-xs text-muted-foreground p-1">
                            {carregandoCampos
                              ? 'Lendo campos do arquivo...'
                              : 'Envie o .zip (ou edite uma camada já importada) para listar os atributos.'}
                          </p>
                        )}
                        {camposDisponiveis.map((c) => (
                          <label
                            key={c}
                            className="flex items-center gap-2 text-sm cursor-pointer hover:bg-muted/50 rounded px-1 py-0.5"
                          >
                            <Checkbox
                              checked={camposExibicao.includes(c)}
                              onCheckedChange={(checked) =>
                                setCamposExibicao((prev) =>
                                  checked ? [...prev, c] : prev.filter((x) => x !== c),
                                )
                              }
                            />
                            {c}
                          </label>
                        ))}
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Quais atributos aparecem ao clicar numa feição no mapa. Nenhum selecionado
                        = mostra todos.
                      </p>
                    </div>
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
                    <div className="space-y-2 col-span-2">
                      <Label>Símbolo do Ponto</Label>
                      <Select
                        value={estilo.pointSymbol}
                        onValueChange={(v) => setEstilo({ ...estilo, pointSymbol: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="circle">Círculo</SelectItem>
                          <SelectItem value="square">Quadrado</SelectItem>
                          <SelectItem value="triangle">Triângulo</SelectItem>
                          <SelectItem value="star">Estrela</SelectItem>
                          <SelectItem value="cross">Cruz</SelectItem>
                          <SelectItem value="diamond">Losango</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Usado quando a camada é do tipo ponto.
                      </p>
                    </div>
                    <div className="space-y-2 col-span-2">
                      <Label>Tipo de Linha</Label>
                      <Select
                        value={estilo.lineStyle}
                        onValueChange={(v) => setEstilo({ ...estilo, lineStyle: v })}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="solid">Sólida</SelectItem>
                          <SelectItem value="dashed">Tracejada</SelectItem>
                          <SelectItem value="dotted">Pontilhada</SelectItem>
                          <SelectItem value="dashdot">Traço-ponto</SelectItem>
                        </SelectContent>
                      </Select>
                      <p className="text-xs text-muted-foreground">
                        Usado em linhas e na borda de polígonos.
                      </p>
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
