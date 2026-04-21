import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

type Scenario = {
  fonte: string
  cenario: string
  estrategia: string
  display: string
}

type Stats = {
  totalRows: number
  validRows: number
  invalidRows: number
}

const CenariosComponent: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [selectedScenario, setSelectedScenario] = useState<string>('')
  const [stats, setStats] = useState<Stats>({ totalRows: 0, validRows: 0, invalidRows: 0 })
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchCsv = async () => {
      try {
        console.log('Fetching cenarios.csv...')
        const response = await fetch('/cenarios.csv')
        if (!response.ok) {
          throw new Error('Failed to fetch CSV')
        }
        const text = await response.text()
        console.log('CSV text fetched:', text.substring(0, 100))

        // Remove BOM if present
        const cleanedText = text.replace(/^\ufeff/, '')
        console.log('BOM removed')

        // Split into lines
        const lines = cleanedText.split('\n').filter((line) => line.trim() !== '')
        console.log('Lines parsed:', lines.length)

        const parsedScenarios: Scenario[] = []
        let validCount = 0
        let invalidCount = 0

        lines.forEach((line, index) => {
          const parts = line.split(',')
          if (parts.length >= 3) {
            const fonte = parts[0].trim().normalize('NFD')
            const cenario = parts[1].trim().normalize('NFD')
            const estrategia = parts[2].trim().normalize('NFD')
            const display = `${fonte} | ${cenario} | ${estrategia}`
            parsedScenarios.push({ fonte, cenario, estrategia, display })
            validCount++
            console.log(`Valid row ${index}: ${display}`)
          } else {
            invalidCount++
            console.log(`Invalid row ${index}: ${line}`)
          }
        })

        setScenarios(parsedScenarios)
        setStats({ totalRows: lines.length, validRows: validCount, invalidRows: invalidCount })
        console.log('Parsing complete:', stats)
      } catch (err) {
        console.error('Error fetching or parsing CSV:', err)
        setError(err instanceof Error ? err.message : 'Unknown error')
      } finally {
        setLoading(false)
      }
    }

    fetchCsv()
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
        <CardTitle>Cenarios para simulação</CardTitle>
      </CardHeader>
      <CardContent>
        //{' '}
        <div className="mb-4">
          // <p>Total Rows: {stats.totalRows}</p>
          // <p>Valid Rows: {stats.validRows}</p>
          // <p>Invalid Rows: {stats.invalidRows}</p>
          //{' '}
        </div>
        <Select value={selectedScenario} onValueChange={setSelectedScenario}>
          <SelectTrigger>
            <SelectValue placeholder="Select a scenario" />
          </SelectTrigger>
          <SelectContent>
            {scenarios.map((scenario, index) => (
              <SelectItem key={index} value={scenario.display}>
                {scenario.display}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        {selectedScenario && <p>Selected: {selectedScenario}</p>}
      </CardContent>
    </Card>
  )
}

export default CenariosComponent
