import React, { useState, useEffect } from 'react'
import Papa from 'papaparse'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface CsvRow {
  [key: string]: string
}

const CenariosTable: React.FC = () => {
  const [data, setData] = useState<CsvRow[]>([])
  const [columns, setColumns] = useState<string[]>([])

  useEffect(() => {
    fetch('/cenarios.csv')
      .then((response) => response.text())
      .then((csvText) => {
        Papa.parse<CsvRow>(csvText, {
          header: true,
          complete: (results) => {
            let parsedData = results.data
            // Remove empty rows
            parsedData = parsedData.filter((row) =>
              Object.values(row).some((val) => val && val.trim() !== ''),
            )
            setData(parsedData)
            if (parsedData.length > 0) {
              const cols = Object.keys(parsedData[0])
              setColumns(cols)
              console.log('Column names:', cols)
              console.log('Number of records:', parsedData.length)
              console.log('First data:', parsedData[0])
            }
          },
          error: (error) => {
            console.error('Error parsing CSV:', error)
          },
        })
      })
      .catch((error) => {
        console.error('Error fetching CSV:', error)
      })
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cenarios Table</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              {columns.map((col) => (
                <TableHead key={col}>{col}</TableHead>
              ))}
            </TableRow>
          </TableHeader>
          <TableBody>
            {data.map((row, idx) => (
              <TableRow key={idx}>
                {columns.map((col) => (
                  <TableCell key={col}>{row[col]}</TableCell>
                ))}
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default CenariosTable
