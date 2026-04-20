import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
  BarChart,
  Bar,
} from 'recharts'
import Papa from 'papaparse'

type Cenario = {
  id: number
  nome: string
  demanda: number
  perdas: number
}

type DadosSimulacao = {
  tempo: number
  producao: number
  consumo: number
  perdas: number
}

const Cenarios: React.FC = () => {
  const [cenarios, setCenarios] = useState<Cenario[]>([])
  const [dadosSimulacao, setDadosSimulacao] = useState<DadosSimulacao[]>([])
  const [demandaSelecionada, setDemandaSelecionada] = useState<string>('')
  const [perdasSelecionadas, setPerdasSelecionadas] = useState<string>('')
  const [arquivoUpload, setArquivoUpload] = useState<File | null>(null)
  const [simulacaoExecutada, setSimulacaoExecutada] = useState<boolean>(false)

  useEffect(() => {
    const carregarCenarios = async () => {
      try {
        const response = await fetch('/cenarios.csv')
        const csvText = await response.text()
        const parsed = Papa.parse<Cenario>(csvText, {
          header: true,
          dynamicTyping: true,
        })
        setCenarios(parsed.data)
      } catch (error) {
        console.error('Erro ao carregar cenários:', error)
      }
    }
    carregarCenarios()
  }, [])

  const handleSimular = () => {
    const dados: DadosSimulacao[] = []
    for (let i = 0; i < 24; i++) {
      dados.push({
        tempo: i,
        producao: Math.random() * 100,
        consumo: parseFloat(demandaSelecionada) || 0,
        perdas: parseFloat(perdasSelecionadas) || 0,
      })
    }
    setDadosSimulacao(dados)
    setSimulacaoExecutada(true)
  }

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setArquivoUpload(file)
    }
  }

  const exportarCSV = () => {
    const csv = Papa.unparse(dadosSimulacao)
    const blob = new Blob([csv], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'simulacao.csv'
    a.click()
  }

  return (
    <div className="p-4 space-y-4">
      <Card>
        <CardHeader>
          <CardTitle>Cenários para Simulação</CardTitle>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID</TableHead>
                <TableHead>Nome</TableHead>
                <TableHead>Demanda</TableHead>
                <TableHead>Perdas</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {cenarios.map((cenario) => (
                <TableRow key={cenario.id}>
                  <TableCell>{cenario.id}</TableCell>
                  <TableCell>{cenario.nome}</TableCell>
                  <TableCell>{cenario.demanda}</TableCell>
                  <TableCell>{cenario.perdas}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Configuração de Demanda e Perdas</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="demanda">Demanda</Label>
            <Select onValueChange={setDemandaSelecionada}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione a demanda" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="100">100 kW</SelectItem>
                <SelectItem value="200">200 kW</SelectItem>
                <SelectItem value="300">300 kW</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="perdas">Perdas</Label>
            <Select onValueChange={setPerdasSelecionadas}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione as perdas" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="5">5%</SelectItem>
                <SelectItem value="10">10%</SelectItem>
                <SelectItem value="15">15%</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Importação de dados para simulação</CardTitle>
        </CardHeader>
        <CardContent>
          <Input type="file" onChange={handleUpload} accept=".csv" />
          {arquivoUpload && <p>Arquivo selecionado: {arquivoUpload.name}</p>}
        </CardContent>
      </Card>

      <Button onClick={handleSimular}>Simular</Button>

      {simulacaoExecutada && (
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Dashboard de Produção</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={dadosSimulacao}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tempo" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="producao" stroke="#8884d8" />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Dashboard de Consumo e Perdas</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={dadosSimulacao}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="tempo" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Bar dataKey="consumo" fill="#82ca9d" />
                  <Bar dataKey="perdas" fill="#ffc658" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Métricas</CardTitle>
            </CardHeader>
            <CardContent>
              <p>
                Produção Total: {dadosSimulacao.reduce((sum, d) => sum + d.producao, 0).toFixed(2)}
              </p>
              <p>
                Consumo Total: {dadosSimulacao.reduce((sum, d) => sum + d.consumo, 0).toFixed(2)}
              </p>
              <p>
                Perdas Totais: {dadosSimulacao.reduce((sum, d) => sum + d.perdas, 0).toFixed(2)}
              </p>
              <Button onClick={exportarCSV}>Exportar CSV</Button>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

export default Cenarios
