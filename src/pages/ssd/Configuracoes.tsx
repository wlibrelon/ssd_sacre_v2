import React, { useState, useRef } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Upload } from 'lucide-react'
import Papa from 'papaparse'
import { useSimulationStore } from '@/stores/useSimulationStore'
import { useToast } from '@/hooks/use-Toast'

interface DataPanelProps {
  title: string
  data: Record<string, any>[]
  cols: string[]
}

const DataPanel: React.FC<DataPanelProps> = ({ title, data, cols }) => (
  <Card>
    <CardHeader>
      <CardTitle>{title}</CardTitle>
    </CardHeader>
    <CardContent>
      <Table>
        <TableHeader>
          <TableRow>
            {cols.map((col) => (
              <TableHead key={col}>{col}</TableHead>
            ))}
          </TableRow>
        </TableHeader>
        <TableBody>
          {data.map((row, index) => (
            <TableRow key={index}>
              {cols.map((col) => (
                <TableCell key={col}>{row[col]}</TableCell>
              ))}
            </TableRow>
          ))}
        </TableBody>
      </Table>
    </CardContent>
  </Card>
)

const fixEncoding = (str: string): string => {
  // Assuming input might be in latin1, convert to UTF-8
  try {
    return decodeURIComponent(escape(str))
  } catch {
    return str // Fallback if decoding fails
  }
}

const Configuracoes: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const fileInputRef = useRef<HTMLInputElement>(null)
  const { csvData, setCsvData } = useSimulationStore()
  const { toast } = useToast()

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return
    setSelectedFile(file)

    Papa.parse(file, {
      header: true,
      skipEmptyLines: true,
      transform: (value) => fixEncoding(value),
      complete: (results) => {
        const data = results.data as Record<string, any>[]
        // Basic validation: check if data has at least one row and columns
        if (data.length === 0) {
          toast({
            title: 'Erro',
            description: 'O arquivo CSV está vazio.',
            variant: 'destructive',
          })
          return
        }
        // Additional validation: e.g., check for required columns (assuming 'name' and 'value' as example)
        const requiredCols = ['name', 'value']
        const headers = Object.keys(data[0])
        const missingCols = requiredCols.filter((col) => !headers.includes(col))
        if (missingCols.length > 0) {
          toast({
            title: 'Erro de Validação',
            description: `Colunas obrigatórias ausentes: ${missingCols.join(', ')}`,
            variant: 'destructive',
          })
          return
        }
        setCsvData(data)
        toast({
          title: 'Sucesso',
          description: 'Dados CSV importados com sucesso.',
        })
      },
      error: (error) => {
        toast({
          title: 'Erro de Parsing',
          description: `Erro ao processar o arquivo: ${error.message}`,
          variant: 'destructive',
        })
      },
    })
  }

  // Static data for panels
  const fontesAguaData = [
    { Nome: 'Fonte 1', Tipo: 'Superficial', Capacidade: '1000 m³' },
    { Nome: 'Fonte 2', Tipo: 'Subterrânea', Capacidade: '500 m³' },
  ]
  const cenariosData = [
    { Fator: 'Clima', Cenário: 'Seco', Probabilidade: '30%' },
    { Fator: 'Demanda', Cenário: 'Alta', Probabilidade: '50%' },
  ]
  const estrategiasData = [
    { Ação: 'Reduzir vazamentos', Impacto: 'Médio', Custo: 'R$ 100.000' },
    { Ação: 'Investir em dessalinização', Impacto: 'Alto', Custo: 'R$ 500.000' },
  ]

  return (
    <div className="p-4 space-y-4">
      <div className="grid md:grid-cols-2 gap-4">
        <DataPanel
          title="Fontes de Água"
          data={fontesAguaData}
          cols={['Nome', 'Tipo', 'Capacidade']}
        />
        <DataPanel
          title="Cenários para Simulação"
          data={cenariosData}
          cols={['Fator', 'Cenário', 'Probabilidade']}
        />
        <DataPanel title="Estratégias" data={estrategiasData} cols={['Ação', 'Impacto', 'Custo']} />
      </div>
      <Card>
        <CardHeader>
          <CardTitle>Importação CSV</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="file-input">Selecione um arquivo CSV</Label>
            <Input
              id="file-input"
              type="file"
              accept=".csv"
              ref={fileInputRef}
              onChange={handleUpload}
              className="hidden"
            />
            <Button onClick={handleButtonClick} className="flex items-center gap-2">
              <Upload size={16} />
              Upload CSV
            </Button>
            {selectedFile && (
              <p className="text-sm text-gray-600">Arquivo selecionado: {selectedFile.name}</p>
            )}
          </div>
          {csvData && csvData.length > 0 && (
            <div>
              <h3 className="text-lg font-semibold">Preview dos Dados Importados</h3>
              <Table>
                <TableHeader>
                  <TableRow>
                    {Object.keys(csvData[0]).map((col) => (
                      <TableHead key={col}>{col}</TableHead>
                    ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {csvData.slice(0, 5).map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((value, idx) => (
                        <TableCell key={idx}>{String(value)}</TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}

export default Configuracoes
