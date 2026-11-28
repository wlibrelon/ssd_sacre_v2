// Cálculo único dos resultados de uma execução da simulação. Usado pelas abas
// de Resultados (Dados Gerais, Captação e Distribuição, Financeiro) e pela
// gravação de simulações, para que o número exibido na tela seja sempre o
// mesmo número gravado e comparado.
//
// Definições por mês (todas as linhas de dados_simulacao daquele mês):
//   captado / distribuído : soma das linhas (volumes são aditivos entre fontes)
//   demanda               : média das linhas (a demanda é regional; cada fonte
//                           traz a mesma demanda da região) — mesma definição
//                           usada no Índice de Segurança Hídrica
//   índice                : min(1, distribuído ÷ demanda)
//   CAPEX                 : CAPEX das estratégias (somado entre fontes, média
//                           das linhas de uma mesma fonte) + CAPEX de perdas
//                           (regional: média das linhas)
//   OPEX                  : regional — média das linhas (antes era somado uma
//                           vez por fonte, duplicando o valor com 2+ fontes)

export type MesSimulacao = {
  tempo: string
  captado: number
  distribuido: number
  demanda: number
  saldo: number // distribuído − demanda (negativo = déficit)
  indice: number
  capex: number
  opex: number
  perdas: number // % médio no mês
  populacao: number | null
  captadoPorFonte: Record<string, number>
}

const media = (v: number[]) => (v.length ? v.reduce((a, b) => a + b, 0) / v.length : 0)
const num = (v: any) => (v === null || v === undefined || Number.isNaN(Number(v)) ? 0 : Number(v))

export function agregarPorTempo(rows: any[]): MesSimulacao[] {
  const porTempo: Record<string, any[]> = {}
  rows.forEach((r) => {
    if (!r?.tempo) return
    ;(porTempo[r.tempo] ||= []).push(r)
  })
  return Object.keys(porTempo)
    .sort((a, b) => a.localeCompare(b))
    .map((tempo) => {
      const linhas = porTempo[tempo]
      const porFonte: Record<string, any[]> = {}
      linhas.forEach((r) => (porFonte[String(r.id_fonte)] ||= []).push(r))
      const captado = linhas.reduce((s, r) => s + num(r.volume_captado), 0)
      const distribuido = linhas.reduce(
        (s, r) =>
          s +
          (r.volume_distribuido !== undefined
            ? num(r.volume_distribuido)
            : num(r.volume_captado) * (1 - num(r.perdas) / 100)),
        0,
      )
      const demanda = media(linhas.map((r) => num(r.demanda)))
      const capexEstrategias = Object.values(porFonte).reduce(
        (s, ls) => s + media(ls.map((r) => num(r.capex_estrategia))),
        0,
      )
      const capexPerdas = media(linhas.map((r) => num(r.capex_perdas)))
      const opex = media(linhas.map((r) => num(r.opex)))
      const captadoPorFonte: Record<string, number> = {}
      Object.entries(porFonte).forEach(([f, ls]) => {
        captadoPorFonte[f] = ls.reduce((s, r) => s + num(r.volume_captado), 0)
      })
      const pop = linhas.find((r) => num(r.populacao_calculada) > 0)?.populacao_calculada
      return {
        tempo,
        captado,
        distribuido,
        demanda,
        saldo: distribuido - demanda,
        indice: demanda > 0 ? Math.min(1, distribuido / demanda) : 1,
        capex: capexEstrategias + capexPerdas,
        opex,
        perdas: media(linhas.map((r) => num(r.perdas))),
        populacao: pop ? Number(pop) : null,
        captadoPorFonte,
      }
    })
}

/** Valor presente de uma série mensal, com taxa anual (%) convertida na taxa
 * mensal equivalente; o primeiro mês do período não é descontado. */
