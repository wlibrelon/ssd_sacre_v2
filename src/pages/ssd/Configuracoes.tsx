import React, { useState } from 'react'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

// Reusable DataPanel component for static tables
type DataPanelProps = {
  title: string
  data: { id: number; descricao: string }[]
}

const DataPanel: React.FC<DataPanelProps> = ({ title, data }) => (
  <div className="border rounded p-4">
    <h3 className="text-lg font-semibold mb-2">{title}</h3>
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>ID</TableHead>
          <TableHead>Descrição</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {data.map((item) => (
          <TableRow key={item.id}>
            <TableCell>{item.id}</TableCell>
            <TableCell>{item.descricao}</TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  </div>
)

// Static data for panels 1-4
const fontesList = [
  { id: 1, descricao: 'Fonte 1' },
  { id: 2, descricao: 'Fonte 2' },
]

const fatoresList = [
  { id: 1, descricao: 'Fator 1' },
  { id: 2, descricao: 'Fator 2' },
]

const cenariosList = [
  { id: 1, descricao: 'Cenário 1' },
  { id: 2, descricao: 'Cenário 2' },
]

const acoesList = [
  { id: 1, descricao: 'Ação 1' },
  { id: 2, descricao: 'Ação 2' },
]

const Configuracoes: React.FC = () => {
  const [selectedFonte, setSelectedFonte] = useState<string>('')
  const [selectedFator, setSelectedFator] = useState<string>('')
  const [selectedCenario, setSelectedCenario] = useState<string>('')
  const [selectedAcao, setSelectedAcao] = useState<string>('')
  const [cenarioSimulacao, setCenarioSimulacao] = useState<{ id: number; descricao: string }[]>([])
  const [estrategiaSimulacao, setEstrategiaSimulacao] = useState<
    { id: number; descricao: string }[]
  >([])

  const handleAddCenario = () => {
    if (selectedFonte && selectedFator && selectedCenario) {
      const descricao = `${selectedFonte}_${selectedFator}_${selectedCenario}`
      const newId = cenarioSimulacao.length + 1
      setCenarioSimulacao([...cenarioSimulacao, { id: newId, descricao }])
      setSelectedFonte('')
      setSelectedFator('')
      setSelectedCenario('')
    }
  }

  const handleSaveCenario = () => {
    // Simulate creating table cenario_simulacao
    console.log('Creating cenario_simulacao table with data:', cenarioSimulacao)
    // In a real app, send to backend
    setCenarioSimulacao([])
  }

  const handleAddAcao = () => {
    if (selectedAcao) {
      const newId = estrategiaSimulacao.length + 1
      setEstrategiaSimulacao([...estrategiaSimulacao, { id: newId, descricao: selectedAcao }])
      setSelectedAcao('')
    }
  }

  const handleSaveAcao = () => {
    // Simulate creating table estrategia_simulacao
    console.log('Creating estrategia_simulacao table with data:', estrategiaSimulacao)
    // In a real app, send to backend
    setEstrategiaSimulacao([])
  }

  return (
    <div className="container mx-auto p-4">
      <h1 className="text-2xl font-bold mb-4">Configurações</h1>
      <div className="grid md:grid-cols-2 gap-4">
        {/* Quadro 1: Fontes */}
        <DataPanel title="Fontes" data={fontesList} />

        {/* Quadro 2: Fatores */}
        <DataPanel title="Fatores" data={fatoresList} />

        {/* Quadro 3: Cenários */}
        <DataPanel title="Cenários" data={cenariosList} />

        {/* Quadro 4: Ações */}
        <DataPanel title="Ações" data={acoesList} />

        {/* Quadro 5: Construtor de Cenários */}
        <div className="border rounded p-4">
          <h3 className="text-lg font-semibold mb-2">Construtor de Cenários para Simulação</h3>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Fonte</label>
            <Select value={selectedFonte} onValueChange={setSelectedFonte}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione Fonte" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Batalha">Batalha</SelectItem>
                <SelectItem value="Bauru">Bauru</SelectItem>
                <SelectItem value="Guarani">Guarani</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Fator</label>
            <Select value={selectedFator} onValueChange={setSelectedFator}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione Fator" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Clima">Clima</SelectItem>
                <SelectItem value="Uso da Terra">Uso da Terra</SelectItem>
                <SelectItem value="Condutividade">Condutividade</SelectItem>
                <SelectItem value="Captações">Captações</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Cenário</label>
            <Select value={selectedCenario} onValueChange={setSelectedCenario}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione Cenário" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Tendencial">Tendencial</SelectItem>
                <SelectItem value="Pessimista">Pessimista</SelectItem>
                <SelectItem value="Conservacionista">Conservacionista</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAddCenario} className="mb-2">
            Adicionar
          </Button>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cenarioSimulacao.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.descricao}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button onClick={handleSaveCenario} className="mt-2">
            Gravar
          </Button>
        </div>

        {/* Quadro 6: Construtor de Estratégias */}
        <div className="border rounded p-4">
          <h3 className="text-lg font-semibold mb-2">Construtor de Estratégias de Ações</h3>
          <div className="mb-2">
            <label className="block text-sm font-medium mb-1">Ações</label>
            <Select value={selectedAcao} onValueChange={setSelectedAcao}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione Ação" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1-Instalar barraginhas">1-Instalar barraginhas</SelectItem>
                <SelectItem value="2-Ação 2">2-Ação 2</SelectItem>
                <SelectItem value="3-Ação 3">3-Ação 3</SelectItem>
                <SelectItem value="4-Ação 4">4-Ação 4</SelectItem>
                <SelectItem value="5-Ação 5">5-Ação 5</SelectItem>
                <SelectItem value="6-Ação 6">6-Ação 6</SelectItem>
                <SelectItem value="7-Ação 7">7-Ação 7</SelectItem>
                <SelectItem value="8-Barramento a montante">8-Barramento a montante</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Button onClick={handleAddAcao} className="mb-2">
            Adicionar
          </Button>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Descrição</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {estrategiaSimulacao.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.descricao}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <Button onClick={handleSaveAcao} className="mt-2">
            Gravar
          </Button>
        </div>
      </div>
    </div>
  )
}

export default Configuracoes
