// Tipos das simulações gravadas (tabelas simulacoes, simulacao_modelos e
// simulacao_resultados — ver migration 20261127230000_simulacoes_gravadas.sql)
export type ModeloGravado = {
  id_mod: number | null // nulo = modelo excluído depois da gravação
  id_mod_original: number
  id_fonte: number | null
  nome_fonte: string | null
  cenarios: string[]
  estrategias: string[]
}

export type ResultadoGravado = { indicador: string; id_fonte: number | null; valor: number | null }

export type ParametrosGravados = {
  globais?: {
    limiar_alerta?: number
    limiar_crise?: number
    limiar_colapso?: number
    demanda_auto?: boolean
    perdas_auto?: boolean
    pop_inicial?: number | null
    perc_inicial_perdas?: number | null
    inicio_perdas?: string | null
    taxa_desconto?: number | null
  }
  cenarios?: {
    id_cd?: number | null
    nome_cd?: string | null
    percentual_cd?: number | null
    id_cc?: number | null
    nome_cc?: string | null
    vol_hab?: number | null
    id_cp?: number | null
    nome_cp?: string | null
    percentual_cp?: number | null
  }
  periodo?: {
    ano_inicio?: number | null
    ano_fim?: number | null
    primeiro?: string | null
    ultimo?: string | null
    meses?: number
  }
  fontes?: Record<string, string>
}

export type SimulacaoGravada = {
  id_simulacao: number
  titulo: string
  descricao: string | null
  comparar: boolean
  parametros: ParametrosGravados
  serie_mensal: any[]
  criado_at: string | null
  gravado_em: string | null
  simulacao_modelos: ModeloGravado[]
  simulacao_resultados: ResultadoGravado[]
}

/** Parâmetros gerais cujo valor atual é comparado ao gravado (aviso de mudança) */
export const PARAMETROS_GERAIS: { campo: keyof NonNullable<ParametrosGravados['globais']>; nome: string }[] = [
  { campo: 'limiar_alerta', nome: 'Limiar de alerta' },
  { campo: 'limiar_crise', nome: 'Limiar de crise' },
  { campo: 'limiar_colapso', nome: 'Limiar de colapso' },
  { campo: 'demanda_auto', nome: 'Demanda automática' },
  { campo: 'perdas_auto', nome: 'Perdas automáticas' },
  { campo: 'pop_inicial', nome: 'População inicial' },
  { campo: 'perc_inicial_perdas', nome: 'Perc. inicial de perdas' },
  { campo: 'inicio_perdas', nome: 'Início da redução de perdas' },
  { campo: 'taxa_desconto', nome: 'Taxa de desconto' },
]

export const dataHora = (iso: string | null | undefined) =>
  iso
    ? new Date(iso).toLocaleString('pt-BR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit',
      })
    : '—'

export const conjunto = (v: any) => JSON.stringify((Array.isArray(v) ? v : []).map(String).sort())
