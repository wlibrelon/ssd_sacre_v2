// Classificação temática dos valores do atributo principal de uma camada
// vetorial — usada tanto para colorir as feições no mapa (GeoJSONLayer)
// quanto para montar a legenda (área-estudo/Camadas.tsx). Configurada no
// bloco "Classificação" do CamadaFormModal.tsx.

export type CategoriaClassificacao = { valor: string; cor: string; rotulo?: string }
export type ClasseGraduada = { min: number; max: number; cor: string; rotulo?: string }
export type ModoGraduado = 'intervalo_igual' | 'quantidade_igual'

export type Classificacao =
  | { tipo: 'categorico'; campo: string; categorias: CategoriaClassificacao[] }
  | { tipo: 'graduado'; campo: string; modo: ModoGraduado; classes: ClasseGraduada[] }

/**
 * Monta a classificação "pronta para uso" a partir das colunas gravadas em
 * `camadas_mapa` (campo_classificacao, tipo_classificacao, classificacao).
 * Retorna null quando a camada não tem classificação configurada (ou os
 * dados salvos estão incompletos/vazios) — nesse caso o chamador deve usar
 * a cor fixa do estilo da camada, como antes.
 */
export function construirClassificacao(camada: {
  campo_classificacao?: string | null
  tipo_classificacao?: string | null
  classificacao?: unknown
}): Classificacao | null {
  if (!camada.campo_classificacao) return null
  const dados = (camada.classificacao && typeof camada.classificacao === 'object'
    ? camada.classificacao
    : {}) as any

  if (camada.tipo_classificacao === 'categorico') {
    const categorias: CategoriaClassificacao[] = Array.isArray(dados.categorias)
      ? dados.categorias.filter((c: any) => c && typeof c.valor === 'string' && typeof c.cor === 'string')
      : []
    if (categorias.length === 0) return null
    return { tipo: 'categorico', campo: camada.campo_classificacao, categorias }
  }

  if (camada.tipo_classificacao === 'graduado') {
    const classes: ClasseGraduada[] = Array.isArray(dados.classes)
      ? dados.classes.filter(
          (c: any) => c && typeof c.min === 'number' && typeof c.max === 'number' && typeof c.cor === 'string',
        )
      : []
    if (classes.length === 0) return null
    return {
      tipo: 'graduado',
      campo: camada.campo_classificacao,
      modo: dados.modo === 'quantidade_igual' ? 'quantidade_igual' : 'intervalo_igual',
      classes,
    }
  }

  return null
}

/** Cor da feição segundo a classificação, ou null se não houver
 * classificação ou o valor da feição não se encaixar em nenhuma
 * categoria/classe (o chamador cai de volta para a cor fixa do estilo). */
export function corDaClassificacao(
  classificacao: Classificacao | null | undefined,
  properties: Record<string, any> | null | undefined,
): string | null {
  if (!classificacao || !properties) return null
  const bruto = properties[classificacao.campo]
  if (bruto === null || bruto === undefined || bruto === '') return null

  if (classificacao.tipo === 'categorico') {
    const valor = String(bruto)
    return classificacao.categorias.find((c) => c.valor === valor)?.cor ?? null
  }

  const numero = Number(bruto)
  if (Number.isNaN(numero)) return null
  const ultimoIndice = classificacao.classes.length - 1
  const classe = classificacao.classes.find((c, i) =>
    i === ultimoIndice ? numero >= c.min && numero <= c.max : numero >= c.min && numero < c.max,
  )
  return classe?.cor ?? null
}

export function rotuloCategoria(c: CategoriaClassificacao): string {
  return c.rotulo?.trim() || c.valor
}

function formatarNumero(n: number): string {
  return Number.isInteger(n) ? String(n) : n.toFixed(2)
}

export function rotuloClasse(c: ClasseGraduada): string {
  if (c.rotulo?.trim()) return c.rotulo.trim()
  return `${formatarNumero(c.min)} – ${formatarNumero(c.max)}`
}

// ---------------------------------------------------------------------------
// Geração automática de categorias/classes — usada no formulário de
// cadastro para poupar o admin de configurar tudo manualmente. O resultado
// pode ser editado livremente depois de gerado.
// ---------------------------------------------------------------------------

const PALETA_CATEGORICA = [
  '#4e79a7',
  '#f28e2b',
  '#e15759',
  '#76b7b2',
  '#59a14f',
  '#edc948',
  '#b07aa1',
  '#ff9da7',
  '#9c755f',
  '#bab0ac',
]

export function corCategoricaAutomatica(indice: number): string {
  return PALETA_CATEGORICA[indice % PALETA_CATEGORICA.length]
}

function hexParaRgb(hex: string): [number, number, number] {
  const limpo = hex.replace('#', '')
  const normalizado =
    limpo.length === 3
      ? limpo
          .split('')
          .map((c) => c + c)
          .join('')
      : limpo
  const bigint = parseInt(normalizado, 16)
  return [(bigint >> 16) & 255, (bigint >> 8) & 255, bigint & 255]
}

function rgbParaHex([r, g, b]: [number, number, number]): string {
  return (
    '#' +
    [r, g, b]
      .map((v) => Math.max(0, Math.min(255, Math.round(v))).toString(16).padStart(2, '0'))
      .join('')
  )
}

/** Gera `n` cores em degradê entre `corInicial` e `corFinal` — usado para
 * colorir automaticamente as classes graduadas (do menor para o maior
 * valor), do mesmo jeito que o QGIS faz com uma rampa de cores. */
export function gerarRampaCores(corInicial: string, corFinal: string, n: number): string[] {
  if (n <= 0) return []
  if (n === 1) return [corInicial]
  const rgbInicial = hexParaRgb(corInicial)
  const rgbFinal = hexParaRgb(corFinal)
  return Array.from({ length: n }, (_, i) => {
    const t = i / (n - 1)
    const rgb: [number, number, number] = [
      rgbInicial[0] + (rgbFinal[0] - rgbInicial[0]) * t,
      rgbInicial[1] + (rgbFinal[1] - rgbInicial[1]) * t,
      rgbInicial[2] + (rgbFinal[2] - rgbInicial[2]) * t,
    ]
    return rgbParaHex(rgb)
  })
}

/** Classes de largura igual entre min e max — modo "Intervalo Igual" do
 * QGIS. */
export function calcularIntervaloIgual(min: number, max: number, n: number): [number, number][] {
  if (n <= 0 || !Number.isFinite(min) || !Number.isFinite(max)) return []
  if (min === max) return [[min, max]]
  const passo = (max - min) / n
  return Array.from({ length: n }, (_, i) => [
    min + passo * i,
    i === n - 1 ? max : min + passo * (i + 1),
  ])
}

/** Classes com (aproximadamente) a mesma quantidade de feições em cada uma
 * — modo "Quantidade Igual" do QGIS (quantis). `valoresOrdenados` deve
 * estar em ordem crescente. */
export function calcularQuantidadeIgual(valoresOrdenados: number[], n: number): [number, number][] {
  if (n <= 0 || valoresOrdenados.length === 0) return []
  const total = valoresOrdenados.length
  const cortes: number[] = [valoresOrdenados[0]]
  for (let i = 1; i < n; i++) {
    const idx = Math.min(Math.floor((total * i) / n), total - 1)
    cortes.push(valoresOrdenados[idx])
  }
  cortes.push(valoresOrdenados[total - 1])
  return Array.from({ length: n }, (_, i) => [cortes[i], cortes[i + 1]])
}
