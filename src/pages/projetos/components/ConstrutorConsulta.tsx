import { useState, useEffect, useMemo } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Checkbox } from '@/components/ui/checkbox'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts'
import { Loader2, Play, Download, Plus, X, Save, FolderOpen, Trash2 } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { ROTULOS_AGREGACAO, type Agregacao } from '@/lib/resultados/dicionario'
import {
  executarConsulta,
  CHAVE_CONTAGEM,
  type ConfigConsulta,
  type FiltroConsulta,
  type OperadorFiltro,
} from '@/lib/resultados/consulta'

const CORES_BARRAS = ['#2563eb', '#16a34a', '#dc2626', '#d97706', '#7c3aed', '#0891b2']

const ROTULOS_OPERADOR: Record<OperadorFiltro, string> = {
  igual: 'é igual a',
  diferente: 'é diferente de',
  contem: 'contém',
  maior: 'é maior que',
  menor: 'é menor que',
  entre: 'está entre',
}

interface ConstrutorConsultaProps {
  idTabela: string
}

export function ConstrutorConsulta({ idTabela }: ConstrutorConsultaProps) {
  const { toast } = useToast()

  const [carregando, setCarregando] = useState(true)
  const [colunas, setColunas] = useState<any[]>([])
  const [linhas, setLinhas] = useState<Record<string, any>[]>([])

  const [metricas, setMetricas] = useState<string[]>([])
  const [agregacao, setAgregacao] = useState<Agregacao>('contagem')
  const [agruparPor, setAgruparPor] = useState<string[]>([])
  const [filtros, setFiltros] = useState<FiltroConsulta[]>([])
  const [resultado, setResultado] = useState<ReturnType<typeof executarConsulta> | null>(null)
  // campos efetivamente usados para gerar `resultado` — snapshot tirado no
  // momento do "Gerar"/aplicar visão, para não desalinhar com os checkboxes
  // de "Campos para exibição" caso o usuário mude a seleção depois de gerar
  // (sem isso, r.valores[campoNovo] fica undefined e quebra o render)
  const [resultadoMetricas, setResultadoMetricas] = useState<string[]>([CHAVE_CONTAGEM])

  // ── Visões salvas (mesmo padrão de selecao_cenarios no SSD: tabela própria
  // + id_usuario preenchido via supabase.auth.getUser() no client) ──────────
  const [visoesSalvas, setVisoesSalvas] = useState<any[]>([])
  const [nomeVisaoNova, setNomeVisaoNova] = useState('')
  const [salvandoVisao, setSalvandoVisao] = useState(false)
  const [mostrandoCampoNome, setMostrandoCampoNome] = useState(false)

  const carregarVisoesSalvas = async () => {
    const { data } = await supabase
      .from('resultado_visao_salva')
      .select('*')
      .eq('id_tabela', idTabela)
      .order('criado_em', { ascending: false })
    setVisoesSalvas(data || [])
  }

  useEffect(() => {
    const carregar = async () => {
      setCarregando(true)
      const [{ data: colData }, { data: linhaData }] = await Promise.all([
        supabase.from('resultado_coluna').select('*').eq('id_tabela', idTabela).order('ordem'),
        supabase.from('resultado_linha').select('linha').eq('id_tabela', idTabela).limit(20000),
      ])
      setColunas(colData || [])
      setLinhas((linhaData || []).map((r: any) => r.linha))
      setCarregando(false)
    }
    carregar()
    carregarVisoesSalvas()
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [idTabela])

  const colunasMetrica = useMemo(() => colunas.filter((c) => c.papel === 'metrica'), [colunas])
  const colunasDimensao = useMemo(() => colunas.filter((c) => c.papel === 'dimensao'), [colunas])
  const colunasFiltraveis = useMemo(
    () => colunas.filter((c) => c.papel === 'dimensao' || c.papel === 'metrica'),
    [colunas],
  )

  const agregacoesDisponiveis: Agregacao[] =
    metricas.length === 0
      ? ['contagem']
      : metricas.reduce<Agregacao[] | null>((acc, m) => {
          const permitidas: Agregacao[] =
            colunasMetrica.find((c) => c.nome_original === m)?.agregacoes_permitidas || []
          return acc === null ? permitidas : acc.filter((a) => permitidas.includes(a))
        }, null) ?? []

  // mantém a agregação selecionada válida sempre que os campos escolhidos mudam
  useEffect(() => {
    if (!agregacoesDisponiveis.includes(agregacao)) {
      setAgregacao(agregacoesDisponiveis[0] ?? 'contagem')
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [metricas])

  const toggleAgruparPor = (nome: string) => {
    setAgruparPor((prev) => (prev.includes(nome) ? prev.filter((c) => c !== nome) : [...prev, nome]))
  }

  const toggleMetrica = (nome: string) => {
    setMetricas((prev) => (prev.includes(nome) ? prev.filter((m) => m !== nome) : [...prev, nome]))
  }

  const addFiltro = () => {
    if (colunasFiltraveis.length === 0) return
    setFiltros((prev) => [
      ...prev,
      { coluna: colunasFiltraveis[0].nome_original, operador: 'igual', valor: '' },
    ])
  }

  const updateFiltro = (i: number, patch: Partial<FiltroConsulta>) => {
    setFiltros((prev) => prev.map((f, idx) => (idx === i ? { ...f, ...patch } : f)))
  }

  const removeFiltro = (i: number) => {
    setFiltros((prev) => prev.filter((_, idx) => idx !== i))
  }

  const montarConfig = (): ConfigConsulta => ({
    metricas,
    agregacao,
    agruparPor,
    filtros: filtros.filter((f) => String(f.valor).trim() !== ''),
  })

  const gerar = () => {
    const config = montarConfig()
    setResultado(executarConsulta(linhas, config))
    setResultadoMetricas(config.metricas.length > 0 ? config.metricas : [CHAVE_CONTAGEM])
  }

  const handleSalvarVisao = async () => {
    if (!nomeVisaoNova.trim()) return
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user) {
      toast({ title: 'É preciso estar logado para salvar uma análise', variant: 'destructive' })
      return
    }

    setSalvandoVisao(true)
    const { error } = await supabase.from('resultado_visao_salva').insert({
      id_tabela: idTabela,
      id_usuario: user.id,
      nome: nomeVisaoNova.trim(),
      config: montarConfig() as any,
    })
    setSalvandoVisao(false)

    if (error) {
      toast({ title: 'Erro ao salvar análise', description: error.message, variant: 'destructive' })
      return
    }
    toast({ title: 'Análise salva' })
    setNomeVisaoNova('')
    setMostrandoCampoNome(false)
    carregarVisoesSalvas()
  }

  const handleAplicarVisao = (visao: any) => {
    // compatível com visões salvas no formato antigo (config.metrica: string | null)
    const config = (visao.config || {}) as Partial<ConfigConsulta> & { metrica?: string | null }
    const metricasCarregadas: string[] = config.metricas ?? (config.metrica ? [config.metrica] : [])
    setMetricas(metricasCarregadas)
    setAgregacao((config.agregacao as Agregacao) ?? 'contagem')
    setAgruparPor(config.agruparPor ?? [])
    setFiltros(config.filtros ?? [])
    setResultado(
      executarConsulta(linhas, {
        metricas: metricasCarregadas,
        agregacao: (config.agregacao as Agregacao) ?? 'contagem',
        agruparPor: config.agruparPor ?? [],
        filtros: config.filtros ?? [],
      }),
    )
    setResultadoMetricas(metricasCarregadas.length > 0 ? metricasCarregadas : [CHAVE_CONTAGEM])
  }

  const handleExcluirVisao = async (id: string) => {
    const { error } = await supabase.from('resultado_visao_salva').delete().eq('id', id)
    if (error) {
      toast({ title: 'Erro ao excluir análise', description: error.message, variant: 'destructive' })
      return
    }
    carregarVisoesSalvas()
  }

  const rotulo = (nomeOriginal: string) =>
    colunas.find((c) => c.nome_original === nomeOriginal)?.rotulo_amigavel || nomeOriginal

  const baixarCsv = (cabecalho: string[], linhasCsv: (string | number)[][], nomeArquivo: string) => {
    const csv = [cabecalho, ...linhasCsv].map((l) => l.map((v) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = nomeArquivo
    link.click()
    URL.revokeObjectURL(url)
  }

  const exportarCsv = () => {
    if (!resultado || resultado.length === 0) return
    const cabecalho = [
      ...agruparPor.map(rotulo),
      ...resultadoMetricas.map((m) => (m === CHAVE_CONTAGEM ? 'Contagem' : rotulo(m))),
    ]
    const linhasCsv = resultado.map((r) => [
      ...agruparPor.map((c) => r.grupo[c]),
      ...resultadoMetricas.map((m) => (r.valores[m] ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 4 })),
    ])
    baixarCsv(cabecalho, linhasCsv, 'analise.csv')
  }

  const exportarDadosOriginaisCsv = () => {
    if (colunas.length === 0 || linhas.length === 0) return
    const cabecalho = colunas.map((c) => c.rotulo_amigavel || c.nome_original)
    const linhasCsv = linhas.map((linha) => colunas.map((c) => String(linha[c.nome_original] ?? '')))
    baixarCsv(cabecalho, linhasCsv, 'dados_originais.csv')
  }

  if (carregando) {
    return (
      <div className="flex justify-center py-10">
        <Loader2 className="h-6 w-6 animate-spin text-primary" />
      </div>
    )
  }

  if (colunas.length === 0) {
    return (
      <p className="text-sm text-muted-foreground py-6 text-center">
        Essa tabela ainda não tem colunas configuradas como métrica ou dimensão.
      </p>
    )
  }

  return (
    <div className="space-y-6">
      {/* ── Dados originais: fixo no início da janela, independente do que
          for processado/filtrado abaixo — mantém os dados brutos sempre
          visíveis pra referência durante a análise. ── */}
      <div className="space-y-1.5 border rounded-md p-3 bg-slate-50/50 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <Label className="text-xs uppercase text-slate-500">Dados originais</Label>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground whitespace-nowrap">
              {linhas.length} linha(s){linhas.length > 100 ? ' · exibindo as 100 primeiras' : ''}
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={exportarDadosOriginaisCsv}
              disabled={linhas.length === 0}
            >
              <Download className="w-4 h-4 mr-1" /> Exportar CSV
            </Button>
          </div>
        </div>
        {/* table cru (sem o wrapper div do componente <Table>): esse div
            precisa ser o único contêiner de scroll nos dois eixos, senão a
            barra horizontal fica "presa" no fundo do conteúdo (só visível
            depois de rolar verticalmente até o final). */}
        <div className="border rounded-md overflow-auto min-w-0 max-h-[300px] bg-background">
          <table className="w-full caption-bottom text-sm">
            <TableHeader>
              <TableRow>
                {colunas.map((c) => (
                  <TableHead
                    key={c.nome_original}
                    className="sticky top-0 bg-background whitespace-nowrap"
                  >
                    {c.rotulo_amigavel || c.nome_original}
                  </TableHead>
                ))}
              </TableRow>
            </TableHeader>
            <TableBody>
              {linhas.slice(0, 100).map((linha, i) => (
                <TableRow key={i}>
                  {colunas.map((c) => (
                    <TableCell key={c.nome_original} className="whitespace-nowrap">
                      {String(linha[c.nome_original] ?? '')}
                    </TableCell>
                  ))}
                </TableRow>
              ))}
            </TableBody>
          </table>
        </div>
      </div>

      {/* ── Agregação + Campos para exibição ── */}
      <div className="space-y-4">
        <div className="space-y-1.5 max-w-xs">
          <Label className="text-xs uppercase text-slate-500">Agregação</Label>
          <Select value={agregacao} onValueChange={(v) => setAgregacao(v as Agregacao)}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {agregacoesDisponiveis.map((a) => (
                <SelectItem key={a} value={a}>
                  {ROTULOS_AGREGACAO[a]}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
          <Label className="text-xs uppercase text-slate-500">Campos para exibição</Label>
          <div className="flex flex-col gap-1.5">
            <label className="flex items-center gap-2 text-sm border rounded-md px-2.5 py-1.5 cursor-pointer hover:bg-slate-50 w-fit">
              <Checkbox checked={metricas.length === 0} onCheckedChange={() => setMetricas([])} />
              Contagem de linhas
            </label>
            {colunasMetrica.map((c) => (
              <label
                key={c.nome_original}
                className="flex items-center gap-2 text-sm border rounded-md px-2.5 py-1.5 cursor-pointer hover:bg-slate-50 w-fit"
              >
                <Checkbox
                  checked={metricas.includes(c.nome_original)}
                  onCheckedChange={() => toggleMetrica(c.nome_original)}
                />
                {c.rotulo_amigavel} {c.unidade ? `(${c.unidade})` : ''}
              </label>
            ))}
          </div>
        </div>
      </div>

      {/* ── Agrupar por ── */}
      {colunasDimensao.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs uppercase text-slate-500">Agrupar por</Label>
          <div className="flex flex-wrap gap-3">
            {colunasDimensao.map((c) => (
              <label
                key={c.nome_original}
                className="flex items-center gap-2 text-sm border rounded-md px-2.5 py-1.5 cursor-pointer hover:bg-slate-50"
              >
                <Checkbox
                  checked={agruparPor.includes(c.nome_original)}
                  onCheckedChange={() => toggleAgruparPor(c.nome_original)}
                />
                {c.rotulo_amigavel}
              </label>
            ))}
          </div>
        </div>
      )}

      {/* ── Filtros ── */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <Label className="text-xs uppercase text-slate-500">Filtrar por</Label>
          <Button variant="outline" size="sm" onClick={addFiltro} disabled={colunasFiltraveis.length === 0}>
            <Plus className="w-3.5 h-3.5 mr-1" /> Adicionar filtro
          </Button>
        </div>
        {filtros.map((f, i) => (
          <div key={i} className="flex flex-wrap items-center gap-2">
            <Select value={f.coluna} onValueChange={(v) => updateFiltro(i, { coluna: v })}>
              <SelectTrigger className="w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {colunasFiltraveis.map((c) => (
                  <SelectItem key={c.nome_original} value={c.nome_original}>
                    {c.rotulo_amigavel}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select
              value={f.operador}
              onValueChange={(v) => updateFiltro(i, { operador: v as OperadorFiltro })}
            >
              <SelectTrigger className="w-[150px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {(Object.keys(ROTULOS_OPERADOR) as OperadorFiltro[]).map((op) => (
                  <SelectItem key={op} value={op}>
                    {ROTULOS_OPERADOR[op]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Input
              className="w-[140px]"
              value={f.valor}
              onChange={(e) => updateFiltro(i, { valor: e.target.value })}
              placeholder="valor"
            />
            {f.operador === 'entre' && (
              <>
                <span className="text-xs text-slate-400">e</span>
                <Input
                  className="w-[140px]"
                  value={f.valorFim ?? ''}
                  onChange={(e) => updateFiltro(i, { valorFim: e.target.value })}
                  placeholder="valor final"
                />
              </>
            )}
            <Button variant="ghost" size="icon" onClick={() => removeFiltro(i)}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        ))}
      </div>

      {/* ── Visões salvas ── */}
      {visoesSalvas.length > 0 && (
        <div className="space-y-1.5">
          <Label className="text-xs uppercase text-slate-500">Análises salvas</Label>
          <div className="flex flex-wrap gap-2">
            {visoesSalvas.map((v) => (
              <div
                key={v.id}
                className="flex items-center gap-1 text-sm border rounded-md pl-2.5 pr-1 py-1 bg-slate-50"
              >
                <button
                  type="button"
                  className="flex items-center gap-1.5 hover:text-primary"
                  onClick={() => handleAplicarVisao(v)}
                >
                  <FolderOpen className="w-3.5 h-3.5" /> {v.nome}
                </button>
                <Button
                  variant="ghost"
                  size="icon"
                  className="h-6 w-6 text-destructive"
                  onClick={() => handleExcluirVisao(v.id)}
                >
                  <Trash2 className="w-3 h-3" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex flex-wrap items-center gap-2">
        <Button onClick={gerar}>
          <Play className="w-4 h-4 mr-2" /> Gerar
        </Button>

        {mostrandoCampoNome ? (
          <>
            <Input
              className="w-[200px]"
              placeholder="Nome da análise"
              value={nomeVisaoNova}
              onChange={(e) => setNomeVisaoNova(e.target.value)}
              autoFocus
            />
            <Button
              variant="outline"
              size="sm"
              disabled={!nomeVisaoNova.trim() || salvandoVisao}
              onClick={handleSalvarVisao}
            >
              {salvandoVisao ? 'Salvando...' : 'Confirmar'}
            </Button>
            <Button variant="ghost" size="sm" onClick={() => setMostrandoCampoNome(false)}>
              Cancelar
            </Button>
          </>
        ) : (
          <Button variant="outline" size="sm" onClick={() => setMostrandoCampoNome(true)}>
            <Save className="w-4 h-4 mr-2" /> Salvar esta consulta
          </Button>
        )}
      </div>

      {/* ── Resultado ── */}
      {resultado && (
        <div className="space-y-4 pt-2 border-t">
          <div className="flex items-center justify-between">
            <p className="text-sm font-medium">Resultado ({resultado.length} {resultado.length === 1 ? 'linha' : 'linhas'})</p>
            <Button variant="ghost" size="sm" onClick={exportarCsv} disabled={resultado.length === 0}>
              <Download className="w-4 h-4 mr-1" /> Exportar CSV
            </Button>
          </div>

          {resultado.length === 0 ? (
            <p className="text-sm text-muted-foreground">Nenhum registro encontrado com esses filtros.</p>
          ) : (
            <>
              {agruparPor.length === 1 && resultado.length > 1 && (
                <div className="h-[280px]">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart
                      data={resultado.map((r) => ({
                        nome: r.chave,
                        ...r.valores,
                      }))}
                    >
                      <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                      <XAxis dataKey="nome" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      {resultadoMetricas.map((m, i) => (
                        <Bar
                          key={m}
                          dataKey={m}
                          name={m === CHAVE_CONTAGEM ? 'Contagem' : rotulo(m)}
                          fill={CORES_BARRAS[i % CORES_BARRAS.length]}
                        />
                      ))}
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              )}

              <div className="border rounded-md overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      {agruparPor.map((c) => (
                        <TableHead key={c}>{rotulo(c)}</TableHead>
                      ))}
                      {resultadoMetricas.map((m) => (
                        <TableHead key={m}>{m === CHAVE_CONTAGEM ? 'Contagem' : rotulo(m)}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultado.map((r) => (
                      <TableRow key={r.chave}>
                        {agruparPor.map((c) => (
                          <TableCell key={c}>{r.grupo[c]}</TableCell>
                        ))}
                        {resultadoMetricas.map((m) => (
                          <TableCell key={m} className="font-medium">
                            {(r.valores[m] ?? 0).toLocaleString('pt-BR', { maximumFractionDigits: 4 })}
                          </TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </>
          )}
        </div>
      )}
    </div>
  )
}
