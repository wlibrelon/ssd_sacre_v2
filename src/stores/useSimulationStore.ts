// import { create } from 'zustand'

// interface Simulacao {
//   fonte: string
//   cenarios: string
//   estrategia: string
// }

// interface SimulationStore {
//   csvData: any[]
//   simulacao: Simulacao[]
//   setCsvData: (data: any[]) => void
//   setSimulacao: (data: Simulacao[]) => void
// }

// const useSimulationStore = create<SimulationStore>((set) => ({
//   csvData: [],
//   simulacao: [],
//   setCsvData: (data) => set({ csvData: data }),
//   setSimulacao: (data) => set({ simulacao: data }),
// }))

// export default useSimulationStore

import { create } from 'zustand'

type DemandaPerdas = { demandaCenario: string; demandaConsumo: string; perdas: string }

interface SimulationStore {
  simulacao: any[]
  setSimulacao: (data: any[]) => void
  demandaPerdasList: DemandaPerdas[] // ← ADICIONAR
  setDemandaPerdas: (data: DemandaPerdas[]) => void // ← ADICIONAR
}

const useSimulationStore = create<SimulationStore>((set) => ({
  simulacao: [],
  setSimulacao: (data) => set({ simulacao: data }),

  // ← ADICIONAR ISTO
  demandaPerdasList: [],
  setDemandaPerdas: (data) => set({ demandaPerdasList: data }),
}))

export default useSimulationStore
