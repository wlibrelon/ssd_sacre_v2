import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent } from '@/components/ui/card'
import { PlayCircle } from 'lucide-react'

export default function Midia() {
  const [midias, setMidias] = useState<any[]>([])

  useEffect(() => {
    const fetchMidias = async () => {
      const { data } = await supabase
        .from('midia')
        .select('*')
        .order('id_midia', { ascending: false })
      if (data) setMidias(data)
    }
    fetchMidias()
  }, [])

  return (
    <div className="space-y-8 animate-fade-in">
      <div>
        <h1 className="text-3xl font-bold text-primary">Mídia e Notícias</h1>
        <p className="text-muted-foreground mt-2">
          Acompanhe as reportagens e divulgações do SACRE para a comunidade.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {midias.map((m) => {
          const isVideo = m.tipo === 'Vídeo'
          const imgUrl = m.arq_imagem
            ? supabase.storage.from('imagens').getPublicUrl(m.arq_imagem).data.publicUrl
            : `https://img.usecurling.com/p/400/300?q=water%20news&seed=${m.id_midia}`

          return (
            <Card
              key={m.id_midia}
              className="overflow-hidden hover:shadow-lg transition-shadow group relative"
            >
              <a
                href={m.link || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="block h-full"
              >
                <div className="relative h-48 bg-slate-200 overflow-hidden">
                  <img
                    src={imgUrl}
                    alt={m.titulo}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                  {isVideo && (
                    <div className="absolute inset-0 bg-black/30 flex items-center justify-center">
                      <PlayCircle className="h-12 w-12 text-white opacity-80" />
                    </div>
                  )}
                </div>
                <CardContent className="p-5">
                  <span className="text-xs font-semibold text-secondary uppercase tracking-wider">
                    {m.tipo}
                  </span>
                  <h3 className="text-lg font-bold mt-2 leading-tight text-primary group-hover:text-secondary transition-colors">
                    {m.titulo}
                  </h3>
                  {m.descricao && (
                    <p className="text-sm text-muted-foreground mt-2 line-clamp-3">{m.descricao}</p>
                  )}
                </CardContent>
              </a>
            </Card>
          )
        })}
      </div>

      {midias.length === 0 && (
        <p className="text-muted-foreground text-center py-8">
          Nenhuma mídia cadastrada no momento.
        </p>
      )}
    </div>
  )
}
