import { create } from 'zustand'

interface Simulacao {
  fonte: string
  cenarios: string
  estrategia: string
}

interface SimulationStore {
  csvData: any[]
  simulacao: Simulacao[]
  setCsvData: (data: any[]) => void
  setSimulacao: (data: Simulacao[]) => void
}

const useSimulationStore = create<SimulationStore>((set) => ({
  csvData: [],
  simulacao: [],
  setCsvData: (data) => set({ csvData: data }),
  setSimulacao: (data) => set({ simulacao: data }),
}))

export default useSimulationStore
