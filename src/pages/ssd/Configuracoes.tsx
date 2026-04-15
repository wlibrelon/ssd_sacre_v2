import React, { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
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

const Configuracoes: React.FC = () => {
  const [fonte, setFonte] = useState<string>('')
  const [cenario, setCenario] = useState<string>('')
  const [estrategia, setEstrategia] = useState<string>('')
  const [buttonText, setButtonText] = useState<string>('Gravar cenários e estratégias')

  const fontes = ['Batalha', 'Bauru', 'Guarani']
  const fatores = ['Fator1', 'Fator2', 'Fator3'] // Placeholder
  const cenarios = ['Cenário1', 'Cenário2', 'Cenário3'] // Placeholder
  const acoes = ['Ação1', 'Ação2', 'Ação3', 'Ação4', 'Ação5', 'Ação6', 'Ação7', 'Ação8']

  const simulacaoData = [
    { id: 1, descricao: 'Simulação 1', valor: 100 },
    { id: 2, descricao: 'Simulação 2', valor: 200 },
    // Add more data as needed
  ]

  const handleButtonClick = () => {
    setButtonText(
      buttonText === 'Gravar cenários e estratégias'
        ? 'Adicionar'
        : 'Gravar cenários e estratégias',
    )
  }

  return (
    <div className="p-4 space-y-4">
      {/* Card Fonte */}
      <Card>
        <CardHeader>
          <CardTitle>Fonte</CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={fonte} onValueChange={setFonte}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione uma fonte" />
            </SelectTrigger>
            <SelectContent>
              {fontes.map((f) => (
                <SelectItem key={f} value={f}>
                  {f}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Grid with two cards */}
      <div className="grid md:grid-cols-2 gap-4">
        <Card>
          <CardHeader>
            <CardTitle>Construtor Cenários</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Select value={cenario} onValueChange={setCenario}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione um cenário" />
              </SelectTrigger>
              <SelectContent>
                {cenarios.map((c) => (
                  <SelectItem key={c} value={c}>
                    {c}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Add more selects for fatores if needed */}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Construtor Estratégias</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2">
            <Select value={estrategia} onValueChange={setEstrategia}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma estratégia" />
              </SelectTrigger>
              <SelectContent>
                {acoes.map((a) => (
                  <SelectItem key={a} value={a}>
                    {a}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            {/* Add more selects for fatores if needed */}
          </CardContent>
        </Card>
      </div>

      {/* Button */}
      <Button onClick={handleButtonClick}>{buttonText}</Button>

      {/* Table Simulacao acumulativa */}
      <Card>
        <CardHeader>
          <CardTitle>Simulação Acumulativa</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Descrição</TableHead>
                <TableHead>Valor</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {simulacaoData.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.id}</TableCell>
                  <TableCell>{item.descricao}</TableCell>
                  <TableCell>{item.valor}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}

export default Configuracoes
