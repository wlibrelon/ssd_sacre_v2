// Aba "Mapa" da Simulação: sobrepõe os mapas (shapes e rasters) associados
// aos modelos das fontes selecionadas, como informação complementar para
// interpretar os resultados. A configuração de cada mapa vem do cadastro
// (Configurações → Mapas para simulação) e pode ser ajustada aqui só para a
// visualização do momento, sem gravar.
import { useCallback, useEffect, useMemo, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from '@/components/ui/accordion'
import { Loader2, Map as MapIcon, RotateCcw } from 'lucide-react'
import { ConfigShapeForm } from './ConfigShape'
import { ConfigRasterForm } from './ConfigRaster'
import { VisualizadorMapas, type ItemMapa } from './VisualizadorMapas'
import { useArquivoMapa } from './useArquivoMapa'
import { limparCacheMapas, nomeDoArquivo, normalizarConfigRaster, normalizarConfigShape } from './dadosMapa'

type Selecao = {
  id: string
  id_fonte: number
  cenarios: string[]
  estrategias: string[]
  fonte_agua?: { nome_fonte: string }
}

type MapaCadastro = { id_mapa: number; tipo: 'shape' | 'raster'; arquivo: string; descricao: string | null; config: any }

type ModeloComMapas = {
  id_mod: number
  id_fonte: number
  cenario: any
  estrategia: any
  modelo_mapas: { ordem: number; visivel_padrao: boolean; mapas: MapaCadastro | null }[]
}

type MapaUniao = MapaCadastro & { visivel: boolean }

const chave = (v: any) => JSON.stringify((Array.isArray(v) ? v : []).map(String).sort())
const nomeMapa = (m: MapaCadastro) => m.descricao || nomeDoArquivo(m.arquivo)

/** Mapas dos modelos marcados, sem repetição (um mapa compartilhado aparece
 * uma vez), na ordem: modelos na ordem da lista e, dentro de cada modelo, na
 * ordem do cadastro. Fica ligado se algum modelo o tiver como "Ligado". */
function unirMapas(modelos: ModeloComMapas[], marcados: number[]): MapaUniao[] {
  const porId = new Map<number, MapaUniao>()
  marcados.forEach((idMod) => {
    const m = modelos.find((x) => x.id_mod === idMod)
    ;[...(m?.modelo_mapas || [])]
      .sort((a, b) => a.ordem - b.ordem)
      .forEach((a) => {
        if (!a.mapas) return
        const atual = porId.get(a.mapas.id_mapa)
        if (atual) atual.visivel = atual.visivel || a.visivel_padrao
        else porId.set(a.mapas.id_mapa, { ...a.mapas, visivel: a.visivel_padrao })
      })
  })
  return Array.from(porId.values())
}

export function ExibicaoMapa({ selecoes }: { selecoes: Selecao[] }) {
  const [modelos, setModelos] = useState<ModeloComMapas[]>([])
  const [carregandoModelos, setCarregandoModelos] = useState(false)
  const [marcados, setMarcados] = useState<number[]>([])
  const [ajustes, setAjustes] = useState<Record<number, any>>({}) // configs temporárias por id_mapa
  const [mapaConfig, setMapaConfig] = useState<string>('')
  const [itensExibidos, setItensExibidos] = useState<ItemMapa[] | null>(null)
  const [gerando, setGerando] = useState(false)

  useEffect(() => {
    limparCacheMapas()
  }, [])

  const idsFontes = useMemo(() => Array.from(new Set(selecoes.map((s) => s.id_fonte))).sort(), [selecoes])

  const buscarModelos = useCallback(async (): Promise<ModeloComMapas[]> => {
    if (idsFontes.length === 0) return []
    const { data, error } = await supabase
      .from('modelos')
      .select('id_mod, id_fonte, cenario, estrategia, modelo_mapas(ordem, visivel_padrao, mapas(id_mapa, tipo, arquivo, descricao, config))')
      .in('id_fonte', idsFontes)
    if (error) {
      toast.error(`Erro ao carregar modelos: ${error.message}`)
      return []
    }
    return (data as any) || []
  }, [idsFontes.join(',')])

  useEffect(() => {
    let ativo = true
    setCarregandoModelos(true)
    buscarModelos().then((d) => {
      if (!ativo) return
      setModelos(d)
      setCarregandoModelos(false)
    })
    return () => {
      ativo = false
    }
  }, [buscarModelos])

  // Cada seleção corresponde aos modelos com a mesma fonte, cenários e
  // estratégias (pode haver mais de um — cada um aparece como opção).
  const itens = useMemo(
    () =>
      selecoes.flatMap((s) => {
        const encontrados = modelos
          .filter(
            (m) => m.id_fonte === s.id_fonte && chave(m.cenario) === chave(s.cenarios) && chave(m.estrategia) === chave(s.estrategias),
          )
          .sort((a, b) => a.id_mod - b.id_mod)
        if (encontrados.length === 0) return [{ selecao: s, modelo: null as ModeloComMapas | null, multiplo: false }]
        return encontrados.map((m) => ({ selecao: s, modelo: m as ModeloComMapas | null, multiplo: encontrados.length > 1 }))
      }),
    [selecoes, modelos],
  )

  // Desmarca modelos que saíram da lista (seleção alterada)
  useEffect(() => {
    const validos = new Set(itens.map((i) => i.modelo?.id_mod).filter(Boolean))
    setMarcados((p) => p.filter((id) => validos.has(id)))
  }, [itens])

  const ordemMarcados = itens.map((i) => i.modelo?.id_mod).filter((id): id is number => !!id && marcados.includes(id))
  const mapasUniao = useMemo(() => unirMapas(modelos, ordemMarcados), [modelos, ordemMarcados.join(',')])

  // Mapa escolhido no bloco de configuração
  const mapaSel = mapasUniao.find((m) => String(m.id_mapa) === mapaConfig) || null
  useEffect(() => {
    if (!mapaSel && mapasUniao.length > 0) setMapaConfig(String(mapasUniao[0].id_mapa))
  }, [mapasUniao.map((m) => m.id_mapa).join(',')])

  const cfgSel = mapaSel ? (ajustes[mapaSel.id_mapa] ?? mapaSel.config) : null
  const cfgShape = normalizarConfigShape(mapaSel?.tipo === 'shape' ? cfgSel : null)
  const cfgRaster = normalizarConfigRaster(mapaSel?.tipo === 'raster' ? cfgSel : null)
  const arquivoSel = useArquivoMapa({
    tipo: mapaSel?.tipo ?? null,
    arquivo: mapaSel?.arquivo ?? null,
    encoding: cfgShape.dbf_encoding,
    banda: cfgRaster.banda,
    nodata: cfgRaster.nodata,
  })

  const exibir = async () => {
    setGerando(true)
    // Relê os modelos: mapas podem ter sido alterados em Configurações
    const atual = await buscarModelos()
    setModelos(atual)
    const uniao = unirMapas(atual, ordemMarcados)
    setItensExibidos(
      uniao.map((m) => ({
        id: String(m.id_mapa),
        tipo: m.tipo,
        arquivo: m.arquivo,
        nome: nomeMapa(m),
        config: ajustes[m.id_mapa] ?? m.config,
        visivel: m.visivel,
      })),
    )
    setGerando(false)
  }

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
        Marque um ou mais modelos das fontes selecionadas para sobrepor os mapas associados a eles, como informação
        complementar para interpretar os resultados.
      </p>

      {carregandoModelos ? (
        <p className="text-sm text-muted-foreground flex items-center gap-2">
          <Loader2 className="w-4 h-4 animate-spin" /> Carregando modelos...
        </p>
      ) : (
        <div className="grid gap-2">
          {itens.map(({ selecao, modelo: m, multiplo }) => {
            const mapas = (m?.modelo_mapas || [])
              .filter((a) => a.mapas)
              .sort((a, b) => a.ordem - b.ordem)
              .map((a) => a.mapas as MapaCadastro)
            const temMapa = mapas.length > 0
            const id = `mapa-mod-${selecao.id}-${m?.id_mod ?? 'sem'}`
            const marcado = !!m && marcados.includes(m.id_mod)
            return (
              <label
                key={id}
                htmlFor={id}
                className={`flex items-start gap-3 rounded-lg border p-3 ${temMapa ? 'cursor-pointer hover:bg-muted/40' : 'opacity-60'} ${
                  marcado ? 'border-primary bg-primary/5' : ''
                }`}
              >
                <Checkbox
                  id={id}
                  checked={marcado}
                  disabled={!temMapa}
                  onCheckedChange={(c) =>
                    m && setMarcados((p) => (c ? [...p.filter((x) => x !== m.id_mod), m.id_mod] : p.filter((x) => x !== m.id_mod)))
                  }
                  className="mt-1"
                />
                <div className="flex-1 space-y-1.5">
                  <div className="text-sm font-medium">
                    {selecao.fonte_agua?.nome_fonte || `Fonte ${selecao.id_fonte}`}
                    {m && multiplo && <span className="ml-2 text-xs font-normal text-muted-foreground">modelo nº {m.id_mod}</span>}
                  </div>
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
                        : mapas.map((x) => `${x.tipo === 'shape' ? 'Shape' : 'Raster'}: ${nomeMapa(x)}`).join(' · ')}
                  </div>
                </div>
              </label>
            )
          })}
        </div>
      )}

      {mapasUniao.length > 0 && (
        <>
          <Accordion type="single" collapsible>
            <AccordionItem value="config-mapa" className="border rounded-lg px-4">
              <AccordionTrigger className="text-sm font-semibold hover:no-underline">Configuração de mapa</AccordionTrigger>
              <AccordionContent className="pb-4 space-y-4">
                <p className="text-xs text-muted-foreground">
                  Ajustes feitos aqui valem só para esta visualização e não são gravados. Para alterar a configuração de
                  forma permanente, use Configurações → Mapas para simulação.
                </p>
                <div className="flex flex-col md:flex-row gap-2 md:items-center">
                  <Select value={mapaConfig} onValueChange={setMapaConfig}>
                    <SelectTrigger className="md:w-96">
                      <SelectValue placeholder="Escolha o mapa" />
                    </SelectTrigger>
                    <SelectContent>
                      {mapasUniao.map((m) => (
                        <SelectItem key={m.id_mapa} value={String(m.id_mapa)}>
                          {(m.tipo === 'shape' ? 'Shape · ' : 'Raster · ') + nomeMapa(m) + (ajustes[m.id_mapa] ? ' (ajustado)' : '')}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {mapaSel && ajustes[mapaSel.id_mapa] && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() =>
                        setAjustes((p) => {
                          const n = { ...p }
                          delete n[mapaSel.id_mapa]
                          return n
                        })
                      }
                    >
                      <RotateCcw className="w-4 h-4 mr-1" /> Restaurar configuração do cadastro
                    </Button>
                  )}
                </div>
                {mapaSel && (
                  <>
                    {arquivoSel.carregando && (
                      <p className="text-sm text-muted-foreground flex items-center gap-2">
                        <Loader2 className="w-4 h-4 animate-spin" /> Lendo o arquivo do mapa...
                      </p>
                    )}
                    {arquivoSel.erro && <p className="text-sm text-red-600">{arquivoSel.erro}</p>}
                    {!arquivoSel.carregando && !arquivoSel.erro && mapaSel.tipo === 'shape' && arquivoSel.shapes && (
                      <ConfigShapeForm
                        key={mapaSel.id_mapa}
                        shapes={arquivoSel.shapes}
                        config={cfgShape}
                        onChange={(c) => setAjustes((p) => ({ ...p, [mapaSel.id_mapa]: c }))}
                      />
                    )}
                    {!arquivoSel.carregando && !arquivoSel.erro && mapaSel.tipo === 'raster' && arquivoSel.raster && (
                      <ConfigRasterForm
                        raster={arquivoSel.raster}
                        banda={arquivoSel.banda}
                        config={cfgRaster}
                        onChange={(c) => setAjustes((p) => ({ ...p, [mapaSel.id_mapa]: c }))}
                      />
                    )}
                  </>
                )}
              </AccordionContent>
            </AccordionItem>
          </Accordion>

          <Button onClick={exibir} disabled={gerando}>
            {gerando ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <MapIcon className="w-4 h-4 mr-2" />}
            {itensExibidos ? 'Atualizar mapa' : 'Exibir mapa'}
          </Button>
        </>
      )}

      {itensExibidos && <VisualizadorMapas itens={itensExibidos} />}
    </div>
  )
}
