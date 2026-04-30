import { useState, useEffect } from 'react'
import { getTable, insertRow, deleteRow } from '@/services/ssd'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Trash2 } from 'lucide-react'

export function CrudTable({ table, title, cols, pk }: any) {
  const [data, setData] = useState<any[]>([])
  const [form, setForm] = useState<any>({})

  const load = async () => setData(await getTable(table))

  useEffect(() => {
    load()
  }, [table])

  const handleAdd = async () => {
    await insertRow(table, form)
    setForm({})
    load()
  }

  const handleDelete = async (id: any) => {
    await deleteRow(table, pk, id)
    load()
  }

  return (
    <div className="space-y-4 bg-white p-4 rounded-lg shadow border">
      <h3 className="font-semibold text-lg">{title}</h3>
      <div className="flex flex-col gap-2">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {cols.map((c: any) => (
            <Input
              key={c.key}
              placeholder={c.label}
              value={form[c.key] || ''}
              onChange={(e) => setForm({ ...form, [c.key]: e.target.value })}
            />
          ))}
        </div>
        <Button onClick={handleAdd} className="w-full sm:w-auto">
          Adicionar
        </Button>
      </div>
      <div className="overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              {cols.map((c: any) => (
                <TableHead key={c.key}>{c.label}</TableHead>
              ))}
              <TableHead className="w-16">Operação</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row[pk]}>
                {cols.map((c: any) => (
                  <TableCell key={c.key} className="py-1 text-sm">
                    {row[c.key]}
                  </TableCell>
                ))}
                <TableCell className="py-1">
                  <Button variant="ghost" size="icon" onClick={() => handleDelete(row[pk])}>
                    <Trash2 className="w-4 h-4 text-red-500" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
