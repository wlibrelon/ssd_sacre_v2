import { supabase } from '@/lib/supabase/client'
import { unzipSync } from 'fflate'
// @ts-expect-error - a lib 'shapefile' não publica tipos oficiais (ver src/types/shapefile.d.ts)
import * as shapefile from 'shapefile'
import proj4 from 'proj4'

// ---------------------------------------------------------------------------
// Projeções (PROJ4) — sistemas de coordenadas comuns em dados geoespaciais do Brasil
// ---------------------------------------------------------------------------

let projecoesRegistradas = false

function registrarDefinicoesProj4() {
  if (projecoesRegistradas) return

  // SIRGAS 2000 geográfico (datum oficial do IBGE)
  proj4.defs('EPSG:4674', '+proj=longlat +ellps=GRS80 +no_defs +type=crs')
  // WGS84 geográfico (GPS / padrão web)
  proj4.defs('EPSG:4326', '+proj=longlat +datum=WGS84 +no_defs +type=crs')

  // UTM SIRGAS 2000, zonas 18S a 25S (cobre todo o território brasileiro)
  const zonasUtmSirgas: Record<number, number> = {
    31978: 18,
    31979: 19,
    31980: 20,
    31981: 21,
    31982: 22,
    31983: 23,
    31984: 24,
    31985: 25,
  }
  Object.entries(zonasUtmSirgas).forEach(([codigo, zona]) => {
    proj4.defs(
      `EPSG:${codigo}`,
      `+proj=utm +zone=${zona} +south +ellps=GRS80 +towgs84=0,0,0,0,0,0,0 +units=m +no_defs +type=crs`,
    )
  })

  projecoesRegistradas = true
}

function reprojetarCoordenadas(
  coords: any,
  transformar: (xy: [number, number]) => [number, number],
): any {
  if (typeof coords[0] === 'number') {
    const [x, y] = transformar([coords[0], coords[1]])
    return coords.length > 2 ? [x, y, coords[2]] : [x, y]
  }
  return coords.map((c: any) => reprojetarCoordenadas(c, transformar))
}

/** Reprojeta uma geometria GeoJSON inteira de um EPSG de origem para EPSG:4326 (WGS84). */
export function reprojetarGeometria(geometria: any, epsgOrigem: number): any {
  if (!geometria) return geometria
  if (epsgOrigem === 4326) return geometria

  registrarDefinicoesProj4()
  const fromDef = `EPSG:${epsgOrigem}`
  const transformar = (xy: [number, number]) => proj4(fromDef, 'EPSG:4326', xy) as [number, number]

  if (geometria.type === 'GeometryCollection') {
    return {
      ...geometria,
      geometries: geometria.geometries.map((g: any) => reprojetarGeometria(g, epsgOrigem)),
    }
  }

  return {
    ...geometria,
    coordinates: reprojetarCoordenadas(geometria.coordinates, transformar),
  }
}

// ---------------------------------------------------------------------------
// Leitura do shapefile (.zip contendo .shp + .dbf)
// ---------------------------------------------------------------------------

function encontrarArquivoNoZip(
  arquivos: Record<string, Uint8Array>,
  extensao: string,
): Uint8Array | null {
  const chave = Object.keys(arquivos).find((k) => k.toLowerCase().endsWith(`.${extensao}`))
  return chave ? arquivos[chave] : null
}

async function lerFeaturesDoShapefile(shpBytes: Uint8Array, dbfBytes: Uint8Array): Promise<any[]> {
  const source = await shapefile.open(shpBytes, dbfBytes)
  const features: any[] = []
  let resultado = await source.read()
  while (!resultado.done) {
    features.push(resultado.value)
    resultado = await source.read()
  }
  return features
}

const CHAVES_NOME_CANDIDATAS = ['nome', 'name', 'rotulo', 'label', 'ds_nome', 'nm_nome']

function extrairNome(propriedades: Record<string, any> | null | undefined): string | null {
  if (!propriedades) return null
  const entradas = Object.entries(propriedades)
  for (const candidata of CHAVES_NOME_CANDIDATAS) {
    const encontrada = entradas.find(([chave]) => chave.toLowerCase() === candidata)
    if (encontrada && encontrada[1] != null && String(encontrada[1]).trim() !== '') {
      return String(encontrada[1])
    }
  }
  return null
}

// ---------------------------------------------------------------------------
// Fluxo de importação — camadas vetoriais
// ---------------------------------------------------------------------------

const TAMANHO_LOTE = 500

