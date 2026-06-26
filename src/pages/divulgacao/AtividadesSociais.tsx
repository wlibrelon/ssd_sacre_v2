import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { MapPin, Calendar, Users, Building, LinkIcon } from 'lucide-react'

type FotoAtividade = {
  url: string
  descricao: string
}

type AtividadeSocial = {
  id_ativ_soc: number
  titulo: string
  descricao: string
  data_atividade: string
  data_pub: string
  link: string
  local: string
  entidade: string
  publico_alvo: string
  fotos: FotoAtividade[]
  ativar: boolean
}

export default function AtividadesSociais() {
  const [atividades, setAtividades] = useState<AtividadeSocial[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    const fetchAtividades = async () => {
      const { data, error } = await supabase
        .from('atividades_sociais' as any)
        .select('*')
        .eq('ativar', true)
        .order('data_atividade', { ascending: false })

      if (!error && data) {
        setAtividades(data)
      }
      setLoading(false)
    }

    fetchAtividades()
  }, [])

  return (
    <div className="container max-w-6xl py-8 space-y-8 animate-fade-in mx-auto px-4">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-primary">Atividades Sociais</h1>
        <p className="text-muted-foreground mt-2 text-lg">
          Acompanhe as ações de engajamento e divulgação social do projeto.
        </p>
      </div>

      {loading ? (
        <div className="space-y-6">
          {[1, 2].map((i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="h-24 bg-muted/50 rounded-t-lg" />
              <CardContent className="h-48" />
            </Card>
          ))}
        </div>
      ) : atividades.length === 0 ? (
        <p className="text-muted-foreground text-center py-12 text-lg">
          Nenhuma atividade social publicada no momento.
        </p>
      ) : (
        <div className="space-y-8">
          {atividades.map((atividade) => (
            <Card
              key={atividade.id_ativ_soc}
              className="overflow-hidden border-border/50 shadow-md"
            >
              <CardHeader className="bg-primary/5 pb-6">
                <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                  <div>
                    <CardTitle className="text-2xl font-bold text-primary">
                      {atividade.titulo}
                    </CardTitle>
                    {atividade.data_pub && (
                      <CardDescription className="mt-1">
                        Publicado em{' '}
                        {new Date(atividade.data_pub + 'T00:00:00').toLocaleDateString()}
                      </CardDescription>
                    )}
                  </div>
                  {atividade.data_atividade && (
                    <Badge
                      variant="secondary"
                      className="flex items-center gap-1 text-sm py-1 whitespace-nowrap"
                    >
                      <Calendar className="w-4 h-4" />
                      {new Date(atividade.data_atividade + 'T00:00:00').toLocaleDateString()}
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="pt-6 space-y-6">
                <div className="prose prose-sm max-w-none text-muted-foreground">
                  <p className="whitespace-pre-wrap text-base">{atividade.descricao}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 bg-muted/20 p-4 rounded-lg">
                  {atividade.local && (
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <MapPin className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-medium">Local:</span>{' '}
                      <span className="truncate">{atividade.local}</span>
                    </div>
                  )}
                  {atividade.entidade && (
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Building className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-medium">Entidade:</span>{' '}
                      <span className="truncate">{atividade.entidade}</span>
                    </div>
                  )}
                  {atividade.publico_alvo && (
                    <div className="flex items-center gap-2 text-sm text-foreground">
                      <Users className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-medium">Público Alvo:</span>{' '}
                      <span className="truncate">{atividade.publico_alvo}</span>
                    </div>
                  )}
                  {atividade.link && (
                    <div className="flex items-center gap-2 text-sm text-foreground overflow-hidden">
                      <LinkIcon className="w-4 h-4 text-primary shrink-0" />
                      <span className="font-medium">Link:</span>
                      <a
                        href={atividade.link}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-blue-600 hover:underline truncate"
                      >
                        {atividade.link}
                      </a>
                    </div>
                  )}
                </div>

                {atividade.fotos && atividade.fotos.length > 0 && (
                  <div className="pt-4 border-t">
                    <h4 className="font-semibold mb-4 text-primary">Galeria de Fotos</h4>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                      {atividade.fotos.map((foto, idx) => (
                        <div key={idx} className="flex flex-col group">
                          <div className="overflow-hidden rounded-lg aspect-[4/3] bg-muted relative">
                            <img
                              src={foto.url}
                              alt={`Foto ${idx + 1}`}
                              className="object-cover w-full h-full transition-transform duration-500 group-hover:scale-105"
                            />
                          </div>
                          {foto.descricao && (
                            <p className="mt-2 text-sm text-muted-foreground text-center italic">
                              {foto.descricao}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}
