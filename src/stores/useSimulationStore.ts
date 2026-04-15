import { create } from 'zustand'

interface Simulacao {
  fonte: string
  cenarios: any[]
  estrategia: any[]
}

interface SimulationStore {
  csvData: any[]
  simulacao: Simulacao | null
  setCsvData: (data: any[]) => void
  setSimulacao: (simulacao: Simulacao) => void
}

const useSimulationStore = create<SimulationStore>((set) => ({
  csvData: [],
  simulacao: null,
  setCsvData: (data) => set({ csvData: data }),
  setSimulacao: (simulacao) => set({ simulacao }),
}))

export default useSimulationStore
