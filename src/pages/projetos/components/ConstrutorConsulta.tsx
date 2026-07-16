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
  type ConfigConsulta,
  type FiltroConsulta,
  type OperadorFiltro,
} from '@/lib/resultados/consulta'

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

  const [metrica, setMetrica] = useState<string>('__contagem__')
  const [agregacao, setAgregacao] = useState<Agregacao>('contagem')
  const [agruparPor, setAgruparPor] = useState<string[]>([])
  const [filtros, setFiltros] = useState<FiltroConsulta[]>([])
  const [resultado, setResultado] = useState<ReturnType<typeof executarConsulta> | null>(null)

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
    metrica === '__contagem__'
      ? ['contagem']
      : colunasMetrica.find((c) => c.nome_original === metrica)?.agregacoes_permitidas || []

  const toggleAgruparPor = (nome: string) => {
    setAgruparPor((prev) => (prev.includes(nome) ? prev.filter((c) => c !== nome) : [...prev, nome]))
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
    metrica: metrica === '__contagem__' ? null : metrica,
    agregacao,
    agruparPor,
    filtros: filtros.filter((f) => String(f.valor).trim() !== ''),
  })

  const gerar = () => {
    setResultado(executarConsulta(linhas, montarConfig()))
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
    const config = (visao.config || {}) as Partial<ConfigConsulta>
    setMetrica(config.metrica ?? '__contagem__')
    setAgregacao((config.agregacao as Agregacao) ?? 'contagem')
    setAgruparPor(config.agruparPor ?? [])
    setFiltros(config.filtros ?? [])
    setResultado(
      executarConsulta(linhas, {
        metrica: config.metrica ?? null,
        agregacao: (config.agregacao as Agregacao) ?? 'contagem',
        agruparPor: config.agruparPor ?? [],
        filtros: config.filtros ?? [],
      }),
    )
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

  const exportarCsv = () => {
    if (!resultado || resultado.length === 0) return
    const cabecalho = [...agruparPor.map(rotulo), 'Valor']
    const linhasCsv = resultado.map((r) => [
      ...agruparPor.map((c) => r.grupo[c]),
      r.valor.toLocaleString('pt-BR', { maximumFractionDigits: 4 }),
    ])
    const csv = [cabecalho, ...linhasCsv].map((l) => l.map((v) => `"${v}"`).join(',')).join('\n')
    const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' })
    const url = URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = 'analise.csv'
    link.click()
    URL.revokeObjectURL(url)
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
          <span className="text-xs text-muted-foreground whitespace-nowrap">
            {linhas.length} linha(s){linhas.length > 100 ? ' · exibindo as 100 primeiras' : ''}
          </span>
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

      {/* ── Métrica ── */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="space-y-1.5">
          <Label className="text-xs uppercase text-slate-500">O que quero ver</Label>
          <Select
            value={metrica}
            onValueChange={(v) => {
              setMetrica(v)
              setAgregacao(v === '__contagem__' ? 'contagem' : 'soma')
            }}
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__contagem__">Contagem de linhas</SelectItem>
              {colunasMetrica.map((c) => (
                <SelectItem key={c.nome_original} value={c.nome_original}>
                  {c.rotulo_amigavel} {c.unidade ? `(${c.unidade})` : ''}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-1.5">
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
                    <BarChart data={resultado.map((r) => ({ nome: r.chave, valor: r.valor }))}>
                      <CartesianGrid strokeDasharray="3 3" opacity={0.4} />
                      <XAxis dataKey="nome" tick={{ fontSize: 11 }} />
                      <YAxis tick={{ fontSize: 11 }} />
                      <Tooltip />
                      <Bar dataKey="valor" fill="#2563eb" />
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
                      <TableHead>Valor</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {resultado.map((r) => (
                      <TableRow key={r.chave}>
                        {agruparPor.map((c) => (
                          <TableCell key={c}>{r.grupo[c]}</TableCell>
                        ))}
                        <TableCell className="font-medium">
                          {r.valor.toLocaleString('pt-BR', { maximumFractionDigits: 4 })}
                        </TableCell>
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
