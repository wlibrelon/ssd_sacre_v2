import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'
import useSimulationStore from '@/stores/useSimulationStore'

type Cenario = { fonte: string; fator: string; cenario: string }
type Simulacao = { fonte: string; cenarios: string; estrategias: string }
type DemandaPerdas = { demandaCenario: string; demandaConsumo: string; perdas: string }

const Configuracoes: React.FC = () => {
  //  const { setSimulacao: setSim } = useSimulationStore() // essa linha levava apenas os dados de cenário. embaixo leva tbm as demandas e perdas
  const { setSimulacao: setSim, setDemandaPerdas } = useSimulationStore()

  const [selectedFonte, setSelectedFonte] = useState<string>('')
  const [newFator, setNewFator] = useState<string>('')
  const [newCenario, setNewCenario] = useState<string>('')
  const [cenarios, setCenarios] = useState<Cenario[]>([])
  const [selectedAcao, setSelectedAcao] = useState<string>('')
  const [estrategias, setEstrategias] = useState<string[]>([])
  const [simulacao, setSimulacao] = useState<Simulacao[]>([])
  const [isFirstGravar, setIsFirstGravar] = useState<boolean>(true)

  const [demandaCenario, setDemandaCenario] = useState<string>('Estagnação Populacional')
  const [demandaConsumo, setDemandaConsumo] = useState<string>('Estável - 215 L/pcd')
  const [perdas, setPerdas] = useState<string>('30%')
  const [demandaPerdasList, setDemandaPerdasList] = useState<DemandaPerdas[]>([])

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

  const handleGravarDemandaPerdas = () => {
    // Assuming demand and losses data is available
    const demandaPerdas = { demanda: [], perdas: [] }; // Replace with actual data
    setDemandaPerdas(demandaPerdas);
    console.log('Demand and losses saved to store:', demandaPerdas);
  };
  
  const handleDeleteDemandaPerdas = (index: number) => {
    const novaLista = demandaPerdasList.filter((_, i) => i !== index)
    setDemandaPerdasList(novaLista)
    setDemandaPerdas(novaLista) // ← ADICIONE ESTA LINHA
    console.log('✅ DemandaPerdas deletada do store:', novaLista) // Debug
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-3xl font-bold mb-6">Configuração de cenários e Estratégias de ações</h1>

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

      <div className="grid md:grid-cols-2 gap-6 mb-6">
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

      <div className="mb-6">
        <button
          onClick={handleGravarOuAdicionar}
          className="bg-blue-500 text-white px-6 py-3 rounded-md hover:bg-blue-600"
        >
          {isFirstGravar ? 'Gravar Cenários' : 'Adicionar Cenários'}
        </button>
      </div>

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

      <div className="mb-6">
        <h2 className="text-2xl font-bold mb-4">Configuração de Demanda e Perdas</h2>
        <div className="grid md:grid-cols-2 gap-6 mb-4">
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
                <option value="Crescimento Tendencial">Crescimento Tendencial</option>
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
                <option value="28%">28%</option>
                <option value="26%">26%</option>
                <option value="24%">24%</option>
              </select>
            </div>
          </div>
        </div>

        <div className="mt-4 mb-4">
          <button
            onClick={handleGravarDemandaPerdas}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Gravar Demanda e Perdas
          </button>
        </div>

        {demandaPerdasList.length > 0 && (
          <div className="mt-4">
            <table className="w-full border-collapse border border-gray-300">
              <thead>
                <tr>
                  <th className="border border-gray-300 p-2">Cenário de Demanda</th>
                  <th className="border border-gray-300 p-2">Consumo</th>
                  <th className="border border-gray-300 p-2">Perdas</th>
                  <th className="border border-gray-300 p-2">Ações</th>
                </tr>
              </thead>
              <tbody>
                {demandaPerdasList.map((item, index) => (
                  <tr key={index}>
                    <td className="border border-gray-300 p-2">{item.demandaCenario}</td>
                    <td className="border border-gray-300 p-2">{item.demandaConsumo}</td>
                    <td className="border border-gray-300 p-2">{item.perdas}</td>
                    <td className="border border-gray-300 p-2 text-center">
                      <button
                        onClick={() => handleDeleteDemandaPerdas(index)}
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
      </div>
    </div>
  )
}

export default function Configuracoes() {
  const { setSimulacao, setDemandaPerdas } = useSimulationStore();

  const handleGravarOuAdicionar = () => {
    // Assuming scenarios data is available, e.g., from state or props
    const scenarios = []; // Replace with actual scenarios data
    setSimulacao(scenarios);
    console.log('Scenarios saved to store:', scenarios);
  };