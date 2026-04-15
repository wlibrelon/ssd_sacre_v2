import React, { useState } from 'react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
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
  TableHeader,
  TableHead,
  TableRow,
  TableBody,
  TableCell,
} from '@/components/ui/table'

const fontes = ['Batalha', 'Bauru', 'Guarani']
const fatores = ['Clima', 'Uso da Terra', 'Condutividade Hidráulica', 'Captações a Montante']
const cenariosOptions = ['Tendencial', 'Pessimista', 'Conservacionista']
const acoes = [
  'Redução de emissões de gases de efeito estufa',
  'Conservação de recursos hídricos',
  'Restauração de ecossistemas',
  'Promoção de energias renováveis',
  'Gestão sustentável do solo',
  'Controle de poluição',
  'Educação ambiental',
  'Monitoramento e avaliação',
]

type Cenario = {
  fator: string
  cenario?: string
}

type Simulacao = {
  cenarios: string
  estrategias: string
}

const Configuracoes: React.FC = () => {
  const [selectedFonte, setSelectedFonte] = useState<string>('')
  const [cenarios, setCenarios] = useState<Cenario[]>([])
  const [estrategias, setEstrategias] = useState<string[]>([])
  const [simulacao, setSimulacao] = useState<Simulacao | null>(null)

  const [newFator, setNewFator] = useState<string>('')
  const [newCenario, setNewCenario] = useState<string>('')
  const [selectedAcao, setSelectedAcao] = useState<string>('')

  const addCenario = () => {
    if (newFator) {
      setCenarios([...cenarios, { fator: newFator, cenario: newCenario || undefined }])
      setNewFator('')
      setNewCenario('')
    }
  }

  const addEstrategia = () => {
    if (selectedAcao && !estrategias.includes(selectedAcao)) {
      setEstrategias([...estrategias, selectedAcao])
      setSelectedAcao('')
    }
  }

  const gravar = () => {
    const cenariosStr = cenarios
      .map((c) => `${c.fator}${c.cenario ? ` ${c.cenario}` : ''}`)
      .join(' | ')
    const estrategiasStr = estrategias.join(' | ')
    setSimulacao({ cenarios: cenariosStr, estrategias: estrategiasStr })
    setCenarios([])
    setEstrategias([])
  }

  const isButtonDisabled = cenarios.length === 0 && estrategias.length === 0

  return (
    <div className="p-6 space-y-6">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Card Seleção Fonte */}
        <Card>
          <CardHeader>
            <CardTitle>Seleção Fonte</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedFonte} onValueChange={setSelectedFonte}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma fonte" />
              </SelectTrigger>
              <SelectContent>
                {fontes.map((fonte) => (
                  <SelectItem key={fonte} value={fonte}>
                    {fonte}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </CardContent>
        </Card>

        {/* Card Construtor Cenários */}
        <Card>
          <CardHeader>
            <CardTitle>Construtor Cenários</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={newFator} onValueChange={setNewFator}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione Fator (obrigatório)" />
              </SelectTrigger>
              <SelectContent>
                {fatores.map((fator) => (
                  <SelectItem key={fator} value={fator}>
                    {fator}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Select value={newCenario} onValueChange={setNewCenario}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione Cenário (opcional)" />
              </SelectTrigger>
              <SelectContent>
                {cenariosOptions.map((cenario) => (
                  <SelectItem key={cenario} value={cenario}>
                    {cenario}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addCenario} disabled={!newFator}>
              Adicionar Cenário
            </Button>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fonte</TableHead>
                  <TableHead>Fator</TableHead>
                  <TableHead>Cenário</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {cenarios.map((c, index) => (
                  <TableRow key={index}>
                    <TableCell>{selectedFonte}</TableCell>
                    <TableCell>{c.fator}</TableCell>
                    <TableCell>{c.cenario || '-'}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>

        {/* Card Construtor Estratégias */}
        <Card>
          <CardHeader>
            <CardTitle>Construtor Estratégias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Select value={selectedAcao} onValueChange={setSelectedAcao}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione Ação" />
              </SelectTrigger>
              <SelectContent>
                {acoes.map((acao) => (
                  <SelectItem key={acao} value={acao}>
                    {acao}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <Button onClick={addEstrategia} disabled={!selectedAcao}>
              Adicionar Estratégia
            </Button>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Ação</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {estrategias.map((acao, index) => (
                  <TableRow key={index}>
                    <TableCell>{acao}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </div>

      {/* Botão Gravar */}
      <div className="flex justify-center">
        <Button onClick={gravar} disabled={isButtonDisabled}>
          Gravar cenários e estratégias
        </Button>
      </div>

      {/* Tabela Simulação */}
      {simulacao && (
        <Card>
          <CardHeader>
            <CardTitle>Tabela Simulação</CardTitle>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Cenários</TableHead>
                  <TableHead>Estratégias</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell>{simulacao.cenarios}</TableCell>
                  <TableCell>{simulacao.estrategias}</TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default Configuracoes
