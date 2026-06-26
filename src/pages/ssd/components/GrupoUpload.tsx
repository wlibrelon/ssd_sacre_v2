import { useState, useEffect } from 'react'
import { listFiles, uploadFile, deleteFile } from '@/services/storage'
import { Button } from '@/components/ui/button'
import { Trash2, Upload, FileText } from 'lucide-react'
import { useToast } from '@/hooks/use-toast'
import { NativeSelect } from './NativeSelect'

export function GrupoUpload() {
  const [folder, setFolder] = useState('modelos')
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const { toast } = useToast()

  const folders = [
    'modelos',
    'perdas',
    'demandas',
    'capex_estrategias',
    'capex_perdas',
    'opex',
    'indicadores',
  ]

  const load = async () => {
    setLoading(true)
    const data = await listFiles('dados_brutos', folder)
    setFiles(data.filter((f: any) => f.name.endsWith('.csv')))
    setLoading(false)
  }

  useEffect(() => {
    load()
  }, [folder])

  const handleUpload = async (e: any) => {
    const file = e.target.files[0]
    if (!file) return
    if (!file.name.endsWith('.csv')) {
      return toast({ title: 'Apenas arquivos .csv são permitidos.', variant: 'destructive' })
    }

    // Clear input so same file can be selected again
    e.target.value = ''

    try {
      toast({ title: 'Enviando arquivo...', description: 'Aguarde um momento.' })
      await uploadFile('dados_brutos', folder, file)
      toast({ title: 'Sucesso', description: 'Arquivo enviado com sucesso!' })
      load()
    } catch (err: any) {
      toast({ title: 'Erro ao enviar', description: err.message, variant: 'destructive' })
    }
  }

  const handleDelete = async (fileName: string) => {
    if (!window.confirm(`Tem certeza que deseja remover o arquivo ${fileName}?`)) return
    try {
      await deleteFile('dados_brutos', `${folder}/${fileName}`)
      toast({ title: 'Arquivo removido' })
      load()
    } catch (err: any) {
      toast({ title: 'Erro ao remover', description: err.message, variant: 'destructive' })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4 items-end bg-white p-4 border rounded shadow-sm">
        <div className="flex-1 w-full">
          <label className="text-sm font-semibold mb-1 block">Selecione a Pasta de Destino</label>
          <NativeSelect
            options={folders.map((f) => ({ value: f, label: f }))}
            value={folder}
            onChange={setFolder}
          />
        </div>
        <div className="relative w-full sm:w-auto">
          <input
            type="file"
            accept=".csv"
            onChange={handleUpload}
            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
            title="Escolher arquivo CSV"
          />
          <Button className="w-full">
            <Upload className="w-4 h-4 mr-2" /> Upload CSV
          </Button>
        </div>
      </div>

      <div className="border rounded-md bg-white overflow-hidden shadow-sm">
        <table className="w-full text-sm text-left">
          <thead className="bg-muted">
            <tr>
              <th className="px-4 py-3 font-semibold">Arquivos disponíveis em "{folder}"</th>
              <th className="px-4 py-3 w-24 font-semibold text-center">Ações</th>
            </tr>
          </thead>
          <tbody>
            {loading ? (
              <tr>
                <td colSpan={2} className="px-4 py-8 text-center text-muted-foreground">
                  Carregando...
                </td>
              </tr>
            ) : files.length > 0 ? (
              files.map((f: any) => (
                <tr key={f.name} className="border-t hover:bg-muted/30">
                  <td className="px-4 py-2 font-medium">
                    <div className="flex items-center gap-2">
                      <FileText className="w-4 h-4 text-primary" />
                      {f.name}
                    </div>
                  </td>
                  <td className="px-4 py-2 text-center">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDelete(f.name)}
                      title="Excluir"
                    >
                      <Trash2 className="w-4 h-4 text-red-500" />
                    </Button>
                  </td>
                </tr>
              ))
            ) : (
              <tr>
                <td
                  colSpan={2}
                  className="px-4 py-8 text-center text-muted-foreground border-t border-dashed"
                >
                  Nenhum arquivo CSV encontrado nesta pasta.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
