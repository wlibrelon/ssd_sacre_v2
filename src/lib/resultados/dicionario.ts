// ── Utilitários para o módulo de Tabelas de Dados (Projetos > Resultados) ──────
// Faz o parsing do CSV enviado pelo usuário e monta um dicionário de dados
// sugerido automaticamente (tipo, papel, agregações permitidas), que depois é
// revisado/ajustado por quem está subindo a tabela antes de publicar.
//
// Escopo desta fase: sem cruzamento entre tabelas. O dicionário só precisa
// ser bom o suficiente para alimentar um construtor de consulta simples
// (métrica + agregação, agrupar por, filtrar por) rodando sobre UMA tabela.

import Papa from 'papaparse'

export type TipoColuna = 'numerico' | 'data' | 'categorico' | 'texto'
export type PapelColuna = 'dimensao' | 'metrica' | 'identificador' | 'ignorar'
export type Agregacao = 'soma' | 'media' | 'min' | 'max' | 'contagem' | 'contagem_distinta'

export interface ColunaDicionario {
  nome_original: string
  rotulo_amigavel: string
  tipo_detectado: TipoColuna
  papel: PapelColuna
  unidade: string
  agregacoes_permitidas: Agregacao[]
  ordem: number
}

export interface CsvParseado {
  headers: string[]
  linhas: Record<string, string>[]
}

// ── Parsing do CSV (client-side, arquivo inteiro em memória — adequado para
// resultados de pesquisa, que não têm o volume de uma série telemétrica) ──────
export function parseCsv(file: File): Promise<CsvParseado> {
  return new Promise((resolve, reject) => {
    Papa.parse<Record<string, string>>(file, {
      header: true,
      skipEmptyLines: true,
      transformHeader: (h) => h.trim(),
      complete: (result) => {
        const headers = result.meta.fields || []
        resolve({ headers, linhas: result.data })
      },
      error: (err) => reject(err),
    })
  })
}

// ── Regras de inferência ────────────────────────────────────────────────────
const REGEX_DATA_ISO = /^\d{4}-\d{2}-\d{2}$/
const REGEX_DATA_BR = /^\d{2}\/\d{2}\/\d{4}$/
const REGEX_ANO_MES = /^\d{4}\/\d{2}$/
const REGEX_ANO = /^\d{4}$/

function pareceData(valor: string): boolean {
  return (
    REGEX_DATA_ISO.test(valor) ||
    REGEX_DATA_BR.test(valor) ||
    REGEX_ANO_MES.test(valor) ||
    REGEX_ANO.test(valor)
  )
}

function pareceNumero(valor: string): boolean {
  if (valor.trim() === '') return false
  // aceita separador decimal com vírgula (comum em planilhas brasileiras)
  const normalizado = valor.trim().replace(/\./g, '').replace(',', '.')
  return !isNaN(Number(normalizado)) && !isNaN(parseFloat(normalizado))
}

/**
 * Analisa os valores de uma coluna e sugere tipo, papel e agregações.
 * O usuário sempre pode corrigir na tela de confirmação do dicionário —
 * isso aqui é só um rascunho pronto para acelerar o cadastro.
 */
export function inferirColuna(
  nomeOriginal: string,
  valores: string[],
  ordem: number,
): ColunaDicionario {
  const amostraValida = valores.filter((v) => v != null && v.trim() !== '')
  const totalAmostra = amostraValida.length || 1

  const qtdNumerico = amostraValida.filter(pareceNumero).length
  const qtdData = amostraValida.filter(pareceData).length

  const distintos = new Set(amostraValida.map((v) => v.trim())).size
  const cardinalidadeRelativa = distintos / totalAmostra

  let tipo: TipoColuna = 'texto'
  if (qtdNumerico / totalAmostra > 0.9) {
    tipo = 'numerico'
  } else if (qtdData / totalAmostra > 0.9) {
    tipo = 'data'
  } else if (cardinalidadeRelativa <= 0.2 || distintos <= 30) {
    tipo = 'categorico'
  }

  let papel: PapelColuna = 'ignorar'
  let agregacoes: Agregacao[] = []

  if (tipo === 'numerico') {
    papel = 'metrica'
    agregacoes = ['soma', 'media', 'min', 'max', 'contagem']
  } else if (tipo === 'data' || tipo === 'categorico') {
    papel = 'dimensao'
    agregacoes = ['contagem', 'contagem_distinta']
  } else if (cardinalidadeRelativa > 0.9) {
    // texto livre, quase todo valor único → provavelmente um identificador
    papel = 'identificador'
    agregacoes = ['contagem_distinta']
  } else {
    papel = 'ignorar'
    agregacoes = []
  }

  return {
    nome_original: nomeOriginal,
    rotulo_amigavel: nomeOriginal,
    tipo_detectado: tipo,
    papel,
    unidade: '',
    agregacoes_permitidas: agregacoes,
    ordem,
  }
}

export function montarDicionarioSugerido(csv: CsvParseado): ColunaDicionario[] {
  return csv.headers.map((header, i) => {
    const valoresColuna = csv.linhas.map((linha) => linha[header] ?? '')
    return inferirColuna(header, valoresColuna, i)
  })
}

export const ROTULOS_TIPO: Record<TipoColuna, string> = {
  numerico: 'Numérico',
  data: 'Data / Tempo',
  categorico: 'Categórico',
  texto: 'Texto livre',
}

export const ROTULOS_PAPEL: Record<PapelColuna, string> = {
  dimensao: 'Dimensão (agrupar / filtrar)',
  metrica: 'Métrica (somar / calcular)',
  identificador: 'Identificador',
  ignorar: 'Ignorar',
}

export const ROTULOS_AGREGACAO: Record<Agregacao, string> = {
  soma: 'Soma',
  media: 'Média',
  min: 'Mínimo',
  max: 'Máximo',
  contagem: 'Contagem',
  contagem_distinta: 'Contagem distinta',
}

// ── Conversão de valor bruto (string do CSV) para o tipo real, na hora de
// gravar em resultado_linha como JSONB — assim métricas numéricas já entram
// como number, não como string, e as agregações no frontend funcionam direto ──
export function converterValor(valor: string, tipo: TipoColuna): string | number | null {
  if (valor == null || valor.trim() === '') return null
  if (tipo === 'numerico') {
    const normalizado = valor.trim().replace(/\./g, '').replace(',', '.')
    const n = Number(normalizado)
    return isNaN(n) ? null : n
  }
  return valor.trim()
}
