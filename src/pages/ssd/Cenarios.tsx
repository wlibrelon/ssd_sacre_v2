import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface Cenario {
  fonte: string
  cenario: string
  estrategia: string
}

interface Stats {
  totalRows: number
  validRows: number
  invalidRows: number
}

const CenariosComponent: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Cenario[]>([])
  const [stats, setStats] = useState<Stats>({ totalRows: 0, validRows: 0, invalidRows: 0 })

  useEffect(() => {
    const loadCSV = async () => {
      try {
        const response = await fetch('/cenarios.csv')
        if (!response.ok) {
          throw new Error(`Failed to load CSV: ${response.statusText}`)
        }
        let text = await response.text()
        // Handle BOM if present
        if (text.charCodeAt(0) === 0xfeff) {
          text = text.slice(1)
        }
        // Parse CSV manually
        const lines = text.split(/\r?\n/).filter((line) => line.trim() !== '')
        const parsedData: Cenario[] = []
        let totalRows = lines.length
        let validRows = 0
        let invalidRows = 0
        for (const line of lines) {
          const fields = line.split(',').map((field) => field.trim())
          if (fields.length === 3 && fields.every((field) => field !== '')) {
            parsedData.push({
              fonte: fields[0],
              cenario: fields[1],
              estrategia: fields[2],
            })
            validRows++
          } else {
            invalidRows++
            console.error(`Invalid line: ${line}`)
          }
        }
        setData(parsedData)
        setStats({ totalRows, validRows, invalidRows })
        console.log('CSV loaded successfully:', parsedData)
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : 'Unknown error'
        setError(errorMessage)
        console.error('Error loading CSV:', errorMessage)
      } finally {
        setLoading(false)
      }
    }
    loadCSV()
  }, [])

  if (loading) {
    return <div>Loading...</div>
  }

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cenários - Projeto SACRE</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="mb-4">
          <h3>Stats</h3>
          <p>Total Rows: {stats.totalRows}</p>
          <p>Valid Rows: {stats.validRows}</p>
          <p>Invalid Rows: {stats.invalidRows}</p>
        </div>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fonte</TableHead>
              <TableHead>Cenario</TableHead>
              <TableHead>Estrategia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((item, index) => (
              <TableRow key={index}>
                <TableCell>{item.fonte}</TableCell>
                <TableCell>{item.cenario}</TableCell>
                <TableCell>{item.estrategia}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default CenariosComponent
