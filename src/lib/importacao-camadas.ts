import { supabase } from '@/lib/supabase/client'
import type { Feature } from 'shapefile'

const BATCH_SIZE = 100

export async function baixarArquivoCamada(bucket: string, caminho: string): Promise<ArrayBuffer> {
  const { data, error } = await supabase.storage.from(bucket).download(caminho)

  if (error || !data) {
    throw new Error(`Falha ao baixar arquivo ${caminho} do bucket ${bucket}: ${error?.message}`)
  }

  return await data.arrayBuffer()
}

export async function atualizarStatusCamada(
  idCamada: string,
  status: 'pendente' | 'processando' | 'importado' | 'erro',
  mensagemErro: string | null = null,
) {
  const { error } = await supabase
    .from('camadas_mapa')
    .update({
      status_importacao: status,
      mensagem_erro: mensagemErro,
    })
    .eq('id_camada', idCamada)

  if (error) {
    console.error(`Erro ao atualizar status da camada ${idCamada}:`, error)
  }
}

export async function finalizarImportacaoVetorial(idCamada: string, totalFeicoes: number) {
  const { error } = await supabase.rpc('finalizar_importacao_vetorial', {
    p_id_camada: idCamada,
    p_total: totalFeicoes,
  })

  if (error) {
    throw new Error(`Erro ao finalizar importação: ${error.message}`)
  }
}

export async function processarFeicoesLote(idCamada: string, feicoes: Feature[]): Promise<number> {
  let totalProcessado = 0

  try {
    await atualizarStatusCamada(idCamada, 'processando')

    for (let i = 0; i < feicoes.length; i += BATCH_SIZE) {
      const lote = feicoes.slice(i, i + BATCH_SIZE)

      const payload = lote.map((feature, index) => ({
        geom: feature.geometry,
        nome:
          feature.properties?.name ||
          feature.properties?.nome ||
          feature.properties?.NOME ||
          `Feição ${i + index + 1}`,
        propriedades: feature.properties || {},
      }))

      const { error } = await supabase.rpc('importar_feicoes_lote', {
        p_id_camada: idCamada,
        p_feicoes: payload as any,
      })

      if (error) {
        throw new Error(`Falha na inserção do lote ${i}: ${error.message}`)
      }

      totalProcessado += lote.length
    }

    await finalizarImportacaoVetorial(idCamada, totalProcessado)
    return totalProcessado
  } catch (error: any) {
    console.error('Erro durante a importação em lote:', error)
    await atualizarStatusCamada(idCamada, 'erro', error.message || 'Erro desconhecido')
    throw error
  }
}

export async function estruturarImportacaoShapefile(
  idCamada: string,
  shpCaminho: string,
  dbfCaminho?: string,
) {
  try {
    await atualizarStatusCamada(idCamada, 'processando')

    // 1. Download do shapefile do storage (bucket 'camadas-vetor')
    const _shpBuffer = await baixarArquivoCamada('camadas-vetor', shpCaminho)
    let _dbfBuffer: ArrayBuffer | undefined

    if (dbfCaminho) {
      try {
        _dbfBuffer = await baixarArquivoCamada('camadas-vetor', dbfCaminho)
      } catch (e) {
        console.warn(
          'DBF não encontrado ou erro ao baixar, prosseguindo com dados apenas geométricos...',
        )
      }
    }

    // 2. Integração com biblioteca 'shapefile':
    // O parser shapefile leria o source através da função open():
    // const source = await shapefile.open(_shpBuffer, _dbfBuffer, { encoding: 'utf-8' });

    // let feicoesAcumuladas: Feature[] = [];
    // let totalGeral = 0;

    // while (true) {
    //   const result = await source.read();
    //   if (result.done) break;
    //   feicoesAcumuladas.push(result.value);
    //
    //   if (feicoesAcumuladas.length >= BATCH_SIZE) {
    //     await processarFeicoesLote(idCamada, feicoesAcumuladas);
    //     totalGeral += feicoesAcumuladas.length;
    //     feicoesAcumuladas = [];
    //   }
    // }
    //
    // if (feicoesAcumuladas.length > 0) {
    //   await processarFeicoesLote(idCamada, feicoesAcumuladas);
    //   totalGeral += feicoesAcumuladas.length;
    // }
    // await finalizarImportacaoVetorial(idCamada, totalGeral);

    throw new Error(
      'Processamento nativo de Shapefiles aguardando implementação da lib correspondente',
    )
  } catch (error: any) {
    await atualizarStatusCamada(idCamada, 'erro', error.message)
    throw error
  }
}

export async function importarCamadaVetorial(
  camada: any,
  onProgress?: (msg: string) => void,
): Promise<{ total: number }> {
  try {
    if (onProgress) onProgress('Iniciando processamento vetorial...')
    await estruturarImportacaoShapefile(camada.id_camada, `${camada.id_camada}/origem.shp`)
    return { total: 0 }
  } catch (error: any) {
    throw error
  }
}

export async function importarCamadaRaster(camada: any): Promise<void> {
  try {
    await atualizarStatusCamada(camada.id_camada, 'processando')
    // A raster just needs its status updated to imported since the file is already in storage
    await atualizarStatusCamada(camada.id_camada, 'importado')
  } catch (error: any) {
    await atualizarStatusCamada(camada.id_camada, 'erro', error.message)
    throw error
  }
}
