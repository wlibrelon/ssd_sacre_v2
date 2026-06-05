import { useState, useEffect, useRef } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Button } from '@/components/ui/button'
import { Folder, File, Trash2, Upload, ChevronLeft } from 'lucide-react'
import { toast } from 'sonner'

export function FileBrowser() {
  const [path, setPath] = useState<string[]>([])
  const [items, setItems] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const currentPathStr = path.join('/')

  const loadItems = async () => {
    setLoading(true)
    const { data, error } = await supabase.storage
      .from('dados_brutos')
      .list(currentPathStr, { limit: 200 })
    if (error) {
      toast.error('Erro ao listar arquivos')
    } else {
      setItems(data || [])
    }
    setLoading(false)
  }

  useEffect(() => {
    loadItems()
  }, [path])

  const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!e.target.files || e.target.files.length === 0) return
    const file = e.target.files[0]
    const filePath = currentPathStr ? `${currentPathStr}/${file.name}` : file.name

    setLoading(true)
    const { error } = await supabase.storage
      .from('dados_brutos')
      .upload(filePath, file, { upsert: true })
    if (error) toast.error('Erro ao fazer upload: ' + error.message)
    else {
      toast.success('Arquivo enviado com sucesso')
      loadItems()
    }
    setLoading(false)
    if (fileInputRef.current) fileInputRef.current.value = ''
  }

  const handleDelete = async (name: string) => {
    if (!confirm('Deseja excluir este arquivo?')) return
    const filePath = currentPathStr ? `${currentPathStr}/${name}` : name
    const { error } = await supabase.storage.from('dados_brutos').remove([filePath])
    if (error) toast.error('Erro ao excluir')
    else {
      toast.success('Excluído com sucesso')
      loadItems()
    }
  }

  const goUp = () => setPath((p) => p.slice(0, -1))
  const goInto = (folder: string) => setPath((p) => [...p, folder])

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between bg-slate-50 p-2 rounded border">
        <div className="flex items-center space-x-2">
          <Button variant="ghost" size="sm" onClick={goUp} disabled={path.length === 0}>
            <ChevronLeft className="w-4 h-4 mr-1" /> Voltar
          </Button>
          <span className="text-sm font-medium text-muted-foreground">
            dados_brutos / {path.join(' / ')}
          </span>
        </div>
        <div className="flex items-center">
          <input type="file" ref={fileInputRef} className="hidden" onChange={handleUpload} />
          <Button size="sm" onClick={() => fileInputRef.current?.click()} disabled={loading}>
            <Upload className="w-4 h-4 mr-2" /> Upload
          </Button>
        </div>
      </div>

      <div className="border rounded-md overflow-hidden">
        {loading ? (
          <div className="p-8 text-center text-sm text-muted-foreground">Carregando...</div>
        ) : items.length === 0 ? (
          <div className="p-8 text-center text-sm text-muted-foreground">
            Nenhum arquivo encontrado
          </div>
        ) : (
          <div className="divide-y max-h-96 overflow-y-auto">
            {items.map((item) => {
              const isFolder = !item.id
              return (
                <div
                  key={item.name}
                  className="flex items-center justify-between p-3 hover:bg-slate-50"
                >
                  <div
                    className={`flex items-center space-x-3 ${isFolder ? 'cursor-pointer hover:text-primary' : ''}`}
                    onClick={() => isFolder && goInto(item.name)}
                  >
                    {isFolder ? (
                      <Folder className="w-5 h-5 text-blue-500" />
                    ) : (
                      <File className="w-5 h-5 text-slate-500" />
                    )}
                    <span className="text-sm font-medium">{item.name}</span>
                  </div>
                  {!isFolder && (
                    <Button
                      variant="ghost"
                      size="icon"
                      className="text-destructive hover:bg-destructive/10"
                      onClick={() => handleDelete(item.name)}
                    >
                      <Trash2 className="w-4 h-4" />
                    </Button>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}
