import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'

type Cenario = {
  id: number
  nome: string
  fatores: string[]
}

type Simulacao = {
  id: number
  fonte: string
  cenario: string
  acao: string
  estrategia: string
}

const App: React.FC = () => {
  const [selectedFonte, setSelectedFonte] = useState<string>('')
  const [newFator, setNewFator] = useState<string>('')
  const [newCenario, setNewCenario] = useState<string>('')
  const [cenarios, setCenarios] = useState<Cenario[]>([])
  const [selectedAcao, setSelectedAcao] = useState<string>('')
  const [estrategias, setEstrategias] = useState<string[]>([])
  const [simulacao, setSimulacao] = useState<Simulacao[]>([])
  const [isFirstGravar, setIsFirstGravar] = useState<boolean>(true)

  const fontes = ['Batalha', 'Bauru', 'Guarani']
  const fatores = ['Clima', 'Uso da Terra', 'Solo', 'Água', 'Vegetação', 'População']
  const cenariosOptions = cenarios.map((c) => c.nome)
  const acoes = ['Ação 1', 'Ação 2', 'Ação 3', 'Ação 4', 'Ação 5', 'Ação 6', 'Ação 7']

  const addCenario = () => {
    if (newCenario.trim()) {
      const newCen: Cenario = {
        id: cenarios.length + 1,
        nome: newCenario,
        fatores: [],
      }
      setCenarios([...cenarios, newCen])
      setNewCenario('')
    }
  }

  const addEstrategia = () => {
    if (selectedAcao && !estrategias.includes(selectedAcao)) {
      setEstrategias([...estrategias, selectedAcao])
    }
  }

  const handleGravarOuAdicionar = () => {
    if (selectedFonte && cenariosOptions.length > 0 && selectedAcao && estrategias.length > 0) {
      const newSim: Simulacao = {
        id: simulacao.length + 1,
        fonte: selectedFonte,
        cenario: cenariosOptions[0], // Assuming first for simplicity
        acao: selectedAcao,
        estrategia: estrategias[0], // Assuming first for simplicity
      }
      setSimulacao([...simulacao, newSim])
      setIsFirstGravar(false)
    }
  }

  const handleDeleteSimulacao = (index: number) => {
    setSimulacao((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div className="p-4">
      <h1>Simulação</h1>
      {/* Form elements */}
      <div className="mb-4">
        <label>Fonte:</label>
        <select value={selectedFonte} onChange={(e) => setSelectedFonte(e.target.value)}>
          <option value="">Selecione</option>
          {fontes.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>
      <div className="mb-4">
        <label>Novo Cenário:</label>
        <input value={newCenario} onChange={(e) => setNewCenario(e.target.value)} />
        <button onClick={addCenario}>Adicionar Cenário</button>
      </div>
      <div className="mb-4">
        <label>Ação:</label>
        <select value={selectedAcao} onChange={(e) => setSelectedAcao(e.target.value)}>
          <option value="">Selecione</option>
          {acoes.map((a) => (
            <option key={a} value={a}>
              {a}
            </option>
          ))}
        </select>
        <button onClick={addEstrategia}>Adicionar Estratégia</button>
      </div>
      <button onClick={handleGravarOuAdicionar}>{isFirstGravar ? 'Gravar' : 'Adicionar'}</button>
      {/* Simulation table */}
      <table className="border-collapse border border-gray-300 mt-4">
        <thead>
          <tr>
            <th className="border border-gray-300 p-2">ID</th>
            <th className="border border-gray-300 p-2">Fonte</th>
            <th className="border border-gray-300 p-2">Cenário</th>
            <th className="border border-gray-300 p-2">Ação</th>
            <th className="border border-gray-300 p-2">Estratégia</th>
            <th className="border border-gray-300 p-2">Ações</th>
          </tr>
        </thead>
        <tbody>
          {simulacao.map((sim, i) => (
            <tr key={sim.id}>
              <td className="border border-gray-300 p-2">{sim.id}</td>
              <td className="border border-gray-300 p-2">{sim.fonte}</td>
              <td className="border border-gray-300 p-2">{sim.cenario}</td>
              <td className="border border-gray-300 p-2">{sim.acao}</td>
              <td className="border border-gray-300 p-2">{sim.estrategia}</td>
              <td className="border border-gray-300 p-2">
                <button
                  onClick={() => handleDeleteSimulacao(i)}
                  className="cursor-pointer hover:bg-red-100 hover:text-red-600 p-1 rounded"
                  title="Excluir simulação"
                >
                  <Trash2 size={18} />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}

export default App
