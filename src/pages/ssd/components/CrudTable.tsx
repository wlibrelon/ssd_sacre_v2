import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase/client'
import { getTable, insertRow, deleteRow, updateRow } from '@/services/ssd'
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
import { Trash2, Edit2, Save, X } from 'lucide-react'

export function CrudTable({ table, title, cols, pk, filter }: any) {
  const [data, setData] = useState<any[]>([])
  const [form, setForm] = useState<any>({})
  const [editId, setEditId] = useState<any>(null)
  const [editForm, setEditForm] = useState<any>({})

  const load = async () => {
    let q = supabase.from(table).select('*')
    if (filter && filter.val) {
      q = q.eq(filter.col, filter.val)
    }
    const { data: res } = await q
    setData(res || [])
  }

  useEffect(() => {
    load()
  }, [table, filter?.val])

  const handleAdd = async () => {
    const newRow = { ...form }
    if (filter && filter.val) newRow[filter.col] = filter.val
    await insertRow(table, newRow)
    setForm({})
    load()
  }

  const handleDelete = async (id: any) => {
    await deleteRow(table, pk, id)
    load()
  }

  const startEdit = (row: any) => {
    setEditId(row[pk])
    setEditForm(row)
  }

  const cancelEdit = () => {
    setEditId(null)
    setEditForm({})
  }

  const handleUpdate = async () => {
    await updateRow(table, pk, editId, editForm)
    setEditId(null)
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
              <TableHead className="w-24 text-center">Operações</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={row[pk]}>
                {cols.map((c: any) => (
                  <TableCell key={c.key} className="py-2 text-sm">
                    {editId === row[pk] ? (
                      <Input
                        value={editForm[c.key] === null ? '' : editForm[c.key]}
                        onChange={(e) => setEditForm({ ...editForm, [c.key]: e.target.value })}
                        className="h-8"
                      />
                    ) : typeof row[c.key] === 'boolean' ? (
                      row[c.key] ? (
                        'Sim'
                      ) : (
                        'Não'
                      )
                    ) : (
                      row[c.key]
                    )}
                  </TableCell>
                ))}
                <TableCell className="py-2 flex gap-1 justify-center">
                  {editId === row[pk] ? (
                    <>
                      <Button variant="ghost" size="icon" onClick={handleUpdate} title="Salvar">
                        <Save className="w-4 h-4 text-green-600" />
                      </Button>
                      <Button variant="ghost" size="icon" onClick={cancelEdit} title="Cancelar">
                        <X className="w-4 h-4 text-gray-500" />
                      </Button>
                    </>
                  ) : (
                    <>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => startEdit(row)}
                        title="Editar"
                      >
                        <Edit2 className="w-4 h-4 text-blue-500" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={() => handleDelete(row[pk])}
                        title="Excluir"
                      >
                        <Trash2 className="w-4 h-4 text-red-500" />
                      </Button>
                    </>
                  )}
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>
    </div>
  )
}
