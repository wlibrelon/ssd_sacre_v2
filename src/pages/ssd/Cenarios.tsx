import React, { useState, useEffect } from 'react'
import { Card } from './ui/card'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './ui/select'

interface Scenario {
  fonte: string
  cenario: string
  estrategia: string
  concatenated: string
}

interface CenariosComponentProps {
  // Add any props if needed
}

const CenariosComponent: React.FC<CenariosComponentProps> = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [selectedScenario, setSelectedScenario] = useState<string>('')
  const [loading, setLoading] = useState<boolean>(true)
  const [error, setError] = useState<string | null>(null)
  const [stats, setStats] = useState({ totalRows: 0, validRows: 0, invalidRows: 0 })

  useEffect(() => {
    const loadCSV = async () => {
      try {
        const response = await fetch('/cenarios.csv')
        if (!response.ok) throw new Error('Failed to load CSV')
        let csvText = await response.text()

        // Remove BOM if present
        if (csvText.charCodeAt(0) === 0xfeff) {
          csvText = csvText.slice(1)
        }

        console.log('CSV text after BOM removal:', csvText)

        // Split by lines, handling \r?\n
        const lines = csvText.split(/\r?\n/)
        console.log('Lines:', lines)

        const parsedScenarios: Scenario[] = []
        let totalRows = 0
        let validRows = 0
        let invalidRows = 0

        for (const line of lines) {
          if (line.trim() === '') continue
          totalRows++
          const parts = line.split(',')
          if (parts.length >= 3) {
            let fonte = parts[0].trim()
            let cenario = parts[1].trim()
            let estrategia = parts[2].trim()

            // NFD normalization for accents
            fonte = fonte.normalize('NFD')
            cenario = cenario.normalize('NFD')
            estrategia = estrategia.normalize('NFD')

            const concatenated = `${fonte} | ${cenario} | ${estrategia}`
            parsedScenarios.push({ fonte, cenario, estrategia, concatenated })
            validRows++
            console.log('Valid row:', { fonte, cenario, estrategia, concatenated })
          } else {
            invalidRows++
            console.log('Invalid row:', line)
          }
        }

        setScenarios(parsedScenarios)
        setStats({ totalRows, validRows, invalidRows })
        setLoading(false)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Unknown error')
        setLoading(false)
      }
    }

    loadCSV()
  }, [])

  if (loading) return <div>Loading...</div>
  if (error) return <div>Error: {error}</div>

  return (
    <Card className="p-4">
      <h2>Cenarios</h2>
      <p>
        Total Rows: {stats.totalRows}, Valid: {stats.validRows}, Invalid: {stats.invalidRows}
      </p>
      <Select value={selectedScenario} onValueChange={setSelectedScenario}>
        <SelectTrigger>
          <SelectValue placeholder="Select a scenario" />
        </SelectTrigger>
        <SelectContent>
          {scenarios.map((scenario, index) => (
            <SelectItem key={index} value={scenario.concatenated}>
              {scenario.concatenated}
            </SelectItem>
          ))}
        </SelectContent>
      </Select>
      {selectedScenario && <p>Selected: {selectedScenario}</p>}
    </Card>
  )
}

export default CenariosComponent
