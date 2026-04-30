import React, { useState, useEffect } from 'react'
import { createClient } from '@supabase/supabase-js'
import {
  Table,
  TableBody,
  TableCaption,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Button } from '@/components/ui/button'
import { Label } from '@/components/ui/label'
import CenariosDashboard from './CenariosDashboard'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

interface Row {
  id: string
  tempo: string
  id_fonte: string
  volume: number
  demanda: number
  capex: number
  opex: number
  scenario_id?: string
}

interface GroupedRow {
  tempo: string
  volume: number
  demanda: number
  capex: number
  opex: number
}

interface AccumulatorItem {
  volume: number
  demanda: number
  capex: number
  opex: number
  count: number
}

const Cenarios: React.FC = () => {
  const [data, setData] = useState<Row[]>([])
  const [filteredData, setFilteredData] = useState<Row[]>([])
  const [groupedData, setGroupedData] = useState<GroupedRow[]>([])
  const [filters, setFilters] = useState<{ scenario?: string; fonte?: string }>({})
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchData()
  }, [filters])

  const fetchData = async () => {
    setLoading(true)
    try {
      let query = supabase.from('cenarios').select('*').order('tempo', { ascending: true })

      if (filters.scenario) {
        query = query.eq('scenario_id', filters.scenario)
      }
      if (filters.fonte) {
        query = query.eq('id_fonte', filters.fonte)
      }

      const { data: fetchedData, error } = await query
      if (error) throw error
      setData(fetchedData || [])
      setFilteredData(fetchedData || [])
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleSimulate = () => {
    const acc: Record<string, AccumulatorItem> = filteredData.reduce((accu, row) => {
      const key = row.tempo
      if (!accu[key]) {
        accu[key] = { volume: 0, demanda: 0, capex: 0, opex: 0, count: 0 }
      }
      accu[key]!.volume += row.volume
      accu[key]!.demanda += row.demanda
      accu[key]!.capex += row.capex
      accu[key]!.opex += row.opex
      accu[key]!.count += 1
      return accu
    }, {})

    const groupedArray: GroupedRow[] = Object.entries(acc)
      .map(([key, item]) => ({
        tempo: key,
        volume: item.volume,
        demanda: item.demanda / item.count,
        capex: item.capex / item.count,
        opex: item.opex / item.count,
      }))
      .sort((a, b) => a.tempo.localeCompare(b.tempo))

    setGroupedData(groupedArray)
  }

  return (
    <div className="container mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Cenários</h1>

      {/* Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <div>
          <Label htmlFor="scenario">Scenario ID</Label>
          <Input
            id="scenario"
            value={filters.scenario || ''}
            onChange={(e) => setFilters({ ...filters, scenario: e.target.value })}
            placeholder="Enter scenario ID"
          />
        </div>
        <div>
          <Label htmlFor="fonte">Fonte</Label>
          <Input
            id="fonte"
            value={filters.fonte || ''}
            onChange={(e) => setFilters({ ...filters, fonte: e.target.value })}
            placeholder="Enter fonte ID"
          />
        </div>
      </div>

      <Button onClick={handleSimulate} className="mb-8" disabled={loading}>
        Simular Agrupamento
      </Button>

      <section>
        <h2 className="text-2xl font-semibold mb-4">Agrupamento por Tempo</h2>
        <Table>
          <TableCaption>Soma de volume e média de demanda, capex e opex por tempo.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Tempo</TableHead>
              <TableHead>Volume (soma)</TableHead>
              <TableHead>Demanda (média)</TableHead>
              <TableHead>Capex (média)</TableHead>
              <TableHead>Opex (média)</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {groupedData.map((row) => (
              <TableRow key={row.tempo}>
                <TableCell>{row.tempo}</TableCell>
                <TableCell>{row.volume.toFixed(2)}</TableCell>
                <TableCell>{row.demanda.toFixed(2)}</TableCell>
                <TableCell>{row.capex.toFixed(2)}</TableCell>
                <TableCell>{row.opex.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="mt-12">
        <h2 className="text-2xl font-semibold mb-4">Tabela de Conferência (Bruta)</h2>
        <Table>
          <TableCaption>Dados brutos filtrados do Supabase.</TableCaption>
          <TableHeader>
            <TableRow>
              <TableHead>Tempo</TableHead>
              <TableHead>Fonte</TableHead>
              <TableHead>Volume</TableHead>
              <TableHead>Demanda</TableHead>
              <TableHead>Capex</TableHead>
              <TableHead>Opex</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredData.map((row) => (
              <TableRow key={row.id}>
                <TableCell>{row.tempo}</TableCell>
                <TableCell>{row.id_fonte}</TableCell>
                <TableCell>{row.volume.toFixed(2)}</TableCell>
                <TableCell>{row.demanda.toFixed(2)}</TableCell>
                <TableCell>{row.capex.toFixed(2)}</TableCell>
                <TableCell>{row.opex.toFixed(2)}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </section>

      <section className="mt-12">
        <CenariosDashboard />
      </section>

      {loading && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center">
          <p className="text-white text-lg">Carregando...</p>
        </div>
      )}
    </div>
  )
}

export default Cenarios
