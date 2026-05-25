import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, ExternalLink } from 'lucide-react'

export default function Documentos() {
  const [documents, setDocuments] = useState<any[]>([])

  useEffect(() => {
    supabase
      .from('documentos_publicos')
      .select('*')
      .order('criado_em', { ascending: false })
      .then(({ data }) => {
        if (data) setDocuments(data)
      })
  }, [])

  return (
    <div className="space-y-8 animate-fade-in max-w-5xl mx-auto p-4">
      <div>
        <h1 className="text-3xl font-bold text-primary">Documentos Públicos</h1>
        <div className="w-16 h-1.5 bg-secondary mt-4 rounded-full" />
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {documents.map((doc) => (
          <Card key={doc.id} className="hover:shadow-md transition-shadow">
            <CardHeader className="pb-2">
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-secondary" />
                <span className="truncate">{doc.nome}</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-sm text-muted-foreground mb-4">
                Publicado em: {new Date(doc.criado_em).toLocaleDateString('pt-BR')}
              </p>
              <div className="flex gap-2">
                <Button variant="outline" size="sm" asChild>
                  <a href={doc.url_arquivo} target="_blank" rel="noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" /> Visualizar
                  </a>
                </Button>
                <Button variant="secondary" size="sm" asChild>
                  <a href={doc.url_arquivo} download>
                    <Download className="h-4 w-4 mr-2" /> Download
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
        {documents.length === 0 && (
          <p className="text-muted-foreground col-span-2">
            Nenhum documento disponível no momento.
          </p>
        )}
      </div>
    </div>
  )
}
