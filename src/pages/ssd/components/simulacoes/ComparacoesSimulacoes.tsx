// Grupo "Comparações entre simulações": compara as simulações gravadas
// marcadas em "Comparar" — parâmetros, resultados, matriz de decisão (com
// sentido e peso de cada indicador, configuração geral) e evolução do índice.
// Usa apenas o que foi gravado; não depende de executar a simulação.
import { useEffect, useMemo, useState, type ReactNode } from 'react'
import { supabase } from '@/lib/supabase/client'
import { toast } from 'sonner'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Checkbox } from '@/components/ui/checkbox'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { AlertTriangle, Trophy } from 'lucide-react'
import { CartesianGrid, Legend, Line, LineChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import { DESCRITIVOS, INDICADORES, formatar, type DefIndicador } from '../../resultadosSimulacao'
import { dataHora, type SimulacaoGravada } from './tipos'

type ConfigIndicador = { indicador: string; incluir: boolean; sentido: 'maior' | 'menor'; peso: number }

const CORES = ['#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed', '#0891b2', '#be185d', '#475569']
const SENTIDO_PADRAO: Record<string, 'maior' | 'menor'> = {
  vazao_media_distribuida: 'maior',
  indice_medio: 'maior',
  indice_minimo: 'maior',
  pct_meses_seguro: 'maior',
}

const valorDe = (s: SimulacaoGravada, indicador: string, idFonte: number | null = null) => {
  const r = s.simulacao_resultados?.find(
    (x) => x.indicador === indicador && (idFonte === null ? x.id_fonte === null : x.id_fonte === idFonte),
  )
  return r?.valor ?? null
}

/** Posição de cada simulação num indicador (1 = melhor; empates dividem a
 * posição; sem valor = última posição). */
function rankear(valores: (number | null)[], sentido: 'maior' | 'menor'): number[] {
  const n = valores.length
  return valores.map((v) => {
    if (v === null) return n
    const melhores = valores.filter((o) => o !== null && (sentido === 'maior' ? o > v : o < v)).length
    return melhores + 1
  })
}

export function ComparacoesSimulacoes({ simulacoes }: { simulacoes: SimulacaoGravada[] }) {
  // ── Configuração geral da matriz de decisão ───────────────────────────────
  const [config, setConfig] = useState<Record<string, ConfigIndicador>>({})
  const [configSalva, setConfigSalva] = useState<Record<string, ConfigIndicador>>({})
  const [salvando, setSalvando] = useState(false)

  useEffect(() => {
    supabase
      .from('matriz_decisao_config')
      .select('indicador, incluir, sentido, peso')
      .then(({ data, error }) => {
        if (error) toast.error(`Erro ao carregar a configuração da matriz: ${error.message}`)
        const c: Record<string, ConfigIndicador> = {}
        INDICADORES.filter((d) => d.naMatriz).forEach((d) => {
          const r: any = (data || []).find((x: any) => x.indicador === d.codigo)
          c[d.codigo] = r
            ? { indicador: d.codigo, incluir: !!r.incluir, sentido: r.sentido === 'maior' ? 'maior' : 'menor', peso: Number(r.peso) || 0 }
            : { indicador: d.codigo, incluir: false, sentido: SENTIDO_PADRAO[d.codigo] || 'menor', peso: 1 }
        })
        setConfig(c)
        setConfigSalva(c)
      })
  }, [])

  const configAlterada = JSON.stringify(config) !== JSON.stringify(configSalva)
  const salvarConfig = async () => {
    setSalvando(true)
    const linhas = (Object.values(config) as ConfigIndicador[]).map((c) => ({ ...c, atualizado_at: new Date().toISOString() }))
    const { data, error } = await supabase.from('matriz_decisao_config').upsert(linhas).select('indicador')
    setSalvando(false)
    if (error) return toast.error(`Erro ao salvar: ${error.message}`)
    if (!data || data.length === 0) return toast.error('A configuração não foi gravada: sem permissão.')
    setConfigSalva(config)
    toast.success('Configuração da matriz salva (vale para todos os usuários)')
  }

  const setItem = (codigo: string, p: Partial<ConfigIndicador>) =>
    setConfig((prev) => ({ ...prev, [codigo]: { ...prev[codigo], ...p } }))

  // ── Dados derivados ───────────────────────────────────────────────────────
  const fontes = useMemo(() => {
    const m = new Map<number, string>()
    simulacoes.forEach((s) =>
      (s.simulacao_modelos || []).forEach((mod) => {
        if (mod.id_fonte !== null && !m.has(mod.id_fonte)) m.set(mod.id_fonte, mod.nome_fonte || `Fonte ${mod.id_fonte}`)
      }),
    )
    return Array.from(m.entries()).sort((a, b) => a[1].localeCompare(b[1]))
  }, [simulacoes])

  const matriz = useMemo(() => {
    const incluidos = INDICADORES.filter((d) => d.naMatriz && config[d.codigo]?.incluir)
    const linhas = incluidos.map((d) => {
      const valores = simulacoes.map((s) => valorDe(s, d.codigo))
      return { def: d, valores, ranks: rankear(valores, config[d.codigo].sentido), peso: config[d.codigo].peso }
    })
    const somaPesos = linhas.reduce((s, l) => s + l.peso, 0)
    const pontuacao = simulacoes.map((_, j) =>
      somaPesos > 0 ? linhas.reduce((s, l) => s + l.peso * l.ranks[j], 0) / somaPesos : null,
    )
    const classificacao = rankear(pontuacao, 'menor')
    return { linhas, pontuacao, classificacao, somaPesos }
  }, [simulacoes, config])

  const serieIndice = useMemo(() => {
    const porTempo: Record<string, any> = {}
    simulacoes.forEach((s) =>
      (s.serie_mensal || []).forEach((m: any) => {
        ;(porTempo[m.tempo] ||= { tempo: m.tempo })[`s${s.id_simulacao}`] = m.indice
      }),
    )
    return Object.values(porTempo).sort((a: any, b: any) => a.tempo.localeCompare(b.tempo))
  }, [simulacoes])

  // ── Auxiliares de tabela ──────────────────────────────────────────────────
  const Tabela = ({ children }: { children: ReactNode }) => (
    <div className="border rounded-lg overflow-x-auto">
      <table className="w-full text-xs">
        <thead className="bg-slate-100">
          <tr>
            <th className="px-3 py-2.5 text-left font-semibold text-slate-600 min-w-[220px] sticky left-0 bg-slate-100" />
            {simulacoes.map((s) => (
              <th key={s.id_simulacao} className="px-3 py-2.5 text-left font-semibold text-slate-700 min-w-[180px]">
                {s.titulo}
              </th>
            ))}
          </tr>
        </thead>
        <tbody className="divide-y">{children}</tbody>
      </table>
    </div>
  )
  const Linha = ({ rotulo, celulas, secao }: { rotulo: ReactNode; celulas?: ReactNode[]; secao?: boolean }) =>
    secao ? (
      <tr className="bg-slate-50">
        <td colSpan={simulacoes.length + 1} className="px-3 py-1.5 font-semibold text-primary text-[11px] uppercase tracking-wide">
          {rotulo}
        </td>
      </tr>
    ) : (
      <tr>
        <td className="px-3 py-2 font-medium text-slate-600 sticky left-0 bg-white">{rotulo}</td>
        {celulas!.map((c, i) => (
          <td key={i} className="px-3 py-2 align-top">
            {c}
          </td>
        ))}
      </tr>
    )

  const destaque = (d: DefIndicador, valores: (number | null)[]) => {
    const c = config[d.codigo]
    if (!c) return valores.map((v) => formatar(v, d.formato))
    const validos = valores.filter((v): v is number => v !== null)
    const melhor = validos.length > 1 ? (c.sentido === 'maior' ? Math.max(...validos) : Math.min(...validos)) : null
    const pior = validos.length > 1 ? (c.sentido === 'maior' ? Math.min(...validos) : Math.max(...validos)) : null
    return valores.map((v) => (
      <span className={v !== null && melhor !== pior && v === melhor ? 'font-semibold text-emerald-700' : v !== null && melhor !== pior && v === pior ? 'text-red-600' : ''}>
        {formatar(v, d.formato)}
      </span>
    ))
  }

  const chips = (itens: string[], cor: 'azul' | 'verde') => (
    <div className="flex flex-wrap gap-1">
      {itens.map((t) => (
        <span
          key={t}
          className={`rounded px-1 py-0.5 text-[10px] border ${
            cor === 'azul' ? 'bg-blue-50 border-blue-200 text-blue-700' : 'bg-emerald-50 border-emerald-200 text-emerald-700'
          }`}
        >
          {t}
        </span>
      ))}
    </div>
  )

  const fmtNum = (v: any, d = 2) => (v === null || v === undefined ? '—' : Number(v).toLocaleString('pt-BR', { maximumFractionDigits: d }))

  return (
    <Tabs defaultValue="parametros" className="w-full">
      <TabsList className="flex-wrap h-auto">
        <TabsTrigger value="parametros">Parâmetros</TabsTrigger>
        <TabsTrigger value="resultados">Resultados</TabsTrigger>
        <TabsTrigger value="matriz">Matriz de decisão</TabsTrigger>
        <TabsTrigger value="indice">Evolução do índice</TabsTrigger>
      </TabsList>

      {/* ── Parâmetros ── */}
      <TabsContent value="parametros" className="pt-4">
        <Tabela>
          <Linha rotulo="Gravada em" celulas={simulacoes.map((s) => dataHora(s.gravado_em))} />
          <Linha rotulo="Descrição" celulas={simulacoes.map((s) => <span className="text-slate-600">{s.descricao || '—'}</span>)} />
          <Linha secao rotulo="Fontes, cenários e estratégias" />
          {fontes.map(([id, nome]) => (
            <Linha
              key={id}
              rotulo={nome}
              celulas={simulacoes.map((s) => {
                const mods = (s.simulacao_modelos || []).filter((m) => m.id_fonte === id)
                if (mods.length === 0) return <span className="text-muted-foreground">não participa</span>
                return (
                  <div className="space-y-1.5">
                    {mods.map((m, k) => (
                      <div key={k} className="space-y-1">
                        {chips(m.cenarios || [], 'azul')}
                        {chips(m.estrategias || [], 'verde')}
                        {m.id_mod === null && (
                          <span className="text-[10px] text-amber-700 flex gap-1">
                            <AlertTriangle className="w-3 h-3" /> modelo nº {m.id_mod_original} excluído
                          </span>
                        )}
                      </div>
                    ))}
                  </div>
                )
              })}
            />
          ))}
          <Linha secao rotulo="Período" />
          <Linha
            rotulo="Período simulado"
            celulas={simulacoes.map((s) => {
              const p = s.parametros?.periodo
              return p?.primeiro ? `${p.primeiro} a ${p.ultimo} (${p.meses} meses)` : '—'
            })}
          />
          <Linha secao rotulo="Demanda" />
          <Linha rotulo="Cálculo da demanda" celulas={simulacoes.map((s) => (s.parametros?.globais?.demanda_auto ? 'Automática' : 'Importada'))} />
          <Linha
            rotulo="Cenário de crescimento populacional"
            celulas={simulacoes.map((s) => {
              const c = s.parametros?.cenarios
              return s.parametros?.globais?.demanda_auto && c?.nome_cd ? `${c.nome_cd} (${fmtNum(c.percentual_cd)} % a.a.)` : '—'
            })}
          />
          <Linha
            rotulo="Cenário de consumo per capita"
            celulas={simulacoes.map((s) => {
              const c = s.parametros?.cenarios
              return s.parametros?.globais?.demanda_auto && c?.nome_cc ? `${c.nome_cc} (${fmtNum(c.vol_hab, 1)} L/hab./dia)` : '—'
            })}
          />
          {DESCRITIVOS.filter((d) => d.codigo.startsWith('populacao')).map((d) => (
            <Linha key={d.codigo} rotulo={d.nome} celulas={simulacoes.map((s) => formatar(valorDe(s, d.codigo), d.formato))} />
          ))}
          <Linha secao rotulo="Perdas" />
          <Linha rotulo="Cálculo das perdas" celulas={simulacoes.map((s) => (s.parametros?.globais?.perdas_auto ? 'Automáticas' : 'Importadas'))} />
          <Linha
            rotulo="Cenário de meta de perdas"
            celulas={simulacoes.map((s) => {
              const c = s.parametros?.cenarios
              return s.parametros?.globais?.perdas_auto && c?.nome_cp ? `${c.nome_cp} (${fmtNum(c.percentual_cp)} %)` : '—'
            })}
          />
          {DESCRITIVOS.filter((d) => d.codigo.startsWith('perdas')).map((d) => (
            <Linha key={d.codigo} rotulo={d.nome} celulas={simulacoes.map((s) => formatar(valorDe(s, d.codigo), d.formato))} />
          ))}
          <Linha secao rotulo="Parâmetros gerais" />
          <Linha
            rotulo="Limiares (alerta / crise / colapso)"
            celulas={simulacoes.map((s) => {
              const g = s.parametros?.globais
              return g ? `${fmtNum(g.limiar_alerta)} / ${fmtNum(g.limiar_crise)} / ${fmtNum(g.limiar_colapso)}` : '—'
            })}
          />
          <Linha rotulo="Taxa de desconto" celulas={simulacoes.map((s) => `${fmtNum(s.parametros?.globais?.taxa_desconto ?? 0)} % a.a.`)} />
        </Tabela>
      </TabsContent>

      {/* ── Resultados ── */}
      <TabsContent value="resultados" className="pt-4 space-y-2">
        <Tabela>
          {INDICADORES.map((d) => (
            <Linha key={d.codigo} rotulo={d.nome} celulas={destaque(d, simulacoes.map((s) => valorDe(s, d.codigo)))} />
          ))}
          <Linha secao rotulo="Participação de cada fonte na captação (último mês)" />
          {fontes.map(([id, nome]) => (
            <Linha key={id} rotulo={nome} celulas={simulacoes.map((s) => formatar(valorDe(s, 'participacao_final', id), 'pct'))} />
          ))}
        </Tabela>
        <p className="text-xs text-muted-foreground">
          Em verde, o melhor valor de cada indicador; em vermelho, o pior — conforme o sentido definido na matriz de
          decisão. Volumes são médias mensais (m³/mês), exceto o déficit acumulado (m³ no período).
        </p>
      </TabsContent>

      {/* ── Matriz de decisão ── */}
      <TabsContent value="matriz" className="pt-4 space-y-5">
        {matriz.linhas.length === 0 ? (
          <p className="text-sm text-muted-foreground">Inclua ao menos um indicador na configuração abaixo.</p>
        ) : (
          <>
            <Tabela>
              {matriz.linhas.map((l) => (
                <Linha
                  key={l.def.codigo}
                  rotulo={
                    <span>
                      {l.def.nome}
                      <span className="block text-[10px] font-normal text-muted-foreground">
                        {config[l.def.codigo].sentido === 'maior' ? 'maior é melhor' : 'menor é melhor'} · peso {fmtNum(l.peso)}
                      </span>
                    </span>
                  }
                  celulas={l.ranks.map((r, j) => (
                    <div>
                      <span className={`font-semibold ${r === 1 ? 'text-emerald-700' : ''}`}>{r}º</span>
                      <span className="block text-[10px] text-muted-foreground">{formatar(l.valores[j], l.def.formato)}</span>
                    </div>
                  ))}
                />
              ))}
              <tr className="bg-slate-50 border-t-2">
                <td className="px-3 py-2 font-semibold sticky left-0 bg-slate-50">
                  Pontuação ponderada
                  <span className="block text-[10px] font-normal text-muted-foreground">média das posições pelos pesos (menor é melhor)</span>
                </td>
                {matriz.pontuacao.map((p, j) => (
                  <td key={j} className="px-3 py-2 font-semibold">
                    {fmtNum(p)}
                  </td>
                ))}
              </tr>
              <tr className="bg-slate-50">
                <td className="px-3 py-2 font-semibold sticky left-0 bg-slate-50">Classificação final</td>
                {matriz.classificacao.map((c, j) => (
                  <td key={j} className="px-3 py-2">
                    <span className={`inline-flex items-center gap-1 font-bold ${c === 1 ? 'text-emerald-700' : ''}`}>
                      {c === 1 && <Trophy className="w-4 h-4" />}
                      {c}º
                    </span>
                  </td>
                ))}
              </tr>
            </Tabela>
            <p className="text-xs text-muted-foreground">
              Cada célula mostra a posição da simulação no indicador (1º = melhor) e o valor. Empates dividem a posição;
              simulações sem valor ficam na última posição. A classificação final ordena a média das posições ponderada
              pelos pesos.
            </p>
          </>
        )}

        <div className="border rounded-lg p-4 space-y-3">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-2">
            <div>
              <h4 className="text-sm font-semibold text-primary">Configuração da matriz</h4>
              <p className="text-xs text-muted-foreground">
                Configuração geral: vale para todos os usuários do SSD. Defina quais indicadores entram, o sentido de cada
                um e o peso na pontuação.
              </p>
            </div>
            <Button size="sm" onClick={salvarConfig} disabled={salvando || !configAlterada}>
              {salvando ? 'Salvando…' : configAlterada ? 'Salvar configuração' : 'Configuração salva'}
            </Button>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead className="bg-slate-100">
                <tr>
                  <th className="px-3 py-2 text-center w-16">Incluir</th>
                  <th className="px-3 py-2 text-left">Indicador</th>
                  <th className="px-3 py-2 text-left w-48">Sentido</th>
                  <th className="px-3 py-2 text-left w-28">Peso</th>
                </tr>
              </thead>
              <tbody className="divide-y">
                {INDICADORES.filter((d) => d.naMatriz && config[d.codigo]).map((d) => {
                  const c = config[d.codigo]
                  return (
                    <tr key={d.codigo}>
                      <td className="px-3 py-1.5 text-center">
                        <Checkbox checked={c.incluir} onCheckedChange={(v) => setItem(d.codigo, { incluir: !!v })} />
                      </td>
                      <td className="px-3 py-1.5">{d.nome}</td>
                      <td className="px-3 py-1.5">
                        <select
                          className="border rounded px-2 py-1 text-xs bg-white"
                          value={c.sentido}
                          onChange={(e) => setItem(d.codigo, { sentido: e.target.value as 'maior' | 'menor' })}
                        >
                          <option value="maior">Maior é melhor</option>
                          <option value="menor">Menor é melhor</option>
                        </select>
                      </td>
                      <td className="px-3 py-1.5">
                        <Input
                          type="number"
                          min={0}
                          step={0.5}
                          className="h-7 text-xs w-20"
                          value={c.peso}
                          onChange={(e) => setItem(d.codigo, { peso: Math.max(0, Number(e.target.value) || 0) })}
                        />
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        </div>
      </TabsContent>

      {/* ── Evolução do índice ── */}
      <TabsContent value="indice" className="pt-4">
        <div className="h-[380px] w-full border rounded-lg p-3">
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={serieIndice} margin={{ top: 8, right: 24, left: 8, bottom: 4 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
              <XAxis dataKey="tempo" tick={{ fontSize: 11 }} interval="preserveStartEnd" />
              <YAxis domain={[0, 1]} tick={{ fontSize: 11 }} label={{ value: 'Índice', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }} />
              <Tooltip formatter={(v: number) => v?.toLocaleString('pt-BR', { maximumFractionDigits: 3 })} />
              <Legend wrapperStyle={{ fontSize: 12 }} />
              {simulacoes.map((s, i) => (
                <Line
                  key={s.id_simulacao}
                  type="monotone"
                  dataKey={`s${s.id_simulacao}`}
                  name={s.titulo}
                  stroke={CORES[i % CORES.length]}
                  strokeWidth={2}
                  dot={false}
                  connectNulls
                />
              ))}
            </LineChart>
          </ResponsiveContainer>
        </div>
      </TabsContent>
    </Tabs>
  )
}