export async function importarCamadaVetorial(
  camada: any,
  onProgress?: (mensagem: string) => void,
): Promise<{ sucesso: true; total: number }> {
  await supabase
    .from('camadas_mapa')
    .update({ status_importacao: 'importando', mensagem_erro: null })
    .eq('id_camada', camada.id_camada)

  try {
    // Reimportação é substitutiva: remove feições de uma tentativa anterior
    // (inclusive as gravadas com geom nulo) antes de inserir as novas, para
    // evitar duplicar registros a cada nova tentativa.
    onProgress?.('Limpando importação anterior, se houver...')
    const { error: deleteError } = await supabase
      .from('feicoes_geoespaciais')
      .delete()
      .eq('id_camada', camada.id_camada)
    if (deleteError) {
      throw new Error(`Erro ao limpar feições anteriores: ${deleteError.message}`)
    }

    onProgress?.('Baixando arquivo .zip...')
    const { data: blob, error: downloadError } = await supabase.storage
      .from('camadas-vetor')
      .download(`${camada.id_camada}/origem.zip`)
    if (downloadError || !blob) {
      throw new Error('Não foi possível baixar o arquivo .zip do storage.')
    }

    onProgress?.('Descompactando arquivo...')
    const zipBytes = new Uint8Array(await blob.arrayBuffer())
    const arquivos = unzipSync(zipBytes)
    const shpBytes = encontrarArquivoNoZip(arquivos, 'shp')
    const dbfBytes = encontrarArquivoNoZip(arquivos, 'dbf')
    if (!shpBytes || !dbfBytes) {
      throw new Error('O .zip não contém os arquivos .shp e .dbf esperados.')
    }

    onProgress?.('Lendo feições do shapefile...')
    const features = await lerFeaturesDoShapefile(shpBytes, dbfBytes)
    if (features.length === 0) {
      throw new Error('Nenhuma feição encontrada no shapefile.')
    }

    const epsgOrigem = camada.epsg_origem || 4674
    let totalImportado = 0

    for (let i = 0; i < features.length; i += TAMANHO_LOTE) {
      const lote = features.slice(i, i + TAMANHO_LOTE)
      onProgress?.(
        `Processando feição ${Math.min(i + TAMANHO_LOTE, features.length)} de ${features.length}...`,
      )

      // IMPORTANTE: a chave 'geom' abaixo precisa bater exatamente com a que
      // a função importar_feicoes_lote() lê no banco (item->>'geom').
      const payload = lote.map((feature: any) => ({
        geom: reprojetarGeometria(feature.geometry, epsgOrigem),
        nome: extrairNome(feature.properties),
        propriedades: feature.properties || {},
      }))

      const { error: rpcError } = await supabase.rpc('importar_feicoes_lote', {
        p_id_camada: camada.id_camada,
        p_feicoes: payload,
      })
      if (rpcError) {
        throw new Error(`Erro ao gravar lote de feições: ${rpcError.message}`)
      }
      totalImportado += lote.length
    }

    onProgress?.('Finalizando importação...')
    const { error: finalError } = await supabase.rpc('finalizar_importacao_vetorial', {
      p_id_camada: camada.id_camada,
      p_total: totalImportado,
    })
    if (finalError) throw new Error(finalError.message)

    return { sucesso: true, total: totalImportado }
  } catch (err: any) {
    await supabase
      .from('camadas_mapa')
      .update({
        status_importacao: 'erro',
        mensagem_erro: err?.message || 'Erro desconhecido na importação.',
      })
      .eq('id_camada', camada.id_camada)
    throw err
  }
}

// ---------------------------------------------------------------------------
// Fluxo de importação — camadas raster
// ---------------------------------------------------------------------------

export async function importarCamadaRaster(camada: any): Promise<{ sucesso: true }> {
  await supabase
    .from('camadas_mapa')
    .update({ status_importacao: 'importando', mensagem_erro: null })
    .eq('id_camada', camada.id_camada)

  try {
    const caminho = `${camada.id_camada}/origem.tif`
    const { data: urlData, error: urlError } = await supabase.storage
      .from('camadas-raster')
      .createSignedUrl(caminho, 60 * 60 * 24 * 365)
    if (urlError || !urlData) {
      throw new Error('Não foi possível gerar a URL do arquivo raster.')
    }

    const { error: updateError } = await supabase
      .from('camadas_mapa')
      .update({
        fonte_raster_url: urlData.signedUrl,
        status_importacao: 'importado',
        importado_em: new Date().toISOString(),
        mensagem_erro: null,
      })
      .eq('id_camada', camada.id_camada)
    if (updateError) throw updateError

    return { sucesso: true }
  } catch (err: any) {
    await supabase
      .from('camadas_mapa')
      .update({
        status_importacao: 'erro',
        mensagem_erro: err?.message || 'Erro desconhecido na importação.',
      })
      .eq('id_camada', camada.id_camada)
    throw err
  }
}
