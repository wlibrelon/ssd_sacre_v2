import React, { useState } from 'react'

type Cenario = {
  id: number
  nome: string
  descricao: string
  ativo: boolean
}

type Estrategia = {
  id: number
  nome: string
  descricao: string
  custo: number
}

type Simulacao = {
  id: number
  nome: string
  cenarios: Cenario[]
  estrategias: Estrategia[]
}

const App: React.FC = () => {
  const [fonteAgua, setFonteAgua] = useState<string>('')
  const [fatores, setFatores] = useState<string>('')
  const [cenariosOptions, setCenariosOptions] = useState<string[]>([
    'Cenário 1',
    'Cenário 2',
    'Cenário 3',
  ])
  const [acoes, setAcoes] = useState<string>('')
  const [cenarios, setCenarios] = useState<Cenario[]>([])
  const [estrategias, setEstrategias] = useState<Estrategia[]>([])
  const [simulacoes, setSimulacoes] = useState<Simulacao[]>([])
  const [demandaCenario, setDemandaCenario] = useState<string>('Estagnação Populacional')
  const [consumo, setConsumo] = useState<string>('Estável - 215 L/pcd')
  const [perdas, setPerdas] = useState<string>('30%')

  const addCenario = () => {
    const newCenario: Cenario = {
      id: cenarios.length + 1,
      nome: `Cenário ${cenarios.length + 1}`,
      descricao: 'Descrição do cenário',
      ativo: true,
    }
    setCenarios([...cenarios, newCenario])
  }

  const deleteCenario = (id: number) => {
    setCenarios(cenarios.filter((c) => c.id !== id))
  }

  const addEstrategia = () => {
    const newEstrategia: Estrategia = {
      id: estrategias.length + 1,
      nome: `Estratégia ${estrategias.length + 1}`,
      descricao: 'Descrição da estratégia',
      custo: 0,
    }
    setEstrategias([...estrategias, newEstrategia])
  }

  const deleteEstrategia = (id: number) => {
    setEstrategias(estrategias.filter((e) => e.id !== id))
  }

  const handleGravarOuAdicionar = () => {
    const newSimulacao: Simulacao = {
      id: simulacoes.length + 1,
      nome: `Simulação ${simulacoes.length + 1}`,
      cenarios: cenarios,
      estrategias: estrategias,
    }
    setSimulacoes([...simulacoes, newSimulacao])
  }

  const handleDeleteSimulacao = (id: number) => {
    setSimulacoes(simulacoes.filter((s) => s.id !== id))
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Simulador de Recursos Hídricos</h1>

      {/* Fonte de Água */}
      <div className="mb-4 p-4 border rounded shadow">
        <label className="block text-sm font-medium mb-2">Fonte de Água</label>
        <input
          type="text"
          value={fonteAgua}
          onChange={(e) => setFonteAgua(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Digite a fonte de água"
        />
      </div>

      {/* Fatores */}
      <div className="mb-4 p-4 border rounded shadow">
        <label className="block text-sm font-medium mb-2">Fatores</label>
        <textarea
          value={fatores}
          onChange={(e) => setFatores(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Digite os fatores"
        />
      </div>

      {/* Cenários Options */}
      <div className="mb-4 p-4 border rounded shadow">
        <label className="block text-sm font-medium mb-2">Cenários Options</label>
        <select
          value={cenariosOptions[0]}
          onChange={(e) => setCenariosOptions([e.target.value, ...cenariosOptions.slice(1)])}
          className="w-full p-2 border rounded"
        >
          {cenariosOptions.map((option, index) => (
            <option key={index} value={option}>
              {option}
            </option>
          ))}
        </select>
      </div>

      {/* Ações */}
      <div className="mb-4 p-4 border rounded shadow">
        <label className="block text-sm font-medium mb-2">Ações</label>
        <input
          type="text"
          value={acoes}
          onChange={(e) => setAcoes(e.target.value)}
          className="w-full p-2 border rounded"
          placeholder="Digite as ações"
        />
      </div>

      {/* Cenários */}
      <div className="mb-4 p-4 border rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Cenários</h2>
        <button onClick={addCenario} className="bg-blue-500 text-white px-4 py-2 rounded mb-2">
          Adicionar Cenário
        </button>
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">ID</th>
              <th className="border border-gray-300 p-2">Nome</th>
              <th className="border border-gray-300 p-2">Descrição</th>
              <th className="border border-gray-300 p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {cenarios.map((cenario) => (
              <tr key={cenario.id}>
                <td className="border border-gray-300 p-2">{cenario.id}</td>
                <td className="border border-gray-300 p-2">{cenario.nome}</td>
                <td className="border border-gray-300 p-2">{cenario.descricao}</td>
                <td className="border border-gray-300 p-2">
                  <button
                    onClick={() => deleteCenario(cenario.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Estratégias */}
      <div className="mb-4 p-4 border rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Estratégias</h2>
        <button onClick={addEstrategia} className="bg-blue-500 text-white px-4 py-2 rounded mb-2">
          Adicionar Estratégia
        </button>
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">ID</th>
              <th className="border border-gray-300 p-2">Nome</th>
              <th className="border border-gray-300 p-2">Descrição</th>
              <th className="border border-gray-300 p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {estrategias.map((estrategia) => (
              <tr key={estrategia.id}>
                <td className="border border-gray-300 p-2">{estrategia.id}</td>
                <td className="border border-gray-300 p-2">{estrategia.nome}</td>
                <td className="border border-gray-300 p-2">{estrategia.descricao}</td>
                <td className="border border-gray-300 p-2">
                  <button
                    onClick={() => deleteEstrategia(estrategia.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Simulações */}
      <div className="mb-4 p-4 border rounded shadow">
        <h2 className="text-lg font-semibold mb-2">Simulações</h2>
        <button
          onClick={handleGravarOuAdicionar}
          className="bg-green-500 text-white px-4 py-2 rounded mb-2"
        >
          Gravar ou Adicionar
        </button>
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">ID</th>
              <th className="border border-gray-300 p-2">Nome</th>
              <th className="border border-gray-300 p-2">Cenários</th>
              <th className="border border-gray-300 p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {simulacoes.map((simulacao) => (
              <tr key={simulacao.id}>
                <td className="border border-gray-300 p-2">{simulacao.id}</td>
                <td className="border border-gray-300 p-2">{simulacao.nome}</td>
                <td className="border border-gray-300 p-2">{simulacao.cenarios.length}</td>
                <td className="border border-gray-300 p-2">
                  <button
                    onClick={() => handleDeleteSimulacao(simulacao.id)}
                    className="bg-red-500 text-white px-2 py-1 rounded"
                  >
                    Deletar
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Nova seção: Configuração de Demanda e Perdas */}
      <div className="mb-4">
        <h2 className="text-lg font-semibold mb-4">Configuração de Demanda e Perdas</h2>
        <div className="grid md:grid-cols-2 gap-4">
          {/* Quadro Demanda de consumo */}
          <div className="p-4 border rounded shadow">
            <h3 className="text-md font-medium mb-2">Demanda de consumo</h3>
            <div className="mb-2">
              <label className="block text-sm font-medium mb-1">Cenários</label>
              <select
                value={demandaCenario}
                onChange={(e) => setDemandaCenario(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="Estagnação Populacional">Estagnação Populacional</option>
                <option value="Crescimento Tendencial">Crescimento Tendencial</option>
                <option value="Crescimento Acelerado">Crescimento Acelerado</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Consumo</label>
              <select
                value={consumo}
                onChange={(e) => setConsumo(e.target.value)}
                className="w-full p-2 border rounded"
              >
                <option value="Crescente - até 250 L/pcd">Crescente - até 250 L/pcd</option>
                <option value="Estável - 215 L/pcd">Estável - 215 L/pcd</option>
                <option value="Decrescente - até 180 L/pcd">Decrescente - até 180 L/pcd</option>
              </select>
            </div>
          </div>

          {/* Quadro Cenários de Perdas */}
          <div className="p-4 border rounded shadow">
            <h3 className="text-md font-medium mb-2">Cenários de Perdas</h3>
            <label className="block text-sm font-medium mb-1">Perdas</label>
            <select
              value={perdas}
              onChange={(e) => setPerdas(e.target.value)}
              className="w-full p-2 border rounded"
            >
              <option value="30%">30%</option>
              <option value="28%">28%</option>
              <option value="26%">26%</option>
              <option value="24%">24%</option>
            </select>
          </div>
        </div>
      </div>
    </div>
  )
}

export default App
