import React, { useEffect, useState } from 'react'
import Papa from 'papaparse'
import { Card } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'

interface CenarioData {
  Fonte: string
  cenario: string
  estrategia: string
}

const CenariosTable: React.FC = () => {
  const [data, setData] = useState<CenarioData[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCSV = async () => {
      try {
        console.log('Starting to load cenarios.csv')
        const response = await fetch('/cenarios.csv')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const csvText = await response.text()
        console.log('CSV text loaded:', csvText.substring(0, 100)) // Log first 100 chars for debug
        Papa.parse<CenarioData>(csvText, {
          header: true,
          skipEmptyLines: true,
          complete: (results) => {
            console.log('Parsed data:', results.data)
            // Filter out rows where all fields are empty
            const filteredData = results.data.filter(
              (row) =>
                row.Fonte.trim() !== '' ||
                row.cenario.trim() !== '' ||
                row.estrategia.trim() !== '',
            )
            setData(filteredData)
            console.log('Filtered data set:', filteredData)
          },
          error: (error) => {
            console.error('Error parsing CSV:', error)
            setError('Error parsing CSV')
          },
        })
      } catch (err) {
        console.error('Error loading CSV:', err)
        setError('Error loading CSV')
      }
    }
    loadCSV()
  }, [])

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <Card>
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Fonte</TableHead>
            <TableHead>cenario</TableHead>
            <TableHead>estrategia</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              <TableCell>{row.Fonte}</TableCell>
              <TableCell>{row.cenario}</TableCell>
              <TableCell>{row.estrategia}</TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </Card>
  )
}

export default CenariosTable
