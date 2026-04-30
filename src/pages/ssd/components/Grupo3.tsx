import React, { useState, useEffect, useMemo } from 'react'

interface TipoCenario {
  id: number
  nome: string
}

interface Cenario {
  id: number
  nome: string
  id_tipo_cenario: number
}

interface Estrategia {
  id: number
  nome: string
}

interface CenarioFonte {
  id_fonte: number
  id_tipo_cenario: number
  id_cenario: number
}

interface EstrategiaFonte {
  id_fonte: number
  id_estrategia: number
}

interface Grupo3Item {
  id_fonte: number
  id_tipo_cenario: number
  id_cenario: number
  id_estrategia: number
}

interface Fonte {
  id: number
  nome: string
}

const allTiposCenarios: TipoCenario[] = [
  { id: 1, nome: 'Tipo A' },
  { id: 2, nome: 'Tipo B' },
]

const allCenarios: Cenario[] = [
  { id: 101, nome: 'Cenário 1', id_tipo_cenario: 1 },
  { id: 102, nome: 'Cenário 2', id_tipo_cenario: 1 },
  { id: 201, nome: 'Cenário 3', id_tipo_cenario: 2 },
]

const allEstrategias: Estrategia[] = [
  { id: 301, nome: 'Estratégia 1' },
  { id: 302, nome: 'Estratégia 2' },
]

const fontes: Fonte[] = [
  { id: 1, nome: 'Fonte A' },
  { id: 2, nome: 'Fonte B' },
]

async function fetchCenariosFonte(): Promise<CenarioFonte[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id_fonte: 1, id_tipo_cenario: 1, id_cenario: 101 },
        { id_fonte: 1, id_tipo_cenario: 1, id_cenario: 102 },
        { id_fonte: 2, id_tipo_cenario: 2, id_cenario: 201 },
      ])
    }, 100)
  })
}

async function fetchEstrategiasFonte(): Promise<EstrategiaFonte[]> {
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve([
        { id_fonte: 1, id_estrategia: 301 },
        { id_fonte: 2, id_estrategia: 302 },
      ])
    }, 100)
  })
}

