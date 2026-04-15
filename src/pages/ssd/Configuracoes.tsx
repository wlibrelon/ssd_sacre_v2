import React, { useState } from 'react'

const Configuracoes: React.FC = () => {
  // Estados para Quadro 1
  const [selectedFonteGlobal, setSelectedFonteGlobal] = useState<string>('')

  // Estados para Quadro 2
  const [selectedFator, setSelectedFator] = useState<string>('')
  const [selectedCenario, setSelectedCenario] = useState<string>('')
  const [cenarioSimulacao, setCenarioSimulacao] = useState<
    Array<{ fonte: string; fator: string; cenario: string }>
  >([])

  // Estados para Quadro 3
  const [selectedAcao, setSelectedAcao] = useState<string>('')
  const [estrategiaSimulacao, setEstrategiaSimulacao] = useState<
    Array<{ id: string; descricao: string }>
  >([])

  // Opções para comboboxes
  const fontes = ['Batalha', 'Bauru', 'Guarani']
  const fatores = ['Clima', 'Uso da Terra', 'Condutividade', 'Captações']
  const cenarios = ['Tendencial', 'Pessimista', 'Conservacionista']
  const acoes = [
    '1-Instalar barraginhas',
    '2-...',
    // Adicione as outras ações até 8-Barramento a montante
    '8-Barramento a montante',
  ]

  // Funções para Quadro 2
  const handleAddCenario = () => {
    if (selectedFonteGlobal && selectedFator && selectedCenario) {
      setCenarioSimulacao([
        ...cenarioSimulacao,
        { fonte: selectedFonteGlobal, fator: selectedFator, cenario: selectedCenario },
      ])
      setSelectedFator('')
      setSelectedCenario('')
    }
  }

  const handleGravarCenario = () => {
    // Lógica para gravar cenario_simulacao
    console.log('Gravando cenários:', cenarioSimulacao)
    setCenarioSimulacao([])
  }

  // Funções para Quadro 3
  const handleAddAcao = () => {
    if (selectedAcao) {
      const [id, descricao] = selectedAcao.split('-')
      setEstrategiaSimulacao([...estrategiaSimulacao, { id, descricao }])
      setSelectedAcao('')
    }
  }

  const handleGravarEstrategia = () => {
    // Lógica para gravar estrategia_simulacao
    console.log('Gravando estratégias:', estrategiaSimulacao)
    setEstrategiaSimulacao([])
  }

  return (
    <div className="grid md:grid-cols-1 gap-4">
      {/* Quadro 1 - Seleção de Fonte de Água */}
      <div className="p-4 border rounded">
        <h2 className="text-lg font-bold mb-2">Seleção de Fonte de Água</h2>
        <label htmlFor="fonte" className="block mb-2">
          Fonte de Água
        </label>
        <select
          id="fonte"
          value={selectedFonteGlobal}
          onChange={(e) => setSelectedFonteGlobal(e.target.value)}
          className="w-full p-2 border rounded"
        >
          <option value="">Selecione</option>
          {fontes.map((fonte) => (
            <option key={fonte} value={fonte}>
              {fonte}
            </option>
          ))}
        </select>
      </div>

      {/* Quadro 2 - Construtor de Cenários para Simulação */}
      <div className="p-4 border rounded">
        <h2 className="text-lg font-bold mb-2">Construtor de Cenários para Simulação</h2>
        <div className="flex gap-4 mb-4">
          <div>
            <label htmlFor="fator" className="block mb-1">
              Fator
            </label>
            <select
              id="fator"
              value={selectedFator}
              onChange={(e) => setSelectedFator(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">Selecione</option>
              {fatores.map((fator) => (
                <option key={fator} value={fator}>
                  {fator}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="cenario" className="block mb-1">
              Cenário
            </label>
            <select
              id="cenario"
              value={selectedCenario}
              onChange={(e) => setSelectedCenario(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">Selecione</option>
              {cenarios.map((cenario) => (
                <option key={cenario} value={cenario}>
                  {cenario}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAddCenario}
            className="self-end px-4 py-2 bg-blue-500 text-white rounded"
          >
            Adicionar
          </button>
        </div>
        <table className="w-full border-collapse border border-gray-300 mb-4">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Fonte</th>
              <th className="border border-gray-300 p-2">Fator</th>
              <th className="border border-gray-300 p-2">Cenário</th>
            </tr>
          </thead>
          <tbody>
            {cenarioSimulacao.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2">{item.fonte}</td>
                <td className="border border-gray-300 p-2">{item.fator}</td>
                <td className="border border-gray-300 p-2">{item.cenario}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button onClick={handleGravarCenario} className="px-4 py-2 bg-green-500 text-white rounded">
          Gravar
        </button>
      </div>

      {/* Quadro 3 - Construtor de Estratégias */}
      <div className="p-4 border rounded">
        <h2 className="text-lg font-bold mb-2">Construtor de Estratégias</h2>
        <div className="flex gap-4 mb-4">
          <div>
            <label htmlFor="acao" className="block mb-1">
              Ações
            </label>
            <select
              id="acao"
              value={selectedAcao}
              onChange={(e) => setSelectedAcao(e.target.value)}
              className="p-2 border rounded"
            >
              <option value="">Selecione</option>
              {acoes.map((acao) => (
                <option key={acao} value={acao}>
                  {acao}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={handleAddAcao}
            className="self-end px-4 py-2 bg-blue-500 text-white rounded"
          >
            Adicionar
          </button>
        </div>
        <table className="w-full border-collapse border border-gray-300 mb-4">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">ID</th>
              <th className="border border-gray-300 p-2">Descrição</th>
            </tr>
          </thead>
          <tbody>
            {estrategiaSimulacao.map((item, index) => (
              <tr key={index}>
                <td className="border border-gray-300 p-2">{item.id}</td>
                <td className="border border-gray-300 p-2">{item.descricao}</td>
              </tr>
            ))}
          </tbody>
        </table>
        <button
          onClick={handleGravarEstrategia}
          className="px-4 py-2 bg-green-500 text-white rounded"
        >
          Gravar
        </button>
      </div>
    </div>
  )
}

export default Configuracoes
