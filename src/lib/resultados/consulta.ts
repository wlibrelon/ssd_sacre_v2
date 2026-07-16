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
  metricas: string[] // nomes_original das colunas métrica; [] = "contagem de linhas"
  agregacao: Agregacao
  agruparPor: string[] // nomes_original das colunas de dimensão escolhidas
  filtros: FiltroConsulta[]
}

export const CHAVE_CONTAGEM = '__contagem__'

export interface LinhaResultadoConsulta {
  chave: string // rótulo do grupo, já concatenado (ex: "2024/Superficial")
  grupo: Record<string, string> // valores de cada dimensão de agrupamento, separados
  valores: Record<string, number> // um valor agregado por métrica selecionada (ou CHAVE_CONTAGEM)
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

// ── Ordenação "inteligente" dos grupos ──────────────────────────────────────
// Por padrão os grupos seriam ordenados alfabeticamente pela chave, mas isso
// deixa meses fora de ordem (Abril antes de Janeiro) e números tratados como
// texto (10 antes de 2). Detecta o "formato" de cada coluna de agrupamento
// pelos valores realmente presentes e ordena de forma apropriada.
const NOMES_MES = [
  'janeiro', 'fevereiro', 'marco', 'abril', 'maio', 'junho',
  'julho', 'agosto', 'setembro', 'outubro', 'novembro', 'dezembro',
]
const ABREV_MES = ['jan', 'fev', 'mar', 'abr', 'mai', 'jun', 'jul', 'ago', 'set', 'out', 'nov', 'dez']

function semAcento(v: string): string {
  return v.normalize('NFD').replace(/[̀-ͯ]/g, '')
}

function ordemMes(valor: string): number | null {
  const norm = semAcento(valor.trim().toLowerCase())
  let idx = NOMES_MES.indexOf(norm)
  if (idx !== -1) return idx
  idx = ABREV_MES.indexOf(norm)
  if (idx !== -1) return idx
  // aceita abreviações "coladas" tipo "jan." ou variações com ponto
  idx = ABREV_MES.findIndex((abrev) => norm.startsWith(abrev))
  return idx === -1 ? null : idx
}

function criarComparadorColuna(valores: string[]): (a: string, b: string) => number {
  const valoresReais = valores.filter((v) => v !== '(vazio)')
  const usaMes = valoresReais.length > 0 && valoresReais.every((v) => ordemMes(v) !== null)
  const usaNumero =
    !usaMes && valoresReais.length > 0 && valoresReais.every((v) => valorNumerico(v) != null)

  return (a, b) => {
    if (a === '(vazio)' && b === '(vazio)') return 0
    if (a === '(vazio)') return 1
    if (b === '(vazio)') return -1
    if (usaMes) return (ordemMes(a) ?? 0) - (ordemMes(b) ?? 0)
    if (usaNumero) return (valorNumerico(a) ?? 0) - (valorNumerico(b) ?? 0)
    return a.localeCompare(b, 'pt-BR')
  }
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
  const metricas = config.metricas.length > 0 ? config.metricas : [CHAVE_CONTAGEM]

  const grupos = new Map<
    string,
    { grupo: Record<string, string>; valoresPorMetrica: Record<string, number[]> }
  >()

  for (const linha of filtradas) {
    const grupoValores: Record<string, string> = {}
    for (const col of config.agruparPor) {
      grupoValores[col] = linha[col] != null ? String(linha[col]) : '(vazio)'
    }
    const chave = config.agruparPor.length > 0 ? config.agruparPor.map((c) => grupoValores[c]).join(' / ') : 'Total'

    if (!grupos.has(chave)) {
      grupos.set(chave, {
        grupo: grupoValores,
        valoresPorMetrica: Object.fromEntries(metricas.map((m) => [m, []])),
      })
    }
    const entry = grupos.get(chave)!

    // para 'contagem' não precisa de valor numérico da métrica; para as
    // demais agregações, ignora silenciosamente linhas sem valor numérico
    // válido na métrica escolhida (dado ausente/mal formatado na origem)
    if (config.agregacao === 'contagem') {
      for (const m of metricas) entry.valoresPorMetrica[m].push(1)
    } else {
      for (const m of metricas) {
        if (m === CHAVE_CONTAGEM) continue
        const v = valorNumerico(linha[m])
        if (v != null) entry.valoresPorMetrica[m].push(v)
      }
    }
  }

  // comparador por coluna de agrupamento, construído a partir dos valores
  // realmente presentes nela (assim "mês" ordena por Jan..Dez, não A-Z)
  const comparadoresPorColuna = new Map<string, (a: string, b: string) => number>()
  for (const col of config.agruparPor) {
    const valoresColuna = Array.from(grupos.values()).map((g) => g.grupo[col])
    comparadoresPorColuna.set(col, criarComparadorColuna(valoresColuna))
  }

  return Array.from(grupos.entries())
    .map(([chave, { grupo, valoresPorMetrica }]) => ({
      chave,
      grupo,
      valores: Object.fromEntries(
        metricas.map((m) => [m, agrega(valoresPorMetrica[m], config.agregacao)]),
      ),
    }))
    .sort((a, b) => {
      for (const col of config.agruparPor) {
        const r = comparadoresPorColuna.get(col)!(a.grupo[col], b.grupo[col])
        if (r !== 0) return r
      }
      return a.chave.localeCompare(b.chave, 'pt-BR')
    })
}
