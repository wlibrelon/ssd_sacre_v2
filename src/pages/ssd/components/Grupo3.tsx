import { useState, useEffect } from 'react'
import { getTable, insertRow, deleteRow } from '@/services/ssd'
import { CrudTable } from './CrudTable'
import { useSsdData } from '@/hooks/use-ssd-data'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { NativeSelect } from './NativeSelect'
import { Button } from '@/components/ui/button'
import { Trash2 } from 'lucide-react'

export function Grupo3() {
  const { fonte_agua, tipos_cenarios, cenarios, estrategias, simulacao_ssd } = useSsdData()
  const [activeSim, setActiveSim] = useState('')
  const [cs, setCs] = useState<any[]>([])
  const [form, setForm] = useState<any>({})

  const loadCs = async () => setCs(await getTable('cenario_simulacao'))
  useEffect(() => {
    loadCs()
  }, [])

  const handleAdd = async () => {
    if (!activeSim) return alert('Selecione uma simulação ativa!')
    await insertRow('cenario_simulacao', { ...form, id_s: activeSim })
    loadCs()
  }

  const getF = (id: any) => fonte_agua.find((x: any) => x.id_fonte === id)?.nome_fonte
  const getTc = (id: any) => tipos_cenarios.find((x: any) => x.id_tc === id)?.descricao
  const getC = (id: any) => cenarios.find((x: any) => x.id_cenarios === id)?.cenarios
  const getE = (id: any) => estrategias.find((x: any) => x.id_estrategia === id)?.descricao

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold border-b pb-2">Simulações para SSD</h2>
      <CrudTable
        table="simulacao_ssd"
        title="Simulações"
        pk="id_s"
        cols={[{ key: 'descricao', label: 'Descrição da Simulação' }]}
      />

      <div className="bg-white p-4 shadow rounded border space-y-4">
        <h3 className="font-semibold text-lg">Configuração de cenários para simulação do SSD</h3>
        <NativeSelect
          options={simulacao_ssd.map((s: any) => ({ value: s.id_s, label: s.descricao }))}
          value={activeSim}
          onChange={setActiveSim}
          placeholder="Selecione a Simulação Ativa"
        />

        {activeSim && (
          <>
            <div className="grid grid-cols-1 md:grid-cols-5 gap-2 items-end mt-4">
              <NativeSelect
                options={fonte_agua.map((o: any) => ({ value: o.id_fonte, label: o.nome_fonte }))}
                value={form.id_fonte || ''}
                onChange={(v: any) => setForm({ ...form, id_fonte: v })}
                placeholder="Fonte"
              />
              <NativeSelect
                options={tipos_cenarios.map((o: any) => ({ value: o.id_tc, label: o.descricao }))}
                value={form.id_tc || ''}
                onChange={(v: any) => setForm({ ...form, id_tc: v })}
                placeholder="Tipo"
              />
              <NativeSelect
                options={cenarios.map((o: any) => ({ value: o.id_cenarios, label: o.cenarios }))}
                value={form.id_c || ''}
                onChange={(v: any) => setForm({ ...form, id_c: v })}
                placeholder="Cenário"
              />
              <NativeSelect
                options={estrategias.map((o: any) => ({
                  value: o.id_estrategia,
                  label: o.descricao,
                }))}
                value={form.id_e || ''}
                onChange={(v: any) => setForm({ ...form, id_e: v })}
                placeholder="Estratégia"
              />
              <Button onClick={handleAdd}>Associar</Button>
            </div>

            <Table className="mt-4">
              <TableHeader>
                <TableRow>
                  <TableHead>Fonte</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Cenário</TableHead>
                  <TableHead>Estratégia</TableHead>
                  <TableHead></TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cs
                  .filter((r) => r.id_s.toString() === activeSim.toString())
                  .map((row) => (
                    <TableRow key={row.id_cs}>
                      <TableCell>{getF(row.id_fonte)}</TableCell>
                      <TableCell>{getTc(row.id_tc)}</TableCell>
                      <TableCell>{getC(row.id_c)}</TableCell>
                      <TableCell>{getE(row.id_e)}</TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={async () => {
                            await deleteRow('cenario_simulacao', 'id_cs', row.id_cs)
                            loadCs()
                          }}
                        >
                          <Trash2 className="w-4 h-4 text-red-500" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))}
              </TableBody>
            </Table>
          </>
        )}
      </div>
    </div>
  )
}
