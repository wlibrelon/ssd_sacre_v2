import { create } from 'zustand'

interface Simulacao {
  fonte: string
  cenarios: string
  estrategias: string
}

interface SimulationStore {
  csvData: any[]
  simulacao: Simulacao[]
  setCsvData: (data: any[]) => void
  setSimulacao: (data: Simulacao[]) => void // ✅ CRÍTICO: Essa função PRECISA existir
}

const useSimulationStore = create<SimulationStore>((set) => ({
  csvData: [],
  simulacao: [],
  setCsvData: (data) => set({ csvData: data }),
  setSimulacao: (data) => set({ simulacao: data }), // ✅ CRÍTICO
}))

export default useSimulationStore
