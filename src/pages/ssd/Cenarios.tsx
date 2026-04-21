import React, { useEffect, useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface CenarioData {
  Fonte: string
  Cenario: string
  Estrategia: string
}

const CenariosTable: React.FC = () => {
  const [cenarios, setCenarios] = useState<CenarioData[]>([])
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const loadCenarios = async () => {
      try {
        console.log('Iniciando carregamento do arquivo cenarios.csv')
        const response = await fetch('/cenarios.csv')
        if (!response.ok) {
          throw new Error(`Erro ao carregar o arquivo: ${response.statusText}`)
        }
        const text = await response.text()
        console.log('Arquivo carregado com sucesso, iniciando parsing')
        const parsedData = parseCSV(text)
        const filteredData = parsedData.filter((row) => row.Fonte && row.Cenario && row.Estrategia)
        console.log(`Dados parseados e filtrados: ${filteredData.length} linhas válidas`)
        setCenarios(filteredData)
      } catch (err) {
        console.error('Erro ao carregar ou parsear cenarios.csv:', err)
        setError('Ops! Não foi possível carregar os cenários. Tente novamente mais tarde.')
      } finally {
        setLoading(false)
      }
    }

    loadCenarios()
  }, [])

  const parseCSV = (csvText: string): CenarioData[] => {
    const lines = csvText.trim().split('\n')
    const headers = lines[0].split(',')
    const data: CenarioData[] = []
    for (let i = 1; i < lines.length; i++) {
      const values = lines[i].split(',')
      if (values.length === 3) {
        data.push({
          Fonte: values[0].trim(),
          Cenario: values[1].trim(),
          Estrategia: values[2].trim(),
        })
      }
    }
    return data
  }

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cenários</CardTitle>
        </CardHeader>
        <CardContent>
          <p>Carregando cenários...</p>
        </CardContent>
      </Card>
    )
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Cenários</CardTitle>
        </CardHeader>
        <CardContent>
          <p>{error}</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cenários</CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Fonte</TableHead>
              <TableHead>Cenário</TableHead>
              <TableHead>Estratégia</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cenarios.map((cenario, index) => (
              <TableRow key={index}>
                <TableCell>{cenario.Fonte}</TableCell>
                <TableCell>{cenario.Cenario}</TableCell>
                <TableCell>{cenario.Estrategia}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}

export default CenariosTable
