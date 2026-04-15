import React, { useState } from 'react'

interface Scenario {
  factor: string
  scenario: string
}

interface Simulation {
  cenarios: string
  estrategias: string
}

const Configuracoes: React.FC = () => {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [actions, setActions] = useState<string[]>([])
  const [simulations, setSimulations] = useState<Simulation[]>([])
  const [selectedFactor, setSelectedFactor] = useState<string>('')
  const [selectedScenario, setSelectedScenario] = useState<string>('')
  const [newAction, setNewAction] = useState<string>('')

  const factors = ['Clima', 'Uso da Terra', 'Demografia'] // Example factors
  const scenarioOptions = ['Tendencial', 'Pessimista', 'Otimista'] // Example scenarios

  const addScenario = () => {
    if (selectedFactor) {
      setScenarios([...scenarios, { factor: selectedFactor, scenario: selectedScenario }])
      setSelectedFactor('')
      setSelectedScenario('')
    }
  }

  const addAction = () => {
    if (newAction.trim()) {
      setActions([...actions, newAction.trim()])
      setNewAction('')
    }
  }

  const saveAll = () => {
    const cenarios = scenarios.map((s) => `${s.factor} ${s.scenario || ''}`.trim()).join(' | ')
    const estrategias = actions.join(' | ')
    setSimulations([{ cenarios, estrategias }])
    setScenarios([])
    setActions([])
  }

  const isSaveDisabled = scenarios.length === 0 && actions.length === 0

  return (
    <div>
      <h2>QUADRO 2 - CONSTRUTOR CENÁRIOS</h2>
      <select value={selectedFactor} onChange={(e) => setSelectedFactor(e.target.value)}>
        <option value="">Selecione Fator</option>
        {factors.map((f) => (
          <option key={f} value={f}>
            {f}
          </option>
        ))}
      </select>
      <select value={selectedScenario} onChange={(e) => setSelectedScenario(e.target.value)}>
        <option value="">Cenário (opcional)</option>
        {scenarioOptions.map((s) => (
          <option key={s} value={s}>
            {s}
          </option>
        ))}
      </select>
      <button onClick={addScenario} disabled={!selectedFactor}>
        Adicionar
      </button>
      <table>
        <thead>
          <tr>
            <th>Fonte</th>
            <th>Fator</th>
            <th>Cenário</th>
          </tr>
        </thead>
        <tbody>
          {scenarios.map((s, i) => (
            <tr key={i}>
              <td>Fonte Exemplo</td>
              <td>{s.factor}</td>
              <td>{s.scenario || ''}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <h2>QUADRO 3 - CONSTRUTOR ESTRATÉGIAS</h2>
      <input
        type="text"
        value={newAction}
        onChange={(e) => setNewAction(e.target.value)}
        placeholder="Digite a ação"
      />
      <button onClick={addAction} disabled={!newAction.trim()}>
        Adicionar
      </button>
      <table>
        <thead>
          <tr>
            <th>Ação</th>
          </tr>
        </thead>
        <tbody>
          {actions.map((a, i) => (
            <tr key={i}>
              <td>{a}</td>
            </tr>
          ))}
        </tbody>
      </table>

      <button onClick={saveAll} disabled={isSaveDisabled}>
        Gravar cenários e estratégias
      </button>

      {simulations.length > 0 && (
        <div>
          <h2>Tabela Simulação</h2>
          <table>
            <thead>
              <tr>
                <th>Cenários</th>
                <th>Estratégias</th>
              </tr>
            </thead>
            <tbody>
              {simulations.map((sim, i) => (
                <tr key={i}>
                  <td>{sim.cenarios}</td>
                  <td>{sim.estrategias}</td>
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
