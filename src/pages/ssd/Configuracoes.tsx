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

interface DataPanelProps {
  title: string
  data: { [key: string]: string | number }[]
  cols: string[]
}

const DataPanel: React.FC<DataPanelProps> = ({ title, data, cols }) => {
  return (
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
}

const fixEncoding = (text: string): string => {
  // Simple fix for common encoding issues, e.g., replace wrong accents
  return text
    .replace(/Ã¡/g, 'á')
    .replace(/Ã©/g, 'é')
    .replace(/Ã­/g, 'í')
    .replace(/Ã³/g, 'ó')
    .replace(/Ãº/g, 'ú')
    .replace(/Ã§/g, 'ç')
    .replace(/Ã£/g, 'ã')
    .replace(/Ãµ/g, 'õ')
    .replace(/Ã€/g, 'À')
    .replace(/Ã‰/g, 'É')
    .replace(/Ã/g, 'Í')
    .replace(/Ã“/g, 'Ó')
    .replace(/Ãš/g, 'Ú')
}

const Configuracoes: React.FC = () => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null)
  const [csvData, setCsvData] = useState<{ [key: string]: string }[]>([])
  const fileInputRef = useRef<HTMLInputElement>(null)

  const fontes = [
    { id: 1, nome: 'Batalha', tipo: 'Superficial' },
    { id: 2, nome: 'Bauru', tipo: 'Subterrânea' },
    { id: 3, nome: 'Guarani', tipo: 'Subterrânea' },
  ]

  const fatores = [
    { id: 1, nome: 'Clima' },
    { id: 2, nome: 'Uso da Terra' },
    { id: 3, nome: 'Condutividade Hidráulica' },
    { id: 4, nome: 'Captações a Montante' },
  ]

  const cenarios = [
    { id: 1, nome: 'Tendencial' },
    { id: 2, nome: 'Pessimista' },
    { id: 3, nome: 'Conservacionista' },
  ]

  const acoes = [
    { id: 1, nome: 'Instalar barraginhas' },
    { id: 2, nome: 'Uso atual' },
    { id: 3, nome: 'Expansão de poços' },
    { id: 4, nome: 'Instalar barramento a montante' },
    { id: 5, nome: 'Condição atual da captação' },
    { id: 6, nome: 'Expansão de poços no município' },
    { id: 7, nome: 'Mais poços na área urbana' },
    { id: 8, nome: 'Barramento a montante' },
  ]

  const handleButtonClick = () => {
    fileInputRef.current?.click()
  }

  const handleUpload = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (file) {
      setSelectedFile(file)
      const reader = new FileReader()
      reader.onload = (e) => {
        const text = e.target?.result as string
        const fixedText = fixEncoding(text)
        const lines = fixedText.split('\n').filter((line) => line.trim() !== '')
        if (lines.length < 2) {
          console.warn('CSV file must have at least a header and one data row.')
          return
        }
        const headers = lines[0].split(',').map((h) => h.trim().replace(/"/g, ''))
        const data = lines.slice(1).map((line) => {
          const values = line.split(',').map((v) => v.trim().replace(/"/g, ''))
          const obj: { [key: string]: string } = {}
          headers.forEach((header, index) => {
            obj[header] = values[index] || ''
          })
          return obj
        })
        setCsvData(data.slice(0, 5)) // Preview first 5
      }
      reader.readAsText(file, 'UTF-8')
    }
  }

  return (
    <div className="grid md:grid-cols-2 gap-4">
      <DataPanel title="Fontes" data={fontes} cols={['id', 'nome', 'tipo']} />
      <DataPanel title="Fatores" data={fatores} cols={['id', 'nome']} />
      <DataPanel title="Cenários" data={cenarios} cols={['id', 'nome']} />
      <Card>
        <CardHeader>
          <CardTitle>Upload CSV</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div>
              <Label htmlFor="file-upload">Select CSV File</Label>
              <Input
                id="file-upload"
                type="file"
                accept=".csv"
                ref={fileInputRef}
                onChange={handleUpload}
                className="hidden"
              />
              <Button
                onClick={handleButtonClick}
                className="w-full flex items-center justify-center gap-2"
              >
                <Upload size={16} />
                Upload CSV
              </Button>
            </div>
            {selectedFile && <p>Selected: {selectedFile.name}</p>}
            {csvData.length > 0 && (
              <div>
                <h4>Preview (First 5 Rows):</h4>
                <Table>
                  <TableHeader>
                    <TableRow>
                      {Object.keys(csvData[0]).map((key) => (
                        <TableHead key={key}>{key}</TableHead>
                      ))}
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {csvData.map((row, index) => (
                      <TableRow key={index}>
                        {Object.values(row).map((value, i) => (
                          <TableCell key={i}>{value}</TableCell>
                        ))}
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default Configuracoes
