import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'

interface Scenario {
  Fonte: string
  Cenario: string
  Estrategia: string
}

interface ScenarioLoaderProps {
  scenarios: Scenario[]
}

const ScenarioLoader: React.FC<ScenarioLoaderProps> = ({ scenarios }) => {
  const [selectedScenario, setSelectedScenario] = useState<string>('')

  // Robust parsing function
  const normalizeText = (text: string): string => {
    return text
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '') // Remove accents
      .replace(/[\u200B-\u200D\uFEFF]/g, '') // Remove invisible characters
      .trim()
  }

  // Generate concatenated options
  const options = scenarios.map((scenario, index) => {
    const concatenated = `${normalizeText(scenario.Fonte)} | ${normalizeText(scenario.Cenario)} | ${normalizeText(scenario.Estrategia)}`
    console.log(`Generated option: ${concatenated}`)
    return { value: index.toString(), label: concatenated }
  })

  const handleSelectChange = (value: string) => {
    setSelectedScenario(value)
    console.log(`Selected scenario index: ${value}`)
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Scenario Loader</CardTitle>
      </CardHeader>
      <CardContent>
        <Select onValueChange={handleSelectChange} value={selectedScenario}>
          <SelectTrigger>
            <SelectValue placeholder="Select a scenario" />
          </SelectTrigger>
          <SelectContent>
            {options.map((option) => (
              <SelectItem key={option.value} value={option.value}>
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </CardContent>
    </Card>
  )
}

export default ScenarioLoader
