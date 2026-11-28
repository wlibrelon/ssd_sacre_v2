import React, { useMemo } from 'react'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts'
import { Database } from '@/lib/supabase/types'

type CenarioDemanda = Database['public']['Tables']['cenario_demanda']['Row']
type CenarioConsumo = Database['public']['Tables']['cenario_consumo']['Row']
type SimulacaoSsd = Database['public']['Tables']['simulacao_ssd']['Row']

interface ProjecaoPopulacionalProps {
  data: any[]
  simObj: SimulacaoSsd | null
  cenarioDemanda?: CenarioDemanda
  cenarioConsumo?: CenarioConsumo
  nomeCenarioDemanda?: string | null
  nomeCenarioConsumo?: string | null
}

export function ProjecaoPopulacional({
  data,
  simObj,
  cenarioDemanda,
  cenarioConsumo,
  nomeCenarioDemanda,
  nomeCenarioConsumo,
}: ProjecaoPopulacionalProps) {
  const chartData = useMemo(() => {
    const uniqueTempos = new Set<string>()
    const result: any[] = []

    const sortedData = [...data].sort((a, b) => (a.tempo || '').localeCompare(b.tempo || ''))

    sortedData.forEach((row) => {
      if (row.tempo && !uniqueTempos.has(row.tempo)) {
        uniqueTempos.add(row.tempo)
        result.push({
          tempo: row.tempo,
          populacao: row.populacao_calculada || simObj?.pop_inicial || 0,
          // Consumo per capita do cenário de consumo (L/hab./dia) — constante no
          // período no modelo atual; exibido no eixo Y da direita
          consumo: cenarioConsumo?.vol_hab ?? null,
        })
      }
    })

    return result
  }, [data, simObj, cenarioConsumo])

  if (!simObj?.demanda_auto) {
    return null
  }

  return (
    <div className="bg-white p-5 shadow-sm rounded-xl border border-slate-200 mt-6">
      <div className="flex items-center justify-between border-b pb-3 mb-4">
        <h3 className="font-semibold text-primary text-sm uppercase tracking-wider">
          Projeção Populacional
        </h3>
        <div className="text-xs text-slate-500 text-right">
          <div>
            Demanda:{' '}
            <span className="font-semibold text-slate-700">{nomeCenarioDemanda || '-'}</span>
          </div>
          <div>
            Consumo:{' '}
            <span className="font-semibold text-slate-700">{nomeCenarioConsumo || '-'}</span>
          </div>
        </div>
      </div>

      <div className="h-[340px] w-full">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData} margin={{ top: 10, right: 30, left: 20, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis dataKey="tempo" tick={{ fontSize: 11 }} />
            <YAxis
              yAxisId="pop"
              tick={{ fontSize: 11 }}
              tickFormatter={(val) =>
                new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(val)
              }
              label={{ value: 'habitantes', angle: -90, position: 'insideLeft', style: { fontSize: 12 } }}
            />
            <YAxis
              yAxisId="consumo"
              orientation="right"
              tick={{ fontSize: 11 }}
              domain={[0, (max: number) => Math.ceil((max || 1) * 1.2)]}
              label={{ value: 'L/hab./dia', angle: 90, position: 'insideRight', style: { fontSize: 12 } }}
            />
            <Tooltip
              formatter={(value: number, name: string) =>
                name === 'Consumo per capita'
                  ? `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 1 }).format(value)} L/hab./dia`
                  : `${new Intl.NumberFormat('pt-BR', { maximumFractionDigits: 0 }).format(value)} hab.`
              }
              labelStyle={{ color: '#333', fontWeight: 'bold', marginBottom: '4px' }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              yAxisId="pop"
              type="monotone"
              dataKey="populacao"
              name="População Projetada"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
            {cenarioConsumo && (
              <Line
                yAxisId="consumo"
                type="monotone"
                dataKey="consumo"
                name="Consumo per capita"
                stroke="#16a34a"
                strokeWidth={2}
                strokeDasharray="6 3"
                dot={false}
              />
            )}
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
