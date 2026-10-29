// Leitura e preparação dos mapas associados a um modelo (aba "Mapa" da
// Simulação): shapefile compactado (.zip) e raster GeoTIFF (.tif), ambos
// armazenados no bucket dados_brutos. Tudo é processado no navegador.
import { supabase } from '@/lib/supabase/client'
import { unzipSync, strFromU8 } from 'fflate'
// Tipos da lib 'shapefile' declarados em src/lib/shapefile.d.ts
import * as shapefile from 'shapefile'
import proj4 from 'proj4'
import { lon2x, lat2y, x2lon, y2lat } from '@/components/map/SimpleMap'
import {
  construirClassificacao,
  type Classificacao,
  type ClasseGraduada,
  type ModoGraduado,
} from '@/lib/classificacao'

// ---------------------------------------------------------------------------
// Projeções
// ---------------------------------------------------------------------------

let projecoesRegistradas = false
function registrarProjecoes() {
  if (projecoesRegistradas) return
  proj4.defs('EPSG:4674', '+proj=longlat +ellps=GRS80 +no_defs +type=crs')
  proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs +type=crs')
  proj4.defs('EPSG:4618', '+proj=longlat +ellps=aust_SA +towgs84=-66.87,4.37,-38.52,0,0,0,0 +no_defs +type=crs')
  // UTM SIRGAS 2000 (18S–25S)
  for (let zona = 18; zona <= 25; zona++) {
    proj4.defs(
      `EPSG:${31960 + zona}`,
      `+proj=utm +zone=${zona} +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs`,
    )
    // UTM WGS84 sul
    proj4.defs(`EPSG:${32700 + zona}`, `+proj=utm +zone=${zona} +south +datum=WGS84 +units=m +no_defs +type=crs`)
  }
  // UTM SAD69 (zonas 18S–25S: EPSG 29188–29195)
  for (let zona = 18; zona <= 25; zona++) {
    proj4.defs(
      `EPSG:${29170 + zona}`,
      `+proj=utm +zone=${zona} +south +ellps=aust_SA +towgs84=-66.87,4.37,-38.52,0,0,0,0 +units=m +no_defs +type=crs`,
    )
  }
  projecoesRegistradas = true
}

export function epsgSuportado(epsg: number | null | undefined): boolean {
  if (!epsg) return false
  registrarProjecoes()
  return !!proj4.defs(`EPSG:${epsg}`)
}

/** Converte coordenadas (x, y) de um EPSG para lon/lat WGS84. */
function transformadorParaWgs84(epsg: number) {
  registrarProjecoes()
  if (epsg === 4326) return (xy: [number, number]) => xy
  const conv = proj4(`EPSG:${epsg}`, 'EPSG:4326')
  return (xy: [number, number]) => conv.forward(xy) as [number, number]
}

/** Converte lon/lat WGS84 para o EPSG informado. */
function transformadorDeWgs84(epsg: number) {
  registrarProjecoes()
  if (epsg === 4326) return (xy: [number, number]) => xy
  const conv = proj4('EPSG:4326', `EPSG:${epsg}`)
  return (xy: [number, number]) => conv.forward(xy) as [number, number]
}

/** Tenta identificar o EPSG a partir do conteúdo de um arquivo .prj (WKT). */
export function detectarEpsgPrj(wkt: string | null | undefined): number | null {
  if (!wkt) return null
  const t = wkt.toUpperCase()
  const autoridade = t.match(/AUTHORITY\["EPSG",\s*"?(\d+)"?\]\]\s*$/)
  if (autoridade) return Number(autoridade[1])
  const utm = t.match(/UTM[_ ]ZONE[_ ]?(\d{2})\s*S/)
  const sirgas = t.includes('SIRGAS')
  const sad69 = t.includes('SAD') && t.includes('69')
  if (utm) {
    const zona = Number(utm[1])
    if (sirgas) return 31960 + zona
    if (sad69) return 29170 + zona
    if (t.includes('WGS') && t.includes('84')) return 32700 + zona
  }
  if (!t.startsWith('PROJCS')) {
    if (sirgas) return 4674
    if (sad69) return 4618
    if (t.includes('WGS') && t.includes('84')) return 4326
  }
  return null
}

// ---------------------------------------------------------------------------
// Download do arquivo no storage
// ---------------------------------------------------------------------------

