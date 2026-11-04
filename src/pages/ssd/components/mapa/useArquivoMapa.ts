// Carrega o arquivo de um mapa (shape ou raster) para os formulários de
// configuração, usando o cache compartilhado com o visualizador.
import { useEffect, useState } from 'react'
import {
  carregarBanda,
  carregarRaster,
  carregarShapes,
  type RasterBanda,
  type RasterCarregado,
  type ShapeBruto,
} from './dadosMapa'

export function useArquivoMapa(params: {
  tipo: 'shape' | 'raster' | null
  arquivo: string | null
  encoding?: string
  banda?: number
  nodata?: number | null
}) {
  const { tipo, arquivo, encoding = 'latin1', banda = 0, nodata = null } = params
  const [shapes, setShapes] = useState<ShapeBruto[] | null>(null)
  const [raster, setRaster] = useState<RasterCarregado | null>(null)
  const [dadosBanda, setDadosBanda] = useState<RasterBanda | null>(null)
  const [carregando, setCarregando] = useState(false)
  const [erro, setErro] = useState<string | null>(null)

  useEffect(() => {
    let ativo = true
    setErro(null)
    setShapes(null)
    setRaster(null)
    if (!tipo || !arquivo) return
    setCarregando(true)
    const p = tipo === 'shape' ? carregarShapes(arquivo, encoding) : carregarRaster(arquivo)
    p.then((r: any) => {
      if (!ativo) return
      if (tipo === 'shape') setShapes(r)
      else setRaster(r)
    })
      .catch((e) => ativo && setErro(e?.message || 'Não foi possível ler o arquivo do mapa.'))
      .finally(() => ativo && setCarregando(false))
    return () => {
      ativo = false
    }
  }, [tipo, arquivo, tipo === 'shape' ? encoding : ''])

  const nodataEfetivo = nodata ?? raster?.nodataArquivo ?? null
  const bandaEfetiva = raster ? Math.min(banda, raster.bandas - 1) : 0
  useEffect(() => {
    let ativo = true
    setDadosBanda(null)
    if (!raster || !arquivo) return
    carregarBanda(arquivo, raster, bandaEfetiva, nodataEfetivo)
      .then((b) => ativo && setDadosBanda(b))
      .catch((e) => ativo && setErro(e?.message || 'Erro ao ler o raster.'))
    return () => {
      ativo = false
    }
  }, [raster, arquivo, bandaEfetiva, nodataEfetivo])

  return { shapes, raster, banda: dadosBanda, carregando, erro }
}
