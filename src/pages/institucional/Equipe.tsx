import { useEffect, useState } from 'react'
import { supabase } from '@/lib/supabase/client'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { ExternalLink } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'

type Colaborador = {
  id_colaborador: number
  nome: string
  formacao: string
  link_internet: string
  foto: string
  status: string
  id_grupo: number
  grupo_colaboradores: {
    id_grupo: number
    descricao: string
  }
}

type GroupedData = {
  id_grupo: number
  descricao: string
  membros: Colaborador[]
}

export default function Equipe() {
  const [grupos, setGrupos] = useState<GroupedData[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    async function fetchData() {
      setLoading(true)
      const { data, error } = await supabase
        .from('colaboradores')
        .select('*, grupo_colaboradores(*)')
        .eq('status', 'Ativo')

      if (error || !data) {
        setLoading(false)
        return
      }

      const grouped = data.reduce((acc: any, curr: any) => {
        const id = curr.id_grupo || 999
        const desc = curr.grupo_colaboradores?.descricao || 'Outros'
        if (!acc[id]) {
          acc[id] = { id_grupo: id, descricao: desc, membros: [] }
        }
        acc[id].membros.push(curr)
        return acc
      }, {})

      const sortedGroups = Object.values(grouped).sort(
        (a: any, b: any) => a.id_grupo - b.id_grupo,
      ) as GroupedData[]

      if (sortedGroups.length > 0) {
        sortedGroups[0].membros.sort((a, b) => a.id_colaborador - b.id_colaborador)
        for (let i = 1; i < sortedGroups.length; i++) {
          sortedGroups[i].membros.sort((a, b) => a.nome.localeCompare(b.nome))
        }
      }

      setGrupos(sortedGroups)
      setLoading(false)
    }

    fetchData()
  }, [])

  const getAvatarUrl = (fotoPath: string, id: number) => {
    if (fotoPath) {
      return supabase.storage.from('fotos_colaboradores').getPublicUrl(fotoPath).data.publicUrl
    }
    return `https://img.usecurling.com/ppl/medium?seed=${id}`
  }

  return (
    <div className="max-w-7xl mx-auto space-y-12 animate-fade-in py-8 px-4 sm:px-6">
      <div className="max-w-3xl">
        <h1 className="text-4xl font-bold text-gray-900 mb-4 tracking-tight">Equipe do Projeto</h1>
        <div className="w-20 h-1.5 bg-secondary mb-6 rounded-full" />
        <p className="text-lg text-muted-foreground leading-relaxed">
          Conheça os pesquisadores e profissionais envolvidos no desenvolvimento do SACRE,
          trabalhando juntos para desenvolver soluções híbridas hidroeconômicas sustentáveis.
        </p>
      </div>

      {loading ? (
        <div className="space-y-10">
          {[1, 2].map((i) => (
            <div key={i} className="space-y-6">
              <Skeleton className="h-8 w-64" />
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {[1, 2, 3, 4].map((j) => (
                  <Skeleton key={j} className="h-64 w-full rounded-xl" />
                ))}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="space-y-16">
          {grupos.map((grupo) => (
            <section key={grupo.id_grupo} className="space-y-6">
              <h2 className="text-2xl font-semibold text-primary border-b pb-2 inline-block border-secondary/30">
                {grupo.descricao}
              </h2>
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
                {grupo.membros.map((member) => (
                  <Card
                    key={member.id_colaborador}
                    className="text-center hover:shadow-xl hover:-translate-y-1 transition-all duration-300 border-border/50 overflow-hidden bg-gradient-to-b from-white to-gray-50/50"
                  >
                    <CardHeader className="pb-3 pt-6">
                      <Avatar className="w-28 h-28 mx-auto mb-4 border-4 border-white shadow-sm ring-1 ring-slate-100">
                        <AvatarImage
                          src={getAvatarUrl(member.foto, member.id_colaborador)}
                          alt={member.nome}
                          className="object-cover"
                        />
                        <AvatarFallback className="text-xl bg-primary/5 text-primary">
                          {member.nome.substring(0, 2).toUpperCase()}
                        </AvatarFallback>
                      </Avatar>
                      <CardTitle className="text-lg leading-tight line-clamp-2">
                        {member.nome}
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3 pb-6">
                      <p className="text-sm font-medium text-secondary line-clamp-2 min-h-[40px]">
                        {member.formacao}
                      </p>
                      {member.link_internet && (
                        <a
                          href={member.link_internet}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center justify-center gap-1.5 text-xs font-semibold text-primary/80 hover:text-primary transition-colors bg-primary/5 hover:bg-primary/10 px-3 py-1.5 rounded-full"
                        >
                          Lattes <ExternalLink className="w-3 h-3" />
                        </a>
                      )}
                    </CardContent>
                  </Card>
                ))}
              </div>
            </section>
          ))}
          {grupos.length === 0 && (
            <div className="text-center py-20 bg-gray-50 rounded-2xl border border-dashed">
              <p className="text-muted-foreground text-lg">Nenhum membro da equipe encontrado.</p>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
