// ── Motor de consulta "sem SQL" para uma tabela de resultado ────────────────
// Roda inteiramente no frontend, sobre as linhas já carregadas de
// resultado_linha. Sem cruzamento entre tabelas nesta fase — a consulta
// sempre opera em cima de uma única tabela por vez.
//
// A "pergunta" do usuário é sempre: uma métrica + agregação, agrupada por
// 0+ dimensões, com 0+ filtros. Isso cobre totalizadores simples e tabelas
// dinâmicas por categoria/tempo sem expor SQL.

import type { Agregacao } from './dicionario'

export type OperadorFiltro = 'igual' | 'diferente' | 'contem' | 'maior' | 'menor' | 'entre'

export interface FiltroConsulta {
  coluna: string
  operador: OperadorFiltro
  valor: string | number
  valorFim?: string | number // usado apenas quando operador === 'entre'
}

export interface ConfigConsulta {
  metrica: string | null // nome_original da coluna métrica; null = "contagem de linhas"
  agregacao: Agregacao
  agruparPor: string[] // nomes_original das colunas de dimensão escolhidas
  filtros: FiltroConsulta[]
}

export interface LinhaResultadoConsulta {
  chave: string // rótulo do grupo, já concatenado (ex: "2024/Superficial")
  grupo: Record<string, string> // valores de cada dimensão de agrupamento, separados
  valor: number
}

function valorNumerico(v: unknown): number | null {
  if (typeof v === 'number') return isNaN(v) ? null : v
  if (typeof v === 'string' && v.trim() !== '') {
    const n = Number(v)
    return isNaN(n) ? null : n
  }
  return null
}

function aplicaOperador(valorLinha: unknown, filtro: FiltroConsulta): boolean {
  const bruto = valorLinha == null ? '' : String(valorLinha)
  switch (filtro.operador) {
    case 'igual':
      return bruto.toLowerCase() === String(filtro.valor).toLowerCase()
    case 'diferente':
      return bruto.toLowerCase() !== String(filtro.valor).toLowerCase()
    case 'contem':
      return bruto.toLowerCase().includes(String(filtro.valor).toLowerCase())
    case 'maior': {
      const a = valorNumerico(valorLinha)
      const b = valorNumerico(filtro.valor)
      return a != null && b != null ? a > b : bruto > String(filtro.valor)
    }
    case 'menor': {
      const a = valorNumerico(valorLinha)
      const b = valorNumerico(filtro.valor)
      return a != null && b != null ? a < b : bruto < String(filtro.valor)
    }
    case 'entre': {
      const a = valorNumerico(valorLinha)
      const ini = valorNumerico(filtro.valor)
      const fim = valorNumerico(filtro.valorFim ?? '')
      if (a != null && ini != null && fim != null) return a >= ini && a <= fim
      return bruto >= String(filtro.valor) && bruto <= String(filtro.valorFim ?? '')
    }
    default:
      return true
  }
}

export function aplicarFiltros(
  linhas: Record<string, any>[],
  filtros: FiltroConsulta[],
): Record<string, any>[] {
  if (filtros.length === 0) return linhas
  return linhas.filter((linha) => filtros.every((f) => aplicaOperador(linha[f.coluna], f)))
}

function agrega(valores: number[], agregacao: Agregacao): number {
  if (agregacao === 'contagem') return valores.length
  if (valores.length === 0) return 0
  switch (agregacao) {
    case 'soma':
      return valores.reduce((a, b) => a + b, 0)
    case 'media':
      return valores.reduce((a, b) => a + b, 0) / valores.length
    case 'min':
      return Math.min(...valores)
    case 'max':
      return Math.max(...valores)
    case 'contagem_distinta':
      return new Set(valores).size
    default:
      return valores.length
  }
}

/**
 * Executa a consulta e devolve uma linha por combinação de grupo (ou uma
 * única linha, se `agruparPor` estiver vazio — totalizador simples).
 */
export function executarConsulta(
  linhas: Record<string, any>[],
  config: ConfigConsulta,
): LinhaResultadoConsulta[] {
  const filtradas = aplicarFiltros(linhas, config.filtros)

  const grupos = new Map<string, { grupo: Record<string, string>; valores: number[] }>()

  for (const linha of filtradas) {
    const grupoValores: Record<string, string> = {}
    for (const col of config.agruparPor) {
      grupoValores[col] = linha[col] != null ? String(linha[col]) : '(vazio)'
    }
    const chave = config.agruparPor.length > 0 ? config.agruparPor.map((c) => grupoValores[c]).join(' / ') : 'Total'

    if (!grupos.has(chave)) {
      grupos.set(chave, { grupo: grupoValores, valores: [] })
    }

    // para 'contagem' não precisa de valor numérico da métrica; para as
    // demais agregações, ignora silenciosamente linhas sem valor numérico
    // válido na métrica escolhida (dado ausente/mal formatado na origem)
    if (config.agregacao === 'contagem') {
      grupos.get(chave)!.valores.push(1)
    } else if (config.metrica) {
      const v = valorNumerico(linha[config.metrica])
      if (v != null) grupos.get(chave)!.valores.push(v)
    }
  }

  return Array.from(grupos.entries())
    .map(([chave, { grupo, valores }]) => ({
      chave,
      grupo,
      valor: agrega(valores, config.agregacao),
    }))
    .sort((a, b) => a.chave.localeCompare(b.chave))
}
