// Aba "Mapa" da Simulação: exibe o mapa (shape ou raster) associado ao
// modelo de uma das fontes selecionadas, como informação complementar para
// interpretar os resultados.
import { useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Info, Layers, Loader2, Map as MapIcon, Maximize2, X } from 'lucide-react'
import { SimpleMap } from '@/components/map/SimpleMap'
import { TileLayer } from '@/components/map/TileLayer'
import { GeoJSONLayer } from '@/components/map/GeoJSONLayer'
import { rotuloAtributoClassificacao, rotuloCategoria, rotuloClasse } from '@/lib/classificacao'
import { ConfigShapeForm } from './ConfigShape'
import { ConfigRasterForm } from './ConfigRaster'
import { CliqueNoMapa, IconeLegendaMapa, RasterImagemLayer } from './CamadasMapa'
import {
  baixarArquivo,
  classificacaoParaRender,
  colorirRaster,
  configCamadaPadrao,
  epsgSuportado,
  lerBandaRaster,
  lerRaster,
  lerShapesDoZip,
  normalizarConfigRaster,
  normalizarConfigShape,
  prepararCamadaShape,
  reprojetarRaster,
  unirExtensoes,
  valorDoPixel,
  type CamadaShape,
  type ConfigRaster,
  type ConfigShape,
  type Extensao,
  type RasterBanda,
  type RasterCarregado,
  type RasterReprojetado,
  type ShapeBruto,
} from './dadosMapa'

type Selecao = {
  id: string
  id_fonte: number
  cenarios: string[]
  estrategias: string[]
  fonte_agua?: { nome_fonte: string }
}

type ModeloMapa = {
  id_mod: number
  id_fonte: number
  cenario: any
  estrategia: any
  arq_shape: string | null
  desc_shape: string | null
  arq_raster: string | null
  desc_raster: string | null
  config_mapa: any
}

type TipoMapa = 'shape' | 'raster'

type Exibido =
  | { tipo: 'shape'; camadas: CamadaShape[]; cfg: ConfigShape; extensao: Extensao | null }
  | {
      tipo: 'raster'
      imagem: string
      rep: RasterReprojetado
      cfg: ConfigRaster
      epsg: number
      banda: RasterBanda
      descricao: string
    }

/** Extensão válida em graus (lon/lat)? Coordenadas fora disso indicam, em
 * geral, um EPSG de origem errado (ex.: dados em UTM lidos como graus). */
function extensaoValida(e: Extensao | null | undefined): e is Extensao {
  if (!e || e.some((v) => !Number.isFinite(v))) return false
  const [x0, y0, x1, y1] = e
  return x0 >= -180 && x1 <= 180 && y0 >= -85 && y1 <= 85 && x0 <= x1 && y0 <= y1
}

const chave = (v: any) => JSON.stringify((Array.isArray(v) ? v : []).map(String).sort())
const fmt = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 4 })

