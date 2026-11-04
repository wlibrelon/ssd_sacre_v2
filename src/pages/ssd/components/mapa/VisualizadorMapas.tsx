// Visualizador de mapas da simulação: sobrepõe vários mapas (shapes e
// rasters) num único mapa, com painel de camadas (ligar/desligar, ordem,
// opacidade), legenda, atributos da feição clicada, valor dos pixels de
// todos os rasters ligados e, opcionalmente, as camadas da Área de Estudo
// como fundo. Usado na aba Mapa da Simulação e na pré-visualização do
// cadastro de mapas.
import { useCallback, useEffect, useMemo, useRef, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { AlertTriangle, ChevronDown, ChevronUp, Info, Layers, Loader2, LocateFixed, Maximize, Minimize, X } from 'lucide-react'
import { SimpleMap } from '@/components/map/SimpleMap'
import { TileLayer } from '@/components/map/TileLayer'
import { GeoJSONLayer } from '@/components/map/GeoJSONLayer'
import { normalizarCamposExibicao } from '@/lib/campos-exibicao'
import {
  construirClassificacao,
  rotuloAtributoClassificacao,
  rotuloCategoria,
  rotuloClasse,
  type Classificacao,
} from '@/lib/classificacao'
import { CliqueNoMapa, IconeLegendaMapa, RasterImagemLayer } from './CamadasMapa'
import {
  carregarBanda,
  carregarRaster,
  carregarShapes,
  classificacaoParaRender,
  colorirRaster,
  configCamadaPadrao,
  epsgSuportado,
  extensaoValida,
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
} from './dadosMapa'

export type ItemMapa = {
  id: string
  tipo: 'shape' | 'raster'
  arquivo: string
  nome: string
  config: any
  visivel: boolean
}

type Estado =
  | { status: 'carregando'; chave: string }
  | { status: 'erro'; chave: string; erro: string }
  | {
      status: 'ok'
      chave: string
      tipo: 'shape'
      camadas: CamadaShape[]
      cfg: ConfigShape
      extensao: Extensao | null
      aviso?: string
    }
  | {
      status: 'ok'
      chave: string
      tipo: 'raster'
      raster: RasterCarregado
      banda: RasterBanda
      rep: RasterReprojetado
      imagem: string
      epsg: number
      cfg: ConfigRaster
      nodata: number | null
      extensao: Extensao
      aviso?: string
    }

type CamadaAE = {
  id_camada: string
  nome: string
  descricao: string
  categoria: string
  tipo_dados: 'vetorial' | 'raster'
  fonte_raster_url: string
  estilo: any
  tipo_geometria: 'point' | 'line' | 'polygon' | null
  campos_exibicao: unknown
  campo_classificacao: string | null
  tipo_classificacao: string | null
  classificacao: unknown
  zoom_min: number
  zoom_max: number
}

const LIMITE_FEICOES = 20000
const LIMITE_PIXELS = 50_000_000
const fmt = (v: number) => v.toLocaleString('pt-BR', { maximumFractionDigits: 4 })
const chaveItem = (i: ItemMapa) => `${i.arquivo}|${JSON.stringify(i.config ?? {})}`

async function processar(item: ItemMapa): Promise<Estado> {
  const chave = chaveItem(item)
  try {
    if (item.tipo === 'shape') {
      const cfg = normalizarConfigShape(item.config)
      if (cfg.epsg && !epsgSuportado(cfg.epsg)) throw new Error(`EPSG ${cfg.epsg} não é suportado.`)
      const brutos = await carregarShapes(item.arquivo, cfg.dbf_encoding)
      const camadas = brutos.map((b) => prepararCamadaShape(b, cfg.epsg))
      const fora = camadas.filter((c) => c.extensao && !extensaoValida(c.extensao)).map((c) => c.nome)
      if (fora.length > 0)
        throw new Error(
          `Coordenadas fora da faixa (${fora.join(', ')}): o sistema de coordenadas não foi reconhecido. Informe o EPSG de origem na configuração do mapa.`,
        )
      const total = camadas.reduce((n, c) => n + c.geojson.features.length, 0)
      return {
        status: 'ok',
        chave,
        tipo: 'shape',
        camadas,
        cfg,
        extensao: unirExtensoes(camadas.map((c) => c.extensao)),
        aviso: total > LIMITE_FEICOES ? `${total.toLocaleString('pt-BR')} feições — o mapa pode ficar lento.` : undefined,
      }
    }
    const cfg = normalizarConfigRaster(item.config)
    const raster = await carregarRaster(item.arquivo)
    const epsg = cfg.epsg ?? raster.epsgDetectado
    if (!epsg) throw new Error('O arquivo não informa o sistema de coordenadas. Informe o EPSG de origem na configuração do mapa.')
    if (!epsgSuportado(epsg)) throw new Error(`EPSG ${epsg} não é suportado.`)
    if (cfg.modo === 'classes' && cfg.classes.length === 0)
      throw new Error('Coloração por classes sem classes configuradas.')
    const nodata = cfg.nodata ?? raster.nodataArquivo
    const bandaIdx = Math.min(cfg.banda, raster.bandas - 1)
    const banda = await carregarBanda(item.arquivo, raster, bandaIdx, nodata)
    await new Promise((r) => setTimeout(r, 0))
    const rep = reprojetarRaster(raster, banda, epsg)
    if (!extensaoValida(rep.extensaoLonLat))
      throw new Error('Coordenadas fora da faixa: confira o EPSG de origem na configuração do mapa.')
    const imagem = colorirRaster(banda, rep, cfg, nodata)
    return {
      status: 'ok',
      chave,
      tipo: 'raster',
      raster,
      banda,
      rep,
      imagem,
      epsg,
      cfg,
      nodata,
      extensao: rep.extensaoLonLat,
      aviso:
        raster.largura * raster.altura > LIMITE_PIXELS
          ? 'Arquivo grande — exibido em resolução reduzida; o valor ao clicar usa a resolução original.'
          : undefined,
    }
  } catch (err: any) {
    return { status: 'erro', chave, erro: err?.message || 'Não foi possível exibir o mapa.' }
  }
}

export function VisualizadorMapas({
  itens,
  areaEstudo = true,
  altura = 560,
}: {
  itens: ItemMapa[]
  areaEstudo?: boolean
  altura?: number
}) {
  // ── Estado das camadas dos modelos ────────────────────────────────────────
  const [estados, setEstados] = useState<Record<string, Estado>>({})
  const [visiveis, setVisiveis] = useState<Set<string>>(new Set())
  const [ocultas, setOcultas] = useState<Set<string>>(new Set()) // `${id}::${camada}`
  const [ordem, setOrdem] = useState<string[]>([])
  const [opacidade, setOpacidade] = useState<Record<string, number>>({})
  const processando = useRef<Record<string, string>>({})
  // Enquadrar na extensão dos mapas assim que os visíveis terminarem de carregar
  const pedidoEnquadrar = useRef(true)

  const chaveIds = itens.map((i) => i.id).join(',')
  useEffect(() => {
    setVisiveis(new Set(itens.filter((i) => i.visivel).map((i) => i.id)))
    setOrdem(itens.map((i) => i.id))
    setOcultas(new Set())
    pedidoEnquadrar.current = true
  }, [chaveIds])

  // Processa (carrega/reprojeta/colore) os mapas visíveis cuja configuração mudou
  useEffect(() => {
    itens.forEach((item) => {
      const jaCarregado = !!estados[item.id]
      if (!visiveis.has(item.id) && !jaCarregado) return // carrega só ao ligar pela 1ª vez
      const chave = chaveItem(item)
      if (estados[item.id]?.chave === chave || processando.current[item.id] === chave) return
      processando.current[item.id] = chave
      setEstados((p) => ({ ...p, [item.id]: { status: 'carregando', chave } }))
      processar(item).then((est) => {
        if (processando.current[item.id] !== chave) return
        delete processando.current[item.id]
        setEstados((p) => ({ ...p, [item.id]: est }))
      })
    })
  }, [itens, visiveis, estados])

  const porId = useMemo(() => Object.fromEntries(itens.map((i) => [i.id, i])), [itens])
  const ordenados = ordem.map((id) => porId[id]).filter(Boolean) as ItemMapa[]
  const shapesOrd = ordenados.filter((i) => i.tipo === 'shape')
  const rastersOrd = ordenados.filter((i) => i.tipo === 'raster')

  const mover = (id: string, delta: number) =>
    setOrdem((prev) => {
      const tipo = porId[id]?.tipo
      const mesmos = prev.filter((x) => porId[x]?.tipo === tipo)
      const i = mesmos.indexOf(id)
      const j = i + delta
      if (j < 0 || j >= mesmos.length) return prev
      ;[mesmos[i], mesmos[j]] = [mesmos[j], mesmos[i]]
      const outros = prev.filter((x) => porId[x]?.tipo !== tipo)
      return tipo === 'shape' ? [...mesmos, ...outros] : [...outros, ...mesmos]
    })

  const alternar = (id: string) =>
    setVisiveis((prev) => {
      const n = new Set(prev)
      if (n.has(id)) n.delete(id)
      else n.add(id)
      return n
    })

  // ── Enquadramento ─────────────────────────────────────────────────────────
  const [boundsAlvo, setBoundsAlvo] = useState<Extensao | null>(null)
  const [chaveMapa, setChaveMapa] = useState(0)

  const extensaoVisivel = useCallback(() => {
    const exts = Array.from(visiveis)
      .map((id) => estados[id])
      .filter((e): e is Extract<Estado, { status: 'ok' }> => e?.status === 'ok')
      .map((e) => e.extensao)
    const u = unirExtensoes(exts)
    return extensaoValida(u) ? u : null
  }, [visiveis, estados])

  const enquadrar = useCallback(() => {
    const ext = extensaoVisivel()
    if (!ext) return
    setBoundsAlvo(ext)
    setChaveMapa((k) => k + 1)
  }, [extensaoVisivel])

  useEffect(() => {
    if (!pedidoEnquadrar.current) return
    const pendentes = Array.from(visiveis).some((id) => !estados[id] || estados[id].status === 'carregando')
    if (pendentes) return
    pedidoEnquadrar.current = false
    enquadrar()
  }, [estados, visiveis, enquadrar])

  // ── Roda do mouse: só zoom, sem rolar a página ────────────────────────────
  const containerRef = useRef<HTMLDivElement | null>(null)
  useEffect(() => {
    const el = containerRef.current
    if (!el) return
    const bloquear = (e: WheelEvent) => e.preventDefault()
    el.addEventListener('wheel', bloquear, { passive: false })
    return () => el.removeEventListener('wheel', bloquear)
  }, [])

  // ── Área de Estudo (fundo opcional) ───────────────────────────────────────
  const [camadasAE, setCamadasAE] = useState<CamadaAE[]>([])
  const [ativasAE, setAtivasAE] = useState<Set<string>>(new Set())
  const [dadosAE, setDadosAE] = useState<Record<string, any>>({})
  const [bbox, setBbox] = useState<number[] | null>(null)
  const [zoom, setZoom] = useState(10)
  const [bboxDebounced, setBboxDebounced] = useState<number[] | null>(null)

  useEffect(() => {
    if (!areaEstudo) return
    supabase
      .from('camadas_mapa')
      .select('*')
      .eq('ativo', true)
      .order('ordem_exibicao')
      .then(({ data }) => setCamadasAE((data as any[]) || []))
  }, [areaEstudo])

  const aoMudarLimites = useCallback((b: number[], z: number) => {
    setBbox(b)
    setZoom(z)
  }, [])
  useEffect(() => {
    const t = setTimeout(() => setBboxDebounced(bbox), 500)
    return () => clearTimeout(t)
  }, [bbox])

  useEffect(() => {
    if (!bboxDebounced) return
    camadasAE.forEach((c) => {
      if (!ativasAE.has(c.id_camada) || c.tipo_dados !== 'vetorial') return
      if (zoom < c.zoom_min || zoom > c.zoom_max) return
      supabase
        .rpc('obter_feicoes_camada', {
          p_id_camada: c.id_camada,
          p_min_lon: bboxDebounced[0],
          p_min_lat: bboxDebounced[1],
          p_max_lon: bboxDebounced[2],
          p_max_lat: bboxDebounced[3],
          p_zoom: Math.round(zoom),
        })
        .then(({ data, error }) => {
          if (data && !error) setDadosAE((p) => ({ ...p, [c.id_camada]: data }))
        })
    })
  }, [bboxDebounced, ativasAE, camadasAE, zoom])

  // ── Cliques ───────────────────────────────────────────────────────────────
  const [feicao, setFeicao] = useState<{ titulo: string; entradas: [string, any][] } | null>(null)
  const [pixel, setPixel] = useState<{
    x: number
    y: number
    lon: number
    lat: number
    valores: { nome: string; valor: number | null | 'carregando' }[]
  } | null>(null)

  const abrirFeicaoShape = (item: ItemMapa, est: Extract<Estado, { tipo: 'shape' }>, camada: CamadaShape, props: Record<string, any>) => {
    const cc = est.cfg.camadas[camada.nome] || configCamadaPadrao()
    const nomeados = camada.campos.filter((c) => (cc.nomesAtributos[c] || '').trim() !== '')
    const entradas: [string, any][] =
      nomeados.length > 0
        ? nomeados.filter((c) => c in props).map((c) => [cc.nomesAtributos[c].trim(), props[c]])
        : Object.entries(props)
    const titulo =
      cc.campoNome && props[cc.campoNome] ? String(props[cc.campoNome]) : est.camadas.length > 1 ? camada.nome : item.nome
    setFeicao({ titulo, entradas })
  }

  const abrirFeicaoAE = (c: CamadaAE, props: Record<string, any>) => {
    const campos = normalizarCamposExibicao(c.campos_exibicao)
    const entradas: [string, any][] =
      campos.length > 0
        ? campos.filter(({ campo }) => campo in props).map(({ campo, nome_exibicao }) => [nome_exibicao, props[campo]])
        : Object.entries(props).filter(([k]) => k !== 'id_feicao' && k !== 'nome')
    setFeicao({ titulo: props?.nome || c.nome, entradas })
  }

  const rastersVisiveis = rastersOrd.filter((i) => visiveis.has(i.id) && estados[i.id]?.status === 'ok')
  const cliqueFundo = async (lon: number, lat: number, x: number, y: number) => {
    if (rastersVisiveis.length === 0) return
    const base = rastersVisiveis.map((i) => ({ nome: i.nome, valor: 'carregando' as const }))
    setPixel({ x, y, lon, lat, valores: base })
    const valores = await Promise.all(
      rastersVisiveis.map(async (i) => {
        const est = estados[i.id] as Extract<Estado, { tipo: 'raster' }>
        try {
          const v = await valorDoPixel(est.raster, est.banda.banda, est.epsg, lon, lat)
          return { nome: i.nome, valor: v !== null && est.nodata !== null && v === est.nodata ? null : v }
        } catch {
          return { nome: i.nome, valor: null }
        }
      }),
    )
    setPixel({ x, y, lon, lat, valores })
  }

  // ── Render ────────────────────────────────────────────────────────────────
  const op = (id: string, padrao: number) => opacidade[id] ?? padrao

  const desenharRaster = (i: ItemMapa) => {
    const est = estados[i.id]
    if (!visiveis.has(i.id) || est?.status !== 'ok' || est.tipo !== 'raster') return null
    return (
      <RasterImagemLayer key={`r-${i.id}`} imagem={est.imagem} extensaoMerc={est.rep.extensaoMerc} opacidade={op(i.id, est.cfg.opacidade)} />
    )
  }

  const desenharShape = (i: ItemMapa) => {
    const est = estados[i.id]
    if (!visiveis.has(i.id) || est?.status !== 'ok' || est.tipo !== 'shape') return null
    return (
      <div key={`s-${i.id}`} className="absolute inset-0 pointer-events-none" style={{ opacity: op(i.id, 1) }}>
        {est.camadas
          .filter((c) => !ocultas.has(`${i.id}::${c.nome}`))
          .map((c) => {
            const cc = est.cfg.camadas[c.nome] || configCamadaPadrao()
            return (
              <GeoJSONLayer
                key={c.nome}
                data={c.geojson}
                style={{ ...cc.estilo, classificacao: classificacaoParaRender(cc.classificacao) }}
                onFeatureClick={(props) => abrirFeicaoShape(i, est, c, props)}
              />
            )
          })}
      </div>
    )
  }

  const camadasAEAtivas = camadasAE.filter((c) => ativasAE.has(c.id_camada) && zoom >= c.zoom_min && zoom <= c.zoom_max)

  const linhaItem = (i: ItemMapa, lista: ItemMapa[]) => {
    const est = estados[i.id]
    const idx = lista.indexOf(i)
    return (
      <div key={i.id} className="space-y-1 border-b pb-2 last:border-0">
        <div className="flex items-start gap-2">
          <Checkbox id={`vm-${i.id}`} checked={visiveis.has(i.id)} onCheckedChange={() => alternar(i.id)} className="mt-0.5" />
          <label htmlFor={`vm-${i.id}`} className="text-sm cursor-pointer leading-tight flex-1">
            {i.nome}
            {est?.status === 'carregando' && <Loader2 className="inline w-3 h-3 ml-1 animate-spin text-muted-foreground" />}
          </label>
          <div className="flex flex-col">
            <button className="text-muted-foreground hover:text-foreground disabled:opacity-30" disabled={idx === 0} onClick={() => mover(i.id, -1)} title="Subir">
              <ChevronUp className="w-3.5 h-3.5" />
            </button>
            <button
              className="text-muted-foreground hover:text-foreground disabled:opacity-30"
              disabled={idx === lista.length - 1}
              onClick={() => mover(i.id, 1)}
              title="Descer"
            >
              <ChevronDown className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
        {est?.status === 'erro' && <p className="text-[11px] text-red-600 ml-6">{est.erro}</p>}
        {est?.status === 'ok' && est.aviso && (
          <p className="text-[11px] text-amber-600 ml-6 flex gap-1">
            <AlertTriangle className="w-3 h-3 shrink-0 mt-0.5" />
            {est.aviso}
          </p>
        )}
        {visiveis.has(i.id) && est?.status === 'ok' && (
          <div className="ml-6 space-y-1">
            <label className="flex items-center gap-2 text-[11px] text-muted-foreground">
              Opacidade
              <input
                type="range"
                min={0}
                max={1}
                step={0.05}
                value={op(i.id, est.tipo === 'raster' ? est.cfg.opacidade : 1)}
                onChange={(e) => setOpacidade((p) => ({ ...p, [i.id]: Number(e.target.value) }))}
                className="flex-1 h-1 accent-primary"
              />
            </label>
            {est.tipo === 'shape' &&
              est.camadas.length > 1 &&
              est.camadas.map((c) => {
                const k = `${i.id}::${c.nome}`
                return (
                  <label key={k} className="flex items-center gap-2 text-xs cursor-pointer">
                    <Checkbox
                      checked={!ocultas.has(k)}
                      onCheckedChange={() =>
                        setOcultas((prev) => {
                          const n = new Set(prev)
                          if (n.has(k)) n.delete(k)
                          else n.add(k)
                          return n
                        })
                      }
                      className="h-3.5 w-3.5"
                    />
                    {c.nome}
                  </label>
                )
              })}
          </div>
        )}
      </div>
    )
  }

  const [painelAberto, setPainelAberto] = useState(true)

  // ── Tela cheia (Fullscreen API do navegador; sai com Esc ou pelo botão) ───
  const [telaCheia, setTelaCheia] = useState(false)
  useEffect(() => {
    const aoMudar = () => setTelaCheia(document.fullscreenElement === containerRef.current)
    document.addEventListener('fullscreenchange', aoMudar)
    return () => document.removeEventListener('fullscreenchange', aoMudar)
  }, [])
  const alternarTelaCheia = async () => {
    try {
      if (document.fullscreenElement) await document.exitFullscreen()
      else await containerRef.current?.requestFullscreen()
    } catch {
      // Navegador sem suporte ou recusou — o mapa continua no tamanho normal
    }
  }

  return (
    <div
      ref={containerRef}
      className={`relative w-full overflow-hidden bg-white ${telaCheia ? '' : 'rounded-lg border'}`}
      style={{ height: telaCheia ? '100vh' : altura }}
    >
      <SimpleMap key={chaveMapa} defaultCenter={[-49.06, -22.31]} defaultZoom={10} bounds={boundsAlvo} onBoundsChange={aoMudarLimites}>
        <TileLayer urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />
        {camadasAEAtivas
          .filter((c) => c.tipo_dados === 'raster' && c.fonte_raster_url)
          .map((c) => (
            <TileLayer key={`ae-r-${c.id_camada}`} urlTemplate={c.fonte_raster_url} />
          ))}
        {/* Rasters dos modelos: o primeiro da lista fica por cima */}
        {[...rastersOrd].reverse().map(desenharRaster)}
        {camadasAEAtivas
          .filter((c) => c.tipo_dados === 'vetorial' && dadosAE[c.id_camada])
          .map((c) => (
            <GeoJSONLayer
              key={`ae-v-${c.id_camada}`}
              data={dadosAE[c.id_camada]}
              style={{ ...c.estilo, classificacao: construirClassificacao(c) }}
              onFeatureClick={(props) => abrirFeicaoAE(c, props)}
            />
          ))}
        {[...shapesOrd].reverse().map(desenharShape)}
        <CliqueNoMapa onClick={cliqueFundo} />
      </SimpleMap>

      <div className="absolute top-3 right-3 z-30 flex gap-2">
        <button
          type="button"
          onClick={enquadrar}
          className="bg-background/95 rounded-md shadow border p-2 hover:bg-muted"
          title="Enquadrar nos mapas ligados"
        >
          <LocateFixed className="h-4 w-4 text-primary" />
        </button>
        <button
          type="button"
          onClick={alternarTelaCheia}
          className="bg-background/95 rounded-md shadow border p-2 hover:bg-muted"
          title={telaCheia ? 'Sair da tela cheia (Esc)' : 'Tela cheia'}
        >
          {telaCheia ? <Minimize className="h-4 w-4 text-primary" /> : <Maximize className="h-4 w-4 text-primary" />}
        </button>
      </div>

      {painelAberto ? (
        <div className="absolute top-3 left-3 z-30 w-72 max-h-[calc(100%-1.5rem)] bg-background/95 rounded-xl shadow-lg border flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b bg-card flex items-center justify-between">
            <span className="font-semibold text-sm flex items-center gap-2">
              <Layers className="h-4 w-4 text-primary" /> Camadas do Mapa
            </span>
            <button onClick={() => setPainelAberto(false)} className="p-1 rounded hover:bg-muted text-muted-foreground" title="Recolher painel">
              <X className="h-4 w-4" />
            </button>
          </div>
          <ScrollArea className="flex-1 p-3">
            <div className="space-y-3">
              {shapesOrd.length > 0 && (
                <Grupo titulo="Vetoriais">{shapesOrd.map((i) => linhaItem(i, shapesOrd))}</Grupo>
              )}
              {rastersOrd.length > 0 && (
                <Grupo titulo="Rasters">{rastersOrd.map((i) => linhaItem(i, rastersOrd))}</Grupo>
              )}
              {areaEstudo && camadasAE.length > 0 && (
                <Grupo titulo="Área de Estudo (fundo)">
                  {camadasAE.map((c) => (
                    <label key={c.id_camada} className="flex items-start gap-2 text-sm cursor-pointer">
                      <Checkbox
                        checked={ativasAE.has(c.id_camada)}
                        onCheckedChange={() =>
                          setAtivasAE((prev) => {
                            const n = new Set(prev)
                            if (n.has(c.id_camada)) n.delete(c.id_camada)
                            else n.add(c.id_camada)
                            return n
                          })
                        }
                        className="mt-0.5"
                      />
                      <span className="leading-tight">{c.nome}</span>
                    </label>
                  ))}
                </Grupo>
              )}
              {itens.length === 0 && <p className="text-xs text-muted-foreground">Nenhum mapa para exibir.</p>}
            </div>
          </ScrollArea>
        </div>
      ) : (
        <button
          onClick={() => setPainelAberto(true)}
          className="absolute top-3 left-3 z-30 bg-background/95 rounded-full shadow-lg border p-2.5 hover:bg-muted"
          title="Mostrar camadas"
        >
          <Layers className="h-5 w-5 text-primary" />
        </button>
      )}

      <Legenda
        itens={ordenados.filter((i) => visiveis.has(i.id))}
        estados={estados}
        ocultas={ocultas}
        camadasAE={camadasAEAtivas.filter((c) => c.tipo_dados === 'vetorial')}
        dadosAE={dadosAE}
      />

      {pixel && (
        <div
          className="absolute z-40 bg-white rounded-md shadow-lg border px-3 py-2 text-xs -translate-x-1/2 -translate-y-full max-w-[280px]"
          style={{ left: pixel.x, top: pixel.y - 8 }}
        >
          <button className="absolute top-1 right-1 text-muted-foreground hover:text-foreground" onClick={() => setPixel(null)}>
            <X className="h-3 w-3" />
          </button>
          <div className="space-y-0.5 pr-4">
            {pixel.valores.map((v, k) => (
              <div key={k}>
                <span className="text-muted-foreground">{v.nome}: </span>
                <span className="font-semibold">{v.valor === 'carregando' ? '…' : v.valor === null ? 'sem dado' : fmt(v.valor)}</span>
              </div>
            ))}
          </div>
          <div className="text-muted-foreground mt-1">
            {pixel.lat.toFixed(5)}, {pixel.lon.toFixed(5)}
          </div>
        </div>
      )}

      {/* Atributos da feição — painel dentro do mapa, para funcionar também em tela cheia */}
      {feicao && (
        <div className="absolute top-14 right-3 z-40 w-80 max-h-[calc(100%-5rem)] bg-background rounded-xl shadow-lg border flex flex-col overflow-hidden">
          <div className="px-3 py-2 border-b bg-card flex items-start justify-between gap-2">
            <span className="font-semibold text-sm break-words">{feicao.titulo}</span>
            <button onClick={() => setFeicao(null)} className="p-1 rounded hover:bg-muted text-muted-foreground shrink-0" title="Fechar">
              <X className="h-4 w-4" />
            </button>
          </div>
          <div className="overflow-y-auto px-3">
            <dl className="divide-y">
              {feicao.entradas.map(([k, v], i) => (
                <div key={`${k}-${i}`} className="grid grid-cols-2 gap-2 py-2 text-sm">
                  <dt className="font-medium text-muted-foreground break-words">{k}</dt>
                  <dd className="break-words">{v === null || v === undefined || v === '' ? '—' : String(v)}</dd>
                </div>
              ))}
              {feicao.entradas.length === 0 && (
                <p className="text-sm text-muted-foreground py-2">Esta feição não possui atributos.</p>
              )}
            </dl>
          </div>
        </div>
      )}
    </div>
  )
}

function Grupo({ titulo, children }: { titulo: string; children: ReactNode }) {
  return (
    <div className="space-y-2">
      <div className="text-[11px] font-semibold uppercase tracking-wide text-primary">{titulo}</div>
      {children}
    </div>
  )
}

function inferirTipo(data: any): 'point' | 'line' | 'polygon' | null {
  const t = data?.features?.[0]?.geometry?.type || ''
  if (t.includes('Point')) return 'point'
  if (t.includes('Line')) return 'line'
  if (t.includes('Polygon')) return 'polygon'
  return null
}

function LegendaVetorial({
  titulo,
  tipo,
  estilo,
  classificacao,
}: {
  titulo: string
  tipo: 'point' | 'line' | 'polygon'
  estilo: any
  classificacao: Classificacao | null
}) {
  if (classificacao) {
    const lista =
      classificacao.tipo === 'categorico'
        ? classificacao.categorias.map((k) => ({ cor: k.cor, rotulo: rotuloCategoria(k) }))
        : classificacao.classes.map((k) => ({ cor: k.cor, rotulo: rotuloClasse(k) }))
    return (
      <div className="space-y-1.5">
        <div className="font-medium text-xs text-muted-foreground border-b pb-1">
          {titulo}
          <span className="block font-normal text-foreground/60">{rotuloAtributoClassificacao(classificacao)}</span>
        </div>
        {lista.map((it, i) => (
          <div key={i} className="flex items-center gap-2">
            <IconeLegendaMapa tipo={tipo} color={it.cor} estilo={estilo} />
            <span className="text-xs text-foreground/80">{it.rotulo}</span>
          </div>
        ))}
      </div>
    )
  }
  return (
    <div className="flex items-center gap-2">
      <IconeLegendaMapa tipo={tipo} color={estilo?.fillColor || estilo?.color || '#3388ff'} estilo={estilo} />
      <span className="text-xs text-foreground/80">{titulo}</span>
    </div>
  )
}

function Legenda({
  itens,
  estados,
  ocultas,
  camadasAE,
  dadosAE,
}: {
  itens: ItemMapa[]
  estados: Record<string, Estado>
  ocultas: Set<string>
  camadasAE: CamadaAE[]
  dadosAE: Record<string, any>
}) {
  const blocos: ReactNode[] = []
  itens.forEach((i) => {
    const est = estados[i.id]
    if (est?.status !== 'ok') return
    if (est.tipo === 'raster') {
      const { cfg, banda } = est
      blocos.push(
        cfg.modo === 'continuo' ? (
          <div key={i.id} className="space-y-1">
            <div className="text-xs font-medium text-muted-foreground">{i.nome}</div>
            <div className="h-3 rounded" style={{ background: `linear-gradient(to right, ${cfg.corInicial}, ${cfg.corFinal})` }} />
            <div className="flex justify-between text-xs">
              <span>{fmt(cfg.min ?? banda.min)}</span>
              <span>{fmt(cfg.max ?? banda.max)}</span>
            </div>
          </div>
        ) : (
          <div key={i.id} className="space-y-1.5">
            <div className="text-xs font-medium text-muted-foreground border-b pb-1">{i.nome}</div>
            {cfg.classes.map((c, k) => (
              <div key={k} className="flex items-center gap-2 text-xs">
                <span className="inline-block w-3.5 h-3.5 rounded-sm border" style={{ background: c.cor }} />
                {rotuloClasse(c)}
              </div>
            ))}
          </div>
        ),
      )
      return
    }
    est.camadas
      .filter((c) => c.tipo && !ocultas.has(`${i.id}::${c.nome}`))
      .forEach((c) => {
        const cc = est.cfg.camadas[c.nome] || configCamadaPadrao()
        blocos.push(
          <LegendaVetorial
            key={`${i.id}-${c.nome}`}
            titulo={est.camadas.length > 1 ? `${i.nome} — ${c.nome}` : i.nome}
            tipo={c.tipo as 'point' | 'line' | 'polygon'}
            estilo={cc.estilo}
            classificacao={classificacaoParaRender(cc.classificacao)}
          />,
        )
      })
  })
  camadasAE.forEach((c) => {
    const tipo = c.tipo_geometria || inferirTipo(dadosAE[c.id_camada])
    if (!tipo) return
    blocos.push(
      <LegendaVetorial
        key={`ae-${c.id_camada}`}
        titulo={c.descricao || c.nome}
        tipo={tipo}
        estilo={c.estilo}
        classificacao={construirClassificacao(c)}
      />,
    )
  })
  if (blocos.length === 0) return null
  return (
    <div className="absolute bottom-4 right-4 z-10 bg-white/95 p-3 rounded-lg shadow-lg border w-60 text-sm">
      <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
        <Info className="w-4 h-4 text-primary" /> Legenda
      </h4>
      <ScrollArea type="always" className="max-h-[260px] pr-3">
        <div className="space-y-3">{blocos}</div>
      </ScrollArea>
    </div>
  )
}
