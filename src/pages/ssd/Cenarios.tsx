import React, { useState, useEffect, ChangeEvent } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface DataItem {
  mes: string
  valor: number
}

const Cenarios: React.FC = () => {
  const [selectedScenario, setSelectedScenario] = useState<string>('')
  const [demandaData, setDemandaData] = useState<DataItem[]>([])
  const [perdasData, setPerdasData] = useState<DataItem[]>([])
  const [demandaFilter, setDemandaFilter] = useState<string>('')
  const [perdasFilter, setPerdasFilter] = useState<string>('')
  const [showDemandaPerdas, setShowDemandaPerdas] = useState<boolean>(false)
  const [totalDemanda, setTotalDemanda] = useState<number>(0)
  const [totalPerdas, setTotalPerdas] = useState<number>(0)
  const [energiaTotal, setEnergiaTotal] = useState<number>(0)
  const [fatorPerdas, setFatorPerdas] = useState<number>(0)
  const [custoTotal, setCustoTotal] = useState<number>(0)
  const [simulationFile, setSimulationFile] = useState<File | null>(null)

  useEffect(() => {
    if (selectedScenario) {
      // Mock data for demanda and perdas
      const mockDemanda: DataItem[] = []
      const mockPerdas: DataItem[] = []
      for (let i = 1; i <= 12; i++) {
        mockDemanda.push({ mes: `Mês ${i}`, valor: 1000 + i * 50 })
        mockPerdas.push({ mes: `Mês ${i}`, valor: 50 + i * 2 })
      }
      setDemandaData(mockDemanda)
      setPerdasData(mockPerdas)
      setShowDemandaPerdas(false)
    }
  }, [selectedScenario])

  const normalizeString = (str: string): string => {
    return str
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .toLowerCase()
      .trim()
  }

  const formatNumber = (num: number): string => {
    return num.toLocaleString('pt-BR')
  }

  const handleImportSimulation = async (e: ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (files && files[0]) {
      const importedFile = files[0]
      setSimulationFile(importedFile)
      // Simulate file processing (e.g., parse CSV)
      const text = await importedFile.text()
      console.log('Arquivo de simulação importado:', text)
      // Logic to update data would go here
    }
  }

  const filteredDemanda = demandaData.filter((item) =>
    normalizeString(item.mes).includes(normalizeString(demandaFilter)),
  )

  const filteredPerdas = perdasData.filter((item) =>
    normalizeString(item.mes).includes(normalizeString(perdasFilter)),
  )

  const handleSimulation = () => {
    const totDem = filteredDemanda.reduce((sum, item) => sum + item.valor, 0)
    const totPer = filteredPerdas.reduce((sum, item) => sum + item.valor, 0)
    const energia = totDem - totPer
    const fator = totDem > 0 ? (totPer / totDem) * 100 : 0
    const custo = energia * 0.5 // Arbitrary calculation

    setTotalDemanda(totDem)
    setTotalPerdas(totPer)
    setEnergiaTotal(energia)
    setFatorPerdas(fator)
    setCustoTotal(custo)
    setShowDemandaPerdas(true)
  }

  return (
    <div className="container mx-auto py-10 px-4">
      <Card className="w-full max-w-2xl mx-auto mb-8">
        <CardHeader>
          <CardTitle>Seleção de Cenários</CardTitle>
          <CardDescription>Escolha o cenário para simulação</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Select value={selectedScenario} onValueChange={setSelectedScenario}>
            <SelectTrigger>
              <SelectValue placeholder="Selecione um cenário" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="base">Base 2024</SelectItem>
              <SelectItem value="otimista">Otimista 2025</SelectItem>
              <SelectItem value="pessimista">Pessimista 2025</SelectItem>
            </SelectContent>
          </Select>
          <div>
            <label className="text-sm font-medium block mb-1">Importar Simulação (CSV)</label>
            <Input type="file" accept=".csv" onChange={handleImportSimulation} />
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
        <Card>
          <CardHeader>
            <CardTitle>Configuração Demanda</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Filtrar por mês (ex: Mês 1)"
              value={demandaFilter}
              onChange={(e) => setDemandaFilter(e.target.value)}
            />
            <div className="rounded-md border max-h-60 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mês</TableHead>
                    <TableHead>Valor (MWm)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredDemanda.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.mes}</TableCell>
                      <TableCell>{formatNumber(item.valor)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Configuração Perdas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <Input
              placeholder="Filtrar por mês (ex: Mês 1)"
              value={perdasFilter}
              onChange={(e) => setPerdasFilter(e.target.value)}
            />
            <div className="rounded-md border max-h-60 overflow-auto">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Mês</TableHead>
                    <TableHead>Valor (MWm)</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredPerdas.map((item, index) => (
                    <TableRow key={index}>
                      <TableCell>{item.mes}</TableCell>
                      <TableCell>{formatNumber(item.valor)}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          </CardContent>
        </Card>

        <div className="md:col-span-2 flex justify-center pt-4">
          <Button onClick={handleSimulation} size="lg" className="w-full md:w-auto">
            Executar a Simulação
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-6">
        <Card>
          <CardHeader className="flex flex-col items-center space-y-1.5 pb-2">
            <CardTitle className="text-2xl font-bold">{formatNumber(totalDemanda)}</CardTitle>
            <CardDescription>Total Demanda</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">MWm</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-col items-center space-y-1.5 pb-2">
            <CardTitle className="text-2xl font-bold">{formatNumber(totalPerdas)}</CardTitle>
            <CardDescription>Total Perdas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">MWm</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-col items-center space-y-1.5 pb-2">
            <CardTitle className="text-2xl font-bold">{formatNumber(energiaTotal)}</CardTitle>
            <CardDescription>Energia Total</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">MWm</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-col items-center space-y-1.5 pb-2">
            <CardTitle className="text-2xl font-bold">{fatorPerdas.toFixed(2)}%</CardTitle>
            <CardDescription>Fator de Perdas</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">do total</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-col items-center space-y-1.5 pb-2">
            <CardTitle className="text-2xl font-bold">R$ {formatNumber(custoTotal)}</CardTitle>
            <CardDescription>Custo Total</CardDescription>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">estimado</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default Cenarios