export function ExibicaoMapa({ selecoes }: { selecoes: Selecao[] }) {
  const [modelos, setModelos] = useState<ModeloMapa[]>([])
  const [carregandoModelos, setCarregandoModelos] = useState(false)
  const [idMod, setIdMod] = useState<number | null>(null)
  const [tipo, setTipo] = useState<TipoMapa | null>(null)

  const [cfgShape, setCfgShape] = useState<ConfigShape>(normalizarConfigShape(null))
  const [cfgRaster, setCfgRaster] = useState<ConfigRaster>(normalizarConfigRaster(null))
  const [shapes, setShapes] = useState<ShapeBruto[] | null>(null)
  const [raster, setRaster] = useState<RasterCarregado | null>(null)
  const [banda, setBanda] = useState<RasterBanda | null>(null)
  const [carregandoArquivo, setCarregandoArquivo] = useState(false)
  const [erroArquivo, setErroArquivo] = useState<string | null>(null)
  const buffers = useRef<Record<string, ArrayBuffer>>({})

  const [exibido, setExibido] = useState<Exibido | null>(null)
  // Incrementado para (re)enquadrar o mapa na extensão do mapa exibido: ao
  // exibir um mapa com extensão diferente da anterior e no botão "Enquadrar".
  const [enquadramento, setEnquadramento] = useState(0)
  const ultimaExtensao = useRef<string>('')
  const containerMapa = useRef<HTMLDivElement | null>(null)

  // A roda do mouse sobre o mapa deve só dar zoom, sem rolar a página. O
  // listener precisa ser nativo e não-passivo — o onWheel do React é passivo
  // e não consegue impedir a rolagem.
  useEffect(() => {
    const el = containerMapa.current
    if (!el) return
    const bloquear = (e: WheelEvent) => e.preventDefault()
    el.addEventListener('wheel', bloquear, { passive: false })
    return () => el.removeEventListener('wheel', bloquear)
  }, [!!exibido])

  const aplicarExtensao = (ext: Extensao | null) => {
    if (!extensaoValida(ext)) {
      toast.warning(
        'As coordenadas do mapa ficaram fora da faixa esperada — confira o EPSG de origem na Configuração de mapa.',
      )
      return
    }
    const k = ext.map((v) => v.toFixed(6)).join(',')
    if (k !== ultimaExtensao.current) {
      ultimaExtensao.current = k
      setEnquadramento((n) => n + 1)
    }
  }
  const [gerando, setGerando] = useState(false)
  const [camadasAtivas, setCamadasAtivas] = useState<Set<string>>(new Set())
  const [painelExpandido, setPainelExpandido] = useState(true)
  const [feicao, setFeicao] = useState<{ titulo: string; entradas: [string, any][] } | null>(null)
  const [pixel, setPixel] = useState<{ x: number; y: number; lon: number; lat: number; valor: number | null | 'carregando' } | null>(null)

  // ── Modelos das fontes selecionadas ───────────────────────────────────────
  const idsFontes = useMemo(() => Array.from(new Set(selecoes.map((s) => s.id_fonte))).sort(), [selecoes])
  useEffect(() => {
    if (idsFontes.length === 0) {
      setModelos([])
      return
    }
    setCarregandoModelos(true)
    supabase
      .from('modelos')
      .select('id_mod, id_fonte, cenario, estrategia, arq_shape, desc_shape, arq_raster, desc_raster, config_mapa')
      .in('id_fonte', idsFontes)
      .then(({ data, error }) => {
        if (error) toast.error(`Erro ao carregar modelos: ${error.message}`)
        setModelos((data as ModeloMapa[]) || [])
        setCarregandoModelos(false)
      })
  }, [idsFontes.join(',')])

  // Cada seleção ativa corresponde ao modelo com a mesma fonte, cenários e estratégias
  const itens = useMemo(
    () =>
      selecoes.map((s) => ({
        selecao: s,
        modelo:
          modelos.find(
            (m) => m.id_fonte === s.id_fonte && chave(m.cenario) === chave(s.cenarios) && chave(m.estrategia) === chave(s.estrategias),
          ) || null,
      })),
    [selecoes, modelos],
  )
  const modelo = modelos.find((m) => m.id_mod === idMod) || null
  const temShape = !!modelo?.arq_shape
  const temRaster = !!modelo?.arq_raster

  // Ao trocar de modelo: escolhe o tipo de mapa e carrega a configuração salva
  const escolherModelo = async (id: number) => {
    // Relê o modelo do banco: os mapas podem ter sido trocados em
    // Configurações depois que esta tela foi aberta.
    const { data } = await supabase
      .from('modelos')
      .select('id_mod, id_fonte, cenario, estrategia, arq_shape, desc_shape, arq_raster, desc_raster, config_mapa')
      .eq('id_mod', id)
      .maybeSingle()
    const m = (data as ModeloMapa | null) || modelos.find((x) => x.id_mod === id)
    if (!m) return
    if (data) setModelos((prev) => prev.map((x) => (x.id_mod === id ? (data as ModeloMapa) : x)))
    buffers.current = {}
    setShapes(null)
    setRaster(null)
    setIdMod(id)
    setTipo(m.arq_shape ? 'shape' : m.arq_raster ? 'raster' : null)
    setCfgShape(normalizarConfigShape(m.config_mapa?.shape))
    setCfgRaster(normalizarConfigRaster(m.config_mapa?.raster))
    setExibido(null)
  }

  const baixar = async (caminho: string) => {
    if (!buffers.current[caminho]) buffers.current[caminho] = await baixarArquivo(caminho)
    return buffers.current[caminho]
  }

  // ── Carrega o arquivo do mapa escolhido (para a configuração) ─────────────
  useEffect(() => {
    let ativo = true
    setErroArquivo(null)
    if (!modelo || !tipo) {
      setShapes(null)
      setRaster(null)
      return
    }
    const caminho = tipo === 'shape' ? modelo.arq_shape : modelo.arq_raster
    if (!caminho) return
    setCarregandoArquivo(true)
    ;(async () => {
      try {
        const buf = await baixar(caminho)
        if (tipo === 'shape') {
          const lidos = await lerShapesDoZip(buf, cfgShape.dbf_encoding)
          if (ativo) setShapes(lidos)
        } else {
          const r = await lerRaster(buf)
          if (ativo) setRaster(r)
        }
      } catch (err: any) {
        if (ativo) setErroArquivo(err?.message || 'Não foi possível ler o arquivo do mapa.')
      } finally {
        if (ativo) setCarregandoArquivo(false)
      }
    })()
    return () => {
      ativo = false
    }
  }, [modelo?.id_mod, modelo?.arq_shape, modelo?.arq_raster, tipo, tipo === 'shape' ? cfgShape.dbf_encoding : ''])

  const nodataEfetivo = cfgRaster.nodata ?? raster?.nodataArquivo ?? null
  const bandaEfetiva = raster ? Math.min(cfgRaster.banda, raster.bandas - 1) : 0
  useEffect(() => {
    if (!raster || tipo !== 'raster') {
      setBanda(null)
      return
    }
    let ativo = true
    lerBandaRaster(raster, bandaEfetiva, nodataEfetivo)
      .then((b) => ativo && setBanda(b))
      .catch((err) => ativo && setErroArquivo(err?.message || 'Erro ao ler o raster.'))
    return () => {
      ativo = false
    }
  }, [raster, bandaEfetiva, nodataEfetivo, tipo])

  // ── Exibir mapa ───────────────────────────────────────────────────────────
  const salvarConfig = async () => {
    if (!modelo || !tipo) return
    const novo = { ...(modelo.config_mapa || {}), [tipo]: tipo === 'shape' ? cfgShape : cfgRaster }
    const { error } = await supabase.from('modelos').update({ config_mapa: novo }).eq('id_mod', modelo.id_mod)
    if (error) toast.warning(`Mapa exibido, mas a configuração não foi salva: ${error.message}`)
    else setModelos((prev) => prev.map((m) => (m.id_mod === modelo.id_mod ? { ...m, config_mapa: novo } : m)))
  }

  const exibir = async () => {
    if (!modelo || !tipo) return
    setGerando(true)
    setPixel(null)
    try {
      if (tipo === 'shape') {
        if (!shapes) return
        if (cfgShape.epsg && !epsgSuportado(cfgShape.epsg))
          throw new Error(`EPSG ${cfgShape.epsg} não é suportado. Informe outro EPSG de origem.`)
        const camadas = shapes.map((s) => prepararCamadaShape(s, cfgShape.epsg))
        // Camadas com coordenadas fora da faixa de graus (EPSG errado)
        const foraDaFaixa = camadas.filter((c) => c.extensao && !extensaoValida(c.extensao)).map((c) => c.nome)
        if (foraDaFaixa.length > 0)
          throw new Error(
            `Não foi possível posicionar a(s) camada(s) ${foraDaFaixa.join(', ')}: o sistema de coordenadas não foi reconhecido. Informe o EPSG de origem na Configuração de mapa.`,
          )
        const extensao = unirExtensoes(camadas.map((c) => c.extensao))
        setExibido({ tipo: 'shape', camadas, cfg: cfgShape, extensao })
        aplicarExtensao(extensao)
        setCamadasAtivas(new Set(camadas.map((c) => c.nome)))
      } else {
        if (!raster || !banda) return
        const epsg = cfgRaster.epsg ?? raster.epsgDetectado
        if (!epsg) throw new Error('O arquivo não informa o sistema de coordenadas. Informe o EPSG de origem.')
        if (!epsgSuportado(epsg)) throw new Error(`EPSG ${epsg} não é suportado. Informe outro EPSG de origem.`)
        if (cfgRaster.modo === 'classes' && cfgRaster.classes.length === 0)
          throw new Error('Configure as classes de valores (ou gere a partir dos dados) antes de exibir.')
        // Deixa o React desenhar o "Gerando..." antes do processamento pesado
        await new Promise((r) => setTimeout(r, 30))
        const rep = reprojetarRaster(raster, banda, epsg)
        const imagem = colorirRaster(banda, rep, cfgRaster, nodataEfetivo)
        setExibido({ tipo: 'raster', imagem, rep, cfg: cfgRaster, epsg, banda, descricao: modelo.desc_raster || 'Raster' })
        aplicarExtensao(rep.extensaoLonLat)
        setCamadasAtivas(new Set(['__raster__']))
      }
      await salvarConfig()
    } catch (err: any) {
      toast.error(err?.message || 'Não foi possível exibir o mapa.')
    } finally {
      setGerando(false)
    }
  }

  const cliqueRaster = async (lon: number, lat: number, x: number, y: number) => {
    if (!exibido || exibido.tipo !== 'raster' || !raster || !camadasAtivas.has('__raster__')) return
    setPixel({ x, y, lon, lat, valor: 'carregando' })
    try {
      const v = await valorDoPixel(raster, exibido.banda.banda, exibido.epsg, lon, lat)
      const nd = exibido.cfg.nodata ?? raster.nodataArquivo
      setPixel({ x, y, lon, lat, valor: v !== null && nd !== null && v === nd ? null : v })
    } catch {
      setPixel({ x, y, lon, lat, valor: null })
    }
  }

  const abrirFeicao = (camada: CamadaShape, props: Record<string, any>, cfg: ConfigShape) => {
    const cc = cfg.camadas[camada.nome] || configCamadaPadrao()
    const nomeados = camada.campos.filter((c) => (cc.nomesAtributos[c] || '').trim() !== '')
    const entradas: [string, any][] =
      nomeados.length > 0
        ? nomeados.filter((c) => c in props).map((c) => [cc.nomesAtributos[c].trim(), props[c]])
        : Object.entries(props)
    const titulo = cc.campoNome && props[cc.campoNome] ? String(props[cc.campoNome]) : 'Detalhes da Feição'
    setFeicao({ titulo, entradas })
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (selecoes.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-4 text-center">
        Marque ao menos uma fonte na aba "Seleção da Simulação" para exibir os mapas dos modelos.
      </p>
    )
  }

  return (
    <div className="space-y-4">
      <h3 className="text-sm font-semibold text-primary">Exibição de mapa</h3>
      <p className="text-xs text-muted-foreground -mt-2">
        Escolha o modelo de uma das fontes selecionadas para exibir o mapa associado a ele, como informação complementar
        para interpretar os resultados.
      </p>

      {/* Lista de modelos (radio) */}
      {carregandoModelos ? (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando modelos...
        </p>
      ) : (
        <RadioGroup
          value={idMod ? String(idMod) : ''}
          onValueChange={(v) => escolherModelo(Number(v))}
          className="gap-2"
        >
          {itens.map(({ selecao, modelo: m }) => {
            const temMapa = !!(m?.arq_shape || m?.arq_raster)
            const id = `mapa-mod-${selecao.id}`
            return (
              <label
                key={selecao.id}
                htmlFor={id}
                className={`flex items-start gap-3 rounded-lg border p-3 ${temMapa ? 'cursor-pointer hover:bg-muted/40' : 'opacity-60'} ${
                  m && idMod === m.id_mod ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <RadioGroupItem id={id} value={m ? String(m.id_mod) : `sem-${selecao.id}`} disabled={!temMapa} className="mt-1" />
                <div className="flex-1 space-y-1.5">
                  <div className="text-sm font-medium">{selecao.fonte_agua?.nome_fonte || `Fonte ${selecao.id_fonte}`}</div>
                  <div className="flex flex-wrap gap-1">
                    {(selecao.cenarios || []).map((c) => (
                      <span key={c} className="bg-blue-50 border border-blue-200 text-blue-700 rounded px-1.5 py-0.5 text-[11px]">
                        {c}
                      </span>
                    ))}
                    {(selecao.estrategias || []).map((e) => (
                      <span key={e} className="bg-emerald-50 border border-emerald-200 text-emerald-700 rounded px-1.5 py-0.5 text-[11px]">
                        {e}
                      </span>
                    ))}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {!m
                      ? 'Nenhum modelo cadastrado para esta combinação.'
                      : !temMapa
                        ? 'Modelo sem mapa associado.'
                        : [m.arq_shape && `Shape: ${m.desc_shape || m.arq_shape.split('/').pop()}`, m.arq_raster && `Raster: ${m.desc_raster || m.arq_raster.split('/').pop()}`]
                            .filter(Boolean)
                            .join(' · ')}
                  </div>
                </div>
              </label>
            )
          })}
        </RadioGroup>
      )}

      {/* Escolha do mapa quando o modelo tem shape e raster */}
      {modelo && temShape && temRaster && (
        <div className="rounded-lg border p-3 space-y-2">
          <p className="text-xs font-semibold text-muted-foreground">Mapa a exibir</p>
          <RadioGroup
            value={tipo || ''}
            onValueChange={(v) => {
              setShapes(null)
              setRaster(null)
              setTipo(v as TipoMapa)
              setExibido(null)
            }}
            className="grid grid-cols-1 md:grid-cols-2 gap-2"
          >
            {(['shape', 'raster'] as TipoMapa[]).map((t) => (
              <label key={t} htmlFor={`tipo-${t}`} className="flex items-start gap-2 rounded border p-2 cursor-pointer hover:bg-muted/40">
                <RadioGroupItem id={`tipo-${t}`} value={t} className="mt-0.5" />
                <div>
                  <div className="text-sm font-medium">{t === 'shape' ? 'Shape' : 'Raster'}</div>
                  <div className="text-xs text-muted-foreground">
                    {(t === 'shape' ? modelo.desc_shape : modelo.desc_raster) || 'Sem descrição'}
                  </div>
                </div>
              </label>
            ))}
          </RadioGroup>
        </div>
      )}

      {/* Configuração de mapa */}
      {modelo && tipo && (
        <>
          <Accordion type="single" collapsible>
            <AccordionItem value="config-mapa" className="border rounded-lg px-4">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline">Configuração de mapa</AccordionTrigger>
              <AccordionContent className="pb-4">
                {carregandoArquivo && (
                  <p className="text-sm text-muted-foreground flex items-center gap-2">
                    <Loader2 className="w-4 h-4 animate-spin" /> Lendo o arquivo do mapa...
                  </p>
                )}
                {erroArquivo && <p className="text-sm text-red-600">{erroArquivo}</p>}
                {!carregandoArquivo && !erroArquivo && tipo === 'shape' && shapes && (
                  <ConfigShapeForm shapes={shapes} config={cfgShape} onChange={setCfgShape} />
                )}
                {!carregandoArquivo && !erroArquivo && tipo === 'raster' && raster && (
                  <ConfigRasterForm raster={raster} banda={banda} config={cfgRaster} onChange={setCfgRaster} />
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button
            onClick={exibir}
            disabled={gerando || carregandoArquivo || !!erroArquivo || (tipo === 'shape' ? !shapes : !raster || !banda)}
          >
            {gerando || carregandoArquivo ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MapIcon className="w-4 h-4 mr-2" />}
            {gerando ? 'Gerando mapa...' : exibido ? 'Atualizar mapa' : 'Exibir mapa'}
          </Button>
        </>
      )}

      {/* Mapa */}
      {exibido && (
        <div ref={containerMapa} className="relative h-[560px] w-full rounded-lg border overflow-hidden">
          <SimpleMap
            key={enquadramento}
            defaultCenter={[-49.06, -22.31]}
            defaultZoom={10}
            bounds={(() => {
              const ext = exibido.tipo === 'shape' ? exibido.extensao : exibido.rep.extensaoLonLat
              return extensaoValida(ext) ? ext : null
            })()}
          >
            <TileLayer urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {exibido.tipo === 'raster' && camadasAtivas.has('__raster__') && (
              <RasterImagemLayer imagem={exibido.imagem} extensaoMerc={exibido.rep.extensaoMerc} opacidade={exibido.cfg.opacidade} />
            )}
            {exibido.tipo === 'raster' && <CliqueNoMapa onClick={cliqueRaster} />}
            {exibido.tipo === 'shape' &&
              exibido.camadas
                .filter((c) => camadasAtivas.has(c.nome))
                .map((c) => {
                  const cc = exibido.cfg.camadas[c.nome] || configCamadaPadrao()
                  return (
                    <GeoJSONLayer
                      key={c.nome}
                      data={c.geojson}
                      style={{ ...cc.estilo, classificacao: classificacaoParaRender(cc.classificacao) }}
                      onFeatureClick={(props) => abrirFeicao(c, props, exibido.cfg)}
                    />
                  )
                })}
          </SimpleMap>

          {/* Enquadrar o mapa na extensão da camada */}
          <button
            type="button"
            onClick={() => setEnquadramento((n) => n + 1)}
            className="absolute top-3 right-3 z-30 bg-background/95 rounded-md shadow border p-2 hover:bg-muted"
            title="Enquadrar no mapa"
          >
            <Maximize2 className="h-4 w-4 text-primary" />
          </button>

          {/* Painel de camadas */}
          {painelExpandido ? (
            <div className="absolute top-3 left-3 z-30 w-64 max-h-[calc(100%-1.5rem)] bg-background/95 rounded-xl shadow-lg border flex flex-col overflow-hidden">
              <div className="px-3 py-2 border-b bg-card flex items-center justify-between">
                <span className="font-semibold text-sm flex items-center gap-2">
                  <Layers className="h-4 w-4 text-primary" /> Camadas do Mapa
                </span>
                <button onClick={() => setPainelExpandido(false)} className="p-1 rounded hover:bg-muted text-muted-foreground" title="Recolher painel">
                  <X className="h-4 w-4" />
                </button>
              </div>
              <ScrollArea className="flex-1 p-3">
                <div className="space-y-2">
                  {(exibido.tipo === 'shape'
                    ? exibido.camadas.map((c) => ({ id: c.nome, nome: c.nome }))
                    : [{ id: '__raster__', nome: exibido.descricao }]
                  ).map((c) => (
                    <div key={c.id} className="flex items-start gap-2">
                      <Checkbox
                        id={`cam-${c.id}`}
                        checked={camadasAtivas.has(c.id)}
                        onCheckedChange={() =>
                          setCamadasAtivas((prev) => {
                            const n = new Set(prev)
                            if (n.has(c.id)) n.delete(c.id)
                            else n.add(c.id)
                            return n
                          })
                        }
                        className="mt-0.5"
                      />
                      <label htmlFor={`cam-${c.id}`} className="text-sm cursor-pointer leading-tight">
                        {c.nome}
                      </label>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </div>
          ) : (
            <button
              onClick={() => setPainelExpandido(true)}
              className="absolute top-3 left-3 z-30 bg-background/95 rounded-full shadow-lg border p-2.5 hover:bg-muted"
              title="Mostrar camadas"
            >
              <Layers className="h-5 w-5 text-primary" />
            </button>
          )}

          <Legenda exibido={exibido} ativas={camadasAtivas} />

          {/* Valor do pixel clicado */}
          {pixel && exibido.tipo === 'raster' && (
            <div
              className="absolute z-40 bg-white rounded-md shadow-lg border px-3 py-2 text-xs -translate-x-1/2 -translate-y-full"
              style={{ left: pixel.x, top: pixel.y - 8 }}
            >
              <button className="absolute top-1 right-1 text-muted-foreground hover:text-foreground" onClick={() => setPixel(null)}>
                <X className="h-3 w-3" />
              </button>
              <div className="font-semibold pr-4">
                Valor:{' '}
                {pixel.valor === 'carregando' ? '…' : pixel.valor === null ? 'sem dado' : fmt(pixel.valor)}
              </div>
              <div className="text-muted-foreground">
                {pixel.lat.toFixed(5)}, {pixel.lon.toFixed(5)}
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={!!feicao} onOpenChange={(v) => !v && setFeicao(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{feicao?.titulo}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            <dl className="divide-y">
              {feicao?.entradas.map(([k, v], i) => (
                <div key={`${k}-${i}`} className="grid grid-cols-2 gap-2 py-2 text-sm">
                  <dt className="font-medium text-muted-foreground break-words">{k}</dt>
                  <dd className="break-words">{v === null || v === undefined || v === '' ? '—' : String(v)}</dd>
                </div>
              ))}
              {feicao && feicao.entradas.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">Esta feição não possui atributos.</p>
              )}
            </dl>
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}

function Legenda({ exibido, ativas }: { exibido: Exibido; ativas: Set<string> }) {
  let conteudo: ReactNode = null
  if (exibido.tipo === 'raster') {
    if (!ativas.has('__raster__')) return null
    const { cfg, banda } = exibido
    conteudo =
      cfg.modo === 'continuo' ? (
        <div className="space-y-1">
          <div className="text-xs font-medium text-muted-foreground">{exibido.descricao}</div>
          <div className="h-3 rounded" style={{ background: `linear-gradient(to right, ${cfg.corInicial}, ${cfg.corFinal})` }} />
          <div className="flex justify-between text-xs">
            <span>{fmt(cfg.min ?? banda.min)}</span>
            <span>{fmt(cfg.max ?? banda.max)}</span>
          </div>
        </div>
      ) : (
        <div className="space-y-1.5">
          <div className="text-xs font-medium text-muted-foreground border-b pb-1">{exibido.descricao}</div>
          {cfg.classes.map((c, i) => (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span className="inline-block w-3.5 h-3.5 rounded-sm border" style={{ background: c.cor }} />
              {rotuloClasse(c)}
            </div>
          ))}
        </div>
      )
  } else {
    const itens = exibido.camadas.filter((c) => ativas.has(c.nome) && c.tipo)
    if (itens.length === 0) return null
    conteudo = (
      <div className="space-y-3">
        {itens.map((c) => {
          const cc = exibido.cfg.camadas[c.nome] || configCamadaPadrao()
          const cl = classificacaoParaRender(cc.classificacao)
          const tipo = c.tipo as 'point' | 'line' | 'polygon'
          if (cl) {
            const lista =
              cl.tipo === 'categorico'
                ? cl.categorias.map((k) => ({ cor: k.cor, rotulo: rotuloCategoria(k) }))
                : cl.classes.map((k) => ({ cor: k.cor, rotulo: rotuloClasse(k) }))
            return (
              <div key={c.nome} className="space-y-1.5">
                <div className="font-medium text-xs text-muted-foreground border-b pb-1">
                  {c.nome}
                  <span className="block font-normal text-foreground/60">{rotuloAtributoClassificacao(cl)}</span>
                </div>
                {lista.map((it, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <IconeLegendaMapa tipo={tipo} color={it.cor} estilo={cc.estilo} />
                    <span className="text-xs text-foreground/80">{it.rotulo}</span>
                  </div>
                ))}
              </div>
            )
          }
          return (
            <div key={c.nome} className="flex items-center gap-2">
              <IconeLegendaMapa tipo={tipo} color={cc.estilo.fillColor || cc.estilo.color} estilo={cc.estilo} />
              <span className="text-xs text-foreground/80">{c.nome}</span>
            </div>
          )
        })}
      </div>
    )
  }
  return (
    <div className="absolute bottom-4 right-4 z-10 bg-white/95 p-3 rounded-lg shadow-lg border w-56 text-sm">
      <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
        <Info className="w-4 h-4 text-primary" /> Legenda
      </h4>
      <ScrollArea type="always" className="max-h-[300px] pr-3">
        {conteudo}
      </ScrollArea>
    </div>
  )
}
