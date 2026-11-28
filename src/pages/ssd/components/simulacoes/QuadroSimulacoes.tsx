// Quadro "Gravação de simulações" (aba Seleção da Simulação): tabela das
// simulações gravadas pelo usuário, carregamento (clique na linha), marcação
// para comparação, edição de título/descrição, exclusão e janela de gravação.
import { useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { AlertTriangle, Loader2, Pencil, Save, Trash2 } from 'lucide-react'
import { dataHora, type SimulacaoGravada } from './tipos'

export type SimulacaoCarregada = { id_simulacao: number; titulo: string; descricao: string | null; gravado_em: string | null }

export function QuadroSimulacoes({
  simulacoes,
  carregando,
  carregada,
  avisos,
  onCarregar,
  onToggleComparar,
  onEditar,
  onExcluir,
  podeGravar,
  motivoNaoGravar,
  gravadaComo,
  onAbrirGravar,
}: {
  simulacoes: SimulacaoGravada[]
  carregando: boolean
  carregada: SimulacaoCarregada | null
  avisos: Record<number, string[]>
  onCarregar: (s: SimulacaoGravada) => void
  onToggleComparar: (s: SimulacaoGravada, v: boolean) => void
  onEditar: (id: number, titulo: string, descricao: string) => Promise<boolean>
  onExcluir: (s: SimulacaoGravada) => void
  podeGravar: boolean
  motivoNaoGravar: string
  gravadaComo: string | null
  onAbrirGravar: () => void
}) {
  const [editando, setEditando] = useState<SimulacaoGravada | null>(null)
  const avisosCarregada = carregada ? avisos[carregada.id_simulacao] || [] : []
  const nComparar = simulacoes.filter((s) => s.comparar).length

  return (
    <div className="space-y-3 border border-slate-200 rounded-lg p-4">
      <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
        <div>
          <h4 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
            Gravação de simulações
          </h4>
          <p className="text-xs text-muted-foreground mt-1 max-w-3xl">
            Execute a simulação e grave o resultado com um título para compará-lo depois com outras simulações. Clique
            numa simulação para carregar os modelos, os cenários de demanda, consumo e perdas e o período usados nela.
            Marque "Comparar" nas simulações que devem entrar no grupo Comparações entre simulações.
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <Button size="sm" onClick={onAbrirGravar} disabled={!podeGravar} className="gap-2">
            <Save className="w-4 h-4" /> Gravar simulação…
          </Button>
          <span className="text-[11px] text-muted-foreground text-right max-w-[260px]">
            {gravadaComo ? `Execução atual gravada como "${gravadaComo}".` : !podeGravar ? motivoNaoGravar : ''}
          </span>
        </div>
      </div>

      {carregada && (
        <div className="rounded-md border border-primary/30 bg-primary/5 px-3 py-2 text-xs space-y-1">
          <div>
            <span className="font-semibold">Simulação carregada:</span> {carregada.titulo}{' '}
            <span className="text-muted-foreground">(gravada em {dataHora(carregada.gravado_em)})</span>
          </div>
          {avisosCarregada.map((a, i) => (
            <div key={i} className="flex gap-1.5 text-amber-700">
              <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
              {a}
            </div>
          ))}
        </div>
      )}

      <div className="border rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead className="bg-slate-100">
              <tr>
                <th className="px-3 py-2.5 text-center font-semibold text-slate-600 w-20" title="Incluir no grupo Comparações entre simulações">
                  Comparar
                </th>
                <th className="px-3 py-2.5 text-left font-semibold text-slate-600">Título</th>
                <th className="px-3 py-2.5 text-left font-semibold text-slate-600">Descrição</th>
                <th className="px-3 py-2.5 text-center font-semibold text-slate-600">Modelos</th>
                <th className="px-3 py-2.5 text-left font-semibold text-slate-600 whitespace-nowrap">Gravada em</th>
                <th className="px-3 py-2.5 w-20" />
              </tr>
            </thead>
            <tbody className="divide-y">
              {carregando && (
                <tr>
                  <td colSpan={6} className="px-3 py-5 text-center text-muted-foreground">
                    <Loader2 className="inline w-4 h-4 animate-spin mr-2" /> Carregando simulações…
                  </td>
                </tr>
              )}
              {!carregando && simulacoes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-3 py-5 text-center text-muted-foreground">
                    Nenhuma simulação gravada ainda.
                  </td>
                </tr>
              )}
              {simulacoes.map((s) => {
                const av = avisos[s.id_simulacao] || []
                const ativa = carregada?.id_simulacao === s.id_simulacao
                return (
                  <tr
                    key={s.id_simulacao}
                    onClick={() => onCarregar(s)}
                    className={`cursor-pointer hover:bg-slate-50 ${ativa ? 'bg-primary/5' : ''}`}
                    title="Clique para carregar os modelos, cenários e período desta simulação"
                  >
                    <td className="px-3 py-2.5 text-center" onClick={(e) => e.stopPropagation()}>
                      <Checkbox checked={s.comparar} onCheckedChange={(v) => onToggleComparar(s, !!v)} />
                    </td>
                    <td className="px-3 py-2.5 font-medium text-slate-700">
                      <span className="inline-flex items-center gap-1.5">
                        {s.titulo}
                        {av.length > 0 && (
                          <span title={av.join('\n')}>
                            <AlertTriangle className="w-3.5 h-3.5 text-amber-600" />
                          </span>
                        )}
                      </span>
                    </td>
                    <td className="px-3 py-2.5 text-slate-600 max-w-[360px]">
                      <span className="line-clamp-2">{s.descricao || '—'}</span>
                    </td>
                    <td className="px-3 py-2.5 text-center">{s.simulacao_modelos?.length || 0}</td>
                    <td className="px-3 py-2.5 text-slate-500 whitespace-nowrap">{dataHora(s.gravado_em)}</td>
                    <td className="px-3 py-2.5" onClick={(e) => e.stopPropagation()}>
                      <div className="flex justify-end gap-1">
                        <button onClick={() => setEditando(s)} title="Editar título e descrição" className="p-1 rounded hover:bg-amber-100 text-amber-600">
                          <Pencil className="w-3.5 h-3.5" />
                        </button>
                        <button onClick={() => onExcluir(s)} title="Excluir" className="p-1 rounded hover:bg-red-100 text-red-500">
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
      {nComparar === 1 && (
        <p className="text-xs text-amber-600">Marque ao menos duas simulações em "Comparar" para ver as comparações.</p>
      )}

      {editando && (
        <EditarSimulacaoDialog
          simulacao={editando}
          onFechar={() => setEditando(null)}
          onSalvar={async (t, d) => {
            if (await onEditar(editando.id_simulacao, t, d)) setEditando(null)
          }}
        />
      )}
    </div>
  )
}

function EditarSimulacaoDialog({
  simulacao,
  onFechar,
  onSalvar,
}: {
  simulacao: SimulacaoGravada
  onFechar: () => void
  onSalvar: (titulo: string, descricao: string) => void
}) {
  const [titulo, setTitulo] = useState(simulacao.titulo)
  const [descricao, setDescricao] = useState(simulacao.descricao || '')
  return (
    <Dialog open onOpenChange={(o) => !o && onFechar()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Editar simulação</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1">
            <label className="text-xs font-semibold">Título *</label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Descrição</label>
            <Textarea value={descricao} onChange={(e) => setDescricao(e.target.value)} rows={4} />
          </div>
          <p className="text-xs text-muted-foreground">
            Alterar o título e a descrição não muda os modelos nem os resultados gravados.
          </p>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={onFechar}>
              Cancelar
            </Button>
            <Button onClick={() => onSalvar(titulo, descricao)} disabled={!titulo.trim()}>
              Salvar
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

/** Janela de gravação: título obrigatório, descrição opcional; com uma
 * simulação carregada, permite gravar como nova ou substituí-la. */
export function GravarSimulacaoDialog({
  aberto,
  onFechar,
  carregada,
  resumo,
  onGravar,
}: {
  aberto: boolean
  onFechar: () => void
  carregada: SimulacaoCarregada | null
  resumo: string
  onGravar: (p: { titulo: string; descricao: string; substituirId: number | null }) => Promise<boolean>
}) {
  const [modo, setModo] = useState<'nova' | 'substituir'>('nova')
  const [titulo, setTitulo] = useState('')
  const [descricao, setDescricao] = useState('')
  const [gravando, setGravando] = useState(false)

  useEffect(() => {
    if (!aberto) return
    setModo('nova')
    setTitulo('')
    setDescricao('')
  }, [aberto])

  const escolherModo = (m: 'nova' | 'substituir') => {
    setModo(m)
    if (m === 'substituir' && carregada) {
      setTitulo(carregada.titulo)
      setDescricao(carregada.descricao || '')
    }
  }

  const gravar = async () => {
    if (modo === 'substituir' && carregada) {
      const ok = window.confirm(
        `Os modelos, parâmetros e resultados gravados em ${dataHora(carregada.gravado_em)} na simulação "${carregada.titulo}" serão substituídos pelos desta execução. Continuar?`,
      )
      if (!ok) return
    }
    setGravando(true)
    const ok = await onGravar({
      titulo,
      descricao,
      substituirId: modo === 'substituir' && carregada ? carregada.id_simulacao : null,
    })
    setGravando(false)
    if (ok) onFechar()
  }

  return (
    <Dialog open={aberto} onOpenChange={(o) => !o && onFechar()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>Gravar simulação</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <p className="text-xs text-muted-foreground">{resumo}</p>
          {carregada && (
            <div className="space-y-2 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={modo === 'nova'} onChange={() => escolherModo('nova')} />
                Gravar como nova simulação
              </label>
              <label className="flex items-center gap-2 cursor-pointer">
                <input type="radio" checked={modo === 'substituir'} onChange={() => escolherModo('substituir')} />
                Substituir "{carregada.titulo}"
              </label>
              {modo === 'substituir' && (
                <p className="text-xs text-amber-700 flex gap-1.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                  Os resultados gravados em {dataHora(carregada.gravado_em)} serão substituídos. Use apenas para corrigir
                  uma gravação feita por engano.
                </p>
              )}
            </div>
          )}
          <div className="space-y-1">
            <label className="text-xs font-semibold">Título *</label>
            <Input value={titulo} onChange={(e) => setTitulo(e.target.value)} placeholder="Ex.: Estiagem severa + novos poços" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-semibold">Descrição</label>
            <Textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              rows={4}
              placeholder="O que esta simulação representa (premissas, objetivo, observações)"
            />
          </div>
          <div className="flex justify-end gap-2 pt-2 border-t">
            <Button variant="outline" onClick={onFechar}>
              Cancelar
            </Button>
            <Button onClick={gravar} disabled={gravando || !titulo.trim()}>
              {gravando ? 'Gravando…' : modo === 'substituir' ? 'Substituir simulação' : 'Gravar simulação'}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
