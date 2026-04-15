import React, { useState } from 'react'
import { Trash2 } from 'lucide-react'

type Cenario = { fonte: string; fator: string; cenario: string }
type Simulacao = { cenarios: Cenario[]; estrategias: string[] }

const fontes = ['Batalha', 'Bauru', 'Guarani']
const fatores = ['Clima', 'Uso da Terra', 'Condutividade Hidráulica', 'Captações a Montante']
const cenariosOptions = ['Cenário1', 'Cenário2', 'Cenário3']
const acoes = [
  'Instalar Barraginhas',
  'Uso atual',
  'Expansão de poços',
  'Instalar barramento a montante',
  'Condição atual de captação',
  'Expansão de poços no município',
  'Mais poços na área urbana',
]

const App: React.FC = () => {
  const [selectedFonte, setSelectedFonte] = useState<string>('')
  const [newFator, setNewFator] = useState<string>('')
  const [newCenario, setNewCenario] = useState<string>('')
  const [cenarios, setCenarios] = useState<Cenario[]>([])
  const [selectedAcao, setSelectedAcao] = useState<string>('')
  const [estrategias, setEstrategias] = useState<string[]>([])
  const [simulacao, setSimulacao] = useState<Simulacao[]>([])
  const [isFirstGravar, setIsFirstGravar] = useState<boolean>(true)

  const addCenario = () => {
    setCenarios((prev) =>
      prev.concat({ fonte: selectedFonte, fator: newFator, cenario: newCenario }),
    )
  }

  const addEstrategia = () => {
    setEstrategias((prev) => prev.concat(selectedAcao))
  }

  const handleGravarOuAdicionar = () => {
    setSimulacao((prev) => prev.concat({ cenarios, estrategias }))
    setIsFirstGravar(false)
  }

  const handleDeleteSimulacao = (index: number) => {
    setSimulacao((prev) => prev.filter((_, i) => i !== index))
  }

  return (
    <div>
      <div className="card fonte">
        <h3>Fonte</h3>
        <select value={selectedFonte} onChange={(e) => setSelectedFonte(e.target.value)}>
          <option value="">Selecione</option>
          {fontes.map((f) => (
            <option key={f} value={f}>
              {f}
            </option>
          ))}
        </select>
      </div>
      <div className="grid construtores">
        <div className="cenarios">
          <h4>Cenários</h4>
          <select value={newFator} onChange={(e) => setNewFator(e.target.value)}>
            <option value="">Fator</option>
            {fatores.map((f) => (
              <option key={f} value={f}>
                {f}
              </option>
            ))}
          </select>
          <select value={newCenario} onChange={(e) => setNewCenario(e.target.value)}>
            <option value="">Cenário</option>
            {cenariosOptions.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          <button onClick={addCenario}>Adicionar Cenário</button>
          <table>
            <thead>
              <tr>
                <th>Fonte</th>
                <th>Fator</th>
                <th>Cenário</th>
              </tr>
            </thead>
            <tbody>
              {cenarios.map((c, i) => (
                <tr key={i}>
                  <td>{c.fonte}</td>
                  <td>{c.fator}</td>
                  <td>{c.cenario}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="estrategias">
          <h4>Estratégias</h4>
          <select value={selectedAcao} onChange={(e) => setSelectedAcao(e.target.value)}>
            <option value="">Ação</option>
            {acoes.map((a) => (
              <option key={a} value={a}>
                {a}
              </option>
            ))}
          </select>
          <button onClick={addEstrategia}>Adicionar Estratégia</button>
          <table>
            <thead>
              <tr>
                <th>Estratégia</th>
              </tr>
            </thead>
            <tbody>
              {estrategias.map((e, i) => (
                <tr key={i}>
                  <td>{e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
      <div className="button-container">
        <button onClick={handleGravarOuAdicionar}>{isFirstGravar ? 'Gravar' : 'Adicionar'}</button>
      </div>
      <div className="tabela simulacao">
        <h4>Simulação</h4>
        <table>
          <thead>
            <tr>
              <th>Cenários</th>
              <th>Estratégias</th>
              <th>Ações</th>
            </tr>
          </thead>
          <tbody>
            {simulacao.map((s, i) => (
              <tr key={i}>
                <td>{s.cenarios.map((c) => `${c.fonte}-${c.fator}-${c.cenario}`).join(', ')}</td>
                <td>{s.estrategias.join(', ')}</td>
                <td>
                  <button onClick={() => handleDeleteSimulacao(i)}>
                    <Trash2 />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default App
