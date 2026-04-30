import { useState } from 'react'
import { useSsdData } from '@/hooks/use-ssd-data'
import { NativeSelect } from './components/NativeSelect'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import { CenariosDashboard } from './components/CenariosDashboard'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

export default function Cenarios() {
  const {
    fonte_agua,
    tipos_cenarios,
    cenarios,
    estrategias,
    cenario_demanda,
    cenario_consumo,
    cenario_perdas,
  } = useSsdData()

  const [filters, setFilters] = useState<any>({})
  const [data, setData] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [ran, setRan] = useState(false)

  const handleSimulate = async () => {
    setLoading(true)
    let q = supabase.from('dados_simulacao').select('*')

    if (filters.id_fonte) q = q.eq('id_fonte', filters.id_fonte)
    if (filters.id_tc) q = q.eq('id_tc', filters.id_tc)
    if (filters.id_c) q = q.eq('id_c', filters.id_c)
    if (filters.id_e) q = q.eq('id_e', filters.id_e)
    if (filters.id_cd) q = q.eq('id_cd', filters.id_cd)
    if (filters.id_cc) q = q.eq('id_cc', filters.id_cc)
    if (filters.id_cp) q = q.eq('id_cp', filters.id_cp)

    // Filtros de tempo (Ano e Mês)
    if (filters.ano_inicio) q = q.gte('tempo', `${filters.ano_inicio}-01`)
    if (filters.ano_fim) q = q.lte('tempo', `${filters.ano_fim}-12`)
    if (filters.mes) q = q.ilike('tempo', `%-${filters.mes.padStart(2, '0')}`)

    const { data: res, error } = await q
    if (error) console.error(error)

    // Processamento de campos calculados conforme solicitado para o Projeto SACRE
    const processedData = (res || []).map((row: any) => {
      const volume_captado = row.volume_captado || 0
      const perdas_percentual = row.perdas || 0 // Assumindo que 'perdas' vem como percentual (ex: 20 para 20%)
      const volume_distribuido = volume_captado * (1 - perdas_percentual / 100)
      const demanda = row.demanda || 0

      return {
        ...row,
        volume_distribuido,
        distribuicao_total: volume_distribuido, // Valor consolidado para exibição
        deficit: demanda - volume_distribuido,
      }
    })

    setData(processedData)
    setRan(true)
    setLoading(false)
  }

  const fontesMap = fonte_agua.reduce(
    (acc: any, f: any) => ({ ...acc, [f.id_fonte]: f.nome_fonte }),
    {},
  )

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Simulação de Cenários</h1>
        <p className="text-muted-foreground">
          Filtre os parâmetros desejados para visualizar o comportamento do sistema de recursos
          hídricos.
        </p>
      </div>

      <div className="bg-white p-6 shadow-md rounded-xl border grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4 animate-fade-in">
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Fonte de Água</label>
          <NativeSelect
            options={fonte_agua.map((o: any) => ({ value: o.id_fonte, label: o.nome_fonte }))}
            value={filters.id_fonte || ''}
            onChange={(v: any) => setFilters({ ...filters, id_fonte: v })}
            placeholder="Todas as Fontes"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Tipo de Cenário</label>
          <NativeSelect
            options={tipos_cenarios.map((o: any) => ({ value: o.id_tc, label: o.descricao }))}
            value={filters.id_tc || ''}
            onChange={(v: any) => setFilters({ ...filters, id_tc: v })}
            placeholder="Todos os Tipos"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Cenário</label>
          <NativeSelect
            options={cenarios.map((o: any) => ({ value: o.id_cenarios, label: o.cenarios }))}
            value={filters.id_c || ''}
            onChange={(v: any) => setFilters({ ...filters, id_c: v })}
            placeholder="Todos os Cenários"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Estratégia</label>
          <NativeSelect
            options={estrategias.map((o: any) => ({ value: o.id_estrategia, label: o.descricao }))}
            value={filters.id_e || ''}
            onChange={(v: any) => setFilters({ ...filters, id_e: v })}
            placeholder="Todas as Estratégias"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Demanda</label>
          <NativeSelect
            options={cenario_demanda.map((o: any) => ({
              value: o.id_cd,
              label: o.nome_cenario_demanda,
            }))}
            value={filters.id_cd || ''}
            onChange={(v: any) => setFilters({ ...filters, id_cd: v })}
            placeholder="Todas as Demandas"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Consumo</label>
          <NativeSelect
            options={cenario_consumo.map((o: any) => ({
              value: o.id_cc,
              label: o.nome_cenario_consumo,
            }))}
            value={filters.id_cc || ''}
            onChange={(v: any) => setFilters({ ...filters, id_cc: v })}
            placeholder="Todos os Consumos"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Perdas</label>
          <NativeSelect
            options={cenario_perdas.map((o: any) => ({
              value: o.id_cp,
              label: o.nome_cenario_perdas,
            }))}
            value={filters.id_cp || ''}
            onChange={(v: any) => setFilters({ ...filters, id_cp: v })}
            placeholder="Todas as Perdas"
          />
        </div>

        {/* Novos Filtros: Período e Mês */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Ano Início</label>
          <NativeSelect
            options={[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => ({
              value: y,
              label: y.toString(),
            }))}
            value={filters.ano_inicio || ''}
            onChange={(v: any) => setFilters({ ...filters, ano_inicio: v })}
            placeholder="Início"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Ano Fim</label>
          <NativeSelect
            options={[2023, 2024, 2025, 2026, 2027, 2028, 2029, 2030].map((y) => ({
              value: y,
              label: y.toString(),
            }))}
            value={filters.ano_fim || ''}
            onChange={(v: any) => setFilters({ ...filters, ano_fim: v })}
            placeholder="Fim"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Mês Específico</label>
          <NativeSelect
            options={Array.from({ length: 12 }, (_, i) => ({
              value: (i + 1).toString(),
              label: (i + 1).toString().padStart(2, '0'),
            }))}
            value={filters.mes || ''}
            onChange={(v: any) => setFilters({ ...filters, mes: v })}
            placeholder="Todos os meses"
          />
        </div>

        <div className="space-y-1 flex items-end">
          <Button onClick={handleSimulate} disabled={loading} className="w-full h-10">
            {loading ? 'Processando...' : 'Executar Simulação'}
          </Button>
        </div>
      </div>

      {ran && data.length === 0 && (
        <div className="text-center p-12 bg-white rounded-lg border border-dashed">
          <p className="text-muted-foreground">
            Nenhum dado de simulação encontrado para estes filtros.
          </p>
        </div>
      )}

      {data.length > 0 && (
        <>
          <CenariosDashboard data={data} fontesMap={fontesMap} />

          <div className="bg-white p-6 shadow-md rounded-xl border mt-6 overflow-hidden">
            <h2 className="text-xl font-bold mb-4">Tabela de Conferência</h2>
            <div className="max-h-96 overflow-y-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Tempo</TableHead>
                    <TableHead>Fonte</TableHead>
                    <TableHead>Volume (m³)</TableHead>
                    <TableHead>Demanda (m³)</TableHead>
                    <TableHead>Vol. Distribuído (m³)</TableHead>
                    <TableHead>Distr. Total (m³)</TableHead>
                    <TableHead>Déficit (m³)</TableHead>
                    <TableHead>CAPEX</TableHead>
                    <TableHead>OPEX</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {data.map((row, idx) => (
                    <TableRow key={idx}>
                      <TableCell>"py-1">{row.tempo}</TableCell>
                      <TableCell>"py-1">{fontesMap[row.id_fonte] || row.id_fonte}</TableCell>
                      <TableCell>"py-1">{row.volume_captado?.toLocaleString()}</TableCell>
                      <TableCell>"py-1">{row.demanda?.toLocaleString()}</TableCell>
                      <TableCell>"py-1">{row.volume_distribuido?.toLocaleString()}</TableCell>
                      <TableCell>"py-1">{row.distribuicao_total?.toLocaleString()}</TableCell>
                      <TableCell
                        className={
                          row.deficit > 0 ? 'text-red-600 font-semibold' : 'text-green-600'
                        }
                      >
                        {row.deficit?.toLocaleString()}
                      </TableCell>
                      <TableCell>{row.capex?.toLocaleString()}</TableCell>
                      <TableCell>{row.opex?.toLocaleString()}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </div>
        </>
      )}
    </div>
  )
}