export async function baixarArquivo(caminho: string): Promise<ArrayBuffer> {
  const limpo = caminho.replace(/^dados_brutos\//, '').replace(/^\/+/, '')
  // URL assinada + cache: 'no-store': um arquivo substituído no storage com o
  // mesmo nome não pode vir da cache do navegador com o conteúdo antigo.
  const { data, error } = await supabase.storage.from('dados_brutos').createSignedUrl(limpo, 300)
  if (error || !data?.signedUrl)
    throw new Error(
      `O arquivo ${limpo}, indicado neste modelo, não foi encontrado no storage. Escolha o arquivo atual em Configurações → Construção de modelos para simulação → coluna Mapas do modelo.`,
    )
  const sep = data.signedUrl.includes('?') ? '&' : '?'
  const resp = await fetch(`${data.signedUrl}${sep}t=${Date.now()}`, { cache: 'no-store' })
  if (!resp.ok) throw new Error(`Não foi possível baixar o arquivo ${limpo} (${resp.status}).`)
  return resp.arrayBuffer()
}

// ---------------------------------------------------------------------------
// Shapefile (.zip) — cada .shp dentro do .zip vira uma camada
// ---------------------------------------------------------------------------

export type TipoGeometria = 'point' | 'line' | 'polygon' | null
export type Extensao = [number, number, number, number] // [minLon, minLat, maxLon, maxLat]

export type ShapeBruto = {
  nome: string
  features: any[] // coordenadas no sistema original
  campos: string[]
  epsgPrj: number | null
  prjWkt: string | null // conteúdo do .prj (WKT), usado direto pelo proj4
}

export type CamadaShape = {
  nome: string
  geojson: { type: 'FeatureCollection'; features: any[] }
  campos: string[]
  tipo: TipoGeometria
  extensao: Extensao | null
}

export async function lerShapesDoZip(buffer: ArrayBuffer, encoding: string): Promise<ShapeBruto[]> {
  const arquivos = unzipSync(new Uint8Array(buffer))
  const grupos: Record<string, Record<string, Uint8Array>> = {}
  Object.entries(arquivos).forEach(([caminho, bytes]) => {
    if (caminho.startsWith('__MACOSX')) return
    const m = caminho.match(/^(.*)\.(shp|dbf|prj)$/i)
    if (!m) return
    const base = m[1]
    grupos[base] = grupos[base] || {}
    grupos[base][m[2].toLowerCase()] = bytes as Uint8Array
  })
  const bases = Object.keys(grupos)
    .filter((b) => grupos[b].shp)
    .sort((a, b) => a.localeCompare(b))
  if (bases.length === 0) throw new Error('O .zip não contém nenhum arquivo .shp.')

  const resultado: ShapeBruto[] = []
  for (const base of bases) {
    const g = grupos[base]
    const source = await shapefile.open(g.shp, g.dbf, { encoding })
    const features: any[] = []
    let r = await source.read()
    while (!r.done) {
      features.push(r.value)
      r = await source.read()
    }
    const campos = new Set<string>()
    features.slice(0, 50).forEach((f) => Object.keys(f.properties || {}).forEach((k) => campos.add(k)))
    resultado.push({
      nome: base.split('/').pop() || base,
      features,
      campos: Array.from(campos).sort((a, b) => a.localeCompare(b)),
      epsgPrj: g.prj ? detectarEpsgPrj(strFromU8(g.prj)) : null,
      prjWkt: g.prj ? strFromU8(g.prj).trim() || null : null,
    })
  }
  return resultado
}

function mapearCoordenadas(coords: any, f: (xy: [number, number]) => [number, number]): any {
  if (typeof coords[0] === 'number') return f([coords[0], coords[1]])
  return coords.map((c: any) => mapearCoordenadas(c, f))
}

function tipoDaGeometria(features: any[]): TipoGeometria {
  const tipo = features.find((f) => f?.geometry)?.geometry?.type || ''
  if (tipo.includes('Point')) return 'point'
  if (tipo.includes('Line')) return 'line'
  if (tipo.includes('Polygon')) return 'polygon'
  return null
}

/** Transformação para WGS84 de uma camada shape. Ordem de prioridade:
 * EPSG informado na configuração → definição completa do .prj (WKT, lida
 * pelo proj4 — funciona com os .prj do ArcGIS/QGIS mesmo sem código EPSG)
 * → EPSG reconhecido no .prj → 4674 (SIRGAS 2000). */
function transformadorDaCamada(bruto: ShapeBruto, epsgInformado: number | null) {
  if (epsgInformado) return transformadorParaWgs84(epsgInformado)
  if (bruto.prjWkt) {
    try {
      registrarProjecoes()
      const conv = proj4(bruto.prjWkt, 'EPSG:4326')
      return (xy: [number, number]) => conv.forward(xy) as [number, number]
    } catch {
      // .prj não reconhecido pelo proj4 — segue para as alternativas abaixo
    }
  }
  return transformadorParaWgs84(bruto.epsgPrj ?? 4674)
}

/** Reprojeta as feições para WGS84 e calcula a extensão da camada. */
export function prepararCamadaShape(bruto: ShapeBruto, epsgInformado: number | null): CamadaShape {
  const f = transformadorDaCamada(bruto, epsgInformado)
  let minX = Infinity
  let minY = Infinity
  let maxX = -Infinity
  let maxY = -Infinity
  const acumular = (xy: [number, number]): [number, number] => {
    const p = f(xy)
    if (p[0] < minX) minX = p[0]
    if (p[0] > maxX) maxX = p[0]
    if (p[1] < minY) minY = p[1]
    if (p[1] > maxY) maxY = p[1]
    return p
  }
  const features = bruto.features
    .filter((ft) => ft?.geometry)
    .map((ft) => ({
      type: 'Feature',
      properties: ft.properties || {},
      geometry: { ...ft.geometry, coordinates: mapearCoordenadas(ft.geometry.coordinates, acumular) },
    }))
  return {
    nome: bruto.nome,
    geojson: { type: 'FeatureCollection', features },
    campos: bruto.campos,
    tipo: tipoDaGeometria(features),
    extensao: Number.isFinite(minX) ? [minX, minY, maxX, maxY] : null,
  }
}

export function unirExtensoes(lista: (Extensao | null)[]): Extensao | null {
  const validas = lista.filter(Boolean) as Extensao[]
  if (validas.length === 0) return null
  return [
    Math.min(...validas.map((e) => e[0])),
    Math.min(...validas.map((e) => e[1])),
    Math.max(...validas.map((e) => e[2])),
    Math.max(...validas.map((e) => e[3])),
  ]
}

// ---------------------------------------------------------------------------
// Configuração de exibição do shape (mesmos recursos de "Editar camada")
// ---------------------------------------------------------------------------

export type CategoriaForm = { valor: string; cor: string; rotulo: string }
export type ClasseForm = { min: number; max: number; cor: string; rotulo: string }

export type ClassificacaoForm = {
  campo: string
  rotuloCampo: string
  tipo: '' | 'categorico' | 'graduado'
  categorias: CategoriaForm[]
  modo: ModoGraduado
  numClasses: number
  corInicial: string
  corFinal: string
  classes: ClasseForm[]
}

export type EstiloShape = {
  fillColor: string
  color: string
  weight: number
  opacity: number
  pointSymbol: string
  lineStyle: string
}

export type ConfigCamadaShape = {
  estilo: EstiloShape
  campoNome: string
  nomesAtributos: Record<string, string>
  classificacao: ClassificacaoForm
}

export type ConfigShape = {
  epsg: number | null // null = detectar pelo .prj
  dbf_encoding: string
  camadas: Record<string, ConfigCamadaShape>
}

export const estiloPadrao = (): EstiloShape => ({
  fillColor: '#3388ff',
  color: '#3388ff',
  weight: 2,
  opacity: 0.5,
  pointSymbol: 'circle',
  lineStyle: 'solid',
})

export const classificacaoPadrao = (): ClassificacaoForm => ({
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

export const configCamadaPadrao = (): ConfigCamadaShape => ({
  estilo: estiloPadrao(),
  campoNome: '',
  nomesAtributos: {},
  classificacao: classificacaoPadrao(),
})

export function normalizarConfigShape(salva: any): ConfigShape {
  const c = salva && typeof salva === 'object' ? salva : {}
  const camadas: Record<string, ConfigCamadaShape> = {}
  if (c.camadas && typeof c.camadas === 'object') {
    Object.entries(c.camadas).forEach(([nome, v]: [string, any]) => {
      camadas[nome] = {
        estilo: { ...estiloPadrao(), ...(v?.estilo || {}) },
        campoNome: typeof v?.campoNome === 'string' ? v.campoNome : '',
        nomesAtributos: v?.nomesAtributos && typeof v.nomesAtributos === 'object' ? v.nomesAtributos : {},
        classificacao: { ...classificacaoPadrao(), ...(v?.classificacao || {}) },
      }
    })
  }
  return {
    epsg: typeof c.epsg === 'number' ? c.epsg : null,
    dbf_encoding: c.dbf_encoding === 'utf-8' ? 'utf-8' : 'latin1',
    camadas,
  }
}

/** Converte o formulário de classificação no formato usado pelo GeoJSONLayer. */
export function classificacaoParaRender(form: ClassificacaoForm): Classificacao | null {
  if (!form.campo || !form.tipo) return null
  const rotulo = form.rotuloCampo.trim() ? { rotulo_campo: form.rotuloCampo.trim() } : {}
  return construirClassificacao({
    campo_classificacao: form.campo,
    tipo_classificacao: form.tipo,
    classificacao:
      form.tipo === 'categorico'
        ? {
            ...rotulo,
            categorias: form.categorias
              .filter((c) => c.valor.trim() !== '')
              .map((c) => ({ valor: c.valor.trim(), cor: c.cor, ...(c.rotulo.trim() ? { rotulo: c.rotulo.trim() } : {}) })),
          }
        : {
            ...rotulo,
            modo: form.modo,
            classes: form.classes.map((c) => ({
              min: c.min,
              max: c.max,
              cor: c.cor,
              ...(c.rotulo.trim() ? { rotulo: c.rotulo.trim() } : {}),
            })),
          },
  })
}

// ---------------------------------------------------------------------------
// Raster (GeoTIFF)
// ---------------------------------------------------------------------------

/** Maior dimensão (px) usada para exibir o raster — arquivos maiores são
 * reamostrados para manter a exibição leve no navegador. O valor do pixel ao
 * clicar é sempre lido do arquivo original, na resolução completa. */
const DIMENSAO_MAX_EXIBICAO = 1600

export type RasterCarregado = {
  imagem: any // GeoTIFFImage
  largura: number
  altura: number
  bandas: number
  origem: [number, number]
  resolucao: [number, number]
  epsgDetectado: number | null
  nodataArquivo: number | null
}

export type RasterBanda = {
  banda: number
  dados: ArrayLike<number> // reamostrado (dw × dh)
  dw: number
  dh: number
  min: number
  max: number
  amostraOrdenada: number[]
}

export async function lerRaster(buffer: ArrayBuffer): Promise<RasterCarregado> {
  const { fromArrayBuffer } = await import('geotiff')
  const tiff = await fromArrayBuffer(buffer)
  const imagem = await tiff.getImage()
  const geoKeys: any = imagem.getGeoKeys() || {}
  const codigo = geoKeys.ProjectedCSTypeGeoKey || geoKeys.GeographicTypeGeoKey || null
  const nodata = imagem.getGDALNoData()
  const origem = imagem.getOrigin()
  const resolucao = imagem.getResolution()
  return {
    imagem,
    largura: imagem.getWidth(),
    altura: imagem.getHeight(),
    bandas: imagem.getSamplesPerPixel(),
    origem: [origem[0], origem[1]],
    resolucao: [resolucao[0], resolucao[1]],
    epsgDetectado: codigo && codigo !== 32767 ? Number(codigo) : null,
    nodataArquivo: nodata === null || nodata === undefined || Number.isNaN(Number(nodata)) ? null : Number(nodata),
  }
}

export function valorValido(v: number, nodata: number | null) {
  return Number.isFinite(v) && (nodata === null || v !== nodata)
}

export async function lerBandaRaster(r: RasterCarregado, banda: number, nodata: number | null): Promise<RasterBanda> {
  const fator = Math.max(1, Math.ceil(Math.max(r.largura, r.altura) / DIMENSAO_MAX_EXIBICAO))
  const dw = Math.ceil(r.largura / fator)
  const dh = Math.ceil(r.altura / fator)
  const ras: any = await r.imagem.readRasters({
    samples: [banda],
    width: dw,
    height: dh,
    resampleMethod: 'nearest',
  })
  const dados: ArrayLike<number> = ras[0]
  let min = Infinity
  let max = -Infinity
  const passo = Math.max(1, Math.floor(dados.length / 50000))
  const amostra: number[] = []
  for (let i = 0; i < dados.length; i++) {
    const v = dados[i]
    if (!valorValido(v, nodata)) continue
    if (v < min) min = v
    if (v > max) max = v
    if (i % passo === 0) amostra.push(v)
  }
  amostra.sort((a, b) => a - b)
  return {
    banda,
    dados,
    dw,
    dh,
    min: Number.isFinite(min) ? min : 0,
    max: Number.isFinite(max) ? max : 0,
    amostraOrdenada: amostra,
  }
}

/** Valor do pixel (resolução original) na posição lon/lat, ou null se fora. */
export async function valorDoPixel(
  r: RasterCarregado,
  banda: number,
  epsg: number,
  lon: number,
  lat: number,
): Promise<number | null> {
  const [x, y] = transformadorDeWgs84(epsg)([lon, lat])
  const col = Math.floor((x - r.origem[0]) / r.resolucao[0])
  const lin = Math.floor((y - r.origem[1]) / r.resolucao[1])
  if (col < 0 || lin < 0 || col >= r.largura || lin >= r.altura) return null
  const ras: any = await r.imagem.readRasters({ samples: [banda], window: [col, lin, col + 1, lin + 1] })
  const v = Number(ras[0][0])
  return Number.isFinite(v) ? v : null
}

export type RasterReprojetado = {
  extensaoMerc: [number, number, number, number] // [x0, y0, x1, y1] em coordenadas normalizadas de Web Mercator
  extensaoLonLat: Extensao
  W: number
  H: number
  indice: Int32Array // para cada pixel de saída, índice no array reamostrado (-1 = fora)
}

/** Reamostra o raster para uma grade em Web Mercator (a projeção do mapa
 * base), para que possa ser posicionado exatamente sobre o mapa. As
 * coordenadas de origem são calculadas numa grade espaçada e interpoladas. */
export function reprojetarRaster(r: RasterCarregado, b: RasterBanda, epsg: number): RasterReprojetado {
  const paraWgs = transformadorParaWgs84(epsg)
  const deWgs = transformadorDeWgs84(epsg)
  const [ox, oy] = r.origem
  const [rx, ry] = r.resolucao
  const x1 = ox + r.largura * rx
  const y1 = oy + r.altura * ry

  // Extensão em Mercator: amostra pontos ao longo das bordas
  let mx0 = Infinity
  let my0 = Infinity
  let mx1 = -Infinity
  let my1 = -Infinity
  let lon0 = Infinity
  let lat0 = Infinity
  let lon1 = -Infinity
  let lat1 = -Infinity
  const N = 24
  for (let i = 0; i <= N; i++) {
    const t = i / N
    const pts: [number, number][] = [
      [ox + (x1 - ox) * t, oy],
      [ox + (x1 - ox) * t, y1],
      [ox, oy + (y1 - oy) * t],
      [x1, oy + (y1 - oy) * t],
    ]
    pts.forEach((p) => {
      const [lon, lat] = paraWgs(p)
      lon0 = Math.min(lon0, lon)
      lon1 = Math.max(lon1, lon)
      lat0 = Math.min(lat0, lat)
      lat1 = Math.max(lat1, lat)
      const mx = lon2x(lon)
      const my = lat2y(lat)
      mx0 = Math.min(mx0, mx)
      mx1 = Math.max(mx1, mx)
      my0 = Math.min(my0, my)
      my1 = Math.max(my1, my)
    })
  }

  const larguraM = mx1 - mx0
  const alturaM = my1 - my0
  const maxDim = Math.min(2048, Math.max(b.dw, b.dh))
  const W = Math.max(1, Math.round(larguraM >= alturaM ? maxDim : (maxDim * larguraM) / alturaM))
  const H = Math.max(1, Math.round(alturaM > larguraM ? maxDim : (maxDim * alturaM) / larguraM))

  // Coordenadas de origem (em pixels da banda reamostrada) numa grade espaçada
  const PASSO = 8
  const gw = Math.ceil(W / PASSO) + 1
  const gh = Math.ceil(H / PASSO) + 1
  const gCol = new Float64Array(gw * gh)
  const gLin = new Float64Array(gw * gh)
  for (let j = 0; j < gh; j++) {
    const py = Math.min(H, j * PASSO)
    const lat = y2lat(my0 + (py / H) * alturaM)
    for (let i = 0; i < gw; i++) {
      const px = Math.min(W, i * PASSO)
      const lon = x2lon(mx0 + (px / W) * larguraM)
      const [sx, sy] = deWgs([lon, lat])
      gCol[j * gw + i] = ((sx - ox) / (x1 - ox)) * b.dw
      gLin[j * gw + i] = ((sy - oy) / (y1 - oy)) * b.dh
    }
  }

  const indice = new Int32Array(W * H)
  for (let y = 0; y < H; y++) {
    const fy = (y + 0.5) / PASSO
    const j = Math.min(gh - 2, Math.floor(fy))
    const ty = fy - j
    for (let x = 0; x < W; x++) {
      const fx = (x + 0.5) / PASSO
      const i = Math.min(gw - 2, Math.floor(fx))
      const tx = fx - i
      const a = j * gw + i
      const col =
        (gCol[a] * (1 - tx) + gCol[a + 1] * tx) * (1 - ty) + (gCol[a + gw] * (1 - tx) + gCol[a + gw + 1] * tx) * ty
      const lin =
        (gLin[a] * (1 - tx) + gLin[a + 1] * tx) * (1 - ty) + (gLin[a + gw] * (1 - tx) + gLin[a + gw + 1] * tx) * ty
      const c = Math.floor(col)
      const l = Math.floor(lin)
      indice[y * W + x] = c >= 0 && l >= 0 && c < b.dw && l < b.dh ? l * b.dw + c : -1
    }
  }

  return { extensaoMerc: [mx0, my0, mx1, my1], extensaoLonLat: [lon0, lat0, lon1, lat1], W, H, indice }
}

// ---------------------------------------------------------------------------
// Configuração de cores do raster
// ---------------------------------------------------------------------------

export type ConfigRaster = {
  epsg: number | null // null = usar o EPSG do arquivo
  banda: number
  nodata: number | null // null = usar o valor do arquivo
  modo: 'continuo' | 'classes'
  corInicial: string
  corFinal: string
  min: number | null // null = mínimo dos dados
  max: number | null // null = máximo dos dados
  modoClasses: ModoGraduado
  numClasses: number
  classes: ClasseForm[]
  opacidade: number
}

export const configRasterPadrao = (): ConfigRaster => ({
  epsg: null,
  banda: 0,
  nodata: null,
  modo: 'continuo',
  corInicial: '#ffffcc',
  corFinal: '#08306b',
  min: null,
  max: null,
  modoClasses: 'intervalo_igual',
  numClasses: 5,
  classes: [],
  opacidade: 0.8,
})

export function normalizarConfigRaster(salva: any): ConfigRaster {
  const c = salva && typeof salva === 'object' ? salva : {}
  const base = configRasterPadrao()
  return {
    ...base,
    ...c,
    classes: Array.isArray(c.classes) ? c.classes : [],
    modo: c.modo === 'classes' ? 'classes' : 'continuo',
  }
}

function hexRgb(hex: string): [number, number, number] {
  const h = hex.replace('#', '')
  const n = parseInt(h.length === 3 ? h.split('').map((x) => x + x).join('') : h, 16)
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255]
}

/** Gera a imagem (PNG em data URL) do raster já reprojetado, aplicando as cores. */
export function colorirRaster(
  b: RasterBanda,
  rep: RasterReprojetado,
  cfg: ConfigRaster,
  nodata: number | null,
): string {
  const canvas = document.createElement('canvas')
  canvas.width = rep.W
  canvas.height = rep.H
  const ctx = canvas.getContext('2d')
  if (!ctx) return ''
  const img = ctx.createImageData(rep.W, rep.H)
  const px = img.data

  const vmin = cfg.min ?? b.min
  const vmax = cfg.max ?? b.max
  const c0 = hexRgb(cfg.corInicial)
  const c1 = hexRgb(cfg.corFinal)
  const classes: (ClasseGraduada & { rgb: [number, number, number] })[] = cfg.classes.map((c) => ({
    ...c,
    rgb: hexRgb(c.cor),
  }))

  for (let k = 0; k < rep.indice.length; k++) {
    const idx = rep.indice[k]
    if (idx < 0) continue
    const v = b.dados[idx]
    if (!valorValido(v, nodata)) continue
    let rgb: [number, number, number] | null = null
    if (cfg.modo === 'classes') {
      for (let i = 0; i < classes.length; i++) {
        const cl = classes[i]
        const ultima = i === classes.length - 1
        if (v >= cl.min && (v < cl.max || (ultima && v <= cl.max))) {
          rgb = cl.rgb
          break
        }
      }
      if (!rgb) continue
    } else {
      const t = vmax > vmin ? Math.min(1, Math.max(0, (v - vmin) / (vmax - vmin))) : 0
      rgb = [c0[0] + (c1[0] - c0[0]) * t, c0[1] + (c1[1] - c0[1]) * t, c0[2] + (c1[2] - c0[2]) * t]
    }
    const o = k * 4
    px[o] = rgb[0]
    px[o + 1] = rgb[1]
    px[o + 2] = rgb[2]
    px[o + 3] = 255
  }
  ctx.putImageData(img, 0, 0)
  return canvas.toDataURL('image/png')
}
