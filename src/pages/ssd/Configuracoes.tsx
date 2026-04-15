import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'
import useSimulationStore from '@/stores/useSimulationStore' // ✅ ADICIONADO

type Cenario = {
  fonte: string
  fator: string
  cenario: string
}

type Simulacao = {
  fonte: string
  cenarios: string
  estrategias: string
}

const Configuracoes: React.FC = () => {
  const { setSimulacao: setSim } = useSimulationStore() // ✅ ADICIONADO

  const [selectedFonte, setSelectedFonte] = useState<string>('')
  const [newFator, setNewFator] = useState<string>('')
  const [newCenario, setNewCenario] = useState<string>('')
  const [cenarios, setCenarios] = useState<Cenario[]>([])
  const [selectedAcao, setSelectedAcao] = useState<string>('')
  const [estrategias, setEstrategias] = useState<string[]>([])
  const [simulacao, setSimulacao] = useState<Simulacao[]>([])
  const [isFirstGravar, setIsFirstGravar] = useState<boolean>(true)

  const fontes = ['Batalha', 'Bauru', 'Guarani']
  const fatores = ['Clima', 'Uso da Terra', 'Condutividade Hidráulica', 'Captações a Montante']
  const cenariosOptions = ['Tendencial', 'Pessimista', 'Conservacionista']
  const acoes = [
    'Instalar Barraginhas',
    'Uso atual',
    'Expansão de poços',
    'Instalar barramento a montante',
    'Condição atual de captação',
    'Expansão de poços no município',
    'Mais poços na área urbana',
  ]

  const addCenario = () => {
    if (newFator) {
      setCenarios([...cenarios, { fonte: selectedFonte, fator: newFator, cenario: newCenario }])
      setNewFator('')
      setNewCenario('')
    }
  }

  const addEstrategia = () => {
    if (selectedAcao) {
      setEstrategias([...estrategias, selectedAcao])
      setSelectedAcao('')
    }
  }

  const handleGravarOuAdicionar = () => {
    const cenariosStr = cenarios.map((c) => `${c.fator} ${c.cenario}`).join(' | ')
    const estrategiasStr = estrategias.join(' | ')
    const novaLinha = { fonte: selectedFonte, cenarios: cenariosStr, estrategias: estrategiasStr }

    const novoArray = [...simulacao, novaLinha]
    setSimulacao(novoArray)
    setSim(novoArray) // ✅ ADICIONADO - Persiste no store

    setCenarios([])
    setEstrategias([])
    if (isFirstGravar) {
      setIsFirstGravar(false)
    }
  }

  const handleDeleteSimulacao = (index: number) => {
    const novoArray = simulacao.filter((_, i) => i !== index)
    setSimulacao(novoArray)
    setSim(novoArray) // ✅ ADICIONADO - Persiste no store
  }

  return (
    <div className="p-4">
      {/* Top: Card Fonte */}
      <div className="mb-4 p-4 border rounded shadow">
        <label className="block mb-2">Fonte:</label>
        <select
          value={selectedFonte}
          onChange={(e) => setSelectedFonte(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Selecione</option>
          {fontes.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>

      {/* Middle: Grid with Construtores */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        {/* Quadro 2: Fator and Cenário */}
        <div className="p-4 border rounded shadow">
          <h3 className="mb-2">Adicionar Cenário</h3>
          <label className="block mb-2">Fator:</label>
          <select
            value={newFator}
            onChange={(e) => setNewFator(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          >
            <option value="">Selecione</option>
            {fatores.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <label className="block mb-2">Cenário:</label>
          <select
            value={newCenario}
            onChange={(e) => setNewCenario(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          >
            <option value="">Selecione</option>
            {cenariosOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button onClick={addCenario} className="px-4 py-2 bg-blue-500 text-white rounded">
            Adicionar Cenário
          </button>
          <table className="w-full mt-4 border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Fonte</th>
                <th className="border border-gray-300 p-2">Fator</th>
                <th className="border border-gray-300 p-2">Cenário</th>
              </tr>
            </thead>
            <tbody>
              {cenarios.map((c, i) => (
                <tr key={i}>
                  <td className="border border-gray-300 p-2">{c.fonte}</td>
                  <td className="border border-gray-300 p-2">{c.fator}</td>
                  <td className="border border-gray-300 p-2">{c.cenario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Quadro 3: Ações */}
        <div className="p-4 border rounded shadow">
          <h3 className="mb-2">Adicionar Estratégia</h3>
          <label className="block mb-2">Ação:</label>
          <select
            value={selectedAcao}
            onChange={(e) => setSelectedAcao(e.target.value)}
            className="w-full p-2 border rounded mb-2"
          >
            <option value="">Selecione</option>
            {acoes.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <button onClick={addEstrategia} className="px-4 py-2 bg-blue-500 text-white rounded">
            Adicionar Estratégia
          </button>
          <table className="w-full mt-4 border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Ação</th>
              </tr>
            </thead>
            <tbody>
              {estrategias.map((e, i) => (
                <tr key={i}>
                  <td className="border border-gray-300 p-2">{e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Single Button */}
      <div className="text-center mb-4">
        <button
          onClick={handleGravarOuAdicionar}
          className="px-6 py-3 bg-green-500 text-white rounded"
          disabled={cenarios.length === 0 && estrategias.length === 0}
        >
          {isFirstGravar ? 'Gravar cenários e estratégias' : 'Adicionar'}
        </button>
      </div>

      {/* Tabela Simulacao */}
      {simulacao.length > 0 && (
        <div className="p-4 border rounded shadow">
          <h3 className="mb-2">Simulação</h3>
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Fonte</th>
                <th className="border border-gray-300 p-2">Cenários</th>
                <th className="border border-gray-300 p-2">Estratégias</th>
                <th className="border border-gray-300 p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {simulacao.map((s, i) => (
                <tr key={i}>
                  <td className="border border-gray-300 p-2">{s.fonte}</td>
                  <td className="border border-gray-300 p-2">{s.cenarios}</td>
                  <td className="border border-gray-300 p-2">{s.estrategias}</td>
                  <td className="border border-gray-300 p-2 text-center">
                    <button
                      onClick={() => handleDeleteSimulacao(i)}
                      className="text-red-500 hover:text-red-700 cursor-pointer"
                      title="Excluir"
                    >
                      <Trash2 size={18} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}

export default Configuracoes
