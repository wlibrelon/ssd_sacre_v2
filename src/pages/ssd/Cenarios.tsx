import React, { useState, useEffect } from 'react'
import Papa from 'papaparse'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import {
  Table,
  TableHeader,
  TableBody,
  TableRow,
  TableHead,
  TableCell,
} from '@/components/ui/table'

interface CsvRow {
  Fonte: string
  cenario: string
  estrategia: string
}

const CenariosComponent: React.FC = () => {
  const [csvData, setCsvData] = useState<CsvRow[]>([])
  const [csvError, setCsvError] = useState<string>('')

  useEffect(() => {
    const loadCsv = async () => {
      try {
        const response = await fetch('/cenarios.csv')
        if (!response.ok) {
          throw new Error('Erro ao carregar o arquivo CSV')
        }
        const csvText = await response.text()
        Papa.parse<CsvRow>(csvText, {
          header: true,
          complete: (results) => {
            setCsvData(results.data)
          },
          error: (error) => {
            setCsvError('Erro ao processar o CSV: ' + error.message)
          },
        })
      } catch (error) {
        setCsvError('Erro ao carregar o arquivo: ' + (error as Error).message)
      }
    }
    loadCsv()
  }, [])

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cenários para Simulação</CardTitle>
      </CardHeader>
      <CardContent>
        {csvError && <p className="text-red-500">{csvError}</p>}
        <p>Total de registros: {csvData.length}</p>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fonte</TableHead>
              <TableHead>Cenário</TableHead>
              <TableHead>Estratégia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {csvData.map((row, index) => (
              <TableRow key={index}>
                <TableCell>{row.Fonte}</TableCell>
                <TableCell>{row.cenario}</TableCell>
                <TableCell>{row.estrategia}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default CenariosComponent
