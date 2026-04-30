import React, { useState, useEffect } from 'react'
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
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from '@/components/ui/dialog'

type Column = {
  key: string
  label: string
}

type RowData = Record<string, any>

interface CrudTableProps {
  table: RowData[]
  title: string
  cols: Column[]
  pk: string
}

export function CrudTable({ table: initialTable, title, cols, pk }: CrudTableProps) {
  const [data, setData] = useState<RowData[]>([])
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showEditDialog, setShowEditDialog] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [newRow, setNewRow] = useState<Record<string, string>>({})
  const [editRow, setEditRow] = useState<Record<string, string>>({})

  const getPkValue = (row: RowData): string => String(row[pk] || '')

  useEffect(() => {
    setData(initialTable)
  }, [initialTable])

  const updateNewRowField = (key: string, value: string) => {
    setNewRow((prev) => ({ ...prev, [key]: value }))
  }

  const updateEditRowField = (key: string, value: string) => {
    setEditRow((prev) => ({ ...prev, [key]: value }))
  }

  const openEdit = (row: RowData) => {
    setEditRow({ ...row } as Record<string, string>)
    setEditingId(getPkValue(row))
    setShowEditDialog(true)
  }

  const saveEdit = () => {
    if (!editingId) return
    setData((prev) => prev.map((r) => (getPkValue(r) === editingId ? editRow : r)))
    setShowEditDialog(false)
    setEditingId(null)
    setEditRow({})
  }

  const saveNew = () => {
    setData((prev) => [...prev, newRow])
    setShowAddDialog(false)
    setNewRow({})
  }

  const handleDelete = (row: RowData) => {
    if (confirm(`Are you sure you want to delete this ${title.toLowerCase()}?`)) {
      const id = getPkValue(row)
      setData((prev) => prev.filter((r) => getPkValue(r) !== id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold tracking-tight">{title}</h2>
        <Dialog
          open={showAddDialog}
          onOpenChange={(open) => {
            setShowAddDialog(open)
            if (open) {
              setNewRow({})
            }
          }}
        >
          <DialogTrigger asChild>
            <Button>Add {title}</Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Add New {title}</DialogTitle>
              <DialogDescription>Fill in the details below.</DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              {cols.map((col) => (
                <div key={col.key} className="space-y-1">
                  <Label htmlFor={col.key}>{col.label}</Label>
                  <Input
                    id={col.key}
                    value={newRow[col.key] || ''}
                    onChange={(e) => updateNewRowField(col.key, e.target.value)}
                  />
                </div>
              ))}
            </div>
            <DialogFooter>
              <Button type="button" onClick={saveNew}>
                Save
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              {cols.map((col) => (
                <TableHead key={col.key}>{col.label}</TableHead>
              ))}
              <TableHead>Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row) => (
              <TableRow key={getPkValue(row)}>
                {cols.map((col) => (
                  <TableCell key={col.key} className="py-1">
                    {row[col.key]}
                  </TableCell>
                ))}
                <TableCell className="py-1">
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" onClick={() => openEdit(row)}>
                      Edit
                    </Button>
                    <Button variant="destructive" size="sm" onClick={() => handleDelete(row)}>
                      Delete
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      <Dialog
        open={showEditDialog}
        onOpenChange={(open) => {
          setShowEditDialog(open)
          if (!open) {
            setEditRow({})
            setEditingId(null)
          }
        }}
      >
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Edit {title}</DialogTitle>
            <DialogDescription>Update the details below.</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            {cols.map((col) => (
              <div key={col.key} className="space-y-1">
                <Label htmlFor={col.key}>{col.label}</Label>
                <Input
                  id={col.key}
                  value={editRow[col.key] || ''}
                  onChange={(e) => updateEditRowField(col.key, e.target.value)}
                />
              </div>
            ))}
          </div>
          <DialogFooter>
            <Button type="button" onClick={saveEdit}>
              Save Changes
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}

export default CrudTable
