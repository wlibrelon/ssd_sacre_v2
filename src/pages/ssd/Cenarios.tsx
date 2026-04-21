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
  Fonte: string
  Cenario: string
  Estrategia: string
}

interface ParsingStats {
  linesRead: number
  valid: number
  discarded: number
}

const CenariosComponent: React.FC = () => {
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [data, setData] = useState<Cenario[]>([])
  const [stats, setStats] = useState<ParsingStats>({ linesRead: 0, valid: 0, discarded: 0 })

  useEffect(() => {
    const loadCSV = async () => {
      try {
        console.log('Starting to load cenarios.csv')
        const response = await fetch('/cenarios.csv')
        if (!response.ok) {
          throw new Error(`Failed to fetch CSV: ${response.statusText}`)
        }
        const text = await response.text()
        console.log('CSV text loaded, length:', text.length)

        const lines = text
          .split('\n')
          .map((line) => line.trim())
          .filter((line) => line.length > 0)
        console.log('Lines after split and filter:', lines.length)

        const parsedData: Cenario[] = []
        let linesRead = lines.length
        let valid = 0
        let discarded = 0

        // Assume first line is header, skip it
        for (let i = 1; i < lines.length; i++) {
          const fields = lines[i].split(',').map((field) => field.trim())
          if (fields.length === 3 && fields.every((field) => field.length > 0)) {
            parsedData.push({
              Fonte: fields[0],
              Cenario: fields[1],
              Estrategia: fields[2],
            })
            valid++
            console.log(`Parsed valid line ${i}:`, fields)
          } else {
            discarded++
            console.log(`Discarded invalid line ${i}:`, fields)
          }
        }

        setData(parsedData)
        setStats({ linesRead, valid, discarded })
        console.log('Parsing complete. Data:', parsedData)
      } catch (err) {
        console.error('Error loading CSV:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    loadCSV()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cenários - Projeto SACRE</CardTitle>
      </CardHeader>
      <CardContent>
        {loading && <p>Loading...</p>}
        {error && <p>Error: {error}</p>}
        <div>
          <h3>Parsing Statistics</h3>
          <p>Lines Read: {stats.linesRead}</p>
          <p>Valid: {stats.valid}</p>
          <p>Discarded: {stats.discarded}</p>
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
                <TableCell>{item.Fonte}</TableCell>
                <TableCell>{item.Cenario}</TableCell>
                <TableCell>{item.Estrategia}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default CenariosComponent
