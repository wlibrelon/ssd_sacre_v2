import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Checkbox } from '@/components/ui/checkbox'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Layers, Loader2, Info, X } from 'lucide-react'
import { SimpleMap } from '@/components/map/SimpleMap'
import { TileLayer } from '@/components/map/TileLayer'
import { GeoJSONLayer } from '@/components/map/GeoJSONLayer'

// Rótulos amigáveis para os atributos internos que toda feição carrega além
// dos campos originais do shapefile (ver função obter_feicoes_camada no
// banco). Não são um "atributo" do dado em si, por isso ficam de fora da
// lista de atributos exibida na janela de detalhes.
const CAMPOS_INTERNOS = new Set(['id_feicao'])

type Camada = {
  id_camada: string
  nome: string
  descricao: string
  categoria: string
  tipo_dados: 'vetorial' | 'raster'
  fonte_raster_url: string
  estilo: any
  legenda: any
  zoom_min: number
  zoom_max: number
  visivel_por_padrao: boolean
}

export default function Camadas() {
  const [camadas, setCamadas] = useState<Camada[]>([])
  const [activeLayers, setActiveLayers] = useState<Set<string>>(new Set())
  const [bbox, setBbox] = useState<number[] | null>(null)
  const [zoom, setZoom] = useState(10)
  const [debouncedBbox, setDebouncedBbox] = useState<number[] | null>(null)
  const [layerData, setLayerData] = useState<Record<string, any>>({})
  const [loadingLayers, setLoadingLayers] = useState<Set<string>>(new Set())
  // Extensão [minLon, minLat, maxLon, maxLat] usada para abrir o mapa já
  // enquadrado na camada ativa por padrão. Calculada uma única vez no
  // carregamento inicial e repassada à prop `bounds` do SimpleMap.
  const [extensaoInicial, setExtensaoInicial] = useState<number[] | null>(null)
  // Painel de camadas flutuante: começa expandido.
  const [painelExpandido, setPainelExpandido] = useState(true)
  // Atributos da feição clicada no mapa, exibidos na janela de detalhes.
  const [featureSelecionada, setFeatureSelecionada] = useState<Record<string, any> | null>(null)

  useEffect(() => {
    supabase
      .from('camadas_mapa')
      .select('*')
      .eq('ativo', true)
      .order('ordem_exibicao')
      .then(({ data }) => {
        if (data && data.length > 0) {
          setCamadas(data)

          const defaultActive = new Set<string>()
          data.forEach((c) => {
            if (c.visivel_por_padrao) defaultActive.add(c.id_camada)
          })
          // Se nenhuma camada estiver marcada como "visível por padrão",
          // ativa a primeira da lista (já ordenada por ordem_exibicao) para
          // o mapa não abrir vazio.
          if (defaultActive.size === 0) {
            defaultActive.add(data[0].id_camada)
          }
          setActiveLayers(defaultActive)

          // Busca a extensão da primeira camada ativa, para abrir o mapa
          // já com o zoom ajustado a ela.
          const primeiraAtiva = data.find((c) => defaultActive.has(c.id_camada))
          if (primeiraAtiva) {
            supabase
              .rpc('obter_extensao_camada', { p_id_camada: primeiraAtiva.id_camada })
              .then(({ data: extensao, error }) => {
                // Proteção: só aceita o formato esperado [minLon, minLat,
                // maxLon, maxLat]; qualquer outro (ex.: objeto GeoJSON de
                // versões antigas da RPC) derrubaria o mapa no bounds.join.
                if (!error && Array.isArray(extensao) && extensao.length === 4) {
                  setExtensaoInicial(extensao as number[])
                } else {
                  // Não é um erro fatal (o mapa só abre na visão padrão em
                  // vez de ajustada à camada), mas avisa no console para
                  // facilitar o diagnóstico: ou a função RPC não existe
                  // (recarregue o schema cache do Supabase), ou a coluna
                  // 'bbox' dessa camada está nula (a importação não a
                  // calculou).
                  console.warn(
                    '[Camadas] Não foi possível obter a extensão da camada para zoom inicial:',
                    { id_camada: primeiraAtiva.id_camada, error },
                  )
                }
              })
          }
        }
      })
  }, [])

  useEffect(() => {
    const t = setTimeout(() => setDebouncedBbox(bbox), 500)
    return () => clearTimeout(t)
  }, [bbox])

  useEffect(() => {
    if (!debouncedBbox) return

    camadas.forEach((camada) => {
      if (activeLayers.has(camada.id_camada) && camada.tipo_dados === 'vetorial') {
        if (zoom < camada.zoom_min || zoom > camada.zoom_max) return

        setLoadingLayers((prev) => new Set(prev).add(camada.id_camada))

        supabase
          .rpc('obter_feicoes_camada', {
            p_id_camada: camada.id_camada,
            p_min_lon: debouncedBbox[0],
            p_min_lat: debouncedBbox[1],
            p_max_lon: debouncedBbox[2],
            p_max_lat: debouncedBbox[3],
            p_zoom: Math.round(zoom),
          })
          .then(({ data, error }) => {
            setLoadingLayers((prev) => {
              const next = new Set(prev)
              next.delete(camada.id_camada)
              return next
            })
            if (data && !error) {
              setLayerData((prev) => ({ ...prev, [camada.id_camada]: data }))
            }
          })
      }
    })
  }, [debouncedBbox, activeLayers, camadas, zoom])

  const groupedCamadas = useMemo(() => {
    const groups: Record<string, Camada[]> = {}
    camadas.forEach((c) => {
      if (!groups[c.categoria]) groups[c.categoria] = []
      groups[c.categoria].push(c)
    })
    return groups
  }, [camadas])

  const toggleLayer = (id: string) => {
    setActiveLayers((prev) => {
      const next = new Set(prev)
      if (next.has(id)) next.delete(id)
      else next.add(id)
      return next
    })
  }

  const activeCamadas = camadas.filter((c) => activeLayers.has(c.id_camada))

  const renderLegend = () => {
    if (activeCamadas.length === 0) return null
    return (
      <div className="absolute bottom-6 right-6 bg-white/95 backdrop-blur-sm p-4 rounded-lg shadow-lg border border-border/50 z-10 w-56 text-sm">
        <h3 className="font-semibold mb-3 flex items-center gap-2">
          <Info className="w-4 h-4 text-primary" /> Legenda
        </h3>
        <ScrollArea className="max-h-64 pr-3">
          <div className="space-y-4">
            {activeCamadas.map((c) => {
              if (!c.legenda || !Array.isArray(c.legenda) || c.legenda.length === 0) return null
              return (
                <div key={c.id_camada} className="space-y-2">
                  <div className="font-medium text-xs text-muted-foreground border-b pb-1">
                    {c.nome}
                  </div>
                  {c.legenda.map((leg: any, i: number) => (
                    <div key={i} className="flex items-center gap-2">
                      {leg.type === 'line' && (
                        <div className="w-5 h-0.5" style={{ backgroundColor: leg.color }} />
                      )}
                      {leg.type === 'polygon' && (
                        <div
                          className="w-4 h-4 rounded-sm opacity-60 border"
                          style={{ backgroundColor: leg.color, borderColor: leg.color }}
                        />
                      )}
                      {leg.type === 'point' && (
                        <div
                          className="w-3 h-3 rounded-full border border-white shadow-sm"
                          style={{ backgroundColor: leg.color }}
                        />
                      )}
                      <span className="text-xs text-foreground/80">{leg.label}</span>
                    </div>
                  ))}
                </div>
              )
            })}
          </div>
        </ScrollArea>
      </div>
    )
  }

  return (
    <div className="flex h-full w-full overflow-hidden relative">
      <div className="flex-1 relative bg-slate-100">
        <SimpleMap
          defaultCenter={[-46.6333, -23.5505]}
          defaultZoom={10}
          bounds={extensaoInicial as [number, number, number, number] | null}
          onBoundsChange={(b, z) => {
            setBbox(b)
            setZoom(z)
          }}
        >
          <TileLayer urlTemplate="https://tile.openstreetmap.org/{z}/{x}/{y}.png" />

          {activeCamadas
            .filter((c) => c.tipo_dados === 'raster')
            .map((c) => {
              if (zoom < c.zoom_min || zoom > c.zoom_max) return null
              return <TileLayer key={c.id_camada} urlTemplate={c.fonte_raster_url} />
            })}

          {activeCamadas
            .filter((c) => c.tipo_dados === 'vetorial')
            .map((c) => {
              if (zoom < c.zoom_min || zoom > c.zoom_max) return null
              const data = layerData[c.id_camada]
              if (!data) return null
              return (
                <GeoJSONLayer
                  key={c.id_camada}
                  data={data}
                  style={c.estilo}
                  onFeatureClick={setFeatureSelecionada}
                />
              )
            })}
        </SimpleMap>

        {/* Painel de camadas flutuante — canto superior esquerdo, recolhível */}
        {painelExpandido ? (
          <div className="absolute top-4 left-4 z-30 w-80 max-h-[calc(100%-2rem)] bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-xl shadow-lg border flex flex-col overflow-hidden">
            <div className="p-4 border-b bg-card flex items-center justify-between shrink-0">
              <h2 className="font-semibold text-base flex items-center gap-2">
                <Layers className="h-4 w-4 text-primary" /> Camadas do Mapa
              </h2>
              <button
                onClick={() => setPainelExpandido(false)}
                className="p-1.5 rounded hover:bg-muted text-muted-foreground transition-colors"
                title="Recolher painel"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-6">
                {Object.entries(groupedCamadas).map(([categoria, items]) => (
                  <div key={categoria} className="space-y-3">
                    <h3 className="font-medium text-sm text-primary tracking-tight uppercase">
                      {categoria}
                    </h3>
                    <div className="space-y-2">
                      {items.map((camada) => (
                        <div key={camada.id_camada} className="flex items-start space-x-3 group">
                          <Checkbox
                            id={camada.id_camada}
                            checked={activeLayers.has(camada.id_camada)}
                            onCheckedChange={() => toggleLayer(camada.id_camada)}
                            className="mt-0.5"
                          />
                          <div className="grid gap-1.5 leading-none flex-1">
                            <label
                              htmlFor={camada.id_camada}
                              className="text-sm font-medium leading-none cursor-pointer group-hover:text-primary transition-colors flex items-center gap-2"
                            >
                              {camada.nome}
                              {loadingLayers.has(camada.id_camada) && (
                                <Loader2 className="w-3 h-3 animate-spin text-muted-foreground" />
                              )}
                            </label>
                            {camada.descricao && (
                              <p className="text-xs text-muted-foreground line-clamp-2">
                                {camada.descricao}
                              </p>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
          </div>
        ) : (
          <button
            onClick={() => setPainelExpandido(true)}
            className="absolute top-4 left-4 z-30 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 rounded-full shadow-lg border p-3 hover:bg-muted transition-colors"
            title="Mostrar camadas"
          >
            <Layers className="h-5 w-5 text-primary" />
          </button>
        )}

        {renderLegend()}
      </div>

      <Dialog open={!!featureSelecionada} onOpenChange={(v) => !v && setFeatureSelecionada(null)}>
        <DialogContent className="max-w-lg">
          <DialogHeader>
            <DialogTitle>{featureSelecionada?.nome || 'Detalhes da Feição'}</DialogTitle>
          </DialogHeader>
          <ScrollArea className="max-h-[60vh] pr-4">
            {featureSelecionada && (
              <dl className="divide-y">
                {Object.entries(featureSelecionada)
                  .filter(([chave]) => !CAMPOS_INTERNOS.has(chave) && chave !== 'nome')
                  .map(([chave, valor]) => (
                    <div key={chave} className="grid grid-cols-2 gap-2 py-2 text-sm">
                      <dt className="font-medium text-muted-foreground break-words">{chave}</dt>
                      <dd className="text-foreground break-words">
                        {valor === null || valor === undefined || valor === ''
                          ? '—'
                          : String(valor)}
                      </dd>
                    </div>
                  ))}
                {Object.keys(featureSelecionada).filter(
                  (chave) => !CAMPOS_INTERNOS.has(chave) && chave !== 'nome',
                ).length === 0 && (
                  <p className="text-sm text-muted-foreground py-2">
                    Esta feição não possui outros atributos.
                  </p>
                )}
              </dl>
            )}
          </ScrollArea>
        </DialogContent>
      </Dialog>
    </div>
  )
}
