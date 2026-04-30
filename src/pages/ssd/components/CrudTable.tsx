import React, { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
  Button,
} from '@/components/ui/table' // Adjust import path as needed for your UI library (e.g., shadcn/ui)

interface User {
  id: number
  name: string
  email: string
}

const CrudTable: React.FC = () => {
  const [data, setData] = useState<User[]>([])
  const [newName, setNewName] = useState('')
  const [newEmail, setNewEmail] = useState('')

  useEffect(() => {
    // Simulate initial data fetch
    setData([
      { id: 1, name: 'John Doe', email: 'john@example.com' },
      { id: 2, name: 'Jane Smith', email: 'jane@example.com' },
    ])
  }, [])

  const cols = ['Name', 'Email']

  const handleAdd = () => {
    if (newName.trim() && newEmail.trim()) {
      const newUser: User = {
        id: Date.now(),
        name: newName,
        email: newEmail,
      }
      setData((prev) => [...prev, newUser])
      setNewName('')
      setNewEmail('')
    }
  }

  const handleDelete = (id: number) => {
    setData((prev) => prev.filter((user) => user.id !== id))
  }

  return (
    <div className="space-y-4">
      {/* Add form */}
      <div className="flex gap-2">
        <input
          type="text"
          placeholder="Name"
          value={newName}
          onChange={(e) => setNewName(e.target.value)}
          className="flex-1 p-2 border rounded-md"
        />
        <input
          type="email"
          placeholder="Email"
          value={newEmail}
          onChange={(e) => setNewEmail(e.target.value)}
          className="flex-1 p-2 border rounded-md"
        />
        <Button onClick={handleAdd}>Add</Button>
      </div>

      <Table>
        <TableHeader>
          <TableRow>
            {cols.map((col) => (
              <TableHead key={col}>{col}</TableHead>
            ))}
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((user) => (
            <TableRow key={user.id}>
              {cols.map((col) => (
                <TableCell key={col} className="py-1">
                  {user[col.toLowerCase() as keyof User] as string}
                </TableCell>
              ))}
              <TableCell className="py-1">
                <Button variant="destructive" size="sm" onClick={() => handleDelete(user.id)}>
                  <Trash2 className="h-4 w-4" />
                </Button>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </div>
  )
}

export default CrudTable