export const Grupo3: React.FC = () => {
  const [cenariosFonte, setCenariosFonte] = useState<CenarioFonte[]>([])
  const [estrategiasFonte, setEstrategiasFonte] = useState<EstrategiaFonte[]>([])
  const [form, setForm] = useState({
    id_fonte: 0,
    id_tipo_cenario: 0,
    id_cenario: 0,
    id_estrategia: 0,
  })
  const [grupo3Items, setGrupo3Items] = useState<Grupo3Item[]>([])

  useEffect(() => {
    const loadData = async () => {
      const cfs = await fetchCenariosFonte()
      const efs = await fetchEstrategiasFonte()
      setCenariosFonte(cfs)
      setEstrategiasFonte(efs)
    }
    loadData()
  }, [])

  const filteredTiposCenarios = useMemo(() => {
    if (!form.id_fonte || cenariosFonte.length === 0) return []
    const availableTipos = cenariosFonte
      .filter((cf) => cf.id_fonte === form.id_fonte)
      .map((cf) => cf.id_tipo_cenario)
      .filter((value, index, self) => self.indexOf(value) === index)
    return allTiposCenarios.filter((t) => availableTipos.includes(t.id))
  }, [form.id_fonte, cenariosFonte])

  const filteredCenarios = useMemo(() => {
    if (!form.id_fonte || cenariosFonte.length === 0) return []
    const tipo = form.id_tipo_cenario
    return allCenarios.filter((c) =>
      cenariosFonte.some(
        (cf) =>
          cf.id_fonte === form.id_fonte &&
          cf.id_cenario === c.id &&
          (!tipo || cf.id_tipo_cenario === tipo),
      ),
    )
  }, [form.id_fonte, form.id_tipo_cenario, cenariosFonte])

  const filteredEstrategias = useMemo(() => {
    if (!form.id_fonte || estrategiasFonte.length === 0) return []
    return allEstrategias.filter((e) =>
      estrategiasFonte.some((ef) => ef.id_fonte === form.id_fonte && ef.id_estrategia === e.id),
    )
  }, [form.id_fonte, estrategiasFonte])

  const getNomeTipo = (id: number) => allTiposCenarios.find((t) => t.id === id)?.nome || ''
  const getNomeCenario = (id: number) => allCenarios.find((c) => c.id === id)?.nome || ''
  const getNomeEstrategia = (id: number) => allEstrategias.find((e) => e.id === id)?.nome || ''
  const getNomeFonte = (id: number) => fontes.find((f) => f.id === id)?.nome || ''

  const handleFonteChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value) || 0
    setForm({ id_fonte: id, id_tipo_cenario: 0, id_cenario: 0, id_estrategia: 0 })
  }

  const handleTipoChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value) || 0
    setForm({ ...form, id_tipo_cenario: id, id_cenario: 0 })
  }

  const handleCenarioChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value) || 0
    setForm({ ...form, id_cenario: id })
  }

  const handleEstrategiaChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const id = parseInt(e.target.value) || 0
    setForm({ ...form, id_estrategia: id })
  }

  const adicionar = () => {
    if (form.id_fonte && form.id_tipo_cenario && form.id_cenario && form.id_estrategia) {
      setGrupo3Items([...grupo3Items, { ...form }])
      setForm({ ...form, id_tipo_cenario: 0, id_cenario: 0, id_estrategia: 0 })
    }
  }

  const remover = (index: number) => {
    setGrupo3Items(grupo3Items.filter((_, i) => i !== index))
  }

  return (
    <div>
      <h3>Grupo 3</h3>
      <div>
        <label>Fonte:</label>
        <select value={form.id_fonte.toString()} onChange={handleFonteChange}>
          <option value="0">Selecione...</option>
          {fontes.map((f) => (
            <option key={f.id} value={f.id.toString()}>
              {f.nome}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Tipo Cenário:</label>
        <select
          value={form.id_tipo_cenario.toString()}
          onChange={handleTipoChange}
          disabled={!form.id_fonte}
        >
          <option value="0">Selecione...</option>
          {filteredTiposCenarios.map((t) => (
            <option key={t.id} value={t.id.toString()}>
              {t.nome}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Cenário:</label>
        <select
          value={form.id_cenario.toString()}
          onChange={handleCenarioChange}
          disabled={!form.id_fonte || !form.id_tipo_cenario}
        >
          <option value="0">Selecione...</option>
          {filteredCenarios.map((c) => (
            <option key={c.id} value={c.id.toString()}>
              {c.nome}
            </option>
          ))}
        </select>
      </div>
      <div>
        <label>Estratégia:</label>
        <select
          value={form.id_estrategia.toString()}
          onChange={handleEstrategiaChange}
          disabled={!form.id_fonte}
        >
          <option value="0">Selecione...</option>
          {filteredEstrategias.map((e) => (
            <option key={e.id} value={e.id.toString()}>
              {e.nome}
            </option>
          ))}
        </select>
      </div>
      <button
        onClick={adicionar}
        disabled={
          !form.id_fonte || !form.id_tipo_cenario || !form.id_cenario || !form.id_estrategia
        }
      >
        Adicionar
      </button>
      <ul>
        {grupo3Items.map((item, index) => (
          <li key={index}>
            Fonte: {getNomeFonte(item.id_fonte)} | Tipo: {getNomeTipo(item.id_tipo_cenario)} |
            Cenário: {getNomeCenario(item.id_cenario)} | Estratégia:{' '}
            {getNomeEstrategia(item.id_estrategia)}
            <button onClick={() => remover(index)}>Remover</button>
          </li>
        ))}
      </ul>
    </div>
  )
}
