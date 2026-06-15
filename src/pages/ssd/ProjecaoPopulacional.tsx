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
        })
      }
    })

    return result
  }, [data, simObj])

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
              tick={{ fontSize: 11 }}
              tickFormatter={(val) =>
                new Intl.NumberFormat('pt-BR', { notation: 'compact' }).format(val)
              }
            />
            <Tooltip
              formatter={(value: number) => new Intl.NumberFormat('pt-BR').format(value)}
              labelStyle={{ color: '#333', fontWeight: 'bold', marginBottom: '4px' }}
            />
            <Legend wrapperStyle={{ fontSize: 12 }} />
            <Line
              type="monotone"
              dataKey="populacao"
              name="População Projetada"
              stroke="#2563eb"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  )
}
