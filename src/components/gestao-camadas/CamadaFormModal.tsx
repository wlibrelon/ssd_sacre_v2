import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { listarCamposShapefile } from '@/lib/importacao-camadas'
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
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Plus, Trash2, Wand2 } from 'lucide-react'
import { normalizarCamposExibicao } from '@/lib/campos-exibicao'
import {
  type ModoGraduado,
  calcularIntervaloIgual,
  calcularQuantidadeIgual,
  corCategoricaAutomatica,
  gerarRampaCores,
} from '@/lib/classificacao'

type CategoriaForm = { valor: string; cor: string; rotulo: string }
type ClasseForm = { min: number; max: number; cor: string; rotulo: string }

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
  // Campos (colunas do .dbf) disponíveis para escolher como "Campo de Nome
  // da Feição". Populado ao selecionar um novo .zip, ou (ao editar uma
  // camada já importada, sem trocar o arquivo) a partir de uma feição já
  // gravada no banco.
  const [camposDisponiveis, setCamposDisponiveis] = useState<string[]>([])
  const [carregandoCampos, setCarregandoCampos] = useState(false)
  // Nome de exibição digitado para cada atributo (campo -> nome amigável).
  // Só os atributos com um nome preenchido aparecem na janela de detalhes ao
  // clicar numa feição no mapa; os demais ficam ocultos.
  const [nomesAtributos, setNomesAtributos] = useState<Record<string, string>>({})
  // Classificação temática (bloco "Classificação" no fim do formulário) —
  // ver src/lib/classificacao.ts para o formato final gravado no banco.
  const [classificacao, setClassificacao] = useState<{
    campo: string
    rotuloCampo: string
    tipo: '' | 'categorico' | 'graduado'
    categorias: CategoriaForm[]
    modo: ModoGraduado
    numClasses: number
    corInicial: string
    corFinal: string
    classes: ClasseForm[]
  }>({
    campo: '',
    rotuloCampo: '',
    tipo: '',
    categorias: [],
    modo: 'intervalo_igual',
    numClasses: 5,
    corInicial: '#ffffb2',
    corFinal: '#bd0026',
    classes: [],
  })
  const [gerandoClassificacao, setGerandoClassificacao] = useState(false)

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
      const mapaNomes: Record<string, string> = {}
      normalizarCamposExibicao(camada?.campos_exibicao).forEach(({ campo, nome_exibicao }) => {
        mapaNomes[campo] = nome_exibicao
      })
      setNomesAtributos(mapaNomes)

      const dadosClassificacao =
        camada?.classificacao && typeof camada.classificacao === 'object' ? camada.classificacao : {}
      const classesExistentes = Array.isArray(dadosClassificacao.classes)
        ? dadosClassificacao.classes
        : []
      setClassificacao({
        campo: camada?.campo_classificacao || '',
        rotuloCampo:
          typeof dadosClassificacao.rotulo_campo === 'string' ? dadosClassificacao.rotulo_campo : '',
        tipo:
          camada?.tipo_classificacao === 'categorico' || camada?.tipo_classificacao === 'graduado'
            ? camada.tipo_classificacao
            : '',
        categorias: Array.isArray(dadosClassificacao.categorias)
          ? dadosClassificacao.categorias.map((c: any) => ({
              valor: c?.valor ?? '',
              cor: c?.cor || '#4e79a7',
              rotulo: c?.rotulo || '',
            }))
          : [],
        modo: dadosClassificacao.modo === 'quantidade_igual' ? 'quantidade_igual' : 'intervalo_igual',
        numClasses: classesExistentes.length > 0 ? classesExistentes.length : 5,
        corInicial: '#ffffb2',
        corFinal: '#bd0026',
        classes: classesExistentes.map((c: any) => ({
          min: c?.min ?? 0,
          max: c?.max ?? 0,
          cor: c?.cor || '#bd0026',
          rotulo: c?.rotulo || '',
        })),
      })

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

  function atualizarCategoria(indice: number, patch: Partial<CategoriaForm>) {
    setClassificacao((prev) => ({
      ...prev,
      categorias: prev.categorias.map((c, i) => (i === indice ? { ...c, ...patch } : c)),
    }))
  }

  function removerCategoria(indice: number) {
    setClassificacao((prev) => ({
      ...prev,
      categorias: prev.categorias.filter((_, i) => i !== indice),
    }))
  }

  function atualizarClasse(indice: number, patch: Partial<ClasseForm>) {
    setClassificacao((prev) => ({
      ...prev,
      classes: prev.classes.map((c, i) => (i === indice ? { ...c, ...patch } : c)),
    }))
  }

  function removerClasse(indice: number) {
    setClassificacao((prev) => ({
      ...prev,
      classes: prev.classes.filter((_, i) => i !== indice),
    }))
  }

  // Busca os valores distintos do atributo escolhido (via RPC, direto nas
  // feições já importadas) e gera uma categoria colorida para cada um. Só
  // funciona para uma camada já salva e importada — para uma camada nova,
  // o admin pode montar as categorias manualmente.
  async function gerarCategoriasAutomaticamente() {
    if (!camada?.id_camada || !classificacao.campo) return
    setGerandoClassificacao(true)
    try {
      const { data, error } = await supabase.rpc('obter_valores_distintos_atributo', {
        p_id_camada: camada.id_camada,
        p_campo: classificacao.campo,
      })
      if (error) throw error
      const valores = Array.isArray(data) ? data : []
      if (valores.length === 0) {
        toast({
          title: 'Nenhum valor encontrado',
          description:
            'Confira se a camada já foi importada e se o atributo escolhido existe nos dados.',
          variant: 'destructive',
        })
        return
      }
      setClassificacao((prev) => ({
        ...prev,
        categorias: valores.map((v: any, i: number) => ({
          valor: String(v.valor),
          cor: corCategoricaAutomatica(i),
          rotulo: '',
        })),
      }))
    } catch (err: any) {
      toast({ title: 'Erro ao gerar categorias', description: err.message, variant: 'destructive' })
    } finally {
      setGerandoClassificacao(false)
    }
  }

  // Busca min/max/valores numéricos do atributo escolhido (via RPC) e
  // calcula as faixas (Intervalo Igual ou Quantidade Igual, conforme o modo
  // escolhido), com uma cor em degradê para cada classe.
  async function gerarClassesAutomaticamente() {
    if (!camada?.id_camada || !classificacao.campo) return
    setGerandoClassificacao(true)
    try {
      const { data, error } = await supabase.rpc('obter_estatisticas_numericas_atributo', {
        p_id_camada: camada.id_camada,
        p_campo: classificacao.campo,
      })
      if (error) throw error
      const min = (data as any)?.min
      const max = (data as any)?.max
      const valores: number[] = Array.isArray((data as any)?.valores) ? (data as any).valores : []
      if (min == null || max == null || valores.length === 0) {
        toast({
          title: 'Nenhum valor numérico encontrado',
          description:
            'Confira se a camada já foi importada e se o atributo escolhido tem valores numéricos.',
          variant: 'destructive',
        })
        return
      }
      const n = Math.max(2, Math.min(12, classificacao.numClasses || 5))
      const faixas =
        classificacao.modo === 'quantidade_igual'
          ? calcularQuantidadeIgual(valores, n)
          : calcularIntervaloIgual(min, max, n)
      const cores = gerarRampaCores(classificacao.corInicial, classificacao.corFinal, faixas.length)
      setClassificacao((prev) => ({
        ...prev,
        numClasses: n,
        classes: faixas.map(([minF, maxF], i) => ({ min: minF, max: maxF, cor: cores[i], rotulo: '' })),
      }))
    } catch (err: any) {
      toast({ title: 'Erro ao gerar classes', description: err.message, variant: 'destructive' })
    } finally {
      setGerandoClassificacao(false)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)
    try {
      const temClassificacao =
        form.tipo_dados === 'vetorial' && classificacao.tipo !== '' && classificacao.campo !== ''

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
        epsg_origem: form.tipo_dados === 'vetorial' ? form.epsg_origem : null,
        campo_nome: form.tipo_dados === 'vetorial' ? form.campo_nome.trim() || null : null,
        campos_exibicao:
          form.tipo_dados === 'vetorial'
            ? (camposDisponiveis.length > 0 ? camposDisponiveis : Object.keys(nomesAtributos))
                .map((campo) => ({ campo, nome_exibicao: (nomesAtributos[campo] || '').trim() }))
                .filter((c) => c.nome_exibicao !== '')
            : [],
        dbf_encoding: form.tipo_dados === 'vetorial' ? form.dbf_encoding : null,
        campo_classificacao: temClassificacao ? classificacao.campo : null,
        tipo_classificacao: temClassificacao ? classificacao.tipo : null,
        classificacao: !temClassificacao
          ? {}
          : classificacao.tipo === 'categorico'
            ? {
                ...(classificacao.rotuloCampo.trim()
                  ? { rotulo_campo: classificacao.rotuloCampo.trim() }
                  : {}),
                categorias: classificacao.categorias
                  .filter((c) => c.valor.trim() !== '')
                  .map((c) => ({
                    valor: c.valor.trim(),
                    cor: c.cor,
                    ...(c.rotulo.trim() ? { rotulo: c.rotulo.trim() } : {}),
                  })),
              }
            : {
                ...(classificacao.rotuloCampo.trim()
                  ? { rotulo_campo: classificacao.rotuloCampo.trim() }
                  : {}),
                modo: classificacao.modo,
                classes: classificacao.classes.map((c) => ({
                  min: c.min,
                  max: c.max,
                  cor: c.cor,
                  ...(c.rotulo.trim() ? { rotulo: c.rotulo.trim() } : {}),
                })),
              },
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

                    <div className="space-y-2 col-span-2">
                      <div className="flex items-center justify-between">
                        <Label>Nomes de exibição dos atributos</Label>
                        {camposDisponiveis.length > 0 && (
                          <div className="flex gap-2">
                            <button
                              type="button"
                              className="text-xs text-primary hover:underline"
                              onClick={() =>
                                setNomesAtributos(
                                  Object.fromEntries(camposDisponiveis.map((c) => [c, c])),
                                )
                              }
                            >
                              Usar nomes originais
                            </button>
                            <button
                              type="button"
                              className="text-xs text-muted-foreground hover:underline"
                              onClick={() => setNomesAtributos({})}
                            >
                              Limpar
                            </button>
                          </div>
                        )}
                      </div>
                      <div className="border rounded-md overflow-hidden">
                        <div className="grid grid-cols-2 gap-2 px-2 py-1 text-xs font-medium text-muted-foreground border-b bg-muted/30">
                          <span>Atributo</span>
                          <span>Nome de exibição</span>
                        </div>
                        <div className="p-2 h-[140px] overflow-y-auto space-y-1">
                          {camposDisponiveis.length === 0 && (
                            <p className="text-xs text-muted-foreground p-1">
                              {carregandoCampos
                                ? 'Lendo campos do arquivo...'
                                : 'Envie o .zip (ou edite uma camada já importada) para listar os atributos.'}
                            </p>
                          )}
                          {camposDisponiveis.map((c) => (
                            <div key={c} className="grid grid-cols-2 gap-2 items-center">
                              <span className="text-sm truncate" title={c}>
                                {c}
                              </span>
                              <Input
                                className="h-8"
                                placeholder="(oculto no mapa)"
                                value={nomesAtributos[c] || ''}
                                onChange={(e) =>
                                  setNomesAtributos((prev) => ({ ...prev, [c]: e.target.value }))
                                }
                              />
                            </div>
                          ))}
                        </div>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Nome amigável exibido ao clicar numa feição no mapa. Atributos sem nome
                        definido ficam ocultos. Se nenhum atributo tiver nome, todos são exibidos
                        com o nome original (comportamento padrão).
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

                  <div className="col-span-2">
                    <Accordion type="single" collapsible>
                      <AccordionItem value="classificacao" className="border rounded-md px-4">
                        <AccordionTrigger className="text-base font-semibold hover:no-underline">
                          Classificação
                        </AccordionTrigger>
                        <AccordionContent className="space-y-4">
                          <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2">
                              <Label>Atributo Principal</Label>
                              {camposDisponiveis.length > 0 ? (
                                <Select
                                  value={classificacao.campo || '__nenhum__'}
                                  onValueChange={(v) =>
                                    setClassificacao((prev) => ({
                                      ...prev,
                                      campo: v === '__nenhum__' ? '' : v,
                                      tipo: v === '__nenhum__' ? '' : prev.tipo,
                                    }))
                                  }
                                >
                                  <SelectTrigger>
                                    <SelectValue placeholder="Selecione um atributo..." />
                                  </SelectTrigger>
                                  <SelectContent>
                                    <SelectItem value="__nenhum__">(nenhum)</SelectItem>
                                    {camposDisponiveis.map((c) => (
                                      <SelectItem key={c} value={c}>
                                        {c}
                                      </SelectItem>
                                    ))}
                                  </SelectContent>
                                </Select>
                              ) : (
                                <p className="text-xs text-muted-foreground">
                                  Envie o .zip (ou edite uma camada já importada) para listar os
                                  atributos.
                                </p>
                              )}
                              <p className="text-xs text-muted-foreground">
                                Atributo usado para classificar as feições — pode ser diferente do
                                "Campo de Nome da Feição".
                              </p>
                            </div>
                            <div className="space-y-2">
                              <Label>Tipo de Classificação</Label>
                              <Select
                                value={classificacao.tipo || 'nenhuma'}
                                onValueChange={(v) =>
                                  setClassificacao((prev) => ({
                                    ...prev,
                                    tipo: v === 'nenhuma' ? '' : (v as 'categorico' | 'graduado'),
                                  }))
                                }
                                disabled={!classificacao.campo}
                              >
                                <SelectTrigger>
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="nenhuma">Nenhuma (cor única)</SelectItem>
                                  <SelectItem value="categorico">Categórico</SelectItem>
                                  <SelectItem value="graduado">Graduado</SelectItem>
                                </SelectContent>
                              </Select>
                              <p className="text-xs text-muted-foreground">
                                Categórico: uma cor sólida por valor. Graduado: cores em faixas de
                                valores numéricos.
                              </p>
                            </div>
                          </div>

                          {classificacao.tipo !== '' && (
                            <div className="space-y-2">
                              <Label>Rótulo do Atributo</Label>
                              <Input
                                placeholder={classificacao.campo}
                                value={classificacao.rotuloCampo}
                                onChange={(e) =>
                                  setClassificacao((prev) => ({
                                    ...prev,
                                    rotuloCampo: e.target.value,
                                  }))
                                }
                              />
                              <p className="text-xs text-muted-foreground">
                                Nome amigável exibido na legenda do mapa junto ao nome da camada
                                (ex.: "População" em vez de "pop_2020"). Em branco, usa o nome do
                                atributo.
                              </p>
                            </div>
                          )}

                          {classificacao.tipo === 'categorico' && (
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <Label>Categorias</Label>
                                <div className="flex gap-2">
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="sm"
                                    disabled={!camada?.id_camada || gerandoClassificacao}
                                    onClick={gerarCategoriasAutomaticamente}
                                  >
                                    <Wand2 className="w-4 h-4 mr-2" />
                                    {gerandoClassificacao ? 'Gerando...' : 'Gerar a partir dos dados'}
                                  </Button>
                                  <Button
                                    type="button"
                                    variant="outline"
                                    size="icon"
                                    onClick={() =>
                                      setClassificacao((prev) => ({
                                        ...prev,
                                        categorias: [
                                          ...prev.categorias,
                                          {
                                            valor: '',
                                            cor: corCategoricaAutomatica(prev.categorias.length),
                                            rotulo: '',
                                          },
                                        ],
                                      }))
                                    }
                                  >
                                    <Plus className="w-4 h-4" />
                                  </Button>
                                </div>
                              </div>
                              {!camada?.id_camada && (
                                <p className="text-xs text-muted-foreground">
                                  Salve a camada e importe os dados primeiro para gerar categorias
                                  automaticamente — ou adicione manualmente.
                                </p>
                              )}
                              <div className="border rounded-md overflow-hidden">
                                <div className="grid grid-cols-[1fr_72px_1fr_32px] gap-2 px-2 py-1 text-xs font-medium text-muted-foreground border-b bg-muted/30">
                                  <span>Valor</span>
                                  <span>Cor</span>
                                  <span>Rótulo (opcional)</span>
                                  <span />
                                </div>
                                <div className="p-2 max-h-[180px] overflow-y-auto space-y-1">
                                  {classificacao.categorias.length === 0 && (
                                    <p className="text-xs text-muted-foreground p-1">
                                      Nenhuma categoria configurada.
                                    </p>
                                  )}
                                  {classificacao.categorias.map((cat, i) => (
                                    <div
                                      key={i}
                                      className="grid grid-cols-[1fr_72px_1fr_32px] gap-2 items-center"
                                    >
                                      <Input
                                        className="h-8"
                                        value={cat.valor}
                                        onChange={(e) => atualizarCategoria(i, { valor: e.target.value })}
                                      />
                                      <Input
                                        type="color"
                                        className="h-8 w-full"
                                        value={cat.cor}
                                        onChange={(e) => atualizarCategoria(i, { cor: e.target.value })}
                                      />
                                      <Input
                                        className="h-8"
                                        placeholder={cat.valor}
                                        value={cat.rotulo}
                                        onChange={(e) =>
                                          atualizarCategoria(i, { rotulo: e.target.value })
                                        }
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => removerCategoria(i)}
                                      >
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}

                          {classificacao.tipo === 'graduado' && (
                            <div className="space-y-3">
                              <div className="grid grid-cols-4 gap-4">
                                <div className="space-y-2 col-span-2">
                                  <Label>Modo</Label>
                                  <Select
                                    value={classificacao.modo}
                                    onValueChange={(v) =>
                                      setClassificacao((prev) => ({ ...prev, modo: v as ModoGraduado }))
                                    }
                                  >
                                    <SelectTrigger>
                                      <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                      <SelectItem value="intervalo_igual">Intervalo Igual</SelectItem>
                                      <SelectItem value="quantidade_igual">Quantidade Igual</SelectItem>
                                    </SelectContent>
                                  </Select>
                                </div>
                                <div className="space-y-2">
                                  <Label>Nº de Classes</Label>
                                  <Input
                                    type="number"
                                    min={2}
                                    max={12}
                                    value={classificacao.numClasses}
                                    onChange={(e) =>
                                      setClassificacao((prev) => ({
                                        ...prev,
                                        numClasses: Number(e.target.value),
                                      }))
                                    }
                                  />
                                </div>
                                <div className="space-y-2">
                                  <Label>Rampa de Cores</Label>
                                  <div className="flex gap-1">
                                    <Input
                                      type="color"
                                      className="h-10 w-full"
                                      value={classificacao.corInicial}
                                      onChange={(e) =>
                                        setClassificacao((prev) => ({
                                          ...prev,
                                          corInicial: e.target.value,
                                        }))
                                      }
                                    />
                                    <Input
                                      type="color"
                                      className="h-10 w-full"
                                      value={classificacao.corFinal}
                                      onChange={(e) =>
                                        setClassificacao((prev) => ({
                                          ...prev,
                                          corFinal: e.target.value,
                                        }))
                                      }
                                    />
                                  </div>
                                </div>
                              </div>
                              <div className="flex items-center gap-2">
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="sm"
                                  disabled={!camada?.id_camada || gerandoClassificacao}
                                  onClick={gerarClassesAutomaticamente}
                                >
                                  <Wand2 className="w-4 h-4 mr-2" />
                                  {gerandoClassificacao ? 'Gerando...' : 'Gerar classes a partir dos dados'}
                                </Button>
                                <Button
                                  type="button"
                                  variant="outline"
                                  size="icon"
                                  onClick={() =>
                                    setClassificacao((prev) => ({
                                      ...prev,
                                      classes: [...prev.classes, { min: 0, max: 0, cor: '#bd0026', rotulo: '' }],
                                    }))
                                  }
                                >
                                  <Plus className="w-4 h-4" />
                                </Button>
                              </div>
                              {!camada?.id_camada && (
                                <p className="text-xs text-muted-foreground">
                                  Salve a camada e importe os dados primeiro para gerar as classes
                                  automaticamente — ou adicione manualmente.
                                </p>
                              )}
                              <div className="border rounded-md overflow-hidden">
                                <div className="grid grid-cols-[1fr_1fr_72px_1fr_32px] gap-2 px-2 py-1 text-xs font-medium text-muted-foreground border-b bg-muted/30">
                                  <span>Min</span>
                                  <span>Max</span>
                                  <span>Cor</span>
                                  <span>Rótulo (opcional)</span>
                                  <span />
                                </div>
                                <div className="p-2 max-h-[180px] overflow-y-auto space-y-1">
                                  {classificacao.classes.length === 0 && (
                                    <p className="text-xs text-muted-foreground p-1">
                                      Nenhuma classe configurada.
                                    </p>
                                  )}
                                  {classificacao.classes.map((cl, i) => (
                                    <div
                                      key={i}
                                      className="grid grid-cols-[1fr_1fr_72px_1fr_32px] gap-2 items-center"
                                    >
                                      <Input
                                        className="h-8"
                                        type="number"
                                        value={cl.min}
                                        onChange={(e) =>
                                          atualizarClasse(i, { min: Number(e.target.value) })
                                        }
                                      />
                                      <Input
                                        className="h-8"
                                        type="number"
                                        value={cl.max}
                                        onChange={(e) =>
                                          atualizarClasse(i, { max: Number(e.target.value) })
                                        }
                                      />
                                      <Input
                                        type="color"
                                        className="h-8 w-full"
                                        value={cl.cor}
                                        onChange={(e) => atualizarClasse(i, { cor: e.target.value })}
                                      />
                                      <Input
                                        className="h-8"
                                        placeholder={`${cl.min} – ${cl.max}`}
                                        value={cl.rotulo}
                                        onChange={(e) =>
                                          atualizarClasse(i, { rotulo: e.target.value })
                                        }
                                      />
                                      <Button
                                        type="button"
                                        variant="ghost"
                                        size="icon"
                                        className="h-8 w-8"
                                        onClick={() => removerClasse(i)}
                                      >
                                        <Trash2 className="w-4 h-4 text-destructive" />
                                      </Button>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </div>
                          )}
                        </AccordionContent>
                      </AccordionItem>
                    </Accordion>
                  </div>
                </>
              )}
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
