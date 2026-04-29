import { useState, useEffect } from 'react'
import { getTable, insertRow, deleteRow } from '@/services/ssd'
import { useSsdData } from '@/hooks/use-ssd-data'
import { NativeSelect } from './NativeSelect'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Trash2 } from 'lucide-react'

export function Grupo2() {
  const { fonte_agua, tipos_cenarios, estrategias } = useSsdData()
  const [cf, setCf] = useState<any[]>([])
  const [ef, setEf] = useState<any[]>([])

  const [f1, setF1] = useState('')
  const [tc, setTc] = useState('')
  const [f2, setF2] = useState('')
  const [e, setE] = useState('')

  const load = async () => {
    setCf(await getTable('cenarios_fonte'))
    setEf(await getTable('estrategias_fonte'))
  }
  useEffect(() => {
    load()
  }, [])

  const getFonteName = (id: number) =>
    fonte_agua.find((x: any) => x.id_fonte === id)?.nome_fonte || id
  const getTcName = (id: number) => tipos_cenarios.find((x: any) => x.id_tc === id)?.descricao || id
  const getEName = (id: number) =>
    estrategias.find((x: any) => x.id_estrategia === id)?.descricao || id

  return (
    <div className="space-y-6">
      <h2 className="text-xl font-bold border-b pb-2">
        Grupo 2: Associações de fonte de água com cenários e estratégias
      </h2>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-white p-4 shadow rounded border space-y-4">
          <h3 className="font-semibold">Cenários por Fonte</h3>
          <div className="flex gap-2">
            <NativeSelect
              options={fonte_agua.map((o: any) => ({ value: o.id_fonte, label: o.nome_fonte }))}
              value={f1}
              onChange={setF1}
              placeholder="Selecione Fonte"
            />
            <NativeSelect
              options={tipos_cenarios.map((o: any) => ({ value: o.id_tc, label: o.descricao }))}
              value={tc}
              onChange={setTc}
              placeholder="Selecione Tipo Cen."
            />
            <Button
              onClick={async () => {
                await insertRow('cenarios_fonte', { id_fonte: f1, id_tc: tc })
                load()
              }}
            >
              Adicionar
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fonte</TableHead>
                <TableHead>Cenário</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cf.map((row) => (
                <TableRow key={row.id_cf}>
                  <TableCell>{getFonteName(row.id_fonte)}</TableCell>
                  <TableCell>{getTcName(row.id_tc)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        await deleteRow('cenarios_fonte', 'id_cf', row.id_cf)
                        load()
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>

        <div className="bg-white p-4 shadow rounded border space-y-4">
          <h3 className="font-semibold">Estratégias por Fonte</h3>
          <div className="flex gap-2">
            <NativeSelect
              options={fonte_agua.map((o: any) => ({ value: o.id_fonte, label: o.nome_fonte }))}
              value={f2}
              onChange={setF2}
              placeholder="Selecione Fonte"
            />
            <NativeSelect
              options={estrategias.map((o: any) => ({
                value: o.id_estrategia,
                label: o.descricao,
              }))}
              value={e}
              onChange={setE}
              placeholder="Selecione Estratégia"
            />
            <Button
              onClick={async () => {
                await insertRow('estrategias_fonte', { id_fonte: f2, id_e: e })
                load()
              }}
            >
              Adicionar
            </Button>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Fonte</TableHead>
                <TableHead>Estratégia</TableHead>
                <TableHead></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {ef.map((row) => (
                <TableRow key={row.id_ef}>
                  <TableCell>{getFonteName(row.id_fonte)}</TableCell>
                  <TableCell>{getEName(row.id_e)}</TableCell>
                  <TableCell>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={async () => {
                        await deleteRow('estrategias_fonte', 'id_ef', row.id_ef)
                        load()
                      }}
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      </div>
    </div>
  )
}
