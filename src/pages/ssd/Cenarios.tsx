import React, { useEffect, useState } from 'react'
import Papa from 'papaparse'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card' // Assuming Shadcn UI is set up

interface CenarioData {
  Fonte: string
  cenario: string
  estrategia: string
}

const CenariosComponent: React.FC = () => {
  const [data, setData] = useState<CenarioData[]>([])
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/cenarios.csv')
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        const csvText = await response.text()
        Papa.parse<CenarioData>(csvText, {
          header: true,
          complete: (results) => {
            console.log('CSV parsed successfully:', results.data)
            setData(results.data)
          },
          error: (error) => {
            console.error('Error parsing CSV:', error)
            setError('Error parsing CSV')
          },
        })
      } catch (err) {
        console.error('Error fetching CSV:', err)
        setError('Error fetching CSV')
      }
    }
    fetchData()
  }, [])

  if (error) {
    return <div>Error: {error}</div>
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Cenarios Data</CardTitle>
      </CardHeader>
      <CardContent>
        <table>
          <thead>
            <tr>
              <th>Fonte</th>
              <th>Cenario</th>
              <th>Estrategia</th>
            </tr>
          </thead>
          <tbody>
            {data.map((row, index) => (
              <tr key={index}>
                <td>{row.Fonte}</td>
                <td>{row.cenario}</td>
                <td>{row.estrategia}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </CardContent>
    </Card>
  )
}

export default CenariosComponent
