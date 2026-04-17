import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'
import useSimulationStore from '@/stores/useSimulationStore'

type Cenario = { fonte: string; fator: string; cenario: string }
type Simulacao = { fonte: string; cenarios: string; estrategias: string }

const Configuracoes: React.FC = () => {
  const { setSimulacao: setSim } = useSimulationStore()

  // States originais
  const [selectedFonte, setSelectedFonte] = useState<string>('')
  const [newFator, setNewFator] = useState<string>('')
  const [newCenario, setNewCenario] = useState<string>('')
  const [cenarios, setCenarios] = useState<Cenario[]>([])
  const [selectedAcao, setSelectedAcao] = useState<string>('')
  const [estrategias, setEstrategias] = useState<string[]>([])
  const [simulacao, setSimulacao] = useState<Simulacao[]>([])
  const [isFirstGravar, setIsFirstGravar] = useState<boolean>(true)

  // 3 novos states
  const [demandaCenario, setDemandaCenario] = useState<string>('Estagnação Populacional')
  const [demandaConsumo, setDemandaConsumo] = useState<string>('Estável - 215 L/pcd')
  const [perdas, setPerdas] = useState<string>('30%')

  const fontes = ['Rio Batalha', 'Sistema Aquífero Bauru', 'Sistema Aquífero Guarani']
  const fatores = [
    'Clima',
    'Uso da Terra',
    'Condutividade Hidráulica',
    'Captações a Montante',
    'Transmissividade moderada',
    'Transmissividade alta',
  ]
  const cenariosOptions = ['Tendencial', 'Pessimista', 'Conservacionista']
  const acoes = [
    'Instalar Barraginhas',
    'Uso atual',
    'Expansão de poços',
    'Instalar barramento a montante',
    'Condição atual de captação',
    'Expansão de poços no município',
    'Mais poços na área urbana',
    'Captações a Montante',
    'Campo de poços',
  ]

  const addCenario = () => {
    if (newFator) {
      setCenarios([...cenarios, { fonte: selectedFonte, fator: newFator, cenario: newCenario }])
      setNewFator('')
      setNewCenario('')
    }
  }
  const deleteCenario = (index: number) => {
    setCenarios(cenarios.filter((_, i) => i !== index))
  }
  const addEstrategia = () => {
    if (selectedAcao) {
      setEstrategias([...estrategias, selectedAcao])
      setSelectedAcao('')
    }
  }
  const deleteEstrategia = (index: number) => {
    setEstrategias(estrategias.filter((_, i) => i !== index))
  }
  const handleGravarOuAdicionar = () => {
    const cenariosStr = cenarios.map((c) => `${c.fator} ${c.cenario}`).join(' | ')
    const estrategiasStr = estrategias.join(' | ')
    const novaLinha = { fonte: selectedFonte, cenarios: cenariosStr, estrategias: estrategiasStr }
    const novoArray = [...simulacao, novaLinha]
    setSimulacao(novoArray)
    setSim(novoArray)
    setCenarios([])
    setEstrategias([])
    if (isFirstGravar) {
      setIsFirstGravar(false)
    }
  }
  const handleDeleteSimulacao = (index: number) => {
    const novoArray = simulacao.filter((_, i) => i !== index)
    setSimulacao(novoArray)
    setSim(novoArray)
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* Seção 1: Título da Página */}
      <h1 className="text-3xl font-bold mb-6">Configurações</h1>

      {/* Seção 2: Card Fonte */}
      <div className="bg-white p-4 rounded-lg shadow-md mb-6">
        <label className="block text-sm font-medium mb-2">Fonte de água</label>
        <select
          value={selectedFonte}
          onChange={(e) => setSelectedFonte(e.target.value)}
          className="w-full p-2 border border-gray-300 rounded-md"
        >
          <option value="">Selecione uma fonte</option>
          {fontes.map((fonte) => (
            <option key={fonte} value={fonte}>
              {fonte}
            </option>
          ))}
        </select>
      </div>

      {/* Seção 3: Grid md:grid-cols-2 */}
      <div className="grid md:grid-cols-2 gap-6 mb-6">
        {/* Adicionar Cenário */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Adicionar Cenário</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Fator</label>
            <select
              value={newFator}
              onChange={(e) => setNewFator(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Selecione um fator</option>
              {fatores.map((fator) => (
                <option key={fator} value={fator}>
                  {fator}
                </option>
              ))}
            </select>
          </div>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Cenário</label>
            <select
              value={newCenario}
              onChange={(e) => setNewCenario(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Selecione um cenário</option>
              {cenariosOptions.map((cenario) => (
                <option key={cenario} value={cenario}>
                  {cenario}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={addCenario}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Adicionar Cenário
          </button>
          <table className="w-full mt-4 border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Fonte</th>
                <th className="border border-gray-300 p-2">Fator</th>
                <th className="border border-gray-300 p-2">Cenário</th>
                <th className="border border-gray-300 p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {cenarios.map((cenario, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">{cenario.fonte}</td>
                  <td className="border border-gray-300 p-2">{cenario.fator}</td>
                  <td className="border border-gray-300 p-2">{cenario.cenario}</td>
                  <td className="border border-gray-300 p-2">
                    <button
                      onClick={() => deleteCenario(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Adicionar Estratégia */}
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Adicionar Estratégia</h2>
          <div className="mb-4">
            <label className="block text-sm font-medium mb-2">Ação</label>
            <select
              value={selectedAcao}
              onChange={(e) => setSelectedAcao(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
            >
              <option value="">Selecione uma ação</option>
              {acoes.map((acao) => (
                <option key={acao} value={acao}>
                  {acao}
                </option>
              ))}
            </select>
          </div>
          <button
            onClick={addEstrategia}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Adicionar Estratégia
          </button>
          <table className="w-full mt-4 border-collapse border border-gray-300">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Estratégia</th>
                <th className="border border-gray-300 p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {estrategias.map((estrategia, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">{estrategia}</td>
                  <td className="border border-gray-300 p-2">
                    <button
                      onClick={() => deleteEstrategia(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Seção 4: Single Button */}
      <div className="mb-6">
        <button
          onClick={handleGravarOuAdicionar}
          className="bg-green-500 text-white px-6 py-3 rounded-md hover:bg-green-600"
        >
          {isFirstGravar ? 'Gravar' : 'Adicionar'}
        </button>
      </div>

      {/* Seção 5: Tabela Simulacao */}
      {simulacao.length > 0 && (
        <div className="bg-white p-4 rounded-lg shadow-md">
          <h2 className="text-xl font-semibold mb-4">Simulações</h2>
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
              {simulacao.map((sim, index) => (
                <tr key={index}>
                  <td className="border border-gray-300 p-2">{sim.fonte}</td>
                  <td className="border border-gray-300 p-2">{sim.cenarios}</td>
                  <td className="border border-gray-300 p-2">{sim.estrategias}</td>
                  <td className="border border-gray-300 p-2">
                    <button
                      onClick={() => handleDeleteSimulacao(index)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* Nova seção */}
      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Configuração de Demanda e Perdas</h2>
        <div className="grid md:grid-cols-2 gap-6">
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Demanda de consumo</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Cenários</label>
              <select
                value={demandaCenario}
                onChange={(e) => setDemandaCenario(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="Estagnação Populacional">Estagnação Populacional</option>
                <option value="Crescimento Populacional">Crescimento Populacional</option>
                <option value="Crescimento Acelerado">Crescimento Acelerado</option>
              </select>
            </div>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Consumo</label>
              <select
                value={demandaConsumo}
                onChange={(e) => setDemandaConsumo(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="Crescente - até 250 L/pcd">Crescente - até 250 L/pcd</option>
                <option value="Estável - 215 L/pcd">Estável - 215 L/pcd</option>
                <option value="Decrescente - até 180 L/pcd">Decrescente - até 180 L/pcd</option>
              </select>
            </div>
          </div>
          <div className="bg-white p-4 rounded-lg shadow-md">
            <h3 className="text-lg font-semibold mb-4">Cenários de Perdas</h3>
            <div className="mb-4">
              <label className="block text-sm font-medium mb-2">Perdas</label>
              <select
                value={perdas}
                onChange={(e) => setPerdas(e.target.value)}
                className="w-full p-2 border border-gray-300 rounded-md"
              >
                <option value="30%">30%</option>
                <option value="28%">20%</option>
                <option value="26%">10%</option>
                <option value="24%">10%</option>
              </select>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Configuracoes
