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

interface Item {
  id: string
  name: string
}

const CrudTable: React.FC = () => {
  const [items, setItems] = useState<Item[]>([])
  const [newName, setNewName] = useState('')
  const [editingId, setEditingId] = useState<string | null>(null)
  const [editName, setEditName] = useState('')

  useEffect(() => {
    const saved = localStorage.getItem('crud-items')
    if (saved) {
      try {
        setItems(JSON.parse(saved))
      } catch (e) {
        console.error('Failed to load items:', e)
      }
    }
  }, [])

  useEffect(() => {
    localStorage.setItem('crud-items', JSON.stringify(items))
  }, [items])

  const addItem = () => {
    if (!newName.trim()) return
    const id = crypto.randomUUID()
    setItems([{ id, name: newName.trim() }, ...items])
    setNewName('')
  }

  const startEdit = (id: string, name: string) => {
    setEditingId(id)
    setEditName(name)
  }

  const saveEdit = () => {
    if (!editName.trim() || !editingId) return
    setItems(
      items.map((item) => (item.id === editingId ? { ...item, name: editName.trim() } : item)),
    )
    setEditingId(null)
    setEditName('')
  }

  const cancelEdit = () => {
    setEditingId(null)
    setEditName('')
  }

  const deleteItem = (id: string) => {
    if (editingId === id) {
      cancelEdit()
    }
    setItems(items.filter((item) => item.id !== id))
  }

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      saveEdit()
    } else if (e.key === 'Escape') {
      cancelEdit()
    }
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex gap-2 mb-6">
        <Input
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          placeholder="Enter new item name"
          className="flex-1"
          onKeyDown={(e) => e.key === 'Enter' && addItem()}
        />
        <Button onClick={addItem}>Add Item</Button>
      </div>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-[80%]">Name</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {items.length === 0 ? (
            <TableRow>
              <TableCell colSpan={2} className="py-1 text-sm text-center text-muted-foreground">
                No items yet. Add one above.
              </TableCell>
            </TableRow>
          ) : (
            items.map((item) => (
              <TableRow key={item.id}>
                <TableCell className="py-1 text-sm">
                  {editingId === item.id ? (
                    <Input
                      value={editName}
                      onChange={(e) => setEditName(e.target.value)}
                      autoFocus
                      onKeyDown={handleKeyDown}
                      className="h-8"
                    />
                  ) : (
                    item.name
                  )}
                </TableCell>
                <TableCell className="py-1 text-sm">
                  {editingId === item.id ? (
                    <div className="flex gap-1">
                      <Button size="sm" onClick={saveEdit} className="h-8">
                        Save
                      </Button>
                      <Button size="sm" variant="outline" onClick={cancelEdit} className="h-8">
                        Cancel
                      </Button>
                    </div>
                  ) : (
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        onClick={() => startEdit(item.id, item.name)}
                        className="h-8"
                      >
                        Edit
                      </Button>
                      <Button
                        size="sm"
                        variant="destructive"
                        onClick={() => deleteItem(item.id)}
                        className="h-8"
                      >
                        Delete
                      </Button>
                    </div>
                  )}
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}

export default CrudTable
