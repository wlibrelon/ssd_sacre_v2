import { useState, useEffect } from 'react'

export type CSVRow = {
  Tempo: string
  Fonte: string
  Vazao_Captada: number
  Demanda: number
  CAPEX: number
  OPEX: number
  Aceitacao_Social: number
}

const generateMockCsvData = (): CSVRow[] => {
  const data: CSVRow[] = []
  const fontes = ['Batalha', 'Bauru', 'Guarani']
  for (let y = 2024; y <= 2026; y++) {
    for (let m = 1; m <= 12; m++) {
      const time = `${y}-${m.toString().padStart(2, '0')}`
      fontes.forEach((f) => {
        data.push({
          Tempo: time,
          Fonte: f,
          Vazao_Captada: Math.round(100 + Math.random() * 50),
          Demanda: Math.round(250 + Math.random() * 40),
          CAPEX: Math.round(10000 + Math.random() * 5000),
          OPEX: Math.round(2000 + Math.random() * 1000),
          Aceitacao_Social: Math.round(50 + Math.random() * 50),
        })
      })
    }
  }
  return data
}

let globalCsvData: CSVRow[] = generateMockCsvData()
let globalTaxaRetorno = 1.5
const listeners = new Set<() => void>()

export default function useSimulationStore() {
  const [state, setState] = useState({ csvData: globalCsvData, taxaRetorno: globalTaxaRetorno })

  useEffect(() => {
    const update = () => setState({ csvData: globalCsvData, taxaRetorno: globalTaxaRetorno })
    listeners.add(update)
    return () => {
      listeners.delete(update)
    }
  }, [])

  return {
    ...state,
    setCsvData: (data: CSVRow[]) => {
      globalCsvData = data
      listeners.forEach((l) => l())
    },
    setTaxaRetorno: (val: number) => {
      globalTaxaRetorno = val
      listeners.forEach((l) => l())
    },
  }
}