export function valorPresente(valores: number[], taxaAnualPct: number | null | undefined): number {
  const i = num(taxaAnualPct) / 100
  const r = Math.pow(1 + i, 1 / 12) - 1
  return valores.reduce((s, v, k) => s + v / Math.pow(1 + r, k), 0)
}

// ── Catálogo de indicadores ─────────────────────────────────────────────────
export type Formato = 'vol' | 'volTotal' | 'meses' | 'indice' | 'pct' | 'brl' | 'brlM3' | 'hab'
export type DefIndicador = {
  codigo: string
  nome: string
  formato: Formato
  /** Pode entrar na matriz de decisão (tem um sentido de "melhor") */
  naMatriz: boolean
}

export const INDICADORES: DefIndicador[] = [
  { codigo: 'vazao_media_distribuida', nome: 'Vazão média distribuída', formato: 'vol', naMatriz: true },
  { codigo: 'demanda_media', nome: 'Demanda média', formato: 'vol', naMatriz: true },
  { codigo: 'meses_deficit', nome: 'Meses com déficit', formato: 'meses', naMatriz: true },
  { codigo: 'indice_medio', nome: 'Índice médio no período', formato: 'indice', naMatriz: true },
  { codigo: 'indice_minimo', nome: 'Índice mínimo', formato: 'indice', naMatriz: true },
  { codigo: 'pct_meses_seguro', nome: 'Meses seguros', formato: 'pct', naMatriz: true },
  { codigo: 'pct_meses_alerta', nome: 'Meses em alerta', formato: 'pct', naMatriz: false },
  { codigo: 'pct_meses_crise', nome: 'Meses em crise', formato: 'pct', naMatriz: false },
  { codigo: 'pct_meses_colapso', nome: 'Meses em colapso', formato: 'pct', naMatriz: true },
  { codigo: 'deficit_acumulado', nome: 'Déficit acumulado', formato: 'volTotal', naMatriz: true },
  { codigo: 'maior_sequencia_deficit', nome: 'Maior sequência de meses com déficit', formato: 'meses', naMatriz: true },
  { codigo: 'capex_total', nome: 'CAPEX (total)', formato: 'brl', naMatriz: true },
  { codigo: 'opex_total', nome: 'OPEX (total)', formato: 'brl', naMatriz: true },
  { codigo: 'custo_m3', nome: 'Custo por m³ distribuído', formato: 'brlM3', naMatriz: true },
  { codigo: 'vpl_custos', nome: 'Valor presente dos custos (VPL)', formato: 'brl', naMatriz: true },
]

/** Indicadores descritivos (parâmetros resultantes), exibidos na comparação de parâmetros */
export const DESCRITIVOS: DefIndicador[] = [
  { codigo: 'populacao_inicial', nome: 'População inicial', formato: 'hab', naMatriz: false },
  { codigo: 'populacao_final', nome: 'População final', formato: 'hab', naMatriz: false },
  { codigo: 'perdas_inicial', nome: 'Perdas iniciais', formato: 'pct', naMatriz: false },
  { codigo: 'perdas_final', nome: 'Perdas finais', formato: 'pct', naMatriz: false },
  { codigo: 'meses_total', nome: 'Total de meses', formato: 'meses', naMatriz: false },
]

export function formatar(valor: number | null | undefined, formato: Formato): string {
  if (valor === null || valor === undefined || Number.isNaN(valor)) return '—'
  const n = (v: number, d = 0) => v.toLocaleString('pt-BR', { maximumFractionDigits: d })
  switch (formato) {
    case 'vol':
      return `${n(valor)} m³/mês`
    case 'volTotal':
      return `${n(valor)} m³`
    case 'meses':
      return n(valor)
    case 'indice':
      return n(valor, 3)
    case 'pct':
      return `${n(valor, 1)} %`
    case 'brl':
      return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', maximumFractionDigits: 0 })
    case 'brlM3':
      return valor.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL', minimumFractionDigits: 2, maximumFractionDigits: 4 })
    case 'hab':
      return `${n(valor)} hab.`
  }
}

