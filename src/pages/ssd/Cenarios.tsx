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
          <p>Total Rows: {stats.totalRows}</p>
          <p>Valid Rows: {stats.validRows}</p>
          <p>Invalid Rows: {stats.invalidRows}</p>{' '}
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

// import React, { useState, useEffect } from 'react';
// import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card';
// import { Combobox } from '@/components/ui/combobox'; // Assuming a Combobox component
// import { normalizeString } from '@/utils/stringUtils'; // Utility for robust parsing with accentuation

// interface Scenario {
//   id: string;
//   name: string;
// }

// interface CenariosComponentProps {
//   // Add any props if needed
// }

// const CenariosComponent: React.FC<CenariosComponentProps> = () => {
//   const [scenarios, setScenarios] = useState<Scenario[]>([]);
//   const [selectedScenario, setSelectedScenario] = useState<string>('');

//   // Robust parsing function with accentuation handling
//   const parseScenarios = (data: any[]): Scenario[] => {
//     return data.map(item => ({
//       id: item.id,
//       name: normalizeString(item.name), // Normalize for accentuation
//     }));
//   };

//   useEffect(() => {
//     // Fetch or load scenarios
//     const fetchScenarios = async () => {
//       // Example: const response = await fetch('/api/scenarios');
//       // const data = await response.json();
//       // setScenarios(parseScenarios(data));
//       // For demo, using static data
//       const mockData = [
//         { id: '1', name: 'Cenário A' },
//         { id: '2', name: 'Cenário B' },
//         { id: '3', name: 'Cenário C' },
//       ];
//       setScenarios(parseScenarios(mockData));
//     };
//     fetchScenarios();
//   }, []);

//   return (
//     <Card>
//       <CardHeader>
//         <CardTitle>Scenarios</CardTitle>
//       </CardHeader>
//       <CardContent>
//         <Combobox
//           options={scenarios.map(s => ({ value: s.id, label: s.name }))}
//           value={selectedScenario}
//           onChange={(value) => setSelectedScenario(value)}
//           placeholder="Select a scenario"
//         />
//       </CardContent>
//     </Card>
//   );
// };

// export default CenariosComponent;
