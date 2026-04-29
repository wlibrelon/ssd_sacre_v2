import { useState } from 'react'
import { useSsdData } from '@/hooks/use-ssd-data'
import { NativeSelect } from './components/NativeSelect'
import { Button } from '@/components/ui/button'
import { supabase } from '@/lib/supabase/client'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from 'recharts'
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

    if (filters.ano_inicio) q = q.gte('tempo', `${filters.ano_inicio}-01`)
    if (filters.ano_fim) q = q.lte('tempo', `${filters.ano_fim}-12`)
    if (filters.mes) q = q.ilike('tempo', `%-${filters.mes.padStart(2, '0')}`)

    const { data: res, error } = await q
    if (error) console.error(error)

    // Processamento de campos calculados
    const processed = (res || []).map((row) => {
      const vol_captado = row.volume_captado || 0
      const perdas_perc = row.perdas || 0
      const vol_distribuido = vol_captado * (1 - perdas_perc / 100)
      return {
        ...row,
        volume_distribuido: vol_distribuido,
        distribuicao_total: vol_distribuido, // Simplificação para exibição
        deficit: (row.demanda || 0) - vol_distribuido,
      }
    })

    setData(processed)
    setRan(true)
    setLoading(false)
  }

  const fontesMap = fonte_agua.reduce(
    (acc: any, f: any) => ({ ...acc, [f.id_fonte]: f.nome_fonte }),
    {},
  )

  const pieDataMap = data.reduce<Record<string, { name: string; value: number }>>((acc, row) => {
    const fonteId = row.id_fonte?.toString()
    if (fonteId && fontesMap[fonteId]) {
      if (!acc[fonteId]) {
        acc[fonteId] = { name: fontesMap[fonteId], value: 0 }
      }
      acc[fonteId].value += row.volume_distribuido || 0
    }
    return acc
  }, {})

  const pieDataArray = Object.values(pieDataMap)

  const colors = ['#2563eb', '#16a34a', '#dc2626', '#ca8a04', '#7c3aed', '#db2777']

  return (
    <div className="p-6 space-y-6 max-w-7xl mx-auto">
      <div>
        <h1 className="text-3xl font-bold text-primary mb-2">Simulação de Cenários</h1>
        <p className="text-muted-foreground">
          Filtre os parâmetros para visualizar o comportamento do sistema hídrico.
        </p>
      </div>

      <div className="bg-white p-6 shadow-md rounded-xl border grid grid-cols-1 md:grid-cols-3 lg:grid-cols-4 gap-4">
        {/* Filtros Originais */}
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
          <label className="text-xs font-semibold text-muted-foreground">Tipo Cenário</label>
          <NativeSelect
            options={tipos_cenarios.map((o: any) => ({ value: o.id_tc, label: o.nome_tc }))}
            value={filters.id_tc || ''}
            onChange={(v: any) => setFilters({ ...filters, id_tc: v })}
            placeholder="Todos os Tipos"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Cenário</label>
          <NativeSelect
            options={cenarios.map((o: any) => ({ value: o.id_c, label: o.nome_c }))}
            value={filters.id_c || ''}
            onChange={(v: any) => setFilters({ ...filters, id_c: v })}
            placeholder="Todos os Cenários"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Estratégia</label>
          <NativeSelect
            options={estrategias.map((o: any) => ({ value: o.id_e, label: o.nome_e }))}
            value={filters.id_e || ''}
            onChange={(v: any) => setFilters({ ...filters, id_e: v })}
            placeholder="Todas as Estratégias"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Cen. Demanda</label>
          <NativeSelect
            options={cenario_demanda.map((o: any) => ({ value: o.id_cd, label: o.nome_cd }))}
            value={filters.id_cd || ''}
            onChange={(v: any) => setFilters({ ...filters, id_cd: v })}
            placeholder="Todas Demandas"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Cen. Consumo</label>
          <NativeSelect
            options={cenario_consumo.map((o: any) => ({ value: o.id_cc, label: o.nome_cc }))}
            value={filters.id_cc || ''}
            onChange={(v: any) => setFilters({ ...filters, id_cc: v })}
            placeholder="Todos Consumos"
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-semibold text-muted-foreground">Cen. Perdas</label>
          <NativeSelect
            options={cenario_perdas.map((o: any) => ({ value: o.id_cp, label: o.nome_cp }))}
            value={filters.id_cp || ''}
            onChange={(v: any) => setFilters({ ...filters, id_cp: v })}
            placeholder="Todas Perdas"
          />
        </div>

        {/* Filtros Temporais */}
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
          <label className="text-xs font-semibold text-muted-foreground">Mês</label>
          <NativeSelect
            options={Array.from({ length: 12 }, (_, i) => ({
              value: (i + 1).toString(),
              label: (i + 1).toString().padStart(2, '0'),
            }))}
            value={filters.mes || ''}
            onChange={(v: any) => setFilters({ ...filters, mes: v })}
            placeholder="Todos"
          />
        </div>

        <div className="space-y-1 flex items-end">
          <Button onClick={handleSimulate} disabled={loading} className="w-full h-10">
            {loading ? 'Processando...' : 'Executar Simulação'}
          </Button>
        </div>
      </div>

      {data.length > 0 && (
        <div className="space-y-8">
          {/* Gráfico de Volume Captado */}
          <div className="bg-white p-6 shadow-md rounded-xl border h-96">
            <h3 className="font-bold mb-4">Volume Captado por Fonte (m³)</h3>
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={data}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} />
                <XAxis dataKey="tempo" />
                <YAxis />
                <Tooltip />
                <Legend />
                {Array.from(new Set(data.map((d) => d.id_fonte))).map((s: any, idx) => (
                  <Line
                    key={s}
                    type="monotone"
                    dataKey="volume_captado"
                    name={fontesMap[s]}
                    stroke={colors[idx % colors.length]}
                    dot={false}
                    activeDot={{ r: 6 }}
                  />
                ))}
              </LineChart>
            </ResponsiveContainer>
          </div>

          {/* Gráfico de Participação das Fontes */}
          <div className="bg-white p-6 shadow-md rounded-xl border h-96">
            <h3 className="font-bold mb-4">Participação das Fontes</h3>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={pieDataArray}
                  cx="50%"
                  cy="50%"
                  outerRadius={80}
                  dataKey="value"
                  nameKey="name"
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(1)}%`}
                >
                  {pieDataArray.map((entry: any, index: number) => (
                    <Cell key={`cell-${index}`} fill={colors[index % colors.length]} />
                  ))}
                </Pie>
                <Tooltip />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </div>

          {/* Tabela de Conferência com Campos Calculados */}
          <div className="bg-white p-6 shadow-md rounded-xl border">
            <h2 className="text-xl font-bold mb-4">Dados de Conferência</h2>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Tempo</TableHead>
                  <TableHead>Fonte</TableHead>
                  <TableHead>Vol. Captado (m³)</TableHead>
                  <TableHead>Vol. Distribuído (m³)</TableHead>
                  <TableHead>Distr. Total (m³)</TableHead>
                  <TableHead>Déficit (m³)</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {data.map((row, idx) => (
                  <TableRow key={idx}>
                    <TableCell>{row.tempo}</TableCell>
                    <TableCell>{fontesMap[row.id_fonte]}</TableCell>
                    <TableCell>{row.volume_captado?.toLocaleString()}</TableCell>
                    <TableCell>{row.volume_distribuido?.toLocaleString()}</TableCell>
                    <TableCell>{row.distribuicao_total?.toLocaleString()}</TableCell>
                    <TableCell className={row.deficit > 0 ? 'text-red-500' : 'text-green-500'}>
                      {row.deficit?.toLocaleString()}
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </div>
      )}
    </div>
  )
}
