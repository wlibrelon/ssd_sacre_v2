import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { listFiles } from '@/services/storage'
import { Button } from '@/components/ui/button'
import { FileText } from 'lucide-react'

interface FilePickerModalProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  bucket: string
  folder: string
  onSelect: (fileName: string) => void
}

export function FilePickerModal({
  open,
  onOpenChange,
  bucket,
  folder,
  onSelect,
}: FilePickerModalProps) {
  const [files, setFiles] = useState<any[]>([])
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (open) {
      setLoading(true)
      listFiles(bucket, folder).then((data) => {
        setFiles(data.filter((f: any) => f.name.endsWith('.csv')))
        setLoading(false)
      })
    }
  }, [open, bucket, folder])

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>Selecionar arquivo (.csv)</DialogTitle>
          <p className="text-sm text-muted-foreground">Pasta: {folder}</p>
        </DialogHeader>
        <div className="space-y-2 max-h-[400px] overflow-y-auto pr-2 mt-2">
          {loading ? (
            <p className="text-sm text-center py-4 text-muted-foreground">Carregando arquivos...</p>
          ) : files.length > 0 ? (
            files.map((f) => (
              <div
                key={f.name}
                className="flex justify-between items-center p-2 border rounded-md hover:bg-muted/50 transition-colors"
              >
                <div className="flex items-center gap-2 overflow-hidden">
                  <FileText className="w-4 h-4 text-primary shrink-0" />
                  <span className="text-sm truncate font-medium">{f.name}</span>
                </div>
                <Button size="sm" variant="secondary" onClick={() => onSelect(f.name)}>
                  Selecionar
                </Button>
              </div>
            ))
          ) : (
            <p className="text-sm text-muted-foreground text-center py-6 border border-dashed rounded-md">
              Nenhum arquivo CSV encontrado nesta pasta.
            </p>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
