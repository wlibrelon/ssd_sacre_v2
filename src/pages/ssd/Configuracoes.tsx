import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'
import { useSimulationStore } from '../stores/simulationStore'

type Cenario = {
  id: string
  nome: string
  estrategias: string[]
}

type Simulacao = {
  id: string
  nome: string
  cenarios: Cenario[]
}

type DemandaPerdas = {
  id: string
  demandaCenario: string
  demandaConsumo: string
  perdas: string
}

const Configuracoes: React.FC = () => {
  const { simulacoes, addSimulacao, deleteSimulacao } = useSimulationStore()
  const [nomeSimulacao, setNomeSimulacao] = useState('')
  const [fonteSelecionada, setFonteSelecionada] = useState('')
  const [fatorSelecionado, setFatorSelecionado] = useState('')
  const [simulacaoSelecionada, setSimulacaoSelecionada] = useState<Simulacao | null>(null)
  const [cenarioSelecionado, setCenarioSelecionado] = useState<Cenario | null>(null)
  const [demandaCenario, setDemandaCenario] = useState('')
  const [demandaConsumo, setDemandaConsumo] = useState('')
  const [perdas, setPerdas] = useState('')
  const [demandaPerdasList, setDemandaPerdasList] = useState<DemandaPerdas[]>([])

  const fontes = ['Fonte 1', 'Fonte 2', 'Fonte 3']
  const fatores = ['Fator 1', 'Fator 2', 'Fator 3']
  const cenariosOptions = ['Cenário 1', 'Cenário 2', 'Cenário 3']
  const acoes = ['Ação 1', 'Ação 2', 'Ação 3']

  const addCenario = () => {
    if (simulacaoSelecionada) {
      const newCenario: Cenario = {
        id: Date.now().toString(),
        nome: 'Novo Cenário',
        estrategias: [],
      }
      simulacaoSelecionada.cenarios.push(newCenario)
      setSimulacaoSelecionada({ ...simulacaoSelecionada })
    }
  }

  const deleteCenario = (cenarioId: string) => {
    if (simulacaoSelecionada) {
      simulacaoSelecionada.cenarios = simulacaoSelecionada.cenarios.filter(
        (c) => c.id !== cenarioId,
      )
      setSimulacaoSelecionada({ ...simulacaoSelecionada })
    }
  }

  const addEstrategia = (cenarioId: string, estrategia: string) => {
    if (simulacaoSelecionada) {
      const cenario = simulacaoSelecionada.cenarios.find((c) => c.id === cenarioId)
      if (cenario) {
        cenario.estrategias.push(estrategia)
        setSimulacaoSelecionada({ ...simulacaoSelecionada })
      }
    }
  }

  const deleteEstrategia = (cenarioId: string, estrategiaIndex: number) => {
    if (simulacaoSelecionada) {
      const cenario = simulacaoSelecionada.cenarios.find((c) => c.id === cenarioId)
      if (cenario) {
        cenario.estrategias.splice(estrategiaIndex, 1)
        setSimulacaoSelecionada({ ...simulacaoSelecionada })
      }
    }
  }

  const handleGravarOuAdicionar = () => {
    if (nomeSimulacao) {
      const newSimulacao: Simulacao = {
        id: Date.now().toString(),
        nome: nomeSimulacao,
        cenarios: [],
      }
      addSimulacao(newSimulacao)
      setNomeSimulacao('')
    }
  }

  const handleDeleteSimulacao = (simulacaoId: string) => {
    deleteSimulacao(simulacaoId)
  }

  const handleGravarDemandaPerdas = () => {
    const newDemandaPerdas: DemandaPerdas = {
      id: Date.now().toString(),
      demandaCenario,
      demandaConsumo,
      perdas,
    }
    setDemandaPerdasList([...demandaPerdasList, newDemandaPerdas])
    setDemandaCenario('')
    setDemandaConsumo('')
    setPerdas('')
  }

  const handleDeleteDemandaPerdas = (id: string) => {
    setDemandaPerdasList(demandaPerdasList.filter((item) => item.id !== id))
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <h1 className="text-2xl font-bold mb-6">Configurações</h1>

      <div className="mb-6">
        <label className="block text-sm font-medium mb-2">Fonte</label>
        <select
          value={fonteSelecionada}
          onChange={(e) => setFonteSelecionada(e.target.value)}
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

      <div className="grid grid-cols-2 gap-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Fator</label>
          <select
            value={fatorSelecionado}
            onChange={(e) => setFatorSelecionado(e.target.value)}
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
        <div>
          <label className="block text-sm font-medium mb-2">Nome da Simulação</label>
          <input
            type="text"
            value={nomeSimulacao}
            onChange={(e) => setNomeSimulacao(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Digite o nome da simulação"
          />
        </div>
      </div>

      <button
        onClick={handleGravarOuAdicionar}
        className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 mb-6"
      >
        Gravar ou Adicionar
      </button>

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Simulações</h2>
        <table className="w-full table-auto border-collapse border border-gray-300">
          <thead>
            <tr>
              <th className="border border-gray-300 p-2">Nome</th>
              <th className="border border-gray-300 p-2">Cenários</th>
              <th className="border border-gray-300 p-2">Ações</th>
            </tr>
          </thead>
          <tbody>
            {simulacoes.map((simulacao) => (
              <tr key={simulacao.id}>
                <td className="border border-gray-300 p-2">{simulacao.nome}</td>
                <td className="border border-gray-300 p-2">
                  {simulacao.cenarios.map((cenario) => (
                    <div key={cenario.id}>{cenario.nome}</div>
                  ))}
                </td>
                <td className="border border-gray-300 p-2">
                  <button
                    onClick={() => handleDeleteSimulacao(simulacao.id)}
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

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-4">Configuração de Demanda e Perdas</h2>
        <div className="grid grid-cols-2 gap-4 mb-4">
          <div>
            <label className="block text-sm font-medium mb-2">Demanda Cenário</label>
            <input
              type="text"
              value={demandaCenario}
              onChange={(e) => setDemandaCenario(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Digite a demanda do cenário"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-2">Demanda Consumo</label>
            <input
              type="text"
              value={demandaConsumo}
              onChange={(e) => setDemandaConsumo(e.target.value)}
              className="w-full p-2 border border-gray-300 rounded-md"
              placeholder="Digite a demanda de consumo"
            />
          </div>
        </div>
        <div className="mb-4">
          <label className="block text-sm font-medium mb-2">Perdas</label>
          <input
            type="text"
            value={perdas}
            onChange={(e) => setPerdas(e.target.value)}
            className="w-full p-2 border border-gray-300 rounded-md"
            placeholder="Digite as perdas"
          />
        </div>
        <div className="mt-4">
          <button
            onClick={handleGravarDemandaPerdas}
            className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600"
          >
            Gravar Demanda e Perdas
          </button>
        </div>
        {demandaPerdasList.length > 0 && (
          <table className="w-full table-auto border-collapse border border-gray-300 mt-4">
            <thead>
              <tr>
                <th className="border border-gray-300 p-2">Demanda Cenário</th>
                <th className="border border-gray-300 p-2">Demanda Consumo</th>
                <th className="border border-gray-300 p-2">Perdas</th>
                <th className="border border-gray-300 p-2">Ações</th>
              </tr>
            </thead>
            <tbody>
              {demandaPerdasList.map((item) => (
                <tr key={item.id}>
                  <td className="border border-gray-300 p-2">{item.demandaCenario}</td>
                  <td className="border border-gray-300 p-2">{item.demandaConsumo}</td>
                  <td className="border border-gray-300 p-2">{item.perdas}</td>
                  <td className="border border-gray-300 p-2">
                    <button
                      onClick={() => handleDeleteDemandaPerdas(item.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>
    </div>
  )
}

export default Configuracoes