export type ResultadoIndicador = { indicador: string; id_fonte: number | null; valor: number | null }

export function calcularIndicadores(
  meses: MesSimulacao[],
  opcoes: {
    limiarAlerta: number
    limiarCrise: number
    limiarColapso: number
    taxaDesconto: number | null | undefined
  },
): ResultadoIndicador[] {
  const n = meses.length
  const out: ResultadoIndicador[] = []
  const add = (indicador: string, valor: number | null, id_fonte: number | null = null) =>
    out.push({ indicador, id_fonte, valor: valor === null || !Number.isFinite(valor) ? null : valor })
  if (n === 0) return out

  const classe = (i: number) =>
    i >= opcoes.limiarAlerta ? 'seguro' : i >= opcoes.limiarCrise ? 'alerta' : i >= opcoes.limiarColapso ? 'crise' : 'colapso'
  const pctClasse = (c: string) => (meses.filter((m) => classe(m.indice) === c).length / n) * 100

  let seq = 0
  let maiorSeq = 0
  meses.forEach((m) => {
    seq = m.saldo < 0 ? seq + 1 : 0
    maiorSeq = Math.max(maiorSeq, seq)
  })

  const capexTotal = meses.reduce((s, m) => s + m.capex, 0)
  const opexTotal = meses.reduce((s, m) => s + m.opex, 0)
  const distTotal = meses.reduce((s, m) => s + m.distribuido, 0)

  add('vazao_media_distribuida', media(meses.map((m) => m.distribuido)))
  add('demanda_media', media(meses.map((m) => m.demanda)))
  add('meses_deficit', meses.filter((m) => m.saldo < 0).length)
  add('indice_medio', media(meses.map((m) => m.indice)))
  add('indice_minimo', Math.min(...meses.map((m) => m.indice)))
  add('pct_meses_seguro', pctClasse('seguro'))
  add('pct_meses_alerta', pctClasse('alerta'))
  add('pct_meses_crise', pctClasse('crise'))
  add('pct_meses_colapso', pctClasse('colapso'))
  add('deficit_acumulado', meses.reduce((s, m) => s + Math.max(0, -m.saldo), 0))
  add('maior_sequencia_deficit', maiorSeq)
  add('capex_total', capexTotal)
  add('opex_total', opexTotal)
  add('custo_m3', distTotal > 0 ? (capexTotal + opexTotal) / distTotal : null)
  add('vpl_custos', valorPresente(meses.map((m) => m.capex + m.opex), opcoes.taxaDesconto))
  add('vpl_capex', valorPresente(meses.map((m) => m.capex), opcoes.taxaDesconto))
  add('vpl_opex', valorPresente(meses.map((m) => m.opex), opcoes.taxaDesconto))

  add('populacao_inicial', meses[0].populacao)
  add('populacao_final', meses[n - 1].populacao)
  add('perdas_inicial', meses[0].perdas)
  add('perdas_final', meses[n - 1].perdas)
  add('meses_total', n)

  // Participação de cada fonte na captação do último mês do período
  const ultimo = meses[n - 1]
  Object.entries(ultimo.captadoPorFonte).forEach(([f, v]) =>
    add('participacao_final', ultimo.captado > 0 ? (v / ultimo.captado) * 100 : null, Number(f)),
  )
  return out
}

/** Série mensal reduzida gravada com a simulação (para gráficos comparativos). */
export const serieParaGravar = (meses: MesSimulacao[]) =>
  meses.map((m) => ({
    tempo: m.tempo,
    captado: m.captado,
    distribuido: m.distribuido,
    demanda: m.demanda,
    indice: m.indice,
    capex: m.capex,
    opex: m.opex,
    perdas: m.perdas,
    populacao: m.populacao,
    captado_por_fonte: m.captadoPorFonte,
  }))
